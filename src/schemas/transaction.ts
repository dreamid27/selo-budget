import * as z from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be greater than 0',
    }),
  category: z.number().min(1, 'Category is required'),
  accountId: z.number().min(1, 'Account is required'),
  description: z.string().min(1, 'Description is required'),
  note: z.string().optional(),
  date: z.date({
    required_error: 'Date is required',
  }),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
