const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const shop = path.join(__dirname, '../ZiT Studio');
const context = vm.createContext({ localStorage: { getItem: () => null } });
for (const file of ['catalog.js', 'catalog-filters.js']) {
    vm.runInContext(readFileSync(path.join(shop, 'js', file), 'utf8'), context);
}
const { catalog, filters } = vm.runInContext('({catalog: ZitCatalog, filters: ZitFilters})', context);

test('combines brand, category, search and price from the current catalog', () => {
    const products = catalog.all();
    const form = {
        elements: {
            brand: { value: 'Maison Margiela' },
            category: { value: 'accessories' },
            query: { value: '  FOUR stitches ' },
            minPrice: { valueAsNumber: 335 },
            maxPrice: { valueAsNumber: 335 }
        }
    };
    assert.deepEqual(Array.from(filters.matching(products, form), product => product.id), [21]);
    form.elements.maxPrice.valueAsNumber = 0;
    assert.equal(filters.matching(products, form).length, 0);
    assert.deepEqual(Array.from(filters.matching(products, undefined, 'Balenciaga'), item => item.id), [1, 2, 3, 4]);
    const current = [{ brand: 'New & Studio' }, { brand: 'New & Studio' }];
    assert.deepEqual(Array.from(filters.brands(current)), ['New & Studio']);
});

test('product photos and home images use the exact on-disk filename', () => {
    const paths = new Set(catalog.all().flatMap(product => [product.img, product.img2]).filter(Boolean));
    const home = readFileSync(path.join(shop, 'index.html'), 'utf8');
    for (const [, src] of home.matchAll(/<img\s+src="(img\/[^"]+)"/g)) paths.add(src);

    for (const relative of paths) {
        const directory = path.dirname(relative);
        const name = path.basename(relative);
        assert.ok(readdirSync(path.join(shop, directory)).includes(name), 'Missing exact filename: ' + relative);
    }
});
