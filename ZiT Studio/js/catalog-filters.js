const ZitFilters = (() => {
    const categoryLabels = {
        outwear: 'Верхняя одежда', hoodie: 'Худи и свитшоты', 't-shirt': 'Футболки и лонгсливы',
        pants: 'Брюки и джинсы', shoes: 'Обувь', accessories: 'Аксессуары', parfum: 'Парфюм'
    };

    function categoryLabel(category) {
        return Object.hasOwn(categoryLabels, category) ? categoryLabels[category] : category;
    }

    function brands(products) {
        return [...new Set(products.map(product => product.brand).filter(Boolean))]
            .sort((a, b) => ZitCatalog.brandLabel(a).localeCompare(ZitCatalog.brandLabel(b), 'ru'));
    }

    function setOptions(select, values, label, selected) {
        select.replaceChildren(new Option('Все', ''), ...values.map(value => new Option(label(value), value)));
        select.value = values.includes(selected) ? selected : '';
    }

    function syncOptions(form, products, brand = form.elements.brand.value) {
        const categories = [...new Set(products.map(product => product.category).filter(Boolean))]
            .sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b), 'ru'));
        const { category } = form.elements;
        setOptions(form.elements.brand, brands(products), ZitCatalog.brandLabel, brand);
        setOptions(category, categories, categoryLabel, category.value);
    }

    function matching(products, form) {
        const fields = form.elements;
        const brand = fields.brand.value;
        const category = fields.category.value;
        const query = fields.query.value.trim().toLowerCase();
        const minPrice = fields.minPrice.valueAsNumber;
        const maxPrice = fields.maxPrice.valueAsNumber;
        return products.filter(product =>
            (!brand || product.brand === brand)
            && (!category || product.category === category)
            && (!query || product.name.toLowerCase().includes(query))
            && (!Number.isFinite(minPrice) || product.price >= minPrice)
            && (!Number.isFinite(maxPrice) || product.price <= maxPrice)
        );
    }

    return { brands, syncOptions, matching };
})();
