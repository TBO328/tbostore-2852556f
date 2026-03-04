import { z } from 'zod';

// Order validation schema
export const orderSchema = z.object({
  customer_name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  customer_phone: z.string()
    .trim()
    .min(8, 'Phone number must be at least 8 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone format'),
  customer_address: z.string()
    .trim()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .default(''),
  items: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    nameAr: z.string(),
    price: z.number().positive().finite().max(999999),
    quantity: z.number().int().positive().max(100),
    image: z.string(),
  })).min(1, 'At least one item required').max(50),
  payment_method: z.enum(['stripe', 'stc_pay', 'bank_transfer']),
  total_amount: z.number().nonnegative().finite().max(9999999),
});

// Product validation schema
export const productSchema = z.object({
  name_en: z.string().trim().min(2).max(200),
  name_ar: z.string().trim().min(2).max(200),
  description_en: z.string().max(2000).optional().nullable(),
  description_ar: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive().max(999999.99),
  original_price: z.coerce.number().positive().max(999999.99).optional().nullable(),
  category: z.string().min(2).max(50),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  in_stock: z.boolean(),
});

// Coupon validation schema
export const couponSchema = z.object({
  code: z.string().trim().min(2).max(50).toUpperCase(),
  discount_percent: z.coerce.number().int().min(1).max(100),
  expires_at: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
