import { IdPrefix } from '../../utils';
import { z } from '../../zod';
import { fieldRoSchema, fieldVoSchema } from '../field';
import { createRecordsRoSchema, fieldKeyTypeRoSchema, recordSchema } from '../record';
import { viewRoSchema, viewVoSchema } from '../view';

export const tableFullVoSchema = z
  .object({
    id: z.string().startsWith(IdPrefix.Table).openapi({
      description: 'The id of table.',
    }),
    name: z.string().openapi({
      description: 'The name of the table.',
    }),
    dbTableName: z.string().openapi({
      description: 'the table name in the backend database schema.',
    }),
    description: z.string().optional().openapi({
      description: 'The description of the table.',
    }),
    icon: z.string().emoji().optional().openapi({
      description: 'The emoji icon string of the table.',
    }),
    fields: fieldVoSchema.array().openapi({
      description: 'The fields of the table.',
    }),
    views: viewVoSchema.array().openapi({
      description: 'The views of the table.',
    }),
    records: recordSchema.array().openapi({
      description: 'The records of the table.',
    }),
    order: z.number().openapi({
      description: 'The order is a floating number, table will sort by it in the folder.',
    }),
    lastModifiedTime: z.string().openapi({
      description: 'The last modified time of the table.',
    }),
    defaultViewId: z.string().startsWith(IdPrefix.View).optional().openapi({
      description: 'The default view id of the table.',
    }),
  })
  .openapi({
    description: 'Complete table structure data and initial record data.',
  });

export type ITableFullVo = z.infer<typeof tableFullVoSchema>;

export const tableVoSchema = tableFullVoSchema.partial({
  fields: true,
  views: true,
  records: true,
});

export type ITableVo = z.infer<typeof tableVoSchema>;

export const tableRoSchema = tableFullVoSchema
  .omit({
    id: true,
    dbTableName: true,
    lastModifiedTime: true,
    defaultViewId: true,
  })
  .partial({
    name: true,
    order: true,
  })
  .merge(
    z.object({
      fieldKeyType: fieldKeyTypeRoSchema,
      fields: fieldRoSchema.array().optional().openapi({
        description:
          'The fields of the table. If it is empty, 3 fields include SingleLineText, Number, SingleSelect will and 3 empty records be generated by default.',
      }),
      views: viewRoSchema.array().optional().openapi({
        description:
          'The views of the table. If it is empty, a grid view will be generated by default.',
      }),
      records: createRecordsRoSchema.shape.records.optional().openapi({
        description:
          'The record data of the table. If it is empty, 3 empty records will be generated by default.',
      }),
      order: z.number().optional().openapi({
        description:
          'The order is a floating number, table will sort by it in the folder. If it is empty, table will be put to the last one.',
      }),
    })
  )
  .openapi({
    description: 'params for create a table',
  });

export type ICreateTableRo = z.infer<typeof tableRoSchema>;

export type ITableOp = Pick<
  ITableVo,
  'id' | 'name' | 'description' | 'order' | 'icon' | 'lastModifiedTime'
>;

export const tableListVoSchema = tableVoSchema.array().openapi({
  description: 'The list of tables.',
});

export type ITableListVo = z.infer<typeof tableListVoSchema>;

export const getTableQuerySchema = z.object({
  viewId: z.string().startsWith(IdPrefix.View).optional().openapi({
    description: 'Which view to get the data from.',
  }),
  includeContent: z
    .string()
    .or(z.boolean())
    .transform(Boolean)
    .pipe(z.boolean())
    .optional()
    .openapi({
      description: 'If true return table content. including fields, views, first 50 records.',
    }),
  fieldKeyType: fieldKeyTypeRoSchema,
});

export type IGetTableQuery = z.infer<typeof getTableQuerySchema>;

export const getGraphRoSchema = z.object({
  cell: z
    .tuple([z.number(), z.number()])
    .openapi({ description: 'The cell coord, [colIndex, rowIndex]' }),
  viewId: z.string().optional().openapi({ description: 'The view id' }),
});

export type IGetGraphRo = z.infer<typeof getGraphRoSchema>;

export interface IGraphNode {
  [key: string]: unknown;

  id: string;
  label?: string;
  comboId?: string;
}

export interface IGraphEdge {
  [key: string]: unknown;

  source: string;
  target: string;
  label?: string;
}

export interface IGraphCombo {
  [key: string]: unknown;

  id: string;
  label: string;
}

export type IGraphVo =
  | {
      nodes: IGraphNode[];
      edges: IGraphEdge[];
      combos: IGraphCombo[];
    }
  | undefined;
