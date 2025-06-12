import ApiService from "./apis/api-service.js";
import { showNotification } from "./utils/ui-utils.js";
import CartManager from "./common/cart-manager.js";
import ImageSlider from "./common/slider.js";
import { handleLoginStatus } from "./auth/auth.js";
import LogoutClass from "./pages/logout.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
class ProductList {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.products = [];
      this.apiService = new ApiService(this.API_BASE_URL);
      this.cartManager = new CartManager();
      this.slider = new ImageSlider();
      this.logout = new LogoutClass();
      this.handleLoginStatus = handleLoginStatus;
      this.elements = {
         productsList: $("#products-list"),
         actionWishCount: $("#action-wish__count"),
         cartBtn: $(".action-wish.pop-up-cart"),
         cartPopup: $(".pop-up-cart-block"),
         actionCartList: $(".pop-list"),
         checkout: $(".pop-checkout"),
         logout: $("#logout"),
         actionAvatar: $(".action-avatar"),
         actionAvatarDropdown: $(".action-avatar-dropdown"),
         userName: $("#user-name"),
         userEmail: $("#user-email"),
      };
   }
   async initializeApp() {
      this.users = await this.apiService.getUsers();
      this.hasLogin = localStorage.getItem("isLoggedIn");
      if (this.hasLogin) {
         this.currentUserId = localStorage.getItem("currentUserId");
         if (this.currentUserId) {
            const user = this.users.find((u) => u.id === this.currentUserId);
            this.elements.actionAvatar.src = user.avatar;
            this.elements.actionAvatarDropdown.src = user.avatar;
            this.elements.userEmail.textContent = user.email;
            this.elements.userName.textContent = user.user_name;
         }
      }
      try {
         this.products = await this.apiService.getProducts();
         if (this.hasLogin) {
            const likedProductIds = await this.apiService.loadLikedProducts();
            this.products.forEach((p) => {
               p.liked = likedProductIds.includes(p.id);
            });
            if (this.elements.actionWishCount) {
               this.elements.actionWishCount.textContent =
                  likedProductIds.length;
            }
         }

         this.renderProducts(this.products);
         this.handleLoginStatus();
      } catch (error) {
         console.error("Error initializing app:", error.message);
         showNotification(
            "Không thể khởi tạo ứng dụng. Vui lòng kiểm tra server.",
            "error"
         );
      }
   }

   renderProducts(products = []) {
      if (!this.elements.productsList) {
         console.error("Products list element not found");
         showNotification("Không tìm thấy danh sách sản phẩm.");
         return;
      }

      const html = products
         .map(
            ({ id, name, brand, price, rating, image, liked }) => `
         <div data-product="${id}" class="products-item" data-link="./pages/detail.html?id=${id}">
            <figure class="products-image">
               <img src="${image}" alt="${name}" class="products-img" />
               <div class="products-wish">
                  <img src="./assets/icons/${
                     liked ? "heart-red" : "heart"
                  }.svg" class="products-wish-svg" alt="wishlist" />
               </div>
            </figure>
            <div class="products-info">
               <h2 class="products-title">${name}</h2>
               <p class="products-brand">${brand}</p>
               <div class="products-cart">
                  <span class="products-price">$${price}</span>
                  <span class="products-rating">
                     <img src="./assets/icons/star.svg" alt="rating" />
                     ${rating}
                  </span>
               </div>
            </div>
         </div>`
         )
         .join("");
      this.elements.productsList.innerHTML = html;
   }

   async handleWishlistToggle(e) {
      if (!this.hasLogin) {
         showNotification("Bạn vui lòng đăng nhập!!", "error");
         return;
      }

      if (!e.target.closest(".products-wish")) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const productsItem = e.target.closest(".products-item");
      if (!productsItem) {
         console.error("Products item not found");
         showNotification("Không tìm thấy sản phẩm.", "error");
         return;
      }

      const productId = Number(productsItem.dataset.product);
      if (!productId) {
         console.error("Product ID not found in dataset");
         showNotification("Không tìm thấy ID sản phẩm.", "error");
         return;
      }

      const productIndex = this.products.findIndex((p) => +p.id === +productId);
      if (productIndex === -1) {
         console.error(`Product with ID ${productId} not found`);
         showNotification("Sản phẩm không tồn tại.", "error");
         return;
      }

      const product = this.products[productIndex];
      const originalLiked = product.liked;
      product.liked = !originalLiked;

      const heartSvg = productsItem.querySelector(".products-wish-svg");
      if (heartSvg) {
         heartSvg.src = product.liked
            ? "./assets/icons/heart-red.svg"
            : "./assets/icons/heart.svg";
      }

      try {
         const likedProducts = this.products
            .filter((p) => p.liked)
            .map((p) => p.id);
         await this.apiService.saveLikedProducts(likedProducts);
         if (this.elements.actionWishCount) {
            this.elements.actionWishCount.textContent = likedProducts.length;
         }
         showNotification("Đã thêm vào sản phẩm yêu thích");
      } catch (error) {
         product.liked = originalLiked;
         if (heartSvg) {
            heartSvg.src = product.liked
               ? "./assets/icons/heart-red.svg"
               : "./assets/icons/heart.svg";
         }
         showNotification(
            "Không thể cập nhật danh sách yêu thích. Vui lòng kiểm tra server.",
            "error"
         );
      }
   }

   setupEventListeners() {
      if (this.elements.logout) {
         this.elements.logout.addEventListener("click", () =>
            this.logout.handleLogout()
         );
      }

      if (this.elements.productsList) {
         this.elements.productsList.addEventListener("click", (e) => {
            const wishIcon = e.target.closest(".products-wish");
            if (wishIcon) {
               this.handleWishlistToggle(e);
               return;
            }

            const productItem = e.target.closest(".products-item");
            if (productItem && productItem.dataset.link) {
               window.location.href = productItem.dataset.link;
            }
         });
      }

      this.cartManager.setupCartPopupEvents();
   }

   async init() {
      try {
         await this.initializeApp();
         await this.cartManager.refreshCartUI();
         this.handleLoginStatus();
         this.setupEventListeners();
         window.imageSlider = this.slider;
      } catch (error) {
         console.error("Error initializing page:", error);
         showNotification("Không thể khởi tạo trang.");
      }
   }
}

document.addEventListener(
   "DOMContentLoaded",
   () => {
      const productList = new ProductList();
      productList.init();
   },
   { capture: true }
);
