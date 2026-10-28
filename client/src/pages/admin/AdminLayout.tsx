import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FileText,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  Sliders,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    addToast('از حساب مدیریت خارج شدید.', 'info');
    navigate('/');
  }

  const links = [
    { to: '/admin', label: 'پیشخوان مدیریت', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'محصولات هوشمند', icon: Package },
    { to: '/admin/articles', label: 'مقالات و جستارها (سئو)', icon: FileText },
    { to: '/admin/banners', label: 'بنرهای اسلایدر صفحه اصلی', icon: Image },
    { to: '/admin/team', label: 'معرفی همکاران (درباره ما)', icon: Users },
    { to: '/admin/content', label: 'متن صفحات و خدمات اساسنامه', icon: Sliders },
    { to: '/admin/messages', label: 'پیام‌ها و درخواست‌های مشاوره', icon: Inbox },
  ];

  return (
    <div className="container admin-shell">
      <aside className="admin-sidebar">
        <div
          style={{
            padding: '0.5rem 0.65rem 1rem',
            marginBottom: '0.75rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>
            {user?.name || 'مدیر سیستم'}
          </div>
          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </div>
        </div>

        <nav aria-label="منوی پنل مدیریت">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-link${isActive ? ' active' : ''}`
                }
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="btn btn-danger"
          style={{ width: '100%', marginTop: '1rem' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>خروج از پنل</span>
        </button>
      </aside>

      <section>
        <Outlet />
      </section>
    </div>
  );
}
