// Complete About page handler for login, cart, and wishlist
const $ = document.querySelector.bind(document);
const API_BASE_URL = "http://localhost:5000";

let cart = [];
let products = [];

// DOM Elements
const actionWishCount = $("#action-wish__count");
const totalPriceHeader = $(".total-price-header");
const cartBtn = $(".action-wish.pop-up-cart");
const cartPopup = $(".pop-up-cart-block");
const actionCartList = $(".pop-list");
const totalPriceText = $(".total-price-text");
const totalSubtotalPrice = $(".total-subtotal-price");

// === CART FUNCTIONS ===
async function fetchCart() {
   try {
      const response = await fetch(`${API_BASE_URL}/carts`);
      if (!response.ok)
         throw new Error(`Failed to fetch cart: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
   } catch (error) {
      console.error("Error fetching cart:", error);
      showErrorMessage("Không thể tải giỏ hàng từ server.");
      return JSON.parse(localStorage.getItem("cart")) || [];
   }
}

async function fetchProducts() {
   try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
         throw new Error(`Response status: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
         throw new Error("Products data is not an array");
      }
      return data;
   } catch (error) {
      console.error("Error fetching products:", error);
      showErrorMessage("Không thể tải sản phẩm từ server.");
      return [];
   }
}

function renderCartHTML(cartProducts) {
   if (!cartProducts || !Array.isArray(cartProducts)) {
      cartProducts = [];
   }

   const html =
      cartProducts.length > 0
         ? cartProducts
              .map(({ image, price, name, quantity = 1 }) => {
                 const totalPrice = (price * quantity).toFixed(2);
                 return `
            <li class="pop-item">
              <img src="${image}" alt="${name}" class="pop-item-img" />
              <p class="pop-item-price">$${totalPrice} (${quantity}x)</p>
            </li>
          `;
              })
              .join("")
         : `<li class="pop-item empty">Your cart is empty</li>`;

   if (actionCartList) {
      actionCartList.innerHTML = html;
   } else {
      console.error("Cart list element not found");
   }
}

function renderCartCount(cartProducts = []) {
   if (!Array.isArray(cartProducts)) {
      cartProducts = [];
   }

   const count = cartProducts.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
   );

   const popUpHeading = $(".pop-header-heading");
   if (popUpHeading) {
      popUpHeading.textContent = `You have ${count} item${
         count !== 1 ? "s" : ""
      }`;
   }
}

