import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  items: any[];
  completions: Record<string, boolean>;
  onAdd: (title: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onReorder: (items: any[]) => void;
}

export default function Checklist({ items, completions, onAdd, onDelete, onToggle, onReorder }: Props) {
  const [newItem, setNewItem] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd(newItem.trim());
    setNewItem('');
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIdx, 1);
    newItems.splice(idx, 0, moved);
    onReorder(newItems);
    setDragIdx(idx);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">Daily Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new item…"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="icon" className="gradient-gold text-secondary shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={() => setDragIdx(null)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing transition-colors ${
                  completions[item.id] ? 'bg-accent/5 border-accent/30' : 'bg-card border-border'
                }`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                <button
                  onClick={() => onToggle(item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    completions[item.id] ? 'bg-accent border-accent' : 'border-border'
                  }`}
                >
                  {completions[item.id] && <Check className="w-3 h-3 text-accent-foreground" />}
                </button>
                <span className={`flex-1 text-sm ${completions[item.id] ? 'line-through text-muted-foreground' : ''}`}>
                  {item.title}
                </span>
                <button onClick={() => onDelete(item.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Add items to track your daily goals</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
