import { showErrorMessage } from "./ui-utils.js";

export class CartManager {
   constructor(app) {
      this.app = app;
   }

   renderCartHTML(products) {
      if (!products || !Array.isArray(products)) {
         products = [];
      }

      const html =
         products.length > 0
            ? products
                 .map(({ image, price, name, quantity = 1 }) => {
                    const totalPrice = (price * quantity).toFixed(2);
                    return `
                        <li class="pop-item">
                            <img src="${image}" alt="${name}" class="pop-item-img" />
                            <p class="pop-item-price">$${totalPrice} (${quantity}x)</p>
                        </li>
                    `;
                 })
                 .join("")
            : `<li class="pop-item empty">Your cart is empty</li>`;

      if (this.app.actionCartList) {
         this.app.actionCartList.innerHTML = html;
      } else {
         console.error("Cart list element not found");
         showErrorMessage("Không tìm thấy danh sách giỏ hàng.");
      }
   }

   async renderCart(cartsProduct = []) {
      try {
         if (cartsProduct.length === 0) {
            this.app.cart = await this.app.apiService.fetchCart();
            this.renderCartHTML(this.app.cart);
         } else {
            this.renderCartHTML(cartsProduct);
         }
      } catch (error) {
         console.error("Error rendering cart:", error);
         this.renderCartHTML([]);
      }
   }

   renderCartCount(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) {
         cartsProduct = [];
      }

      const count = cartsProduct.reduce(
         (sum, item) => sum + (item.quantity || 1),
         0
      );
      const popUpHeading = document.querySelector(".pop-header-heading");
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

      const subtotal = cartsProduct.reduce(
         (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
         0
      );

      const discount = subtotal * 0.1;
      const shipping = 10.0;
      const finalTotal = subtotal - discount + shipping;

      const subtotalElements = document.querySelectorAll(
         ".total-subtotal-price"
      );
      if (subtotalElements.length > 0) {
         subtotalElements[0].textContent = `$${subtotal.toFixed(2)}`;
      }
      if (subtotalElements.length > 1) {
         subtotalElements[1].textContent = "Free";
      }
      if (subtotalElements.length > 2) {
         subtotalElements[2].textContent = "$10.00";
      }

      if (this.app.totalPriceText) {
         this.app.totalPriceText.textContent = `$${finalTotal.toFixed(2)}`;
      }
      if (this.app.totalPriceHeader) {
         this.app.totalPriceHeader.textContent = `$${finalTotal.toFixed(2)}`;
      }
   }

   renderTotalSubtotal(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) {
         cartsProduct = [];
      }

      const subtotal = cartsProduct.reduce(
         (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
         0
      );

      const subtotalElements = document.querySelectorAll(
         ".total-subtotal-price"
      );
      if (subtotalElements.length > 0) {
         subtotalElements[0].textContent = `$${subtotal.toFixed(2)}`;
      }
      if (subtotalElements.length > 1) {
         subtotalElements[1].textContent = "Free";
      }
      if (subtotalElements.length > 2) {
         subtotalElements[2].textContent = "$10.00";
      }
   }

   renderCartCountOnDetail(
      totalCart = 0,
      cartElement = null,
      sale = 0.1,
      shipping = 10
   ) {
      if (!cartElement) return;

      if (totalCart <= 0) {
         cartElement.textContent = "$0.00";
         return;
      }
      const discount = totalCart * sale;
      const finalPrice = totalCart - discount + shipping;
      cartElement.textContent = `$${finalPrice.toFixed(2)}`;
   }

   handleCartDisplay() {
      try {
         const cartData = JSON.parse(localStorage.getItem("cart")) || [];
         if (this.app.products && this.app.products.length > 0) {
            const cartsProduct = this.app.products
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
         showErrorMessage("Không thể hiển thị giỏ hàng.");
      }
   }

   async refreshCartUI() {
      try {
         this.app.cart = await this.app.apiService.fetchCart();
         const cartsProduct = this.app.products
            .filter((p) => this.app.cart.some((c) => +c.id === +p.id))
            .map((p) => {
               const itemInCart = this.app.cart.find((c) => +c.id === +p.id);
               return {
                  ...p,
                  quantity: itemInCart?.quantity || 1,
               };
            });

         this.renderCart(cartsProduct);
         this.renderCartCount(cartsProduct);
         this.renderTotalSubtotal(cartsProduct);
         this.renderTotalCart(cartsProduct);
      } catch (error) {
         console.error("Error refreshing cart UI:", error);
         showErrorMessage("Không thể cập nhật giỏ hàng.");
      }
   }

   async updateCartTotal() {
      try {
         const total = this.app.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
         );
         const discountedTotal = total * 0.9;
         if (this.app.totalPriceHeader) {
            this.app.totalPriceHeader.textContent = `$${discountedTotal.toFixed(
               2
            )}`;
         }
      } catch (error) {
         console.error("Error updating cart total:", error);
         showErrorMessage("Không thể cập nhật tổng giỏ hàng.");
      }
   }
}
