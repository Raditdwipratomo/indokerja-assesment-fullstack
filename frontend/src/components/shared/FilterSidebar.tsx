import { JobType } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RotateCcw, ChevronDown, Sparkles } from 'lucide-react';

export interface FilterState {
  jobTypes: JobType[];
  remoteOnly: boolean;
  experienceLevels: string[];
  salaryTier: string; // 'ALL' | 'UNDER_8M' | '8M_15M' | 'ABOVE_15M'
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults?: number;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}: FilterSidebarProps) {
  const toggleJobType = (type: JobType) => {
    const exists = filters.jobTypes.includes(type);
    const updated = exists
      ? filters.jobTypes.filter((t) => t !== type)
      : [...filters.jobTypes, type];
    onFilterChange({ ...filters, jobTypes: updated });
  };

  const toggleExperience = (exp: string) => {
    const exists = filters.experienceLevels.includes(exp);
    const updated = exists
      ? filters.experienceLevels.filter((e) => e !== exp)
      : [...filters.experienceLevels, exp];
    onFilterChange({ ...filters, experienceLevels: updated });
  };

  const setSalaryTier = (tier: string) => {
    onFilterChange({
      ...filters,
      salaryTier: filters.salaryTier === tier ? 'ALL' : tier,
    });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-900 text-base">Filters</h2>
          {totalResults !== undefined && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {totalResults}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Salary Range (Inspired by Reference Image Histogram) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Salary Range (Monthly)
          </Label>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>

        {/* Visual Histogram Graphic inspired by reference */}
        <div className="flex items-end justify-between gap-1 h-10 px-1 pt-2">
          {[25, 40, 65, 30, 85, 95, 70, 50, 80, 45, 60, 30, 20].map((h, i) => (
            <div
              key={i}
              className={`w-full rounded-t-xs transition-all ${
                i >= 2 && i <= 8 ? 'bg-blue-500' : 'bg-slate-200'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* Salary Preset Chips */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSalaryTier('UNDER_8M')}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium text-left transition-colors ${
              filters.salaryTier === 'UNDER_8M'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            &lt; Rp8.000.000
          </button>
          <button
            type="button"
            onClick={() => setSalaryTier('8M_15M')}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium text-left transition-colors ${
              filters.salaryTier === '8M_15M'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Rp8jt - Rp15jt
          </button>
          <button
            type="button"
            onClick={() => setSalaryTier('ABOVE_15M')}
            className={`col-span-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-left transition-colors ${
              filters.salaryTier === 'ABOVE_15M'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            &gt; Rp15.000.000+
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Open to Remote Toggle (Inspired by Reference Image) */}
      <div className="flex items-center justify-between py-1">
        <div className="space-y-0.5">
          <Label
            htmlFor="remote-toggle"
            className="text-xs font-bold text-slate-800 cursor-pointer"
          >
            Open to Remote
          </Label>
          <p className="text-[11px] text-slate-400">Work from anywhere in Indonesia</p>
        </div>
        <button
          type="button"
          id="remote-toggle"
          role="switch"
          aria-checked={filters.remoteOnly}
          onClick={() => onFilterChange({ ...filters, remoteOnly: !filters.remoteOnly })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            filters.remoteOnly ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              filters.remoteOnly ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="border-t border-slate-100" />

      {/* Job Type Checkboxes */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Employment Type
        </Label>
        <div className="space-y-2">
          {[
            { id: 'FULL_TIME' as JobType, label: 'Full Time' },
            { id: 'PART_TIME' as JobType, label: 'Part Time' },
            { id: 'CONTRACT' as JobType, label: 'Contract' },
            { id: 'INTERNSHIP' as JobType, label: 'Internship' },
          ].map((item) => {
            const checked = filters.jobTypes.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleJobType(item.id)}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className={checked ? 'font-semibold text-slate-900' : ''}>
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Experience Level */}
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Experience Level
        </Label>
        <div className="space-y-2">
          {[
            { id: 'ENTRY', label: 'Entry Level / Fresh Grad' },
            { id: 'JUNIOR', label: 'Junior (1-2 years)' },
            { id: 'MID', label: 'Mid-Level (3-4 years)' },
            { id: 'SENIOR', label: 'Senior / Lead (5+ years)' },
          ].map((item) => {
            const checked = filters.experienceLevels.includes(item.id);
            return (
              <label
                key={item.id}
                className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleExperience(item.id)}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className={checked ? 'font-semibold text-slate-900' : ''}>
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
