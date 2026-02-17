
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  current_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Duas pool
CREATE TABLE public.duas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arabic TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  translation TEXT NOT NULL,
  category TEXT DEFAULT 'general'
);
ALTER TABLE public.duas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read duas" ON public.duas FOR SELECT USING (true);

-- Seed 12 duas
INSERT INTO public.duas (arabic, transliteration, translation, category) VALUES
('رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar', 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the torment of the Fire.', 'general'),
('اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', 'Allahumma innaka afuwwun tuhibbul afwa fa''fu anni', 'O Allah, You are the One who pardons greatly, and You love to pardon, so pardon me.', 'ramadan'),
('رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', 'Rabbish-rahli sadri wa yassirli amri', 'My Lord, expand for me my chest and ease for me my task.', 'general'),
('اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', 'Allahumma a''inni ala dhikrika wa shukrika wa husni ibadatik', 'O Allah, help me remember You, thank You, and worship You in the best way.', 'worship'),
('رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', 'Rabbana la tuzigh quloobana ba''da idh hadaytana', 'Our Lord, do not let our hearts deviate after You have guided us.', 'guidance'),
('اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', 'Allahumma inni as''alukal-huda wat-tuqa wal-afafa wal-ghina', 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.', 'general'),
('رَبِّ زِدْنِي عِلْمًا', 'Rabbi zidni ilma', 'My Lord, increase me in knowledge.', 'knowledge'),
('اللَّهُمَّ بَارِكْ لَنَا فِي رَمَضَانَ', 'Allahumma barik lana fi Ramadan', 'O Allah, bless us in Ramadan.', 'ramadan'),
('اللَّهُمَّ تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ', 'Allahumma taqabbal minna innaka antas-sami''ul alim', 'O Allah, accept from us, indeed You are the All-Hearing, All-Knowing.', 'worship'),
('رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', 'Rabbana-ghfir li wa liwalidayya wa lil-mu''mineena yawma yaqoomul hisab', 'Our Lord, forgive me and my parents and the believers on the Day of Judgement.', 'forgiveness'),
('اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكَسَلِ وَالْهَرَمِ', 'Allahumma inni a''udhu bika minal-kasali wal-haram', 'O Allah, I seek refuge in You from laziness and old age.', 'protection'),
('سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ', 'Subhanaka Allahumma wa bihamdika ashhadu an la ilaha illa anta astaghfiruka wa atubu ilayk', 'Glory is to You, O Allah, and praise. I bear witness that there is no god but You. I seek Your forgiveness and repent to You.', 'dhikr');

-- User dua history
CREATE TABLE public.user_dua_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dua_id UUID NOT NULL REFERENCES public.duas(id) ON DELETE CASCADE,
  shown_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, shown_date)
);
ALTER TABLE public.user_dua_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dua history" ON public.user_dua_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily entries (reflections, meal plans, notes)
CREATE TABLE public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reflection TEXT DEFAULT '',
  suhoor_plan TEXT DEFAULT '',
  iftar_plan TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entries" ON public.daily_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Prayer status
CREATE TABLE public.prayer_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fajr BOOLEAN NOT NULL DEFAULT false,
  zohar BOOLEAN NOT NULL DEFAULT false,
  asr BOOLEAN NOT NULL DEFAULT false,
  maghrib BOOLEAN NOT NULL DEFAULT false,
  isha BOOLEAN NOT NULL DEFAULT false,
  taraweeh BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, prayer_date)
);
ALTER TABLE public.prayer_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prayers" ON public.prayer_status FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Checklist items (master list per user)
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checklist" ON public.checklist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Checklist completions (per day)
CREATE TABLE public.checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, completion_date)
);
ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own completions" ON public.checklist_completions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON public.daily_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prayer_status_updated_at BEFORE UPDATE ON public.prayer_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
