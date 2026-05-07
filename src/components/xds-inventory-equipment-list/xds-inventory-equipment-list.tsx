import { Component, Host, h, State, Event, EventEmitter, Prop } from '@stencil/core';
import { Configuration, EquipmentApi, EquipmentPage, Equipment, EquipmentStatus } from '../../api/inventory';
import '@material/web/list/list';
import '@material/web/list/list-item';
import '@material/web/icon/icon';

type SortField = 'status' | 'warrantyExpiry';

const EQUIPMENT_STATUSES: EquipmentStatus[] = ['ACTIVE', 'IN_SERVICE', 'DECOMMISSIONED'];

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  ACTIVE: 'Active',
  IN_SERVICE: 'In Service',
  DECOMMISSIONED: 'Decommissioned',
};

const STATUS_CLASS: Record<EquipmentStatus, string> = {
  ACTIVE: 'active',
  IN_SERVICE: 'in-service',
  DECOMMISSIONED: 'decommissioned',
};

const STATUS_ORDER: Record<EquipmentStatus, number> = {
  DECOMMISSIONED: 0,
  IN_SERVICE: 1,
  ACTIVE: 2,
};

@Component({
  tag: 'xds-inventory-equipment-list',
  styleUrl: 'xds-inventory-equipment-list.css',
  shadow: true,
})
export class XdsInventoryEquipmentList {
  equipmentList: Equipment[] = [];

  @Event({ eventName: 'entry-clicked' }) entryClicked!: EventEmitter<string>;

  @State() statusFilters: EquipmentStatus[] = [];
  @State() copiedId: string | null = null;
  @State() sortBy: SortField | null = null;
  @State() sortAsc: boolean = true;
  @Prop() apiBase: string | undefined;
  @State() errorMessage: string | undefined;

  async componentWillLoad() {
    this.equipmentList = await this.getEquipmentListAsync();
  }

  private async getEquipmentListAsync() {
    // be prepared for connectivitiy issues
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });

      const equipmentApi = new EquipmentApi(configuration);
      const response = await equipmentApi.listEquipmentRaw({});
      if (response.raw.status < 299) {
        return (await response.value()).content ?? [];
      } else {
        this.errorMessage = `Cannot retrieve list of equipments: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve list of equipments: ${err.message || 'unknown'}`;
    }
    return [];
  }

  private getFilteredSortedItems(): any[] {
    let items = this.equipmentList ?? [];

    if (this.statusFilters.length > 0) {
      items = items.filter(i => this.statusFilters.includes(i.status));
    }

    if (this.sortBy === 'status') {
      items = [...items].sort((a, b) => {
        const diff = STATUS_ORDER[a.status as EquipmentStatus] - STATUS_ORDER[b.status as EquipmentStatus];
        return this.sortAsc ? diff : -diff;
      });
    } else if (this.sortBy === 'warrantyExpiry') {
      items = [...items].sort((a, b) => {
        const aTime = a.warrantyExpiry ? new Date(a.warrantyExpiry).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.warrantyExpiry ? new Date(b.warrantyExpiry).getTime() : Number.POSITIVE_INFINITY;
        const diff = aTime - bTime;
        return this.sortAsc ? diff : -diff;
      });
    }

    return items;
  }

  private toggleStatusFilter(status: EquipmentStatus) {
    this.statusFilters = this.statusFilters.includes(status) ? this.statusFilters.filter(s => s !== status) : [...this.statusFilters, status];
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
        {this.errorMessage ? (
          <div class="error">{this.errorMessage}</div>
        ) : (
          <>
            <div class="list-header">
              <h2>Equipment</h2>
              <span class="item-count">{isFiltered ? `${items.length} of ${(this.equipmentList ?? []).length}` : items.length} items</span>
            </div>

            <div class="controls">
              <div class="filter-group">
                <span class="control-label">Status</span>
                <md-chip-set>
                  {EQUIPMENT_STATUSES.map(status => (
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
                  <button class={`sort-btn${this.sortBy === 'status' ? ' sort-btn--active' : ''}`} onClick={() => this.toggleSort('status')}>
                    Status
                    {this.sortBy === 'status' && <md-icon>{this.sortAsc ? 'arrow_upward' : 'arrow_downward'}</md-icon>}
                  </button>
                  <button class={`sort-btn${this.sortBy === 'warrantyExpiry' ? ' sort-btn--active' : ''}`} onClick={() => this.toggleSort('warrantyExpiry')}>
                    Warranty expiry
                    {this.sortBy === 'warrantyExpiry' && <md-icon>{this.sortAsc ? 'arrow_upward' : 'arrow_downward'}</md-icon>}
                  </button>
                </div>
              </div>
            </div>

            <md-list>
              {items.map(item => (
                <md-list-item key={item.id} type="button" onClick={() => this.entryClicked.emit(item.id)}>
                  <div slot="headline">{item.name}</div>
                  <div slot="supporting-text">
                    <div>{item.inventoryNumber + ' · ' + item.type + ' · Warranty: ' + this.formatDate(item.warrantyExpiry)}</div>
                    <div>
                      <strong class="item-dept">{item.location?.department}</strong>
                      {[item.location?.building, item.location?.floor, item.location?.room].filter(Boolean).map(part => ` · ${part}`)}
                    </div>
                    {item.notes && <div class="item-notes">{item.notes}</div>}
                  </div>
                  <md-icon slot="start">medical_services</md-icon>
                  <div slot="end" class="item-end">
                    {item.openServiceRequestCount > 0 && (
                      <span class="service-badge">
                        <md-icon>warning</md-icon>
                        {item.openServiceRequestCount}
                      </span>
                    )}
                    <span class={`item-status item-status--${STATUS_CLASS[item.status as EquipmentStatus]}`}>{STATUS_LABEL[item.status as EquipmentStatus]}</span>
                  </div>
                </md-list-item>
              ))}
            </md-list>

            <md-filled-icon-button class="fab" onClick={() => this.entryClicked.emit('@new')}>
              <md-icon>add</md-icon>
            </md-filled-icon-button>
          </>
        )}
      </Host>
    );
  }
}
