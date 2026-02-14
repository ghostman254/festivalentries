import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, School, GraduationCap, User, Phone, Music } from 'lucide-react';
import type { SubmissionFormData } from '@/lib/validation';
import { getItemRegulation } from '@/lib/regulations';

interface SubmissionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: SubmissionFormData;
  onConfirm: () => void;
  submitting: boolean;
}

export function SubmissionConfirmDialog({ open, onOpenChange, form, onConfirm, submitting }: SubmissionConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Confirm Submission
          </DialogTitle>
          <DialogDescription>
            Please review your details before submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* School Details */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">School Details</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{form.schoolName}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                <Badge variant="secondary">{form.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary shrink-0" />
                <span>{form.teacherName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{form.phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Items ({form.items.length})
            </p>
            <div className="space-y-2">
              {form.items.map((item, idx) => {
                const reg = form.category ? getItemRegulation(form.category, item.itemType) : undefined;
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{item.itemType}</span>
                    {item.language && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.language}</Badge>
                    )}
                    {reg && (
                      <span className="text-[10px] text-muted-foreground ml-auto">{reg.maxTime}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Go Back
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Submitting...' : 'Confirm & Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
