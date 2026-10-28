import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import apiClient from '../../lib/axios';
import { productFormSchema, type ProductFormValues } from '../../schemas/forms';
import { useToastStore } from '../../store/useToastStore';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { LoadingState } from '../../components/common/UiStates';
import type { ApiSuccessResponse, Product } from '../../types';

export function AdminProductsPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      slug: '',
      title_fa: '',
      title_en: '',
      summary_fa: '',
      summary_en: '',
      description_fa: '',
      description_en: '',
      category: 'enterprise-ai',
      badge: '',
      image_url: '/banners/banner-1.jpg',
      features_text: '',
      target_sector: 'enterprise',
      isic_code: '620101',
      demo_available: true,
      is_featured: false,
      is_published: true,
      sort_order: 1,
    },
  });

  const imageUrl = watch('image_url') || '';

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await apiClient.get<ApiSuccessResponse<Product[]>>(
        '/products?all=true&limit=100'
      );
      setProducts(res.data.data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در دریافت محصولات',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openCreate() {
    setEditing(null);
    reset({
      slug: '',
      title_fa: '',
      title_en: '',
      summary_fa: '',
      summary_en: '',
      description_fa: '',
      description_en: '',
      category: 'enterprise-ai',
      badge: '',
      image_url: '/banners/banner-1.jpg',
      features_text: '',
      target_sector: 'enterprise',
      isic_code: '620101',
      demo_available: true,
      is_featured: false,
      is_published: true,
      sort_order: products.length + 1,
    });
    setFormOpen(true);
  }

  function openEdit(item: Product) {
    setEditing(item);
    reset({
      slug: item.slug,
      title_fa: item.title_fa,
      title_en: item.title_en,
      summary_fa: item.summary_fa,
      summary_en: item.summary_en,
      description_fa: item.description_fa,
      description_en: item.description_en,
      category: item.category,
      badge: item.badge,
      image_url: item.image_url,
      features_text: item.features.join('\n'),
      target_sector: item.target_sector,
      isic_code: item.isic_code,
      demo_available: item.demo_available,
      is_featured: item.is_featured,
      is_published: item.is_published,
      sort_order: item.sort_order,
    });
    setFormOpen(true);
  }

  async function onSubmit(values: ProductFormValues) {
    const features = (values.features_text || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...values,
      features,
    };

    try {
      if (editing) {
        await apiClient.put(`/products/${editing.id}`, payload);
        addToast('محصول با موفقیت ویرایش شد.', 'success');
      } else {
        await apiClient.post('/products', payload);
        addToast('محصول جدید با موفقیت ثبت شد.', 'success');
      }
      setFormOpen(false);
      setEditing(null);
      loadProducts();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در ذخیره محصول',
        'error'
      );
    }
  }

  async function handleDelete(item: Product) {
    if (!window.confirm(`آیا از حذف محصول «${item.title_fa}» اطمینان دارید؟`)) {
      return;
    }
    try {
      await apiClient.delete(`/products/${item.id}`);
      addToast('محصول حذف شد.', 'info');
      loadProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'خطا در حذف', 'error');
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.18rem, 2.4vw, 1.35rem)' }}>
            مدیریت محصولات و راهکارها
          </h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>محصول جدید</span>
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
              {editing ? `ویرایش: ${editing.title_fa}` : 'افزودن محصول جدید'}
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
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">عنوان فارسی محصول *</label>
                <input className="form-input" {...register('title_fa')} />
                {errors.title_fa && (
                  <span className="form-error">{errors.title_fa.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">اسلاگ یکتا (URL Slug) *</label>
                <input
                  dir="ltr"
                  className="form-input mono"
                  placeholder="vira-custom-ai"
                  {...register('slug')}
                />
                {errors.slug && (
                  <span className="form-error">{errors.slug.message}</span>
                )}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">عنوان انگلیسی (اختیاری)</label>
                <input dir="ltr" className="form-input" {...register('title_en')} />
              </div>

              <div className="form-group">
                <label className="form-label">نشان برجسته (Badge)</label>
                <input
                  className="form-input"
                  placeholder="مثلاً: پرفروش سازمانی"
                  {...register('badge')}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">دسته‌بندی</label>
                <select className="form-select" {...register('category')}>
                  <option value="enterprise-ai">هوش مصنوعی سازمانی</option>
                  <option value="industrial-ai">اتوماسیون صنعتی هوشمند</option>
                  <option value="data-analytics">تحلیل داده و هوش تجاری</option>
                  <option value="infrastructure">زیرساخت و شبکه</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">بخش هدف</label>
                <select className="form-select" {...register('target_sector')}>
                  <option value="enterprise">شرکت‌ها و هلدینگ‌ها</option>
                  <option value="government">ادارات و سازمان‌های دولتی</option>
                  <option value="industrial">صنایع و کارخانجات</option>
                  <option value="infrastructure">مراکز داده و شبکه</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">کد آیسیک اساسنامه</label>
                <input dir="ltr" className="form-input mono" {...register('isic_code')} />
              </div>
            </div>

            <ImageUploadField
              label="تصویر محصول"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
            />

            <div className="form-group">
              <label className="form-label">خلاصه معرفی فارسی *</label>
              <textarea rows={2} className="form-textarea" {...register('summary_fa')} />
              {errors.summary_fa && (
                <span className="form-error">{errors.summary_fa.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">توضیحات فنی کامل فارسی *</label>
              <textarea
                rows={5}
                className="form-textarea"
                {...register('description_fa')}
              />
              {errors.description_fa && (
                <span className="form-error">{errors.description_fa.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                ویژگی‌های کلیدی (هر خط یک ویژگی)
              </label>
              <textarea
                rows={4}
                className="form-textarea"
                placeholder="استقرار بومی بدون اینترنت خارجی&#10;کنترل دسترسی نقش‌محور"
                {...register('features_text')}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <input type="checkbox" {...register('is_published')} />
                <span>منتشر شده در سایت</span>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <input type="checkbox" {...register('is_featured')} />
                <span>نمایش در محصولات برگزیده صفحه اصلی</span>
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <input type="checkbox" {...register('demo_available')} />
                <span>امکان درخواست دمو</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره محصول'}
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
        <div className="card data-table-wrap data-table--cards">
          <table className="data-table">
            <thead>
              <tr>
                <th>عنوان محصول</th>
                <th>اسلاگ</th>
                <th>دسته</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td data-label="عنوان محصول">
                    <strong>{p.title_fa}</strong>
                    {p.is_featured && (
                      <span
                        className="badge"
                        style={{ marginInlineStart: '0.5rem', fontSize: '0.7rem' }}
                      >
                        برگزیده
                      </span>
                    )}
                  </td>
                  <td data-label="اسلاگ" className="mono">
                    {p.slug}
                  </td>
                  <td data-label="دسته">{p.category}</td>
                  <td data-label="وضعیت">
                    {p.is_published ? 'منتشرشده' : 'پیش‌نویس'}
                  </td>
                  <td data-label="عملیات">
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="ویرایش محصول"
                        onClick={() => openEdit(p)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="حذف محصول"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
