const { z } = require('zod');

/**
 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits to standard ASCII digits.
 */
function normalizeDigits(str) {
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[\s()-]/g, '');
}

const createContactSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'نام و نام خانوادگی باید حداقل ۲ کاراکتر باشد.')
    .max(120),
  organization: z.string().trim().max(160).optional().default(''),
  email: z.string().trim().email('فرمت ایمیل وارد شده معتبر نیست.').max(160),
  phone: z
    .string()
    .trim()
    .transform(normalizeDigits)
    .refine(
      (val) => /^(\+98|0098|0)?9\d{9}$/.test(val) || /^0\d{9,10}$/.test(val),
      'شماره تماس معتبر ایران (موبایل یا تلفن ثابت با کد شهر) وارد کنید.'
    ),
  subject: z.string().trim().min(3, 'موضوع پیام الزامی است.').max(200),
  department: z
    .enum([
      'ai-consulting',
      'custom-software',
      'industrial-automation',
      'network-infrastructure',
      'support',
    ])
    .default('ai-consulting'),
  product_id: z.coerce.number().int().positive().nullable().optional(),
  message: z
    .string()
    .trim()
    .min(10, 'متن پیام باید حداقل ۱۰ کاراکتر باشد.')
    .max(5000),
});

const updateContactStatusSchema = z.object({
  status: z.enum(['unread', 'read', 'responded', 'archived']),
});

module.exports = {
  createContactSchema,
  updateContactStatusSchema,
  normalizeDigits,
};
