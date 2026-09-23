import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  History,
  Mail,
  Calendar,
  UserCheck,
  Building2,
  MapPin,
  ChevronRight,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { applicationsService } from '../../services/applications.service';
import { jobsService } from '../../services/jobs.service';
import { Application, Job, ApplicationStatus, ApplicationHistory } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorState } from '../../components/shared/ErrorState';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function ApplicantsPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Change Dialog State
  const [statusDialogApp, setStatusDialogApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // History Dialog State
  const [historyDialogApp, setHistoryDialogApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        jobsService.getJob(id),
        applicationsService.getApplicants(id),
      ]);
      setJob(jobRes.data || null);
      setApplications(appsRes.data || []);
      setError('');
    } catch {
      setError('Failed to load applicant list or unauthorized access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const metrics = useMemo(() => {
    const total = applications.length;
    const reviewing = applications.filter((a) => a.status === 'REVIEWING').length;
    const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;
    const accepted = applications.filter((a) => a.status === 'ACCEPTED').length;
    const rejected = applications.filter((a) => a.status === 'REJECTED').length;
    return { total, reviewing, shortlisted, accepted, rejected };
  }, [applications]);

  const confirmStatusChange = (app: Application, status: ApplicationStatus) => {
    if (app.status === status) return;
    setStatusDialogApp(app);
    setNewStatus(status);
  };

  const handleExecuteStatusChange = async () => {
    if (!statusDialogApp || !newStatus) return;
    setStatusUpdating(true);
    try {
      await applicationsService.updateStatus(statusDialogApp.id, newStatus);
      toast.success('Hiring Stage Updated', {
        description: `Candidate status updated to ${newStatus}.`,
      });
      setStatusDialogApp(null);
      setNewStatus(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update status', {
        description: err.response?.data?.message || err.message || 'Please try again.',
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleOpenHistory = async (app: Application) => {
    setHistoryDialogApp(app);
    setHistoryLoading(true);
    try {
      const res = await applicationsService.getHistory(app.id);
      setHistory(res.data || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading candidate profiles..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/company/jobs">
        <Button variant="ghost" size="sm" className="gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back to My Openings
        </Button>
      </Link>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold">
              Candidate Management
            </Badge>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job?.location}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {job?.title}
          </h1>
          <p className="text-xs text-slate-500">
            Review applicant profiles, evaluate qualifications, and progress hiring decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <Link to={`/jobs/${id}`}>
            <Button variant="outline" size="sm" className="text-xs font-semibold rounded-xl">
              View Public Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Pipeline Metrics Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Applied</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{metrics.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">In Review</p>
          <p className="text-xl font-black text-blue-600 mt-0.5">{metrics.reviewing}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Shortlisted</p>
          <p className="text-xl font-black text-amber-600 mt-0.5">{metrics.shortlisted}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Accepted</p>
          <p className="text-xl font-black text-emerald-600 mt-0.5">{metrics.accepted}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-center col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Rejected</p>
          <p className="text-xl font-black text-rose-600 mt-0.5">{metrics.rejected}</p>
        </div>
      </div>

      {/* Candidates List / Table */}
      {applications.length === 0 ? (
        <EmptyState
          title="No candidates have applied yet"
          description="Candidates who apply for this position will appear here with full profile details."
          icon={<Users className="w-12 h-12 text-slate-300" />}
        />
      ) : (
        <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold">Candidate Submissions ({applications.length})</CardTitle>
            <CardDescription className="text-xs">
              Change status in the dropdown to trigger the hiring stage update and log the event.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 text-xs">
                    <TableHead className="font-bold">Candidate</TableHead>
                    <TableHead className="font-bold">Contact</TableHead>
                    <TableHead className="font-bold">Submission Date</TableHead>
                    <TableHead className="font-bold">Current Stage</TableHead>
                    <TableHead className="font-bold">Update Stage</TableHead>
                    <TableHead className="font-bold text-right">History</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                            {app.jobSeeker?.name.slice(0, 2).toUpperCase() || 'JS'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{app.jobSeeker?.name}</p>
                            <p className="text-[11px] text-slate-400">Verified Job Seeker</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.jobSeeker?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell>
                        <div className="w-38">
                          <Select
                            value={app.status}
                            onValueChange={(val: ApplicationStatus) => confirmStatusChange(app, val)}
                          >
                            <SelectTrigger className="h-8 text-xs font-semibold rounded-lg bg-white border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="APPLIED">Applied</SelectItem>
                              <SelectItem value="REVIEWING">Reviewing</SelectItem>
                              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                              <SelectItem value="ACCEPTED">Accepted</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                          onClick={() => handleOpenHistory(app)}
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Log</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Status Change */}
      <Dialog
        open={!!statusDialogApp}
        onOpenChange={(open) => !open && setStatusDialogApp(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Confirm Hiring Status Change
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to transition candidate{' '}
              <span className="font-bold text-slate-900">
                {statusDialogApp?.jobSeeker?.name}
              </span>{' '}
              to stage{' '}
              <span className="font-bold text-blue-600">{newStatus}</span>?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border bg-slate-50 p-3 space-y-1 text-xs text-slate-600 my-1">
            <p className="font-semibold text-slate-800">Timeline Notice</p>
            <p>
              This update will be permanently recorded in the candidate's application history timeline with an exact timestamp.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStatusDialogApp(null)}
              disabled={statusUpdating}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteStatusChange}
              disabled={statusUpdating}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700"
            >
              {statusUpdating ? 'Updating...' : 'Confirm Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Timeline Dialog */}
      <Dialog
        open={!!historyDialogApp}
        onOpenChange={(open) => !open && setHistoryDialogApp(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <History className="w-5 h-5 text-blue-600" />
              Candidate Progress Timeline
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {historyDialogApp?.jobSeeker?.name} &bull; {job?.title}
            </DialogDescription>
          </DialogHeader>

          {historyLoading ? (
            <div className="py-8">
              <LoadingSpinner text="Retrieving verified history..." />
            </div>
          ) : history.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No status records logged yet.
            </p>
          ) : (
            <div className="py-3">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {history.map((h, index) => (
                  <div key={h.id} className="relative flex flex-col gap-1">
                    <div
                      className={`absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-white ${
                        index === 0 ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-400'
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          index === 0 ? 'bg-blue-600' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={h.status} />
                      {index === 0 && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {new Date(h.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
