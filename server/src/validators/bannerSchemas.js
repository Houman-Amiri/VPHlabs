const { z } = require('zod');

const createBannerSchema = z.object({
  image_url: z.string().trim().min(2, 'آدرس تصویر بنر الزامی است.').max(500),
  target_url: z
    .string()
    .trim()
    .min(1, 'لینک مقصد بنر الزامی است.')
    .max(500)
    .default('/products'),
  alt_fa: z
    .string()
    .trim()
    .min(2, 'متن جایگزین (Alt) فارسی برای سئو و دسترس‌پذیری الزامی است.')
    .max(240),
  alt_en: z.string().trim().max(240).optional().default(''),
  badge_fa: z.string().trim().max(160).optional().default(''),
  badge_en: z.string().trim().max(160).optional().default(''),
  title_fa: z.string().trim().max(240).optional().default(''),
  title_en: z.string().trim().max(240).optional().default(''),
  subtitle_fa: z.string().trim().max(500).optional().default(''),
  subtitle_en: z.string().trim().max(500).optional().default(''),
  sort_order: z.coerce.number().int().min(0).max(9999).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const updateBannerSchema = createBannerSchema.partial();

module.exports = {
  createBannerSchema,
  updateBannerSchema,
};
