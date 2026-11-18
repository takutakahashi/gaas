import { z } from "zod";

export const projectSchema = z.object({ name: z.string().trim().min(1).max(80) });
export const invitationSchema = z.object({ invitedUserId: z.uuid() });
export const itemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(60),
  manufacturer: z.string().trim().max(80).optional().default(""),
  modelNumber: z.string().trim().max(100).optional().default(""),
  priceYen: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  amortizationStartMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  usefulLifeMonths: z.coerce.number().int().min(1).max(1200),
  note: z.string().trim().max(1000).optional().default(""),
});
