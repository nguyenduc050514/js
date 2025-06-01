const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const API_BASE_URL = "http://localhost:5000";
let products = [];
let cart = [];
const actionWishCount = $("#action-wish__count");
const actionCartTotal = $(".total-price-header"); // Corrected selector
const detailWrapper = $(".detail-wrapper");
const addCartText = $(".total-price-header");
const cartBtn = $(".action-wish.pop-up-cart");
const cartPopup = $(".pop-up-cart-block");
const actionCartList = $(".pop-list");
const totalPriceText = $(".total-price-text");
const totalSubtotalPrice = $(".total-subtotal-price");

// Fetch products from API
async function fetchProducts() {
   try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok)
         throw new Error(`Failed to fetch products: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
   } catch (error) {
      console.error("Error fetching products:", error);
      showNotification(
         "Không thể tải sản phẩm. Vui lòng kiểm tra server.",
         "error"
      );
      return [];
   }
}

// Fetch cart from API
async function fetchCart() {
   try {
      const response = await fetch(`${API_BASE_URL}/carts`);
      if (!response.ok)
         throw new Error(`Failed to fetch cart: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
   } catch (error) {
      console.error("Error fetching cart:", error);
      showNotification("Không thể tải giỏ hàng từ server.", "error");
      return JSON.parse(localStorage.getItem("cart")) || [];
   }
}

// Render cart HTML
function renderCartHTML(products) {
   if (!products || !Array.isArray(products)) {
      products = [];
   }

   const html =
      products.length > 0
         ? products
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
      showNotification("Không tìm thấy danh sách giỏ hàng.", "error");
   }
}

// Render cart
async function renderCart(cartsProduct = []) {
   try {
      if (cartsProduct.length === 0) {
         cart = await fetchCart();
         renderCartHTML(cart);
      } else {
         renderCartHTML(cartsProduct);
      }
   } catch (error) {
      console.error("Error rendering cart:", error);
      renderCartHTML([]);
   }
}

