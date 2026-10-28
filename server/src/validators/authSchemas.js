const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('فرمت ایمیل معتبر نیست.')
    .max(160),
  password: z
    .string()
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.')
    .max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'رمز عبور فعلی الزامی است.').max(128),
  newPassword: z
    .string()
    .min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.')
    .max(128),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
};
