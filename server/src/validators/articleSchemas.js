const { z } = require('zod');

const SLUG_REGEX = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/i;

const articleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(9),
  sortBy: z
    .enum(['published_at', 'created_at', 'views_count', 'likes_count', 'title_fa'])
    .default('published_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  category: z.string().trim().max(100).optional(),
  tag: z.string().trim().max(80).optional(),
  q: z.string().trim().max(120).optional(),
  all: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const createArticleSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'اسلاگ مقاله الزامی است.')
    .max(160)
    .regex(SLUG_REGEX, 'اسلاگ تنها می‌تواند شامل حروف، اعداد و خط تیره (-) باشد.'),
  title_fa: z.string().trim().min(5, 'عنوان مقاله باید حداقل ۵ کاراکتر باشد.').max(240),
  title_en: z.string().trim().max(240).optional().default(''),
  excerpt_fa: z.string().trim().min(15, 'چکیده مقاله الزامی است.').max(600),
  excerpt_en: z.string().trim().max(600).optional().default(''),
  content_fa: z.string().trim().min(30, 'متن مقاله الزامی است.').max(60000),
  content_en: z.string().trim().max(60000).optional().default(''),
  cover_image: z.string().trim().max(500).optional().default(''),
  category: z.string().trim().min(2).max(100).default('هوش مصنوعی سازمانی'),
  tags: z.array(z.string().trim().min(1).max(60)).max(15).optional().default([]),
  author_name: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default('واحد تحقیق و توسعه ویرا پردازش هومان'),
  reading_time_minutes: z.coerce.number().int().min(1).max(120).optional().default(5),
  meta_title: z.string().trim().max(160).optional().default(''),
  meta_description: z.string().trim().max(320).optional().default(''),
  meta_keywords: z.string().trim().max(300).optional().default(''),
  is_published: z.boolean().optional().default(true),
});

const updateArticleSchema = createArticleSchema.partial();

module.exports = {
  articleQuerySchema,
  createArticleSchema,
  updateArticleSchema,
};
