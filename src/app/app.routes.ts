import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { ResultsPage } from './pages/results/results.page';
import { LibraryPage } from './pages/library/library.page';
import { ExerciseDetailPage } from './pages/exercise-detail/exercise-detail.page';
import { SettingsPage } from './pages/settings/settings.page';
import { PrivacyPolicyPage } from './pages/privacy-policy/privacy-policy.page';
import { EulaPage } from './pages/eula/eula.page';
import { ProgramsPage } from './pages/programs/programs.page';
import { ProgramDetailPage } from './pages/programs/program-detail/program-detail.page';
import { UpgradePage } from './pages/upgrade/upgrade.page';
import { ClientsPage } from './pages/clients/clients.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { PlannerPage } from './pages/planner/planner.page';
import { RunPage } from './pages/run/run.page';
import { TemplatesPage } from './pages/templates/templates.page';
import { OnboardingPage } from './pages/onboarding/onboarding.page';
import { onboardingGuard } from './guards/onboarding.guard';
import { ArticlePage } from './pages/articles/article.page';

export const routes: Routes = [
  { path: '', component: DashboardPage, canActivate: [onboardingGuard] },
  { path: 'onboarding', component: OnboardingPage },
  { path: 'planner', component: PlannerPage, canActivate: [onboardingGuard] },
  { path: 'run', component: RunPage },
  { path: 'templates', component: TemplatesPage },
  { path: 'articles/:slug', component: ArticlePage },
  { path: 'safety', component: HomePage },
  { path: 'results', component: ResultsPage },
  { path: 'library', component: LibraryPage },
  { path: 'exercise/:id', component: ExerciseDetailPage },
  { path: 'programs', component: ProgramsPage },
  { path: 'programs/:id', component: ProgramDetailPage },
  { path: 'clients', component: ClientsPage },
  { path: 'settings', component: SettingsPage },
  { path: 'upgrade', component: UpgradePage },
  { path: 'privacy-policy', component: PrivacyPolicyPage },
  { path: 'eula', component: EulaPage },
  { path: '**', redirectTo: '' }
];
