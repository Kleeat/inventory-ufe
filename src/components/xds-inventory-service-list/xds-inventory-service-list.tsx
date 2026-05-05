import { Component, Host, h, State } from '@stencil/core';

type ServiceStatus = 'New' | 'Assigned' | 'In Progress' | 'Closed';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  inventoryNumber: string;
  equipmentName: string;
  status: ServiceStatus;
  createdAt: string;
}

const SERVICE_STATUSES: ServiceStatus[] = ['New', 'Assigned', 'In Progress', 'Closed'];

const STATUS_CLASS: Record<ServiceStatus, string> = {
  'New': 'new',
  'Assigned': 'assigned',
  'In Progress': 'in-progress',
  'Closed': 'closed',
};

const STATUS_ICONS: Record<ServiceStatus, string> = {
  'New': 'fiber_new',
  'Assigned': 'person_add',
  'In Progress': 'autorenew',
  'Closed': 'check_circle',
};

@Component({
  tag: 'xds-inventory-service-list',
  styleUrl: 'xds-inventory-service-list.css',
  shadow: true,
})
export class XdsInventoryServiceList {
  @State() statusFilters: ServiceStatus[] = [];

  private getServiceRequests(): ServiceRequest[] {
    return [
      {
        id: 'SRQ-001',
        title: 'Battery not holding charge',
        description: 'The defibrillator AED battery drains within 20 minutes of use. Needs inspection and likely replacement.',
        inventoryNumber: 'INV-002',
        equipmentName: 'Defibrillator AED',
        status: 'In Progress',
        createdAt: '2026-04-10',
      },
      {
        id: 'SRQ-002',
        title: 'Suction unit motor failure',
        description: 'Motor produces a grinding noise and suction pressure is significantly reduced during operation.',
        inventoryNumber: 'INV-003',
        equipmentName: 'Suction Unit',
        status: 'Assigned',
        createdAt: '2026-04-18',
      },
      {
        id: 'SRQ-003',
        title: 'Cervical collar size S missing',
        description: 'Size small cervical collars are missing from the set. Replacement stock needs to be ordered.',
        inventoryNumber: 'INV-006',
        equipmentName: 'Cervical Collar Set',
        status: 'New',
        createdAt: '2026-04-28',
      },
      {
        id: 'SRQ-004',
        title: 'Laryngoscope blade cracked',
        description: 'Number 3 blade has a visible crack along the flange. Unit is out of service pending replacement.',
        inventoryNumber: 'INV-010',
        equipmentName: 'Laryngoscope Set',
        status: 'Assigned',
        createdAt: '2026-04-22',
      },
      {
        id: 'SRQ-005',
        title: 'SpO2 sensor intermittent reading',
        description: 'Pulse oximeter displays erratic SpO2 values on the index finger probe. Verified against secondary device.',
        inventoryNumber: 'INV-008',
        equipmentName: 'Pulse Oximeter',
        status: 'New',
        createdAt: '2026-05-01',
      },
      {
        id: 'SRQ-006',
        title: 'IV pump firmware update',
        description: 'Scheduled firmware update to v3.4.1 to address the drug library sync issue reported in bulletin #44.',
        inventoryNumber: 'INV-007',
        equipmentName: 'IV Infusion Pump',
        status: 'Closed',
        createdAt: '2026-03-15',
      },
      {
        id: 'SRQ-007',
        title: 'Stretcher wheel locking mechanism',
        description: 'Front-left wheel lock does not engage reliably. Temporary fix applied; full repair scheduled.',
        inventoryNumber: 'INV-009',
        equipmentName: 'Stretcher',
        status: 'Closed',
        createdAt: '2026-03-28',
      },
    ];
  }

  private getFilteredItems(): ServiceRequest[] {
    const items = this.getServiceRequests();
    if (this.statusFilters.length === 0) return items;
    return items.filter(r => this.statusFilters.includes(r.status));
  }

  private toggleStatusFilter(status: ServiceStatus) {
    this.statusFilters = this.statusFilters.includes(status)
      ? this.statusFilters.filter(s => s !== status)
      : [...this.statusFilters, status];
  }

  private formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  render() {
    const all = this.getServiceRequests();
    const items = this.getFilteredItems();
    const isFiltered = this.statusFilters.length > 0;

    return (
      <Host>
        <div class="list-header">
          <h2>Service Requests</h2>
          <span class="item-count">
            {isFiltered ? `${items.length} of ${all.length}` : items.length} requests
          </span>
        </div>

        <div class="controls">
          <div class="filter-group">
            <span class="control-label">Status</span>
            <md-chip-set>
              {SERVICE_STATUSES.map(status => (
                <span class={`status-chip-wrap status-chip-wrap--${STATUS_CLASS[status]}`}>
                  <md-filter-chip
                    key={status}
                    selected={this.statusFilters.includes(status)}
                    onClick={() => this.toggleStatusFilter(status)}
                  >
                    {status}
                  </md-filter-chip>
                </span>
              ))}
            </md-chip-set>
          </div>
        </div>

        <div class="service-list">
          {items.map(req => (
            <div class={`service-item service-item--${STATUS_CLASS[req.status]}`} key={req.id}>
              <div class={`status-indicator status-indicator--${STATUS_CLASS[req.status]}`}>
                <md-icon>{STATUS_ICONS[req.status]}</md-icon>
              </div>
              <div class="item-content">
                <div class="item-primary">
                  <span class="item-title">{req.title}</span>
                  <span class={`item-status item-status--${STATUS_CLASS[req.status]}`}>{req.status}</span>
                </div>
                <p class="item-description">{req.description}</p>
                <div class="item-meta">
                  <span class="meta-equipment">
                    <md-icon>medical_services</md-icon>
                    {req.equipmentName}
                    <span class="meta-inv">{req.inventoryNumber}</span>
                  </span>
                  <span class="meta-date">
                    <md-icon>calendar_today</md-icon>
                    {this.formatDate(req.createdAt)}
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
