import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, Mail } from 'lucide-react';
import { toast } from 'sonner';

export function JobAlertCard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = () => {
    if (isSubscribed) {
      toast.info('You are already subscribed to job alerts!');
      return;
    }
    setEmail(user?.email || '');
    setOpen(true);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSubscribed(true);
      setOpen(false);
      toast.success('Job alerts activated!', {
        description: `We'll send the latest jobs to ${email}`,
      });
    }, 400);
  };

  return (
    <>
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#2f82ff] to-[#1a68e5] p-6 text-white shadow-sm">
        {/* Subtle geometric background shapes matching reference */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          {/* Diagonal soft rounded pill ribbons */}
          <div className="absolute -right-8 -top-12 h-36 w-64 rotate-[-35deg] rounded-full bg-white/10 blur-[1px]" />
          <div className="absolute -right-16 top-10 h-28 w-56 rotate-[-35deg] rounded-full bg-white/[0.08]" />
          <div className="absolute -left-12 -bottom-10 h-32 w-52 rotate-[-25deg] rounded-full bg-blue-400/20 blur-md" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-base font-bold leading-snug text-white">
            Never Miss to The Latest Jobs
          </h3>
          <p className="mt-2 text-xs font-normal leading-relaxed text-blue-50/90">
            Be the first to get latest job right to your inbox. We'll send you
            the latest and greatest jobs that match your criteria everyday.
          </p>
        </div>

        {/* CTA Button */}
        <div className="relative z-10 mt-6">
          <button
            type="button"
            onClick={handleOpen}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-3 px-4 text-xs font-semibold text-blue-600 shadow-xs transition hover:bg-blue-50 active:scale-[0.99]"
          >
            {isSubscribed ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Subscribed</span>
              </>
            ) : (
              'Keep me updated'
            )}
          </button>
        </div>
      </div>

      {/* Subscription Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-left">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Get Daily Job Alerts
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              We'll send the latest and greatest jobs that match your criteria directly to your inbox.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubscribe} className="mt-2 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-10 rounded-xl text-xs"
                autoFocus
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white px-5"
              >
                {submitting ? 'Subscribing...' : 'Keep Me Updated'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
