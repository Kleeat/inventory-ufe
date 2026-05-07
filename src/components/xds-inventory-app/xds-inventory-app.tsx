import { Component, Host, h, Prop, State } from '@stencil/core';

declare global {
  interface Window { navigation: any; }
}

@Component({
  tag: 'xds-inventory-app',
  styleUrl: 'xds-inventory-app.css',
  shadow: true,
})
export class XdsInventoryApp {
  @State() private relativePath = '';
  @Prop() basePath: string = '';
  @Prop() apiBase: string | undefined;

  componentWillLoad() {
    const baseUri = new URL(this.basePath, document.baseURI || '/').pathname;
    console.log('Base URI:', baseUri);
    console.log("Document base URI:", document.baseURI);

    const toRelative = (path: string) => {
      if (path.startsWith(baseUri)) {
        this.relativePath = path.slice(baseUri.length);
      } else {
        this.relativePath = '';
      }
    };

    window.navigation?.addEventListener('navigate', (ev: Event) => {
      if ((ev as any).canIntercept) { (ev as any).intercept(); }
      toRelative(new URL((ev as any).destination.url).pathname);
    });

    toRelative(location.pathname);
  }

  render() {
    const navigate = (path: string) => {
      const absolute = new URL(path, new URL(this.basePath, document.baseURI)).pathname;
      window.navigation.navigate(absolute);
    };

    if (this.relativePath.startsWith('equipment/edit/')) {
      const entryId = this.relativePath.split('/')[2] || '@new';
      return (
        <Host>
          <xds-inventory-equipment-editor
            entry-id={entryId}
            oneditor-closed={() => navigate('./equipment')}
          ></xds-inventory-equipment-editor>
        </Host>
      );
    }

    if (this.relativePath.startsWith('locations/edit/')) {
      const entryId = this.relativePath.split('/')[2] || '@new';
      return (
        <Host>
          <xds-inventory-location-editor
            entry-id={entryId}
            oneditor-closed={() => navigate('./locations')}
          ></xds-inventory-location-editor>
        </Host>
      );
    }

    if (this.relativePath.startsWith('services/edit/')) {
      const entryId = this.relativePath.split('/')[2] || '@new';
      return (
        <Host>
          <xds-inventory-service-editor
            entry-id={entryId}
            oneditor-closed={() => navigate('./services')}
          ></xds-inventory-service-editor>
        </Host>
      );
    }

    const activeTab = this.relativePath.startsWith('locations') ? 'locations'
      : this.relativePath.startsWith('services') ? 'services'
      : 'equipment';

    return (
      <Host>
        <header class="app-header">
          <h1 class="app-title">Ambulance Inventory</h1>
        </header>
        <md-tabs
          class="app-tabs"
          onchange={(ev: CustomEvent) => {
            const idx = (ev.target as any).activeTabIndex;
            navigate(idx === 1 ? './locations' : idx === 2 ? './services' : './equipment');
          }}
        >
          <md-primary-tab active={activeTab === 'equipment'}>
            <md-icon slot="icon">medical_services</md-icon>
            Equipment
          </md-primary-tab>
          <md-primary-tab active={activeTab === 'locations'}>
            <md-icon slot="icon">location_on</md-icon>
            Locations
          </md-primary-tab>
          <md-primary-tab active={activeTab === 'services'}>
            <md-icon slot="icon">build</md-icon>
            Services
          </md-primary-tab>
        </md-tabs>
        <div class="tab-content">
          {activeTab === 'equipment' && (
            <xds-inventory-equipment-list
              api-base={this.apiBase}
              onentry-clicked={(ev: CustomEvent<string>) => navigate('./equipment/edit/' + ev.detail)}
            ></xds-inventory-equipment-list>
          )}
          {activeTab === 'locations' && (
            <xds-inventory-location-list
              onentry-clicked={(ev: CustomEvent<string>) => navigate('./locations/edit/' + ev.detail)}
              onequipment-clicked={(ev: CustomEvent<string>) => navigate('./equipment/edit/' + ev.detail)}
            ></xds-inventory-location-list>
          )}
          {activeTab === 'services' && (
            <xds-inventory-service-list
              onentry-clicked={(ev: CustomEvent<string>) => navigate('./services/edit/' + ev.detail)}
            ></xds-inventory-service-list>
          )}
        </div>
      </Host>
    );
  }
}
