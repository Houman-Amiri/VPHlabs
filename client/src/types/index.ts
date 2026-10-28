export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
  categories?: string[];
  related?: Article[];
  counts?: ContactStatusCounts;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  slug: string;
  title_fa: string;
  title_en: string;
  summary_fa: string;
  summary_en: string;
  description_fa: string;
  description_en: string;
  category: string;
  badge: string;
  image_url: string;
  features: string[];
  target_sector: 'enterprise' | 'government' | 'industrial' | 'infrastructure';
  isic_code: string;
  demo_available: boolean;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  slug: string;
  title_fa: string;
  title_en: string;
  excerpt_fa: string;
  excerpt_en: string;
  content_fa: string;
  content_en: string;
  cover_image: string;
  category: string;
  tags: string[];
  author_name: string;
  reading_time_minutes: number;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  views_count: number;
  likes_count: number;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: number;
  image_url: string;
  target_url: string;
  alt_fa: string;
  alt_en: string;
  badge_fa: string;
  badge_en: string;
  title_fa: string;
  title_en: string;
  subtitle_fa: string;
  subtitle_en: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  full_name_fa: string;
  full_name_en: string;
  role_fa: string;
  role_en: string;
  bio_fa: string;
  bio_en: string;
  avatar_url: string;
  linkedin_url: string;
  instagram_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  id: number;
  isic_code: string;
  title_fa: string;
  title_en: string;
  description_fa: string;
  description_en: string;
  ai_application_fa: string;
  ai_application_en: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
}

export interface SiteContentEntry {
  fa: string;
  en: string;
  section: string;
  label_fa: string;
}

export type SiteContentMap = Record<string, SiteContentEntry>;

export interface SiteContentItem {
  id: number;
  content_key: string;
  section: string;
  label_fa: string;
  value_fa: string;
  value_en: string;
  updated_at: string;
}

export interface ContactStatusCounts {
  unread: number;
  read: number;
  responded: number;
  archived: number;
  total: number;
}

export interface ContactMessage {
  id: number;
  full_name: string;
  organization: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  product_id: number | null;
  product_title_fa?: string | null;
  message: string;
  status: 'unread' | 'read' | 'responded' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface MediaUpload {
  id: number;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  storage_driver: string;
  public_url: string;
  created_at: string;
}
