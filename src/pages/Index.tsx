import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Music, 
  Theater, 
  Mic2, 
  Video, 
  Radio, 
  Podcast, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  ClipboardList,
  Send,
  Tag,
  School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ITEM_TYPES, SCHOOL_CATEGORIES } from '@/lib/constants';
import heroBackground from '@/assets/hero-background.png';

const itemIcons: Record<string, React.ReactNode> = {
  'Choral Verse': <Music className="h-6 w-6" />,
  'Play': <Theater className="h-6 w-6" />,
  'Spoken Word': <Mic2 className="h-6 w-6" />,
  'Solo Verse': <Mic2 className="h-6 w-6" />,
  'Modern Dance': <Sparkles className="h-6 w-6" />,
  'Comedy': <Theater className="h-6 w-6" />,
  'Live Broadcast': <Radio className="h-6 w-6" />,
  'Podcast': <Podcast className="h-6 w-6" />,
  'Singing Games': <Music className="h-6 w-6" />,
  'Narratives': <FileText className="h-6 w-6" />,
  'Cultural Creative Dance': <Sparkles className="h-6 w-6" />,
  'Video Song': <Video className="h-6 w-6" />,
  'Documentary': <Video className="h-6 w-6" />,
  'Advert': <Video className="h-6 w-6" />,
};

const steps = [
  { step: 1, title: 'Click "Start Submission"', icon: <ArrowRight className="h-5 w-5" /> },
  { step: 2, title: 'Enter your school details', icon: <School className="h-5 w-5" /> },
  { step: 3, title: 'Register up to four (4) items', icon: <ClipboardList className="h-5 w-5" /> },
  { step: 4, title: 'Review and submit', icon: <Send className="h-5 w-5" /> },
];

