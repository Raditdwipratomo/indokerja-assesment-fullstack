import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Briefcase,
  Building2,
  UserCircle,
  LogOut,
  Menu,
  FileText,
  PlusCircle,
  MapPin,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Desktop Nav Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-xs transition-transform group-hover:scale-105">
              IK
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                Indo<span className="text-blue-600">Kerja</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Careers &bull; ID
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {user?.role === 'COMPANY' ? (
              <>
                <Link to="/company/jobs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 text-xs font-semibold rounded-full px-4 ${
                      isActive('/company/jobs')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Manage Jobs
                  </Button>
                </Link>
                <Link to="/company/jobs/create">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 text-xs font-semibold rounded-full px-4 ${
                      isActive('/company/jobs/create')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Post a Job
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/jobs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 text-xs font-semibold rounded-full px-4 ${
                      isActive('/jobs') || isActive('/')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Find Jobs
                  </Button>
                </Link>
                {user && (
                  <Link to="/applications">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 text-xs font-semibold rounded-full px-4 ${
                        isActive('/applications')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      My Applications
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Location Pill, Profile / Auth Actions */}
        <div className="flex items-center gap-3">
          {/* Location Badge (as seen in reference) */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <span>Indonesia</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[11px] font-semibold border-slate-200 text-slate-600 bg-slate-50"
              >
                {user.role === 'COMPANY' ? 'Employer' : 'Job Seeker'}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-1 pl-2 hover:bg-slate-100 transition-colors focus:outline-none">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs shadow-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-800">
                      {user.name}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'JOB_SEEKER' ? (
                    <DropdownMenuItem asChild>
                      <Link to="/applications" className="cursor-pointer gap-2 text-xs">
                        <FileText className="h-3.5 w-3.5" />
                        My Applications
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/company/jobs" className="cursor-pointer gap-2 text-xs">
                        <Building2 className="h-3.5 w-3.5" />
                        Manage Company Jobs
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 text-xs"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs font-semibold">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-xs font-semibold rounded-full px-4 bg-blue-600 hover:bg-blue-700">
                  Register
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  For Employers
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left font-black text-blue-600">
                  IndoKerja.id
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-3">
                {user && (
                  <div className="pb-3 border-b border-slate-100">
                    <p className="font-bold text-sm text-slate-900">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {user.role === 'COMPANY' ? 'Employer' : 'Job Seeker'}
                    </Badge>
                  </div>
                )}

                <div className="space-y-1">
                  <Link to="/jobs" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold">
                      <Briefcase className="w-4 h-4" />
                      Find Jobs
                    </Button>
                  </Link>

                  {user?.role === 'JOB_SEEKER' && (
                    <Link to="/applications" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold">
                        <FileText className="w-4 h-4" />
                        My Applications
                      </Button>
                    </Link>
                  )}

                  {user?.role === 'COMPANY' && (
                    <>
                      <Link to="/company/jobs" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold">
                          <Building2 className="w-4 h-4" />
                          Manage Jobs
                        </Button>
                      </Link>
                      <Link to="/company/jobs/create" onClick={() => setMobileOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-xs font-semibold">
                          <PlusCircle className="w-4 h-4" />
                          Post a Job
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  {user ? (
                    <Button
                      variant="destructive"
                      className="w-full gap-2 text-xs font-semibold"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" className="w-full text-xs font-semibold">
                          Login
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        <Button className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
