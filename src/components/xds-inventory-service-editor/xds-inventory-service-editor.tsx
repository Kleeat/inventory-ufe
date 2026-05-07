import { Component, Host, h, Prop, State, Event, EventEmitter } from '@stencil/core';
import '@material/web/textfield/filled-text-field';
import '@material/web/select/filled-select';
import '@material/web/select/select-option';
import '@material/web/button/filled-button';
import '@material/web/button/outlined-button';
import '@material/web/button/filled-tonal-button';
import '@material/web/divider/divider';
import '@material/web/icon/icon';
import {
  ServiceRequestsApi, EquipmentApi,
  ServiceRequest, ServiceRequestCreate, ServiceRequestUpdate,
  ServiceRequestStatus, Priority, Equipment, Configuration,
} from '../../api/inventory';

const SERVICE_STATUSES: ServiceRequestStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED'];
const SERVICE_PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const STATUS_LABEL: Record<ServiceRequestStatus, string> = {
  'NEW': 'New',
  'ASSIGNED': 'Assigned',
  'IN_PROGRESS': 'In Progress',
  'CLOSED': 'Closed',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  'LOW': 'Low',
  'MEDIUM': 'Medium',
  'HIGH': 'High',
  'CRITICAL': 'Critical',
};

interface ServiceFormData {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: ServiceRequestStatus;
  equipmentId: string;
}

@Component({
  tag: 'xds-inventory-service-editor',
  styleUrl: 'xds-inventory-service-editor.css',
  shadow: true,
})
export class XdsInventoryServiceEditor {
  @Prop() entryId: string;
  @Prop() apiBase: string;

  @Event({ eventName: 'editor-closed' }) editorClosed!: EventEmitter<string>;

  @State() entry!: ServiceFormData;
  @State() equipment: Equipment[] = [];
  @State() errorMessage: string;
  @State() isValid: boolean;

  private formElement!: HTMLFormElement;

  async componentWillLoad() {
    await Promise.all([this.getEntryAsync(), this.getEquipment()]);
  }

  private async getEntryAsync() {
    if (this.entryId === '@new') {
      this.isValid = false;
      this.entry = {
        id: '@new',
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'NEW',
        equipmentId: '',
      };
      return;
    }
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new ServiceRequestsApi(configuration);
      const response = await api.getServiceRequestRaw({ requestId: this.entryId });
      if (response.raw.status < 299) {
        const sr: ServiceRequest = await response.value();
        this.entry = {
          id: sr.id,
          title: sr.title,
          description: sr.description,
          priority: sr.priority,
          status: sr.status,
          equipmentId: sr.equipmentId,
        };
        this.isValid = true;
      } else {
        this.errorMessage = `Cannot load service request: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot load service request: ${err.message || 'unknown'}`;
    }
  }

  private async getEquipment() {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new EquipmentApi(configuration);
      const response = await api.listEquipmentRaw({ pageSize: 1000 });
      if (response.raw.status < 299) {
        const page = await response.value();
        this.equipment = page.content || [];
      }
    } catch (err: any) {
      // non-critical — dropdown falls back to empty
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
      const api = new ServiceRequestsApi(configuration);

      let response: any;
      if (this.entryId === '@new') {
        const payload: ServiceRequestCreate = {
          title: this.entry.title,
          description: this.entry.description,
          priority: this.entry.priority,
          equipmentId: this.entry.equipmentId,
        };
        response = await api.createServiceRequestRaw({ serviceRequestCreate: payload });
      } else {
        const payload: ServiceRequestUpdate = {
          title: this.entry.title,
          description: this.entry.description,
          priority: this.entry.priority,
          status: this.entry.status,
        };
        response = await api.updateServiceRequestRaw({ requestId: this.entryId, serviceRequestUpdate: payload });
      }

      if (response.raw.status < 299) {
        this.editorClosed.emit('store');
      } else {
        this.errorMessage = `Cannot save service request: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot save service request: ${err.message || 'unknown'}`;
    }
  }

  private async deleteEntry() {
    try {
      const configuration = new Configuration({ basePath: this.apiBase });
      const api = new ServiceRequestsApi(configuration);
      const response = await api.deleteServiceRequestRaw({ requestId: this.entryId });
      if (response.raw.status < 299) {
        this.editorClosed.emit('delete');
      } else {
        this.errorMessage = `Cannot delete service request: ${response.raw.statusText}`;
      }
    } catch (err: any) {
      this.errorMessage = `Cannot delete service request: ${err.message || 'unknown'}`;
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
          <h2>{this.entryId === '@new' ? 'New Service Request' : 'Edit Service Request'}</h2>
        </div>

        <form ref={el => this.formElement = el as HTMLFormElement}>
          <md-filled-text-field
            label="Title" required value={this.entry.title}
            oninput={(ev: InputEvent) => this.handleInput('title', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">title</md-icon>
          </md-filled-text-field>

          <md-filled-select
            label="Equipment" required
            disabled={this.entryId !== '@new'}
            value={this.entry.equipmentId}
            oninput={(ev: InputEvent) => this.handleInput('equipmentId', (ev.target as HTMLInputElement).value)}>
            <md-icon slot="leading-icon">medical_services</md-icon>
            {this.equipment.map(eq => (
              <md-select-option value={eq.id} selected={eq.id === this.entry.equipmentId}>
                <div slot="headline">{eq.name} — {eq.inventoryNumber}</div>
              </md-select-option>
            ))}
          </md-filled-select>

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
              disabled={this.entryId === '@new'}
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
