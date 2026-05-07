import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/textfield/filled-text-field';
import '@material/web/select/filled-select';
import '@material/web/select/select-option';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/divider/divider';
import '@material/web/icon/icon';

const EQUIPMENT_STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED'] as const;
type EquipmentStatus = typeof EQUIPMENT_STATUSES[number];

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  'ACTIVE': 'Active',
  'INACTIVE': 'Inactive',
  'UNDER_MAINTENANCE': 'Under Maintenance',
  'DECOMMISSIONED': 'Decommissioned',
};

@Component({
  tag: 'xds-inventory-equipment-editor',
  styleUrl: 'xds-inventory-equipment-editor.css',
  shadow: true,
})
export class XdsInventoryEquipmentEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string;

  @Event({ eventName: 'editor-closed' }) editorClosed!: EventEmitter<string>;

  @State() entry: any;
  @State() errorMessage: string;
  @State() isValid: boolean;

  private formElement!: HTMLFormElement;

  async componentWillLoad() {
    await this.getEntryAsync();
  }

  private async getEntryAsync() {
    if (this.entryId === '@new') {
      this.isValid = false;
      this.entry = {
        id: '@new',
        name: '',
        type: '',
        inventoryNumber: '',
        warrantyExpiry: '',
        status: 'ACTIVE',
        notes: '',
        locationId: '',
      };
      return;
    }
    try {
      const allEquipment = [
        { id: 'eq-001', name: 'Ultrazvuk Philips EPIQ 7',                  type: 'Ultrasonograf',   inventoryNumber: 'INV-2024-00421', warrantyExpiry: '2026-05-06', status: 'ACTIVE',            notes: 'Kalibrovaný 2024-03-01', locationId: 'loc-001' },
        { id: 'eq-002', name: 'Defibrilátor Zoll X Series',                type: 'Defibrilátor',    inventoryNumber: 'INV-2023-00185', warrantyExpiry: '2027-11-30', status: 'ACTIVE',            notes: null,                     locationId: 'loc-002' },
        { id: 'eq-003', name: 'Ventilátor Dräger Evita V300',              type: 'Ventilátor',      inventoryNumber: 'INV-2022-00077', warrantyExpiry: '2025-08-15', status: 'UNDER_MAINTENANCE', notes: 'Plánovaná výmena ventilu', locationId: 'loc-003' },
        { id: 'eq-004', name: 'Infúzna pumpa B. Braun',                    type: 'Infúzna pumpa',   inventoryNumber: 'INV-2021-00334', warrantyExpiry: '2024-03-01', status: 'INACTIVE',          notes: null,                     locationId: 'loc-004' },
        { id: 'eq-005', name: 'Pacientský monitor Mindray BeneVision N17', type: 'Monitor',         inventoryNumber: 'INV-2024-00512', warrantyExpiry: '2028-02-20', status: 'ACTIVE',            notes: null,                     locationId: 'loc-005' },
        { id: 'eq-006', name: 'RTG prístroj Siemens Multix',               type: 'RTG',             inventoryNumber: 'INV-2019-00023', warrantyExpiry: '2023-06-30', status: 'DECOMMISSIONED',    notes: 'Nahradený novším modelom', locationId: 'loc-006' },
      ];
      const found = allEquipment.find(e => e.id === this.entryId);
      if (found) {
        this.entry = { ...found };
        this.isValid = true;
      } else {
        this.errorMessage = `Equipment with id "${this.entryId}" not found`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot load equipment: ${err.message || 'unknown'}`;
    }
  }

  private handleInput(field: string, value: string) {
    this.entry = { ...this.entry, [field]: value };
    this.validateForm();
  }

  private validateForm(): boolean {
    if (!this.formElement) return false;
    let valid = true;
    for (let i = 0; i < this.formElement.children.length; i++) {
      const el = this.formElement.children[i] as any;
      if (el.checkValidity) valid = el.checkValidity() && valid;
    }
    this.isValid = valid;
    return valid;
  }

  private async updateEntry() {
    let valid = true;
    for (let i = 0; i < this.formElement.children.length; i++) {
      const el = this.formElement.children[i] as any;
      if (el.reportValidity) valid = el.reportValidity() && valid;
    }
    if (!valid) return;
    // API call goes here
    this.editorClosed.emit('store');
  }

  private async deleteEntry() {
    // API call goes here
    this.editorClosed.emit('delete');
  }

  render() {
    if (this.errorMessage) {
      return <Host><div class="error">{this.errorMessage}</div></Host>;
    }
    if (!this.entry) return <Host></Host>;

    return (
      <Host>
        <div class="editor-header">
          <h2>{this.entryId === '@new' ? 'New Equipment' : 'Edit Equipment'}</h2>
        </div>

        <form ref={el => this.formElement = el as HTMLFormElement}>
          <md-filled-text-field
            label="Name" required value={this.entry.name}
            oninput={(ev: InputEvent) => this.handleInput('name', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">medical_services</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Type" required value={this.entry.type}
            oninput={(ev: InputEvent) => this.handleInput('type', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">category</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Inventory number" disabled value={this.entry.inventoryNumber}>
            <md-icon slot="leading-icon">tag</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Warranty expiry" type="date" value={this.entry.warrantyExpiry}
            oninput={(ev: InputEvent) => this.handleInput('warrantyExpiry', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">calendar_today</md-icon>
          </md-filled-text-field>

          <md-filled-select
            label="Status"
            value={this.entry.status}
            oninput={(ev: InputEvent) => this.handleInput('status', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">info</md-icon>
            {EQUIPMENT_STATUSES.map(s => (
              <md-select-option value={s} selected={this.entry.status === s}>
                <div slot="headline">{STATUS_LABEL[s]}</div>
              </md-select-option>
            ))}
          </md-filled-select>

          <md-filled-text-field
            label="Notes" value={this.entry.notes ?? ''}
            oninput={(ev: InputEvent) => this.handleInput('notes', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">notes</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Location ID" value={this.entry.locationId ?? ''}
            oninput={(ev: InputEvent) => this.handleInput('locationId', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">location_on</md-icon>
          </md-filled-text-field>
        </form>

        <md-divider></md-divider>

        <div class="actions">
          <md-filled-tonal-button disabled={!this.entry || this.entryId === '@new'} onClick={() => this.deleteEntry()}>
            <md-icon slot="icon">delete</md-icon>
            Delete
          </md-filled-tonal-button>
          <span class="stretch-fill"></span>
          <md-outlined-button onClick={() => this.editorClosed.emit('cancel')}>
            Cancel
          </md-outlined-button>
          <md-filled-button onClick={() => this.updateEntry()}>
            <md-icon slot="icon">save</md-icon>
            Save
          </md-filled-button>
        </div>
      </Host>
    );
  }
}
