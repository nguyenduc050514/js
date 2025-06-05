import { showNotification } from "../utils/ui-utils.js";
import ApiService from "../apis/api-service.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

class CartManager {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.subtotal = 0;
      this.finalTotal = 0;
      this.elements = {
         actionCartList: $(".pop-list"),
         totalPriceText: $(".total-price-text"),
         totalPriceHeader: $(".total-price-header"),
         actionCartTotal: $(".total-price-header"),
         addCartText: $(".total-price-header"),
         cartBtn: $(".action-wish.pop-up-cart"),
         cartPopup: $(".pop-up-cart-block"),
      };
      this.carts = [];
      this.apiService = new ApiService(this.API_BASE_URL);
   }

   renderCartHTML(products = []) {
      if (!Array.isArray(products)) products = [];
      const html =
         products.length > 0
            ? products
                 .map(
                    ({ image, price, name, quantity = 1 }) => `
                <li class="pop-item">
                    <img src="${image}" alt="${name}" class="pop-item-img" />
                    <p class="pop-item-price">$${(price * quantity).toFixed(
                       2
                    )} (${quantity}x)</p>
                </li>
            `
                 )
                 .join("")
            : `<li class="pop-item empty">Your cart is empty</li>`;

      if (this.elements.actionCartList) {
         this.elements.actionCartList.innerHTML = html;
      } else {
         console.error("Cart list element not found");
         showNotification("Không tìm thấy danh sách giỏ hàng.", "error");
      }
   }

   async renderCart(cartsProduct = []) {
      try {
         if (cartsProduct.length === 0) {
            this.carts = await this.apiService.fetchCart();
            this.renderCartHTML(this.carts);
         } else {
            this.renderCartHTML(cartsProduct);
         }
      } catch (error) {
         console.error("Error rendering cart:", error);
         this.renderCartHTML([]);
      }
   }

   async renderCartCount(cartsProduct = []) {
      try {
         let cartData = cartsProduct;
         if (!Array.isArray(cartsProduct) || cartsProduct.length === 0) {
            cartData = await this.apiService.fetchCart();
         }

         const count = cartData.length;
         const popUpHeading = $(".pop-header-heading");
         if (popUpHeading) {
            popUpHeading.textContent = `You have ${count} item${
               count !== 1 ? "s" : ""
            }`;
         }
      } catch (error) {
         console.error("Error rendering cart count:", error);
      }
   }

   renderTotalCart(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) {
         cartsProduct = [];
      }
      if (cartsProduct.length === 0) {
         this.subtotal = 0;
         this.finalTotal = 10;
      } else {
         this.subtotal = cartsProduct.reduce(
            (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
            0
         );
         const discount = this.subtotal * 0.1;
         const shipping = 10.0;
         this.finalTotal = this.subtotal - discount + shipping;
      }
      this.updateTotalUI();
      return this.finalTotal;
   }

   updateTotalUI() {
      // Cập nhật các element khác

      if (this.elements.totalPriceHeader) {
         if (!this.carts.length) {
            this.elements.totalPriceHeader.textContent = "$0.00";
            this.elements.actionCartTotal.textContent = "$0.00";
            return;
         }
         this.elements.totalPriceHeader.textContent = `$${this.finalTotal.toFixed(
            2
         )}`;
      }

      const subtotalElements = document.querySelectorAll(
         ".total-subtotal-price"
      );

      if (subtotalElements.length > 0) {
         if (!this.carts.length) {
            subtotalElements[0].textContent = "$0.00";
            subtotalElements[2].textContent = "$0.00";
            return;
         }
         subtotalElements[0].textContent = `$${this.finalTotal.toFixed(2)}`;
      }
      if (subtotalElements.length > 1) {
         subtotalElements[1].textContent = "Free";
      }
      if (subtotalElements.length > 2) {
         subtotalElements[2].textContent = "$10.00";
      }

      if (this.elements.actionCartTotal) {
         this.elements.actionCartTotal.textContent = `$${this.finalTotal.toFixed(
            2
         )}`;
      }

      if (this.elements.totalPriceText) {
         this.elements.totalPriceText.textContent = `$${this.finalTotal.toFixed(
            2
         )}`;
      }
   }

   renderTotalSubtotal(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) cartsProduct = [];

      const subtotalElements = $$(".total-subtotal-price");
      if (subtotalElements.length > 0) {
         subtotalElements[0].textContent = `$${this.subtotal.toFixed(2)}`;
      }
      if (subtotalElements.length > 1) {
         subtotalElements[1].textContent = "Free";
      }
      if (subtotalElements.length > 2) {
         subtotalElements[2].textContent = "$10.00";
      }
   }

   handleCartDisplay() {
      try {
         const cartData = [];
         if (this.products && this.products.length > 0) {
            const cartsProduct = this.products
               .filter((p) => cartData.some((c) => c.id === p.id))
               .map((p) => ({
                  ...p,
                  quantity: cartData.find((c) => c.id === p.id)?.quantity || 1,
               }));

            // Render tất cả UI components với cùng data
            this.renderCart(cartsProduct);
            this.renderCartCount(cartsProduct);
            this.renderTotalSubtotal(cartsProduct);
            this.renderTotalCart(cartsProduct);
         }
      } catch (error) {
         console.error("Error handling cart display:", error);
         showNotification("Không thể hiển thị giỏ hàng.", "error");
      }
   }

   async refreshCartUI() {
      try {
         // Fetch data một lần
         this.products = await this.apiService.getProducts();
         this.carts = await this.apiService.fetchCart();
         const cartsProduct = this.products
            .filter((p) => this.carts.some((c) => +c.id === +p.id))
            .map((p) => {
               const itemInCart = this.carts.find((c) => +c.id === +p.id);
               return {
                  ...p,
                  quantity: itemInCart?.quantity || 1,
                  price: itemInCart?.price || p.price, // Đảm bảo có giá
               };
            });

         // Render tất cả UI với cùng một data source
         this.renderCart(cartsProduct);
         this.renderCartCount(cartsProduct);
         this.renderTotalSubtotal(cartsProduct);

         // CHỈ GỌI MỘT LẦN để tính total
         this.renderTotalCart(cartsProduct);
      } catch (error) {
         console.error("Error refreshing cart UI:", error);
         showNotification("Không thể cập nhật giỏ hàng.", "error");
      }
   }

   // Loại bỏ method updateCartTotal() vì đã được tích hợp vào renderTotalCart()
   // async updateCartTotal() {
   //    // Method này đã được thay thế bởi renderTotalCart()
   // }

   setupCartPopupEvents() {
      const { cartBtn, cartPopup } = this.elements;
      if (cartBtn && cartPopup) {
         cartBtn.addEventListener("mouseenter", () => {
            cartPopup.style.display = "block";
         });
         cartBtn.addEventListener("mouseleave", () => {
            setTimeout(() => {
               if (!cartPopup.matches(":hover")) {
                  cartPopup.style.display = "none";
               }
            }, 200);
         });
         cartPopup.addEventListener("mouseleave", () => {
            cartPopup.style.display = "none";
         });
      } else {
         console.error("Cart button or popup not found in DOM");
         showNotification("Không tìm thấy nút giỏ hàng hoặc popup.", "error");
      }
   }

   // Method tiện ích để refresh toàn bộ cart
   async refreshAll() {
      await this.refreshCartUI();
   }

   // Method để clear cart
   clearCart() {
      this.renderCart([]);
      this.renderCartCount([]);
      this.renderTotalCart([]);
   }
}

export default CartManager;
