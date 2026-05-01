import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { Condition, Exercise } from '../../models.js';
import { PremiumBannerComponent } from '../../components/premium-banner/premium-banner.component';
import exercisesData from '../../../assets/data/exercises.json' with { type: 'json' };
import safetyConditionsData from '../../../assets/data/safety-conditions.json' with { type: 'json' };
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PremiumBannerComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  exercises: Exercise[] = [];
  allExercises: Exercise[] = [];
  categories: string[] = [];
  selectedCategory = 'All';
  featuredSections = [
    { title: 'Warm-up & Cool down', category: 'Warm-up / Cool down' },
    { title: 'Classical Reformer', category: 'Reformer' },
    { title: 'Chair Essentials', category: 'Chair' }
  ];
  conditions: Condition[] = [];
  selectedIds = new Set<string>();
  pregnancyTrimester = '';
  otherText = '';
  searchText = '';
  loading = false;
  initFailed = false;
  showSafetyOverlay = true;
  showTrimesterModal = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      console.log('clearing.........');
      this.refreshComponent();
    });
  }

  refreshComponent() {
    this.selectedIds.clear();
    // Reset other properties as needed
  }

  onSearchTextChange(event: CustomEvent) {
    this.searchText = event.detail.value || '';
    this.trimHiddenSelections();
  }

  private trimHiddenSelections() {
    const visibleIds = new Set(
      this.filteredGroupedConditions.flatMap(group =>
        group.conditions.map(condition => condition.id)
      )
    );

    const updatedSelection = new Set<string>();
    this.selectedIds.forEach(id => {
      if (visibleIds.has(id)) {
        updatedSelection.add(id);
      }
    });

    if (updatedSelection.size !== this.selectedIds.size) {
      this.selectedIds = updatedSelection;
      if (!this.selectedIds.has('pregnancy')) {
        this.pregnancyTrimester = '';
      }
    }
  }

  conditionGroups = [
    {
      label: 'Spine & Joints',
      subtitle: 'Back, hips, knees, shoulders, and joint support',
      ids: [
        'osteoporosis',
        'low_back_pain',
        'scoliosis',
        'ankylosing_spondylitis',
        'disc_degeneration',
        'radiculopathy_sciatica',
        'sacroiliac_dysfunction',
        'cervical_spine_dysfunction',
        'hypermobility_syndrome',
        'arthritis',
        'knee_issues',
        'hip_issues',
        'foot_ankle_issues',
        'joint_replacement',
        'shoulder_instability',
        'neck_shoulder',
        'bursitis'
      ]
    },
    {
      label: 'Core, Pelvic & Pregnancy',
      subtitle: 'Pregnancy, postpartum, pelvic floor, and abdominal recovery',
      ids: [
        'pregnancy',
        'postpartum',
        'pelvic_floor_dysfunction',
        'diastasis_recti',
        'hernia',
        'stress_incontinence',
        'gastrointestinal_pelvic',
        'recent_surgery'
      ]
    },
    {
      label: 'Neurological & Systemic Conditions',
      subtitle: 'Neurological and systemic conditions that affect movement and balance',
      ids: [
        'multiple_sclerosis',
        'parkinsons_disease'
      ]
    },
    {
      label: 'Upper Limb & Nerve Injuries',
      subtitle: 'Shoulder, elbow, wrist, and nerve-related conditions',
      ids: [
        'frozen_shoulder',
        'rotator_cuff_injury',
        'acromioclavicular_sprain',
        'thoracic_outlet_syndrome',
        'tennis_elbow',
        'golfers_elbow',
        'nerve_compression',
        'carpal_tunnel_syndrome',
        'cubital_tunnel_syndrome',
        'radial_nerve_issue'
      ]
    },
    {
      label: 'Lower Limb & Hip Injuries',
      subtitle: 'Ankle, foot, knee, and hip injury support',
      ids: [
        'ankle_sprain',
        'achilles_tendinopathy',
        'posterior_tibialis_dysfunction',
        'tibial_stress_syndrome',
        'plantar_fasciitis',
        'bunions',
        'hip_arthroscopy',
        'piriformis_syndrome',
        'hamstring_tendinopathy',
        'muscle_strain',
        'snapping_hip_syndrome',
        'greater_trochanteric_pain',
        'femoroacetabular_impingement',
        'patellofemoral_pain',
        'iliotibial_band_syndrome',
        'meniscus_tear',
        'ligament_injury'
      ]
    },
    {
      label: 'Heart, Lungs & Metabolic',
      subtitle: 'Cardiovascular, respiratory, and endocrine concerns',
      ids: [
        'respiratory',
        'respiratory_pulmonary',
        'hypertension',
        'cardiovascular_disease',
        'arrhythmia_cardiac_device',
        'diabetes',
        'metabolic_endocrine'
      ]
    },
    {
      label: 'Immune, Inflammation & Recovery',
      subtitle: 'Autoimmune, infection, cancer treatment, and recovery support',
      ids: [
        'autoimmune_inflammatory',
        'chronic_fatigue',
        'immune_infectious',
        'oncology_treatment',
        'swollen_glands',
        'transplant_immunosuppression',
        'severe_allergy',
        'skin_condition'
      ]
    },
    {
      label: 'Balance, Neurological & Sensory',
      subtitle: 'Balance, dizziness, neurological, and sensory conditions',
      ids: [
        'neurological_disorder',
        'vertigo_dizziness',
        'balance_issues',
        'vision_impairment',
        'hearing_impairment',
        'epilepsy_seizure',
        'mental_cognitive'
      ]
    },
    {
      label: 'Weight & Other',
      subtitle: 'Weight management, recovery, and uncategorized concerns',
      ids: ['weight_concerns', 'substance_use_recovery', 'other']
    }
  ];

  private safetyService = inject(SafetyService);

  async ngOnInit() {
    // Show disclaimer overlay each app start.
    this.showSafetyOverlay = true;

    // Render immediately from bundled JSON — no async needed for first paint.
    this.conditions = safetyConditionsData as Condition[];
    this.allExercises = exercisesData as Exercise[];
    this.categories = this.getCategories(this.allExercises);
    this.categories.unshift('All');
    this.applyFilter();

    // Refresh from service in background.
    await this.loadExercises();
  }

  async ionViewWillEnter() {
    await this.loadExercises();
  }

  private async loadExercises() {
    this.initFailed = false;

    try {
      await this.safetyService.initData();
      const serviceConditions = this.safetyService.getConditions() as Condition[];
      if (serviceConditions.length) {
        this.conditions = serviceConditions;
      }
      this.initFailed = this.conditions.length === 0;
    } catch {
      // Bundled data already shown — no-op
    }

    const loadedAll = this.safetyService.getExercises();
    if (loadedAll.length) {
      this.allExercises = loadedAll;
    }
    this.categories = this.getCategories(this.allExercises);
    if (!this.categories.includes('All')) {
      this.categories.unshift('All');
    }
    this.applyFilter();
  }

  private getCategories(exercises: Exercise[]) {
    return Array.from(new Set(exercises.map(exercise => exercise.category ?? 'Mat'))).sort();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilter();
  }

  private applyFilter() {
    const filtered = this.selectedCategory === 'All'
      ? this.allExercises
      : this.allExercises.filter(exercise => exercise.category === this.selectedCategory);
    this.exercises = filtered.slice(0, 4);
  }

  get previewLabel() {
    return this.selectedCategory === 'All'
      ? 'Exercise library preview'
      : `${this.selectedCategory} exercise preview`;
  }

  get selectedCount() {
    return this.selectedIds.size;
  }

  get hasNoConditions() {
    return !this.loading && this.initFailed;
  }

  clearSelection() {
    this.selectedIds.clear();
    this.pregnancyTrimester = '';
    this.showTrimesterModal = false;
  }

  toggleCondition(conditionId: string) {
    if (!this.selectedIds.has(conditionId) && this.safetyService.isConditionPremium(conditionId) && !this.safetyService.isPremiumActive()) {
      this.router.navigateByUrl('/upgrade');
      return;
    }

    if (this.selectedIds.has(conditionId)) {
      this.selectedIds.delete(conditionId);
      if (conditionId === 'pregnancy') {
        this.pregnancyTrimester = '';
        this.showTrimesterModal = false;
      }
    } else {
      this.selectedIds.add(conditionId);
      if (conditionId === 'pregnancy') {
        this.showTrimesterModal = true;
      }
    }
  }

  get selectedConditions() {
    return Array.from(this.selectedIds);
  }

  get hasOther() {
    return this.selectedIds.has('other');
  }

  get groupedConditions() {
    return this.conditionGroups.map(group => ({
      ...group,
      conditions: group.ids
        .map(id => this.conditions.find(condition => condition.id === id))
        .filter((condition): condition is Condition => Boolean(condition))
    }));
  }

  get filteredGroupedConditions() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      return this.groupedConditions;
    }
    return this.groupedConditions
      .map(group => ({
        ...group,
        conditions: group.conditions.filter(condition => this.conditionMatchesSearch(condition, term))
      }))
      .filter(group => group.conditions.length > 0);
  }

  private conditionMatchesSearch(condition: Condition, term: string) {
    return [condition.label, condition.description]
      .some(field => field.toLowerCase().includes(term));
  }

  get canSubmit() {
    const needsTrimester = this.selectedIds.has('pregnancy');
    return this.selectedIds.size > 0
      && (!this.hasOther || this.otherText.trim().length > 0)
      && (!needsTrimester || !!this.pregnancyTrimester);
  }

  async submit() {
    if (!this.canSubmit) {
      if (this.selectedIds.has('pregnancy') && !this.pregnancyTrimester) {
        this.showTrimesterModal = true;
      }
      return;
    }

    const otherTextLower = this.otherText.trim().toLowerCase();
    if (this.hasOther && !this.selectedIds.has('pregnancy') && /(pregnanc|pregenanc|pregnan)/.test(otherTextLower)) {
      this.selectedIds.delete('other');
      this.selectedIds.add('pregnancy');
    }

    this.loading = true;
    try {
      await this.safetyService.fetchGuidance({
        conditionIds: this.selectedConditions,
        pregnancyTrimester: this.selectedIds.has('pregnancy') ? this.pregnancyTrimester : undefined,
        otherText: this.otherText.trim(),
        searchTerm: this.searchText.trim() || undefined
      });
    } catch (error) {
      console.error('Guidance request failed', error);
      this.safetyService.setErrorGuidance(
        'Unable to retrieve guidance right now. Please try again later or check your connection.'
      );
    } finally {
      this.loading = false;
      this.router.navigate(['/results']);
    }
  }

  closeSafetyOverlay() {
    this.showSafetyOverlay = false;
  }

  onTrimesterSelected(value: string) {
    this.pregnancyTrimester = value;
  }

  closeTrimesterModal() {
    this.showTrimesterModal = false;
  }

  trackByGroup(_: number, group: { label: string }): string {
    return group.label;
  }

  trackByCondition(_: number, condition: Condition): string {
    return condition.id;
  }

  getFeaturedExercises(category: string): Exercise[] {
    return this.allExercises.filter(exercise => exercise.category === category).slice(0, 4);
  }

  goToCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilter();
  }

  openExercise(id: string) {
    this.router.navigateByUrl(`/exercise/${id}`);
  }

  navigateToUpgrade() {
    this.router.navigateByUrl('/upgrade');
  }
}
