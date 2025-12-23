import { useState } from 'react';
import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { useReports, useUpdateReportStatus, useDeleteReport } from '../../lib/hooks/useReports';
import { authApi } from '../../lib/api/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Loading';
import { PageHeader } from '../../components/layout';
import { useToast } from '../../lib/hooks/useToast';
import { format } from 'date-fns';
import { REPORT_TYPES, REPORT_STATUSES } from '../../lib/utils/constants';
import type { Report } from '../../lib/api/reports';

export const Route = createFileRoute('/admin/reports')({
  beforeLoad: async () => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'reviewed' | 'resolved'>('pending');
  const limit = 20;
  const { toast } = useToast();

  const { data, isLoading } = useReports(page, limit, {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const updateStatusMutation = useUpdateReportStatus();
  const deleteMutation = useDeleteReport();

  const handleUpdateStatus = () => {
    if (!selectedReport) return;
    
    updateStatusMutation.mutate(
      { id: selectedReport.id, data: { status: newStatus, admin_notes: adminNotes } },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Report status updated', variant: 'success' });
          setSelectedReport(null);
          setAdminNotes('');
        },
        onError: () => toast({ title: 'Error', description: 'Failed to update status', variant: 'error' }),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Success', description: 'Report deleted', variant: 'success' }),
      onError: () => toast({ title: 'Error', description: 'Failed to delete report', variant: 'error' }),
    });
  };

  const openStatusModal = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminNotes(report.admin_notes || '');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (isLoading && !data) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Manage Reports" subtitle="Review and respond to user reports." />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 card-chamfered" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Manage Reports"
        subtitle="Review and respond to user reports."
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Reports' },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(value) => { setStatusFilter(value as any); setPage(1); }}
          options={[
            { value: 'all', label: 'All Statuses' },
            ...REPORT_STATUSES.map(s => ({ value: s.value, label: s.label })),
          ]}
        />
        <FilterSelect
          label="Type"
          value={typeFilter}
          onChange={(value) => { setTypeFilter(value as string); setPage(1); }}
          options={[
            { value: 'all', label: 'All Types' },
            ...REPORT_TYPES.map(t => ({ value: t.value, label: t.label })),
          ]}
        />
      </div>

      {/* Status Update Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card static className="w-full max-w-lg">
            <h2 className="text-xl font-display font-semibold text-slate-900 mb-4">
              Update Report Status
            </h2>
            <div className="mb-4">
              <p className="text-sm text-slate-500 mb-2">Report #{selectedReport.id}</p>
              <p className="font-medium text-slate-900">{selectedReport.title}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Select
                  label="Status"
                  value={newStatus}
                  onChange={(value) => setNewStatus(value as any)}
                >
                  {REPORT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Textarea
                  label="Admin Notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the user..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedReport(null)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant="accent" 
                  className="flex-1"
                  onClick={handleUpdateStatus}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reports List */}
      {data && data.data.length > 0 ? (
        <>
          <div className="space-y-4 mb-6">
            {data.data.map((report) => {
              const typeInfo = REPORT_TYPES.find(t => t.value === report.type);
              return (
                <Card key={report.id} className="hover:border-slate-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                          {typeInfo?.label || report.type}
                        </span>
                        <span className="text-xs text-slate-400">#{report.id}</span>
                      </div>
                      <Link 
                        to="/feed/$reportId" 
                        params={{ reportId: String(report.id) }}
                        className="font-display font-semibold text-lg text-slate-900 hover:text-amber-600 block truncate"
                      >
                        {report.title}
                      </Link>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{report.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>By: {report.user?.username || 'Anonymous'}</span>
                        <span>{format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}</span>
                        <span>👍 {report.upvotes} | 👎 {report.downvotes} | 💬 {report.comment_count}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openStatusModal(report)}>
                        Update Status
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDelete(report.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  {report.admin_notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Admin Notes:</p>
                      <p className="text-sm text-blue-900">{report.admin_notes}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-4">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              ← Previous
            </Button>
            <span className="text-slate-600 text-sm font-medium">Page {page} of {data.total_pages}</span>
            <Button variant="outline" onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))} disabled={page >= data.total_pages}>
              Next →
            </Button>
          </div>
        </>
      ) : (
        <Card static>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 mb-4 rounded-full">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600">No reports found</p>
          </div>
        </Card>
      )}
    </div>
  );
}

