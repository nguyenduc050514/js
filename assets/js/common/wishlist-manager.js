import ApiService from "../apis/api-service.js";

class WishlistManager {
   constructor(URL) {
      this.API_BASE_URL = URL;
      this.apiService = new ApiService(this.API_BASE_URL);
   }

   async handleWishlistToggle(e) {
      this.products = await this.apiService.getProducts();
      console.log(this.products);
      if (!e.target.closest(".products-wish")) return;
      e.preventDefault();
      e.stopPropagation();
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

   async loadLikedProducts(products) {
      try {
         const likedProductIds = await this.apiService.loadLikedProducts();
         products.forEach((p) => {
            p.liked = likedProductIds.includes(p.id);
         });

         if (this.actionWishCount) {
            this.actionWishCount.textContent = likedProductIds.length;
         }

         console.log("Successfully loaded liked products from server");
         return products;
      } catch (error) {
         console.error("Error loading liked products:", error.message);
         if (this.actionWishCount) {
            this.actionWishCount.textContent = products.filter(
               (p) => p.liked
            ).length;
         }
         return products;
      }
   }
}

export default WishlistManager;
