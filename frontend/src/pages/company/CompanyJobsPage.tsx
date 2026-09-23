import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Users,
  MapPin,
  Calendar,
  Building2,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import { Job, JobType } from '../../types';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorState } from '../../components/shared/ErrorState';
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

interface JobWithCount extends Job {
  _count?: {
    applications: number;
  };
}

export function CompanyJobsPage() {
  const [jobs, setJobs] = useState<JobWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await jobsService.getMyJobs();
      setJobs((response.data as JobWithCount[]) || []);
      setError('');
    } catch {
      setError('Failed to load your company job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const totalApplicants = jobs.reduce((acc, j) => acc + (j._count?.applications || 0), 0);
    return { totalJobs, totalApplicants };
  }, [jobs]);

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

  if (loading) return <LoadingSpinner text="Loading your recruitment dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchJobs} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Employer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your company's open positions, track applicants, and update hiring stages.
          </p>
        </div>
        <Link to="/company/jobs/create">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 font-semibold text-xs rounded-xl shadow-xs">
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Job Openings
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">{metrics.totalJobs}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Candidate Applications
              </p>
              <p className="text-3xl font-black text-indigo-600 mt-1">
                {metrics.totalApplicants}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Company Status
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-emerald-700">Verified Employer</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Jobs Listing */}
      {jobs.length === 0 ? (
        <EmptyState
          title="No active job listings"
          description="Your company hasn't posted any job openings yet. Create your first opening to attract top Indonesian talent."
          icon={<Briefcase className="w-12 h-12 text-slate-300" />}
          action={
            <Link to="/company/jobs/create">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Post First Job Opening
              </Button>
            </Link>
          }
        />
      ) : (
        <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Your Published Openings</CardTitle>
                <CardDescription className="text-xs">
                  Review submitted applications and progress candidate statuses.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">
                {jobs.length} Active Positions
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75 text-xs">
                    <TableHead className="font-bold">Job Title</TableHead>
                    <TableHead className="font-bold">Location</TableHead>
                    <TableHead className="font-bold">Compensation</TableHead>
                    <TableHead className="font-bold">Schedule</TableHead>
                    <TableHead className="font-bold text-center">Applicants</TableHead>
                    <TableHead className="font-bold">Date Published</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-bold text-slate-900">
                        {job.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-emerald-600">
                          {formatSalary(job.salary)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[11px] font-medium bg-slate-100">
                          {formatJobType(job.jobType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {job._count?.applications ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/company/jobs/${job.id}/applicants`}>
                          <Button
                            size="sm"
                            className="gap-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>View Candidates ({job._count?.applications ?? 0})</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
