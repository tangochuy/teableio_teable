import { Module } from '@nestjs/common';
import { AttachmentsTableService } from '../attachments/attachments-table.service';
import { CalculationModule } from '../calculation/calculation.module';
import { FieldSupplementService } from './field-calculate/field-supplement.service';
import { FieldService } from './field.service';

@Module({
  imports: [CalculationModule],
  providers: [FieldService, FieldSupplementService, AttachmentsTableService],
  exports: [FieldService],
})
export class FieldModule {}