const rules = [
  'Maximum of 4 items per school',
  'One submission per school',
  'All fields are mandatory',
  'Submissions close after the official deadline',
  'WhatsApp submissions will not be accepted',
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-primary/5 border-b border-border py-3 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <GraduationCap className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            <span className="font-heading font-bold text-foreground">Creative Arts Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/submit">
              <Button size="sm" className="hover-glow-primary">
                Submit Items
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button size="sm" variant="outline" className="hover-raise">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative text-primary-foreground py-16 sm:py-24 px-4 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <Badge variant="secondary" className="mb-4 text-sm px-4 py-1 animate-fade-in glow-secondary">
            Official Submission Platform
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold leading-tight animate-fade-in-up">
            Creative Arts Submission Portal
          </h1>
          <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto animate-fade-in-up stagger-1" style={{ animationDelay: '0.1s' }}>
            The official platform for registering school creative performance items
          </p>
          <p className="text-base opacity-80 max-w-xl mx-auto animate-fade-in-up stagger-2" style={{ animationDelay: '0.2s' }}>
            This portal provides a simple, structured, and fair way for schools to register creative items for participation.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/submit">
              <Button size="lg" variant="secondary" className="text-base font-semibold px-8 h-12 hover-raise glow-secondary group">
                Start Submission
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <p className="text-sm opacity-75 pt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Maximum of 4 items per school
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
              About the Portal
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded-full animate-pulse-glow"></div>
          </div>
          <Card className="border-0 shadow-lg hover-raise animate-fade-in-up">
            <CardContent className="p-6 sm:p-8">
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-center">
                This system was created to replace unstructured submissions and provide a long-term, 
                reusable solution for managing creative performance entries. All schools submit through 
                one official channel to ensure <strong className="text-foreground">order</strong>, <strong className="text-foreground">transparency</strong>, and <strong className="text-foreground">fairness</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Who Can Submit */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
              Who Can Submit
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20 bg-primary/5 card-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse-ring">
                  <Users className="h-6 w-6 text-primary icon-scale" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">School Teachers</h3>
                  <p className="text-muted-foreground text-sm">
                    Teachers submitting on behalf of their institutions
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-secondary/20 bg-secondary/5 card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 animate-pulse-ring">
                  <School className="h-6 w-6 text-secondary icon-scale" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">Applicable Categories</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SCHOOL_CATEGORIES.map((cat, idx) => (
                      <Badge 
                        key={cat} 
                        variant="outline" 
                        className="text-xs hover-raise transition-all duration-200"
                        style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-center text-muted-foreground mt-6 text-sm animate-fade-in">
            ⚠️ One submission per school only
          </p>
        </div>
      </section>

      {/* Creative Items Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
              Creative Items You Can Register
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {ITEM_TYPES.map((item, idx) => (
              <Card 
                key={item} 
                className="card-hover hover-glow-primary cursor-default animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <CardContent className="p-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary transition-all duration-300 hover:bg-primary/20 hover:scale-110 group">
                    <div className="transition-transform duration-300 group-hover:rotate-12">
                      {itemIcons[item] || <Sparkles className="h-6 w-6" />}
                    </div>
                  </div>
                  <p className="font-medium text-foreground text-sm">{item}</p>
                  {item === 'Play' && (
                    <p className="text-xs text-muted-foreground mt-1">(English, French, German)</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-8 border-secondary/30 bg-secondary/5 hover-raise animate-fade-in-up">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-foreground">
                📋 <strong>Note:</strong> Files and scripts are NOT uploaded at this stage.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Submit */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
              How to Submit Your Items
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(({ step, title, icon }, idx) => (
              <Card 
                key={step} 
                className="relative overflow-hidden card-hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary shimmer-bg"></div>
                  <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold glow-primary animate-pulse-ring">
                    {step}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-primary mb-2 transition-transform duration-300 hover:scale-110">
                    {icon}
                  </div>
                  <p className="font-medium text-foreground text-sm">{title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-8 border-destructive/30 bg-destructive/5 hover-raise animate-fade-in-up">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-foreground font-medium">
                ⚠️ Once submitted, entries cannot be edited.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Item Codes Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
              Item Codes
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>
          <Card className="border-2 border-primary/20 hover-raise animate-fade-in-up">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-float glow-primary">
                <Tag className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground leading-relaxed">
                  Each registered item is assigned a <strong className="text-foreground">unique item code</strong>. 
                  These codes will be used in a later phase to submit scripts, audio, or video files for adjudication. 
                  Teachers are advised to <strong className="text-foreground">keep these codes safely</strong>.
                </p>
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="secondary" className="font-mono text-sm glow-secondary hover-raise">SPA-PRI-01</Badge>
                  <span className="text-xs text-muted-foreground">Example code format</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
              Important Rules
            </h2>
            <div className="w-16 h-1 bg-secondary mx-auto rounded-full"></div>
          </div>
          <Card className="border-2 border-destructive/20 bg-destructive/5 shadow-lg hover-raise animate-fade-in-up">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-destructive animate-bounce-subtle" />
                <span className="font-heading font-semibold text-foreground">Please Read Carefully</span>
              </div>
              <ul className="space-y-4">
                {rules.map((rule, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5 transition-transform duration-200 hover:scale-110" />
                    <span className="text-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-secondary/15 rounded-full blur-3xl animate-pulse-ring"></div>
        </div>
        
        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <GraduationCap className="h-16 w-16 mx-auto opacity-90 animate-float" />
          <h2 className="text-2xl sm:text-3xl font-heading font-bold animate-fade-in-up">
            Ready to register your school's creative items?
          </h2>
          <p className="opacity-80 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Start your submission now and get your unique item codes for the upcoming creative arts event.
          </p>
          <div className="pt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/submit">
              <Button size="lg" variant="secondary" className="text-base font-semibold px-10 h-14 hover-raise glow-secondary group animate-pulse-glow">
                Start Submission Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4 group">
            <GraduationCap className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="font-heading font-semibold text-foreground">Creative Arts Portal</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Official platform for school creative performance item registration
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Link to="/submit" className="text-sm text-primary hover:underline transition-all duration-200 hover:text-primary/80">
              Submit Items
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}