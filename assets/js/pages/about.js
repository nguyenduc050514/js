import ApiService from "../apis/api-service.js";
import { showNotification } from "../utils/ui-utils.js";
import { handleLoginStatus } from "../auth/auth.js";
import CartManager from "../common/cart-manager.js";
import LogoutClass from "./logout.js";
const $ = document.querySelector.bind(document);
class About {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.apiService = new ApiService(this.API_BASE_URL);
      this.cartManager = new CartManager();
      this.handleLoginStatus = handleLoginStatus;
      this.logout = new LogoutClass();
      this.elements = {
         addCartText: $(".total-price-header"),
         cartBtn: $(".action-wish.pop-up-cart"),
         cartPopup: $(".pop-up-cart-block"),
         actionWishCount: $("#action-wish__count"),
         actionAvatar: $(".action-avatar"),
         actionAvatarDropdown: $(".action-avatar-dropdown"),
         userName: $("#user-name"),
         userEmail: $("#user-email"),
         logout: $("#logout"),
      };
   }

   async initializeApp() {
      if (this.elements.logout) {
         this.elements.logout.addEventListener("click", () =>
            this.logout.handleLogout()
         );
      }
      try {
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
   const about = new About();
   about.init();
});
