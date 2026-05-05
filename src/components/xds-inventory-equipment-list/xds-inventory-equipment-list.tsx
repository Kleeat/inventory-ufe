import { Component, Host, h, State } from '@stencil/core';

type EquipmentType = 'Airway' | 'Cardiac' | 'Trauma' | 'Medication' | 'Monitoring' | 'Immobilization';
type EquipmentCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Out of Service';
type SortField = 'condition' | 'lifespan';

interface AmbulanceEquipment {
  name: string;
  type: EquipmentType;
  inventoryNumber: string;
  condition: EquipmentCondition;
  location: string;
  replaceBy: string;
}

const EQUIPMENT_TYPES: EquipmentType[] = ['Airway', 'Cardiac', 'Trauma', 'Medication', 'Monitoring', 'Immobilization'];
const EQUIPMENT_CONDITIONS: EquipmentCondition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Out of Service'];

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

const CONDITION_ORDER: Record<EquipmentCondition, number> = {
  'Out of Service': 0,
  'Poor': 1,
  'Fair': 2,
  'Good': 3,
  'Excellent': 4,
};

@Component({
  tag: 'xds-inventory-equipment-list',
  styleUrl: 'xds-inventory-equipment-list.css',
  shadow: true,
})
export class XdsInventoryEquipmentList {
  @State() typeFilters: EquipmentType[] = [];
  @State() conditionFilters: EquipmentCondition[] = [];
  @State() sortBy: SortField | null = null;
  @State() sortAsc: boolean = true;

  private getEquipmentList(): AmbulanceEquipment[] {
    return [
      { name: 'BVM Resuscitator', type: 'Airway', inventoryNumber: 'INV-001', condition: 'Good', location: 'Unit 101', replaceBy: '2027-03-15' },
      { name: 'Defibrillator AED', type: 'Cardiac', inventoryNumber: 'INV-002', condition: 'Excellent', location: 'Unit 101', replaceBy: '2028-06-01' },
      { name: 'Suction Unit', type: 'Airway', inventoryNumber: 'INV-003', condition: 'Fair', location: 'Unit 102', replaceBy: '2026-09-30' },
      { name: 'Trauma Kit', type: 'Trauma', inventoryNumber: 'INV-004', condition: 'Good', location: 'Unit 102', replaceBy: '2027-01-20' },
      { name: 'Cardiac Monitor', type: 'Monitoring', inventoryNumber: 'INV-005', condition: 'Excellent', location: 'Unit 101', replaceBy: '2029-11-15' },
      { name: 'Cervical Collar Set', type: 'Immobilization', inventoryNumber: 'INV-006', condition: 'Poor', location: 'Station Storage', replaceBy: '2026-04-01' },
      { name: 'IV Infusion Pump', type: 'Medication', inventoryNumber: 'INV-007', condition: 'Good', location: 'Unit 103', replaceBy: '2027-08-10' },
      { name: 'Pulse Oximeter', type: 'Monitoring', inventoryNumber: 'INV-008', condition: 'Fair', location: 'Unit 102', replaceBy: '2026-12-31' },
      { name: 'Stretcher', type: 'Trauma', inventoryNumber: 'INV-009', condition: 'Good', location: 'Unit 101', replaceBy: '2028-03-22' },
      { name: 'Laryngoscope Set', type: 'Airway', inventoryNumber: 'INV-010', condition: 'Out of Service', location: 'Station Storage', replaceBy: '2025-10-05' },
    ];
  }

