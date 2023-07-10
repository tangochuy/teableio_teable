import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type {
  ISetViewFilterOpContext,
  ISetViewNameOpContext,
  ISnapshotBase,
  IViewSnapshot,
  ViewType,
} from '@teable-group/core';
import { generateViewId, OpName } from '@teable-group/core';
import type { Prisma } from '@teable-group/db-main-prisma';
import { PrismaService } from '../../prisma.service';
import type { IAdapterService } from '../../share-db/interface';
import { ROW_ORDER_FIELD_PREFIX } from './constant';
import type { CreateViewRo } from './model/create-view.ro';
import { createViewInstanceByRaw } from './model/factory';
import type { ViewVo } from './model/view.vo';

@Injectable()
export class ViewService implements IAdapterService {
  constructor(private readonly prisma: PrismaService) {}

  getRowIndexFieldName(viewId: string) {
    return `${ROW_ORDER_FIELD_PREFIX}_${viewId}`;
  }

  async createViewTransaction(
    prisma: Prisma.TransactionClient,
    tableId: string,
    createViewRo: CreateViewRo & { id?: string }
  ) {
    const { id, name, description, type, options, sort, filter, group } = createViewRo;
    let order = createViewRo.order;
    const viewId = id || generateViewId();

    if (!order) {
      const viewAggregate = await prisma.view.aggregate({
        where: { tableId, deletedTime: null },
        _max: { order: true },
      });
      order = (viewAggregate._max.order || 0) + 1;
    }

    const data: Prisma.ViewCreateInput = {
      id: viewId,
      table: {
        connect: {
          id: tableId,
        },
      },
      name,
      description,
      type,
      options: options ? JSON.stringify(options) : undefined,
      sort: sort ? JSON.stringify(sort) : undefined,
      filter: filter ? JSON.stringify(filter) : undefined,
      group: group ? JSON.stringify(group) : undefined,
      version: 1,
      order,
      createdBy: 'admin',
      lastModifiedBy: 'admin',
    };

    const { dbTableName } = await prisma.tableMeta.findUniqueOrThrow({
      where: {
        id: tableId,
      },
      select: {
        dbTableName: true,
      },
    });

    const rowIndexFieldName = this.getRowIndexFieldName(viewId);

    // 1. create a new view in view model
    const viewData = await prisma.view.create({
      data,
    });

    // 2. add a field for maintain row order number
    await prisma.$executeRawUnsafe(`
      ALTER TABLE ${dbTableName}
      ADD ${rowIndexFieldName} REAL;
    `);

    // 3. fill initial order for every record, with auto increment integer
    await prisma.$executeRawUnsafe(`
      UPDATE ${dbTableName} SET ${rowIndexFieldName} = __row_default;
    `);

    // set strick not null and unique type for safety（sqlite cannot do that)
    // prisma.$executeRawUnsafe(`
    //   ALTER TABLE ${dbTableName}
    //   CONSTRAINT COLUMN ${rowIndexFieldName} NOT NULL UNIQUE;
    // `),

    return viewData;
  }

  async getViewById(viewId: string): Promise<ViewVo> {
    const viewRaw = await this.prisma.view.findUniqueOrThrow({
      where: { id: viewId },
    });

    return createViewInstanceByRaw(viewRaw) as ViewVo;
  }

  async getViews(tableId: string): Promise<ViewVo[]> {
    const viewRaws = await this.prisma.view.findMany({
      where: { tableId, deletedTime: null },
    });

    return viewRaws.map((viewRaw) => createViewInstanceByRaw(viewRaw) as ViewVo);
  }

  async create(prisma: Prisma.TransactionClient, tableId: string, snapshot: IViewSnapshot) {
    const { view } = snapshot;
    await this.createViewTransaction(prisma, tableId, view as CreateViewRo);
  }

  async del(prisma: Prisma.TransactionClient, _tableId: string, viewId: string) {
    await prisma.view.update({
      where: { id: viewId },
      data: { deletedTime: new Date() },
    });
  }

  async update(
    prisma: Prisma.TransactionClient,
    version: number,
    _tableId: string,
    viewId: string,
    opContexts: (ISetViewNameOpContext | ISetViewFilterOpContext)[]
  ) {
    for (const opContext of opContexts) {
      const updateData: Prisma.ViewUpdateInput = { version };
      switch (opContext.name) {
        case OpName.SetViewName:
          updateData['name'] = opContext.newName;
          break;
        case OpName.SetViewFilter:
          updateData['filter'] = JSON.stringify(opContext.newFilter);
          break;
        default:
          throw new InternalServerErrorException(`Unknown context ${opContext} for view update`);
      }

      await prisma.view.update({
        where: { id: viewId },
        data: updateData,
      });
    }
  }

  async getSnapshotBulk(
    prisma: Prisma.TransactionClient,
    tableId: string,
    ids: string[]
  ): Promise<ISnapshotBase<IViewSnapshot>[]> {
    const views = await prisma.view.findMany({
      where: { tableId, id: { in: ids } },
    });

    return views
      .map((view) => {
        return {
          id: view.id,
          v: view.version,
          type: 'json0',
          data: {
            view: {
              ...view,
              type: view.type as ViewType,
              description: view.description || undefined,
              filter: JSON.parse(view.filter as string),
              sort: JSON.parse(view.sort as string),
              group: JSON.parse(view.group as string),
              options: JSON.parse(view.options as string),
            },
            order: view.order,
          },
        };
      })
      .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  }

  async getDocIdsByQuery(prisma: Prisma.TransactionClient, tableId: string, _query: unknown) {
    const views = await prisma.view.findMany({
      where: { tableId, deletedTime: null },
      select: { id: true },
      orderBy: { order: 'asc' },
    });

    return { ids: views.map((v) => v.id) };
  }
}
