import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { SafetyCheckerPage } from './pages/safety-checker/safety-checker.page';
import { ResultsPage } from './pages/results/results.page';
import { LibraryPage } from './pages/library/library.page';
import { ExerciseDetailPage } from './pages/exercise-detail/exercise-detail.page';
import { SettingsPage } from './pages/settings/settings.page';
import { PrivacyPolicyPage } from './pages/privacy-policy/privacy-policy.page';
import { EulaPage } from './pages/eula/eula.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'safety-checker', component: SafetyCheckerPage },
  { path: 'results', component: ResultsPage },
  { path: 'library', component: LibraryPage },
  { path: 'exercise/:id', component: ExerciseDetailPage },
  { path: 'settings', component: SettingsPage },
  { path: 'privacy-policy', component: PrivacyPolicyPage },
  { path: 'eula', component: EulaPage },
  { path: '**', redirectTo: '' }
];
