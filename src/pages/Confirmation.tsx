import { useLocation, Navigate, Link } from 'react-router-dom';
import { CheckCircle2, GraduationCap, Copy, Sparkles } from 'lucide-react';
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
      <header className="bg-primary text-primary-foreground py-6 px-4 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse-ring"></div>
        </div>
        
        <div className="max-w-2xl mx-auto flex items-center gap-3 relative z-10 animate-fade-in">
          <GraduationCap className="h-8 w-8 flex-shrink-0 animate-bounce-subtle" />
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold">Registration Confirmed</h1>
            <p className="text-sm opacity-90">Your items have been successfully registered</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2 animate-scale-in">
          <div className="relative">
            <CheckCircle2 className="h-16 w-16 text-success glow-success" />
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-secondary animate-bounce-subtle" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Submission Successful!
          </h2>
          <p className="text-muted-foreground max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Your creative performance items have been registered. Please save the item codes below.
          </p>
        </div>

        <Card className="hover-raise animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              School Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded-md transition-colors duration-200">
              <span className="text-muted-foreground">School Name</span>
              <span className="font-medium text-foreground">{school.school_name}</span>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded-md transition-colors duration-200">
              <span className="text-muted-foreground">Category</span>
              <Badge variant="secondary" className="glow-secondary">{school.category}</Badge>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded-md transition-colors duration-200">
              <span className="text-muted-foreground">Teacher</span>
              <span className="font-medium text-foreground">{school.teacher_name}</span>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-2 rounded-md transition-colors duration-200">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-foreground">{school.phone_number}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-raise animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
              Registered Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between rounded-lg border border-border p-3 hover-raise hover-glow-primary transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{item.item_type}</p>
                  {item.language && (
                    <p className="text-xs text-muted-foreground">Language: {item.language}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono font-semibold text-primary glow-primary">
                    {item.item_code}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyCode(item.item_code)}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-secondary/30 bg-secondary/5 hover-raise animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-foreground text-center">
              📋 <strong>Important:</strong> Files and scripts will be submitted in a later phase using these item codes.
            </p>
          </CardContent>
        </Card>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <Link to="/">
            <Button variant="outline" className="hover-raise hover-glow-primary group">
              Submit Another Registration
              <Sparkles className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}