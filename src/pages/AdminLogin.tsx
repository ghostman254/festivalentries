import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAndSanitizeError } from '@/lib/error-utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Use the is_admin RPC which handles both admin and super_admin roles
        const { data: isAdmin } = await supabase.rpc('is_admin', { check_user_id: session.user.id });
        
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          toast({ 
            title: 'Access Denied', 
            description: 'You do not have administrator privileges.', 
            variant: 'destructive' 
          });
          await supabase.auth.signOut();
        }
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: isAdmin } = await supabase.rpc('is_admin', { check_user_id: session.user.id });
        
        if (isAdmin) {
          navigate('/admin', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast({ title: 'Validation Error', description: result.error.issues[0].message, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      // The onAuthStateChange callback will handle navigation after role check
    } catch (err: unknown) {
      toast({ title: 'Error', description: logAndSanitizeError(err, 'auth', 'Login error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Access the administration dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@school.edu" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Please wait...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
