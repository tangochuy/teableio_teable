import { Module } from '@nestjs/common';
import { AttachmentsStorageModule } from '../../attachments/attachments-storage.module';
import { FieldCalculateModule } from '../../field/field-calculate/field-calculate.module';
import { ViewOpenApiModule } from '../../view/open-api/view-open-api.module';
import { ViewModule } from '../../view/view.module';
import { RecordCalculateModule } from '../record-calculate/record-calculate.module';
import { RecordModule } from '../record.module';
import { RecordOpenApiController } from './record-open-api.controller';
import { RecordOpenApiService } from './record-open-api.service';

@Module({
  imports: [
    RecordModule,
    RecordCalculateModule,
    FieldCalculateModule,
    AttachmentsStorageModule,
    ViewModule,
    ViewOpenApiModule,
  ],
  controllers: [RecordOpenApiController],
  providers: [RecordOpenApiService],
  exports: [RecordOpenApiService],
})
export class RecordOpenApiModule {}
