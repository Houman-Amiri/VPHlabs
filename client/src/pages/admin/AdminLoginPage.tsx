import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import {
  adminLoginFormSchema,
  type AdminLoginFormValues,
} from '../../schemas/forms';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { SeoHead } from '../../components/common/SeoHead';

export function AdminLoginPage() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

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
      await login(values.email, values.password);
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

      <div
        className="card"
        style={{ maxWidth: '440px', marginInline: 'auto', padding: '2.25rem' }}
      >
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
              border: '1px solid rgba(248, 113, 113, 0.35)',
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
              پست الکترونیک مدیر
            </label>
            <input
              id="admin-email"
              type="email"
              dir="ltr"
              autoComplete="username"
              className="form-input"
              placeholder="admin@vphlabs.com"
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
            <input
              id="admin-password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              className="form-input"
              placeholder="••••••••••••"
              {...register('password')}
            />
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
