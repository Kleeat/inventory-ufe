import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/textfield/filled-text-field';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/divider/divider';
import '@material/web/icon/icon';
import { LocationsApi, Location, LocationCreate, LocationUpdate, Configuration } from '../../api/inventory';

interface LocationFormData {
  id: string;
  building: string;
  floor: string;
  department: string;
  room: string;
  description: string;
}

@Component({
  tag: 'xds-inventory-location-editor',
  styleUrl: 'xds-inventory-location-editor.css',
  shadow: true,
})
export class XdsInventoryLocationEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string;

  @Event({ eventName: 'editor-closed' }) editorClosed!: EventEmitter<string>;

  @State() entry: LocationFormData;
  @State() errorMessage: string;
  @State() isValid: boolean;

  private formElement!: HTMLFormElement;

  async componentWillLoad() {
    await this.getEntryAsync();
  }

  private async getEntryAsync() {
    if (this.entryId === '@new') {
      this.isValid = false;
      this.entry = { id: '@new', department: '', building: '', floor: '', room: '', description: '' };
      return;
    }
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new LocationsApi(configuration);
      const response = await api.getLocationRaw({ locationId: this.entryId });
      if (response.raw.status < 299) {
        const location: Location = await response.value();
        this.entry = {
          id: location.id,
          building: location.building,
          floor: location.floor,
          department: location.department,
          room: location.room,
          description: location.description ?? '',
        };
        this.isValid = true;
      } else {
        this.errorMessage = `Cannot load location: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot load location: ${err.message || 'unknown'}`;
    }
  }

  private handleInput(field: string, value: string) {
    this.entry = { ...this.entry, [field]: value };
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
      const api = new LocationsApi(configuration);

      let response: any;
      if (this.entryId === '@new') {
        const payload: LocationCreate = {
          building: this.entry.building,
          floor: this.entry.floor,
          department: this.entry.department,
          room: this.entry.room,
          description: this.entry.description || undefined,
        };
        response = await api.createLocationRaw({ locationCreate: payload });
      } else {
        const payload: LocationUpdate = {
          building: this.entry.building,
          floor: this.entry.floor,
          department: this.entry.department,
          room: this.entry.room,
          description: this.entry.description || undefined,
        };
        response = await api.updateLocationRaw({ locationId: this.entryId, locationUpdate: payload });
      }

      if (response.raw.status < 299) {
        this.editorClosed.emit('store');
      } else {
        this.errorMessage = `Cannot save location: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot save location: ${err.message || 'unknown'}`;
    }
  }

  private async deleteEntry() {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new LocationsApi(configuration);
      const response = await api.deleteLocationRaw({ locationId: this.entryId });
      if (response.raw.status < 299) {
        this.editorClosed.emit('delete');
      } else {
        this.errorMessage = `Cannot delete location: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot delete location: ${err.message || 'unknown'}`;
    }
  }

  render() {
    if (this.errorMessage) {
      return <Host><div class="error">{this.errorMessage}</div></Host>;
    }
    if (!this.entry) return <Host></Host>;

    return (
      <Host>
        <div class="editor-header">
          <h2>{this.entryId === '@new' ? 'New Location' : 'Edit Location'}</h2>
        </div>

        <form ref={el => this.formElement = el as HTMLFormElement}>
          <md-filled-text-field
            label="Department" required value={this.entry.department}
            oninput={(ev: InputEvent) => this.handleInput('department', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">business</md-icon>
          </md-filled-text-field>

          <div class="field-row">
            <md-filled-text-field
              label="Building" required value={this.entry.building}
              oninput={(ev: InputEvent) => this.handleInput('building', (ev.target as HTMLInputElement).value)}>
            </md-filled-text-field>
            <md-filled-text-field
              label="Floor" required value={this.entry.floor}
              oninput={(ev: InputEvent) => this.handleInput('floor', (ev.target as HTMLInputElement).value)}>
            </md-filled-text-field>
          </div>

          <md-filled-text-field
            label="Room" required value={this.entry.room}
            oninput={(ev: InputEvent) => this.handleInput('room', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">room</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Description" value={this.entry.description ?? ''}
            oninput={(ev: InputEvent) => this.handleInput('description', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">notes</md-icon>
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
