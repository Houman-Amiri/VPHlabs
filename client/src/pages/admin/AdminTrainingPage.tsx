import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Edit3,
  GraduationCap,
  Laptop,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import apiClient from '../../lib/axios';
import { courseFormSchema, type CourseFormValues } from '../../schemas/forms';
import { useSiteStore } from '../../store/useSiteStore';
import { useToastStore } from '../../store/useToastStore';
import { LoadingState } from '../../components/common/UiStates';
import type { ApiSuccessResponse, CourseItem } from '../../types';

export function AdminTrainingPage() {
  const addToast = useToastStore((s) => s.addToast);
  const fetchBootstrap = useSiteStore((s) => s.fetchBootstrap);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CourseItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      is_in_person: true,
      is_online: true,
      is_active: true,
      sort_order: 1,
    },
  });

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await apiClient.get<ApiSuccessResponse<CourseItem[]>>(
        '/courses?all=true'
      );
      setCourses(res.data.data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در دریافت دوره‌های آموزشی',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function openCreate() {
    setEditing(null);
    reset({
      title_fa: '',
      title_en: '',
      summary_fa: '',
      summary_en: '',
      duration: '۲۴ ساعت آموزشی',
      level_fa: 'مقدماتی تا پیشرفته',
      syllabus_fa_text: '',
      syllabus_en_text: '',
      is_in_person: true,
      is_online: true,
      is_active: true,
      sort_order: courses.length + 1,
    });
    setShowForm(true);
  }

  function openEdit(course: CourseItem) {
    setEditing(course);
    reset({
      title_fa: course.title_fa,
      title_en: course.title_en || '',
      summary_fa: course.summary_fa || '',
      summary_en: course.summary_en || '',
      duration: course.duration || '',
      level_fa: course.level_fa || '',
      syllabus_fa_text: (course.syllabus_fa || []).join('\n'),
      syllabus_en_text: (course.syllabus_en || []).join('\n'),
      is_in_person: course.is_in_person,
      is_online: course.is_online,
      is_active: course.is_active,
      sort_order: course.sort_order,
    });
    setShowForm(true);
  }

  async function onSubmit(values: CourseFormValues) {
    const syllabus_fa = (values.syllabus_fa_text || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const syllabus_en = (values.syllabus_en_text || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title_fa: values.title_fa,
      title_en: values.title_en || '',
      summary_fa: values.summary_fa || '',
      summary_en: values.summary_en || '',
      duration: values.duration || '',
      level_fa: values.level_fa || '',
      syllabus_fa,
      syllabus_en,
      is_in_person: Boolean(values.is_in_person),
      is_online: Boolean(values.is_online),
      is_active: Boolean(values.is_active),
      sort_order: Number(values.sort_order) || 0,
    };

    try {
      if (editing) {
        await apiClient.put(`/courses/${editing.id}`, payload);
        addToast('دوره آموزشی با موفقیت بروزرسانی شد.', 'success');
      } else {
        await apiClient.post('/courses', payload);
        addToast('عنوان آموزشی جدید با موفقیت به سایت اضافه شد.', 'success');
      }
      setShowForm(false);
      await Promise.all([loadCourses(), fetchBootstrap(true)]);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در ذخیره دوره آموزشی',
        'error'
      );
    }
  }

  async function handleDelete(course: CourseItem) {
    if (!window.confirm(`آیا از حذف دوره «${course.title_fa}» اطمینان دارید؟`))
      return;
    try {
      await apiClient.delete(`/courses/${course.id}`);
      addToast('عنوان آموزشی حذف شد.', 'info');
      await Promise.all([loadCourses(), fetchBootstrap(true)]);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در حذف دوره آموزشی',
        'error'
      );
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1
            style={{
              margin: '0 0 0.25rem',
              fontSize: 'clamp(1.18rem, 2.4vw, 1.4rem)',
            }}
          >
            مدیریت دوره‌ها و عناوین آموزشی (صفحه آموزش)
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
            }}
          >
            افزودن، ویرایش و حذف عناوین آموزشی، سرفصل‌های دراپ‌داون و تنظیم تگ‌های برگزاری «حضوری» و «آنلاین»
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>افزودن عنوان آموزشی جدید</span>
        </button>
      </div>

      {showForm && (
        <div
          className="card"
          style={{
            marginBottom: '1.75rem',
            borderColor: 'var(--border-strong)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
              {editing
                ? `ویرایش دوره: ${editing.title_fa}`
                : 'ثبت عنوان و دوره آموزشی جدید'}
            </h2>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowForm(false)}
              aria-label="بستن فرم"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">عنوان دوره آموزشی (فارسی) *</label>
                <input className="form-input" {...register('title_fa')} />
                {errors.title_fa && (
                  <p className="field-error">{errors.title_fa.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  عنوان دوره آموزشی (معادل انگلیسی - اختیاری)
                </label>
                <input
                  dir="ltr"
                  className="form-input"
                  placeholder="e.g. Applied Enterprise AI & Prompt Engineering"
                  {...register('title_en')}
                />
              </div>
            </div>

            {/* 2 Checkboxes for حضوری and آنلاین Tags */}
            <div
              style={{
                padding: '1rem 1.15rem',
                borderRadius: '0.8rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                marginBottom: '1.15rem',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  marginBottom: '0.65rem',
                  color: 'var(--accent-primary)',
                }}
              >
                تگ‌های نحوه برگزاری دوره (نمایش روی عنوان آموزشی جهت انتخاب توسط کاربر):
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" {...register('is_in_person')} />
                  <Users size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span>حضوری (نمایش تگ «حضوری»)</span>
                </label>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" {...register('is_online')} />
                  <Laptop size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span>آنلاین (نمایش تگ «آنلاین»)</span>
                </label>
              </div>

              {errors.is_in_person && (
                <p className="field-error" style={{ marginTop: '0.5rem' }}>
                  {errors.is_in_person.message}
                </p>
              )}
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">مدت دوره (اختیاری)</label>
                <input
                  className="form-input"
                  placeholder="مثلاً ۲۴ ساعت آموزشی"
                  {...register('duration')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">سطح / مخاطبان دوره (اختیاری)</label>
                <input
                  className="form-input"
                  placeholder="مثلاً ویژه مدیران و کارشناسان"
                  {...register('level_fa')}
                />
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
                <label className="form-label">معرفی کوتاه دوره (فارسی)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  {...register('summary_fa')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  معرفی کوتاه دوره (انگلیسی - اختیاری)
                </label>
                <textarea
                  dir="ltr"
                  rows={2}
                  className="form-textarea"
                  {...register('summary_en')}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  سرفصل‌های آموزشی دوره — فارسی (هر سرفصل در یک خط) *
                </label>
                <textarea
                  rows={5}
                  className="form-textarea"
                  placeholder={
                    'فصل اول: مبانی هوش مصنوعی سازمانی\nفصل دوم: مهندسی پرامپت کاربردی\nفصل سوم: پیاده‌سازی عملی'
                  }
                  {...register('syllabus_fa_text')}
                />
                {errors.syllabus_fa_text && (
                  <p className="field-error">
                    {errors.syllabus_fa_text.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  سرفصل‌های آموزشی — انگلیسی (اختیاری، هر خط یک سرفصل)
                </label>
                <textarea
                  dir="ltr"
                  rows={5}
                  className="form-textarea"
                  placeholder={
                    'Module 1: Enterprise AI Foundations\nModule 2: Prompt Engineering\nModule 3: Capstone Workshop'
                  }
                  {...register('syllabus_en_text')}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <input type="checkbox" {...register('is_active')} />
                <span>نمایش فعال این دوره در صفحه آموزش سایت</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره دوره آموزشی'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
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
                <th>عنوان دوره آموزشی</th>
                <th>تگ‌های برگزاری</th>
                <th>تعداد سرفصل</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td data-label="عنوان دوره">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GraduationCap
                        size={17}
                        style={{ color: 'var(--accent-primary)', flexShrink: 0 }}
                      />
                      <strong>{course.title_fa}</strong>
                    </div>
                    {course.title_en && (
                      <div
                        className="mono"
                        style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                      >
                        {course.title_en}
                      </div>
                    )}
                  </td>
                  <td data-label="تگ‌های برگزاری">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {course.is_in_person && (
                        <span className="badge">حضوری</span>
                      )}
                      {course.is_online && (
                        <span
                          className="badge"
                          style={{
                            color: 'var(--accent-emerald)',
                            borderColor: 'var(--accent-emerald)',
                          }}
                        >
                          آنلاین
                        </span>
                      )}
                    </div>
                  </td>
                  <td data-label="تعداد سرفصل">
                    {course.syllabus_fa?.length || 0} سرفصل
                  </td>
                  <td data-label="وضعیت">
                    <span
                      className="badge"
                      style={{
                        color: course.is_active
                          ? 'var(--accent-emerald)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {course.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td data-label="عملیات">
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`ویرایش ${course.title_fa}`}
                        onClick={() => openEdit(course)}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ color: 'var(--accent-danger)' }}
                        aria-label={`حذف ${course.title_fa}`}
                        onClick={() => handleDelete(course)}
                      >
                        <Trash2 size={15} />
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
