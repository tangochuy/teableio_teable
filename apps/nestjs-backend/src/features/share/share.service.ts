import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { IViewVo, IShareViewMeta, ILinkFieldOptions, StatisticsFunc } from '@teable/core';
import { FieldKeyType, FieldType } from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import type {
  IRowCountVo,
  IAggregationVo,
  IGroupPointsVo,
  IShareViewLinkRecordsRo,
  ShareViewFormSubmitRo,
  ShareViewGetVo,
  IShareViewRowCountRo,
  IShareViewAggregationsRo,
  IRangesRo,
  IShareViewGroupPointsRo,
} from '@teable/openapi';
import { ClsService } from 'nestjs-cls';
import type { IClsStore } from '../../types/cls';
import { AggregationService } from '../aggregation/aggregation.service';
import { FieldService } from '../field/field.service';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { RecordService } from '../record/record.service';
import { SelectionService } from '../selection/selection.service';
import { createViewVoByRaw } from '../view/model/factory';

export interface IShareViewInfo {
  shareId: string;
  tableId: string;
  view: IViewVo;
}

export interface IJwtShareInfo {
  shareId: string;
  password: string;
}

@Injectable()
export class ShareService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fieldService: FieldService,
    private readonly recordService: RecordService,
    private readonly aggregationService: AggregationService,
    private readonly recordOpenApiService: RecordOpenApiService,
    private readonly cls: ClsService<IClsStore>,
    private readonly selectionService: SelectionService
  ) {}

  async getShareView(shareId: string): Promise<ShareViewGetVo> {
    const view = await this.prismaService.view.findFirst({
      where: { shareId, enableShare: true, deletedTime: null },
    });
    if (!view) {
      throw new BadRequestException('share view not found');
    }
    const shareMeta = view.shareMeta ? (JSON.parse(view.shareMeta) as IShareViewMeta) : undefined;
    const { tableId, id: viewId } = view;
    const fields = await this.fieldService.getFieldsByQuery(tableId, {
      viewId: view.id,
      filterHidden: !shareMeta?.includeHiddenField,
    });
    const { records } = await this.recordService.getRecords(tableId, {
      viewId,
      skip: 0,
      take: 50,
      fieldKeyType: FieldKeyType.Id,
      projection: fields.map((f) => f.id),
    });
    return {
      shareMeta,
      shareId,
      tableId,
      viewId,
      view: createViewVoByRaw(view),
      fields,
      records,
    };
  }

  async getViewAggregations(
    shareInfo: IShareViewInfo,
    query: IShareViewAggregationsRo = {}
  ): Promise<IAggregationVo> {
    const viewId = shareInfo.view.id;
    const tableId = shareInfo.tableId;
    const filter = query?.filter ?? null;
    const fieldStats: Array<{ fieldId: string; statisticFunc: StatisticsFunc }> = [];
    if (query?.field) {
      Object.entries(query.field).forEach(([key, value]) => {
        const stats = value.map((fieldId) => ({
          fieldId,
          statisticFunc: key as StatisticsFunc,
        }));
        fieldStats.push(...stats);
      });
    }
    const result = await this.aggregationService.performAggregation({
      tableId,
      withView: { viewId, customFilter: filter, customFieldStats: fieldStats },
    });

    return { aggregations: result?.aggregations };
  }

  async getViewRowCount(
    shareInfo: IShareViewInfo,
    query?: IShareViewRowCountRo
  ): Promise<IRowCountVo> {
    const viewId = shareInfo.view.id;
    const tableId = shareInfo.tableId;
    const result = await this.aggregationService.performRowCount(tableId, { viewId, ...query });

    return {
      rowCount: result.rowCount,
    };
  }

  async formSubmit(shareInfo: IShareViewInfo, shareViewFormSubmitRo: ShareViewFormSubmitRo) {
    const { tableId } = shareInfo;
    const { fields } = shareViewFormSubmitRo;
    const { records } = await this.prismaService.$tx(async () => {
      return await this.recordOpenApiService.createRecords(tableId, {
        records: [{ fields }],
        fieldKeyType: FieldKeyType.Id,
      });
    });
    if (records.length === 0) {
      throw new InternalServerErrorException('The number of successful submit records is 0');
    }
    return records[0];
  }

  async copy(shareInfo: IShareViewInfo, shareViewCopyRo: IRangesRo) {
    return this.selectionService.copy(shareInfo.tableId, {
      viewId: shareInfo.view.id,
      ...shareViewCopyRo,
    });
  }

  async getLinkRecords(shareInfo: IShareViewInfo, shareViewLinkRecordsRo: IShareViewLinkRecordsRo) {
    const linkTableId = shareViewLinkRecordsRo.tableId;

    const fields = await this.fieldService.getFieldsByQuery(shareInfo.tableId, {});
    const field = fields
      .filter((field) => field.type === FieldType.Link)
      .find((field) => (field.options as ILinkFieldOptions).foreignTableId === linkTableId);

    if (!field) {
      throw new ForbiddenException('tableId is not allowed');
    }
    const linkField = await this.fieldService.getField(
      linkTableId,
      (field.options as ILinkFieldOptions).lookupFieldId
    );
    const fieldKeyType = shareViewLinkRecordsRo.fieldKeyType ?? FieldKeyType.Name;
    const projection = [linkField[fieldKeyType]];
    return this.recordService.getRecords(linkTableId, {
      ...shareViewLinkRecordsRo,
      projection,
      fieldKeyType,
    });
  }

  async getViewGroupPoints(
    shareInfo: IShareViewInfo,
    query?: IShareViewGroupPointsRo
  ): Promise<IGroupPointsVo> {
    const viewId = shareInfo.view.id;
    const tableId = shareInfo.tableId;

    if (viewId == null) return null;

    return await this.aggregationService.getGroupPoints(tableId, { ...query, viewId });
  }
}
