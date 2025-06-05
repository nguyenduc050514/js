import ApiService from "../apis/api-service.js";
import { showNotification } from "../utils/ui-utils.js";
import { handleLoginStatus } from "../auth/auth.js";
import CartManager from "../common/cart-manager.js";
import Modal from "../common/modal.js";
import idGenerator from "../common/generator.js";
import { start24HourCountdown, getTimeAfter24Hours } from "../common/time.js";
const $ = document.querySelector.bind(document);
class Checkout {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.apiService = new ApiService(this.API_BASE_URL);
      this.cartManager = new CartManager();
      this.handleLoginStatus = handleLoginStatus;
      this.cart = [];
      this.likedResponse = [];
      this.openModal = new Modal();
      this.idGenerator = idGenerator;
      this.start24HourCountdown = start24HourCountdown;
      this.getTimeAfter24Hours = getTimeAfter24Hours;
      this.elements = {
         addCartText: $(".total-price-header"),
         cartBtn: $(".action-wish.pop-up-cart"),
         cartPopup: $(".pop-up-cart-block"),
         actionWishCount: $("#action-wish__count"),
         cartList: $(".products"),
         cartCount: $(".cart-count"),
         cartPrice: $(".cart-price"),
         cartTotal: $(".cart-total"),
         btnPayment: $(".checkout-pay"),
      };
   }

   async renderCartItems() {
      if (!this.elements.cartList) {
         showNotification("Không tìm thấy danh sách giỏ hàng");
         return;
      }

      const html = this.cart
         ?.map(
            ({ id, image, name, price, quantity, categories }) =>
               `     <div class="products-item" data-id=${id}>
                     <figure>
                        <img src=${image} alt="" class="products-image"/>
                     </figure>
                     <div class="products-info">
                        <div class="products-title">
                           <h3 class="products-name">
                             ${name}
                           </h3>
                           <div class="products-price">$${price}</div>
                        </div>
                        <p class="products-price__text">
                           $${price} |
                           <span class="products-stock"> In Stock </span>
                        </p>
                        <div class="products-bottom">
                           <div class="products-left">
                              <div class="products-cate">${categories}</div>
                              <div class="products-quantity">
                                 <img
                                    src="../assets/icons/minus.svg"
                                    alt=""
                                    style="cursor: pointer"
                                    class="minus"
                                 />
                                 <span class="quantity">${quantity}</span>
                                 <img
                                    src="../assets/icons/plus.svg"
                                    alt=""
                                    style="cursor: pointer"
                                    class="plus"
                                 />
                              </div>
                           </div>
                           <div class="products-right">
                              <div class="products-save">
                                 <img src="../assets/icons/${
                                    this.likedResponse.includes(id)
                                       ? "heart-red"
                                       : "heart"
                                 }.svg" alt="" />
                                 Save
                              </div>
                              <div class="products-delete">
                                 <img src="../assets/icons/delete.svg" alt="" />
                                 Delete
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>`
         )
         .join(" ");
      this.elements.cartList.innerHTML = html;
   }

   async initializeApp() {
      try {
         this.products = await this.apiService.getProducts();
         const likedProductIds = await this.apiService.loadLikedProducts();
         this.cart = await this.apiService.fetchCart();
         this.likedResponse = await this.apiService.loadLikedProducts();

         this.renderCartItems();
         this.products.forEach((p) => {
            p.liked = likedProductIds.includes(p.id);
         });
         if (this.elements.actionWishCount) {
            this.elements.actionWishCount.textContent = likedProductIds.length;
         }
         this.handleLoginStatus();
         this.elements.cartCount.textContent = this.cart.length;
         const subtotal = this.cartManager.renderTotalCart(this.cart);
         this.elements.cartPrice.textContent = (subtotal - 10).toFixed(2);
         if (!this.cart.length) {
            this.elements.cartTotal.textContent = "$0";
            return;
         }
         this.elements.cartTotal.textContent = subtotal;
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
         this.setupEventListeners();
      } catch (error) {
         console.error("Error initializing page:", error);
         showNotification("Không thể khởi tạo trang.");
      }
   }

   setupEventListeners() {
      if (this.elements.cartList) {
         this.elements.cartList.addEventListener("click", async (e) => {
            const productItem = e.target.closest(".products-item");
            const cartId = productItem.dataset.id;
            if (!productItem) {
               console.error("Not found");
               return;
            }
            const idCart = productItem?.dataset.id;
            if (e.target.closest(".products-delete")) {
               this.handleDeleteCart(idCart, e);
               return;
            }

            if (e.target.closest(".minus")) {
               const elementMinus = e.target.nextElementSibling;
               if (elementMinus.textContent === "1") {
                  showNotification("Giá trị min là 1 rồi", "warning");
                  return;
               }
               const product = this.cart.find((c) => +c.id === +cartId);
               const quantity = --product.quantity;
               const res = await fetch(`${this.API_BASE_URL}/carts/${idCart}`, {
                  method: "PATCH",
                  headers: {
                     "Content-Type": "application-json",
                  },
                  body: JSON.stringify({ quantity }),
               });
               console.log(res);

               return;
            }

            if (e.target.closest(".plus")) {
               const product = this.cart.find((c) => +c.id === +cartId);
               const quantity = ++product.quantity;
               const res = await fetch(`${this.API_BASE_URL}/carts/${idCart}`, {
                  method: "PATCH",
                  headers: {
                     "Content-Type": "application-json",
                  },
                  body: JSON.stringify({ quantity }),
               });
               console.log(quantity);
               return;
            }
         });
      }
      if (this.elements.btnPayment) {
         this.elements.btnPayment.addEventListener(
            "click",
            this.handlePaymentCart.bind(this)
         );
      }

      this.cartManager.setupCartPopupEvents();
   }

   handleDeleteCart(id, e) {
      const modal = this.openModal.open({ templateId: "deleteModal" });
      const confirmDelete = modal.querySelector("#confirmDelete");
      const cancelDelete = modal.querySelector("#cancelDelete");
      confirmDelete.onclick = async () => {
         const response = await fetch(`${this.API_BASE_URL}/carts/${id}`, {
            method: "delete",
            headers: {
               "Content-Type": "application/json",
            },
         });
      };
      cancelDelete.onclick = () => {
         this.openModal.close(modal);
      };
   }

   handlePaymentCart() {
      const modal = this.openModal.open({ templateId: "payment" });
      const paymentList = modal.querySelector(".payment-list");
      const voucherText = modal.querySelector(".voucher-text");
      const paymentTotalPrice = modal.querySelector(".payment-total-price");
      const voucherInput = modal.querySelector(".voucher-input");
      const paymentUse = modal.querySelector(".payment-use");
      const continuePay = modal.querySelector(".continue-pay");

      const html = this.cart.length
         ? this.cart
              .map(
                 ({ name, price, quantity }) => `
         <div class="payment-item">
               <h1 class="payment-title">${name}</h1>
               <p class="payment-price">$${price * quantity}</p>
            </div>`
              )
              .join(" ")
         : `<div>Giỏ hàng trống</div>`;
      paymentList.innerHTML = html;
      !this.cart.length
         ? (paymentTotalPrice.textContent = `$0.00`)
         : (paymentTotalPrice.textContent = `$${this.cartManager.renderTotalCart(
              this.cart
           )}`);
      paymentUse.onclick = () => {
         if (!voucherInput.value.trim()) {
            showNotification("Chưa có voucher nào được sử dụng", "error");
            return;
         }
         paymentTotalPrice.textContent = `$${(
            this.cartManager.renderTotalCart(this.cart) - 50
         ).toFixed(2)}`;
      };
      voucherText.onclick = async () => {
         if (this.cart.length < 3) {
            showNotification(
               "Mã đơn hàng được kích hoạt khi người dùng mua 3 mặt hàng trở lên",
               "warning"
            );
            return;
         }
         const modalChild = this.openModal.open({ templateId: "voucherId" });
         const voucher = this.idGenerator();
         const voucherCode = modalChild.querySelector(".voucher-code");
         const voucherTime = modalChild.querySelector("#voucher-time");
         const After24Hours = modalChild.querySelector("#After24Hours");
         const useBtnVoucher = modalChild.querySelector(".use-btn");
         voucherCode.textContent = voucher;
         this.start24HourCountdown(voucherTime);
         const getTimer = this.getTimeAfter24Hours();
         console.log(getTimer);
         After24Hours.textContent = getTimer?.after24Hours;
         useBtnVoucher.onclick = () => {
            voucherInput.value = voucher;
            this.openModal.close(modalChild);
         };
         const voucherDb = {
            voucher,
            date: 24,
         };
         localStorage.setItem("voucher", JSON.stringify(voucherDb));
      };
      continuePay.onclick = async () => {
         if (!this.cart.length) {
            showNotification("Không có sản phẩm nào ở giỏ hàng", "error");
            this.openModal.close(modal);
            return;
         }
         const res = await fetch(`${this.API_BASE_URL}/carts`);
         const cartItems = await res.json();
         showNotification("Đã thanh toán thành công");
         setTimeout(() => {
            for (const cart of cartItems) {
               fetch(`${this.API_BASE_URL}/carts/${cart.id}`, {
                  method: "DELETE",
               });
            }
         }, 2000);
         this.openModal.close(modal);
      };
   }
}

document.addEventListener("DOMContentLoaded", () => {
   const checkout = new Checkout();
   checkout.init();
});
