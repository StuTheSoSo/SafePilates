import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SafetyService } from '../../services/safety.service';
import { ClientService } from '../../services/client.service';
import { ClientProfile, Condition } from '../../models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, TranslatePipe],
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss']
})
export class ClientsPage implements OnInit {
  clients: ClientProfile[] = [];
  allConditions: Condition[] = [];
  conditionSearchText = '';
  checkingClientId: string | null = null;

  // Form state
  isFormOpen = false;
  editingId: string | null = null;
  formName = '';
  formConditionIds = new Set<string>();
  formPregnancyTrimester = '';
  formNotes = '';

  private safetyService = inject(SafetyService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  async ngOnInit() {
    await this.safetyService.initData();
    this.allConditions = this.safetyService.getConditions();
    this.refreshClients();
  }

  ionViewWillEnter() {
    this.refreshClients();
  }

  private refreshClients() {
    this.clients = this.clientService.getClients()
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get hasPremium(): boolean {
    return this.safetyService.isPremiumActive();
  }

  get filteredConditions(): Condition[] {
    const term = this.conditionSearchText.trim().toLowerCase();
    if (!term) return this.allConditions;
    return this.allConditions.filter(c =>
      this.getConditionLabel(c.id).toLowerCase().includes(term) || c.id.toLowerCase().includes(term)
    );
  }

  // ── Form ──────────────────────────────────────────────

  openNewForm() {
    this.editingId = null;
    this.formName = '';
    this.formConditionIds = new Set();
    this.formPregnancyTrimester = '';
    this.formNotes = '';
    this.conditionSearchText = '';
    this.isFormOpen = true;
  }

  openEditForm(client: ClientProfile) {
    this.editingId = client.id;
    this.formName = client.name;
    this.formConditionIds = new Set(client.conditionIds);
    this.formPregnancyTrimester = client.pregnancyTrimester ?? '';
    this.formNotes = client.notes ?? '';
    this.conditionSearchText = '';
    this.isFormOpen = true;
  }

  cancelForm() {
    this.isFormOpen = false;
    this.conditionSearchText = '';
  }

  saveForm() {
    const name = this.formName.trim();
    if (!name) return;

    const now = Date.now();
    const profile: ClientProfile = {
      id: this.editingId ?? this.clientService.createId(),
      name,
      conditionIds: Array.from(this.formConditionIds),
      pregnancyTrimester: this.formPregnancyTrimester || undefined,
      notes: this.formNotes.trim() || undefined,
      createdAt: this.editingId
        ? (this.clientService.getClientById(this.editingId)?.createdAt ?? now)
        : now,
      updatedAt: now
    };

    this.clientService.saveClient(profile);
    this.isFormOpen = false;
    this.conditionSearchText = '';
    this.refreshClients();
  }

  toggleFormCondition(conditionId: string) {
    if (this.formConditionIds.has(conditionId)) {
      this.formConditionIds.delete(conditionId);
      if (conditionId === 'pregnancy') this.formPregnancyTrimester = '';
    } else {
      this.formConditionIds.add(conditionId);
    }
    // Trigger change detection by reassigning the Set
    this.formConditionIds = new Set(this.formConditionIds);
  }

  deleteClient(client: ClientProfile) {
    this.clientService.deleteClient(client.id);
    this.refreshClients();
    if (this.editingId === client.id) this.isFormOpen = false;
  }

  // ── Safety check ─────────────────────────────────────

  async checkSafety(client: ClientProfile) {
    this.checkingClientId = client.id;
    try {
      await this.safetyService.fetchGuidance({
        conditionIds: client.conditionIds,
        pregnancyTrimester: client.pregnancyTrimester
      });
      this.router.navigateByUrl('/results');
    } finally {
      this.checkingClientId = null;
    }
  }

  // ── Helpers ───────────────────────────────────────────

  getConditionLabels(conditionIds: string[]): string {
    return conditionIds
      .map(id => this.getConditionLabel(id))
      .join(', ');
  }

  getConditionLabel(conditionId: string): string {
    const key = 'HOME.CONDITIONS.' + conditionId;
    const translated = this.translate.instant(key);
    return translated !== key
      ? translated
      : this.allConditions.find(c => c.id === conditionId)?.label ?? conditionId;
  }

  navigateToUpgrade() {
    this.router.navigateByUrl('/upgrade');
  }
}
