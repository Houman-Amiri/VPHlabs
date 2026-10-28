import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import apiClient from '../../lib/axios';
import { bannerFormSchema, type BannerFormValues } from '../../schemas/forms';
import { useSiteStore } from '../../store/useSiteStore';
import { useToastStore } from '../../store/useToastStore';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { LoadingState } from '../../components/common/UiStates';
import type { ApiSuccessResponse, Banner } from '../../types';

export function AdminBannersPage() {
  const addToast = useToastStore((s) => s.addToast);
  const fetchBootstrap = useSiteStore((s) => s.fetchBootstrap);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      image_url: '/banners/banner-1.jpg',
      target_url: '/products',
      alt_fa: '',
      alt_en: '',
      badge_fa: '',
      badge_en: '',
      title_fa: '',
      title_en: '',
      subtitle_fa: '',
      subtitle_en: '',
      sort_order: 1,
      is_active: true,
    },
  });

  const imageUrl = watch('image_url') || '';

  async function loadBanners() {
    setLoading(true);
    try {
      const res = await apiClient.get<ApiSuccessResponse<Banner[]>>(
        '/banners?all=true'
      );
      setBanners(res.data.data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در دریافت بنرها',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  function openCreate() {
    setEditing(null);
    reset({
      image_url: '/banners/banner-1.jpg',
      target_url: '/products',
      alt_fa: 'بنر فعالیت‌های اساسنامه ویرا پردازش هومان',
      alt_en: 'VPH Labs Charter Activities Banner',
      badge_fa: 'موضوع فعالیت اساسنامه — ویرا پردازش هومان',
      badge_en: 'Corporate Charter Scope — VPH Labs',
      title_fa: '',
      title_en: '',
      subtitle_fa: '',
      subtitle_en: '',
      sort_order: banners.length + 1,
      is_active: true,
    });
    setFormOpen(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    reset({
      image_url: b.image_url,
      target_url: b.target_url,
      alt_fa: b.alt_fa,
      alt_en: b.alt_en,
      badge_fa: b.badge_fa || '',
      badge_en: b.badge_en || '',
      title_fa: b.title_fa || '',
      title_en: b.title_en || '',
      subtitle_fa: b.subtitle_fa || '',
      subtitle_en: b.subtitle_en || '',
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    setFormOpen(true);
  }

  async function onSubmit(values: BannerFormValues) {
    try {
      if (editing) {
        await apiClient.put(`/banners/${editing.id}`, values);
        addToast('اسلاید بنر بروزرسانی شد.', 'success');
      } else {
        await apiClient.post('/banners', values);
        addToast('اسلاید جدید به بنر صفحه اصلی افزوده شد.', 'success');
      }
      setFormOpen(false);
      setEditing(null);
      await loadBanners();
      await fetchBootstrap(true);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'خطا در ذخیره بنر', 'error');
    }
  }

  async function handleDelete(b: Banner) {
    if (!window.confirm('آیا از حذف این بنر اطمینان دارید؟')) return;
    try {
      await apiClient.delete(`/banners/${b.id}`);
      addToast('بنر حذف شد.', 'info');
      await loadBanners();
      await fetchBootstrap(true);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'خطا در حذف', 'error');
    }
  }

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
            مدیریت بنرهای اسلایدر صفحه اصلی
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
            }}
          >
            ویرایش تصویر، لینک مقصد و متن‌های مبتنی بر فعالیت‌های اساسنامه روی هر بنر
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>افزودن اسلاید</span>
        </button>
      </div>

      {formOpen && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>
              {editing ? 'ویرایش اسلاید بنر' : 'افزودن اسلاید بنر جدید'}
            </h2>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setFormOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <ImageUploadField
              label="تصویر عریض بنر *"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
            />
            {errors.image_url && (
              <span className="form-error">{errors.image_url.message}</span>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">برچسب بالای تیتر بنر (فارسی)</label>
                <input
                  className="form-input"
                  placeholder="مثلاً: هوش مصنوعی و مهندسی نرم‌افزار سفارشی"
                  {...register('badge_fa')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">برچسب بالای تیتر (انگلیسی)</label>
                <input
                  dir="ltr"
                  className="form-input"
                  placeholder="Enterprise AI & Custom Software"
                  {...register('badge_en')}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">تیتر اصلی روی بنر (فارسی)</label>
                <input
                  className="form-input"
                  placeholder="تیتر مبتنی بر فعالیت‌های اساسنامه..."
                  {...register('title_fa')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">تیتر اصلی روی بنر (انگلیسی)</label>
                <input
                  dir="ltr"
                  className="form-input"
                  placeholder="Main banner headline..."
                  {...register('title_en')}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">توضیحات زیر تیتر بنر (فارسی)</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="شرح فعالیت اساسنامه روی اسلاید..."
                  {...register('subtitle_fa')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">توضیحات زیر تیتر (انگلیسی)</label>
                <textarea
                  dir="ltr"
                  rows={3}
                  className="form-textarea"
                  placeholder="Banner subtitle..."
                  {...register('subtitle_en')}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  لینک مقصد هنگام کلیک روی بنر *
                </label>
                <input
                  dir="ltr"
                  className="form-input mono"
                  placeholder="/products"
                  {...register('target_url')}
                />
                {errors.target_url && (
                  <span className="form-error">{errors.target_url.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">ترتیب نمایش</label>
                <input
                  type="number"
                  className="form-input"
                  {...register('sort_order')}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  متن جایگزین (Alt) فارسی برای سئو *
                </label>
                <input className="form-input" {...register('alt_fa')} />
                {errors.alt_fa && (
                  <span className="form-error">{errors.alt_fa.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">متن جایگزین انگلیسی</label>
                <input dir="ltr" className="form-input" {...register('alt_en')} />
              </div>
            </div>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <input type="checkbox" {...register('is_active')} />
              <span>فعال در اسلایدر صفحه اصلی</span>
            </label>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                ذخیره اسلاید
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFormOpen(false)}
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid-2">
          {banners.map((b) => (
            <div key={b.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
                <img
                  src={b.image_url}
                  alt={b.alt_fa}
                  style={{
                    width: '100%',
                    aspectRatio: '21 / 9',
                    objectFit: 'cover',
                    borderRadius: '0.65rem',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
              </div>

              {b.badge_fa && (
                <div style={{ marginBottom: '0.4rem' }}>
                  <span className="badge">{b.badge_fa}</span>
                </div>
              )}

              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  marginBottom: '0.35rem',
                }}
              >
                {b.title_fa || b.alt_fa}
              </div>

              {b.subtitle_fa && (
                <p
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.84rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {b.subtitle_fa}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                  paddingTop: '0.7rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  className="mono"
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                >
                  {b.target_url} • {b.is_active ? 'فعال' : 'غیرفعال'} (#
                  {b.sort_order})
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => openEdit(b)}
                  >
                    <Edit2 size={15} />
                    <span>ویرایش</span>
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ color: 'var(--accent-danger)' }}
                    onClick={() => handleDelete(b)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
