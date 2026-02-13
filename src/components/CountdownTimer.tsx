import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const DEADLINE = new Date('2026-02-16T14:00:00');

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [isExpired, setIsExpired] = useState(false);

  function calculateTimeLeft(): TimeLeft {
    const now = new Date();
    const difference = DEADLINE.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isExpired) {
    return (
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="p-4 text-center">
          <p className="text-destructive font-bold">Submission deadline has passed</p>
        </CardContent>
      </Card>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-primary-foreground/80" />
        <span className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wide">
          Submission Deadline: 16th February 2026, 2:00 PM
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {timeUnits.map(({ label, value }) => (
          <div 
            key={label} 
            className="bg-white/95 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center shadow-lg"
          >
            <div className="text-2xl sm:text-4xl font-bold text-primary tabular-nums">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
