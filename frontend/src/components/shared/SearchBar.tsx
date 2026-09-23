import { useState } from 'react';
import { Search, MapPin, Briefcase, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobType } from '../../types';

export interface SearchParams {
  keyword: string;
  location: string;
  jobType: string;
  experience: string;
}

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  initialParams?: Partial<SearchParams>;
}

export function SearchBar({ onSearch, initialParams }: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialParams?.keyword || '');
  const [location, setLocation] = useState(initialParams?.location || '');
  const [jobType, setJobType] = useState(initialParams?.jobType || 'ALL');
  const [experience, setExperience] = useState(initialParams?.experience || 'ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keyword, location, jobType, experience });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-sm transition-all focus-within:border-blue-400 focus-within:shadow-md"
    >
      <div className="flex flex-col lg:flex-row lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Keyword / Job Title */}
        <div className="flex flex-1 items-center px-3 py-2 sm:py-1.5">
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2.5" />
          <Input
            type="text"
            placeholder="Job title, keywords, or company..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-9 border-0 p-0 shadow-none focus-visible:ring-0 text-sm text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Location Input */}
        <div className="flex flex-1 items-center px-3 py-2 sm:py-1.5">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0 mr-2.5" />
          <Input
            type="text"
            placeholder="City, province, or 'Remote'..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-9 border-0 p-0 shadow-none focus-visible:ring-0 text-sm text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Experience Selector */}
        <div className="flex items-center px-3 py-2 sm:py-1.5 lg:w-44">
          <Award className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger className="h-9 border-0 p-0 shadow-none focus:ring-0 text-xs font-medium text-slate-700">
              <SelectValue placeholder="Experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Experience</SelectItem>
              <SelectItem value="ENTRY">Entry Level</SelectItem>
              <SelectItem value="JUNIOR">Junior (1-2y)</SelectItem>
              <SelectItem value="MID">Mid-Level (3-4y)</SelectItem>
              <SelectItem value="SENIOR">Senior (5+y)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Type Selector */}
        <div className="flex items-center px-3 py-2 sm:py-1.5 lg:w-40">
          <Briefcase className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="h-9 border-0 p-0 shadow-none focus:ring-0 text-xs font-medium text-slate-700">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Action Button */}
        <div className="p-1 sm:p-0 sm:pl-2">
          <Button
            type="submit"
            className="w-full lg:w-auto px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs gap-2 transition-all"
          >
            <span>Search Jobs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
