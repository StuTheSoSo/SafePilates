import { Injectable } from '@angular/core';
import { ClientProfile } from '../models';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly STORAGE_KEY = 'pilatesafe-clients';

  getClients(): ClientProfile[] {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]') as ClientProfile[];
    } catch {
      return [];
    }
  }

  getClientById(id: string): ClientProfile | undefined {
    return this.getClients().find(c => c.id === id);
  }

  saveClient(client: ClientProfile): void {
    const clients = this.getClients();
    const idx = clients.findIndex(c => c.id === client.id);
    if (idx >= 0) {
      clients[idx] = client;
    } else {
      clients.push(client);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients));
  }

  deleteClient(id: string): void {
    const clients = this.getClients().filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients));
  }

  createId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
}
