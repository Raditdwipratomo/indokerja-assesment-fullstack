import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, UserCheck, Building } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);

    try {
      const authData = await authService.login(email, password);
      login(authData.token, authData.user);
      toast.success(`Welcome back, ${authData.user.name}!`);

      // Determine redirect path
      const targetPath = authData.user.role === 'COMPANY' ? '/company/jobs' : '/jobs';
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please verify your credentials.';
      toast.error('Authentication Error', { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: 'SEEKER' | 'COMPANY') => {
    if (role === 'SEEKER') {
      setEmail('seeker@example.com');
      setPassword('password123');
    } else {
      setEmail('company@example.com');
      setPassword('password123');
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
            Sign in to IndoKerja.id
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <Card className="shadow-xs">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Account Login</CardTitle>
              <CardDescription>
                Use your registered email and password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                <LogIn className="w-4 h-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Demo Credentials Quick-Fill helper for Recruiter */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quick Demo Accounts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => fillDemoAccount('SEEKER')}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Job Seeker
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => fillDemoAccount('COMPANY')}
                  >
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    Company
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline ml-1">
                Register here
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
