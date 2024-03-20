import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type {
  IFieldVo,
  IOtOperation,
  IViewRo,
  IViewVo,
  IColumnMetaRo,
  IViewPropertyKeys,
  IViewOptions,
  IGridColumnMeta,
} from '@teable/core';
import {
  ViewType,
  IManualSortRo,
  ViewOpBuilder,
  generateShareId,
  VIEW_JSON_KEYS,
  validateOptionsType,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import type { IUpdateOrderRo, IUpdateRecordOrdersRo } from '@teable/openapi';
import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';
import { Timing } from '../../../utils/timing';
import { updateMultipleOrders, updateOrder } from '../../../utils/update-order';
import { FieldService } from '../../field/field.service';
import { RecordService } from '../../record/record.service';
import { ViewService } from '../view.service';

@Injectable()
export class ViewOpenApiService {
  private logger = new Logger(ViewOpenApiService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly recordService: RecordService,
    private readonly viewService: ViewService,
    private readonly fieldService: FieldService,
    @InjectModel('CUSTOM_KNEX') private readonly knex: Knex
  ) {}

  async createView(tableId: string, viewRo: IViewRo) {
    return await this.prismaService.$tx(async () => {
      return await this.createViewInner(tableId, viewRo);
    });
  }

  async deleteView(tableId: string, viewId: string) {
    return await this.prismaService.$tx(async () => {
      return await this.deleteViewInner(tableId, viewId);
    });
  }

  private async createViewInner(tableId: string, viewRo: IViewRo): Promise<IViewVo> {
    return await this.viewService.createView(tableId, viewRo);
  }

  private async deleteViewInner(tableId: string, viewId: string) {
    await this.viewService.deleteView(tableId, viewId);
  }

  private updateRecordOrderSql(orderRawSql: string, dbTableName: string, indexField: string) {
    return this.knex
      .raw(
        `
        UPDATE :dbTableName:
        SET :indexField: = temp_order.new_order
        FROM (
          SELECT __id, ROW_NUMBER() OVER (ORDER BY ${orderRawSql}) AS new_order FROM :dbTableName:
        ) AS temp_order
        WHERE :dbTableName:.__id = temp_order.__id AND :dbTableName:.:indexField: != temp_order.new_order;
      `,
        {
          dbTableName,
          indexField,
        }
      )
      .toQuery();
  }

  @Timing()
  async manualSort(tableId: string, viewId: string, viewOrderRo: IManualSortRo) {
    const { sortObjs } = viewOrderRo;
    const dbTableName = await this.recordService.getDbTableName(tableId);
    const fields = await this.fieldService.getFieldsByQuery(tableId, { viewId });
    const indexField = await this.viewService.getOrCreateViewIndexField(dbTableName, viewId);

    const fieldMap = fields.reduce(
      (map, field) => {
        map[field.id] = field;
        return map;
      },
      {} as Record<string, IFieldVo>
    );

    let orderRawSql = sortObjs
      .map((sort) => {
        const { fieldId, order } = sort;

        const field = fieldMap[fieldId];
        if (!field) {
          return;
        }

        const column =
          field.dbFieldType === 'JSON'
            ? this.knex.raw(`CAST(?? as text)`, [field.dbFieldName]).toQuery()
            : this.knex.ref(field.dbFieldName).toQuery();

        const nulls = order.toUpperCase() === 'ASC' ? 'FIRST' : 'LAST';

        return `${column} ${order} NULLS ${nulls}`;
      })
      .join();

    // ensure order stable
    orderRawSql += this.knex.raw(`, ?? ASC`, ['__auto_number']).toQuery();

    // build ops
    const newSort = {
      sortObjs: sortObjs,
      manualSort: true,
    };

    await this.prismaService.$tx(async (prisma) => {
      await prisma.$executeRawUnsafe(
        this.updateRecordOrderSql(orderRawSql, dbTableName, indexField)
      );
      await this.viewService.updateViewSort(tableId, viewId, newSort);
    });
  }

  async updateViewColumnMeta(tableId: string, viewId: string, columnMetaRo: IColumnMetaRo) {
    const view = await this.prismaService.view
      .findFirstOrThrow({
        where: { tableId, id: viewId },
        select: {
          columnMeta: true,
          version: true,
          id: true,
          type: true,
        },
      })
      .catch(() => {
        throw new BadRequestException('view found column meta error');
      });

    // validate field legal
    const fields = await this.prismaService.field.findMany({
      where: { tableId, deletedTime: null },
      select: {
        id: true,
        isPrimary: true,
      },
    });
    const primaryFields = fields.filter((field) => field.isPrimary).map((field) => field.id);

    const isHiddenPrimaryField = columnMetaRo.some(
      (f) => primaryFields.includes(f.fieldId) && (f.columnMeta as IGridColumnMeta).hidden
    );
    const fieldIds = columnMetaRo.map(({ fieldId }) => fieldId);

    if (!fieldIds.every((id) => fields.map(({ id }) => id).includes(id))) {
      throw new BadRequestException('field is not found in table');
    }

    const allowHiddenPrimaryType = [ViewType.Calendar, ViewType.Form];
    /**
     * validate whether hidden primary field
     * only form view or list view(todo) can hidden primary field
     */
    if (isHiddenPrimaryField && !allowHiddenPrimaryType.includes(view.type as ViewType)) {
      throw new ForbiddenException('primary field can not be hidden');
    }

    const curColumnMeta = JSON.parse(view.columnMeta);
    const ops: IOtOperation[] = [];

    columnMetaRo.forEach(({ fieldId, columnMeta }) => {
      const obj = {
        fieldId,
        newColumnMeta: { ...curColumnMeta[fieldId], ...columnMeta },
        oldColumnMeta: curColumnMeta[fieldId] ? curColumnMeta[fieldId] : undefined,
      };
      ops.push(ViewOpBuilder.editor.updateViewColumnMeta.build(obj));
    });
    await this.prismaService.$tx(async () => {
      await this.viewService.updateViewByOps(tableId, viewId, ops);
    });
  }

  async setViewProperty(
    tableId: string,
    viewId: string,
    key: IViewPropertyKeys,
    newValue: unknown
  ) {
    const curView = await this.prismaService.view
      .findFirstOrThrow({
        select: { [key]: true },
        where: { tableId, id: viewId, deletedTime: null },
      })
      .catch(() => {
        throw new BadRequestException('View not found');
      });
    const oldValue =
      curView[key] != null && VIEW_JSON_KEYS.includes(key)
        ? JSON.parse(curView[key])
        : curView[key];
    const ops = ViewOpBuilder.editor.setViewProperty.build({
      key,
      newValue,
      oldValue,
    });
    await this.prismaService.$tx(async () => {
      await this.viewService.updateViewByOps(tableId, viewId, [ops]);
    });
  }

  async patchViewOptions(tableId: string, viewId: string, viewOptions: IViewOptions) {
    const curView = await this.prismaService.view
      .findFirstOrThrow({
        select: { options: true, type: true },
        where: { tableId, id: viewId, deletedTime: null },
      })
      .catch(() => {
        throw new BadRequestException('View option not found');
      });
    const { options, type: viewType } = curView;

    // validate option type
    try {
      validateOptionsType(viewType as ViewType, viewOptions);
    } catch (err) {
      throw new BadRequestException(err);
    }

    const oldOptions = options ? JSON.parse(options) : options;
    const ops = ViewOpBuilder.editor.setViewProperty.build({
      key: 'options',
      newValue: {
        ...oldOptions,
        ...viewOptions,
      },
      oldValue: oldOptions,
    });
    await this.prismaService.$tx(async () => {
      await this.viewService.updateViewByOps(tableId, viewId, [ops]);
    });
  }

  /**
   * shuffle view order
   */
  async shuffle(tableId: string) {
    const views = await this.prismaService.view.findMany({
      where: { tableId, deletedTime: null },
      select: { id: true, order: true },
      orderBy: { order: 'asc' },
    });

    this.logger.log(`lucky view shuffle! ${tableId}`, 'shuffle');

    await this.prismaService.$tx(async () => {
      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        await this.viewService.updateViewByOps(tableId, view.id, [
          ViewOpBuilder.editor.setViewProperty.build({
            key: 'order',
            newValue: i,
            oldValue: view.order,
          }),
        ]);
      }
    });
  }

  async updateViewOrder(tableId: string, viewId: string, orderRo: IUpdateOrderRo) {
    const { anchorId, position } = orderRo;

    const view = await this.prismaService.view
      .findFirstOrThrow({
        select: { order: true, id: true },
        where: { tableId, id: viewId, deletedTime: null },
      })
      .catch(() => {
        throw new NotFoundException(`View ${viewId} not found in the table`);
      });

    const anchorView = await this.prismaService.view
      .findFirstOrThrow({
        select: { order: true, id: true },
        where: { tableId, id: anchorId, deletedTime: null },
      })
      .catch(() => {
        throw new NotFoundException(`Anchor ${anchorId} not found in the table`);
      });

    await updateOrder({
      parentId: tableId,
      position,
      item: view,
      anchorItem: anchorView,
      getNextItem: async (whereOrder, align) => {
        return this.prismaService.view.findFirst({
          select: { order: true, id: true },
          where: {
            tableId,
            deletedTime: null,
            order: whereOrder,
          },
          orderBy: { order: align },
        });
      },
      update: async (
        parentId: string,
        id: string,
        data: { newOrder: number; oldOrder: number }
      ) => {
        const ops = ViewOpBuilder.editor.setViewProperty.build({
          key: 'order',
          newValue: data.newOrder,
          oldValue: data.oldOrder,
        });

        await this.prismaService.$tx(async () => {
          await this.viewService.updateViewByOps(parentId, id, [ops]);
        });
      },
      shuffle: this.shuffle.bind(this),
    });
  }

  /**
   * shuffle record order
   */
  async shuffleRecords(dbTableName: string, indexField: string) {
    const recordCount = await this.recordService.getAllRecordCount(dbTableName);
    if (recordCount > 100_000) {
      throw new BadRequestException('Not enough gap to move the row here');
    }

    const sql = this.updateRecordOrderSql(
      this.knex.raw(`?? ASC`, [indexField]).toQuery(),
      dbTableName,
      indexField
    );

    await this.prismaService.$executeRawUnsafe(sql);
  }

  async updateRecordOrdersInner(props: {
    tableId: string;
    dbTableName: string;
    itemLength: number;
    indexField: string;
    orderRo: {
      anchorId: string;
      position: 'before' | 'after';
    };
    update: (indexes: number[]) => Promise<void>;
  }) {
    const { tableId, itemLength, dbTableName, indexField, orderRo, update } = props;
    const { anchorId, position } = orderRo;

    const anchorRecordSql = this.knex(dbTableName)
      .select({
        id: '__id',
        order: indexField,
      })
      .where('__id', anchorId)
      .toQuery();

    const anchorRecord = await this.prismaService
      .txClient()
      .$queryRawUnsafe<{ id: string; order: number }[]>(anchorRecordSql)
      .then((res) => {
        return res[0];
      });

    if (!anchorRecord) {
      throw new NotFoundException(`Anchor ${anchorId} not found in the table`);
    }

    await updateMultipleOrders({
      parentId: tableId,
      position,
      itemLength,
      anchorItem: anchorRecord,
      getNextItem: async (whereOrder, align) => {
        const nextRecordSql = this.knex(dbTableName)
          .select({
            id: '__id',
            order: indexField,
          })
          .where(
            indexField,
            whereOrder.lt != null ? '<' : '>',
            (whereOrder.lt != null ? whereOrder.lt : whereOrder.gt) as number
          )
          .orderBy(indexField, align)
          .limit(1)
          .toQuery();
        return this.prismaService
          .txClient()
          .$queryRawUnsafe<{ id: string; order: number }[]>(nextRecordSql)
          .then((res) => {
            return res[0];
          });
      },
      update,
      shuffle: async () => {
        await this.shuffleRecords(dbTableName, indexField);
      },
    });
  }

  async updateRecordOrders(tableId: string, viewId: string, orderRo: IUpdateRecordOrdersRo) {
    const dbTableName = await this.recordService.getDbTableName(tableId);

    const indexField = await this.viewService.getOrCreateViewIndexField(dbTableName, viewId);
    const recordIds = orderRo.recordIds;

    await this.updateRecordOrdersInner({
      tableId,
      dbTableName,
      itemLength: recordIds.length,
      indexField,
      orderRo,
      update: async (indexes) => {
        // for notify view update only
        const ops = ViewOpBuilder.editor.setViewProperty.build({
          key: 'lastModifiedTime',
          newValue: new Date().toISOString(),
        });

        await this.prismaService.$tx(async (prisma) => {
          await this.viewService.updateViewByOps(tableId, viewId, [ops]);
          for (let i = 0; i < recordIds.length; i++) {
            const recordId = recordIds[i];
            const updateRecordSql = this.knex(dbTableName)
              .update({
                [indexField]: indexes[i],
              })
              .where('__id', recordId)
              .toQuery();
            await prisma.$executeRawUnsafe(updateRecordSql);
          }
        });
      },
    });
  }

  async refreshShareId(tableId: string, viewId: string) {
    const view = await this.prismaService.view.findUnique({
      where: { id: viewId, tableId, deletedTime: null },
      select: { shareId: true, enableShare: true },
    });
    if (!view) {
      throw new NotFoundException(`View ${viewId} does not exist`);
    }
    const { enableShare } = view;
    if (!enableShare) {
      throw new BadRequestException(`View ${viewId} has not been enabled share`);
    }
    const newShareId = generateShareId();
    const setShareIdOp = ViewOpBuilder.editor.setViewProperty.build({
      key: 'shareId',
      newValue: newShareId,
      oldValue: view.shareId || undefined,
    });
    await this.prismaService.$tx(async () => {
      await this.viewService.updateViewByOps(tableId, viewId, [setShareIdOp]);
    });
    return { shareId: newShareId };
  }

  async enableShare(tableId: string, viewId: string) {
    const view = await this.prismaService.view.findUnique({
      where: { id: viewId, tableId, deletedTime: null },
      select: { shareId: true, enableShare: true },
    });
    if (!view) {
      throw new NotFoundException(`View ${viewId} does not exist`);
    }
    const { enableShare, shareId } = view;
    if (enableShare) {
      throw new BadRequestException(`View ${viewId} has already been enabled share`);
    }
    const newShareId = generateShareId();
    const enableShareOp = ViewOpBuilder.editor.setViewProperty.build({
      key: 'enableShare',
      newValue: true,
      oldValue: enableShare || undefined,
    });
    const setShareIdOp = ViewOpBuilder.editor.setViewProperty.build({
      key: 'shareId',
      newValue: newShareId,
      oldValue: shareId || undefined,
    });
    await this.prismaService.$tx(async () => {
      await this.viewService.updateViewByOps(tableId, viewId, [enableShareOp, setShareIdOp]);
    });
    return { shareId: newShareId };
  }

  async disableShare(tableId: string, viewId: string) {
    const view = await this.prismaService.view.findUnique({
      where: { id: viewId, tableId, deletedTime: null },
      select: { shareId: true, enableShare: true, shareMeta: true },
    });
    if (!view) {
      throw new NotFoundException(`View ${viewId} does not exist`);
    }
    const { enableShare } = view;
    if (!enableShare) {
      throw new BadRequestException(`View ${viewId} has already been disable share`);
    }
    const enableShareOp = ViewOpBuilder.editor.setViewProperty.build({
      key: 'enableShare',
      newValue: false,
      oldValue: enableShare || undefined,
    });

    await this.prismaService.$tx(async () => {
      await this.viewService.updateViewByOps(tableId, viewId, [enableShareOp]);
    });
  }
}
