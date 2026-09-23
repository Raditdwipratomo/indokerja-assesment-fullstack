import { ApplicationStatus } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, CheckCircle2, XCircle, Award } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case 'APPLIED':
      return (
        <Badge variant="secondary" className="gap-1 bg-slate-100 text-slate-800 border-slate-300">
          {showIcon && <Clock className="w-3 h-3" />}
          Applied
        </Badge>
      );
    case 'REVIEWING':
      return (
        <Badge variant="info" className="gap-1">
          {showIcon && <Eye className="w-3 h-3" />}
          Reviewing
        </Badge>
      );
    case 'SHORTLISTED':
      return (
        <Badge variant="warning" className="gap-1">
          {showIcon && <Award className="w-3 h-3" />}
          Shortlisted
        </Badge>
      );
    case 'ACCEPTED':
      return (
        <Badge variant="success" className="gap-1">
          {showIcon && <CheckCircle2 className="w-3 h-3" />}
          Accepted
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="destructive" className="gap-1">
          {showIcon && <XCircle className="w-3 h-3" />}
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
