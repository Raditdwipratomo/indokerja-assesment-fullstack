import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, PlusCircle } from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
import { JobType } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function CreateJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    jobType: 'FULL_TIME' as JobType,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Validation Error', { description: 'Job title is required.' });
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Validation Error', { description: 'Location is required.' });
      return;
    }
    const salaryNum = Number(formData.salary);
    if (!salaryNum || salaryNum <= 0) {
      toast.error('Validation Error', { description: 'Please enter a valid salary amount greater than 0.' });
      return;
    }

    setLoading(true);
    try {
      await jobsService.createJob({
        title: formData.title.trim(),
        location: formData.location.trim(),
        salary: salaryNum,
        jobType: formData.jobType,
        description: formData.description.trim() || undefined,
      });

      toast.success('Job Created Successfully!', {
        description: 'Your job opening is now active and ready to receive applications.',
      });
      navigate('/company/jobs');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create job posting.';
      toast.error('Error', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/company/jobs">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to My Jobs
        </Button>
      </Link>

      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New Job Listing</CardTitle>
              <CardDescription>
                Provide the position details so prospective job seekers can apply.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                required
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  required
                  placeholder="e.g. Jakarta Selatan or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">
                  Employment Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.jobType}
                  onValueChange={(val: JobType) => setFormData({ ...formData, jobType: val })}
                >
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">
                Monthly Salary (IDR) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="salary"
                type="number"
                min="100000"
                step="50000"
                required
                placeholder="e.g. 12000000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Enter numbers only. E.g. 8000000 for Rp8.000.000
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description & Responsibilities</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe the role requirements, responsibilities, qualifications, and benefits..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-2 border-t">
            <Link to="/company/jobs">
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="gap-2">
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Job'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
