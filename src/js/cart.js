import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  
  // Clear previous contents
  productList.innerHTML = "";

  if (!cartItems.length) {
    productList.innerHTML = "<li class='empty-cart'>There are no items in your cart.</li>";
    document.getElementById("cartTotal").textContent = "0.00";
    return;
  }

  // Generate HTML for each cart item
  cartItems.forEach(item => {
    productList.appendChild(createCartItemElement(item));
  });

  // Update the cart total
  renderCartTotal();
}

function createCartItemElement(item) {
  const li = document.createElement("li");
  li.className = "cart-card divider";

  // Ensure we have default values if properties are missing
  const image = item.Images?.[0]?.image || "/images/placeholder.jpg";
  const name = item.Name || "Unknown Product";
  const color = item.Colors?.[0]?.ColorName || "Default Color";
  const quantity = item.quantity || 1;
  const price = item.FinalPrice || 0;

  li.innerHTML = `
    <a href="/product_pages/${item.Id}" class="cart-card__image">
      <img src="${image}" alt="${name}">
    </a>
    <a href="/product_pages/${item.Id}">
      <h2 class="card__name">${name}</h2>
    </a>
    <p class="cart-card__color">${color}</p>
    <p class="cart-card__quantity">qty: ${quantity}</p>
    <p class="cart-card__price">$${price.toFixed(2)}</p>
    <button class="remove-item" data-id="${item.Id}">Remove</button>
  `;

  return li;
}

function renderCartTotal() {
  const cartItems = getLocalStorage("so-cart") || [];
  const total = cartItems.reduce((sum, item) => {
    return sum + (item.FinalPrice || 0) * (item.quantity || 1);
  }, 0);
  
  document.getElementById("cartTotal").textContent = total.toFixed(2);
}

function removeItemFromCart(id) {
  let cartItems = getLocalStorage("so-cart") || [];
  cartItems = cartItems.filter(item => item.Id !== id);
  localStorage.setItem("so-cart", JSON.stringify(cartItems));
  renderCartContents();
}

// Event delegation for remove buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-item")) {
    const id = e.target.dataset.id;
    removeItemFromCart(id);
  }
});

// Initialize the cart when the page loads
document.addEventListener("DOMContentLoaded", renderCartContents);