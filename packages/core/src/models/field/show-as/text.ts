import { z } from 'zod';

export enum SingleLineTextDisplayType {
  Url = 'url',
  Email = 'email',
  Phone = 'phone',
}

export const singleLineTextShowAsSchema = z.object({
  type: z.nativeEnum(SingleLineTextDisplayType).openapi({
    description:
      'can display as url, email or phone in string field with a button to perform the corresponding action, start a phone call, send an email, or open a link in a new tab',
  }),
});

export type ISingleLineTextShowAs = z.infer<typeof singleLineTextShowAsSchema>;
