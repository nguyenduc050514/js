import { Cart } from "./models.js";

export function renderProducts(products, productsListEl) {
   if (!productsListEl) return;

   productsListEl.innerHTML = products
      .map(
         (p) => `
    <a href="./pages/detail.html?id=${p.id}" class="products-item" data-id="${
            p.id
         }">
      <figure class="products-image">
        <img src="${p.image}" alt="${p.name}" class="products-img" />
        <div class="products-wish">
          <img
            src="./assets/icons/${p.liked ? "heart-red" : "heart"}.svg"
            class="products-wish-svg"
            alt="wishlist"
          />
        </div>
      </figure>
      <div class="products-info">
        <h2 class="products-title">${p.name}</h2>
        <p class="products-brand">${p.brand}</p>
        <div class="products-cart">
          <span class="products-price">$${p.price}</span>
          <span class="products-rating">
            <img src="./assets/icons/star.svg" alt="rating" />
            ${p.rating}
          </span>
        </div>
      </div>
    </a>`
      )
      .join("");
}

export function renderCart(
   cart,
   cartListEl,
   popUpHeadingEl,
   totalPriceTextEl,
   totalPriceHeaderEl
) {
   if (!cartListEl) return;

   if (cart.items.length === 0) {
      cartListEl.innerHTML = `<li class="pop-item empty">Your cart is empty</li>`;
      if (popUpHeadingEl) popUpHeadingEl.textContent = "You have 0 items";
      updateTotalPrices(cart, totalPriceTextEl, totalPriceHeaderEl);
      return;
   }

   cartListEl.innerHTML = cart.items
      .map(
         (item) => `
    <li class="pop-item">
      <img src="${item.product.image}" alt="${
            item.product.name
         }" class="pop-item-img" />
      <p class="pop-item-price">$${item.totalPrice.toFixed(2)} (${
            item.quantity
         }x)</p>
    </li>
  `
      )
      .join("");

   if (popUpHeadingEl)
      popUpHeadingEl.textContent = `You have ${cart.totalQuantity} item${
         cart.totalQuantity !== 1 ? "s" : ""
      }`;

   updateTotalPrices(cart, totalPriceTextEl, totalPriceHeaderEl);
}

export function updateTotalPrices(cart, totalPriceTextEl, totalPriceHeaderEl) {
   if (totalPriceTextEl)
      totalPriceTextEl.textContent = `$${cart.finalTotal.toFixed(2)}`;
   if (totalPriceHeaderEl)
      totalPriceHeaderEl.textContent = `$${cart.finalTotal.toFixed(2)}`;
}

export function showErrorMessage(message) {
   const errorDiv = document.createElement("div");
   errorDiv.className = "error-message";
   errorDiv.textContent = message;
   errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 1000;
  `;
   document.body.appendChild(errorDiv);
   setTimeout(() => errorDiv.remove(), 5000);
}
