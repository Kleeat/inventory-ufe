import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/textfield/filled-text-field';
import '@material/web/select/filled-select';
import '@material/web/select/select-option';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/divider/divider';
import '@material/web/icon/icon';
import { EquipmentApi, LocationsApi, Equipment, EquipmentCreate, EquipmentUpdate, EquipmentStatus, Location, Configuration } from '../../api/inventory';

const EQUIPMENT_STATUSES: EquipmentStatus[] = ['ACTIVE', 'IN_SERVICE', 'DECOMMISSIONED'];

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  'ACTIVE': 'Active',
  'IN_SERVICE': 'In Service',
  'DECOMMISSIONED': 'Decommissioned',
};

interface EquipmentFormData {
  id: string;
  name: string;
  type: string;
  inventoryNumber: string;
  warrantyExpiry: string;
  status: EquipmentStatus;
  notes: string;
  locationId: string;
}

@Component({
  tag: 'xds-inventory-equipment-editor',
  styleUrl: 'xds-inventory-equipment-editor.css',
  shadow: true,
})
export class XdsInventoryEquipmentEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string;

  @Event({ eventName: 'editor-closed' }) editorClosed!: EventEmitter<string>;

  @State() entry: EquipmentFormData;
  @State() locations: Location[] = [];
  @State() errorMessage: string;
  @State() isValid: boolean;

  private formElement!: HTMLFormElement;

  async componentWillLoad() {
    await Promise.all([this.getEntryAsync(), this.getLocations()]);
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
    if (!this.entryId) {
      this.isValid = false;
      return;
    }
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new EquipmentApi(configuration);
      const response = await api.getEquipmentRaw({ equipmentId: this.entryId });
      if (response.raw.status < 299) {
        const equipment: Equipment = await response.value();
        this.entry = {
          id: equipment.id,
          name: equipment.name,
          type: equipment.type,
          inventoryNumber: equipment.inventoryNumber,
          warrantyExpiry: equipment.warrantyExpiry
            ? equipment.warrantyExpiry.toISOString().substring(0, 10)
            : '',
          status: equipment.status,
          notes: equipment.notes ?? '',
          locationId: equipment.locationId,
        };
        this.isValid = true;
      } else {
        this.errorMessage = `Cannot load equipment: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot load equipment: ${err.message || 'unknown'}`;
    }
  }

  private async getLocations() {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new LocationsApi(configuration);
      const response = await api.listLocationsRaw({ pageSize: 1000 });
      if (response.raw.status < 299) {
        const page = await response.value();
        this.locations = page.content || [];
      }
    } catch (err: any) {
      // non-critical — location dropdown falls back to empty
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

    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new EquipmentApi(configuration);
      const warrantyExpiry = this.entry.warrantyExpiry
        ? new Date(this.entry.warrantyExpiry)
        : undefined;

      let response: any;
      if (this.entryId === '@new') {
        const payload: EquipmentCreate = {
          name: this.entry.name,
          type: this.entry.type,
          inventoryNumber: this.entry.inventoryNumber,
          warrantyExpiry,
          locationId: this.entry.locationId,
          notes: this.entry.notes || undefined,
        };
        response = await api.createEquipmentRaw({ equipmentCreate: payload });
      } else {
        const payload: EquipmentUpdate = {
          name: this.entry.name,
          type: this.entry.type,
          inventoryNumber: this.entry.inventoryNumber,
          warrantyExpiry,
          locationId: this.entry.locationId,
          notes: this.entry.notes || undefined,
          status: this.entry.status,
        };
        response = await api.updateEquipmentRaw({ equipmentId: this.entryId, equipmentUpdate: payload });
      }

      if (response.raw.status < 299) {
        this.editorClosed.emit('store');
      } else {
        this.errorMessage = `Cannot save equipment: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot save equipment: ${err.message || 'unknown'}`;
    }
  }

  private async deleteEntry() {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new EquipmentApi(configuration);
      const response = await api.decommissionEquipmentRaw({ equipmentId: this.entryId });
      if (response.raw.status < 299) {
        this.editorClosed.emit('delete');
      } else {
        this.errorMessage = `Cannot decommission equipment: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot decommission equipment: ${err.message || 'unknown'}`;
    }
  }

  private locationLabel(loc: Location): string {
    return `${loc.building} – ${loc.department}, ${loc.floor}, ${loc.room}`;
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
            label="Inventory number" required
            disabled={this.entryId !== '@new'}
            value={this.entry.inventoryNumber}
            oninput={(ev: InputEvent) => this.handleInput('inventoryNumber', (ev.target as HTMLInputElement).value)}>
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

          <md-filled-select
            label="Location" required
            value={this.entry.locationId}
            oninput={(ev: InputEvent) => this.handleInput('locationId', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">location_on</md-icon>
            {this.locations.map(loc => (
              <md-select-option value={loc.id} selected={loc.id === this.entry.locationId}>
                <div slot="headline">{this.locationLabel(loc)}</div>
              </md-select-option>
            ))}
          </md-filled-select>
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
