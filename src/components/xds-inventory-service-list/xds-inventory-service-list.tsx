import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/list/list';
import '@material/web/list/list-item';
import '@material/web/icon/icon';
import '@material/web/iconbutton/filled-icon-button';
import { ServiceRequestsApi, ServiceRequest, ServiceRequestStatus, Priority, Configuration } from '../../api/inventory';

type SortField = 'priority' | 'createdAt';

const SERVICE_STATUSES: ServiceRequestStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED'];

const STATUS_LABEL: Record<ServiceRequestStatus, string> = {
  'NEW': 'New',
  'ASSIGNED': 'Assigned',
  'IN_PROGRESS': 'In Progress',
  'CLOSED': 'Closed',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  'LOW': 'Low',
  'MEDIUM': 'Medium',
  'HIGH': 'High',
  'CRITICAL': 'Critical',
};

const STATUS_CLASS: Record<ServiceRequestStatus, string> = {
  'NEW': 'open',
  'ASSIGNED': 'assigned',
  'IN_PROGRESS': 'in-progress',
  'CLOSED': 'closed',
};

const PRIORITY_CLASS: Record<Priority, string> = {
  'LOW': 'low',
  'MEDIUM': 'medium',
  'HIGH': 'high',
  'CRITICAL': 'critical',
};

const PRIORITY_ORDER: Record<Priority, number> = {
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
  @Prop() apiBase: string = '';

  @State() serviceRequests: ServiceRequest[] = [];
  @State() statusFilters: ServiceRequestStatus[] = [];
  @State() sortBy: SortField | null = null;
  @State() sortAsc: boolean = true;

  @Event({ eventName: 'entry-clicked' }) entryClicked!: EventEmitter<string>;

  async componentWillLoad() {
    this.serviceRequests = await this.getServiceRequestsAsync();
  }

  private async getServiceRequestsAsync(): Promise<ServiceRequest[]> {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new ServiceRequestsApi(configuration);
      const response = await api.listServiceRequestsRaw({ pageSize: 1000 });
      if (response.raw.status < 299) {
        const page = await response.value();
        return page.content || [];
      }
    } catch (err: any) {
      // fall through to empty
    }
    return [];
  }

  private getFilteredSortedItems(): ServiceRequest[] {
    let items = this.serviceRequests;

    if (this.statusFilters.length > 0) {
      items = items.filter(i => this.statusFilters.includes(i.status));
    }

    if (this.sortBy === 'priority') {
      items = [...items].sort((a, b) => {
        const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        return this.sortAsc ? diff : -diff;
      });
    } else if (this.sortBy === 'createdAt') {
      items = [...items].sort((a, b) => {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        return this.sortAsc ? diff : -diff;
      });
    }

    return items;
  }

  private toggleStatusFilter(status: ServiceRequestStatus) {
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

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  render() {
    const items = this.getFilteredSortedItems();
    const isFiltered = this.statusFilters.length > 0;

    return (
      <Host>
        <div class="list-header">
          <h2>Service Requests</h2>
          <span class="item-count">
            {isFiltered ? `${items.length} of ${this.serviceRequests.length}` : items.length} requests
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
                <span class={`item-priority item-priority--${PRIORITY_CLASS[item.priority]}`}>
                  {PRIORITY_LABEL[item.priority]}
                </span>
                <span class={`item-status item-status--${STATUS_CLASS[item.status]}`}>
                  {STATUS_LABEL[item.status]}
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
