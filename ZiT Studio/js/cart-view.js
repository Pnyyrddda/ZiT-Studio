// Loaded after the page markup on every shopping page.
const shopRoot = new URL('../', document.currentScript.src);
let displayedCart = [];
let checkoutPending = false;

function shopText(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
    ));
}

function showCartError(message) {
    const status = document.getElementById('checkout-status');
    if (status && status.getClientRects().length) status.textContent = message;
    else alert(message);
}

async function addToCart(productId, size = null) {
    try {
        await ZitCart.add(productId, size);
        alert('Товар добавлен в корзину!');
    } catch {
        showCartError('Не удалось добавить товар. Проверьте доступ к хранилищу браузера.');
    }
}

function renderCart() {
    displayedCart = ZitCart.details();
    const count = displayedCart.reduce((sum, line) => sum + line.quantity, 0);
    const badge = document.getElementById('cart-count');
    badge.textContent = count;
    badge.hidden = count === 0;

    const list = document.getElementById('cart-items');
    list.replaceChildren();
    if (!count) list.textContent = 'Ваша корзина пуста.';
    for (const line of displayedCart) {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-4 p-3 border-b';
        if (line.img) {
            const image = document.createElement('img');
            image.src = new URL(line.img, shopRoot).href;
            image.alt = '';
            image.width = image.height = 64;
            image.className = 'w-16 h-16 object-cover';
            row.append(image);
        }
        const description = document.createElement('span');
        const size = line.size ? ' · ' + line.size : '';
        const price = line.price === null ? 'Недоступен' : '$' + line.price.toFixed(2);
        description.textContent = line.name + size + ' — ' + price + ' × ' + line.quantity;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Убрать 1';
        button.className = 'ml-auto text-sm underline';
        button.addEventListener('click', () => {
            ZitCart.remove(line.productId, line.size).catch(() => showCartError('Не удалось изменить корзину.'));
        });
        row.append(description, button);
        list.append(row);
    }
    const available = displayedCart.every(item => item.price !== null);
    document.getElementById('cart-total').textContent = available
        ? '$' + ZitCart.total(displayedCart).toFixed(2) : 'Удалите недоступные товары';
    const checkout = document.getElementById('checkout-btn');
    if (checkout) checkout.disabled = checkoutPending || !count || !available;
    document.getElementById('checkout-panel').hidden = !count;
}

document.getElementById('checkout-btn')?.addEventListener('click', async event => {
    if (checkoutPending) return;
    checkoutPending = true;
    event.currentTarget.disabled = true;
    const status = document.getElementById('checkout-status');
    try {
        const order = await ZitCart.checkout(displayedCart);
        status.textContent = `Демозаказ №${order.id} на сумму $${order.total.toFixed(2)} оформлен и сохранён в истории заказов.`;
        document.getElementById('checkout-history').hidden = false;
    } catch (error) {
        status.textContent = error.message.startsWith('Корзина изменилась') ? error.message : 'Не удалось оформить демозаказ. Проверьте корзину и попробуйте снова.';
    } finally {
        checkoutPending = false;
        renderCart();
    }
});

ZitCart.initialize().catch(() => showCartError('Не удалось сохранить общую корзину. Проверьте доступ к хранилищу браузера.'));
window.addEventListener('zit-cart-change', renderCart);
window.addEventListener('zit-catalog-change', renderCart);
window.addEventListener('pageshow', renderCart);
window.addEventListener('storage', event => {
    if ([ZitCart.key, 'zit_products', null].includes(event.key)) renderCart();
});
renderCart();
