import ApiService from "../apis/api-service.js";
import { showNotification } from "../utils/ui-utils.js";
const $ = document.querySelector.bind(document);
class LogoutClass {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.apiService = new ApiService(this.API_BASE_URL);
      this.currentUserId = null;
      
   }
   handleLogout() {
      this.currentUserId = localStorage.getItem("currentUserId");
      try {
         if (!this.currentUserId) {
            console.warn("No current user found");
            this.performLogoutCleanup();
            return;
         }
         showNotification("Đăng xuất thành công", "success");
         setTimeout(async () => {
            const sessions = await this.apiService.getSessions();
            console.log(sessions);
            if (!Array.isArray(sessions)) {
               throw new Error("Sessions data is not an array");
            }
            const userSession = sessions.find(
               (s) => s.userId === this.currentUserId
            );

            if (userSession) {
               await this.apiService.deleteSessionUser(userSession.id);
               console.log("Session deleted successfully");
            } else {
               console.warn("No session found for current user");
            }
            this.performLogoutCleanup();
         }, 500);
      } catch (error) {
         console.error("Logout error:", error);
         this.performLogoutCleanup();
         showNotification("Đã đăng xuất (có lỗi khi xóa session)", "warning");
      }
   }
   performLogoutCleanup() {
      localStorage.removeItem("currentUserId");
      localStorage.removeItem("isLoggedIn");
   }
}
export default LogoutClass;
