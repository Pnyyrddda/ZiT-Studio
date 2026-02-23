const products = [
  { id:1, name:"Men's Combat Strike Boot in Kaki | Balenciaga", brand:"balenciaga", category:"shoes", price:1250, img:"brands/strikeboots.jpg" },
  { id:2, name:"D-RING CARGO ZIP-UP HOODIE IN FADED BLACK", brand:"balenciaga", category:"hoodie", price:2790, img:"brands/balenciaga,hoodie.jpg" },
  { id:3, name:"Balenciaga Back Hoodie Medium Fit in Faded", brand:"balenciaga", category:"hoodie", price:1350, img:"brands/balenciaga.hoodie.jpg" },
  { id:4, name:"Cargo Pants in Black", brand:"balenciaga", category:"pants", price:2290, img:"brands/CargoPants.jpg" },
  { id:5, name:"ADIDAS TC TG Sweat JACKET HD", brand:"adidasxtc", category:"outwear", price:150, img:"brands/adidas tc jacket.jpg" },
  { id:6, name:"ADIDAS & TC LS T-Shirt", brand:"adidasxtc", category:"t-shirt", price:95, img:"brands/adidas tc t-shirt.jpg"},
  { id:7, name:"adidas TC TG Sweat Pant", brand:"adidasxtc", category:"pants", price:140, img:"brands/adidas tc pant.jpg"},
  { id:8, name:"adidas Superstar Boot Luxe TC", brand:"adidasxtc", category:"shoes", price:125, img:"brands/adidas superstar boot tc.jpg"},
  { id:9, name:"Rick OWens Jacket", brand:"rickowens", category:"outwear", price:3870, img:"brands/rickowensjacket.jpg"},
  { id:10, name:"DRKSHDWpants", brand:"rickowens", category:"pants", price:630, img:"brands/drkshdwpants.jpg"},
  { id:11, name:"DRKSHDW Sneakers", brand:"rickowens", category:"shoes", price:685, img:"brands/drkshdwboot.jpg"},
  { id:12, name:"Rick Owens Sneakers", brand:"rickowens", category:"shoes", price:750, img:"brands/rickowensboot.jpg"},
  { id:13, name:"Rick Owens Ring", brand:"rickowens", category:"accessory", price:260, img:"brands/rickrings.jpg"},
  { id:14, name:"Completo in raso", brand:"maison&margiela", category:"t-shirt", price:4700, img:"brands/completo in raso.jpg"},
  { id:15, name:"Sciarpa in cashmere", brand:"maison&margiela", category:"accessory", price:890, img:"brands/Sciarpa in cashmere.jpg"},
  { id:16, name:"Giacca con cintura", brand:"maison&margiela", category:"outwear", price:2750, img:"brands/Giacca con cintura.jpg"},
  { id:17, name:"T-shirt con logo graffiti", brand:"maison&margiela", category:"t-shirt", price:590, img:"brands/T-shirt con logo graffiti.jpg"},
  { id:18, name:"Jeans a gamba dritta", brand:"maison&margiela", category:"pants", price:1290, img:"brands/Jeans a gamba dritta.jpg"},
  { id:19, name:"Sneaker Replica", brand:"maison&margiela", category:"shoes", price:690, img:"brands/Sneaker Replica.jpg"},
  { id:20, name:"Sneakers Loved to Death", brand:"maison&margiela", category:"shoes", price:820, img:"brands/Sneakers Loved to Death.jpg"},
  { id:21, name:"Portacarte Four Stitches", brand:"maison&margiela", category:"accessory", price:335, img:"brands/Portacarte Four Stitches.jpg"},
  { id:22, name:"Eau de toilette Replica Whispers in the Library", brand:"maison&margiela", category:"parfum", price:145, img:"brands/Eau de toilette Replica Whispers in the Library.jpg"},
  { id:23, name:"Eau de toilette Replica Under the Stars", brand:"maison&margiela", category:"parfum", price:145, img:"brands/Eau de toilette Replica Under the Stars.jpg"},
  { id:24, name:"Eau de toilette Replica By the Fireplace", brand:"maison&margiela", category:"parfum", price:145, img:"brands/Eau de toilette Replica By the Fireplace.jpg"},
  { id:25, name:"Twill jacket", brand:"acnestudios", category:"outwear", price:1050, img:"brands/Twill jacket.jpg"},
  { id:26, name:"Leather bomber jacket", brand:"acnestudios", category:"outwear", price:3080, img:"brands/Leather bomber jacket.jpg"},
  { id:27, name:"Cashmere jacket", brand:"acnestudios", category:"outwear", price:1300, img:"brands/Cashmere jacket.jpg"},
  { id:28, name:"Sweater printed logo", brand:"acnestudios", category:"t-shirt", price:490, img:"brands/Sweater printed logo.jpg"}, 
  { id:29, name:"Crew neck sweater - Relaxed unisex fit", brand:"acnestudios", category:"t-shirt", price:380, img:"brands/Crew neck sweater - Relaxed unisex fit.jpg"},
  { id:30, name:"Printed t-shirt", brand:"acnestudios", category:"t-hirt", price:330, img:"brands/Printed t-shirt.jpg"}
];

function renderProducts(list){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  grid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='product';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <p>${p.name}</p>
      <div class="price">${p.price}$</div>
      <button class="btn" onclick="addToCart('${p.name}', ${p.price})">В корзину</button>
      <a href="product.html" class="btn" style="background:transparent;color:var(--accent);border:1px solid #eee;margin-top:8px">Подробнее</a>
    `;
    grid.appendChild(card);
  });
}

function applyFilters(){
  const b = document.getElementById('brandFilter')?.value || '';
  const c = document.getElementById('categoryFilter')?.value || '';
  const q = document.getElementById('textSearch')?.value?.toLowerCase() || '';
  const filtered = products.filter(p=>{
    return (b === '' || p.brand===b) &&
           (c === '' || p.category===c) &&
           (q === '' || p.name.toLowerCase().includes(q));
  });
  renderProducts(filtered);
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts(products);
  document.getElementById('brandFilter')?.addEventListener('change', applyFilters);
  document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);
  document.getElementById('textSearch')?.addEventListener('input', applyFilters);
});
