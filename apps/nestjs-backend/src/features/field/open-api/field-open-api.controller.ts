/* eslint-disable sonarjs/no-duplicate-string */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { IFieldVo } from '@teable-group/core';
import {
  getFieldsQuerySchema,
  IGetFieldsQuery,
  IUpdateFieldRo,
  updateFieldRoSchema,
  fieldRoSchema,
  IFieldRo,
} from '@teable-group/core';
import { ZodValidationPipe } from '../../../zod.validation.pipe';
import { FieldService } from '../field.service';
import { FieldOpenApiService } from './field-open-api.service';

@Controller('api/table/:tableId/field')
export class FieldOpenApiController {
  constructor(
    private readonly fieldService: FieldService,
    private readonly fieldOpenApiService: FieldOpenApiService
  ) {}

  @Get(':fieldId')
  async getField(
    @Param('tableId') tableId: string,
    @Param('fieldId') fieldId: string
  ): Promise<IFieldVo> {
    return await this.fieldService.getField(tableId, fieldId);
  }

  @Get()
  async getFields(
    @Param('tableId') tableId: string,
    @Query(new ZodValidationPipe(getFieldsQuerySchema)) query: IGetFieldsQuery
  ): Promise<IFieldVo[]> {
    return await this.fieldService.getFields(tableId, query);
  }

  @Post()
  async createField(
    @Param('tableId') tableId: string,
    @Body(new ZodValidationPipe(fieldRoSchema)) fieldRo: IFieldRo
  ): Promise<IFieldVo> {
    return await this.fieldOpenApiService.createField(tableId, fieldRo);
  }

  @Put(':fieldId')
  async updateFieldById(
    @Param('tableId') tableId: string,
    @Param('fieldId') fieldId: string,
    @Body(new ZodValidationPipe(updateFieldRoSchema)) updateFieldRo: IUpdateFieldRo
  ) {
    return await this.fieldOpenApiService.updateFieldById(tableId, fieldId, updateFieldRo);
  }

  @Delete(':fieldId')
  async deleteField(@Param('tableId') tableId: string, @Param('fieldId') fieldId: string) {
    return await this.fieldOpenApiService.deleteField(tableId, fieldId);
  }
}
