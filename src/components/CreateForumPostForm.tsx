import { useState } from 'react';
import { useCreateForumPost } from '../lib/hooks/useForumPosts';
import type { CreateForumPostRequest } from '../lib/api/forum-posts';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { FileInput } from './ui/FileInput';
import { Button } from './ui/Button';
import { Loading } from './ui/Loading';
import { FORUM_POST_TYPES } from '../lib/utils/constants';
import { PostTypeIcon } from './ui/PostTypeIcon';
import { useReports } from '../lib/hooks/useReports';

interface CreateForumPostFormProps {
  forumId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<CreateForumPostRequest>;
}

export const CreateForumPostForm = ({
  forumId,
  onSuccess,
  onCancel,
  initialData,
}: CreateForumPostFormProps) => {
  const [formData, setFormData] = useState<CreateForumPostRequest>({
    post_type: initialData?.post_type || 'discussion',
    title: initialData?.title || '',
    content: initialData?.content || '',
    linked_report_id: initialData?.linked_report_id || null,
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch reports for linking
  const { data: reportsData } = useReports(1, 50);

  const createPostMutation = useCreateForumPost();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      createPostMutation.mutate(
        {
          forumId,
          data: formData,
          photos: photos.length > 0 ? photos : undefined,
          pdfs: pdfs.length > 0 ? pdfs : undefined,
        },
        {
          onSuccess: () => {
            // Cache update is handled in the mutation's onSuccess callback
            onSuccess?.();
          },
          onError: (error: any) => {
            setErrors({
              submit: error.response?.data?.error || 'Failed to create post. Please try again.',
            });
          },
        }
      );
    }
  };

  const handlePhotoChange = (files: FileList | null) => {
    if (files) {
      setPhotos(Array.from(files));
    } else {
      setPhotos([]);
    }
  };

  const handlePdfChange = (files: FileList | null) => {
    if (files) {
      setPdfs(Array.from(files));
    } else {
      setPdfs([]);
    }
  };

  const reportOptions = [
    { value: '', label: 'No linked report' },
    ...(reportsData?.data || []).map((report) => ({
      value: report.id,
      label: `${report.title} (${report.type})`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Post Type */}
      <Select
        label="Post Type"
        value={formData.post_type}
        onChange={(value) =>
          setFormData({
            ...formData,
            post_type: value as CreateForumPostRequest['post_type'],
          })
        }
        options={FORUM_POST_TYPES.map((type) => ({
          value: type.value,
          label: type.label,
        }))}
      />

      {/* Title */}
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Enter post title"
        error={errors.title}
        required
      />

      {/* Content */}
      <Textarea
        label="Content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder="Write your post content here..."
        rows={8}
        error={errors.content}
        required
      />

      {/* Linked Report */}
      <Select
        label="Link to Report (Optional)"
        value={formData.linked_report_id || ''}
        onChange={(value) =>
          setFormData({
            ...formData,
            linked_report_id: value ? Number(value) : null,
          })
        }
        options={reportOptions}
        searchable={true}
      />

      {/* Photos */}
      <FileInput
        label="Photos (Optional)"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onFileChange={handlePhotoChange}
      />
      {photos.length > 0 && (
        <p className="text-sm text-slate-600">{photos.length} photo(s) selected</p>
      )}

      {/* PDFs */}
      <FileInput
        label="PDF Documents (Optional)"
        accept="application/pdf"
        multiple
        onFileChange={handlePdfChange}
      />
      {pdfs.length > 0 && (
        <p className="text-sm text-slate-600">{pdfs.length} PDF(s) selected</p>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={createPostMutation.isPending}>
          {createPostMutation.isPending ? (
            <>
              <Loading className="w-4 h-4 mr-2" />
              Creating...
            </>
          ) : (
            'Create Post'
          )}
        </Button>
      </div>
    </form>
  );
};

