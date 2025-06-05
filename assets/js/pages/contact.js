import ApiService from "../apis/api-service.js";
import { showNotification } from "../utils/ui-utils.js";
import { handleLoginStatus } from "../auth/auth.js";
import CartManager from "../common/cart-manager.js";
const $ = document.querySelector.bind(document);
class Contact {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.apiService = new ApiService(this.API_BASE_URL);
      this.cartManager = new CartManager();
      this.handleLoginStatus = handleLoginStatus;
      this.elements = {
         addCartText: $(".total-price-header"),
         cartBtn: $(".action-wish.pop-up-cart"),
         cartPopup: $(".pop-up-cart-block"),
         actionWishCount: $("#action-wish__count"),
      };
   }

   async initializeApp() {
      try {
         this.products = await this.apiService.getProducts();
         const likedProductIds = await this.apiService.loadLikedProducts();
         this.products.forEach((p) => {
            p.liked = likedProductIds.includes(p.id);
         });
         if (this.elements.actionWishCount) {
            this.elements.actionWishCount.textContent = likedProductIds.length;
         }
         this.handleLoginStatus();
      } catch (error) {
         console.error("Error initializing app:", error.message);
         showNotification(
            "Không thể khởi tạo ứng dụng. Vui lòng kiểm tra server.",
            "error"
         );
      }
   }

   async init() {
      try {
         await this.initializeApp();
         await this.cartManager.refreshCartUI();
         this.handleLoginStatus();
         this.cartManager.setupCartPopupEvents();
      } catch (error) {
         console.error("Error initializing page:", error);
         showNotification("Không thể khởi tạo trang.");
      }
   }
}

document.addEventListener("DOMContentLoaded", () => {
   const contact = new Contact();
   contact.init();
});
