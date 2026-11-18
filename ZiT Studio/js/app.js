const catalogGrid = document.getElementById('productGrid');
const catalogForm = document.getElementById('catalog-filters');
const brandList = document.getElementById('brand-list');
const fixedBrand = catalogGrid?.dataset.brand;

function catalogUrl(brand) {
    const url = new URL('catalog.html', shopRoot);
    url.searchParams.set('brand', brand);
    return url;
}

function renderBrandList(products) {
    brandList.replaceChildren();
    for (const brand of ZitFilters.brands(products)) {
        const link = document.createElement('a');
        link.href = catalogUrl(brand).href;
        link.textContent = ZitCatalog.brandLabel(brand);
        const item = document.createElement('li');
        item.append(link);
        brandList.append(item);
    }
    if (!brandList.children.length) {
        const empty = document.createElement('li');
        empty.textContent = 'В каталоге пока нет товаров.';
        brandList.append(empty);
    }
}

function renderProducts(products) {
    if (catalogForm) {
        const brand = catalogForm.elements.brand.value;
        document.getElementById('catalog-title').textContent = brand ? ZitCatalog.brandLabel(brand) : 'Каталог';
    }

    const filtered = ZitFilters.matching(products, catalogForm, fixedBrand);
    catalogGrid.replaceChildren();
    for (const product of filtered) {
        const card = document.createElement('div');
        card.className = 'product';
        const photos = fixedBrand ? [product.img, product.img2] : [product.img];
        for (const src of new Set(photos.filter(Boolean))) {
            const image = document.createElement('img');
            image.src = new URL(src, shopRoot).href;
            image.alt = product.name;
            card.append(image);
        }
        const name = document.createElement('p');
        name.textContent = product.name;
        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = '$' + product.price;
        card.append(name, price);
        const more = document.createElement('a');
        more.className = 'btn';
        more.href = new URL('product.html?id=' + product.id, shopRoot).href;
        more.textContent = 'Подробнее';
        card.append(more);
        if (!ZitCatalog.sizes(product).length) {
            const add = document.createElement('button');
            add.type = 'button';
            add.className = 'btn';
            add.textContent = 'В корзину';
            add.addEventListener('click', () => addToCart(product.id));
            card.append(add);
        }
        catalogGrid.append(card);
    }
    if (!filtered.length) catalogGrid.textContent = 'По этим фильтрам товаров нет.';
}

function refreshCatalog(brand) {
    const products = ZitCatalog.all();
    if (catalogForm) ZitFilters.syncOptions(catalogForm, products, brand);
    if (catalogGrid) renderProducts(products);
    if (brandList) renderBrandList(products);
}

function updateCatalogBrand() {
    if (location.protocol === 'file:') return;
    const url = new URL(location.href);
    const brand = catalogForm.elements.brand.value;
    if (brand) url.searchParams.set('brand', brand);
    else url.searchParams.delete('brand');
    history.replaceState(history.state, '', url);
}

if (catalogForm) {
    catalogForm.addEventListener('submit', event => event.preventDefault());
    catalogForm.addEventListener('input', event => {
        if (event.target.name === 'brand') updateCatalogBrand();
        renderProducts(ZitCatalog.all());
    });
    catalogForm.querySelector('[data-reset-filters]').addEventListener('click', () => {
        catalogForm.reset();
        updateCatalogBrand();
        renderProducts(ZitCatalog.all());
    });
}

if (fixedBrand) document.querySelector('[data-brand-catalog]').href = catalogUrl(fixedBrand).href;
window.addEventListener('pageshow', () => refreshCatalog());
window.addEventListener('storage', event => {
    if (event.key === 'zit_products' || event.key === null) refreshCatalog();
});
refreshCatalog(new URLSearchParams(location.search).get('brand') ?? '');
