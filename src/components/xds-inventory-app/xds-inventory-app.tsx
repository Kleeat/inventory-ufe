import { Component, Host, h, Prop, State } from '@stencil/core';

const TAB_PATHS = ['equipment', 'locations', 'services'] as const;
type TabPath = typeof TAB_PATHS[number];

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

  private baseUri = '/';

  componentWillLoad() {
    const base = this.basePath || '/';
    let uri = new URL(base, document.baseURI).pathname;
    if (!uri.endsWith('/')) uri += '/';
    this.baseUri = uri;

    const toRelative = (path: string) => {
      this.relativePath = path.startsWith(this.baseUri) ? path.slice(this.baseUri.length) : '';
    };

    window.navigation?.addEventListener('navigate', (ev: Event) => {
      if ((ev as any).canIntercept) { (ev as any).intercept(); }
      toRelative(new URL((ev as any).destination.url).pathname);
    });

    toRelative(location.pathname);
  }

  render() {
    const navigate = (path: string) => {
      window.navigation.navigate(this.baseUri + path);
    };

    const parts = this.relativePath.split('/');
    const tab = parts[0] as TabPath;
    const isEditor = parts[1] === 'edit';
    const entryId = isEditor ? (parts[2] ?? '@new') : null;
    const tabIndex = Math.max(0, TAB_PATHS.indexOf(tab));

    if (isEditor) {
      return (
        <Host>
          {tab === 'equipment' && (
            <xds-inventory-equipment-editor
              entry-id={entryId}
              oneditor-closed={() => navigate('equipment')}
            ></xds-inventory-equipment-editor>
          )}
          {tab === 'locations' && (
            <xds-inventory-location-editor
              entry-id={entryId}
              oneditor-closed={() => navigate('locations')}
            ></xds-inventory-location-editor>
          )}
          {tab === 'services' && (
            <xds-inventory-service-editor
              entry-id={entryId}
              oneditor-closed={() => navigate('services')}
            ></xds-inventory-service-editor>
          )}
        </Host>
      );
    }

    return (
      <Host>
        <header class="app-header">
          <h1 class="app-title">Ambulance Inventory</h1>
        </header>
        <md-tabs
          class="app-tabs"
          activeTabIndex={tabIndex}
          onChange={(e: Event) => navigate(TAB_PATHS[(e.target as any).activeTabIndex])}
        >
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
          {tabIndex === 0 && (
            <xds-inventory-equipment-list
              onentry-clicked={(ev: CustomEvent<string>) => navigate('equipment/edit/' + ev.detail)}
            ></xds-inventory-equipment-list>
          )}
          {tabIndex === 1 && (
            <xds-inventory-location-list
              onentry-clicked={(ev: CustomEvent<string>) => navigate('locations/edit/' + ev.detail)}
              onequipment-clicked={(ev: CustomEvent<string>) => navigate('equipment/edit/' + ev.detail)}
            ></xds-inventory-location-list>
          )}
          {tabIndex === 2 && (
            <xds-inventory-service-list
              onentry-clicked={(ev: CustomEvent<string>) => navigate('services/edit/' + ev.detail)}
            ></xds-inventory-service-list>
          )}
        </div>
      </Host>
    );
  }
}
