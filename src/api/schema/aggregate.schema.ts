import { object } from 'zod';
import { pageSchema } from './common.schema';

export const categorySchema = object({
  query: pageSchema.strict(),
});
