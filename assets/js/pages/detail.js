import CartManager from "../common/cart-manager.js";
import { showNotification } from "../utils/ui-utils.js";
import ApiService from "../apis/api-service.js";
import { handleLoginStatus } from "../auth/auth.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
class ShoppingCart {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.products = [];
      this.apiService = new ApiService(this.API_BASE_URL);
      this.cartManager = new CartManager();
      this.handleLoginStatus = handleLoginStatus;
      this.elements = {
         detailWrapper: $(".detail-wrapper"),
         addCartText: $(".total-price-header"),
         cartBtn: $(".action-wish.pop-up-cart"),
         cartPopup: $(".pop-up-cart-block"),
         actionWishCount: $("#action-wish__count"),
      };
   }

   async updateCartQuantity(productId, newQuantity) {
      try {
         if (newQuantity <= 0) {
            await this.removeFromCart(productId);
            return;
         }

         await fetch(`${this.API_BASE_URL}/carts/${productId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newQuantity }),
            credentials: "same-origin", // Hoặc 'omit' nếu không cần cookie
         });
      } catch (error) {
         console.error("Error updating quantity:", error);
         showNotification("Không thể cập nhật số lượng.", "error");
         throw error;
      }
   }

   getCartTotalCount(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) return 0;
      return cartsProduct.reduce((sum, item) => sum + (item.quantity || 1), 0);
   }

   getCartTotalPrice(cartsProduct = [], withDiscount = true) {
      if (!Array.isArray(cartsProduct)) return 0;
      const subtotal = cartsProduct.reduce(
         (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
         0
      );
      return withDiscount ? subtotal * 0.9 : subtotal;
   }

   async init() {
      try {
         this.products = await this.apiService.getProducts();
         this.cart = await this.apiService.fetchCart();
         const likedProductIds = await this.apiService.loadLikedProducts();

         const params = new URLSearchParams(window.location.search);
         const productId = parseInt(params.get("id"));

         if (!productId || isNaN(productId)) {
            console.error(`Invalid product ID: ${productId}`);
            showNotification("ID sản phẩm không hợp lệ.", "error");
            return;
         }

         const product = this.products.find((p) => +p.id === +productId);
         if (!product) {
            console.error("Product not found");
            showNotification("Không tìm thấy sản phẩm.", "error");
            return;
         }

         this.renderDetailProduct();
         await this.apiService.loadLikedProducts();
         await this.cartManager.refreshCartUI();
         this.setupEventListeners();
         this.handleLoginStatus();

         this.products.forEach((p) => {
            p.liked = likedProductIds.includes(p.id);
         });
         if (this.elements.actionWishCount) {
            this.elements.actionWishCount.textContent = likedProductIds.length;
         }
      } catch (error) {
         console.error("Error initializing page:", error);
         showNotification("Không thể khởi tạo trang.", "error");
      }
   }

   async renderDetailProduct() {
      this.loadLiked = await this.apiService.loadLikedProducts();
      this.listLoadLiked = this.loadLiked.map(Number);
      const params = new URLSearchParams(window.location.search);
      const productId = parseInt(params.get("id"));
      const product = this.products.find((p) => +p.id === +productId);

      if (!product || !this.elements.detailWrapper) return;

      const { name, price, rating, image } = product;
      const salePrice = (price * 0.9).toFixed(2);
      let liked = this.listLoadLiked.includes(productId)
         ? "heart-red"
         : "heart";
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
                            <img src="../assets/icons/${liked}.svg" class="products-wish-svg" alt="Add to wishlist" />
                        </div>
                    </div>
                </div>
            </div>
        `;

      this.elements.detailWrapper.innerHTML = html;
   }
   async handleWishlistToggle(e) {
      if (!e.target.closest(".add-cart-icon")) return;
      e.preventDefault();
      e.stopPropagation();
      const productId = Number(
         new URLSearchParams(window.location.search).get("id")
      );
      const productIndex = this.products.findIndex((p) => +p.id === +productId);
      if (productIndex === -1) {
         console.error(`Product with ID ${productId} not found`);
         showNotification("Sản phẩm không tồn tại.", "error");
         return;
      }

      const product = this.products[productIndex];
      const originalLiked = product.liked;
      product.liked = !originalLiked;

      const heartSvg = e.target
         .closest(".add-cart-icon")
         .querySelector(".products-wish-svg");

      if (heartSvg) {
         heartSvg.src = product.liked
            ? "../../../assets/icons/heart.svg"
            : "../../../assets/icons/heart-red.svg";
      }
      const likedProducts = this.products
         .filter((p) => p.liked)
         .map((p) => p.id);
      const result = await this.apiService.saveLikedProducts(likedProducts);

      if (result.success) {
         if (this.elements.actionWishCount) {
            this.elements.actionWishCount.textContent = likedProducts.length;
         }
         showNotification("Đã cập nhật danh sách sản phẩm yêu thích");
         this.renderDetailProduct(); // Refresh the UI to reflect the change
      } else {
         product.liked = originalLiked;
         if (heartSvg) {
            heartSvg.src = product.liked
               ? "../../../assets/icons/heart.svg"
               : "../../../assets/icons/heart-red.svg";
         }
         showNotification(
            "Không thể cập nhật danh sách yêu thích. Vui lòng kiểm tra server.",
            "error"
         );
      }
   }

   setupEventListeners() {
      if (!this.elements.detailWrapper) return;
      this.elements.detailWrapper.addEventListener("click", async (e) => {
         const params = new URLSearchParams(window.location.search);
         const productId = parseInt(params.get("id"));
         const product = this.products.find((p) => +p.id === +productId);

         if (!product) return;

         if (e.target.closest(".add-cart-icon")) {
            await this.handleWishlistToggle(e);
            return;
         }

         if (e.target.closest(".add-cart-btn")) {
            await this.addToCart(productId);
            return;
         }
      });

      this.setupTabNavigation();
      this.cartManager.setupCartPopupEvents();
   }

   setupTabNavigation() {
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

   async addToCart(productId) {
      const product = this.products.find((p) => +p.id === +productId);
      if (!product) {
         console.error("Product not found");
         showNotification("Không tìm thấy sản phẩm.", "error");
         return;
      }

      try {
         const checkResponse = await fetch(
            `${this.API_BASE_URL}/carts/${productId}`
         );
         if (checkResponse.ok) {
            const existingItem = await checkResponse.json();
            const updatedQuantity = existingItem.quantity + 1;

            await fetch(`${this.API_BASE_URL}/carts/${productId}`, {
               method: "PATCH",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ quantity: updatedQuantity }),
               credentials: "same-origin", // Hoặc 'omit' nếu không cần cookie
            });
         } else {
            const newItem = {
               id: product.id,
               name: product.name,
               price: product.price,
               image: product.image,
               quantity: 1,
               categories: product.categories,
               liked: product.liked,
            };

            await fetch(`${this.API_BASE_URL}/carts`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(newItem),
               credentials: "same-origin", // Hoặc 'omit' nếu không cần cookie
            });
         }

         await this.cartManager.refreshCartUI();
         showNotification("Đã thêm sản phẩm vào giỏ hàng!");
      } catch (error) {
         console.error("Error adding to cart:", error);
         showNotification("Không thể thêm sản phẩm vào giỏ hàng.", "error");
      }
   }
}

document.addEventListener("DOMContentLoaded", () => {
   const cart = new ShoppingCart();
   cart.init();
});
