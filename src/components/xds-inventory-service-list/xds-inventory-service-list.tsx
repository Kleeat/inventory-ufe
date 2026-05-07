import { Component, Host, h, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/list/list';
import '@material/web/list/list-item';
import '@material/web/icon/icon';

type ServiceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type ServicePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type SortField = 'priority' | 'createdAt';

const SERVICE_STATUSES: ServiceStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_LABEL: Record<ServiceStatus, string> = {
  'OPEN': 'Open',
  'IN_PROGRESS': 'In Progress',
  'RESOLVED': 'Resolved',
  'CLOSED': 'Closed',
};

const PRIORITY_LABEL: Record<ServicePriority, string> = {
  'LOW': 'Low',
  'MEDIUM': 'Medium',
  'HIGH': 'High',
  'CRITICAL': 'Critical',
};

const STATUS_CLASS: Record<ServiceStatus, string> = {
  'OPEN': 'open',
  'IN_PROGRESS': 'in-progress',
  'RESOLVED': 'resolved',
  'CLOSED': 'closed',
};

const PRIORITY_CLASS: Record<ServicePriority, string> = {
  'LOW': 'low',
  'MEDIUM': 'medium',
  'HIGH': 'high',
  'CRITICAL': 'critical',
};

const PRIORITY_ORDER: Record<ServicePriority, number> = {
  'LOW': 0,
  'MEDIUM': 1,
  'HIGH': 2,
  'CRITICAL': 3,
};

@Component({
  tag: 'xds-inventory-service-list',
  styleUrl: 'xds-inventory-service-list.css',
  shadow: true,
})
export class XdsInventoryServiceList {
  serviceRequests: any[] = [];

  @Event({ eventName: 'entry-clicked' }) entryClicked!: EventEmitter<string>;

  @State() statusFilters: ServiceStatus[] = [];
  @State() sortBy: SortField | null = null;
  @State() sortAsc: boolean = true;

  async componentWillLoad() {
    this.serviceRequests = await this.getServiceRequestsAsync();
  }

  private async getServiceRequestsAsync() {
    return await Promise.resolve([
      {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        equipmentId: 'eq-001',
        title: 'Porucha displeja – nereaguje na dotyk',
        description: 'Displej prestáva reagovať po 30 minútach prevádzky. Potrebná výmena dotykového panela.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        createdAt: '2024-03-15T08:30:00Z',
      },
      {
        id: 'sr-002',
        equipmentId: 'eq-002',
        title: 'Batéria sa nenabíja',
        description: 'Defibrilátor Zoll X Series sa nedá nabiť. Indikátor nabíjania nesvieti pri pripojení na sieť.',
        priority: 'CRITICAL',
        status: 'OPEN',
        createdAt: '2024-04-01T14:00:00Z',
      },
      {
        id: 'sr-003',
        equipmentId: 'eq-003',
        title: 'Pravidelná údržba ventilátora',
        description: 'Plánovaná ročná údržba podľa servisného plánu výrobcu Dräger.',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        createdAt: '2024-02-10T09:00:00Z',
      },
      {
        id: 'sr-004',
        equipmentId: 'eq-004',
        title: 'Chybové hlásenie E-04',
        description: 'Infúzna pumpa zobrazuje chybový kód E-04 pri spustení. Pumpa nie je schopná prevádzky.',
        priority: 'HIGH',
        status: 'OPEN',
        createdAt: '2024-04-10T11:30:00Z',
      },
      {
        id: 'sr-005',
        equipmentId: 'eq-005',
        title: 'Kalibrácia SpO2 senzora',
        description: 'Pacientský monitor vykazuje odchýlku ±3% pri meraní saturácie. Potrebná kalibrácia.',
        priority: 'LOW',
        status: 'CLOSED',
        createdAt: '2024-01-20T07:00:00Z',
      },
      {
        id: 'sr-006',
        equipmentId: 'eq-001',
        title: 'Aktualizácia softvéru ultrazvuku',
        description: 'Dostupná aktualizácia firmvéru verzie 3.2.1 od výrobcu Philips. Obsahuje bezpečnostné záplaty.',
        priority: 'MEDIUM',
        status: 'OPEN',
        createdAt: '2024-04-22T13:15:00Z',
      },
    ]);
  }

  private getFilteredSortedItems(): any[] {
    let items = this.serviceRequests ?? [];

    if (this.statusFilters.length > 0) {
      items = items.filter(i => this.statusFilters.includes(i.status));
    }

    if (this.sortBy === 'priority') {
      items = [...items].sort((a, b) => {
        const diff = PRIORITY_ORDER[a.priority as ServicePriority] - PRIORITY_ORDER[b.priority as ServicePriority];
        return this.sortAsc ? diff : -diff;
      });
    } else if (this.sortBy === 'createdAt') {
      items = [...items].sort((a, b) => {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return this.sortAsc ? diff : -diff;
      });
    }

    return items;
  }

  private toggleStatusFilter(status: ServiceStatus) {
    this.statusFilters = this.statusFilters.includes(status)
      ? this.statusFilters.filter(s => s !== status)
      : [...this.statusFilters, status];
  }

  private toggleSort(field: SortField) {
    if (this.sortBy === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = field;
      this.sortAsc = true;
    }
  }

  private formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  render() {
    const items = this.getFilteredSortedItems();
    const isFiltered = this.statusFilters.length > 0;

    return (
      <Host>
        <div class="list-header">
          <h2>Service Requests</h2>
          <span class="item-count">
            {isFiltered ? `${items.length} of ${(this.serviceRequests ?? []).length}` : items.length} requests
          </span>
        </div>

        <div class="controls">
          <div class="filter-group">
            <span class="control-label">Status</span>
            <md-chip-set>
              {SERVICE_STATUSES.map(status => (
                <span class={`status-chip-wrap status-chip-wrap--${STATUS_CLASS[status]}`}>
                  <md-filter-chip key={status} selected={this.statusFilters.includes(status)} onClick={() => this.toggleStatusFilter(status)}>
                    {STATUS_LABEL[status]}
                  </md-filter-chip>
                </span>
              ))}
            </md-chip-set>
          </div>

          <div class="sort-group">
            <span class="control-label">Sort by</span>
            <div class="sort-buttons">
              <button class={`sort-btn${this.sortBy === 'priority' ? ' sort-btn--active' : ''}`} onClick={() => this.toggleSort('priority')}>
                Priority
                {this.sortBy === 'priority' && <md-icon>{this.sortAsc ? 'arrow_upward' : 'arrow_downward'}</md-icon>}
              </button>
              <button class={`sort-btn${this.sortBy === 'createdAt' ? ' sort-btn--active' : ''}`} onClick={() => this.toggleSort('createdAt')}>
                Date created
                {this.sortBy === 'createdAt' && <md-icon>{this.sortAsc ? 'arrow_upward' : 'arrow_downward'}</md-icon>}
              </button>
            </div>
          </div>
        </div>

        <md-list>
          {items.map(item => (
            <md-list-item key={item.id} type="button" onClick={() => this.entryClicked.emit(item.id)}>
              <div slot="headline">{item.title}</div>
              <div slot="supporting-text">
                <div>{item.description}</div>
                <div>{'Created: ' + this.formatDate(item.createdAt)}</div>
              </div>
              <md-icon slot="start">build</md-icon>
              <div slot="end" class="item-end">
                <span class={`item-priority item-priority--${PRIORITY_CLASS[item.priority as ServicePriority]}`}>
                  {PRIORITY_LABEL[item.priority as ServicePriority]}
                </span>
                <span class={`item-status item-status--${STATUS_CLASS[item.status as ServiceStatus]}`}>
                  {STATUS_LABEL[item.status as ServiceStatus]}
                </span>
              </div>
            </md-list-item>
          ))}
        </md-list>

        <md-filled-icon-button class="fab" onClick={() => this.entryClicked.emit('@new')}>
          <md-icon>add</md-icon>
        </md-filled-icon-button>
      </Host>
    );
  }
}
