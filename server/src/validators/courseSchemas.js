const { z } = require('zod');

const courseBaseObject = z.object({
  title_fa: z
    .string()
    .trim()
    .min(2, 'عنوان فارسی دوره آموزشی الزامی است.')
    .max(240),
  title_en: z.string().trim().max(240).optional().default(''),
  summary_fa: z.string().trim().max(2000).optional().default(''),
  summary_en: z.string().trim().max(2000).optional().default(''),
  duration: z.string().trim().max(100).optional().default(''),
  level_fa: z.string().trim().max(120).optional().default(''),
  syllabus_fa: z
    .array(z.string().trim().min(1).max(400))
    .min(1, 'حداقل یک سرفصل آموزشی وارد کنید.')
    .max(40),
  syllabus_en: z
    .array(z.string().trim().min(1).max(400))
    .max(40)
    .optional()
    .default([]),
  is_in_person: z.boolean().optional().default(true),
  is_online: z.boolean().optional().default(true),
  is_active: z.boolean().optional().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).optional().default(0),
});

const createCourseSchema = courseBaseObject.refine(
  (val) => val.is_in_person || val.is_online,
  {
    message: 'حداقل یکی از دو گزینه «حضوری» یا «آنلاین» باید انتخاب شود.',
    path: ['is_in_person'],
  }
);

const updateCourseSchema = courseBaseObject.partial();

module.exports = {
  createCourseSchema,
  updateCourseSchema,
};
