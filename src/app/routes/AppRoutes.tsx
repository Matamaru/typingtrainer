import { Navigate, Route, Routes } from "react-router-dom";

import { CodingPage } from "../../features/coding/CodingPage";
import { LessonDetailPage } from "../../features/lessons/LessonDetailPage";
import { LessonsPage } from "../../features/lessons/LessonsPage";
import { AdaptivePracticePage } from "../../features/practice/AdaptivePracticePage";
import { FreePracticePage } from "../../features/practice/FreePracticePage";
import { HomePage } from "../../features/profiles/HomePage";
import { SettingsPage } from "../../features/settings/SettingsPage";
import { StatsPage } from "../../features/stats/StatsPage";
import { AppShell } from "../../shared/ui/AppShell";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="lesson/:lessonId" element={<LessonDetailPage />} />
        <Route path="practice/adaptive" element={<AdaptivePracticePage />} />
        <Route path="practice/free" element={<FreePracticePage />} />
        <Route path="coding" element={<CodingPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
