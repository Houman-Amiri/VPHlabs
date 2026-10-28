const { z } = require('zod');

const contentItemSchema = z.object({
  content_key: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9_.-]+$/i, 'کلید محتوا باید انگلیسی و استاندارد باشد.'),
  section: z.string().trim().min(2).max(60).default('general'),
  label_fa: z.string().trim().min(2).max(200),
  value_fa: z.string().trim().min(1, 'مقدار فارسی نمی‌تواند خالی باشد.').max(10000),
  value_en: z.string().trim().max(10000).optional().default(''),
});

const bulkContentSchema = z.object({
  items: z.array(contentItemSchema).min(1).max(100),
});

module.exports = {
  contentItemSchema,
  bulkContentSchema,
};
