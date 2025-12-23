import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { reportsApi } from "../lib/api/reports";
import type { CreateReportRequest } from "../lib/api/reports";
import { useRoutes } from "../lib/hooks/useRoutes";
import { useStops } from "../lib/hooks/useStops";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { FileInput } from "./ui/FileInput";
import { Button } from "./ui/Button";
import { Loading } from "./ui/Loading";
import { REPORT_TYPES } from "../lib/utils/constants";

interface ReportFormProps {
  initialRouteId?: number;
}

export const ReportForm = ({ initialRouteId }: ReportFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: routesData } = useRoutes(1, 100);
  const { data: stopsData } = useStops(1, 100);

  const [formData, setFormData] = useState<{
    type: CreateReportRequest["type"];
    title: string;
    description: string;
    related_route_id?: number;
    related_stop_id?: number;
  }>({
    type: "route_issue",
    title: "",
    description: "",
    related_route_id: initialRouteId,
    related_stop_id: undefined,
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      navigate({ to: "/reports" });
    },
    onError: (error: any) => {
      setErrors({
        submit:
          error.response?.data?.error ||
          "Failed to submit report. Please try again.",
      });
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
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

  if (!routesData) {
    return <Loading />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Report Type */}
      <Select
        label="Report Type"
        value={formData.type}
        onChange={(value) =>
          setFormData({
            ...formData,
            type: value as CreateReportRequest["type"],
          })
        }
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
      />

      {/* Related Route */}
      <Select
        label="Related Route (Optional)"
        value={formData.related_route_id || ""}
        onChange={(value) =>
          setFormData({
            ...formData,
            related_route_id: value ? Number(value) : undefined,
          })
        }
      >
        <option value="">Select a route</option>
        {routesData.data.map((route) => (
          <option key={route.id} value={route.id}>
            {route.route_number || route.code} - {route.name}
          </option>
        ))}
      </Select>

      {/* Related Stop */}
      <Select
        label="Related Stop (Optional)"
        value={formData.related_stop_id || ""}
        onChange={(value) =>
          setFormData({
            ...formData,
            related_stop_id: value ? Number(value) : undefined,
          })
        }
      >
        <option value="">Select a stop</option>
        {stopsData?.data.map((stop) => (
          <option key={stop.id} value={stop.id}>
            {stop.name} ({stop.type})
          </option>
        ))}
      </Select>

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
      />

      {/* Photos */}
      <div>
        <FileInput
          label="Photos (Optional)"
          accept="image/*"
          multiple
          onFileChange={handlePhotoChange}
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
          variant="accent"
          disabled={mutation.isPending}
          className="flex-1"
        >
          {mutation.isPending ? "Submitting..." : "Submit Report"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: "/reports" })}
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
  );
};
