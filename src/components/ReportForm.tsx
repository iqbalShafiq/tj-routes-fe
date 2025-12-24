import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { reportsApi } from "../lib/api/reports";
import type { CreateReportRequest } from "../lib/api/reports";
import { useRoutes, useRouteStops } from "../lib/hooks/useRoutes";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { FileInput } from "./ui/FileInput";
import { Button } from "./ui/Button";
import { Loading } from "./ui/Loading";
import { REPORT_TYPES } from "../lib/utils/constants";

interface ReportFormProps {
  initialRouteId?: number;
  initialStopId?: number;
}

export const ReportForm = ({ initialRouteId, initialStopId }: ReportFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: routesData, isLoading: routesLoading } = useRoutes(1, 100);

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
    related_stop_id: initialStopId,
  });

  const { data: routeStops, isLoading: routeStopsLoading } = useRouteStops(formData.related_route_id);

  const [isInitialized, setIsInitialized] = useState(false);

  const [photos, setPhotos] = useState<File[]>([]);
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill route from query params after routes data is fetched
  useEffect(() => {
    if (isInitialized || routesLoading || !routesData) return;

    if (initialRouteId && routesData.data.some(r => r.id === initialRouteId)) {
      // Route is already set in initial state, just mark as initialized
      setIsInitialized(true);
    } else if (!initialRouteId && !initialStopId) {
      // No initial values, mark as initialized
      setIsInitialized(true);
    }
  }, [routesData, routesLoading, initialRouteId, initialStopId, isInitialized]);

  // Auto-fill stop after route stops are loaded (when route is selected from query params)
  useEffect(() => {
    if (!initialStopId || routeStopsLoading) return;
    
    // If route stops are loaded and we have an initial stop ID
    if (routeStops && routeStops.length > 0) {
      // Check if the initial stop is in the route stops
      if (routeStops.some(stop => stop.id === initialStopId)) {
        setFormData(prev => ({
          ...prev,
          related_stop_id: initialStopId,
        }));
      }
    }
  }, [routeStops, routeStopsLoading, initialStopId]);

  // Reset stop selection when route changes (if stop is not in new route)
  useEffect(() => {
    if (!formData.related_route_id) {
      // If route is cleared, clear stop too
      setFormData(prev => ({
        ...prev,
        related_stop_id: undefined,
      }));
      return;
    }

    if (routeStops && formData.related_stop_id) {
      // Check if current stop is still valid in the new route
      const isStopValid = routeStops.some(stop => stop.id === formData.related_stop_id);
      if (!isStopValid) {
        setFormData(prev => ({
          ...prev,
          related_stop_id: undefined,
        }));
      }
    }
  }, [formData.related_route_id, routeStops]);

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

  if (routesLoading || !routesData) {
    return <Loading />;
  }

  // Get available stops based on selected route
  const availableStops = formData.related_route_id && routeStops
    ? routeStops
    : [];

  // Convert routes to Select options
  const routeOptions = [
    { value: "", label: "Select a route" },
    ...routesData.data.map(route => ({
      value: route.id,
      label: `${route.route_number || route.code} - ${route.name}`,
    })),
  ];

  // Convert stops to Select options
  const stopOptions = [
    { value: "", label: formData.related_route_id ? "Select a stop" : "Select a route first" },
    ...availableStops.map(stop => ({
      value: stop.id,
      label: `${stop.name} (${stop.type})`,
    })),
  ];

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
            // Reset stop when route changes
            related_stop_id: undefined,
          })
        }
        options={routeOptions}
        searchable={true}
      />

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
        options={stopOptions}
        searchable={true}
        disabled={!formData.related_route_id || routeStopsLoading}
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
