import { plainToInstance } from 'class-transformer';
import { CellValueType, DbFieldType, FieldType } from '../constant';
import { TimeFormatting, defaultDatetimeFormatting } from '../formatting';
import { CreatedTimeFieldCore } from './created-time.field';

describe('CreatedTimeFieldCore', () => {
  const createdTimeJson = {
    id: 'fld123',
    name: 'Created time',
    description: 'A test created time field',
    notNull: false,
    unique: false,
    isPrimary: false,
    columnMeta: {
      index: 0,
      columnIndex: 0,
    },
    type: FieldType.CreatedTime,
    options: {
      expression: 'CREATED_TIME()',
      formatting: defaultDatetimeFormatting,
    },
    dbFieldType: DbFieldType.DateTime,
    cellValueType: CellValueType.DateTime,
    isComputed: true,
  };

  const createdTimeField = plainToInstance(CreatedTimeFieldCore, { ...createdTimeJson });

  describe('basic function', () => {
    it('should convert cellValue to string', () => {
      expect(createdTimeField.cellValue2String('2023-11-28T06:50:48.017Z')).toBe('2023-11-28');
    });

    it('should validate cellValue', () => {
      expect(createdTimeField.validateCellValue('date').success).toBe(false);
      expect(createdTimeField.validateCellValue('2023-11-28T06:50:48.017Z').success).toBe(true);
    });

    it('should convert string to cellValue', () => {
      expect(createdTimeField.convertStringToCellValue('1')).toBe(null);
    });

    it('should repair invalid value', () => {
      expect(createdTimeField.repair(1)).toBe(null);
    });
  });

  describe('validateOptions', () => {
    it('should return success if options are valid', () => {
      expect(createdTimeField.validateOptions().success).toBeTruthy();
    });

    it('should return failure if options are invalid', () => {
      expect(
        plainToInstance(CreatedTimeFieldCore, {
          ...createdTimeJson,
          options: {
            ...createdTimeJson.options,
            expression: '1 + 1',
          },
        }).validateOptions().success
      ).toBeFalsy();

      expect(
        plainToInstance(CreatedTimeFieldCore, {
          ...createdTimeJson,
          options: {
            ...createdTimeJson.options,
            formatting: {
              date: 'abc',
              time: TimeFormatting.None,
              timeZone: 'utc',
            },
          },
        }).validateOptions().success
      ).toBeFalsy();
    });

    it('should get default options', () => {
      expect(CreatedTimeFieldCore.defaultOptions()).toEqual({
        expression: 'CREATED_TIME()',
        formatting: defaultDatetimeFormatting,
      });
    });
  });
});
