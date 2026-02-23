let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart(){ localStorage.setItem('cart', JSON.stringify(cart)); updateCount(); }
function addToCart(name, price){
  cart.push({name, price}); saveCart();
  alert(`${name} добавлен(а) в корзину`);
}
function removeFromCart(i){ cart.splice(i,1); saveCart(); loadCart(); }
function updateCount(){
  const el = document.getElementById('cart-count');
  if(el) el.innerText = cart.length;
}
function loadCart(){
  const list = document.getElementById('cart-list');
  const total = document.getElementById('cart-total');
  if(!list) return;
  list.innerHTML='';
  let sum=0;
  cart.forEach((it,i)=>{
    const li = document.createElement('li');
    li.innerHTML = `${it.name} — ${it.price}$ <button onclick="removeFromCart(${i})">Удалить</button>`;
    list.appendChild(li);
    sum += it.price;
  });
  total.innerText = 'Итого: ' + sum + '$';
}
document.addEventListener('DOMContentLoaded', ()=>{ updateCount(); loadCart(); });
