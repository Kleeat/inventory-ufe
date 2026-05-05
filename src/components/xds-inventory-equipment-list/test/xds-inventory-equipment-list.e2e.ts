import { newE2EPage } from '@stencil/core/testing';

describe('xds-inventory-equipment-list', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<xds-inventory-equipment-list></xds-inventory-equipment-list>');

    const element = await page.find('xds-inventory-equipment-list');
    expect(element).toHaveClass('hydrated');
  });
});
