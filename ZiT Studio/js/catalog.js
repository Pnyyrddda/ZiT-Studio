const ZitCatalog = (() => {
    const defaults = [
        // Balenciaga
        { id:1, name:"Men's Combat Strike Boot in Kaki | Balenciaga", brand:"Balenciaga", category:"shoes", price:1250, img:"brands/strikeboots.jpg" },
        { id:2, name:"D-RING CARGO ZIP-UP HOODIE IN FADED BLACK", brand:"Balenciaga", category:"hoodie", price:2790, img:"brands/balenciaga,hoodie.jpg" },
        { id:3, name:"Balenciaga Back Hoodie Medium Fit in Faded", brand:"Balenciaga", category:"hoodie", price:1350, img:"brands/balenciaga.hoodie.jpg" },
        { id:4, name:"Cargo Pants in Black", brand:"Balenciaga", category:"pants", price:2290, img:"brands/CargoPants.jpg" },

        // Adidas X TC (Thug Club)
        { id:5, name:"ADIDAS TC TG Sweat JACKET HD", brand:"Thug Club", category:"outwear", price:150, img:"brands/ADIDAS TC JACKET.jpg", img2:"brands/ADIDAS TC TG  JACKET HD.jpg" },
        { id:6, name:"ADIDAS & TC LS T-Shirt", brand:"Thug Club", category:"t-shirt", price:95, img:"brands/ADIDAS TC SHIRT.jpg"},
        { id:7, name:"adidas TC TG Sweat Pant", brand:"Thug Club", category:"pants", price:140, img:"brands/adidas tc pant.jpg", img2:"brands/adidas pant.jpg"},
        { id:8, name:"adidas Superstar Boot Luxe TC", brand:"Thug Club", category:"shoes", price:125, img:"brands/adidas Superstar Boot TC.jpg", img2:"brands/adidas Superstar TC.jpg"},

        // Rick Owens
        { id:9, name:"Rick OWens Jacket", brand:"Rick Owens", category:"outwear", price:3870, img:"brands/rickowensjacket.jpg", img2:"brands/rickowensjacket.jpg"},
        { id:10, name:"DRKSHDWpants", brand:"Rick Owens", category:"pants", price:630, img:"brands/drkshdwpants.jpg", img2:"brands/drkshdwpants.jpg"},
        { id:11, name:"DRKSHDW Sneakers", brand:"Rick Owens", category:"shoes", price:685, img:"brands/drkshdwboot.jpg", img2:"brands/drkshdwboot.jpg"},
        { id:12, name:"Rick Owens Sneakers", brand:"Rick Owens", category:"shoes", price:750, img:"brands/rickowensboot.jpg", img2:"brands/rickowensboot.jpg"},
        { id:13, name:"Rick Owens Ring", brand:"Rick Owens", category:"accessories", price:260, img:"brands/rickrings.jpg", img2:"brands/rickrings.jpg"},

        // Maison Margiela
        { id:14, name:"Completo in raso", brand:"Maison Margiela", category:"t-shirt", price:4700, img:"brands/completo in raso.jpg", img2:"brands/completo in raso.jpg"},
        { id:15, name:"Sciarpa in cashmere", brand:"Maison Margiela", category:"accessories", price:890, img:"brands/Sciarpa in cashmere.jpg", img2:"brands/Sciarpa in cashmere.jpg"},
        { id:16, name:"Giacca con cintura", brand:"Maison Margiela", category:"outwear", price:2750, img:"brands/Giacca con cintura.jpg", img2:"brands/Giacca con cintura.jpg"},
        { id:17, name:"T-shirt con logo graffiti", brand:"Maison Margiela", category:"t-shirt", price:590, img:"brands/T-shirt con logo graffiti.jpg", img2:"brands/T-shirt con logo graffiti.jpg"},
        { id:18, name:"Jeans a gamba dritta", brand:"Maison Margiela", category:"pants", price:1290, img:"brands/Jeans a gamba dritta.jpg", img2:"brands/Jeans a gamba dritta.jpg"},
        { id:19, name:"Sneaker Replica", brand:"Maison Margiela", category:"shoes", price:690, img:"brands/Sneaker Replica.jpg", img2:"brands/Sneaker Replica.jpg"},
        { id:20, name:"Sneakers Loved to Death", brand:"Maison Margiela", category:"shoes", price:820, img:"brands/Sneakers Loved to Death.jpg", img2:"brands/Sneakers Loved to Death.jpg"},
        { id:21, name:"Portacarte Four Stitches", brand:"Maison Margiela", category:"accessories", price:335, img:"brands/Portacarte Four Stitches.jpg", img2:"brands/Portacarte Four Stitches.jpg"},
        { id:22, name:"Eau de toilette Replica Whispers in the Library", brand:"Maison Margiela", category:"parfum", price:145, img:"brands/Eau de toilette Replica Whispers in the Library.jpg", img2:"brands/Eau de toilette Replica Whispers in the Library.jpg"},
        { id:23, name:"Eau de toilette Replica Under the Stars", brand:"Maison Margiela", category:"parfum", price:145, img:"brands/Eau de toilette Replica Under the Stars.jpg", img2:"brands/Eau de toilette Replica Under the Stars.jpg"},
        { id:24, name:"Eau de toilette Replica By the Fireplace", brand:"Maison Margiela", category:"parfum", price:145, img:"brands/Eau de toilette Replica By the Fireplace.jpg", img2:"brands/Eau de toilette Replica By the Fireplace.jpg"},

        // Acne Studios
        { id:25, name:"Twill jacket", brand:"Acne Studios", category:"outwear", price:1050, img:"brands/Twill jacket.jpg", img2:"brands/Twill jacket Navy.jpg"},
        { id:26, name:"Leather bomber jacket", brand:"Acne Studios", category:"outwear", price:3080, img:"brands/Leather bomber jacket.jpg", img2:"brands/Leather bomber.jpg"},
        { id:27, name:"Cashmere jacket", brand:"Acne Studios", category:"outwear", price:1300, img:"brands/Cashmere jacket.jpg", img2:"brands/Cashmere jacket..jpg"},
        { id:28, name:"Sweater printed logo", brand:"Acne Studios", category:"t-shirt", price:490, img:"brands/Sweater printed logo.jpg", img2:"brands/Sweater printed logo.jpg"},
        { id:29, name:"Crew neck sweater - Relaxed unisex fit", brand:"Acne Studios", category:"t-shirt", price:380, img:"brands/Crew neck sweater - Relaxed unisex fit.jpg", img2:"brands/Crew neck sweater - Relaxed unisex fit.jpg"},
        { id:30, name:"Printed t-shirt", brand:"Acne Studios", category:"t-shirt", price:330, img:"brands/Printed t-shirt.jpg", img2:"brands/Printed t-shirt.jpg"}
    ];

    const oldBrands = {
        balenciaga: 'Balenciaga', adidasxtc: 'Thug Club', rickowens: 'Rick Owens',
        'maison&margiela': 'Maison Margiela', acnestudios: 'Acne Studios'
    };
    const oldCategories = { accessory: 'accessories', 't-hirt': 't-shirt' };
    const oldImages = new Set([
        'brands/adidas tc jacket.jpg', 'brands/adidas tc t-shirt.jpg', 'brands/adidas superstar boot tc.jpg'
    ]);

    function normalize(product) {
        const original = defaults.find(item => item.id === product.id);
        return {
            ...original, ...product,
            brand: Object.hasOwn(oldBrands, product.brand) ? oldBrands[product.brand] : product.brand,
            category: Object.hasOwn(oldCategories, product.category) ? oldCategories[product.category] : product.category,
            img: original && oldImages.has(product.img) ? original.img : product.img
        };
    }

    function all() {
        const saved = localStorage.getItem('zit_products');
        return saved === null ? defaults.slice() : JSON.parse(saved).map(normalize);
    }

    function brandLabel(brand) {
        return brand === 'Thug Club' ? 'Adidas × TC' : brand;
    }

    function sizes(product) {
        if (Array.isArray(product.sizes)) return product.sizes.map(String);
        if (product.category === 'shoes') return ['39', '40', '41', '42', '43', '44', '45'];
        if (['outwear', 'hoodie', 't-shirt', 'pants'].includes(product.category)) return ['S', 'M', 'L', 'XL'];
        return [];
    }

    // Serialize read/modify/write operations from tabs on the same origin.
    function withLock(action) {
        return navigator.locks ? navigator.locks.request('zit-shop-write', action) : Promise.resolve().then(action);
    }

    function add(product) {
        return withLock(() => {
            const products = all();
            const id = Math.max(0, ...products.map(item => item.id)) + 1;
            products.unshift(normalize({ ...product, id }));
            localStorage.setItem('zit_products', JSON.stringify(products));
            window.dispatchEvent(new Event('zit-catalog-change'));
        });
    }

    return { all, brandLabel, sizes, add, withLock };
})();
