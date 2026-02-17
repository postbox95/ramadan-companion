import { getRamadanDay } from '@/lib/ramadan';
import { Moon, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  streak: number;
  displayName?: string;
}

export default function RamadanHeader({ streak, displayName }: Props) {
  const { day, daysUntil } = getRamadanDay();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-navy rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden"
    >
      <div className="absolute top-2 right-4 flex gap-1 opacity-30">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3 h-3" fill="currentColor" />
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Moon className="w-8 h-8 text-gold" fill="hsl(38 60% 52%)" />
            <h1 className="text-3xl md:text-4xl font-serif">Ramadan Planner</h1>
          </div>
          {displayName && <p className="text-primary-foreground/70 text-sm">Assalamu Alaikum, {displayName}</p>}
          <p className="text-lg mt-1 text-gold-light font-medium">
            {day ? `Day ${day} of 30` : daysUntil ? `Ramadan starts in ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : 'Ramadan has ended'}
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 gradient-gold rounded-xl px-4 py-3 self-start">
            <Flame className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-secondary text-lg">{streak} day streak</span>
          </div>
        )}
      </div>
    </motion.header>
  );
}
