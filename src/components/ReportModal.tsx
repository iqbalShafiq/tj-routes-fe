import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../lib/api/reports';
import type { CreateReportRequest } from '../lib/api/reports';
import { useRoutes, useRouteStops } from '../lib/hooks/useRoutes';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { FileInput } from './ui/FileInput';
import { Button } from './ui/Button';
import { Loading } from './ui/Loading';
import { REPORT_TYPES } from '../lib/utils/constants';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRouteId?: number;
  initialStopId?: number;
  onSuccess?: () => void;
}

export function ReportModal({
  isOpen,
  onClose,
  initialRouteId,
  initialStopId,
  onSuccess,
}: ReportModalProps) {
  const queryClient = useQueryClient();
  const { data: routesData, isLoading: routesLoading } = useRoutes(1, 100);

  const [formData, setFormData] = useState<{
    type: CreateReportRequest['type'];
    title: string;
    description: string;
    related_route_id?: number;
    related_stop_id?: number;
  }>({
    type: 'route_issue',
    title: '',
    description: '',
    related_route_id: initialRouteId,
    related_stop_id: initialStopId,
  });

  const { data: routeStops, isLoading: routeStopsLoading } = useRouteStops(formData.related_route_id);

  const [photos, setPhotos] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'route_issue',
        title: '',
        description: '',
        related_route_id: initialRouteId,
        related_stop_id: initialStopId,
      });
      setPhotos([]);
      setPdfs([]);
      setErrors({});
    }
  }, [isOpen, initialRouteId, initialStopId]);

  // Auto-fill stop after route stops are loaded (when route is selected from query params)
  useEffect(() => {
    if (!initialStopId || routeStopsLoading) return;

    if (routeStops && routeStops.length > 0) {
      if (routeStops.some((stop) => stop.id === initialStopId)) {
        setFormData((prev) => ({
          ...prev,
          related_stop_id: initialStopId,
        }));
      }
    }
  }, [routeStops, routeStopsLoading, initialStopId]);

  // Reset stop selection when route changes (if stop is not in new route)
  useEffect(() => {
    if (!formData.related_route_id) {
      setFormData((prev) => ({
        ...prev,
        related_stop_id: undefined,
      }));
      return;
    }

    if (routeStops && formData.related_stop_id) {
      const isStopValid = routeStops.some((stop) => stop.id === formData.related_stop_id);
      if (!isStopValid) {
        setFormData((prev) => ({
          ...prev,
          related_stop_id: undefined,
        }));
      }
    }
  }, [formData.related_route_id, routeStops, formData.related_stop_id]);

  const mutation = useMutation({
    mutationFn: () => {
      const data: CreateReportRequest = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        related_route_id: formData.related_route_id,
        related_stop_id: formData.related_stop_id,
      };
      return reportsApi.createReport(
        data,
        photos.length > 0 ? photos : undefined,
        pdfs.length > 0 ? pdfs : undefined
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      setErrors({
        submit:
          error.response?.data?.error ||
          'Failed to submit report. Please try again.',
      });
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      mutation.mutate();
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

  if (routesLoading || !routesData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Create Report" size="lg">
        <Loading />
      </Modal>
    );
  }

  // Get available stops based on selected route
  const availableStops = formData.related_route_id && routeStops ? routeStops : [];

  // Convert routes to Select options
  const routeOptions = [
    { value: '', label: 'Select a route' },
    ...routesData.data.map((route) => ({
      value: route.id,
      label: `${route.route_number} - ${route.name}`,
    })),
  ];

  // Convert stops to Select options
  const stopOptions = [
    { value: '', label: formData.related_route_id ? 'Select a stop' : 'Select a route first' },
    ...availableStops.map((stop) => ({
      value: stop.id,
      label: `${stop.name} (${stop.type})`,
    })),
  ];

  const isLoading = mutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Report"
      size="lg"
      closeOnOverlayClick={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Report Type */}
        <Select
          label="Report Type"
          value={formData.type}
          onChange={(value) =>
            setFormData({
              ...formData,
              type: value as CreateReportRequest['type'],
            })
          }
          disabled={isLoading}
        >
          {REPORT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>

        {/* Title */}
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief summary of the report"
          error={errors.title}
          disabled={isLoading}
        />

        {/* Related Route */}
        <Select
          label="Related Route (Optional)"
          value={formData.related_route_id || ''}
          onChange={(value) =>
            setFormData({
              ...formData,
              related_route_id: value ? Number(value) : undefined,
              related_stop_id: undefined,
            })
          }
          options={routeOptions}
          searchable={true}
          disabled={isLoading}
        />

        {/* Related Stop */}
        <Select
          label="Related Stop (Optional)"
          value={formData.related_stop_id || ''}
          onChange={(value) =>
            setFormData({
              ...formData,
              related_stop_id: value ? Number(value) : undefined,
            })
          }
          options={stopOptions}
          searchable={true}
          disabled={!formData.related_route_id || routeStopsLoading || isLoading}
        />

        {/* Description */}
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={5}
          error={errors.description}
          placeholder="Describe the issue, change, or event in detail..."
          disabled={isLoading}
        />

        {/* Photos */}
        <div>
          <FileInput
            label="Photos (Optional)"
            accept="image/*"
            multiple
            onFileChange={handlePhotoChange}
            disabled={isLoading}
          />
          {photos.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {photos.length} photo(s) selected
            </p>
          )}
        </div>

        {/* PDFs */}
        <div>
          <FileInput
            label="Documents (Optional)"
            accept=".pdf"
            multiple
            onFileChange={handlePdfChange}
            disabled={isLoading}
          />
          {pdfs.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {pdfs.length} document(s) selected
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-body">{errors.submit}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
