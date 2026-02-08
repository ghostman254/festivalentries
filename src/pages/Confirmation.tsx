import { useLocation, Navigate, Link } from 'react-router-dom';
import { CheckCircle2, GraduationCap, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Confirmation() {
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as { school: any; items: any[] } | null;

  if (!state?.school || !state?.items) {
    return <Navigate to="/" replace />;
  }

  const { school, items } = state;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: `${code} copied to clipboard.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <GraduationCap className="h-8 w-8 flex-shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold">Registration Confirmed</h1>
            <p className="text-sm opacity-90">Your items have been successfully registered</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-2">
          <CheckCircle2 className="h-16 w-16 text-success" />
          <h2 className="text-2xl font-heading font-bold text-foreground">Submission Successful!</h2>
          <p className="text-muted-foreground max-w-md">
            Your creative performance items have been registered. Please save the item codes below.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">School Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">School Name</span>
              <span className="font-medium text-foreground">{school.school_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="secondary">{school.category}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teacher</span>
              <span className="font-medium text-foreground">{school.teacher_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-foreground">{school.phone_number}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registered Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium text-foreground text-sm">{item.item_type}</p>
                  {item.language && (
                    <p className="text-xs text-muted-foreground">Language: {item.language}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold text-primary">
                    {item.item_code}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => copyCode(item.item_code)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-foreground text-center">
              📋 <strong>Important:</strong> Files and scripts will be submitted in a later phase using these item codes.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/">
            <Button variant="outline">Submit Another Registration</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
