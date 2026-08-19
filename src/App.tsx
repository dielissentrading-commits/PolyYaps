import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProgressProvider, useProgress } from '@/hooks/useProgress';
import { HomeScreen } from '@/screens/Home/HomeScreen';
import { LearnScreen } from '@/screens/Learn/LearnScreen';
import { LessonScreen } from '@/screens/Lesson/LessonScreen';
import { ModuleScreen } from '@/screens/Lesson/ModuleScreen';
import { DailyResultScreen } from '@/screens/Lesson/DailyResultScreen';
import { ReviewScreen } from '@/screens/Review/ReviewScreen';
import { ReviewSessionScreen } from '@/screens/Review/ReviewSessionScreen';
import { ProgressScreen } from '@/screens/Progress/ProgressScreen';
import { VocabularyScreen } from '@/screens/Progress/VocabularyScreen';
import { PassportScreen } from '@/screens/Passport/PassportScreen';
import { AchievementsScreen } from '@/screens/Achievements/AchievementsScreen';
import { ChallengeScreen } from '@/screens/Challenge/ChallengeScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';
import { NotFoundScreen } from '@/screens/NotFoundScreen';
import { SplashScreen } from '@/screens/SplashScreen';

/**
 * Routes follow docs/07-technical-architecture.md, section 2.
 *
 * Explore-mode screens render inside AppShell and keep the bottom navigation.
 * Focus-mode screens (lesson, module player, result, challenge) sit outside it
 * and bring their own FocusShell.
 */
export default function App() {
  return (
    <ProgressProvider>
      <Screens />
    </ProgressProvider>
  );
}

/**
 * Routes wait for stored progress, so no screen ever decides something against
 * empty state that it would decide differently a frame later.
 */
function Screens() {
  const { ready } = useProgress();

  if (!ready) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/learn" element={<LearnScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/progress/vocabulary" element={<VocabularyScreen />} />
        <Route path="/passport" element={<PassportScreen />} />
        <Route path="/achievements" element={<AchievementsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>

      <Route path="/lesson/:day" element={<LessonScreen />} />
      <Route path="/lesson/:day/result" element={<DailyResultScreen />} />
      <Route path="/lesson/:day/:module" element={<ModuleScreen />} />
      <Route path="/review/session" element={<ReviewSessionScreen />} />
      <Route path="/challenge/:id" element={<ChallengeScreen />} />
    </Routes>
  );
}
