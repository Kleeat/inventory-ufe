import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/textfield/filled-text-field';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/divider/divider';
import '@material/web/icon/icon';

@Component({
  tag: 'xds-inventory-location-editor',
  styleUrl: 'xds-inventory-location-editor.css',
  shadow: true,
})
export class XdsInventoryLocationEditor {
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
      this.entry = { id: '@new', department: '', building: '', floor: '', room: '', description: '' };
      return;
    }
    try {
      const allLocations = [
        { id: 'loc-001', building: 'Pavilón A', floor: '2. poschodie',  department: 'Kardiológia',                          room: 'Miestnosť 204', description: 'Kardiologická ambulancia so zobrazovacou technikou.' },
        { id: 'loc-002', building: 'Pavilón C', floor: 'Prízemie',       department: 'Urgentná medicína',                    room: 'Trauma bay 1',  description: null },
        { id: 'loc-003', building: 'Pavilón B', floor: '3. poschodie',  department: 'Jednotka intenzívnej starostlivosti',  room: 'Miestnosť 312', description: 'Jednotka pre kriticky chorých pacientov vyžadujúcich nepretržitý monitoring.' },
        { id: 'loc-004', building: 'Pavilón D', floor: '1. poschodie',  department: 'Chirurgia',                            room: 'Sklad 110',     description: null },
        { id: 'loc-005', building: 'Pavilón A', floor: '4. poschodie',  department: 'Neurológia',                           room: 'Miestnosť 401', description: null },
        { id: 'loc-006', building: 'Pavilón E', floor: 'Suterén',        department: 'Rádiológia',                           room: 'RTG kabína 2',  description: 'Kabína pre RTG vyšetrenia.' },
      ];
      const found = allLocations.find(l => l.id === this.entryId);
      if (found) {
        this.entry = { ...found };
        this.isValid = true;
      } else {
        this.errorMessage = `Location with id "${this.entryId}" not found`;
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
