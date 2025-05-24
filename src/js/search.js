document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const productList = document.getElementById('product-list');

  const products = JSON.parse(localStorage.getItem('products')) || [];

  if (searchInput && productList) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      productList.innerHTML = '';

      const filtered = products.filter(product =>
        product.Name.toLowerCase().includes(query)
      );

      filtered.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
          <h3>${product.Name}</h3>
          <img src="${product.Images.PrimarySmall}" alt="${product.Name}">
          <p>$${product.FinalPrice}</p>
        `;
        productList.appendChild(card);
      });
    });
  }
});
