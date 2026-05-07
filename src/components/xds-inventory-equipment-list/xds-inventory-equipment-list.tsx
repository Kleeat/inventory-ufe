import { Component, Host, h, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/list/list';
import '@material/web/list/list-item';
import '@material/web/icon/icon';

type EquipmentStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'DECOMMISSIONED';
type SortField = 'status' | 'warrantyExpiry';

const EQUIPMENT_STATUSES: EquipmentStatus[] = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED'];

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  UNDER_MAINTENANCE: 'Under Maintenance',
  DECOMMISSIONED: 'Decommissioned',
};

const STATUS_CLASS: Record<EquipmentStatus, string> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  UNDER_MAINTENANCE: 'maintenance',
  DECOMMISSIONED: 'decommissioned',
};

const STATUS_ORDER: Record<EquipmentStatus, number> = {
  DECOMMISSIONED: 0,
  INACTIVE: 1,
  UNDER_MAINTENANCE: 2,
  ACTIVE: 3,
};

@Component({
  tag: 'xds-inventory-equipment-list',
  styleUrl: 'xds-inventory-equipment-list.css',
  shadow: true,
})
export class XdsInventoryEquipmentList {
  equipmentList: any[] = [];

  @Event({ eventName: 'entry-clicked' }) entryClicked!: EventEmitter<string>;

  @State() statusFilters: EquipmentStatus[] = [];
  @State() copiedId: string | null = null;
  @State() sortBy: SortField | null = null;
  @State() sortAsc: boolean = true;

  async componentWillLoad() {
    this.equipmentList = await this.getEquipmentListAsync();
  }

  private async getEquipmentListAsync() {
    return await Promise.resolve([
      {
        id: 'eq-001',
        name: 'Ultrazvuk Philips EPIQ 7',
        type: 'Ultrasonograf',
        inventoryNumber: 'INV-2024-00421',
        warrantyExpiry: '2026-05-06',
        status: 'ACTIVE',
        notes: 'Kalibrovaný 2024-03-01',
        openServiceRequestCount: 2,
        location: { department: 'Kardiológia', building: 'Pavilón A', floor: '2. poschodie', room: 'Miestnosť 204' },
      },
      {
        id: 'eq-002',
        name: 'Defibrilátor Zoll X Series',
        type: 'Defibrilátor',
        inventoryNumber: 'INV-2023-00185',
        warrantyExpiry: '2027-11-30',
        status: 'ACTIVE',
        notes: null,
        openServiceRequestCount: 0,
        location: { department: 'Urgentná medicína', building: 'Pavilón C', floor: 'Prízemie', room: 'Trauma bay 1' },
      },
      {
        id: 'eq-003',
        name: 'Ventilátor Dräger Evita V300',
        type: 'Ventilátor',
        inventoryNumber: 'INV-2022-00077',
        warrantyExpiry: '2025-08-15',
        status: 'UNDER_MAINTENANCE',
        notes: 'Plánovaná výmena ventilu',
        openServiceRequestCount: 1,
        location: { department: 'Jednotka intenzívnej starostlivosti', building: 'Pavilón B', floor: '3. poschodie', room: 'Miestnosť 312' },
      },
      {
        id: 'eq-004',
        name: 'Infúzna pumpa B. Braun',
        type: 'Infúzna pumpa',
        inventoryNumber: 'INV-2021-00334',
        warrantyExpiry: '2024-03-01',
        status: 'INACTIVE',
        notes: null,
        openServiceRequestCount: 0,
        location: { department: 'Chirurgia', building: 'Pavilón D', floor: '1. poschodie', room: 'Sklad 110' },
      },
      {
        id: 'eq-005',
        name: 'Pacientský monitor Mindray BeneVision N17',
        type: 'Monitor',
        inventoryNumber: 'INV-2024-00512',
        warrantyExpiry: '2028-02-20',
        status: 'ACTIVE',
        notes: null,
        openServiceRequestCount: 0,
        location: { department: 'Neurológia', building: 'Pavilón A', floor: '4. poschodie', room: 'Miestnosť 401' },
      },
      {
        id: 'eq-006',
        name: 'RTG prístroj Siemens Multix',
        type: 'RTG',
        inventoryNumber: 'INV-2019-00023',
        warrantyExpiry: '2023-06-30',
        status: 'DECOMMISSIONED',
        notes: 'Nahradený novším modelom',
        openServiceRequestCount: 0,
        location: { department: 'Rádiológia', building: 'Pavilón E', floor: 'Suterén', room: 'RTG kabína 2' },
      },
    ]);
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
        const diff = new Date(a.warrantyExpiry).getTime() - new Date(b.warrantyExpiry).getTime();
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

  private copyId(ev: Event, id: string) {
    ev.stopPropagation();
    navigator.clipboard.writeText(id);
    this.copiedId = id;
    setTimeout(() => {
      this.copiedId = null;
    }, 1500);
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
                <button class="id-btn" onClick={(ev: Event) => this.copyId(ev, item.id)}>
                  <md-icon>{this.copiedId === item.id ? 'check' : 'content_copy'}</md-icon>
                  {item.id}
                </button>
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
      </Host>
    );
  }
}