function renderTotalCart(cartProducts = []) {
   if (!Array.isArray(cartProducts)) {
      cartProducts = [];
   }

   const subtotal = cartProducts.reduce(
      (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
      0
   );

   const discount = subtotal * 0.1;
   const shipping = 10.0;
   const finalTotal = subtotal - discount + shipping;

   const subtotalElements = document.querySelectorAll(".total-subtotal-price");
   if (subtotalElements.length > 0) {
      subtotalElements[0].textContent = `$${subtotal.toFixed(2)}`;
   }

   if (totalPriceText) {
      totalPriceText.textContent = `$${finalTotal.toFixed(2)}`;
   }
   if (totalPriceHeader) {
      totalPriceHeader.textContent = `$${finalTotal.toFixed(2)}`;
   }
}

function renderTotalSubtotal(cartProducts = []) {
   if (!Array.isArray(cartProducts)) {
      cartProducts = [];
   }

   const subtotal = cartProducts.reduce(
      (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
      0
   );

   const subtotalElements = document.querySelectorAll(".total-subtotal-price");
   if (subtotalElements.length > 0) {
      subtotalElements[0].textContent = `$${subtotal.toFixed(2)}`;
   }
   if (subtotalElements.length > 1) {
      subtotalElements[1].textContent = "Free";
   }
   if (subtotalElements.length > 2) {
      subtotalElements[2].textContent = "$10.00";
   }
}

async function handleCartDisplay() {
   try {
      // Try to get cart from server first, fallback to localStorage
      let cartData = [];
      try {
         cartData = await fetchCart();
      } catch {
         cartData = JSON.parse(localStorage.getItem("cart")) || [];
      }

      if (products && products.length > 0) {
         const cartProducts = products
            .filter((p) => cartData.some((c) => +c.id === +p.id))
            .map((p) => ({
               ...p,
               quantity: cartData.find((c) => +c.id === +p.id)?.quantity || 1,
            }));

         renderCartHTML(cartProducts);
         renderCartCount(cartProducts);
         renderTotalSubtotal(cartProducts);
         renderTotalCart(cartProducts);
      }
   } catch (error) {
      console.error("Error handling cart display:", error);
      showErrorMessage("Không thể hiển thị giỏ hàng.");
   }
}

// === WISHLIST FUNCTIONS ===
async function loadLikedProducts(products, actionWishCount) {
   try {
      const likedResponse = await fetch(`${API_BASE_URL}/likedProducts`);
      if (!likedResponse.ok) {
         throw new Error(
            `Failed to fetch liked products: ${likedResponse.status}`
         );
      }
      let likedData = await likedResponse.json();
      let likedProductIds = Array.isArray(likedData?.ids) ? likedData.ids : [];
      if (!Array.isArray(likedProductIds)) likedProductIds = [];

      products.forEach((p) => {
         p.liked = likedProductIds.includes(p.id);
      });

      if (actionWishCount) {
         actionWishCount.textContent = likedProductIds.length;
      }

      console.log("Successfully loaded liked products from server");
      return products;
   } catch (error) {
      console.error("Error loading liked products from server:", error);
      // Fallback to localStorage
      try {
         const localLiked =
            JSON.parse(localStorage.getItem("likedProducts")) || [];
         products.forEach((p) => {
            p.liked = localLiked.includes(p.id);
         });
         if (actionWishCount) {
            actionWishCount.textContent = localLiked.length;
         }
      } catch {
         if (actionWishCount) {
            actionWishCount.textContent = "0";
         }
      }
      return products;
   }
}

// === LOGIN STATUS FUNCTION ===
function handleLoginStatusAbout() {
   try {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const action = $(".action");
      const actionProfile = $(".action-profile");
      const user = $(".user");

      if (action && actionProfile && user) {
         action.style.display = "block";

         if (isLoggedIn) {
            user.style.display = "block";
            actionProfile.style.display = "none";
         } else {
            user.style.display = "none";
            actionProfile.style.display = "flex";
         }
      } else {
         console.error("Required login elements not found in DOM");
      }
   } catch (error) {
      console.error("Error handling login status:", error);
   }
}

// === CART POPUP HANDLERS ===
function setupCartPopupHandlers() {
   if (cartBtn && cartPopup) {
      cartBtn.addEventListener("mouseenter", () => {
         cartPopup.style.display = "block";
      });

      cartBtn.addEventListener("mouseleave", () => {
         setTimeout(() => {
            if (!cartPopup.matches(":hover")) {
               cartPopup.style.display = "none";
            }
         }, 200);
      });

      cartPopup.addEventListener("mouseleave", () => {
         cartPopup.style.display = "none";
      });
   } else {
      console.error("Cart button or popup not found in DOM");
   }
}

// === UTILITY FUNCTIONS ===
function showErrorMessage(message) {
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
    font-family: Arial, sans-serif;
  `;
   document.body.appendChild(errorDiv);
   setTimeout(() => errorDiv.remove(), 5000);
}

// === MAIN INITIALIZATION ===
async function initAboutPage() {
   try {
      console.log("Initializing about page...");

      // Handle login status
      handleLoginStatusAbout();

      // Load products for cart and wishlist calculations
      products = await fetchProducts();

      if (products.length > 0) {
         // Load liked products (wishlist)
         products = await loadLikedProducts(products, actionWishCount);

         // Handle cart display
         await handleCartDisplay();
      }

      // Setup cart popup handlers
      setupCartPopupHandlers();

      // Listen for storage changes from other tabs
      window.addEventListener("storage", function (e) {
         if (e.key === "isLoggedIn") {
            handleLoginStatusAbout();
         } else if (e.key === "cart") {
            handleCartDisplay();
         } else if (e.key === "likedProducts") {
            if (products.length > 0) {
               loadLikedProducts(products, actionWishCount);
            }
         }
      });

      console.log("About page initialized successfully");
   } catch (error) {
      console.error("Error initializing about page:", error);
      showErrorMessage("Không thể khởi tạo trang.");
   }
}

// === DEBUG FUNCTIONS ===
function checkLoginStatus() {
   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
   console.log("Current login status:", isLoggedIn);
   handleLoginStatusAbout();
   return isLoggedIn;
}

function checkCartStatus() {
   const cartData = JSON.parse(localStorage.getItem("cart")) || [];
   console.log("Current cart:", cartData);
   handleCartDisplay();
   return cartData;
}

function checkWishlistStatus() {
   const likedData = JSON.parse(localStorage.getItem("likedProducts")) || [];
   console.log("Current wishlist:", likedData);
   if (actionWishCount) {
      actionWishCount.textContent = likedData.length;
   }
   return likedData;
}

// === EVENT LISTENERS ===
document.addEventListener("DOMContentLoaded", initAboutPage);

// Export functions for debugging (optional)
window.aboutPageDebug = {
   checkLoginStatus,
   checkCartStatus,
   checkWishlistStatus,
   handleLoginStatusAbout,
   handleCartDisplay,
};


