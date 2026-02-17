import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRAYERS } from '@/lib/ramadan';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  prayers: Record<string, boolean>;
  onToggle: (prayer: string) => void;
}

const prayerIcons: Record<string, string> = {
  Fajr: '🌅', Zohar: '☀️', Asr: '🌤️', Maghrib: '🌇', Isha: '🌙', Taraweeh: '⭐',
};

export default function PrayerTracker({ prayers, onToggle }: Props) {
  const completed = Object.values(prayers).filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif flex items-center justify-between">
            Prayer Tracker
            <span className="text-sm font-sans font-normal text-muted-foreground">{completed}/{PRAYERS.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRAYERS.map(prayer => {
              const key = prayer.toLowerCase();
              const done = prayers[key];
              return (
                <button
                  key={prayer}
                  onClick={() => onToggle(key)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 transition-all border text-left ${
                    done
                      ? 'bg-accent/10 border-accent text-accent'
                      : 'bg-card border-border hover:border-primary/30 text-foreground'
                  }`}
                >
                  <span className="text-lg">{prayerIcons[prayer]}</span>
                  <span className="text-sm font-medium flex-1">{prayer}</span>
                  {done && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