// Render cart count
function renderCartCount(cartsProduct = []) {
   if (!Array.isArray(cartsProduct)) {
      cartsProduct = [];
   }

   const count = cartsProduct.reduce(
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

// Render total cart
function renderTotalCart(cartsProduct = [], addCartText = null) {
   if (!Array.isArray(cartsProduct)) {
      cartsProduct = [];
   }

   const subtotal = cartsProduct.reduce(
      (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
      0
   );

   const discount = subtotal * 0.1;
   const shipping = 10.0;
   const finalTotal = subtotal - discount + shipping;

   if (totalPriceText) {
      totalPriceText.textContent = `$${finalTotal.toFixed(2)}`;
   }
   if (addCartText) {
      addCartText.textContent = `$${finalTotal.toFixed(2)}`;
   }
}

// Render subtotal
function renderTotalSubtotal(cartsProduct = []) {
   if (!Array.isArray(cartsProduct)) {
      cartsProduct = [];
   }

   const subtotal = cartsProduct.reduce(
      (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
      0
   );

   const subtotalElements = $$(".total-subtotal-price");
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

// Render cart count on detail
function renderCartCountOnDetail(
   totalCart = 0,
   cartElement = null,
   sale = 0.1,
   shipping = 10
) {
   if (!cartElement) return;

   if (totalCart <= 0) {
      cartElement.textContent = "$0.00";
      return;
   }
   const discount = totalCart * sale;
   const finalPrice = totalCart - discount + shipping;
   cartElement.textContent = `$${finalPrice.toFixed(2)}`;
}

// Update cart quantity
async function updateCartQuantity(productId, newQuantity) {
   try {
      if (newQuantity <= 0) {
         await removeFromCart(productId);
         return;
      }

      await fetch(`${API_BASE_URL}/carts/${productId}`, {
         method: "PATCH",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ quantity: newQuantity }),
      });
   } catch (error) {
      console.error("Error updating quantity:", error);
      showNotification("Không thể cập nhật số lượng.", "error");
      throw error;
   }
}

// Remove item from cart
async function removeFromCart(productId) {
   try {
      const response = await fetch(`${API_BASE_URL}/carts/${productId}`, {
         method: "DELETE",
      });

      if (!response.ok) {
         throw new Error("Failed to remove item from cart");
      }
   } catch (error) {
      console.error("Error removing from cart:", error);
      showNotification("Không thể xóa sản phẩm khỏi giỏ hàng.", "error");
      throw error;
   }
}

// Clear cart
async function clearCart() {
   try {
      const response = await fetch(`${API_BASE_URL}/carts`, {
         method: "DELETE",
      });

      if (!response.ok) {
         throw new Error("Failed to clear cart");
      }
   } catch (error) {
      console.error("Error clearing cart:", error);
      showNotification("Không thể xóa giỏ hàng.", "error");
      throw error;
   }
}

// Get cart total count
function getCartTotalCount(cartsProduct = []) {
   if (!Array.isArray(cartsProduct)) {
      return 0;
   }

   return cartsProduct.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

// Get cart total price
function getCartTotalPrice(cartsProduct = [], withDiscount = true) {
   if (!Array.isArray(cartsProduct)) {
      return 0;
   }

   const subtotal = cartsProduct.reduce(
      (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
      0
   );

   if (withDiscount) {
      return subtotal * 0.9; // Apply 10% discount
   }

   return subtotal;
}

// Initialize the page
async function init() {
   try {
      products = await fetchProducts();
      cart = await fetchCart();

      const params = new URLSearchParams(window.location.search);
      const productId = parseInt(params.get("id"));

      if (!productId || isNaN(productId)) {
         console.error(`Invalid product ID: ${productId}`);
         showNotification("ID sản phẩm không hợp lệ.", "error");
         return;
      }

      const product = products.find((p) => +p.id === +productId);
      if (!product) {
         console.error("Product not found");
         showNotification("Không tìm thấy sản phẩm.", "error");
         return;
      }

      renderDetailProduct();
      await loadLikedProducts();
      await refreshCartUI();
      setupEventListeners();
      handleUserAuthentication();
   } catch (error) {
      console.error("Error initializing page:", error);
      showNotification("Không thể khởi tạo trang.", "error");
   }
}

// Render product details
function renderDetailProduct() {
   const params = new URLSearchParams(window.location.search);
   const productId = parseInt(params.get("id"));
   const product = products.find((p) => +p.id === +productId);

   if (!product || !detailWrapper) return;

   const { name, price, rating, liked, image } = product;
   const salePrice = (price * 0.9).toFixed(2);

   const html = `
    <figure class="detail-thumb">
      <img src="${image}" alt="${name}" class="detail-img" />
    </figure>
    <div class="detail-info">
      <h2 class="detail-title">${name}</h2>
      <div class="detail-content">
        <div class="detail-row">
          <img src="../assets/icons/star.svg" alt="" />
          <span class="detail-review">(${rating}) ${rating} reviews</span>
        </div>
        <div class="detail-care">
          <div class="detail-care-info">
            <img src="../assets/icons/document.svg" alt="" />
            <h2 class="detail-care-info__heading">Compare</h2>
          </div>
          <div class="detail-care-info">
            <img src="../assets/icons/buy.svg" alt="" />
            <h2 class="detail-care-info__heading">Delivery</h2>
          </div>
          <div class="detail-care-info">
            <img src="../assets/icons/bag.svg" alt="" />
            <h2 class="detail-care-info__heading">Pickup</h2>
          </div>
        </div>
      </div>
      <div class="add-cart">
        <div class="add-cart-row">
          <h2 class="add-cart__price-sale">$${price}</h2>
          <span class="add-cart-sale">10%</span>
        </div>
        <h2 class="add-cart-price">$${salePrice}</h2>
        <div class="add-cart-row bottom">
          <button class="add-cart-btn">Add to cart</button>
          <div class="add-cart-icon" data-liked="${liked}">
            <img
              src="../assets/icons/${liked ? "heart-red" : "heart"}.svg"
              class="products-wish-svg"
              alt="Add to wishlist"
            />
          </div>
        </div>
      </div>
    </div>
  `;

   detailWrapper.innerHTML = html;
}

// Setup event listeners
function setupEventListeners() {
   if (!detailWrapper) return;

   detailWrapper.addEventListener("click", async (e) => {
      const params = new URLSearchParams(window.location.search);
      const productId = parseInt(params.get("id"));
      const product = products.find((p) => +p.id === +productId);

      if (!product) return;

      if (e.target.closest(".add-cart-icon")) {
         product.liked = !product.liked;
         await saveLikedProducts();
         renderDetailProduct();
         return;
      }

      if (e.target.closest(".add-cart-btn")) {
         await addToCart(productId);
         return;
      }
   });

   setupTabNavigation();
}

// Setup tab navigation
function setupTabNavigation() {
   const tabs = $$(".info-navbar-link");
   const contents = {
      Description: $(".info-content-description"),
      Reviews: $(".info-content-reviews"),
      Features: $(".info-content-features"),
   };

   if (tabs.length === 0) return;

   Object.values(contents).forEach((content) => {
      if (content) content.style.display = "none";
   });

   if (contents["Description"]) {
      contents["Description"].style.display = "block";
   }
   if (tabs[0]) {
      tabs[0].classList.add("active");
   }

   tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
         e.preventDefault();
         tabs.forEach((t) => t.classList.remove("active"));
         Object.values(contents).forEach((content) => {
            if (content) content.style.display = "none";
         });

         tab.classList.add("active");
         const tabName = tab.textContent.trim();
         if (contents[tabName]) {
            contents[tabName].style.display = "block";
         }
      });
   });
}

// Add product to cart
async function addToCart(productId) {
   const product = products.find((p) => +p.id === +productId);
   if (!product) {
      console.error("Product not found");
      showNotification("Không tìm thấy sản phẩm.", "error");
      return;
   }

   try {
      const checkResponse = await fetch(`${API_BASE_URL}/carts/${productId}`);
      if (checkResponse.ok) {
         const existingItem = await checkResponse.json();
         const updatedQuantity = existingItem.quantity + 1;

         await fetch(`${API_BASE_URL}/carts/${productId}`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity: updatedQuantity }),
         });
      } else {
         const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
         };

         await fetch(`${API_BASE_URL}/carts`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(newItem),
         });
      }

      await refreshCartUI();
      showNotification("Đã thêm sản phẩm vào giỏ hàng!");
   } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Không thể thêm sản phẩm vào giỏ hàng.", "error");
   }
}

