import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock,
  Briefcase,
  ShieldCheck,
  Check,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import { applicationsService } from '../../services/applications.service';
import { Job, Application, JobType } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { CompanyLogo } from '../../components/shared/CompanyLogo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [jobRes, appsRes] = await Promise.all([
          jobsService.getJob(id),
          applicationsService.getMyApplications(),
        ]);
        setJob(jobRes.data || null);

        const found = appsRes.data?.find((app) => app.jobId === id);
        setExistingApp(found || null);

        // Check bookmark
        const saved = localStorage.getItem('indokerja_saved_jobs');
        if (saved) {
          const ids = JSON.parse(saved);
          setBookmarked(Array.isArray(ids) && ids.includes(id));
        }
      } catch {
        setError('Failed to load job details. The job may no longer be available.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleApplyConfirm = async () => {
    if (!id) return;
    setApplying(true);
    try {
      const res = await applicationsService.applyJob(id);
      setExistingApp(res.data || null);
      setConfirmDialogOpen(false);
      toast.success('Application submitted successfully!', {
        description: 'You can monitor your review progress in My Applications.',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application.';
      toast.error('Application Failed', { description: msg });
    } finally {
      setApplying(false);
    }
  };

  const toggleBookmark = () => {
    if (!id) return;
    try {
      const saved = localStorage.getItem('indokerja_saved_jobs');
      let ids: string[] = saved ? JSON.parse(saved) : [];
      if (bookmarked) {
        ids = ids.filter((item) => item !== id);
        toast.info('Removed from saved jobs');
      } else {
        ids.push(id);
        toast.success('Saved to your bookmarks');
      }
      localStorage.setItem('indokerja_saved_jobs', JSON.stringify(ids));
      setBookmarked(!bookmarked);
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatJobType = (type: JobType) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Full Time';
      case 'PART_TIME':
        return 'Part Time';
      case 'CONTRACT':
        return 'Contract';
      case 'INTERNSHIP':
        return 'Internship';
      default:
        return type;
    }
  };

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (error || !job) return <ErrorState message={error || 'Job not found'} />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Share Actions */}
      <div className="flex items-center justify-between">
        <Link to="/jobs">
          <Button variant="ghost" size="sm" className="gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to All Jobs
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleBookmark}
            className={`gap-1.5 text-xs ${bookmarked ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            <span>{bookmarked ? 'Saved' : 'Save Job'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Main Job Banner Card */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <CompanyLogo name={job.company?.name || 'Company'} size="lg" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {formatJobType(job.jobType)}
                  </Badge>
                  {job.location.toLowerCase().includes('remote') && (
                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      Remote Friendly
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {job.title}
                </h1>
                <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                  <span>{job.company?.name}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Employer
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Action Button Area */}
            <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
              {existingApp ? (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs w-full sm:w-auto sm:min-w-[280px]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          Application Submitted
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(existingApp.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={existingApp.status} />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full h-8 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 justify-between px-3"
                    >
                      <Link to="/applications">
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <span>View in My Applications</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full md:w-auto px-8 font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
                  onClick={() => setConfirmDialogOpen(true)}
                >
                  Apply for this Position
                </Button>
              )}
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Work Location</p>
                <p className="text-xs font-bold text-slate-800">{job.location}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Monthly Compensation</p>
                <p className="text-xs font-bold text-emerald-700">{formatSalary(job.salary)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Work Schedule</p>
                <p className="text-xs font-bold text-slate-800">{formatJobType(job.jobType)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Detail Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Description & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">About the Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-slate-700 leading-relaxed">
              <div className="whitespace-pre-wrap">
                {job.description || 'No specific description provided for this opening.'}
              </div>

              {/* Responsibilities list */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Key Responsibilities</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Contribute to the end-to-end delivery of products and engineering features.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Collaborate effectively with cross-functional teams including Product, Design, and QA.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Ensure high code quality, performance standards, and security compliance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Maintain documentation and participate actively in agile sprint routines.</span>
                  </li>
                </ul>
              </div>

              {/* Requirements & Qualifications */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Requirements & Qualifications</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Demonstrated professional experience in relevant technology stack or domain.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Strong problem-solving, analytical thinking, and communication skills.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Ability to work both independently and collaboratively in a fast-paced environment.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Company & Overview Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <CompanyLogo name={job.company?.name || 'Company'} size="md" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{job.company?.name}</p>
                  <p className="text-slate-400">Verified Employer &bull; Indonesia</p>
                </div>
              </div>

              <div className="space-y-2.5 text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Industry:</span>
                  <span className="font-medium text-slate-800">Information Technology</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-medium text-slate-800">{job.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Hiring Status:</span>
                  <span className="font-semibold text-emerald-600">Active Recruitment</span>
                </div>
              </div>


            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm Your Application</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              You are about to apply for <span className="font-bold text-slate-900">{job.title}</span> at{' '}
              <span className="font-bold text-slate-900">{job.company?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border bg-slate-50 p-3.5 space-y-1.5 text-xs text-slate-600 my-2">
            <p className="font-semibold text-slate-800">Application Notice</p>
            <p>
              Your verified profile name and contact email will be submitted directly to the employer's recruitment team.
              You cannot submit duplicate applications for the same opening.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={applying}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyConfirm}
              disabled={applying}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700"
            >
              {applying ? 'Submitting...' : 'Confirm & Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
