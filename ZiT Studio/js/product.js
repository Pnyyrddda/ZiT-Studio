const productIdParam = new URLSearchParams(location.search).get('id');
const product = /^[1-9]\d*$/.test(productIdParam ?? '')
    ? ZitCatalog.all().find(item => item.id === Number(productIdParam))
    : undefined;

function showProductPhotos(product) {
    const photos = [...new Set([product.img, product.img2].filter(Boolean))];
    const mainImage = document.getElementById('product-image');
    const unavailable = document.getElementById('photo-unavailable');
    const thumbnails = document.getElementById('product-photos');

    function selectPhoto(index) {
        mainImage.hidden = false;
        unavailable.hidden = true;
        mainImage.src = photos[index];
        mainImage.alt = product.name + ' — фото ' + (index + 1);
        for (const [position, button] of Array.from(thumbnails.children).entries()) {
            button.setAttribute('aria-pressed', String(position === index));
        }
    }

    mainImage.addEventListener('error', () => {
        mainImage.hidden = true;
        unavailable.hidden = false;
    });
    if (photos.length > 1) {
        for (const [index, src] of photos.entries()) {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', 'Фото ' + (index + 1));
            const image = document.createElement('img');
            image.src = src;
            image.alt = '';
            button.append(image);
            button.addEventListener('click', () => selectPhoto(index));
            thumbnails.append(button);
        }
        thumbnails.hidden = false;
    }

    if (photos.length) selectPhoto(0);
    else unavailable.hidden = false;
}

function showProduct(product) {
    const sizes = ZitCatalog.sizes(product);
    const form = document.getElementById('product-form');
    const options = document.getElementById('size-options');
    const status = document.getElementById('product-status');
    const submit = form.querySelector('button[type="submit"]');

    document.title = product.name + ' — ZiT Studio';
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-brand').textContent = ZitCatalog.brandLabel(product.brand);
    document.getElementById('product-price').textContent = '$' + product.price.toFixed(2);
    if (product.description) {
        const description = document.getElementById('product-description');
        description.textContent = product.description;
        description.hidden = false;
    }

    showProductPhotos(product);
    if (sizes.length) {
        document.getElementById('product-sizes').hidden = false;
        document.getElementById('size-legend').textContent = Array.isArray(product.sizes) ? 'Размер' : 'Размер для демозаказа';
        for (const size of sizes) {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'size';
            radio.value = size;
            radio.required = true;
            const text = document.createElement('span');
            text.textContent = size;
            label.append(radio, text);
            options.append(label);
        }
        options.addEventListener('change', () => { status.textContent = ''; });
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (submit.disabled) return;
        const size = new FormData(form).get('size');
        submit.disabled = true;
        try {
            await ZitCart.add(product.id, size);
            status.textContent = size ? 'Товар добавлен в корзину. Размер ' + size + '.' : 'Товар добавлен в корзину.';
        } catch {
            status.textContent = 'Не удалось добавить товар. Обновите страницу и попробуйте ещё раз.';
        } finally {
            submit.disabled = false;
        }
    });
    document.getElementById('product-details').hidden = false;
}

if (product) {
    showProduct(product);
} else {
    document.getElementById('product-missing-title').textContent = productIdParam === null ? 'Выберите товар в каталоге' : 'Товар не найден';
    document.getElementById('product-missing').hidden = false;
}
