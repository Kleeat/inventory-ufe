import { Component, Host, h, State } from '@stencil/core';

@Component({
  tag: 'xds-inventory-app',
  styleUrl: 'xds-inventory-app.css',
  shadow: true,
})
export class XdsInventoryApp {
  @State() activeTab: number = 0;

  render() {
    return (
      <Host>
        <header class="app-header">
          <h1 class="app-title">Ambulance Inventory</h1>
        </header>
        <md-tabs class="app-tabs" onChange={(e: Event) => (this.activeTab = (e.target as any).activeTabIndex)}>
          <md-primary-tab>
            <md-icon slot="icon">medical_services</md-icon>
            Equipment
          </md-primary-tab>
          <md-primary-tab>
            <md-icon slot="icon">location_on</md-icon>
            Locations
          </md-primary-tab>
          <md-primary-tab>
            <md-icon slot="icon">build</md-icon>
            Services
          </md-primary-tab>
        </md-tabs>
        <div class="tab-content">
          {this.activeTab === 0 && <xds-inventory-equipment-list></xds-inventory-equipment-list>}
          {this.activeTab === 1 && <xds-inventory-location-list></xds-inventory-location-list>}
          {this.activeTab === 2 && <xds-inventory-service-list></xds-inventory-service-list>}
        </div>
      </Host>
    );
  }
}
