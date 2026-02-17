import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Heart, UtensilsCrossed, StickyNote, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  entry: { reflection: string; suhoor_plan: string; iftar_plan: string; notes: string };
  onSave: (field: string, value: string) => void;
}

const fields = [
  { key: 'reflection', label: 'Daily Reflection', icon: Sparkles, placeholder: 'What are you grateful for today?' },
  { key: 'suhoor_plan', label: 'Suhoor Plan', icon: UtensilsCrossed, placeholder: 'What will you eat for suhoor?' },
  { key: 'iftar_plan', label: 'Iftar Plan', icon: Heart, placeholder: 'What will you prepare for iftar?' },
  { key: 'notes', label: 'Notes', icon: StickyNote, placeholder: 'Any additional notes…' },
];

export default function DailyEntries({ entry, onSave }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
      {fields.map(({ key, label, icon: Icon, placeholder }) => (
        <Card key={key} className="shadow-card border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={entry[key as keyof typeof entry]}
              onChange={e => onSave(key, e.target.value)}
              onBlur={e => onSave(key, e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="resize-none border-primary/10 focus:border-primary/30"
            />
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
