import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetDate, targetTime }) => {
  const calculateTimeLeft = () => {
    if (!targetDate) return null;

    // Combine date and time if available
    const eventDateTime = new Date(targetDate);
    if (targetTime) {
      // Parse time like "10:00 AM" or "18:00"
      const match = targetTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm) {
          if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
          if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
        }
        eventDateTime.setHours(hours, minutes, 0, 0);
      }
    }

    const difference = eventDateTime.getTime() - new Date().getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isPast: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  if (!timeLeft) return null;

  if (timeLeft.isPast) {
    return (
      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold">
        <Clock className="w-4 h-4 text-slate-500" />
        <span>Event has started or concluded</span>
      </div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Minutes', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(timeLeft.seconds).padStart(2, '0') }
  ];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Event Starts In</span>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <div className="flex flex-col items-center justify-center bg-slate-900 dark:bg-slate-800 text-white min-w-[62px] sm:min-w-[72px] py-2 sm:py-3 px-2 rounded-xl shadow-md border border-slate-800 dark:border-slate-700">
              <span className="text-xl sm:text-2xl font-black tracking-tight font-mono text-indigo-400">
                {unit.value}
              </span>
              <span className="text-[10px] sm:text-xs font-medium uppercase text-slate-400 tracking-wider">
                {unit.label}
              </span>
            </div>
            {index < timeUnits.length - 1 && (
              <span className="text-lg font-bold text-slate-400 dark:text-slate-600">
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
