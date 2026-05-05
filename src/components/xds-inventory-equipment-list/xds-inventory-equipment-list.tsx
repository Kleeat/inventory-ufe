import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'xds-inventory-equipment-list',
  styleUrl: 'xds-inventory-equipment-list.css',
  shadow: true,
})
export class XdsInventoryEquipmentList {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
