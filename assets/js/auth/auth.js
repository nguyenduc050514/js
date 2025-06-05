import { showNotification } from "../utils/ui-utils.js";
const API_BASE_URL = "http://localhost:5000";
const $ = document.querySelector.bind(document);
async function createLoginSession(loginData) {
   try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(loginData),
      });
      return response.ok;
   } catch (error) {
      console.error("Error creating session:", error);
      return false;
   }
}

function handleLoginStatus() {
   try {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const action = $(".action");
      const actionProfile = $(".action-profile");
      const user = $(".user");
      if (action && actionProfile && isLoggedIn) {
         action.style.display = "block";
         user.style.display = isLoggedIn ? "block" : "none";
         actionProfile.style.display = isLoggedIn ? "none" : "flex";
      }
   } catch (error) {
      console.error("Error handling login status:", error);
      showNotification("Không thể kiểm tra trạng thái đăng nhập.", "error");
   }
}
export { handleLoginStatus };
