import { z } from 'zod'

export const paginationDataSchema = z.object({
  currentPage: z.coerce.number().int().positive(),
  pageItems: z.coerce.number().int().nonnegative(),
  totalPages: z.coerce.number().int().positive(),
  totalCount: z.coerce.number().int().nonnegative(),
})
