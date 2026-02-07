import { z } from 'zod';

// Client Schema
export const clientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .default('#10B981'),
  archived: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Service Schema
export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  client_id: z.string().uuid('Please select a client'),
  time_worked: z.number()
    .min(0.5, 'Minimum 0.5 hours')
    .max(24, 'Maximum 24 hours per day'),
  hourly_rate: z.number()
    .min(0.01, 'Rate must be greater than 0')
    .max(1000, 'Rate seems too high'),
  total: z.number()
    .min(0, 'Total must be positive'),
  created_at: z.string().datetime().optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// Validation helper functions
export function validateClient(data: unknown): { success: true; data: ClientInput } | { success: false; errors: string[] } {
  const result = clientSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    errors: result.error.issues.map((issue: { message: string }) => issue.message) 
  };
}

export function validateService(data: unknown): { success: true; data: ServiceInput } | { success: false; errors: string[] } {
  const result = serviceSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    errors: result.error.issues.map((issue: { message: string }) => issue.message) 
  };
}
