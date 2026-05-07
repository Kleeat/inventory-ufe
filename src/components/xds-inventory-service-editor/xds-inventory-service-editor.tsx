import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/textfield/filled-text-field';
import '@material/web/select/filled-select';
import '@material/web/select/select-option';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/divider/divider';
import '@material/web/icon/icon';

const SERVICE_STATUSES   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
const SERVICE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
type ServiceStatus   = typeof SERVICE_STATUSES[number];
type ServicePriority = typeof SERVICE_PRIORITIES[number];

const STATUS_LABEL: Record<ServiceStatus, string> = {
  'OPEN': 'Open',
  'IN_PROGRESS': 'In Progress',
  'RESOLVED': 'Resolved',
  'CLOSED': 'Closed',
};

const PRIORITY_LABEL: Record<ServicePriority, string> = {
  'LOW': 'Low',
  'MEDIUM': 'Medium',
  'HIGH': 'High',
  'CRITICAL': 'Critical',
};

@Component({
  tag: 'xds-inventory-service-editor',
  styleUrl: 'xds-inventory-service-editor.css',
  shadow: true,
})
export class XdsInventoryServiceEditor {
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
        equipmentId: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      };
      return;
    }
    try {
      const allRequests = [
        { id: '7c9e6679-7425-40de-944b-e07fc1f90ae7', equipmentId: 'eq-001', title: 'Porucha displeja – nereaguje na dotyk',    description: 'Displej prestáva reagovať po 30 minútach prevádzky. Potrebná výmena dotykového panela.', priority: 'HIGH',     status: 'IN_PROGRESS', createdAt: '2024-03-15T08:30:00Z' },
        { id: 'sr-002',                                equipmentId: 'eq-002', title: 'Batéria sa nenabíja',                      description: 'Defibrilátor Zoll X Series sa nedá nabiť. Indikátor nabíjania nesvieti pri pripojení na sieť.', priority: 'CRITICAL', status: 'OPEN',        createdAt: '2024-04-01T14:00:00Z' },
        { id: 'sr-003',                                equipmentId: 'eq-003', title: 'Pravidelná údržba ventilátora',             description: 'Plánovaná ročná údržba podľa servisného plánu výrobcu Dräger.', priority: 'MEDIUM',   status: 'RESOLVED',    createdAt: '2024-02-10T09:00:00Z' },
        { id: 'sr-004',                                equipmentId: 'eq-004', title: 'Chybové hlásenie E-04',                    description: 'Infúzna pumpa zobrazuje chybový kód E-04 pri spustení. Pumpa nie je schopná prevádzky.', priority: 'HIGH',     status: 'OPEN',        createdAt: '2024-04-10T11:30:00Z' },
        { id: 'sr-005',                                equipmentId: 'eq-005', title: 'Kalibrácia SpO2 senzora',                  description: 'Pacientský monitor vykazuje odchýlku ±3% pri meraní saturácie. Potrebná kalibrácia.', priority: 'LOW',      status: 'CLOSED',      createdAt: '2024-01-20T07:00:00Z' },
        { id: 'sr-006',                                equipmentId: 'eq-001', title: 'Aktualizácia softvéru ultrazvuku',         description: 'Dostupná aktualizácia firmvéru verzie 3.2.1 od výrobcu Philips. Obsahuje bezpečnostné záplaty.', priority: 'MEDIUM',   status: 'OPEN',        createdAt: '2024-04-22T13:15:00Z' },
      ];
      const found = allRequests.find(r => r.id === this.entryId);
      if (found) {
        this.entry = { ...found };
        this.isValid = true;
      } else {
        this.errorMessage = `Service request with id "${this.entryId}" not found`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot load service request: ${err.message || 'unknown'}`;
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
          <h2>{this.entryId === '@new' ? 'New Service Request' : 'Edit Service Request'}</h2>
        </div>

        <form ref={el => this.formElement = el as HTMLFormElement}>
          <md-filled-text-field
            label="Title" required value={this.entry.title}
            oninput={(ev: InputEvent) => this.handleInput('title', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">title</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Equipment ID" required value={this.entry.equipmentId}
            oninput={(ev: InputEvent) => this.handleInput('equipmentId', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">medical_services</md-icon>
          </md-filled-text-field>

          <md-filled-text-field
            label="Description" value={this.entry.description}
            oninput={(ev: InputEvent) => this.handleInput('description', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">notes</md-icon>
          </md-filled-text-field>

          <div class="field-row">
            <md-filled-select
              label="Priority"
              value={this.entry.priority}
              oninput={(ev: InputEvent) => this.handleInput('priority', (ev.target as HTMLInputElement).value)}>
              <md-icon slot="leading-icon">flag</md-icon>
              {SERVICE_PRIORITIES.map(p => (
                <md-select-option value={p} selected={this.entry.priority === p}>
                  <div slot="headline">{PRIORITY_LABEL[p]}</div>
                </md-select-option>
              ))}
            </md-filled-select>

            <md-filled-select
              label="Status"
              value={this.entry.status}
              oninput={(ev: InputEvent) => this.handleInput('status', (ev.target as HTMLInputElement).value)}>
              <md-icon slot="leading-icon">info</md-icon>
              {SERVICE_STATUSES.map(s => (
                <md-select-option value={s} selected={this.entry.status === s}>
                  <div slot="headline">{STATUS_LABEL[s]}</div>
                </md-select-option>
              ))}
            </md-filled-select>
          </div>

          <md-filled-text-field
            label="Created" disabled
            value={new Date(this.entry.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}>
            <md-icon slot="leading-icon">calendar_today</md-icon>
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
