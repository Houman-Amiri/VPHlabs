const { z } = require('zod');

const createServiceSchema = z.object({
  isic_code: z.string().trim().max(20).optional().default(''),
  title_fa: z.string().trim().min(3, 'عنوان فارسی خدمت الزامی است.').max(200),
  title_en: z.string().trim().max(200).optional().default(''),
  description_fa: z.string().trim().min(10, 'توضیحات خدمت الزامی است.').max(2000),
  description_en: z.string().trim().max(2000).optional().default(''),
  ai_application_fa: z.string().trim().max(400).optional().default(''),
  ai_application_en: z.string().trim().max(400).optional().default(''),
  icon_name: z.string().trim().max(50).optional().default('Cpu'),
  sort_order: z.coerce.number().int().min(0).max(9999).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const updateServiceSchema = createServiceSchema.partial();

module.exports = {
  createServiceSchema,
  updateServiceSchema,
};
