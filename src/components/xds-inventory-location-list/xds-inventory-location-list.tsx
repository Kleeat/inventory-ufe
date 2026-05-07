import { Component, Host, h, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/icon/icon';

type EquipmentStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'DECOMMISSIONED';

const STATUS_CLASS: Record<EquipmentStatus, string> = {
  'ACTIVE': 'active',
  'INACTIVE': 'inactive',
  'UNDER_MAINTENANCE': 'maintenance',
  'DECOMMISSIONED': 'decommissioned',
};

@Component({
  tag: 'xds-inventory-location-list',
  styleUrl: 'xds-inventory-location-list.css',
  shadow: true,
})
export class XdsInventoryLocationList {
  locationList: any[] = [];
  equipmentByLocation: Record<string, any[]> = {};

  @Event({ eventName: 'entry-clicked' }) entryClicked!: EventEmitter<string>;
  @Event({ eventName: 'equipment-clicked' }) equipmentClicked!: EventEmitter<string>;

  @State() copiedId: string | null = null;

  private copyId(ev: Event, id: string) {
    ev.stopPropagation();
    navigator.clipboard.writeText(id);
    this.copiedId = id;
    setTimeout(() => { this.copiedId = null; }, 1500);
  }

  async componentWillLoad() {
    this.locationList = await this.getLocationsAsync();
    const pairs = await Promise.all(
      this.locationList.map(async loc => {
        const eq = await this.getEquipmentForLocationAsync(loc.id);
        return [loc.id, eq] as [string, any[]];
      }),
    );
    this.equipmentByLocation = Object.fromEntries(pairs);
  }

  private async getLocationsAsync(): Promise<any[]> {
    return await Promise.resolve([
      {
        id: 'loc-001',
        building: 'Pavilón A',
        floor: '2. poschodie',
        department: 'Kardiológia',
        room: 'Miestnosť 204',
        description: 'Kardiologická ambulancia so zobrazovacou technikou.',
        equipmentCount: 1,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-04-15T10:30:00Z',
      },
      {
        id: 'loc-002',
        building: 'Pavilón C',
        floor: 'Prízemie',
        department: 'Urgentná medicína',
        room: 'Trauma bay 1',
        description: null,
        equipmentCount: 1,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-04-15T10:30:00Z',
      },
      {
        id: 'loc-003',
        building: 'Pavilón B',
        floor: '3. poschodie',
        department: 'Jednotka intenzívnej starostlivosti',
        room: 'Miestnosť 312',
        description: 'Jednotka pre kriticky chorých pacientov vyžadujúcich nepretržitý monitoring.',
        equipmentCount: 1,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-04-15T10:30:00Z',
      },
      {
        id: 'loc-004',
        building: 'Pavilón D',
        floor: '1. poschodie',
        department: 'Chirurgia',
        room: 'Sklad 110',
        description: null,
        equipmentCount: 1,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-04-15T10:30:00Z',
      },
      {
        id: 'loc-005',
        building: 'Pavilón A',
        floor: '4. poschodie',
        department: 'Neurológia',
        room: 'Miestnosť 401',
        description: null,
        equipmentCount: 1,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-04-15T10:30:00Z',
      },
      {
        id: 'loc-006',
        building: 'Pavilón E',
        floor: 'Suterén',
        department: 'Rádiológia',
        room: 'RTG kabína 2',
        description: 'Kabína pre RTG vyšetrenia.',
        equipmentCount: 1,
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-04-15T10:30:00Z',
      },
    ]);
  }

  private async getEquipmentForLocationAsync(locationId: string): Promise<any[]> {
    const allEquipment = [
      { id: 'eq-001', name: 'Ultrazvuk Philips EPIQ 7',                  inventoryNumber: 'INV-2024-00421', status: 'ACTIVE',            locationId: 'loc-001' },
      { id: 'eq-002', name: 'Defibrilátor Zoll X Series',                inventoryNumber: 'INV-2023-00185', status: 'ACTIVE',            locationId: 'loc-002' },
      { id: 'eq-003', name: 'Ventilátor Dräger Evita V300',              inventoryNumber: 'INV-2022-00077', status: 'UNDER_MAINTENANCE', locationId: 'loc-003' },
      { id: 'eq-004', name: 'Infúzna pumpa B. Braun',                    inventoryNumber: 'INV-2021-00334', status: 'INACTIVE',          locationId: 'loc-004' },
      { id: 'eq-005', name: 'Pacientský monitor Mindray BeneVision N17', inventoryNumber: 'INV-2024-00512', status: 'ACTIVE',            locationId: 'loc-005' },
      { id: 'eq-006', name: 'RTG prístroj Siemens Multix',               inventoryNumber: 'INV-2019-00023', status: 'DECOMMISSIONED',    locationId: 'loc-006' },
    ];
    return await Promise.resolve(allEquipment.filter(eq => eq.locationId === locationId));
  }

  render() {
    return (
      <Host>
        <div class="list-header">
          <h2>Locations</h2>
          <span class="item-count">{this.locationList.length} locations</span>
        </div>

        <div class="location-grid">
          {this.locationList.map(loc => {
            const items = this.equipmentByLocation[loc.id] ?? [];
            return (
              <div class="location-card" key={loc.id}>
                <div class="card-header" onClick={() => this.entryClicked.emit(loc.id)}>
                  <div class="card-header-top">
                    <div class="card-icon">
                      <md-icon>location_on</md-icon>
                    </div>
                    <div class="card-title-block">
                      <span class="card-name">{loc.room}</span>
                      <span class="card-breadcrumb">{loc.department} · {loc.building} · {loc.floor}</span>
                      <button class="id-btn" onClick={(ev: Event) => this.copyId(ev, loc.id)}>
                        <md-icon>{this.copiedId === loc.id ? 'check' : 'content_copy'}</md-icon>
                        {loc.id}
                      </button>
                    </div>
                    <span class="card-count">{items.length}</span>
                  </div>
                  {loc.description && <p class="card-description">{loc.description}</p>}
                </div>

                {items.length === 0
                  ? <p class="card-empty">No equipment assigned</p>
                  : (
                    <ul class="equipment-rows">
                      {items.map(eq => (
                        <li class="equipment-row" key={eq.id} onClick={(e) => { e.stopPropagation(); this.equipmentClicked.emit(eq.id); }}>
                          <md-icon class="eq-icon">medical_services</md-icon>
                          <div class="eq-info">
                            <span class="eq-name">{eq.name}</span>
                            <div class="eq-meta">
                              <span class="eq-inv">{eq.inventoryNumber}</span>
                              <span class={`eq-status eq-status--${STATUS_CLASS[eq.status as EquipmentStatus]}`}>
                                {eq.status}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                }
              </div>
            );
          })}
        </div>
      </Host>
    );
  }
}