  private getFilteredSortedItems(): AmbulanceEquipment[] {
    let items = this.getEquipmentList();

    if (this.typeFilters.length > 0) {
      items = items.filter(i => this.typeFilters.includes(i.type));
    }
    if (this.conditionFilters.length > 0) {
      items = items.filter(i => this.conditionFilters.includes(i.condition));
    }

    if (this.sortBy === 'condition') {
      items = [...items].sort((a, b) => {
        const diff = CONDITION_ORDER[a.condition] - CONDITION_ORDER[b.condition];
        return this.sortAsc ? diff : -diff;
      });
    } else if (this.sortBy === 'lifespan') {
      items = [...items].sort((a, b) => {
        const diff = new Date(a.replaceBy).getTime() - new Date(b.replaceBy).getTime();
        return this.sortAsc ? diff : -diff;
      });
    }

    return items;
  }

  private toggleTypeFilter(type: EquipmentType) {
    this.typeFilters = this.typeFilters.includes(type) ? this.typeFilters.filter(t => t !== type) : [...this.typeFilters, type];
  }

  private toggleConditionFilter(cond: EquipmentCondition) {
    this.conditionFilters = this.conditionFilters.includes(cond) ? this.conditionFilters.filter(c => c !== cond) : [...this.conditionFilters, cond];
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
    const all = this.getEquipmentList();
    const items = this.getFilteredSortedItems();
    const isFiltered = this.typeFilters.length > 0 || this.conditionFilters.length > 0;

    return (
      <Host>
        <div class="list-header">
          <h2>Equipment</h2>
          <span class="item-count">
            {isFiltered ? `${items.length} of ${all.length}` : items.length} items
          </span>
        </div>

        <div class="controls">
          <div class="filter-group">
            <span class="control-label">Type</span>
            <md-chip-set>
              {EQUIPMENT_TYPES.map(type => (
                <md-filter-chip key={type} selected={this.typeFilters.includes(type)} onClick={() => this.toggleTypeFilter(type)}>
                  {type}
                </md-filter-chip>
              ))}
            </md-chip-set>
          </div>

          <div class="filter-group">
            <span class="control-label">Condition</span>
            <md-chip-set>
              {EQUIPMENT_CONDITIONS.map(cond => (
                <span class={`cond-chip-wrap cond-chip-wrap--${CONDITION_CLASS[cond]}`}>
                  <md-filter-chip key={cond} selected={this.conditionFilters.includes(cond)} onClick={() => this.toggleConditionFilter(cond)}>
                    {cond}
                  </md-filter-chip>
                </span>
              ))}
            </md-chip-set>
          </div>

          <div class="sort-group">
            <span class="control-label">Sort by</span>
            <div class="sort-buttons">
              <button class={`sort-btn${this.sortBy === 'condition' ? ' sort-btn--active' : ''}`} onClick={() => this.toggleSort('condition')}>
                Condition
                {this.sortBy === 'condition' && <md-icon>{this.sortAsc ? 'arrow_upward' : 'arrow_downward'}</md-icon>}
              </button>
              <button class={`sort-btn${this.sortBy === 'lifespan' ? ' sort-btn--active' : ''}`} onClick={() => this.toggleSort('lifespan')}>
                Replace date
                {this.sortBy === 'lifespan' && <md-icon>{this.sortAsc ? 'arrow_upward' : 'arrow_downward'}</md-icon>}
              </button>
            </div>
          </div>
        </div>

        <div class="equipment-list">
          {items.map(item => (
            <div class="equipment-item" key={item.inventoryNumber}>
              <div class="item-icon">
                <md-icon>{TYPE_ICONS[item.type]}</md-icon>
              </div>
              <div class="item-content">
                <div class="item-primary">
                  <span class="item-name">{item.name}</span>
                  <span class="item-inv">{item.inventoryNumber}</span>
                </div>
                <div class="item-secondary">
                  <span class="item-type">{item.type}</span>
                  <span class={`item-condition item-condition--${CONDITION_CLASS[item.condition]}`}>{item.condition}</span>
                  <span class="item-location">
                    <md-icon>location_on</md-icon>
                    {item.location}
                  </span>
                  <span class="item-lifespan">
                    <md-icon>event</md-icon>
                    {this.formatDate(item.replaceBy)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Host>
    );
  }
}
