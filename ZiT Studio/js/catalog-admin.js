(() => {
    const dialog = document.getElementById('admin-panel');
    const openButton = document.getElementById('admin-open');
    const closeButton = document.getElementById('admin-close');
    const search = document.getElementById('admin-search');
    const list = document.getElementById('admin-products-list');
    const form = document.getElementById('admin-product-form');
    const fields = form.elements;
    const saveButton = document.getElementById('admin-save');
    const deleteButton = document.getElementById('admin-delete');
    const confirmation = document.getElementById('admin-delete-confirm');
    const confirmButton = document.getElementById('admin-confirm-delete');
    const cancelButton = document.getElementById('admin-cancel-delete');
    const status = document.getElementById('admin-status');
    let selected = null;
    let busy = false;

    function renderList() {
        const products = ZitCatalog.all();
        const query = search.value.trim().toLowerCase();
        const matching = products.filter(product =>
            (product.name + ' ' + ZitCatalog.brandLabel(product.brand)).toLowerCase().includes(query)
        );
        list.replaceChildren();
        for (const product of matching) {
            const item = document.createElement('li');
            const choose = document.createElement('button');
            choose.type = 'button';
            choose.textContent = product.name;
            choose.setAttribute('aria-pressed', String(selected?.id === product.id));
            const detail = document.createElement('small');
            detail.textContent = ZitCatalog.brandLabel(product.brand) + ' · $' + product.price.toFixed(2);
            choose.append(detail);
            choose.addEventListener('click', () => {
                if (busy) return;
                selectProduct(product);
                fields.name.focus();
            });
            item.append(choose);
            list.append(item);
        }
        if (!matching.length) {
            const empty = document.createElement('li');
            empty.textContent = query ? 'Товары не найдены.' : 'В каталоге пока нет товаров.';
            list.append(empty);
        }

        const brands = document.getElementById('admin-brands');
        brands.replaceChildren(...ZitFilters.brands(products).map(brand => new Option(ZitCatalog.brandLabel(brand))));
    }

    function selectProduct(product) {
        selected = product;
        form.reset();
        confirmation.hidden = true;
        status.textContent = '';
        deleteButton.hidden = !product;
        document.getElementById('admin-form-heading').textContent = product ? 'Редактировать товар' : 'Добавить товар';
        saveButton.textContent = product ? 'Сохранить изменения' : 'Добавить товар';
        if (product) {
            if (!Array.from(fields.category.options).some(option => option.value === product.category)) {
                fields.category.add(new Option(product.category, product.category));
            }
            for (const name of ['name', 'category', 'price', 'img', 'img2', 'description']) {
                fields[name].value = product[name] ?? '';
            }
            fields.brand.value = ZitCatalog.brandLabel(product.brand);
        }
        renderList();
    }

    function imagePath(input) {
        const path = input.value.trim();
        if (path === '' && !input.required) return '';
        const url = new URL(path, shopRoot);
        if (!path || (!['http:', 'https:'].includes(url.protocol)
                && !(shopRoot.protocol === 'file:' && url.protocol === 'file:'))) {
            throw Error('Укажите путь к фото в проекте или ссылку HTTP(S).');
        }
        return path;
    }

    function setBusy(value) {
        busy = value;
        for (const button of [saveButton, deleteButton, confirmButton, closeButton, cancelButton]) button.disabled = value;
    }

    openButton.addEventListener('click', () => {
        search.value = '';
        selectProduct(null);
        dialog.showModal();
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => {
        if (busy) event.preventDefault();
    });
    search.addEventListener('input', renderList);
    document.getElementById('admin-new').addEventListener('click', () => {
        if (busy) return;
        search.value = '';
        selectProduct(null);
        fields.name.focus();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            const name = fields.name.value.trim();
            const brand = fields.brand.value.trim();
            if (!name || !brand) throw Error('Заполните название товара и бренд.');
            const changes = {
                name, brand,
                category: fields.category.value,
                price: fields.price.valueAsNumber,
                img: imagePath(fields.img),
                img2: imagePath(fields.img2),
                description: fields.description.value.trim()
            };
            const original = selected;
            const saved = original ? await ZitCatalog.update(original, changes) : await ZitCatalog.add(changes);
            search.value = '';
            selectProduct(saved);
            status.textContent = original ? 'Изменения сохранены.' : 'Товар добавлен.';
        } catch (error) {
            status.textContent = error instanceof DOMException ? 'Не удалось сохранить товар. Проверьте доступ к хранилищу браузера.' : error.message;
        } finally {
            setBusy(false);
        }
    });

    deleteButton.addEventListener('click', () => {
        document.getElementById('admin-confirm-message').textContent = 'Удалить «' + selected.name + '» из каталога?';
        confirmation.hidden = false;
        cancelButton.focus();
    });
    cancelButton.addEventListener('click', () => {
        confirmation.hidden = true;
        deleteButton.focus();
    });
    confirmButton.addEventListener('click', async () => {
        if (busy) return;
        setBusy(true);
        try {
            await ZitCatalog.remove(selected);
            search.value = '';
            selectProduct(null);
            status.textContent = 'Товар удалён.';
        } catch (error) {
            status.textContent = error instanceof DOMException ? 'Не удалось удалить товар. Проверьте доступ к хранилищу браузера.' : error.message;
        } finally {
            setBusy(false);
        }
    });

    window.addEventListener('storage', event => {
        if (dialog.open && (event.key === ZitCatalog.key || event.key === null)) renderList();
    });
})();
