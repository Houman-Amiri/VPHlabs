const { z } = require('zod');

const SLUG_REGEX = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/i;

const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(9),
  sortBy: z
    .enum(['sort_order', 'created_at', 'updated_at', 'title_fa', 'title_en'])
    .default('sort_order'),
  order: z.enum(['asc', 'desc']).default('asc'),
  category: z.string().trim().max(64).optional(),
  sector: z.string().trim().max(64).optional(),
  q: z.string().trim().max(120).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  all: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const createProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'اسلاگ محصول الزامی است.')
    .max(140)
    .regex(SLUG_REGEX, 'اسلاگ تنها می‌تواند شامل حروف، اعداد و خط تیره (-) باشد.'),
  title_fa: z.string().trim().min(2, 'عنوان فارسی محصول الزامی است.').max(200),
  title_en: z.string().trim().max(200).optional().default(''),
  summary_fa: z.string().trim().min(10, 'خلاصه معرفی محصول الزامی است.').max(600),
  summary_en: z.string().trim().max(600).optional().default(''),
  description_fa: z.string().trim().min(20, 'توضیحات کامل محصول الزامی است.').max(15000),
  description_en: z.string().trim().max(15000).optional().default(''),
  category: z.string().trim().min(2).max(64).default('enterprise-ai'),
  badge: z.string().trim().max(80).optional().default(''),
  image_url: z.string().trim().max(500).optional().default(''),
  features: z.array(z.string().trim().min(1).max(300)).max(20).optional().default([]),
  target_sector: z
    .enum(['enterprise', 'government', 'industrial', 'infrastructure'])
    .default('enterprise'),
  isic_code: z.string().trim().max(20).optional().default('620101'),
  demo_available: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).optional().default(0),
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
};
