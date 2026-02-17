import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlannerData } from '@/hooks/usePlannerData';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, LogOut, RotateCcw } from 'lucide-react';
import RamadanHeader from '@/components/RamadanHeader';
import DuaCard from '@/components/DuaCard';
import PrayerTracker from '@/components/PrayerTracker';
import Checklist from '@/components/Checklist';
import DailyEntries from '@/components/DailyEntries';
import ShareAndExport from '@/components/ShareAndExport';
import { motion } from 'framer-motion';

export default function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Moon className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <PlannerContent contentRef={contentRef} onSignOut={signOut} />;
}

function PlannerContent({ contentRef, onSignOut }: { contentRef: React.RefObject<HTMLDivElement>; onSignOut: () => void }) {
  const {
    profile, dua, prayers, entry, checklistItems, completions, loading,
    togglePrayer, saveEntry, addChecklistItem, deleteChecklistItem,
    toggleChecklistItem, reorderChecklist, clearDailyFields,
  } = usePlannerData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Moon className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div ref={contentRef} className="space-y-6">
          <RamadanHeader streak={profile?.current_streak || 0} displayName={profile?.display_name} />
          <DuaCard dua={dua} />
          <PrayerTracker prayers={prayers} onToggle={togglePrayer} />
          <Checklist
            items={checklistItems}
            completions={completions}
            onAdd={addChecklistItem}
            onDelete={deleteChecklistItem}
            onToggle={toggleChecklistItem}
            onReorder={reorderChecklist}
          />
          <DailyEntries entry={entry} onSave={saveEntry} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 pb-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif text-foreground">Share & Export</h2>
            <ShareAndExport contentRef={contentRef} />
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={clearDailyFields} variant="outline" size="sm" className="border-primary/20">
              <RotateCcw className="w-4 h-4 mr-1" /> Clear Today
            </Button>
            <Button onClick={onSignOut} variant="ghost" size="sm" className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
