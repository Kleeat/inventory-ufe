import { Component, Host, h, State } from '@stencil/core';

type EquipmentType = 'Airway' | 'Cardiac' | 'Trauma' | 'Medication' | 'Monitoring' | 'Immobilization';
type EquipmentCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Out of Service';

interface Location {
  id: string;
  name: string;
  building: string;
  floor: string;
  department: string;
  icon: string;
}

interface LocatedEquipment {
  name: string;
  type: EquipmentType;
  inventoryNumber: string;
  condition: EquipmentCondition;
  locationId: string;
}

const LOCATIONS: Location[] = [
  { id: 'unit-101', name: 'Unit 101', building: 'Ambulance Bay', floor: 'Ground Floor', department: 'Bay A', icon: 'airport_shuttle' },
  { id: 'unit-102', name: 'Unit 102', building: 'Ambulance Bay', floor: 'Ground Floor', department: 'Bay B', icon: 'airport_shuttle' },
  { id: 'unit-103', name: 'Unit 103', building: 'Ambulance Bay', floor: 'Ground Floor', department: 'Bay C', icon: 'airport_shuttle' },
  { id: 'station-storage', name: 'Station Storage', building: 'Main Building', floor: 'Ground Floor', department: 'Storage Room', icon: 'inventory_2' },
  { id: 'maintenance-bay', name: 'Maintenance Bay', building: 'Main Building', floor: 'Ground Floor', department: 'Workshop', icon: 'build' },
];

const TYPE_ICONS: Record<EquipmentType, string> = {
  Airway: 'air',
  Cardiac: 'monitor_heart',
  Trauma: 'emergency',
  Medication: 'medication',
  Monitoring: 'vital_signs',
  Immobilization: 'accessibility_new',
};

const CONDITION_CLASS: Record<EquipmentCondition, string> = {
  'Excellent': 'excellent',
  'Good': 'good',
  'Fair': 'fair',
  'Poor': 'poor',
  'Out of Service': 'out-of-service',
};

@Component({
  tag: 'xds-inventory-location-list',
  styleUrl: 'xds-inventory-location-list.css',
  shadow: true,
})
export class XdsInventoryLocationList {
  @State() locationFilters: string[] = [];

  private getEquipment(): LocatedEquipment[] {
    return [
      { name: 'BVM Resuscitator',    type: 'Airway',          inventoryNumber: 'INV-001', condition: 'Good',           locationId: 'unit-101' },
      { name: 'Defibrillator AED',   type: 'Cardiac',         inventoryNumber: 'INV-002', condition: 'Excellent',      locationId: 'unit-101' },
      { name: 'Cardiac Monitor',     type: 'Monitoring',      inventoryNumber: 'INV-005', condition: 'Excellent',      locationId: 'unit-101' },
      { name: 'Stretcher',           type: 'Trauma',          inventoryNumber: 'INV-009', condition: 'Good',           locationId: 'unit-101' },
      { name: 'Suction Unit',        type: 'Airway',          inventoryNumber: 'INV-003', condition: 'Fair',           locationId: 'unit-102' },
      { name: 'Trauma Kit',          type: 'Trauma',          inventoryNumber: 'INV-004', condition: 'Good',           locationId: 'unit-102' },
      { name: 'Pulse Oximeter',      type: 'Monitoring',      inventoryNumber: 'INV-008', condition: 'Fair',           locationId: 'unit-102' },
      { name: 'IV Infusion Pump',    type: 'Medication',      inventoryNumber: 'INV-007', condition: 'Good',           locationId: 'unit-103' },
      { name: 'Cervical Collar Set', type: 'Immobilization',  inventoryNumber: 'INV-006', condition: 'Poor',           locationId: 'station-storage' },
      { name: 'Laryngoscope Set',    type: 'Airway',          inventoryNumber: 'INV-010', condition: 'Out of Service', locationId: 'maintenance-bay' },
    ];
  }

  private toggleLocationFilter(id: string) {
    this.locationFilters = this.locationFilters.includes(id)
      ? this.locationFilters.filter(l => l !== id)
      : [...this.locationFilters, id];
  }

  render() {
    const equipment = this.getEquipment();
    const visibleLocations = this.locationFilters.length > 0
      ? LOCATIONS.filter(l => this.locationFilters.includes(l.id))
      : LOCATIONS;

    const totalVisible = visibleLocations.reduce(
      (sum, loc) => sum + equipment.filter(e => e.locationId === loc.id).length,
      0,
    );
    const isFiltered = this.locationFilters.length > 0;

    return (
      <Host>
        <div class="list-header">
          <h2>Locations</h2>
          <span class="item-count">
            {isFiltered ? `${totalVisible} of ${equipment.length}` : equipment.length} items
          </span>
        </div>

        <div class="controls">
          <div class="filter-group">
            <span class="control-label">Location</span>
            <md-chip-set>
              {LOCATIONS.map(loc => (
                <md-filter-chip
                  key={loc.id}
                  selected={this.locationFilters.includes(loc.id)}
                  onClick={() => this.toggleLocationFilter(loc.id)}
                >
                  {loc.name}
                </md-filter-chip>
              ))}
            </md-chip-set>
          </div>
        </div>

        <div class="location-grid">
          {visibleLocations.map(loc => {
            const items = equipment.filter(e => e.locationId === loc.id);
            return (
              <div class="location-card" key={loc.id}>
                <div class="card-header">
                  <div class="card-icon">
                    <md-icon>{loc.icon}</md-icon>
                  </div>
                  <div class="card-title-block">
                    <span class="card-name">{loc.name}</span>
                    <span class="card-breadcrumb">{loc.building} · {loc.floor} · {loc.department}</span>
                  </div>
                  <span class="card-count">{items.length}</span>
                </div>

                {items.length === 0
                  ? <p class="card-empty">No equipment assigned</p>
                  : (
                    <ul class="equipment-rows">
                      {items.map(eq => (
                        <li class="equipment-row" key={eq.inventoryNumber}>
                          <div class="eq-icon">
                            <md-icon>{TYPE_ICONS[eq.type]}</md-icon>
                          </div>
                          <span class="eq-name">{eq.name}</span>
                          <span class="eq-inv">{eq.inventoryNumber}</span>
                          <span class={`eq-condition eq-condition--${CONDITION_CLASS[eq.condition]}`}>
                            {eq.condition}
                          </span>
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
