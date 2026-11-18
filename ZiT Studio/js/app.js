function renderProducts() {
    const grid = document.getElementById('productGrid');
    const brand = grid.dataset.brand || document.getElementById('brandFilter')?.value;
    const category = document.getElementById('categoryFilter')?.value;
    const query = document.getElementById('textSearch')?.value.toLowerCase() || '';
    const products = ZitCatalog.all().filter(product =>
        (!brand || product.brand === brand) && (!category || product.category === category)
        && product.name.toLowerCase().includes(query)
    );
    grid.replaceChildren();
    for (const product of products) {
        const card = document.createElement('div');
        card.className = 'product';
        const photos = grid.dataset.brand ? [product.img, product.img2] : [product.img];
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
        grid.append(card);
    }
    if (!products.length) grid.textContent = 'По этим фильтрам товаров нет.';
}

document.getElementById('brandFilter')?.addEventListener('change', renderProducts);
document.getElementById('categoryFilter')?.addEventListener('change', renderProducts);
document.getElementById('textSearch')?.addEventListener('input', renderProducts);
window.addEventListener('pageshow', renderProducts);
window.addEventListener('storage', event => {
    if (event.key === 'zit_products' || event.key === null) renderProducts();
});
renderProducts();
