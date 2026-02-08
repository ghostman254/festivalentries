import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, GraduationCap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ItemFormCard } from '@/components/ItemFormCard';
import { SCHOOL_CATEGORIES, MAX_ITEMS, generateItemCode } from '@/lib/constants';
import { submissionSchema, type SubmissionFormData, type ItemFormData } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const emptyItem = (): ItemFormData => ({ itemType: undefined as any, language: null });

export default function SubmissionForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, any>>({});

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
      // Insert school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          school_name: form.schoolName.trim(),
          category: form.category,
          teacher_name: form.teacherName.trim(),
          phone_number: form.phoneNumber.trim(),
          total_items: form.items.length,
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Generate item codes and insert items
      const itemsToInsert = form.items.map((item, idx) => ({
        school_id: school.id,
        item_type: item.itemType,
        language: item.language || null,
        item_code: generateItemCode(form.schoolName, form.category, idx + 1),
      }));

      const { data: items, error: itemsError } = await supabase
        .from('items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) throw itemsError;

      // Navigate to confirmation
      navigate('/confirmation', {
        state: { school, items },
      });
    } catch (err: any) {
      toast({ title: 'Submission Failed', description: err.message || 'Something went wrong.', variant: 'destructive' });
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
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <GraduationCap className="h-8 w-8 flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold">Creative Items Registration</h1>
            <p className="text-sm opacity-90">Register your school's creative performance items</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section A: School Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Section A: School Details</CardTitle>
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
              <CardTitle className="text-lg">Section B: Item Registration</CardTitle>
              <CardDescription>Register up to {MAX_ITEMS} creative performance items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.items.map((item, idx) => (
                <ItemFormCard
                  key={idx}
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
              ))}

              {form.items.length < MAX_ITEMS && (
                <Button type="button" variant="outline" onClick={addItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
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

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </form>
      </main>
    </div>
  );
}
