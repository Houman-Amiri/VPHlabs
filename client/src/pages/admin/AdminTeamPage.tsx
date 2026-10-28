import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Edit2,
  Instagram,
  Linkedin,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import apiClient from '../../lib/axios';
import {
  teamMemberFormSchema,
  type TeamMemberFormValues,
} from '../../schemas/forms';
import { useSiteStore } from '../../store/useSiteStore';
import { useToastStore } from '../../store/useToastStore';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { EmptyState, LoadingState } from '../../components/common/UiStates';
import type { ApiSuccessResponse, TeamMember } from '../../types';

export function AdminTeamPage() {
  const addToast = useToastStore((s) => s.addToast);
  const fetchBootstrap = useSiteStore((s) => s.fetchBootstrap);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      full_name_fa: '',
      full_name_en: '',
      role_fa: '',
      role_en: '',
      bio_fa: '',
      bio_en: '',
      avatar_url: '',
      linkedin_url: '',
      instagram_url: '',
      sort_order: 1,
      is_active: true,
    },
  });

  const avatarUrl = watch('avatar_url') || '';

  async function loadTeam() {
    setLoading(true);
    try {
      const res = await apiClient.get<ApiSuccessResponse<TeamMember[]>>(
        '/team?all=true'
      );
      setMembers(res.data.data);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در دریافت لیست همکاران',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  function openCreate() {
    setEditing(null);
    reset({
      full_name_fa: '',
      full_name_en: '',
      role_fa: '',
      role_en: '',
      bio_fa: '',
      bio_en: '',
      avatar_url: '',
      linkedin_url: '',
      instagram_url: '',
      sort_order: members.length + 1,
      is_active: true,
    });
    setFormOpen(true);
  }

  function openEdit(m: TeamMember) {
    setEditing(m);
    reset({
      full_name_fa: m.full_name_fa,
      full_name_en: m.full_name_en,
      role_fa: m.role_fa,
      role_en: m.role_en,
      bio_fa: m.bio_fa,
      bio_en: m.bio_en,
      avatar_url: m.avatar_url,
      linkedin_url: m.linkedin_url,
      instagram_url: m.instagram_url,
      sort_order: m.sort_order,
      is_active: m.is_active,
    });
    setFormOpen(true);
  }

  async function onSubmit(values: TeamMemberFormValues) {
    try {
      if (editing) {
        await apiClient.put(`/team/${editing.id}`, values);
        addToast('اطلاعات همکار با موفقیت بروزرسانی شد.', 'success');
      } else {
        await apiClient.post('/team', values);
        addToast('همکار جدید به بخش درباره ما افزوده شد.', 'success');
      }
      setFormOpen(false);
      setEditing(null);
      await loadTeam();
      await fetchBootstrap(true);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در ذخیره اطلاعات همکار',
        'error'
      );
    }
  }

  async function handleDelete(m: TeamMember) {
    if (!window.confirm(`آیا از حذف «${m.full_name_fa}» اطمینان دارید؟`))
      return;
    try {
      await apiClient.delete(`/team/${m.id}`);
      addToast('همکار حذف شد.', 'info');
      await loadTeam();
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
            مدیریت معرفی همکاران (صفحه درباره ما)
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
            }}
          >
            افزودن، ویرایش، تصویر پرسنلی و لینک شبکه‌های اجتماعی (لینکدین و اینستاگرام) همکاران
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          <span>افزودن همکار جدید</span>
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
              {editing
                ? `ویرایش مشخصات ${editing.full_name_fa}`
                : 'افزودن همکار جدید'}
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
                <label className="form-label">نام و نام خانوادگی (فارسی) *</label>
                <input
                  className="form-input"
                  placeholder="مثلاً: شهرام امیری"
                  {...register('full_name_fa')}
                />
                {errors.full_name_fa && (
                  <span className="form-error">
                    {errors.full_name_fa.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">نام و نام خانوادگی (انگلیسی)</label>
                <input
                  dir="ltr"
                  className="form-input"
                  placeholder="Shahram Amiri"
                  {...register('full_name_en')}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">سمت شغلی (فارسی) *</label>
                <input
                  className="form-input"
                  placeholder="مثلاً: مدیرعامل و معمار ارشد هوش مصنوعی"
                  {...register('role_fa')}
                />
                {errors.role_fa && (
                  <span className="form-error">{errors.role_fa.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">سمت شغلی (انگلیسی)</label>
                <input
                  dir="ltr"
                  className="form-input"
                  placeholder="CEO & Principal AI Architect"
                  {...register('role_en')}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">معرفی کوتاه و تخصص‌ها (فارسی)</label>
                <textarea
                  rows={3}
                  className="form-textarea"
                  placeholder="خلاصه سوابق تخصصی و مسئولیت‌ها در شرکت..."
                  {...register('bio_fa')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">معرفی کوتاه (انگلیسی)</label>
                <textarea
                  dir="ltr"
                  rows={3}
                  className="form-textarea"
                  placeholder="Short professional bio..."
                  {...register('bio_en')}
                />
              </div>
            </div>

            <ImageUploadField
              label="تصویر پرسنلی همکار (اختیاری)"
              value={avatarUrl}
              onChange={(url) => setValue('avatar_url', url)}
            />

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">لینک پروفایل لینکدین (LinkedIn)</label>
                <input
                  dir="ltr"
                  className="form-input mono"
                  placeholder="https://www.linkedin.com/in/username"
                  {...register('linkedin_url')}
                />
                {errors.linkedin_url && (
                  <span className="form-error">
                    {errors.linkedin_url.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  لینک پروفایل اینستاگرام (Instagram)
                </label>
                <input
                  dir="ltr"
                  className="form-input mono"
                  placeholder="https://www.instagram.com/username"
                  {...register('instagram_url')}
                />
                {errors.instagram_url && (
                  <span className="form-error">
                    {errors.instagram_url.message}
                  </span>
                )}
              </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'center' }}>
              <div className="form-group">
                <label className="form-label">ترتیب نمایش</label>
                <input
                  type="number"
                  className="form-input"
                  {...register('sort_order')}
                />
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}
              >
                <input type="checkbox" {...register('is_active')} />
                <span>نمایش فعال در صفحه درباره ما</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره مشخصات همکار'}
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
      ) : members.length === 0 ? (
        <EmptyState
          message="هنوز همکاری ثبت نشده است. با کلیک روی دکمه زیر اولین عضو تیم را معرفی کنید."
          actionLabel="افزودن همکار جدید"
          onAction={openCreate}
        />
      ) : (
        <div className="grid-2">
          {members.map((m) => (
            <div key={m.id} className="card team-card">
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.full_name_fa}
                        className="team-avatar"
                      />
                    ) : (
                      <div className="team-avatar-fallback">
                        {(m.full_name_fa || 'V').trim().charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                        {m.full_name_fa}
                      </div>
                      <div
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--accent-primary)',
                          fontWeight: 600,
                        }}
                      >
                        {m.role_fa}
                      </div>
                    </div>
                  </div>

                  <span className="badge">
                    <Users size={12} />
                    <span>{m.is_active ? `فعال (#${m.sort_order})` : 'غیرفعال'}</span>
                  </span>
                </div>

                {m.bio_fa && (
                  <p
                    style={{
                      margin: '0 0 0.85rem',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {m.bio_fa}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {m.linkedin_url && (
                    <span className="social-pill">
                      <Linkedin size={13} style={{ color: '#0a66c2' }} />
                      <span>LinkedIn</span>
                    </span>
                  )}
                  {m.instagram_url && (
                    <span className="social-pill">
                      <Instagram size={13} style={{ color: '#e1306c' }} />
                      <span>Instagram</span>
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => openEdit(m)}
                  aria-label={`ویرایش ${m.full_name_fa}`}
                >
                  <Edit2 size={15} />
                  <span>ویرایش</span>
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  style={{ color: 'var(--accent-danger)' }}
                  onClick={() => handleDelete(m)}
                  aria-label={`حذف ${m.full_name_fa}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
