import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Clock, MapPin, ArrowLeft, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getItemRegulation } from '@/lib/regulations';
import { supabase } from '@/integrations/supabase/client';

interface ProgramItem {
  itemType: string;
  itemCode: string;
  schoolName: string;
  category: string;
}

interface ScheduleSlot {
  startTime: string;
  endTime: string;
  item: string;
  code: string;
  itemCode: string;
  schoolName: string;
  category: string;
  duration: number;
  maxCast: number | null;
}

const INTERVAL_MINUTES = 3;

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function parseDuration(maxTime: string | null): number {
  if (!maxTime) return 10;
  const match = maxTime.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 10;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${suffix}`;
}

function buildSchedule(items: ProgramItem[], startTime: string): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  let current = startTime;

  for (const item of items) {
    const reg = getItemRegulation(item.category, item.itemType);
    const duration = parseDuration(reg?.maxTime ?? null);
    const end = addMinutes(current, duration);
    slots.push({
      startTime: current,
      endTime: end,
      item: item.itemType,
      code: reg?.code || '',
      itemCode: item.itemCode,
      schoolName: item.schoolName,
      category: item.category,
      duration,
      maxCast: reg?.maxCast ?? null,
    });
    current = addMinutes(end, INTERVAL_MINUTES);
  }

  return slots;
}

const categoryColors: Record<string, string> = {
  'Pre-Primary': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Lower Primary': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Primary': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function ScheduleTable({ slots, hallName, description }: { slots: ScheduleSlot[]; hallName: string; description: string }) {
  const totalDuration = slots.length > 0
    ? (() => {
        const [sh, sm] = slots[0].startTime.split(':').map(Number);
        const last = slots[slots.length - 1];
        const [eh, em] = last.endTime.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
      })()
    : 0;
  const hours = Math.floor(totalDuration / 60);
  const mins = totalDuration % 60;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {hallName}
        </CardTitle>
        <CardDescription className="text-xs">
          {description} • {slots.length} performances • ~{hours}h {mins}m total
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {slots.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No items registered yet for this hall.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">School</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />Max Cast</span>
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, idx) => (
                  <tr
                    key={`${slot.itemCode}-${idx}`}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                      idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
                  >
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 text-sm font-medium text-foreground whitespace-nowrap">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="font-mono text-xs">{slot.code}</Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-sm font-medium text-foreground">{slot.item}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-sm text-foreground">{slot.schoolName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm text-muted-foreground">{slot.duration} min</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {slot.maxCast !== null ? (
                        <Badge variant="secondary" className="font-mono text-xs">{slot.maxCast}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge className={cn("text-xs", categoryColors[slot.category])}>
                        {slot.category}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Program() {
  const [loading, setLoading] = useState(true);
  const [programItems, setProgramItems] = useState<ProgramItem[]>([]);

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase.functions.invoke('get-program-data');
        if (error) throw error;
        setProgramItems(data?.programItems || []);
      } catch (err) {
        console.error('Failed to fetch program data:', err);
        setProgramItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const { hall1, hall2 } = useMemo(() => {
    const h1 = programItems.filter(i => i.category === 'Pre-Primary' || i.category === 'Lower Primary');
    const h2 = programItems.filter(i => i.category === 'Primary');
    return {
      hall1: buildSchedule(h1, '06:00'),
      hall2: buildSchedule(h2, '06:00'),
    };
  }, [programItems]);

  const totalPerformances = hall1.length + hall2.length;

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary/5 border-b border-border py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <GraduationCap className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="font-heading font-bold text-foreground">Creative Arts Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/submit">
              <Button size="sm">Submit Items</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
            Event Day Program
          </h1>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full mb-4"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The event runs from <strong className="text-foreground">6:00 AM to 6:00 PM</strong> across two halls.
            Each performance is followed by a 3-minute transition interval.
          </p>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong className="text-foreground">{totalPerformances}</strong> total performances scheduled
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading program...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {Object.entries(categoryColors).map(([cat, colors]) => (
                <Badge key={cat} className={cn("text-xs px-3 py-1", colors)}>{cat}</Badge>
              ))}
              <Badge variant="outline" className="text-xs px-3 py-1">
                <Clock className="h-3 w-3 mr-1" />
                3 min intervals between acts
              </Badge>
            </div>

            <div className="space-y-6">
              <ScheduleTable slots={hall1} hallName="Hall 1 — Category A (EYE)" description="Pre-Primary & Lower Primary" />
              <ScheduleTable slots={hall2} hallName="Hall 2 — Category B (Primary)" description="Primary Schools" />
            </div>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Times are approximate and based on registered items. Actual schedule may vary.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
