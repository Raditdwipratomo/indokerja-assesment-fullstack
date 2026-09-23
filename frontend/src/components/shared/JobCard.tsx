import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, Clock, Users, ArrowUpRight, Banknote } from 'lucide-react';
import { Job, JobType } from '../../types';
import { CompanyLogo } from './CompanyLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface JobCardProps {
  job: Job;
  hasApplied?: boolean;
}

export function JobCard({ job, hasApplied = false }: JobCardProps) {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('indokerja_saved_jobs');
      if (saved) {
        const ids = JSON.parse(saved);
        return Array.isArray(ids) && ids.includes(job.id);
      }
    } catch {
      // ignore
    }
    return false;
  });

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const saved = localStorage.getItem('indokerja_saved_jobs');
      let ids: string[] = saved ? JSON.parse(saved) : [];
      if (isBookmarked) {
        ids = ids.filter((id) => id !== job.id);
        toast.info('Removed from saved jobs');
      } else {
        ids.push(job.id);
        toast.success('Job saved to your bookmarks!');
      }
      localStorage.setItem('indokerja_saved_jobs', JSON.stringify(ids));
      setIsBookmarked(!isBookmarked);
    } catch {
      // ignore
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

  // Derive estimated experience level based on job title
  const getExperienceLevel = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('intern')) return 'Internship';
    if (t.includes('senior') || t.includes('lead') || t.includes('architect')) return '4+ years exp';
    if (t.includes('junior') || t.includes('entry') || t.includes('fresh')) return '0-2 years exp';
    return '1-3 years exp';
  };

  // Calculate relative time
  const getRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const expLevel = getExperienceLevel(job.title);
  const relativeTime = getRelativeTime(job.createdAt);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md">
      {/* Top Section: Company Avatar, Title & Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <CompanyLogo name={job.company?.name || 'Company'} size="md" />
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-base line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">
                {job.company?.name}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={toggleBookmark}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              isBookmarked
                ? 'border-blue-200 bg-blue-50 text-blue-600'
                : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:border-slate-300 hover:text-slate-600'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Location & Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center text-slate-500 font-medium">
            <MapPin className="mr-1 h-3.5 w-3.5 text-slate-400 shrink-0" />
            {job.location}
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="inline-flex items-center text-slate-500">
            {expLevel}
          </span>
        </div>

        {/* Salary Highlight */}
        <div className="mt-2.5 flex items-baseline gap-1 text-sm font-bold text-slate-900">
          <span className="text-emerald-600">{formatSalary(job.salary)}</span>
          <span className="text-xs font-normal text-slate-400">/ month</span>
        </div>

        {/* Badges: Job Type & Remote Status */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200">
            {formatJobType(job.jobType)}
          </Badge>
          {job.location.toLowerCase().includes('remote') && (
            <Badge variant="outline" className="text-[11px] font-medium border-emerald-200 bg-emerald-50 text-emerald-700">
              Open to Remote
            </Badge>
          )}
          {hasApplied && (
            <Badge variant="success" className="text-[11px] font-medium">
              Applied
            </Badge>
          )}
        </div>

        {/* Brief preview */}
        {job.description && (
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Card Footer: Timeline, Status Bar & Action */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
        {/* Subtle applicant indicator bar matching the reference image aesthetic */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              <Users className="h-3 w-3 text-slate-400" />
              Verified opening
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {relativeTime}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/5 rounded-full bg-blue-500 transition-all group-hover:w-1/2" />
          </div>
        </div>

        {/* Action Button */}
        <Link to={`/jobs/${job.id}`} className="block">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-xs font-semibold text-slate-700 hover:border-primary hover:bg-primary hover:text-white transition-all group-hover:border-slate-300"
          >
            <span>{hasApplied ? 'View My Application' : 'View Job Details'}</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
