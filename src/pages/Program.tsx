import { Link } from 'react-router-dom';
import { GraduationCap, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORY_REGULATIONS, type ItemRegulation } from '@/lib/regulations';

interface ScheduleSlot {
  startTime: string;
  endTime: string;
  item: string;
  code: string;
  category: string;
  duration: number; // in minutes
}

const INTERVAL_MINUTES = 3;

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
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

function buildSchedule(items: { reg: ItemRegulation; category: string }[], startTime: string): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  let current = startTime;

  for (const { reg, category } of items) {
    const duration = parseDuration(reg.maxTime);
    const end = addMinutes(current, duration);
    slots.push({
      startTime: current,
      endTime: end,
      item: reg.itemType,
      code: reg.code,
      category,
      duration,
    });
    current = addMinutes(end, INTERVAL_MINUTES);
  }

  return slots;
}

// Distribute items across 2 halls
function generateHallSchedules() {
  const allItems: { reg: ItemRegulation; category: string }[] = [];

  // Category A first, then Category B
  for (const [category, regulations] of Object.entries(CATEGORY_REGULATIONS)) {
    for (const reg of regulations) {
      allItems.push({ reg, category });
    }
  }

  // Split: Pre-Primary + Lower Primary → Hall 1, Primary → Hall 2
  const hall1Items = allItems.filter(i => i.category === 'Pre-Primary' || i.category === 'Lower Primary');
  const hall2Items = allItems.filter(i => i.category === 'Primary');

  const hall1Schedule = buildSchedule(hall1Items, '06:00');
  const hall2Schedule = buildSchedule(hall2Items, '06:00');

  return { hall1: hall1Schedule, hall2: hall2Schedule };
}

const categoryColors: Record<string, string> = {
  'Pre-Primary': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Lower Primary': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Primary': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
};

function ScheduleTable({ slots, hallName }: { slots: ScheduleSlot[]; hallName: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {hallName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Item</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => (
                <tr
                  key={`${slot.code}-${idx}`}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                    idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="font-mono text-xs">{slot.code}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-foreground">{slot.item}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm text-muted-foreground">{slot.duration} min</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={cn("text-xs", categoryColors[slot.category])}>
                      {slot.category}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Program() {
  const { hall1, hall2 } = generateHallSchedules();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
            Event Day Program
          </h1>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full mb-4"></div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The event runs from <strong className="text-foreground">6:00 AM to 6:00 PM</strong> across two halls.
            Each performance is followed by a 3-minute transition interval.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.entries(categoryColors).map(([cat, colors]) => (
            <Badge key={cat} className={cn("text-xs px-3 py-1", colors)}>{cat}</Badge>
          ))}
          <Badge variant="outline" className="text-xs px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            3 min intervals between acts
          </Badge>
        </div>

        {/* Two Hall Schedules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ScheduleTable slots={hall1} hallName="Hall 1 — Category A (EYE)" />
          <ScheduleTable slots={hall2} hallName="Hall 2 — Category B (Primary)" />
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Times are approximate. Actual schedule may vary depending on the flow of events.</p>
        </div>
      </div>
    </div>
  );
}
