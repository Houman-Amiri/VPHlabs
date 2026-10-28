import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LoadingState } from '../common/UiStates';

/**
 * Phase 5.3: React route guard matching Express `requireAuth`.
 */
export function RequireAuth() {
  const { user, isLoading, isInitialized, checkSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      checkSession(true);
    }
  }, [isInitialized, checkSession]);

  if (!isInitialized || isLoading) {
    return (
      <div className="container page-section">
        <LoadingState message="در حال بررسی نشست امنیتی..." />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

/**
 * Phase 5.3: React role guard matching Express `requireRole(role)`.
 */
export function RequireRole({
  role,
  children,
}: {
  role: 'admin' | 'editor' | 'viewer';
  children?: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== role) {
    return (
      <div className="container page-section">
        <div className="card" role="alert">
          <h2 style={{ marginTop: 0 }}>عدم دسترسی (۴۰۳)</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            حساب کاربری شما دارای نقش لازم ({role}) برای مشاهده این بخش نیست.
          </p>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
