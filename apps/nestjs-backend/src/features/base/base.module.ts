import { Module } from '@nestjs/common';
import { DbProvider } from '../../db-provider/db.provider';
import { CollaboratorModule } from '../collaborator/collaborator.module';
import { BaseDuplicateService } from './base-duplicate.service';
import { BaseController } from './base.controller';
import { BaseService } from './base.service';
import { DbConnectionService } from './db-connection.service';

@Module({
  controllers: [BaseController],
  imports: [CollaboratorModule],
  providers: [DbProvider, BaseService, DbConnectionService, BaseDuplicateService],
})
export class BaseModule {}
