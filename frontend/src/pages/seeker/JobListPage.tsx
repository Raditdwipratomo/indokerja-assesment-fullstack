import { useState, useEffect, useMemo } from 'react';
import { jobsService } from '../../services/jobs.service';
import { applicationsService } from '../../services/applications.service';
import { useAuth } from '../../hooks/useAuth';
import { Job, JobType, Application } from '../../types';
import { JobCard } from '../../components/shared/JobCard';
import { JobAlertCard } from '../../components/shared/JobAlertCard';
import { FilterSidebar, FilterState } from '../../components/shared/FilterSidebar';
import { SearchBar, SearchParams } from '../../components/shared/SearchBar';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorState } from '../../components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal, Sparkles, Briefcase } from 'lucide-react';

const initialFilters: FilterState = {
  jobTypes: [],
  remoteOnly: false,
  experienceLevels: [],
  salaryTier: 'ALL',
};

export function JobListPage() {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    location: '',
    jobType: 'ALL',
    experience: 'ALL',
  });
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sortBy, setSortBy] = useState<'NEWEST' | 'SALARY_HIGH' | 'TITLE'>('NEWEST');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch initial jobs and seeker applications
  const fetchData = async () => {
    setLoading(true);
    try {
      const jobsPromise = jobsService.getJobs();
      const appsPromise =
        user?.role === 'JOB_SEEKER'
          ? applicationsService.getMyApplications()
          : Promise.resolve({ data: [] });

      const [jobsRes, appsRes] = await Promise.all([jobsPromise, appsPromise]);
      setAllJobs(jobsRes.data || []);
      setUserApplications(appsRes.data || []);
      setError('');
    } catch {
      setError('Failed to load job listings. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Client-side multi-dimensional filtering & sorting
  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // Keyword filter (title, company, description)
    if (searchParams.keyword.trim()) {
      const q = searchParams.keyword.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company?.name.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q)
      );
    }

    // Location filter
    if (searchParams.location.trim()) {
      const loc = searchParams.location.toLowerCase();
      result = result.filter((job) => job.location.toLowerCase().includes(loc));
    }

    // Top SearchBar Job Type filter
    if (searchParams.jobType !== 'ALL') {
      result = result.filter((job) => job.jobType === searchParams.jobType);
    }

    // Sidebar Job Types filter
    if (filters.jobTypes.length > 0) {
      result = result.filter((job) => filters.jobTypes.includes(job.jobType));
    }

    // Remote Only filter
    if (filters.remoteOnly) {
      result = result.filter((job) =>
        job.location.toLowerCase().includes('remote')
      );
    }

    // Experience filter (matching searchBar and sidebar)
    if (searchParams.experience !== 'ALL') {
      const exp = searchParams.experience;
      result = result.filter((job) => {
        const t = job.title.toLowerCase();
        if (exp === 'ENTRY') return t.includes('intern') || t.includes('fresh') || t.includes('junior');
        if (exp === 'JUNIOR') return t.includes('junior') || (!t.includes('senior') && !t.includes('lead'));
        if (exp === 'MID') return !t.includes('senior') && !t.includes('intern');
        if (exp === 'SENIOR') return t.includes('senior') || t.includes('lead') || t.includes('architect');
        return true;
      });
    }

    // Salary Tier filter
    if (filters.salaryTier !== 'ALL') {
      if (filters.salaryTier === 'UNDER_8M') {
        result = result.filter((job) => job.salary < 8000000);
      } else if (filters.salaryTier === '8M_15M') {
        result = result.filter((job) => job.salary >= 8000000 && job.salary <= 15000000);
      } else if (filters.salaryTier === 'ABOVE_15M') {
        result = result.filter((job) => job.salary > 15000000);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'SALARY_HIGH') return b.salary - a.salary;
      if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [allJobs, searchParams, filters, sortBy]);

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSearchParams({
      keyword: '',
      location: '',
      jobType: 'ALL',
      experience: 'ALL',
    });
  };

  const appliedJobIds = useMemo(() => {
    return new Set(userApplications.map((app) => app.jobId));
  }, [userApplications]);

  return (
    <div className="space-y-6">
      {/* Top Search Bar Widget */}
      <section className="space-y-2">
        <SearchBar
          onSearch={(params) => setSearchParams(params)}
          initialParams={searchParams}
        />
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            totalResults={filteredJobs.length}
          />
        </aside>

        {/* Right Column: Job Listing Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Header controls: Title, Count, Mobile Filter Trigger & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Recommended Jobs
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {filteredJobs.length}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Mobile Filter Drawer Trigger */}
              <div className="lg:hidden">
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto p-4">
                    <SheetHeader className="pb-4">
                      <SheetTitle className="text-left font-bold">Search Filters</SheetTitle>
                    </SheetHeader>
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={(newF) => {
                        setFilters(newF);
                        setMobileFilterOpen(false);
                      }}
                      onReset={() => {
                        handleResetFilters();
                        setMobileFilterOpen(false);
                      }}
                      totalResults={filteredJobs.length}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="hidden sm:inline">Sort by:</span>
                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                  <SelectTrigger className="h-9 w-38 text-xs font-semibold bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWEST">Most Recent</SelectItem>
                    <SelectItem value="SALARY_HIGH">Highest Salary</SelectItem>
                    <SelectItem value="TITLE">Job Title (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Job Cards Grid */}
          {error ? (
            <ErrorState message={error} onRetry={fetchData} />
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              title="No matching job opportunities"
              description="We couldn't find any positions matching your selected filters and keyword."
              icon={<Briefcase className="h-12 w-12 text-slate-300" />}
              action={
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredJobs.map((job, idx) => {
                const hasApplied = appliedJobIds.has(job.id);
                // Render the JobAlertCard in slot 3 to match the reference layout!
                if (idx === 2) {
                  return (
                    <div key="promo-slot" className="contents">
                      <JobAlertCard />
                      <JobCard key={job.id} job={job} hasApplied={hasApplied} />
                    </div>
                  );
                }
                return <JobCard key={job.id} job={job} hasApplied={hasApplied} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
