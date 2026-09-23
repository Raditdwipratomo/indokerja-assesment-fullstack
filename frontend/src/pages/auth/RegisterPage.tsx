import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserPlus, UserCheck, Building } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'JOB_SEEKER' | 'COMPANY'>('JOB_SEEKER');
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to role-specific dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === 'COMPANY' ? '/company/jobs' : '/jobs';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Validation Error', { description: 'Please enter your full name or company name.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Validation Error', { description: 'Please enter a valid email address.' });
      return;
    }
    if (password.length < 6) {
      toast.error('Validation Error', { description: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);

    try {
      const authData = await authService.register(name.trim(), email.trim(), password, role);
      login(authData.token, authData.user);
      toast.success('Registration Successful!', {
        description: `Welcome to IndoKerja.id, ${authData.user.name}!`,
      });

      const targetPath = authData.user.role === 'COMPANY' ? '/company/jobs' : '/jobs';
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      toast.error('Registration Error', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-xl shadow-xs">
            IK
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create an IndoKerja Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign up to find jobs or hire talent in Indonesia
          </p>
        </div>

        <Card className="shadow-xs">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-3 pb-4">
              <CardTitle className="text-lg">Account Registration</CardTitle>
              <CardDescription>
                Choose your account role and enter your registration details.
              </CardDescription>

              {/* Role Selection Tabs */}
              <Tabs
                value={role}
                onValueChange={(val) => setRole(val as 'JOB_SEEKER' | 'COMPANY')}
                className="w-full pt-1"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="JOB_SEEKER" className="gap-1.5 text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                    Job Seeker
                  </TabsTrigger>
                  <TabsTrigger value="COMPANY" className="gap-1.5 text-xs">
                    <Building className="w-3.5 h-3.5" />
                    Company / Employer
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {role === 'COMPANY' ? 'Company Name' : 'Full Name'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  placeholder={role === 'COMPANY' ? 'PT Solusi Teknologi Nusantara' : 'Budi Santoso'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder={role === 'COMPANY' ? 'recruitment@company.com' : 'budi@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (min. 6 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                <UserPlus className="w-4 h-4" />
                {loading ? 'Creating Account...' : `Register as ${role === 'COMPANY' ? 'Company' : 'Job Seeker'}`}
              </Button>
            </CardContent>

            <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline ml-1">
                Sign in
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
