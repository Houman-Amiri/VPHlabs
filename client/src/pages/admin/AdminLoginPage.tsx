import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import {
  adminLoginFormSchema,
  type AdminLoginFormValues,
} from '../../schemas/forms';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { SeoHead } from '../../components/common/SeoHead';

function sanitizeCredentialInput(val: string) {
  return String(val ?? '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g, '')
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .trim();
}

export function AdminLoginPage() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(values: AdminLoginFormValues) {
    setServerError(null);
    try {
      const cleanedEmail = sanitizeCredentialInput(values.email);
      const cleanedPassword = sanitizeCredentialInput(values.password);
      await login(cleanedEmail, cleanedPassword);
      addToast('خوش آمدید! ورود با موفقیت انجام شد.', 'success');
      const target =
        (location.state as { from?: string } | null)?.from || '/admin';
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'ورود ناموفق بود.'
      );
    }
  }

  return (
    <div className="container page-section">
      <SeoHead title="ورود به پنل مدیریت | ویرا پردازش هومان" />

      <div className="card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.85rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-strong)',
              color: 'var(--accent-primary)',
              display: 'grid',
              placeItems: 'center',
              marginInline: 'auto',
              marginBottom: '0.85rem',
            }}
          >
            <Lock size={22} />
          </div>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem' }}>
            ورود به پنل مدیریت ویرا
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            سامانه یکپارچه مدیریت پویای محتوا، محصولات و مقالات
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 0.9rem',
              marginBottom: '1rem',
              borderRadius: '0.6rem',
              background: 'rgba(248, 113, 113, 0.12)',
              border: '1px solid var(--border-strong)',
              borderColor: 'rgba(248, 113, 113, 0.35)',
              color: 'var(--accent-danger)',
              fontSize: '0.86rem',
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="admin-email" className="form-label">
              نام کاربری مدیر
            </label>
            <input
              id="admin-email"
              type="text"
              dir="ltr"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="form-input"
              placeholder="VPHAdmin"
              {...register('email')}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">
              رمز عبور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="form-input"
                style={{ paddingRight: '2.85rem', textAlign: 'left' }}
                placeholder="••••••••••••"
                {...register('password')}
              />
              <button
                type="button"
                aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.55rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'در حال احراز هویت...' : 'ورود امن به پنل'}
          </button>
        </form>
      </div>
    </div>
  );
}
