import { useEffect, useState } from 'react';
import { Save, Search } from 'lucide-react';
import apiClient from '../../lib/axios';
import { useSiteStore } from '../../store/useSiteStore';
import { useToastStore } from '../../store/useToastStore';
import { LoadingState } from '../../components/common/UiStates';
import type {
  ApiSuccessResponse,
  ServiceItem,
  SiteContentItem,
} from '../../types';

const PAGE_SECTIONS = [
  { key: 'all', label: 'همه صفحات سایت' },
  { key: 'home', label: 'صفحه اصلی (H1 و بخش‌ها)' },
  { key: 'products', label: 'صفحه محصولات (H1 و توضیحات)' },
  { key: 'services', label: 'صفحه خدمات (H1 و توضیحات)' },
  { key: 'articles', label: 'صفحه مقالات (H1 و توضیحات)' },
  { key: 'about', label: 'صفحه درباره ما (H1 و بخش‌ها)' },
  { key: 'contact', label: 'صفحه تماس و مشاوره (H1 و نشانی)' },
  { key: 'company', label: 'هدر، فوتر و اطلاعات پایه شرکت' },
];

export function AdminContentPage() {
  const addToast = useToastStore((s) => s.addToast);
  const fetchBootstrap = useSiteStore((s) => s.fetchBootstrap);

  const [items, setItems] = useState<SiteContentItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'texts' | 'services'>('texts');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [contentRes, svcRes] = await Promise.all([
        apiClient.get<ApiSuccessResponse<SiteContentItem[]>>('/content'),
        apiClient.get<ApiSuccessResponse<ServiceItem[]>>('/services?all=true'),
      ]);
      setItems(contentRes.data.data);
      setServices(svcRes.data.data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در دریافت محتوای صفحات',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function updateItemField(
    id: number,
    field: 'value_fa' | 'value_en',
    val: string
  ) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  }

  async function handleSaveAllTexts() {
    setSaving(true);
    try {
      await apiClient.put('/content/bulk', {
        items: items.map((it) => ({
          content_key: it.content_key,
          section: it.section,
          label_fa: it.label_fa,
          value_fa: it.value_fa,
          value_en: it.value_en,
        })),
      });
      await fetchBootstrap(true);
      addToast(
        'تمامی تیترها (H1) و متون صفحات با موفقیت ذخیره و در سایت اعمال شد.',
        'success'
      );
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در ذخیره متون',
        'error'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveService(svc: ServiceItem) {
    try {
      await apiClient.put(`/services/${svc.id}`, svc);
      await fetchBootstrap(true);
      addToast(`خدمت «${svc.title_fa}» بروزرسانی شد.`, 'success');
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در بروزرسانی خدمت',
        'error'
      );
    }
  }

  if (loading) return <LoadingState />;

  const qLower = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter((it) => {
    const matchesSection =
      sectionFilter === 'all' || it.section === sectionFilter;
    if (!matchesSection) return false;
    if (!qLower) return true;
    return (
      it.label_fa.toLowerCase().includes(qLower) ||
      it.content_key.toLowerCase().includes(qLower) ||
      it.value_fa.toLowerCase().includes(qLower) ||
      it.value_en.toLowerCase().includes(qLower)
    );
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.35rem' }}>
            مدیریت کامل متون تمامی صفحات (H1، توضیحات و خدمات اساسنامه)
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            تیتر اصلی (H1)، زیرتیتر، توضیحات، آمارها، نشانی و متون تمامی صفحات وب‌سایت از این بخش قابل ویرایش است.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'texts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('texts')}
          >
            تیترها و متون صفحات سایت
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('services')}
          >
            ۱۲ خدمت رسمی اساسنامه
          </button>
        </div>
      </div>

      {activeTab === 'texts' ? (
        <div className="card">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {PAGE_SECTIONS.map((sec) => (
                <button
                  key={sec.key}
                  type="button"
                  className={`btn ${
                    sectionFilter === sec.key ? 'btn-primary' : 'btn-secondary'
                  }`}
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                  onClick={() => setSectionFilter(sec.key)}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 260px',
                  maxWidth: '420px',
                }}
              >
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    insetInlineStart: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="search"
                  className="form-input"
                  style={{ paddingInlineStart: '2.35rem' }}
                  placeholder="جستجو در تیترها، کلیدها یا متون صفحات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                disabled={saving}
                onClick={handleSaveAllTexts}
              >
                <Save size={16} />
                <span>
                  {saving ? 'در حال ذخیره...' : 'ذخیره یکپارچه تمامی تغییرات'}
                </span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredItems.map((it) => {
              const isMultiline =
                it.value_fa.length > 85 ||
                it.content_key.includes('subtitle') ||
                it.content_key.includes('body') ||
                it.content_key.includes('quote') ||
                it.content_key.includes('about');

              return (
                <div
                  key={it.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <strong style={{ fontSize: '0.92rem' }}>
                      {it.label_fa || it.content_key}
                    </strong>
                    <span
                      className="mono"
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {it.content_key}
                    </span>
                  </div>

                  <div className="grid-2" style={{ gap: '0.85rem' }}>
                    <div>
                      <label
                        className="form-label"
                        style={{ fontSize: '0.78rem' }}
                      >
                        مقدار فارسی
                      </label>
                      {isMultiline ? (
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={it.value_fa}
                          onChange={(e) =>
                            updateItemField(it.id, 'value_fa', e.target.value)
                          }
                        />
                      ) : (
                        <input
                          className="form-input"
                          value={it.value_fa}
                          onChange={(e) =>
                            updateItemField(it.id, 'value_fa', e.target.value)
                          }
                        />
                      )}
                    </div>
                    <div>
                      <label
                        className="form-label"
                        style={{ fontSize: '0.78rem' }}
                      >
                        مقدار انگلیسی (اختیاری)
                      </label>
                      {isMultiline ? (
                        <textarea
                          dir="ltr"
                          rows={2}
                          className="form-textarea"
                          value={it.value_en}
                          onChange={(e) =>
                            updateItemField(it.id, 'value_en', e.target.value)
                          }
                        />
                      ) : (
                        <input
                          dir="ltr"
                          className="form-input"
                          value={it.value_en}
                          onChange={(e) =>
                            updateItemField(it.id, 'value_en', e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {services.map((svc, idx) => (
            <div key={svc.id} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.85rem',
                }}
              >
                <span className="badge mono">ISIC {svc.isic_code}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.84rem' }}
                  onClick={() => handleSaveService(svc)}
                >
                  <Save size={14} />
                  <span>ذخیره این بند</span>
                </button>
              </div>

              <div className="grid-2" style={{ gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">عنوان خدمت (فارسی)</label>
                  <input
                    className="form-input"
                    value={svc.title_fa}
                    onChange={(e) => {
                      const val = e.target.value;
                      setServices((prev) =>
                        prev.map((s, i) =>
                          i === idx ? { ...s, title_fa: val } : s
                        )
                      );
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">کاربرد هوش مصنوعی ویرا</label>
                  <input
                    className="form-input"
                    value={svc.ai_application_fa}
                    onChange={(e) => {
                      const val = e.target.value;
                      setServices((prev) =>
                        prev.map((s, i) =>
                          i === idx ? { ...s, ai_application_fa: val } : s
                        )
                      );
                    }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">شرح کامل خدمت</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={svc.description_fa}
                  onChange={(e) => {
                    const val = e.target.value;
                    setServices((prev) =>
                      prev.map((s, i) =>
                        i === idx ? { ...s, description_fa: val } : s
                      )
                    );
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
