import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Send, GraduationCap, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ItemFormCard } from '@/components/ItemFormCard';
import { SCHOOL_CATEGORIES, MAX_ITEMS } from '@/lib/constants';
import { submissionSchema, type SubmissionFormData, type ItemFormData } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAndSanitizeError } from '@/lib/error-utils';

const emptyItem = (): ItemFormData => ({ itemType: undefined as any, language: null });

export default function SubmissionForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, any>>({});
  
  // Honeypot field for spam protection (should remain empty)
  const honeypotRef = useRef<HTMLInputElement>(null);
  // Track form load time for timing-based protection
  const formLoadTime = useRef(Date.now());

  const [form, setForm] = useState<SubmissionFormData>({
    schoolName: '',
    category: undefined as any,
    teacherName: '',
    phoneNumber: '',
    items: [emptyItem()],
  });

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'submissions_open').maybeSingle()
      .then(({ data }) => {
        if (data) setSubmissionsOpen(data.value === 'true');
        setLoading(false);
      });
  }, []);

  const addItem = () => {
    if (form.items.length < MAX_ITEMS) {
      setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
    }
  };

  const removeItem = (idx: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx: number, item: ItemFormData) => {
    setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? item : it) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Honeypot check - if filled, silently reject (bot detection)
    if (honeypotRef.current?.value) {
      // Fake success to confuse bots
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/confirmation', { state: { school: { school_name: form.schoolName }, items: [] } });
      return;
    }

    // Timing check - submissions faster than 3 seconds are likely bots
    const timeSpent = Date.now() - formLoadTime.current;
    if (timeSpent < 3000) {
      toast({ title: 'Please slow down', description: 'Please take your time filling out the form.', variant: 'destructive' });
      return;
    }

    const result = submissionSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, any> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      toast({ title: 'Validation Error', description: 'Please fix the highlighted fields.', variant: 'destructive' });
      return;
    }

    // Check for Play items missing language
    for (let i = 0; i < form.items.length; i++) {
      if (form.items[i].itemType === 'Play' && !form.items[i].language) {
        setErrors(prev => ({ ...prev, [`items.${i}.language`]: 'Language is required for Play items' }));
        toast({ title: 'Validation Error', description: 'Language is required for Play items.', variant: 'destructive' });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Submit via edge function with rate limiting
      const { data, error } = await supabase.functions.invoke('submit-registration', {
        body: {
          schoolName: form.schoolName.trim(),
          category: form.category,
          teacherName: form.teacherName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          items: form.items.map(item => ({
            itemType: item.itemType,
            language: item.language || null,
          })),
          formLoadTime: formLoadTime.current,
        },
      });

      if (error) {
        throw new Error(error.message || 'Submission failed');
      }

      if (!data.success) {
        // Handle specific errors from the edge function
        if (data.error?.includes('already registered')) {
          setErrors({ schoolName: 'This school is already registered in the system.' });
        }
        throw new Error(data.error || 'Submission failed');
      }

      // Navigate to confirmation
      navigate('/confirmation', {
        state: { school: data.school, items: data.items },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '';
      
      // Handle rate limiting with specific message
      if (errorMessage.includes('Too many submissions')) {
        toast({ 
          title: 'Rate Limited', 
          description: 'Too many submissions from your location. Please try again in an hour.', 
          variant: 'destructive' 
        });
      } else {
        // Use sanitized error for all other cases
        toast({ title: 'Submission Failed', description: logAndSanitizeError(err, 'general', 'Submission error'), variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!submissionsOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-secondary mx-auto" />
            <h2 className="text-xl font-heading font-bold text-foreground">Submissions Closed</h2>
            <p className="text-muted-foreground">The submission period is currently closed. Please check back later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-1 text-sm opacity-80 hover:opacity-100 mb-3 transition-opacity duration-200">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold">Creative Items Registration</h1>
              <p className="text-sm opacity-90">Register your school's creative performance items</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section A: School Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Section A: School Details
              </CardTitle>
              <CardDescription>Enter your school information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>School Name *</Label>
                <Input
                  value={form.schoolName}
                  onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                  placeholder="Enter school name"
                />
                {errors.schoolName && <p className="text-sm text-destructive">{errors.schoolName}</p>}
              </div>

              <div className="space-y-2">
                <Label>School Category *</Label>
                <Select
                  value={form.category || ''}
                  onValueChange={val => setForm(f => ({ ...f, category: val as any }))}
                >
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {SCHOOL_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label>Teacher Name *</Label>
                <Input
                  value={form.teacherName}
                  onChange={e => setForm(f => ({ ...f, teacherName: e.target.value }))}
                  placeholder="Enter teacher name"
                />
                {errors.teacherName && <p className="text-sm text-destructive">{errors.teacherName}</p>}
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Section B: Item Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-secondary"></span>
                Section B: Item Registration
              </CardTitle>
              <CardDescription>Register up to {MAX_ITEMS} creative performance items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.items.map((item, idx) => (
                <div key={idx}>
                  <ItemFormCard
                    index={idx}
                    item={item}
                    onChange={(updated) => updateItem(idx, updated)}
                    onRemove={() => removeItem(idx)}
                    canRemove={form.items.length > 1}
                    errors={{
                      itemType: errors[`items.${idx}.itemType`],
                      language: errors[`items.${idx}.language`],
                    }}
                  />
                </div>
              ))}

              {form.items.length < MAX_ITEMS && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addItem} 
                  className="w-full group"
                >
                  <Plus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                  Add Item ({form.items.length}/{MAX_ITEMS})
                </Button>
              )}

              {form.items.length >= MAX_ITEMS && (
                <p className="text-sm text-muted-foreground text-center">
                  Maximum of {MAX_ITEMS} items reached.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Honeypot field - hidden from users, catches bots */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
            <label htmlFor="website">Website</label>
            <input
              ref={honeypotRef}
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold group" 
            disabled={submitting}
          >
            <Send className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </form>
      </main>
    </div>
  );
}
