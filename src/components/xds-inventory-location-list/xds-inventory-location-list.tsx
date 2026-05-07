import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/icon/icon';
import '@material/web/iconbutton/filled-icon-button';
import { LocationsApi, Location, Equipment, EquipmentStatus, Configuration } from '../../api/inventory';

const STATUS_CLASS: Record<EquipmentStatus, string> = {
  'ACTIVE': 'active',
  'IN_SERVICE': 'in-service',
  'DECOMMISSIONED': 'decommissioned',
};

@Component({
  tag: 'xds-inventory-location-list',
  styleUrl: 'xds-inventory-location-list.css',
  shadow: true,
})
export class XdsInventoryLocationList {
  @Prop() apiBase: string = '';

  @State() locationList: Location[] = [];
  @State() equipmentByLocation: Record<string, Equipment[]> = {};
  @State() copiedId: string | null = null;

  @Event({ eventName: 'entry-clicked' }) entryClicked!: EventEmitter<string>;
  @Event({ eventName: 'equipment-clicked' }) equipmentClicked!: EventEmitter<string>;

  async componentWillLoad() {
    this.locationList = await this.getLocationsAsync();
    const pairs = await Promise.all(
      this.locationList.map(async loc => {
        const eq = await this.getEquipmentForLocationAsync(loc.id);
        return [loc.id, eq] as [string, Equipment[]];
      }),
    );
    this.equipmentByLocation = Object.fromEntries(pairs);
  }

  private async getLocationsAsync(): Promise<Location[]> {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new LocationsApi(configuration);
      const response = await api.listLocationsRaw({ pageSize: 1000 });
      if (response.raw.status < 299) {
        const page = await response.value();
        return page.content || [];
      }
    } catch (err: any) {
      // fall through to empty
    }
    return [];
  }

  private async getEquipmentForLocationAsync(locationId: string): Promise<Equipment[]> {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new LocationsApi(configuration);
      const response = await api.listEquipmentAtLocationRaw({ locationId, pageSize: 1000 });
      if (response.raw.status < 299) {
        const page = await response.value();
        return page.content || [];
      }
    } catch (err: any) {
      // fall through to empty
    }
    return [];
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
                              <span class={`eq-status eq-status--${STATUS_CLASS[eq.status]}`}>
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

        <md-filled-icon-button class="fab" onClick={() => this.entryClicked.emit('@new')}>
          <md-icon>add</md-icon>
        </md-filled-icon-button>
      </Host>
    );
  }
}
