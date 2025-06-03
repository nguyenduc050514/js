import { showErrorMessage } from "./ui-utils.js";

export class WishlistManager {
   constructor(app) {
      this.app = app;
   }

   async handleWishlistToggle(e) {
      if (!e.target.closest(".products-wish")) return;

      e.preventDefault();
      e.stopPropagation();
      const productsItem = e.target.closest(".products-item");
      if (!productsItem) {
         console.error("Products item not found");
         showErrorMessage("Không tìm thấy sản phẩm.");
         return;
      }

      const productId = Number(productsItem.dataset.product);
      if (!productId) {
         console.error("Product ID not found in dataset");
         showErrorMessage("Không tìm thấy ID sản phẩm.");
         return;
      }

      const productIndex = this.app.products.findIndex(
         (p) => +p.id === +productId
      );
      if (productIndex === -1) {
         console.error(`Product with ID ${productId} not found`);
         showErrorMessage("Sản phẩm không tồn tại.");
         return;
      }

      const product = this.app.products[productIndex];
      const originalLiked = product.liked;
      product.liked = !originalLiked;

      const heartSvg = productsItem.querySelector(".products-wish-svg");
      if (heartSvg) {
         heartSvg.src = product.liked
            ? "./assets/icons/heart-red.svg"
            : "./assets/icons/heart.svg";
      }

      try {
         await this.app.apiService.saveLikedProducts(
            this.app.products.filter((p) => p.liked).map((p) => p.id)
         );
         if (this.app.actionWishCount) {
            this.app.actionWishCount.textContent = this.app.products.filter(
               (p) => p.liked
            ).length;
         }
      } catch (error) {
         product.liked = originalLiked;
         if (heartSvg) {
            heartSvg.src = product.liked
               ? "./assets/icons/heart-red.svg"
               : "./assets/icons/heart.svg";
         }
         showErrorMessage(
            "Không thể cập nhật danh sách yêu thích. Vui lòng kiểm tra server."
         );
      }
   }

   async loadLikedProducts(products) {
      try {
         const likedProductIds = await this.app.apiService.loadLikedProducts();
         products.forEach((p) => {
            p.liked = likedProductIds.includes(p.id);
         });

         if (this.app.actionWishCount) {
            this.app.actionWishCount.textContent = likedProductIds.length;
         }

         console.log("Successfully loaded liked products from server");
         return products;
      } catch (error) {
         console.error("Error loading liked products:", error.message);
         if (this.app.actionWishCount) {
            this.app.actionWishCount.textContent = products.filter(
               (p) => p.liked
            ).length;
         }
         return products;
      }
   }
}
