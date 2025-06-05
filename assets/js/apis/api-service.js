import { showNotification } from "../utils/ui-utils.js";
class ApiService {
   constructor(baseUrl) {
      this.baseUrl = baseUrl;
   }

   async fetchCart() {
      try {
         const response = await fetch(`${this.baseUrl}/carts`);
         if (!response.ok) {
            throw new Error(`Failed to fetch cart: ${response.status}`);
         }
         const data = await response.json();
         return Array.isArray(data) ? data : [];
      } catch (error) {
         console.error("Error fetching cart:", error);
         showNotification("Không thể tải giỏ hàng từ server.", "error");
         return JSON.parse(localStorage.getItem("cart")) || [];
      }
   }

   async getProducts() {
      try {
         const response = await fetch(`${this.baseUrl}/products`);
         if (!response.ok) {
            throw new Error(
               `Response status: ${response.status} - ${await response.text()}`
            );
         }
         const products = await response.json();
         if (!Array.isArray(products)) {
            throw new Error("Products data is not an array");
         }
         return products;
      } catch (error) {
         console.error("Error fetching products:", error.message);
         showNotification(
            "Không thể tải sản phẩm. Vui lòng kiểm tra server.",
            "error"
         );
         return [];
      }
   }

   async loadLikedProducts() {
      try {
         const likedResponse = await fetch(`${this.baseUrl}/likedProducts`);
         if (!likedResponse.ok) {
            throw new Error(
               `Failed to fetch liked products: ${likedResponse.status}`
            );
         }
         let likedData = await likedResponse.json();
         let likedProductIds = Array.isArray(likedData?.ids)
            ? likedData.ids
            : [];
         if (!Array.isArray(likedProductIds)) likedProductIds = [];
         return likedProductIds;
      } catch (error) {
         console.error(
            "Error loading liked products from server:",
            error.message
         );
         showNotification(
            "Không thể tải danh sách yêu thích từ server.",
            "error"
         );
         return [];
      }
   }

   async saveLikedProducts(likedProducts) {
      try {
         if (!Array.isArray(likedProducts)) {
            return {
               success: false,
               error: "likedProducts must be an array of product IDs",
            };
         }

         let likedProductsExists = false;
         try {
            const checkResponse = await fetch(`${this.baseUrl}/likedProducts`);
            likedProductsExists = checkResponse.ok;
         } catch {
            console.log(
               "Endpoint /likedProducts does not exist yet, will create it."
            );
         }

         const method = likedProductsExists ? "PUT" : "POST";
         const response = await fetch(`${this.baseUrl}/likedProducts`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: likedProducts }),
            credentials: "same-origin", // Hoặc 'omit' nếu không cần cookie
         });

         if (!response.ok) {
            const errorText = await response.text();
            return {
               success: false,
               error: `${method} likedProducts failed: ${response.status} - ${errorText}`,
            };
         }

         return { success: true };
      } catch (error) {
         console.error("Error saving liked products to server:", error.message);
         showNotification(
            "Không thể lưu danh sách yêu thích. Vui lòng kiểm tra server.",
            "error"
         );
         return { success: false, error: error.message };
      }
   }

   async getCategories() {
      try {
         const response = await fetch(`${this.baseUrl}/categories`);
         if (!response.ok) {
            throw new Error(
               `Response status: ${response.status} - ${await response.text()}`
            );
         }
         const categories = await response.json();
         if (!Array.isArray(categories)) {
            throw new Error("Products data is not an array");
         }
         return categories;
      } catch (error) {
         console.error("Error fetching products:", error.message);
         showNotification(
            "Không thể tải sản phẩm. Vui lòng kiểm tra server.",
            "error"
         );
         return [];
      }
   }

}
export default ApiService;
