import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { applicationsService } from '../../services/applications.service';
import { Application, ApplicationHistory } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorState } from '../../components/shared/ErrorState';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CompanyLogo } from '../../components/shared/CompanyLogo';
import {
  FileText,
  History,
  MapPin,
  Calendar,
  ExternalLink,
  Search,
  Clock,
  CheckCircle2,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [history, setHistory] = useState<ApplicationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await applicationsService.getMyApplications();
      setApplications(response.data || []);
      setError('');
    } catch {
      setError('Failed to load your submitted applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleOpenHistory = async (app: Application) => {
    setSelectedApp(app);
    setDialogOpen(true);
    setHistoryLoading(true);
    try {
      const res = await applicationsService.getHistory(app.id);
      setHistory(res.data || []);
    } catch {
      toast.error('Failed to load application history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = applications.length;
    const reviewing = applications.filter((a) => a.status === 'REVIEWING').length;
    const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;
    const accepted = applications.filter((a) => a.status === 'ACCEPTED').length;
    return { total, reviewing, shortlisted, accepted };
  }, [applications]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job?.company?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && ['APPLIED', 'REVIEWING', 'SHORTLISTED'].includes(app.status)) ||
        app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  if (loading) return <LoadingSpinner text="Loading your applications..." />;
  if (error) return <ErrorState message={error} onRetry={fetchApps} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            My Job Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track and monitor the hiring status of your submitted candidacies in real-time.
          </p>
        </div>
        <Link to="/jobs">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs rounded-xl shadow-xs">
            Browse More Jobs
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Submissions</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">In Review</p>
              <p className="text-2xl font-black text-blue-600 mt-1">{metrics.reviewing}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Shortlisted</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{metrics.shortlisted}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Accepted</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.accepted}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 sm:flex rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="ALL" className="text-xs font-semibold rounded-lg">All</TabsTrigger>
            <TabsTrigger value="ACTIVE" className="text-xs font-semibold rounded-lg">Active</TabsTrigger>
            <TabsTrigger value="ACCEPTED" className="text-xs font-semibold rounded-lg">Accepted</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Filter by title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <EmptyState
          title="No applications submitted yet"
          description="You haven't applied to any job openings. Explore current verified vacancies to begin your journey."
          icon={<FileText className="w-12 h-12 text-slate-300" />}
          action={
            <Link to="/jobs">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Vacancies</Button>
            </Link>
          }
        />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title="No matching applications"
          description="Try clearing your search query or choosing another status tab."
          action={
            <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              className="rounded-2xl border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <CompanyLogo name={app.job?.company?.name || 'Company'} size="md" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/jobs/${app.jobId}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-base"
                      >
                        {app.job?.title}
                      </Link>
                      <Link
                        to={`/jobs/${app.jobId}`}
                        className="text-slate-400 hover:text-slate-600"
                        title="View job post"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{app.job?.company?.name}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {app.job?.location}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Status Badge & History CTA */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <StatusBadge status={app.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => handleOpenHistory(app)}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Timeline</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History Timeline Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <History className="w-5 h-5 text-blue-600" />
              Application Status Timeline
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedApp?.job?.title} &bull; {selectedApp?.job?.company?.name}
            </DialogDescription>
          </DialogHeader>

          {historyLoading ? (
            <div className="py-8">
              <LoadingSpinner text="Retrieving verified history..." />
            </div>
          ) : history.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No status events recorded yet.
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
