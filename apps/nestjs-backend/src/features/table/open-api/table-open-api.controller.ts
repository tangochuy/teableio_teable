/* eslint-disable sonarjs/no-duplicate-string */
import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import type { ITableFullVo, ITableListVo, ITableVo } from '@teable-group/core';
import {
  getTableQuerySchema,
  IGetTableQuery,
  tableRoSchema,
  ICreateTableWithDefault,
} from '@teable-group/core';
import {
  getGraphRoSchema,
  IGetGraphRo,
  ISqlQuerySchema,
  sqlQuerySchema,
} from '@teable-group/openapi';
import { ZodValidationPipe } from '../../../zod.validation.pipe';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PermissionGuard } from '../../auth/guard/permission.guard';
import { TableService } from '../table.service';
import { TableOpenApiService } from './table-open-api.service';
import { TablePipe } from './table.pipe';

@Controller('api/base/:baseId/table')
@UseGuards(PermissionGuard)
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly tableOpenApiService: TableOpenApiService
  ) {}

  @Permissions('table|read')
  @Get(':tableId/defaultViewId')
  async getDefaultViewId(@Param('tableId') tableId: string): Promise<{ id: string }> {
    return await this.tableService.getDefaultViewId(tableId);
  }

  @Permissions('table|read')
  @Get(':tableId')
  async getTable(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Query(new ZodValidationPipe(getTableQuerySchema)) query: IGetTableQuery
  ): Promise<ITableVo> {
    return await this.tableOpenApiService.getTable(baseId, tableId, query);
  }

  @Permissions('table|read')
  @Get()
  async getTables(@Param('baseId') baseId: string): Promise<ITableListVo> {
    return await this.tableOpenApiService.getTables(baseId);
  }

  @Post()
  @Permissions('table|create')
  async createTable(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(tableRoSchema), TablePipe) createTableRo: ICreateTableWithDefault
  ): Promise<ITableFullVo> {
    return await this.tableOpenApiService.createTable(baseId, createTableRo);
  }

  @Delete(':tableId')
  @Permissions('table|delete')
  async archiveTable(@Param('baseId') baseId: string, @Param('tableId') tableId: string) {
    return await this.tableOpenApiService.deleteTable(baseId, tableId);
  }

  @Delete('arbitrary/:tableId')
  @Permissions('table|delete')
  deleteTableArbitrary(@Param('baseId') baseId: string, @Param('tableId') tableId: string) {
    return this.tableOpenApiService.deleteTable(baseId, tableId, true);
  }

  @Permissions('table|read')
  @Post(':tableId/graph')
  async getCellGraph(
    @Param('tableId') tableId: string,
    @Body(new ZodValidationPipe(getGraphRoSchema)) { cell }: IGetGraphRo
  ) {
    return await this.tableOpenApiService.getGraph(tableId, cell);
  }

  @Permissions('table|read')
  @Post(':tableId/sqlQuery')
  async sqlQuery(
    @Param('tableId') tableId: string,
    @Query(new ZodValidationPipe(sqlQuerySchema)) query: ISqlQuerySchema
  ) {
    return await this.tableOpenApiService.sqlQuery(tableId, query.viewId, query.sql);
  }
}
