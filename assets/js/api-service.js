import { showErrorMessage } from "./ui-utils.js";

export class ApiService {
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
         showErrorMessage("Không thể tải giỏ hàng từ server.");
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
         showErrorMessage("Không thể tải sản phẩm. Vui lòng kiểm tra server.");
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
         showErrorMessage("Không thể tải danh sách yêu thích từ server.");
         return [];
      }
   }

   async saveLikedProducts(likedProducts) {
      try {
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
         });

         if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
               `${method} likedProducts failed: ${response.status} - ${errorText}`
            );
         }
      } catch (error) {
         console.error("Error saving liked products to server:", error.message);
         showErrorMessage(
            "Không thể lưu danh sách yêu thích. Vui lòng kiểm tra server."
         );
         throw error;
      }
   }
}
