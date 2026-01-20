import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  useBulkUploads,
  useBulkUploadStatus,
  useUploadCSV,
} from "../../lib/hooks/useBulkUpload";
import { authApi } from "../../lib/api/auth";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { FileInput } from "../../components/ui/FileInput";
import { Chip } from "../../components/ui/Chip";
import { Skeleton } from "../../components/ui/Loading";
import { PageHeader } from "../../components/layout";
import { useToast } from "../../lib/hooks/useToast";
import { format } from "date-fns";
import type { EntityType, BulkUploadLog } from "../../lib/api/bulk-upload";
import { RouteErrorComponent } from "../../components/RouteErrorComponent";

export const Route = createFileRoute("/admin/bulk-upload")({
  beforeLoad: async () => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminBulkUploadPage,
  errorComponent: RouteErrorComponent,
});

function UploadProgress({ upload }: { upload: BulkUploadLog }) {
  const { data } = useBulkUploadStatus(upload.id);
  const current = data || upload;

  const progress =
    current.total_rows > 0
      ? Math.round(
          ((current.success_count +
            current.duplicate_count +
            current.error_count) /
            current.total_rows) *
            100
        )
      : 0;

  const getStatusVariant = () => {
    switch (current.status) {
      case "completed":
        return "success";
      case "processing":
        return "info";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Chip variant={getStatusVariant()}>{current.status}</Chip>
            <span className="text-xs text-text-muted">#{current.id}</span>
          </div>
          <p className="font-medium text-text-primary capitalize">
            {current.entity_type} Import
          </p>
          <p className="text-xs text-text-muted">
            {format(new Date(current.created_at), "MMM d, yyyy HH:mm")}
          </p>
        </div>
      </div>

      {(current.status === "processing" || current.status === "completed") && (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-bg-elevated rounded-sm overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  current.status === "completed"
                    ? "bg-success"
                    : "bg-info"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-display font-bold text-text-primary">
                {current.total_rows}
              </p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
            <div>
              <p className="text-lg font-display font-bold text-success">
                {current.success_count}
              </p>
              <p className="text-xs text-text-muted">Success</p>
            </div>
            <div>
              <p className="text-lg font-display font-bold text-warning">
                {current.duplicate_count}
              </p>
              <p className="text-xs text-text-muted">Duplicates</p>
            </div>
            <div>
              <p className="text-lg font-display font-bold text-error">
                {current.error_count}
              </p>
              <p className="text-xs text-text-muted">Errors</p>
            </div>
          </div>
        </>
      )}

      {current.error_message && (
        <div className="mt-4 p-3 bg-error/10 rounded-sm border border-error/20">
          <p className="text-xs text-error font-medium mb-1">Error:</p>
          <p className="text-sm text-text-primary">{current.error_message}</p>
        </div>
      )}
    </Card>
  );
}

function AdminBulkUploadPage() {
  const [selectedType, setSelectedType] = useState<EntityType>("route");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data: uploads, isLoading } = useBulkUploads(page, 10);
  const uploadMutation = useUploadCSV();

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "error",
      });
      return;
    }

    uploadMutation.mutate(
      { entityType: selectedType, file: selectedFile },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Upload started! Processing in background.",
            variant: "success",
          });
          setSelectedFile(null);
        },
        onError: () =>
          toast({
            title: "Error",
            description: "Failed to upload file",
            variant: "error",
          }),
      }
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Bulk Upload"
        subtitle="Import routes, stops, and vehicles from CSV files."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Bulk Upload" },
        ]}
      />

      {/* Upload Form */}
      <Card static className="mb-8">
        <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
          Upload CSV
        </h2>

        <div className="space-y-4 mb-6">
          <div className="max-w-xs">
            <Select
              label="Entity Type"
              value={selectedType}
              onChange={(value) => setSelectedType(value as EntityType)}
            >
              <option value="route">Routes</option>
              <option value="stop">Stops</option>
              <option value="vehicle">Vehicles</option>
            </Select>
          </div>
          <div>
            <FileInput
              label="CSV File"
              accept=".csv"
              onFileChange={(files) => setSelectedFile(files?.[0] || null)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Make sure your CSV follows the required format for {selectedType}s.
          </p>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Start Upload"}
          </Button>
        </div>
      </Card>

      {/* CSV Format Guide */}
      <Card static className="mb-8">
        <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
          CSV Format Guide
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-text-primary mb-2">Routes CSV</h3>
            <code className="block bg-bg-elevated p-3 rounded-sm text-sm text-text-secondary overflow-x-auto">
              route_number,name,description,status
              <br />
              1,Blok M - Kota,Route from Blok M to Kota,active
              <br />
              1A,Blok M - Manggarai,Route from Blok M to Manggarai,active
            </code>
          </div>

          <div>
            <h3 className="font-medium text-text-primary mb-2">Stops CSV</h3>
            <code className="block bg-bg-elevated p-3 rounded-sm text-sm text-text-secondary overflow-x-auto">
              name,type,latitude,longitude,address,city,district,status
              <br />
              Halte Bundaran HI,stop,-6.1944,106.8229,"Jl. Sudirman",Jakarta
              Pusat,Menteng,active
              <br />
              Terminal Blok M,terminal,-6.2446,106.7968,"Blok M Plaza",Jakarta
              Selatan,Kebayoran,active
            </code>
          </div>

          <div>
            <h3 className="font-medium text-text-primary mb-2">Vehicles CSV</h3>
            <code className="block bg-bg-elevated p-3 rounded-sm text-sm text-text-secondary overflow-x-auto">
              vehicle_plate,route_id,vehicle_type,capacity,status
              <br />
              B1234XYZ,1,Bus,60,active
              <br />
              B5678ABC,2,Articulated Bus,120,active
            </code>
          </div>
        </div>
      </Card>

      {/* Upload History */}
      <h2 className="text-lg font-display font-semibold text-text-primary mb-4">
        Upload History
      </h2>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 card-chamfered" />
          ))}
        </div>
      ) : uploads && uploads.data.length > 0 ? (
        <>
          {uploads.data.map((upload) => (
            <UploadProgress key={upload.id} upload={upload} />
          ))}

          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Previous
            </Button>
            <span className="text-text-secondary text-sm font-medium">
              Page {page} of {uploads.total_pages}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setPage((p) => Math.min(uploads.total_pages, p + 1))
              }
              disabled={page >= uploads.total_pages}
            >
              Next →
            </Button>
          </div>
        </>
      ) : (
        <Card static>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-bg-elevated mb-4 rounded-sm">
              <svg
                className="w-8 h-8 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </div>
            <p className="text-text-secondary">No uploads yet</p>
            <p className="text-slate-500 text-sm mt-1">
              Start by uploading a CSV file above
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
