import { newSpecPage } from '@stencil/core/testing';
import { XdsInventoryEquipmentList } from '../xds-inventory-equipment-list';

describe('xds-inventory-equipment-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [XdsInventoryEquipmentList],
      html: `<xds-inventory-equipment-list></xds-inventory-equipment-list>`,
    });
    expect(page.root).toEqualHtml(`
      <xds-inventory-equipment-list>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </xds-inventory-equipment-list>
    `);
  });
});
