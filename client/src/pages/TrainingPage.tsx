import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Laptop,
  Sparkles,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/axios';
import { useSiteStore } from '../store/useSiteStore';
import { trackEvent } from '../lib/analytics';
import { SeoHead } from '../components/common/SeoHead';
import { EmptyState, LoadingState } from '../components/common/UiStates';
import type { ApiSuccessResponse, CourseItem } from '../types';

type DeliveryMode = 'in-person' | 'online';

export function TrainingPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isFa = lang.startsWith('fa');
  const navigate = useNavigate();

  const getText = useSiteStore((s) => s.getText);
  const storeCourses = useSiteStore((s) => s.courses);

  const [courses, setCourses] = useState<CourseItem[]>(storeCourses);
  const [loading, setLoading] = useState(storeCourses.length === 0);
  const [openCourseIds, setOpenCourseIds] = useState<Record<number, boolean>>({});
  const [selectedModes, setSelectedModes] = useState<
    Record<number, DeliveryMode | undefined>
  >({});

  useEffect(() => {
    let active = true;
    async function loadCourses() {
      if (storeCourses.length > 0) {
        setCourses(storeCourses);
        setLoading(false);
      }
      try {
        const res =
          await apiClient.get<ApiSuccessResponse<CourseItem[]>>('/courses');
        if (active) {
          setCourses(res.data.data);
        }
      } catch {
        // Keep bootstrap courses if network call fails
      } finally {
        if (active) setLoading(false);
      }
    }
    loadCourses();
    return () => {
      active = false;
    };
  }, [storeCourses]);

  const pageBadge = getText(
    'training.page_badge',
    lang,
    isFa
      ? 'آکادمی تخصصی و توانمندسازی سازمانی • کد آیسیک ۶۲۰۹۰۵'
      : 'Corporate AI Academy & Applied Training • ISIC 620905'
  );
  const pageTitle = getText('training.page_title', lang, t('training.title'));
  const pageSubtitle = getText(
    'training.page_subtitle',
    lang,
    t('training.subtitle')
  );

  function toggleSyllabus(courseId: number) {
    setOpenCourseIds((prev) => {
      const nextOpen = !prev[courseId];
      trackEvent('training_syllabus_toggle', { courseId, open: nextOpen });
      return { ...prev, [courseId]: nextOpen };
    });
  }

  function handleSelectMode(
    e: React.MouseEvent,
    course: CourseItem,
    mode: DeliveryMode
  ) {
    e.stopPropagation();
    setSelectedModes((prev) => ({
      ...prev,
      [course.id]: prev[course.id] === mode ? undefined : mode,
    }));
    trackEvent('training_mode_select', { courseId: course.id, mode });
  }

  function handleRegister(course: CourseItem) {
    const chosenMode = selectedModes[course.id];
    if (!chosenMode) return;

    const courseTitle = isFa
      ? course.title_fa
      : course.title_en || course.title_fa;
    const modeLabelFa = chosenMode === 'in-person' ? 'حضوری' : 'آنلاین';
    const modeLabelEn = chosenMode === 'in-person' ? 'In-Person' : 'Online';

    const subject = isFa
      ? `درخواست ثبت‌نام دوره آموزشی (${modeLabelFa}): ${course.title_fa}`
      : `Course Registration Request (${modeLabelEn}): ${courseTitle}`;

    const message = isFa
      ? `با سلام،\nمتقاضی ثبت‌نام در دوره آموزشی «${course.title_fa}» به صورت «${modeLabelFa}» هستم. خواهشمند است شرایط ثبت‌نام، زمان‌بندی برگزاری و جزئیات دوره را اعلام فرمایید.`
      : `Hello VPH Labs Training Team,\nI would like to register for the "${courseTitle}" training course in "${modeLabelEn}" format. Please share the upcoming schedule and enrollment details.`;

    trackEvent('training_register_redirect', {
      courseId: course.id,
      mode: chosenMode,
    });

    const params = new URLSearchParams({
      department: 'training',
      from: 'training',
      subject,
      message,
    });

    navigate(`/contact?${params.toString()}`);
  }

  const DirArrow = isFa ? ArrowLeft : ArrowRight;

  return (
    <div className="container page-bottom-space">
      <SeoHead
        title={pageTitle}
        description={pageSubtitle}
        canonicalPath="/training"
      />

      <header className="page-header">
        <span className="badge" style={{ marginBottom: '0.75rem' }}>
          <GraduationCap size={14} />
          <span>{pageBadge}</span>
        </span>
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </header>

      {loading ? (
        <LoadingState />
      ) : courses.length === 0 ? (
        <EmptyState message={t('training.empty')} />
      ) : (
        <div className="training-list">
          {courses.map((course, idx) => {
            const isOpen = Boolean(openCourseIds[course.id]);
            const selectedMode = selectedModes[course.id];
            const title = isFa
              ? course.title_fa
              : course.title_en || course.title_fa;
            const summary = isFa
              ? course.summary_fa
              : course.summary_en || course.summary_fa;
            const syllabus =
              !isFa && course.syllabus_en && course.syllabus_en.length > 0
                ? course.syllabus_en
                : course.syllabus_fa;

            return (
              <article
                key={course.id}
                className={`card training-card${
                  isOpen ? ' training-card--open' : ''
                }`}
              >
                {/* Clickable Course Title Header */}
                <div className="training-card-head">
                  <button
                    type="button"
                    className="training-title-trigger"
                    aria-expanded={isOpen}
                    aria-controls={`course-syllabus-${course.id}`}
                    onClick={() => toggleSyllabus(course.id)}
                  >
                    <span className="training-index-badge mono">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <span className="training-title-main">
                      <span className="training-title-text">{title}</span>
                      {(course.duration || course.level_fa) && (
                        <span className="training-meta-row">
                          {course.duration && (
                            <span className="training-meta-item">
                              <Clock size={13} />
                              <span>{course.duration}</span>
                            </span>
                          )}
                          {course.level_fa && (
                            <span className="training-meta-item">
                              <Sparkles size={13} />
                              <span>{course.level_fa}</span>
                            </span>
                          )}
                        </span>
                      )}
                    </span>

                    <span
                      className={`training-chevron${
                        isOpen ? ' training-chevron--open' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown size={19} />
                    </span>
                  </button>
                </div>

                {/* Syllabus Dropdown Panel */}
                {isOpen && (
                  <div
                    id={`course-syllabus-${course.id}`}
                    className="training-dropdown-panel"
                  >
                    {summary && (
                      <p className="training-course-summary">{summary}</p>
                    )}

                    <div className="training-syllabus-box">
                      <h2 className="training-syllabus-heading">
                        <BookOpen
                          size={16}
                          style={{ color: 'var(--accent-primary)' }}
                        />
                        <span>{t('training.syllabusTitle')}</span>
                      </h2>

                      <ul className="training-syllabus-list">
                        {syllabus.map((topic, tIdx) => (
                          <li key={tIdx} className="training-syllabus-item">
                            <CheckCircle2
                              size={16}
                              style={{
                                flexShrink: 0,
                                marginTop: '0.28rem',
                                color: 'var(--accent-emerald)',
                              }}
                            />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Action Footer: حضوری / آنلاین Tags right beside the Register Button */}
                <div className="training-action-footer">
                  <span className="training-mode-hint">
                    {selectedMode ? (
                      <>
                        <CheckCircle2
                          size={15}
                          style={{
                            color: 'var(--accent-emerald)',
                            flexShrink: 0,
                          }}
                        />
                        <span>
                          {isFa
                            ? `نوع برگزاری انتخاب‌شده: «${
                                selectedMode === 'in-person' ? 'حضوری' : 'آنلاین'
                              }» — آماده ثبت‌نام`
                            : `Selected mode: ${
                                selectedMode === 'in-person'
                                  ? 'In-Person'
                                  : 'Online'
                              } — Ready to register`}
                        </span>
                      </>
                    ) : (
                      <span>{t('training.selectModeHint')}</span>
                    )}
                  </span>

                  <div className="training-register-controls">
                    <div
                      className="training-tags-bar"
                      role="group"
                      aria-label={
                        isFa ? 'انتخاب نوع برگزاری دوره' : 'Select delivery mode'
                      }
                    >
                      {course.is_in_person && (
                        <button
                          type="button"
                          aria-pressed={selectedMode === 'in-person'}
                          className={`training-mode-tag${
                            selectedMode === 'in-person'
                              ? ' training-mode-tag--selected'
                              : ''
                          }`}
                          onClick={(e) =>
                            handleSelectMode(e, course, 'in-person')
                          }
                        >
                          {selectedMode === 'in-person' ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Users size={14} />
                          )}
                          <span>{t('training.inPerson')}</span>
                        </button>
                      )}

                      {course.is_online && (
                        <button
                          type="button"
                          aria-pressed={selectedMode === 'online'}
                          className={`training-mode-tag${
                            selectedMode === 'online'
                              ? ' training-mode-tag--selected'
                              : ''
                          }`}
                          onClick={(e) => handleSelectMode(e, course, 'online')}
                        >
                          {selectedMode === 'online' ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Laptop size={14} />
                          )}
                          <span>{t('training.online')}</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!selectedMode}
                      onClick={() => handleRegister(course)}
                    >
                      <span>
                        {selectedMode
                          ? isFa
                            ? `${t('training.registerBtn')} (${
                                selectedMode === 'in-person'
                                  ? 'حضوری'
                                  : 'آنلاین'
                              })`
                            : `${t('training.registerBtn')} (${
                                selectedMode === 'in-person'
                                  ? 'In-Person'
                                  : 'Online'
                              })`
                          : t('training.registerBtn')}
                      </span>
                      <DirArrow size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