// Refresh cart UI
async function refreshCartUI() {
   try {
      cart = await fetchCart();
      const cartsProduct = products
         .filter((p) => cart.some((c) => +c.id === +p.id))
         .map((p) => {
            const itemInCart = cart.find((c) => +c.id === +p.id);
            return {
               ...p,
               quantity: itemInCart?.quantity || 1,
            };
         });

      renderCart(cartsProduct);
      renderCartCount(cartsProduct);
      renderTotalSubtotal(cartsProduct);
      renderTotalCart(cartsProduct, addCartText);
      updateCartTotal();
   } catch (error) {
      console.error("Error refreshing cart UI:", error);
      showNotification("Không thể cập nhật giỏ hàng.", "error");
   }
}

// Update cart total in header
async function updateCartTotal() {
   try {
      const total = cart.reduce(
         (sum, item) => sum + item.price * item.quantity,
         0
      );
      const discountedTotal = total * 0.9;
      if (totalPriceHeader) {
         totalPriceHeader.textContent = `$${discountedTotal.toFixed(2)}`;
      }
   } catch (error) {
      console.error("Error updating cart total:", error);
      showErrorMessage("Không thể cập nhật tổng giỏ hàng.");
   }
}

// Save liked products
async function saveLikedProducts() {
   try {
      const likedProducts = products.filter((p) => p.liked).map((p) => p.id);
      if (actionWishCount) {
         actionWishCount.textContent = likedProducts.length;
      }

      const response = await fetch(`${API_BASE_URL}/likedProducts`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ ids: likedProducts }),
      });

      if (!response.ok) {
         throw new Error(`Failed to save liked products: ${response.status}`);
      }
   } catch (error) {
      console.error("Error saving liked products:", error);
      showNotification("Không thể lưu danh sách yêu thích.", "error");
   }
}

// Load liked products
async function loadLikedProducts() {
   try {
      const response = await fetch(`${API_BASE_URL}/likedProducts`);
      if (!response.ok)
         throw new Error(`Failed to fetch liked products: ${response.status}`);

      const likedData = await response.json();
      const likedProducts = Array.isArray(likedData.ids) ? likedData.ids : [];

      if (actionWishCount) {
         actionWishCount.textContent = likedProducts.length;
      }

      products.forEach((p) => (p.liked = likedProducts.includes(p.id)));
   } catch (error) {
      console.error("Error loading liked products:", error);
      showNotification("Không thể tải danh sách yêu thích.", "error");
   }
}

// Show notification
function showNotification(message, type = "success") {
   const notification = document.createElement("div");
   notification.className = `notification ${type}`;
   notification.textContent = message;

   notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === "success" ? "#4CAF50" : "#f44336"};
    color: white;
    border-radius: 4px;
    z-index: 9999;
    transition: opacity 0.3s;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;

   document.body.appendChild(notification);

   setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
         if (document.body.contains(notification)) {
            document.body.removeChild(notification);
         }
      }, 300);
   }, 3000);
}

// Handle user authentication
function handleUserAuthentication() {
   try {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const action = $(".action");
      const actionProfile = $(".action-profile");
      const user = $(".user");

      if (action && actionProfile && user) {
         action.style.display = "block"; // Always show cart
         user.style.display = isLoggedIn ? "block" : "none";
         actionProfile.style.display = isLoggedIn ? "none" : "flex";
      }
   } catch (error) {
      console.error("Error handling user authentication:", error);
      showNotification("Không thể kiểm tra trạng thái đăng nhập.", "error");
   }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
   init();
});

// Setup cart popup events
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
   showNotification("Không tìm thấy nút giỏ hàng hoặc popup.", "error");
}
