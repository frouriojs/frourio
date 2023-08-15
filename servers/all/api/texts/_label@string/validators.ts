import { z } from 'zod';
import { defineValidators } from './$relay';

type Branded<T extends string> = string & z.BRAND<T>;

export type UserId = Branded<'UserId'>;

export const userIdParser = z.string() as unknown as z.ZodType<UserId>;

export default defineValidators(() => ({
  params: z.object({ label: z.string() }),
}));
