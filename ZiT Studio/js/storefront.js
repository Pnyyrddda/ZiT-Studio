const views = new Map(Array.from(document.querySelectorAll('[data-view]'), view => [view.dataset.view, view]));
const shopFilters = document.getElementById('shop-filters');
const cartStatus = document.getElementById('checkout-status');
const checkoutHistory = document.getElementById('checkout-history');
const catalogBackLink = document.querySelector('#product-view .back-link');
const wishlistKey = 'zit_wishlist';
const filterNames = ['brand', 'category', 'query', 'minPrice', 'maxPrice'];
let activeView;
let catalogHref = '#catalog';

function sectionHref(view, params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== ''));
    return '#' + view + (query.size ? '?' + query : '');
}

function readRoute() {
    const [view, query] = location.hash.slice(1).split('?');
    return { view: views.has(view) ? view : 'home', params: new URLSearchParams(query) };
}

function readWishlist() {
    return JSON.parse(localStorage.getItem(wishlistKey) || '[]');
}

function renderGrid(products, wishlist, gridId) {
    const listing = document.getElementById(gridId);
    if (!products.length) {
        listing.innerHTML = '<p class="text-gray-500 col-span-full py-10">' + (
            gridId === 'wishlist-items' ? 'Ваш список избранного пуст.' : 'Товары по заданным фильтрам не найдены.'
        ) + '</p>';
        return;
    }
    listing.innerHTML = products.map(product => {
        const isWished = wishlist.includes(product.id);
        const href = sectionHref('product', { id: product.id });
        const secondImage = product.img2 && product.img2 !== product.img;
        const action = ZitCatalog.sizes(product).length
            ? `<a href="${href}" class="text-xs font-semibold underline">Выбрать размер</a>`
            : `<button type="button" data-add-product="${product.id}" class="text-xs font-semibold underline">В корзину</button>`;
        return `
            <article class="group relative min-w-0" id="${gridId}-${product.id}">
                <div class="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <a href="${href}" class="block w-full h-full">
                        <img src="${shopText(product.img)}" alt="${shopText(product.name)}"
                             class="w-full h-full object-cover transition-opacity duration-500 ${secondImage ? 'group-hover:opacity-0' : ''}">
                        ${secondImage ? `<img src="${shopText(product.img2)}" alt=""
                             class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500">` : ''}
                    </a>
                    <button type="button" data-wishlist="${product.id}" aria-pressed="${isWished}"
                            aria-label="Избранное: ${shopText(product.name)}"
                            class="absolute top-2 right-2 rounded-full bg-white w-9 h-9 text-lg ${isWished ? 'text-red-600' : 'text-gray-700'}">
                        <span aria-hidden="true">${isWished ? '♥' : '♡'}</span>
                    </button>
                </div>
                <div class="mt-3 space-y-1">
                    <h3 class="text-xs font-bold uppercase">${shopText(ZitCatalog.brandLabel(product.brand))}</h3>
                    <p class="text-sm break-words">${shopText(product.name)}</p>
                    <p class="text-sm font-medium">$${product.price.toFixed(2)}</p>
                    <div class="flex flex-wrap gap-3">
                        <a href="${href}" class="text-xs font-semibold underline">Подробнее</a>
                        ${action}
                    </div>
                </div>
            </article>`;
    }).join('');
}

function restoreFilters(products, params) {
    ZitFilters.syncOptions(shopFilters, products, params.get('brand') || '');
    for (const name of filterNames.slice(1)) {
        const field = shopFilters.elements[name];
        field.value = params.get(name) || '';
        if (field.type === 'select-one' && field.selectedIndex < 0) field.value = '';
    }
}

function renderCatalog(products, wishlist) {
    const brand = shopFilters.elements.brand.value;
    const title = brand ? ZitCatalog.brandLabel(brand) : 'Каталог';
    document.getElementById('shop-title').textContent = title;
    renderGrid(ZitFilters.matching(products, shopFilters), wishlist, 'product-grid');
    return title;
}

function renderBrands(products) {
    const list = document.getElementById('brand-list');
    list.replaceChildren();
    for (const brand of ZitFilters.brands(products)) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = sectionHref('catalog', { brand });
        link.textContent = ZitCatalog.brandLabel(brand);
        link.className = 'block border border-gray-200 p-4 font-semibold hover:border-black hover:underline';
        item.append(link);
        list.append(item);
    }
    if (!list.children.length) {
        const empty = document.createElement('li');
        empty.textContent = 'В каталоге пока нет товаров.';
        list.append(empty);
    }
    return 'Бренды';
}

function renderOrderHistory() {
    const historyList = document.getElementById('order-history-list');
    const orders = ZitCart.read().orders;
    if (!orders.length) {
        historyList.innerHTML = '<p class="text-gray-500">У вас пока нет завершённых заказов.</p>';
        return;
    }
    historyList.innerHTML = orders.map(order => {
        const grouped = new Map();
        for (const item of order.items) {
            const key = JSON.stringify([item.productId, item.name, item.brand, item.price, item.size]);
            const quantity = (grouped.get(key)?.quantity ?? 0) + (item.quantity ?? 1);
            grouped.set(key, { ...item, quantity });
        }
        const items = Array.from(grouped.values(), item => `
            <div class="flex items-center gap-4 border-b border-gray-100 py-2">
                ${item.img ? `<img src="${shopText(item.img)}" alt="" class="w-10 h-10 object-cover rounded">` : ''}
                <div class="text-sm">
                    <p class="font-medium">${shopText(item.name)} <span class="text-gray-500">(${shopText(item.brand)})</span></p>
                    <p class="text-xs text-gray-700">$${item.price.toFixed(2)} x ${item.quantity}${item.size ? ' · ' + shopText(item.size) : ''}</p>
                </div>
            </div>`).join('');
        return `
            <article class="border border-gray-200 rounded-lg p-5">
                <div class="flex flex-wrap justify-between gap-2 mb-4 pb-2 border-b border-gray-200">
                    <h3 class="text-lg font-bold">${order.demo ? 'Демозаказ' : 'Заказ'} #${shopText(order.id)}</h3>
                    <p class="text-sm text-gray-500">${shopText(order.date)}</p>
                </div>
                <div class="mb-4">${items}</div>
                <div class="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                    <span>Итого</span><span>$${order.total.toFixed(2)}</span>
                </div>
            </article>`;
    }).join('');
}

function updateWishlistCount(products, wishlist) {
    const badge = document.getElementById('wishlist-count');
    const count = products.filter(product => wishlist.includes(product.id)).length;
    badge.textContent = count;
    badge.hidden = count === 0;
}

function focusView(view) {
    const heading = [...view.querySelectorAll('h1, h2')].find(element => !element.closest('[hidden]'));
    if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
    }
}

function renderRoute(navigating = false) {
    const route = readRoute();
    const products = ZitCatalog.all();
    const wishlist = readWishlist();
    for (const [name, element] of views) element.hidden = name !== route.view;
    for (const link of document.querySelectorAll('[data-nav]')) {
        if (link.dataset.nav === route.view) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    }

    let title = 'Магазин люксовых брендов';
    switch (route.view) {
        case 'catalog':
            restoreFilters(products, route.params);
            title = renderCatalog(products, wishlist);
            catalogHref = location.hash;
            break;
        case 'brands':
            title = renderBrands(products);
            break;
        case 'product':
            catalogBackLink.href = catalogHref;
            title = renderProduct(products, route.params.get('id'));
            break;
        case 'cart':
            if (activeView !== 'cart') {
                cartStatus.textContent = '';
                checkoutHistory.hidden = true;
            }
            renderCart();
            title = 'Корзина';
            break;
        case 'wishlist':
            renderGrid(products.filter(product => wishlist.includes(product.id)), wishlist, 'wishlist-items');
            title = 'Избранное';
            break;
        case 'orders':
            renderOrderHistory();
            title = 'История заказов';
            break;
    }
    activeView = route.view;
    document.title = title + ' — ZiT Studio';
    updateWishlistCount(products, wishlist);
    if (navigating) {
        window.scrollTo(0, 0);
        focusView(views.get(route.view));
    }
}

shopFilters.addEventListener('submit', event => event.preventDefault());
shopFilters.addEventListener('input', () => {
    const params = Object.fromEntries(new FormData(shopFilters));
    catalogHref = sectionHref('catalog', params);
    history.replaceState(history.state, '', catalogHref);
    document.title = renderCatalog(ZitCatalog.all(), readWishlist()) + ' — ZiT Studio';
});
shopFilters.addEventListener('reset', event => {
    event.preventDefault();
    history.replaceState(history.state, '', '#catalog');
    renderRoute();
});

for (const grid of document.querySelectorAll('#product-grid, #wishlist-items')) {
    grid.addEventListener('click', async event => {
        const button = event.target.closest('button[data-add-product], button[data-wishlist]');
        if (!button) return;
        if (button.hasAttribute('data-add-product')) {
            await addToCart(Number(button.dataset.addProduct));
            return;
        }
        const id = Number(button.dataset.wishlist);
        try {
            await ZitCatalog.withLock(() => {
                const items = readWishlist();
                const updated = items.includes(id) ? items.filter(saved => saved !== id) : [...items, id];
                localStorage.setItem(wishlistKey, JSON.stringify(updated));
            });
            renderRoute();
            const replacement = grid.querySelector(`button[data-wishlist="${id}"]`);
            if (replacement) replacement.focus();
            else focusView(views.get(activeView));
        } catch {
            alert('Не удалось изменить избранное.');
        }
    });
}

window.addEventListener('hashchange', () => renderRoute(true));
window.addEventListener('zit-catalog-change', () => renderRoute());
window.addEventListener('zit-cart-change', () => {
    if (activeView === 'orders') renderOrderHistory();
});
window.addEventListener('storage', event => {
    if ([null, ZitCatalog.key, wishlistKey].includes(event.key)) renderRoute();
    else if (event.key === ZitCart.key && activeView === 'orders') renderOrderHistory();
});
window.addEventListener('pageshow', event => {
    if (event.persisted) renderRoute();
});
renderRoute();
