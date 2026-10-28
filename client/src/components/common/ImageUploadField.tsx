import { useState } from 'react';
import { Upload } from 'lucide-react';
import apiClient from '../../lib/axios';
import { useToastStore } from '../../store/useToastStore';
import type { ApiSuccessResponse, MediaUpload } from '../../types';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label = 'آدرس تصویر یا بارگذاری فایل',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await apiClient.post<ApiSuccessResponse<MediaUpload>>(
        '/uploads',
        formData
      );
      onChange(res.data.data.public_url);
      addToast('تصویر با موفقیت بارگذاری شد.', 'success');
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'خطا در بارگذاری تصویر',
        'error'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="form-input mono"
          style={{ flex: '1 1 240px' }}
          placeholder="/banners/banner-1.jpg یا /uploads/..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label
          className="btn btn-secondary"
          style={{ cursor: uploading ? 'wait' : 'pointer' }}
        >
          <Upload size={16} />
          <span>{uploading ? 'در حال آپلود...' : 'آپلود تصویر'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      {value && (
        <img
          src={value}
          alt="پیش‌نمایش"
          style={{
            marginTop: '0.6rem',
            maxHeight: '110px',
            borderRadius: '0.5rem',
            border: '1px solid var(--border-subtle)',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}
