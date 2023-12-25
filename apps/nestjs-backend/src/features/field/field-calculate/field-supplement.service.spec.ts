/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { IFieldRo } from '@teable-group/core';
import { CellValueType, DbFieldType, FieldType, Relationship } from '@teable-group/core';
import { PrismaService } from '@teable-group/db-main-prisma';
import { vi } from 'vitest';
import { GlobalModule } from '../../../global/global.module';
import { FieldService } from '../field.service';
import { createFieldInstanceByVo } from '../model/factory';
import { FieldCalculateModule } from './field-calculate.module';
import { FieldSupplementService } from './field-supplement.service';

describe('FieldSupplementService', () => {
  let service: FieldSupplementService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalModule, FieldCalculateModule],
    }).compile();

    const fieldService = module.get<FieldService>(FieldService);
    service = module.get<FieldSupplementService>(FieldSupplementService);
    prismaService = module.get<PrismaService>(PrismaService);
    fieldService.generateDbFieldName = vi.fn().mockImplementation((name) => name);
  });

  describe('prepareFieldOptions', () => {
    it('should return the field if it is not a link field', async () => {
      const field: IFieldRo = {
        name: 'text',
        type: FieldType.SingleLineText,
      };
      const preparedField = {
        name: 'text',
        type: FieldType.SingleLineText,
        options: {},
        cellValueType: CellValueType.String,
        dbFieldType: DbFieldType.Text,
      };
      const result = await service.prepareCreateField('tableId', field);
      expect(result).toMatchObject(preparedField);
      expect(result.dbFieldName).toBeTruthy();
      expect(result.id).toBeTruthy();
    });
  });

  describe('supplementByCreate', () => {
    it('should throw an error if the field is not a link field', async () => {
      const nonLinkField: any = { type: FieldType.SingleLineText /* other properties */ };
      await expect(service.createForeignKey(nonLinkField)).rejects.toThrow();
    });
  });

  describe('createReference', () => {
    it('should create reference by link field', async () => {
      // setup mocks
      const linkField = {
        id: 'linkFieldId',
        name: 'link',
        type: FieldType.Link,
        options: {
          foreignTableId: 'tableId',
          relationship: Relationship.ManyOne,
          lookupFieldId: 'lookupFieldId',
          dbForeignKeyName: '__fk_linkFieldId',
          symmetricFieldId: 'symmetricFieldId',
        },
        dbFieldName: 'link',
        cellValueType: CellValueType.String,
        dbFieldType: DbFieldType.Json,
        columnMeta: {},
      };
      (prismaService as any).reference = { create: vi.fn().mockResolvedValue(undefined) };
      await service['createReference'](createFieldInstanceByVo(linkField));

      expect(prismaService.reference.create).toBeCalledWith({
        data: {
          fromFieldId: 'lookupFieldId',
          toFieldId: 'linkFieldId',
        },
      });
    });

    it('should create reference by formula field', async () => {
      // setup mocks
      const formulaField = {
        id: 'formulaFieldId',
        name: 'formula',
        type: FieldType.Formula,
        options: {
          expression: 'concat({field1Id} + {field2Id}, {field3Id})',
        },
        dbFieldName: 'formula',
        cellValueType: CellValueType.String,
        dbFieldType: DbFieldType.Text,
        columnMeta: {},
      };
      (prismaService as any).reference = { create: vi.fn().mockResolvedValue(undefined) };
      await service['createReference'](createFieldInstanceByVo(formulaField));

      expect(prismaService.reference.create).toHaveBeenNthCalledWith(1, {
        data: {
          fromFieldId: 'field1Id',
          toFieldId: 'formulaFieldId',
        },
      });
      expect(prismaService.reference.create).toHaveBeenNthCalledWith(2, {
        data: {
          fromFieldId: 'field2Id',
          toFieldId: 'formulaFieldId',
        },
      });
      expect(prismaService.reference.create).toHaveBeenNthCalledWith(3, {
        data: {
          fromFieldId: 'field3Id',
          toFieldId: 'formulaFieldId',
        },
      });
    });
  });
});
