import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'xds-inventory-location-list',
  styleUrl: 'xds-inventory-location-list.css',
  shadow: true,
})
export class XdsInventoryLocationList {
  render() {
    return (
      <Host>
        <div class="list-header">
          <h2>Locations</h2>
        </div>
        <slot></slot>
      </Host>
    );
  }
}
