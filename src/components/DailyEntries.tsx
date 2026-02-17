import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Heart, UtensilsCrossed, StickyNote, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  entry: { reflection: string; suhoor_plan: string; iftar_plan: string; notes: string };
  onSave: (field: string, value: string) => void;
}

const suggestions: Record<string, string[]> = {
  reflection: ['Grateful for family', 'Felt peace during prayer', 'Learned something new today', 'Helped someone in need'],
  suhoor_plan: ['Oatmeal & dates', 'Eggs & toast', 'Smoothie & granola', 'Yogurt & fruit'],
  iftar_plan: ['Dates & soup', 'Rice & chicken', 'Samosas & salad', 'Pasta & vegetables'],
  notes: [],
};

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
            {suggestions[key]?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestions[key].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const current = entry[key as keyof typeof entry];
                      onSave(key, current ? `${current}\n${s}` : s);
                    }}
                    className="text-xs px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
