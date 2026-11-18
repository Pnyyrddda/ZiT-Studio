const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function openShop(records) {
    const storage = {
        getItem: key => records.get(key) ?? null,
        setItem: (key, value) => records.set(key, value)
    };
    const context = vm.createContext({ localStorage: storage, navigator: {}, Event, window: new EventTarget() });
    for (const name of ['catalog', 'cart']) {
        const filename = path.join(__dirname, '../ZiT Studio/js', name + '.js');
        vm.runInContext(readFileSync(filename, 'utf8'), context, { filename });
    }
    return { ...vm.runInContext('({cart: ZitCart, catalog: ZitCatalog})', context), storage };
}

test('imports both cart keys once, keeping quantities, names, old orders and distinct sizes', async () => {
    const records = new Map([
        ['zit_cart', JSON.stringify([6, { id: 6, size: 'M' }])],
        ['cart', JSON.stringify([{ name: 'ADIDAS & TC LS T-Shirt', price: 95 }, { name: 'Archived', price: 7 }])],
        ['zit_orderHistory', JSON.stringify([{ id: 10, items: [], total: 0 }])]
    ]);
    const { cart } = openShop(records);
    await cart.initialize();
    await cart.add(6, 'M');
    await cart.add(6, 'L');
    await cart.remove(6, 'M');
    const reloaded = openShop(records).cart;
    await reloaded.initialize();
    const items = reloaded.details();
    assert.deepEqual(Array.from(items, row => [row.name, row.size, row.quantity]), [
        ['ADIDAS & TC LS T-Shirt', null, 2], ['ADIDAS & TC LS T-Shirt', 'M', 1],
        ['Archived', null, 1], ['ADIDAS & TC LS T-Shirt', 'L', 1]
    ]);
    const order = await reloaded.checkout(items);
    assert.equal(order.total, 387);
    await reloaded.initialize();
    assert.equal(reloaded.details().length, 0);
    assert.equal(reloaded.read().orders[1].id, 10);
    await assert.rejects(reloaded.checkout(items));
    assert.equal(reloaded.read().orders.length, 2);
});

test('failed persistence and stale checkout leave the saved cart and history intact', async () => {
    const records = new Map();
    const { cart, storage } = openShop(records);
    await cart.add(1, '42');
    const stale = cart.details();
    await cart.add(6, 'M');
    const before = records.get(cart.key);
    await assert.rejects(cart.checkout(stale));
    storage.setItem = () => { throw Error('Storage full'); };
    await assert.rejects(cart.checkout(cart.details()), /Storage full/);
    assert.equal(records.get(cart.key), before);
});

test('legacy product records keep custom items and use shared brand, category and image values', async () => {
    const saved = [
        { id: 5, brand: 'adidasxtc', name: 'Saved jacket', price: 151, category: 'outwear', img: 'brands/adidas tc jacket.jpg' },
        { id: 31, brand: 'Local', name: 'Custom tee', price: 20, category: 't-shirt', img: 'custom.jpg' }
    ];
    const records = new Map([['zit_products', JSON.stringify(saved)]]);
    const { catalog } = openShop(records);
    const [jacket, tee] = catalog.all();
    assert.equal(jacket.brand, 'Thug Club');
    assert.equal(jacket.img, 'brands/ADIDAS TC JACKET.jpg');
    assert.equal(jacket.price, 151);
    assert.equal(tee.name, 'Custom tee');
    await catalog.add({ brand: 'Local', name: 'Another tee', price: 25, category: 't-shirt', img: 'tee.jpg' });
    assert.deepEqual(Array.from(openShop(records).catalog.all(), item => item.id), [32, 5, 31]);
});

test('new cart lines use the product sizes and keep unsized products in a single line', async () => {
    const { cart, catalog } = openShop(new Map());
    await assert.rejects(cart.add(6), /размер/);
    await assert.rejects(cart.add(6, '42'), /размер/);
    await assert.rejects(cart.add(1, 'XL'), /размер/);
    assert.equal(cart.details().length, 0);

    await cart.add(6, 'M');
    await cart.add(6, 'L');
    await cart.add(1, '42');
    await cart.add(22);
    await cart.add(22, 'M');
    assert.deepEqual(Array.from(cart.details(), row => [row.productId, row.size, row.quantity]), [
        [6, 'M', 1], [6, 'L', 1], [1, '42', 1], [22, null, 2]
    ]);

    await catalog.add({ category: 'shoes', name: 'Custom', price: 100, sizes: [37, 38] });
    await assert.rejects(cart.add(31, '42'), /размер/);
    await cart.add(31, '38');
    assert.equal(cart.details().at(-1).size, '38');
});

test('catalog edits retain product IDs and surface active changes without rewriting past orders', async () => {
    const records = new Map();
    const { cart, catalog } = openShop(records);
    await cart.add(6, 'M');
    const order = await cart.checkout(cart.details());
    await cart.add(6, 'M');
    const viewedCart = cart.details();
    const original = catalog.all().find(item => item.id === 6);
    const updated = await catalog.update(original, { name: 'Edited tee', price: 105 });
    assert.equal(updated.id, original.id);
    assert.equal(cart.details()[0].name, 'Edited tee');
    assert.equal(cart.details()[0].price, 105);
    assert.equal(cart.read().orders[0].total, order.total);
    assert.equal(cart.read().orders[0].items[0].name, original.name);
    await assert.rejects(cart.checkout(viewedCart), /изменилась/);
    await assert.rejects(catalog.update(original, { price: 99 }), /изменился/);
    await assert.rejects(catalog.remove(original), /изменился/);

    const shoes = await catalog.update(updated, { category: 'shoes' });
    assert.equal(cart.details()[0].price, null);
    await assert.rejects(cart.checkout(cart.details()), /недоступные/);
    await catalog.remove(shoes);
    assert.equal(cart.details()[0].price, null);
    await cart.remove(6, 'M');
    assert.equal(cart.details().length, 0);
    assert.equal(cart.read().orders[0].items[0].name, original.name);
});

test('deleted product IDs are never reused and failed catalog writes leave the record intact', async () => {
    const records = new Map();
    const { catalog, storage } = openShop(records);
    const original = await catalog.add({ name: 'Local accessory', category: 'accessories', price: 40 });
    await catalog.remove(original);
    const continued = openShop(records).catalog;
    const next = await continued.add({ name: 'New accessory', category: 'accessories', price: 50 });
    assert.ok(next.id > original.id);
    assert.ok(!continued.all().some(item => item.id === original.id));

    const stored = records.get(catalog.key);
    storage.setItem = () => { throw Error('Storage full'); };
    await assert.rejects(catalog.remove(next), /Storage full/);
    assert.equal(records.get(catalog.key), stored);
    assert.equal(catalog.all().find(item => item.id === next.id).name, 'New accessory');
});
