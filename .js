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
            this.cart = await this.apiService.fetchCart();
            this.renderCartHTML(this.cart);
         } else {
            this.renderCartHTML(cartsProduct);
         }
      } catch (error) {
         console.error("Error rendering cart:", error);
         this.renderCartHTML([]);
      }
   }

   async renderCartCount(cartsProduct = []) {
      this.cart = await this.apiService.fetchCart();
      if (!Array.isArray(cartsProduct)) cartsProduct = [];

      const count = this.cart.length;
      const popUpHeading = $(".pop-header-heading");
      if (popUpHeading) {
         popUpHeading.textContent = `You have ${count} item${
            count !== 1 ? "s" : ""
         }`;
      }
   }

   renderTotalCart(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) {
         cartsProduct = [];
      }

      this.subtotal = cartsProduct.reduce(
         (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
         0
      );
      const discount = this.subtotal * 0.1;
      const shipping = 10.0;
      this.finalTotal = this.subtotal - discount + shipping;

      const subtotalElements = document.querySelectorAll(
         ".total-subtotal-price"
      );
      if (subtotalElements.length > 0) {
         subtotalElements[0].textContent = `$${this.finalTotal.toFixed(2)}`;
      }
      if (subtotalElements.length > 1) {
         subtotalElements[1].textContent = "Free";
      }
      if (subtotalElements.length > 2) {
         subtotalElements[2].textContent = "$10.00";
      }
      console.log(this.finalTotal);

      if (this.elements.totalPriceText) {
         this.elements.totalPriceText.textContent = `$${this.finalTotal.toFixed(
            2
         )}`;
      }
      if (this.elements.totalPriceHeader) {
         this.elements.totalPriceHeader.textContent = `$${this.finalTotal.toFixed(
            2
         )}`;
      }
      return this.finalTotal;
   }

   renderTotalSubtotal(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) cartsProduct = [];

      const subtotalElements = $$(".total-subtotal-price");
      if (subtotalElements.length > 0) {
         subtotalElements[0].textContent = `$${this.finalTotal.toFixed(2)}`;
      }
      if (subtotalElements.length > 1) {
         subtotalElements[1].textContent = "Free";
      }
      if (subtotalElements.length > 2) {
         subtotalElements[2].textContent = "$0.00";
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
      this.products = await this.apiService.getProducts();
      this.cart = await this.apiService.fetchCart();
      try {
         const cartsProduct = this.products
            .filter((p) => this.cart.some((c) => +c.id === +p.id))
            .map((p) => {
               const itemInCart = this.cart.find((c) => +c.id === +p.id);
               return { ...p, quantity: itemInCart?.quantity || 1 };
            });

         this.renderCart(cartsProduct);
         this.renderCartCount(cartsProduct);
         this.renderTotalSubtotal(cartsProduct);
         this.updateCartTotal();
         this.renderTotalCart(cartsProduct, this.elements.addCartText);
      } catch (error) {
         console.error("Error refreshing cart UI:", error);
         showNotification("Không thể cập nhật giỏ hàng.", "error");
      }
   }

   async updateCartTotal() {
      this.cart = await this.apiService.fetchCart();
      try {
         const total = this.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
         );
         const discountedTotal = total * 0.9;
         if (this.elements.actionCartTotal) {
            this.elements.actionCartTotal.textContent = `$${discountedTotal.toFixed(
               2
            )}`;
         }
      } catch (error) {
         console.error("Error updating cart total:", error);
         showNotification("Không thể cập nhật tổng giỏ hàng.", "error");
      }
   }

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
}
export default CartManager;
