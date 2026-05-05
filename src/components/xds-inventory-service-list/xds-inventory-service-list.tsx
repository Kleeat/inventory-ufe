import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'xds-inventory-service-list',
  styleUrl: 'xds-inventory-service-list.css',
  shadow: true,
})
export class XdsInventoryServiceList {
  render() {
    return (
      <Host>
        <div class="list-header">
          <h2>Services</h2>
        </div>
        <slot></slot>
      </Host>
    );
  }
}
