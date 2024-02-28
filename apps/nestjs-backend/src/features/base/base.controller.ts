/* eslint-disable sonarjs/no-duplicate-string */
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  createBaseRoSchema,
  duplicateBaseRoSchema,
  ICreateBaseRo,
  IUpdateBaseRo,
  updateBaseRoSchema,
  IDuplicateBaseRo,
} from '@teable/openapi';
import type {
  ICreateBaseVo,
  IDbConnectionVo,
  IDuplicateBaseVo,
  IGetBaseVo,
  IUpdateBaseVo,
  ListBaseCollaboratorVo,
} from '@teable/openapi';
import { EmitControllerEvent } from '../../event-emitter/decorators/emit-controller-event.decorator';
import { Events } from '../../event-emitter/events';
import { ZodValidationPipe } from '../../zod.validation.pipe';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ResourceMeta } from '../auth/decorators/resource_meta.decorator';
import { PermissionService } from '../auth/permission.service';
import { CollaboratorService } from '../collaborator/collaborator.service';
import { BaseService } from './base.service';
import { DbConnectionService } from './db-connection.service';

@Controller('api/base/')
export class BaseController {
  constructor(
    private readonly baseService: BaseService,
    private readonly dbConnectionService: DbConnectionService,
    private readonly collaboratorService: CollaboratorService,
    private readonly permissionService: PermissionService
  ) {}

  @Post()
  @Permissions('base|create')
  @ResourceMeta('spaceId', 'body')
  @EmitControllerEvent(Events.BASE_CREATE)
  async createBase(
    @Body(new ZodValidationPipe(createBaseRoSchema))
    createBaseRo: ICreateBaseRo
  ): Promise<ICreateBaseVo> {
    return await this.baseService.createBase(createBaseRo);
  }

  @Patch(':baseId')
  @Permissions('base|update')
  @EmitControllerEvent(Events.BASE_UPDATE)
  async updateBase(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(updateBaseRoSchema))
    updateBaseRo: IUpdateBaseRo
  ): Promise<IUpdateBaseVo> {
    return await this.baseService.updateBase(baseId, updateBaseRo);
  }

  @Permissions('base|read')
  @Get(':baseId')
  async getBaseById(@Param('baseId') baseId: string): Promise<IGetBaseVo> {
    return await this.baseService.getBaseById(baseId);
  }

  @Get('access/all')
  async getAllBase(): Promise<IGetBaseVo[]> {
    return await this.baseService.getBaseList();
  }

  @Delete(':baseId')
  @Permissions('base|delete')
  @EmitControllerEvent(Events.BASE_DELETE)
  async deleteBase(@Param('baseId') baseId: string) {
    return await this.baseService.deleteBase(baseId);
  }

  @Post(':baseId/duplicate')
  @Permissions('base|read')
  async duplicateBase(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(duplicateBaseRoSchema))
    duplicateBaseRo: IDuplicateBaseRo
  ): Promise<IDuplicateBaseVo> {
    await this.permissionService.checkPermissionBySpaceId(duplicateBaseRo.toSpaceId, [
      'base|create',
    ]);
    return await this.baseService.duplicateBase(baseId, duplicateBaseRo);
  }

  @Permissions('base|create')
  @Post(':baseId/connection')
  async createDbConnection(@Param('baseId') baseId: string): Promise<IDbConnectionVo> {
    return await this.dbConnectionService.create(baseId);
  }

  @Permissions('base|create')
  @Get(':baseId/connection')
  async getDBConnection(@Param('baseId') baseId: string): Promise<IDbConnectionVo | null> {
    return await this.dbConnectionService.retrieve(baseId);
  }

  @Permissions('base|create')
  @Delete(':baseId/connection')
  async deleteDbConnection(@Param('baseId') baseId: string) {
    await this.dbConnectionService.remove(baseId);
    return null;
  }

  @Permissions('base|read')
  @Get(':baseId/collaborators')
  async listCollaborator(@Param('baseId') baseId: string): Promise<ListBaseCollaboratorVo> {
    return await this.collaboratorService.getListByBase(baseId);
  }
}
