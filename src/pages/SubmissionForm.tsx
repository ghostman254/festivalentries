import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Send, GraduationCap, AlertCircle, ArrowLeft, School, Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ItemFormCard } from '@/components/ItemFormCard';
import { SCHOOL_CATEGORIES, MAX_ITEMS } from '@/lib/constants';
import { getAllowedItemTypes } from '@/lib/regulations';
import { submissionSchema, type SubmissionFormData, type ItemFormData } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAndSanitizeError } from '@/lib/error-utils';

const emptyItem = (): ItemFormData => ({ itemType: undefined as any, language: null });

// Client-side normalization mirroring the backend logic
const STOP_WORDS = ['school', 'schools', 'academy', 'academies', 'comprehensive', 'primary', 'nursery', 'preparatory', 'prep', 'college', 'institute', 'institution', 'centre', 'center', 'learning'];

function normalizeSchoolName(name: string): string {
  const words = name.toLowerCase().trim().replace(/\s+/g, ' ').split(' ');
  const filtered = words.filter(w => !STOP_WORDS.includes(w));
  return filtered.length > 0 ? filtered.join(' ') : words.join(' ');
}

const CATEGORY_COLORS: Record<string, string> = {
  'Pre School': 'bg-amber-100 text-amber-800 border-amber-200',
  'Lower Grade': 'bg-blue-100 text-blue-800 border-blue-200',
  'Primary': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Junior Academy': 'bg-purple-100 text-purple-800 border-purple-200',
};

function RegisteredSchoolsList({ schools, search }: { schools: { school_name: string; category: string }[]; search: string }) {
  const grouped = useMemo(() => {
    const filtered = schools.filter(s => s.school_name.toLowerCase().includes(search.toLowerCase()));
    const map: Record<string, string[]> = {};
    for (const s of filtered) {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s.school_name);
    }
    return map;
  }, [schools, search]);

  const categories = Object.keys(grouped);

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No matching schools found.</p>;
  }

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
      {categories.map(cat => (
        <div key={cat}>
          <p className={`text-xs font-semibold mb-1.5 px-2 py-1 rounded-md border ${CATEGORY_COLORS[cat] || 'bg-muted text-muted-foreground'}`}>
            {cat} ({grouped[cat].length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grouped[cat].map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs bg-muted/60 text-foreground rounded-full px-2.5 py-1 border border-border"
              >
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                {name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SubmissionForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [registeredSchools, setRegisteredSchools] = useState<{ school_name: string; category: string }[]>([]);
  const [schoolSearch, setSchoolSearch] = useState('');
  
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

  // Live duplicate detection
  const duplicateMatch = useMemo(() => {
    const typed = form.schoolName.trim();
    if (typed.length < 3 || registeredSchools.length === 0) return null;
    const normalizedTyped = normalizeSchoolName(typed);
    if (!normalizedTyped) return null;
    return registeredSchools.find(s => normalizeSchoolName(s.school_name) === normalizedTyped) || null;
  }, [form.schoolName, registeredSchools]);

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'submissions_open').maybeSingle()
      .then(({ data }) => {
        if (data) setSubmissionsOpen(data.value === 'true');
        setLoading(false);
      });
    // Fetch registered schools
    supabase.rpc('get_registered_school_names').then(({ data }) => {
      if (data) setRegisteredSchools(data);
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
        if (data.error?.includes('already registered')) {
          setErrors({ schoolName: 'This school is already registered in the system.' });
        }
        throw new Error(data.error || 'Submission failed');
      }

      // Refresh registered schools list
      const { data: updatedSchools } = await supabase.rpc('get_registered_school_names');
      if (updatedSchools) setRegisteredSchools(updatedSchools);

      navigate('/confirmation', {
        state: { school: data.school, items: data.items },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '';
      
      if (errorMessage.includes('Too many submissions')) {
        toast({ 
          title: 'Rate Limited', 
          description: 'Too many submissions from your location. Please try again in an hour.', 
          variant: 'destructive' 
        });
      } else {
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
        <div className="max-w-6xl mx-auto relative z-10">
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Registration Form */}
          <div className="flex-1 max-w-2xl">
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
                      className={duplicateMatch ? 'border-amber-500 focus-visible:ring-amber-500' : ''}
                    />
                    {duplicateMatch && (
                      <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="text-sm">
                          This name closely matches <span className="font-semibold">"{duplicateMatch.school_name}"</span> ({duplicateMatch.category}), which is already registered. Duplicate submissions will be rejected.
                        </p>
                      </div>
                    )}
                    {errors.schoolName && <p className="text-sm text-destructive">{errors.schoolName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>School Category *</Label>
                    <Select
                      value={form.category || ''}
                      onValueChange={val => {
                        const newCategory = val as any;
                        const allowed = getAllowedItemTypes(newCategory);
                        // Reset items that aren't allowed in the new category
                        const resetItems = form.items.map(it => 
                          it.itemType && !allowed.includes(it.itemType) 
                            ? { itemType: undefined as any, language: null } 
                            : it
                        );
                        setForm(f => ({ ...f, category: newCategory, items: resetItems }));
                      }}
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
                  <CardDescription>
                    Register up to {MAX_ITEMS} creative performance items
                    {!form.category && <span className="block text-xs mt-1 text-amber-600">Please select a school category first to see available items.</span>}
                  </CardDescription>
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
                        allowedItems={form.category ? getAllowedItemTypes(form.category) : undefined}
                        category={form.category}
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
          </div>

          {/* Right: Registered Schools Sidebar */}
          <aside className="lg:w-80 w-full lg:sticky lg:top-8 lg:self-start order-first lg:order-last">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  Registered Schools
                </CardTitle>
                <CardDescription className="text-xs">
                  {registeredSchools.length} school{registeredSchools.length !== 1 ? 's' : ''} registered so far
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {registeredSchools.length > 0 ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search schools..."
                        value={schoolSearch}
                        onChange={e => setSchoolSearch(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                    <RegisteredSchoolsList
                      schools={registeredSchools}
                      search={schoolSearch}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No schools registered yet. Be the first!</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
