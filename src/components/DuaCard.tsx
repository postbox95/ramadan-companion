import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  dua: { arabic: string; transliteration: string; translation: string; category: string } | null;
}

export default function DuaCard({ dua }: Props) {
  if (!dua) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="shadow-card border-primary/10 overflow-hidden">
        <div className="gradient-gold h-1" />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Dua of the Day
            <span className="text-xs font-sans font-normal text-muted-foreground ml-auto capitalize">{dua.category}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl text-right font-serif leading-loose text-foreground" dir="rtl">{dua.arabic}</p>
          <p className="text-sm italic text-primary">{dua.transliteration}</p>
          <p className="text-sm text-muted-foreground">{dua.translation}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
