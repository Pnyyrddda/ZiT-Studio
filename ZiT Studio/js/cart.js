// The cart and order history share one atomic write when a demo order is placed.
const ZitCart = (() => {
    const key = 'zit_shopping_v2';

    function mergeLine(lines, line) {
        const existing = lines.find(item => item.productId === line.productId && item.size === line.size);
        if (!existing) {
            lines.push(line);
            return;
        }
        existing.quantity += line.quantity;
        if (!existing.snapshot && line.snapshot) existing.snapshot = line.snapshot;
    }

    function migrate() {
        const products = ZitCatalog.all();
        const lines = [];
        for (const source of ['zit_cart', 'cart']) {
            const entries = JSON.parse(localStorage.getItem(source) || '[]');
            for (const entry of entries) {
                if (entry == null) continue;
                const id = typeof entry === 'object' ? entry.productId ?? entry.id : entry;
                let product = products.find(item => item.id === Number(id));
                if (id == null && entry.name) {
                    const matches = products.filter(item => item.name === entry.name);
                    const priced = matches.filter(item => item.price === entry.price);
                    product = matches.length === 1 ? matches[0] : priced.length === 1 ? priced[0] : undefined;
                }
                const size = entry.size || null;
                const quantity = Number.isSafeInteger(entry.quantity) && entry.quantity > 0 ? entry.quantity : 1;
                const productId = product?.id ?? id ?? 'legacy:' + JSON.stringify([entry.name, entry.price]);
                const line = { productId, size, quantity };
                if (!product && entry.name && Number.isFinite(entry.price)) {
                    line.snapshot = { name: entry.name, price: entry.price, brand: entry.brand || '', img: entry.img || '' };
                }
                mergeLine(lines, line);
            }
        }
        return { lines, orders: JSON.parse(localStorage.getItem('zit_orderHistory') || '[]') };
    }

    function read() {
        const saved = localStorage.getItem(key);
        return saved === null ? migrate() : JSON.parse(saved);
    }

    // Existence of the new key marks completed migration, including an empty cart after checkout.
    function initialize() {
        return ZitCatalog.withLock(() => {
            if (localStorage.getItem(key) === null) {
                localStorage.setItem(key, JSON.stringify(migrate()));
            }
        });
    }

    function change(edit) {
        return ZitCatalog.withLock(() => {
            const state = read();
            const result = edit(state);
            localStorage.setItem(key, JSON.stringify(state));
            window.dispatchEvent(new Event('zit-cart-change'));
            return result;
        });
    }

    function add(productId, size = null) {
        return change(state => {
            const product = ZitCatalog.all().find(item => item.id === productId);
            if (!product) throw Error('Товар недоступен.');
            const sizes = ZitCatalog.sizes(product);
            if (sizes.length > 0 && !sizes.includes(size)) throw Error('Выберите доступный размер.');
            mergeLine(state.lines, { productId, size: sizes.length ? size : null, quantity: 1 });
        });
    }

    function remove(productId, size) {
        return change(state => {
            const index = state.lines.findIndex(line => line.productId === productId && line.size === size);
            if (index < 0) return;
            if (--state.lines[index].quantity === 0) state.lines.splice(index, 1);
        });
    }

    function details(lines = read().lines) {
        const products = ZitCatalog.all();
        return lines.map(({ productId, size, quantity, snapshot }) => {
            const catalogItem = products.find(item => item.id === productId);
            const product = catalogItem || snapshot;
            const unavailableSize = catalogItem && size !== null && !ZitCatalog.sizes(catalogItem).includes(size);
            return {
                productId, size, quantity, name: product?.name ?? ('Товар №' + productId),
                price: unavailableSize ? null : product?.price ?? null, img: product?.img || '', brand: product?.brand || ''
            };
        });
    }

    function total(items) {
        return items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
    }

    function checkout(expectedItems) {
        return change(state => {
            const items = details(state.lines);
            if (!items.length || JSON.stringify(items) !== JSON.stringify(expectedItems)) {
                throw Error('Корзина изменилась. Проверьте её перед оформлением.');
            }
            if (items.some(item => item.price === null)) throw Error('Удалите недоступные товары перед оформлением.');
            const order = {
                id: Math.max(Date.now(), (Number(state.orders[0]?.id) || 0) + 1),
                date: new Date().toLocaleString('ru-RU'), demo: true, total: total(items), items
            };
            state.orders.unshift(order);
            state.lines = [];
            return order;
        });
    }

    return { key, initialize, read, details, add, remove, checkout, total };
})();
