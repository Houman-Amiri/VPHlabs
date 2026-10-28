import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../lib/axios';
import { formatLocaleDate } from '../../lib/formatters';
import { articleFormSchema, type ArticleFormValues } from '../../schemas/forms';
import { useToastStore } from '../../store/useToastStore';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { LoadingState } from '../../components/common/UiStates';
import type { ApiSuccessResponse, Article } from '../../types';

export function AdminArticlesPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      slug: '',
      title_fa: '',
      title_en: '',
      excerpt_fa: '',
      excerpt_en: '',
      content_fa: '',
      content_en: '',
      cover_image: '/banners/banner-1.jpg',
      category: 'هوش مصنوعی سازمانی',
      tags_text: '',
      author_name: 'واحد تحقیق و توسعه ویرا پردازش هومان',
      reading_time_minutes: 5,
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_published: true,
    },
  });

  const coverImage = watch('cover_image') || '';

  async function loadArticles() {
    setLoading(true);
    try {
      const res = await apiClient.get<ApiSuccessResponse<Article[]>>(
        '/articles?all=true&limit=100'
      );
      setArticles(res.data.data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در دریافت مقالات',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  function openCreate() {
    setEditing(null);
    reset({
      slug: '',
      title_fa: '',
      title_en: '',
      excerpt_fa: '',
      excerpt_en: '',
      content_fa: '',
      content_en: '',
      cover_image: '/banners/banner-1.jpg',
      category: 'هوش مصنوعی سازمانی',
      tags_text: 'هوش مصنوعی سازمانی, تحول دیجیتال',
      author_name: 'واحد تحقیق و توسعه ویرا پردازش هومان',
      reading_time_minutes: 5,
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_published: true,
    });
    setFormOpen(true);
  }

  function openEdit(item: Article) {
    setEditing(item);
    reset({
      slug: item.slug,
      title_fa: item.title_fa,
      title_en: item.title_en,
      excerpt_fa: item.excerpt_fa,
      excerpt_en: item.excerpt_en,
      content_fa: item.content_fa,
      content_en: item.content_en,
      cover_image: item.cover_image,
      category: item.category,
      tags_text: item.tags.join(', '),
      author_name: item.author_name,
      reading_time_minutes: item.reading_time_minutes,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      meta_keywords: item.meta_keywords,
      is_published: item.is_published,
    });
    setFormOpen(true);
  }

  async function onSubmit(values: ArticleFormValues) {
    const tags = (values.tags_text || '')
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...values,
      tags,
    };

    try {
      if (editing) {
        await apiClient.put(`/articles/${editing.id}`, payload);
        addToast('مقاله با موفقیت ویرایش شد.', 'success');
      } else {
        await apiClient.post('/articles', payload);
        addToast('مقاله جدید با موفقیت منتشر شد.', 'success');
      }
      setFormOpen(false);
      setEditing(null);
      loadArticles();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در ذخیره مقاله',
        'error'
      );
    }
  }

  async function handleDelete(item: Article) {
    if (!window.confirm(`آیا از حذف مقاله «${item.title_fa}» اطمینان دارید؟`)) {
      return;
    }
    try {
      await apiClient.delete(`/articles/${item.id}`);
      addToast('مقاله حذف شد.', 'info');
      loadArticles();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'خطا در حذف', 'error');
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.35rem' }}>
          مدیریت مقالات و جستارهای تخصصی (سئو فارسی)
        </h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>نگارش مقاله جدید</span>
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
              {editing ? `ویرایش مقاله: ${editing.title_fa}` : 'نگارش مقاله و جستار جدید'}
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
                <label className="form-label">عنوان مقاله (H1 سئو) *</label>
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
                  placeholder="enterprise-ai-iran-guide"
                  {...register('slug')}
                />
                {errors.slug && (
                  <span className="form-error">{errors.slug.message}</span>
                )}
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">دسته‌بندی موضوعی *</label>
                <input className="form-input" {...register('category')} />
              </div>

              <div className="form-group">
                <label className="form-label">نام نویسنده / واحد</label>
                <input className="form-input" {...register('author_name')} />
              </div>

              <div className="form-group">
                <label className="form-label">زمان مطالعه (دقیقه)</label>
                <input
                  type="number"
                  className="form-input"
                  {...register('reading_time_minutes')}
                />
              </div>
            </div>

            <ImageUploadField
              label="تصویر شاخص مقاله (Cover Image)"
              value={coverImage}
              onChange={(url) => setValue('cover_image', url)}
            />

            <div className="form-group">
              <label className="form-label">چکیده مقاله (نمایش در کارت‌ها و خلاصه) *</label>
              <textarea rows={2} className="form-textarea" {...register('excerpt_fa')} />
              {errors.excerpt_fa && (
                <span className="form-error">{errors.excerpt_fa.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                متن کامل مقاله * (پشتیبانی از تیترهای Markdown با `## ` و `### `، لیست `- ` و بولد `**متن**`)
              </label>
              <textarea
                rows={11}
                className="form-textarea"
                {...register('content_fa')}
              />
              {errors.content_fa && (
                <span className="form-error">{errors.content_fa.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">برچسب‌ها (جداشده با ویرگول فارسی یا انگلیسی)</label>
              <input
                className="form-input"
                placeholder="هوش مصنوعی سازمانی، RAG فارسی، اتوماسیون"
                {...register('tags_text')}
              />
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: '0.8rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.25rem',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.92rem' }}>
                تنظیمات تخصصی سئو (Meta Title / Meta Description / Keywords)
              </strong>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">عنوان متا (حداکثر ۶۰-۷۰ کاراکتر)</label>
                  <input className="form-input" {...register('meta_title')} />
                </div>
                <div className="form-group">
                  <label className="form-label">کلمات کلیدی سئو</label>
                  <input className="form-input" {...register('meta_keywords')} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">توضیحات متا گوگل (Meta Description)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  {...register('meta_description')}
                />
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
              <input type="checkbox" {...register('is_published')} />
              <span>انتشار عمومی و ثبت خودکار در Sitemap.xml</span>
            </label>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره و انتشار مقاله'}
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
        <div className="card data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>عنوان مقاله</th>
                <th>دسته</th>
                <th>تاریخ</th>
                <th>بازدید / پسند</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art) => (
                <tr key={art.id}>
                  <td>
                    <strong>{art.title_fa}</strong>
                  </td>
                  <td>{art.category}</td>
                  <td>{formatLocaleDate(art.published_at, 'fa')}</td>
                  <td>
                    {art.views_count} / {art.likes_count}
                  </td>
                  <td>{art.is_published ? 'منتشرشده' : 'پیش‌نویس'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link
                        to={`/articles/${art.slug}`}
                        target="_blank"
                        className="icon-btn"
                        aria-label="مشاهده مقاله"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="ویرایش مقاله"
                        onClick={() => openEdit(art)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="حذف مقاله"
                        onClick={() => handleDelete(art)}
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
