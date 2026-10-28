import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Sliders,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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

  const activeLink =
    links.find((item) =>
      item.end
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to)
    ) || links[0];

  return (
    <div className="container admin-shell">
      <div className="card admin-mobile-bar">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>
            {activeLink.label}
          </div>
          <div
            className="mono"
            style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}
          >
            {user?.name || 'مدیر سیستم'} • {user?.email}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', flexShrink: 0 }}
          aria-expanded={menuOpen}
          aria-label="باز کردن منوی پنل مدیریت"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
          <span>{menuOpen ? 'بستن منو' : 'منوی مدیریت'}</span>
        </button>
      </div>

      <aside className={`admin-sidebar${menuOpen ? ' is-open' : ''}`}>
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
                onClick={() => setMenuOpen(false)}
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

      <section style={{ minWidth: 0 }}>
        <Outlet />
      </section>
    </div>
  );
}
