const { z } = require('zod');

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => !v || /^https?:\/\//i.test(v),
    'لینک شبکه اجتماعی باید با http:// یا https:// آغاز شود.'
  )
  .optional()
  .default('');

const createTeamMemberSchema = z.object({
  full_name_fa: z
    .string()
    .trim()
    .min(2, 'نام و نام خانوادگی همکار الزامی است.')
    .max(140),
  full_name_en: z.string().trim().max(140).optional().default(''),
  role_fa: z.string().trim().min(2, 'سمت شغلی الزامی است.').max(160),
  role_en: z.string().trim().max(160).optional().default(''),
  bio_fa: z.string().trim().max(1200).optional().default(''),
  bio_en: z.string().trim().max(1200).optional().default(''),
  avatar_url: z.string().trim().max(500).optional().default(''),
  linkedin_url: optionalUrlSchema,
  instagram_url: optionalUrlSchema,
  sort_order: z.coerce.number().int().min(0).max(9999).optional().default(0),
  is_active: z.boolean().optional().default(true),
});

const updateTeamMemberSchema = createTeamMemberSchema.partial();

module.exports = {
  createTeamMemberSchema,
  updateTeamMemberSchema,
};
