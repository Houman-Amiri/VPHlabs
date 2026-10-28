import { z } from 'zod';

function normalizeDigits(str: string) {
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[\s()-]/g, '');
}

/**
 * Phase 3.6: React Hook Form + Zod schemas matching backend API validation contracts.
 */
export const contactFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'لطفاً نام و نام خانوادگی را وارد کنید (حداقل ۲ حرف).')
    .max(120),
  organization: z.string().trim().max(160).optional().default(''),
  email: z
    .string()
    .trim()
    .email('لطفاً یک آدرس ایمیل معتبر وارد کنید.')
    .max(160),
  phone: z
    .string()
    .trim()
    .refine((raw) => {
      const val = normalizeDigits(raw);
      return /^(\+98|0098|0)?9\d{9}$/.test(val) || /^0\d{9,10}$/.test(val);
    }, 'شماره موبایل (مثلاً ۰۹۱۲...) یا تلفن ثابت با کد شهر وارد کنید.'),
  department: z.enum([
    'ai-consulting',
    'custom-software',
    'industrial-automation',
    'network-infrastructure',
    'support',
  ]),
  product_id: z.number().int().positive().nullable().optional(),
  subject: z
    .string()
    .trim()
    .min(3, 'موضوع پیام باید حداقل ۳ کاراکتر باشد.')
    .max(200),
  message: z
    .string()
    .trim()
    .min(10, 'شرح درخواست باید حداقل ۱۰ کاراکتر باشد.')
    .max(5000),
});

export type ContactFormValues = z.input<typeof contactFormSchema>;

export const adminLoginFormSchema = z.object({
  email: z.string().trim().min(3, 'لطفاً نام کاربری را وارد کنید.'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

export const productFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'اسلاگ الزامی است.')
    .regex(
      /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/i,
      'اسلاگ تنها شامل حروف، اعداد و خط تیره (-) است.'
    ),
  title_fa: z.string().trim().min(2, 'عنوان فارسی الزامی است.'),
  title_en: z.string().trim().optional().default(''),
  summary_fa: z.string().trim().min(10, 'خلاصه معرفی حداقل ۱۰ کاراکتر است.'),
  summary_en: z.string().trim().optional().default(''),
  description_fa: z.string().trim().min(20, 'توضیحات کامل حداقل ۲۰ کاراکتر است.'),
  description_en: z.string().trim().optional().default(''),
  category: z.string().trim().min(2),
  badge: z.string().trim().optional().default(''),
  image_url: z.string().trim().optional().default(''),
  features_text: z.string().optional().default(''),
  target_sector: z.enum([
    'enterprise',
    'government',
    'industrial',
    'infrastructure',
  ]),
  isic_code: z.string().trim().optional().default('620101'),
  demo_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type ProductFormValues = z.input<typeof productFormSchema>;

export const articleFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'اسلاگ مقاله الزامی است.')
    .regex(
      /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/i,
      'اسلاگ تنها شامل حروف، اعداد و خط تیره (-) است.'
    ),
  title_fa: z.string().trim().min(5, 'عنوان فارسی مقاله الزامی است.'),
  title_en: z.string().trim().optional().default(''),
  excerpt_fa: z.string().trim().min(15, 'چکیده مقاله حداقل ۱۵ کاراکتر است.'),
  excerpt_en: z.string().trim().optional().default(''),
  content_fa: z.string().trim().min(30, 'متن مقاله حداقل ۳۰ کاراکتر است.'),
  content_en: z.string().trim().optional().default(''),
  cover_image: z.string().trim().optional().default(''),
  category: z.string().trim().min(2, 'دسته‌بندی الزامی است.'),
  tags_text: z.string().optional().default(''),
  author_name: z.string().trim().min(2),
  reading_time_minutes: z.coerce.number().int().min(1).max(120).default(5),
  meta_title: z.string().trim().max(160).optional().default(''),
  meta_description: z.string().trim().max(320).optional().default(''),
  meta_keywords: z.string().trim().max(300).optional().default(''),
  is_published: z.boolean().default(true),
});

export type ArticleFormValues = z.input<typeof articleFormSchema>;

export const bannerFormSchema = z.object({
  image_url: z.string().trim().min(2, 'آدرس تصویر بنر الزامی است.'),
  target_url: z.string().trim().min(1, 'لینک مقصد بنر الزامی است.'),
  alt_fa: z.string().trim().min(2, 'متن جایگزین (Alt) فارسی الزامی است.'),
  alt_en: z.string().trim().optional().default(''),
  badge_fa: z.string().trim().optional().default(''),
  badge_en: z.string().trim().optional().default(''),
  title_fa: z.string().trim().optional().default(''),
  title_en: z.string().trim().optional().default(''),
  subtitle_fa: z.string().trim().optional().default(''),
  subtitle_en: z.string().trim().optional().default(''),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type BannerFormValues = z.input<typeof bannerFormSchema>;

const optionalSocialUrl = z
  .string()
  .trim()
  .refine(
    (v) => !v || /^https?:\/\//i.test(v),
    'لینک باید با https:// یا http:// آغاز شود.'
  )
  .optional()
  .default('');

export const teamMemberFormSchema = z.object({
  full_name_fa: z.string().trim().min(2, 'نام و نام خانوادگی همکار الزامی است.'),
  full_name_en: z.string().trim().optional().default(''),
  role_fa: z.string().trim().min(2, 'سمت شغلی الزامی است.'),
  role_en: z.string().trim().optional().default(''),
  bio_fa: z.string().trim().optional().default(''),
  bio_en: z.string().trim().optional().default(''),
  avatar_url: z.string().trim().optional().default(''),
  linkedin_url: optionalSocialUrl,
  instagram_url: optionalSocialUrl,
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type TeamMemberFormValues = z.input<typeof teamMemberFormSchema>;
