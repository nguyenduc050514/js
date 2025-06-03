const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

class ProductList {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.products = [];
      this.cart = [];
      this.elements = {
         productsList: $("#products-list"),
         actionWishCount: $("#action-wish__count"),
         totalPriceHeader: $(".total-price-header"),
         cartBtn: $(".action-wish.pop-up-cart"),
         cartPopup: $(".pop-up-cart-block"),
         actionCartList: $(".pop-list"),
         totalPriceText: $(".total-price-text"),
         totalSubtotalPrice: $(".total-subtotal-price"),
      };
   }

   async fetchCart() {
      try {
         const response = await fetch(`${this.API_BASE_URL}/carts`);
         if (!response.ok)
            throw new Error(`Failed to fetch cart: ${response.status}`);
         const data = await response.json();
         return Array.isArray(data) ? data : [];
      } catch (error) {
         console.error("Error fetching cart:", error);
         this.showErrorMessage("Không thể tải giỏ hàng từ server.");
         return JSON.parse(localStorage.getItem("cart")) || [];
      }
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
         this.showErrorMessage("Không tìm thấy danh sách giỏ hàng.");
      }
   }

   async renderCart(cartsProduct = []) {
      try {
         if (cartsProduct.length === 0) {
            this.cart = await this.fetchCart();
            this.renderCartHTML(this.cart);
         } else {
            this.renderCartHTML(cartsProduct);
         }
      } catch (error) {
         console.error("Error rendering cart:", error);
         this.renderCartHTML([]);
      }
   }

   renderCartCount(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) cartsProduct = [];

      const count = cartsProduct.reduce(
         (sum, item) => sum + (item.quantity || 1),
         0
      );
      const popUpHeading = $(".pop-header-heading");
      if (popUpHeading) {
         popUpHeading.textContent = `You have ${count} item${
            count !== 1 ? "s" : ""
         }`;
      }
   }

   renderTotalCart(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) cartsProduct = [];

      const subtotal = cartsProduct.reduce(
         (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
         0
      );
      const discount = subtotal * 0.1;
      const totalAfterDiscount = subtotal - discount;
      const shipping = totalAfterDiscount === 0 ? 0 : 10.0;
      const finalTotal = totalAfterDiscount + shipping;
      const subtotalElements = $$(".total-subtotal-price");
      if (subtotalElements.length > 0) {
         subtotalElements[0].textContent = `$${subtotal.toFixed(2)}`;
      }

      if (this.elements.totalPriceText) {
         this.elements.totalPriceText.textContent = `$${finalTotal.toFixed(2)}`;
      }
      if (this.elements.totalPriceHeader) {
         this.elements.totalPriceHeader.textContent = `$${
            finalTotal.toFixed(2) - 10
         }`;
      }
   }

   renderTotalSubtotal(cartsProduct = []) {
      if (!Array.isArray(cartsProduct)) cartsProduct = [];

      const subtotal = cartsProduct.reduce(
         (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
         0
      );
      const subtotalElements = $$(".total-subtotal-price");
      if (subtotalElements.length > 0) {
         subtotalElements[0].textContent = `$${subtotal.toFixed(2)}`;
      }
      if (subtotalElements.length > 1) {
         subtotalElements[1].textContent = "Free";
      }
      if (subtotalElements.length > 2) {
         subtotalElements[2].textContent = "$0.00";
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

   async getProducts() {
      try {
         const response = await fetch(`${this.API_BASE_URL}/products`);
         if (!response.ok) {
            throw new Error(
               `Response status: ${response.status} - ${await response.text()}`
            );
         }
         this.products = await response.json();
         if (!Array.isArray(this.products)) {
            throw new Error("Products data is not an array");
         }
         await this.initializeApp();
      } catch (error) {
         console.error("Error fetching products:", error.message);
         this.showErrorMessage(
            "Không thể tải sản phẩm. Vui lòng kiểm tra server."
         );
      }
   }

   async initializeApp() {
      try {
         this.products = await this.loadLikedProducts(
            this.products,
            this.elements.actionWishCount
         );
         this.renderProducts(this.products);
         this.handleCartDisplay();
         this.handleLoginStatus();
      } catch (error) {
         console.error("Error initializing app:", error.message);
         this.showErrorMessage(
            "Không thể khởi tạo ứng dụng. Vui lòng kiểm tra server."
         );
      }
   }

   renderProducts(products = []) {
      if (!this.elements.productsList) {
         console.error("Products list element not found");
         this.showErrorMessage("Không tìm thấy danh sách sản phẩm.");
         return;
      }

      const html = products
         .map(
            ({ id, name, brand, price, rating, image, liked }) => `
            <a data-product="${id}" href="./pages/detail.html?id=${id}" class="products-item">
                <figure class="products-image">
                    <img src="${image}" alt="${name}" class="products-img" />
                    <div class="products-wish" id="products-wish">
                        <img src="./assets/icons/${
                           liked ? "heart-red" : "heart"
                        }.svg" class="products-wish-svg" alt="wishlist" />
                    </div>
                </figure>
                <div class="products-info">
                    <h2 class="products-title">${name}</h2>
                    <p class="products-brand">${brand}</p>
                    <div class="products-cart">
                        <span class="products-price">$${price}</span>
                        <span class="products-rating">
                            <img src="./assets/icons/star.svg" alt="rating" />
                            ${rating}
                        </span>
                    </div>
                </div>
            </a>`
         )
         .join("");
      this.elements.productsList.innerHTML = html;
   }

   async handleWishlistToggle(e) {
      if (!e.target.closest(".products-wish")) return;

      e.preventDefault();
      e.stopPropagation();
      const productsItem = e.target.closest(".products-item");
      if (!productsItem) {
         console.error("Products item not found");
         this.showErrorMessage("Không tìm thấy sản phẩm.");
         return;
      }

      const productId = Number(productsItem.dataset.product);
      if (!productId) {
         console.error("Product ID not found in dataset");
         this.showErrorMessage("Không tìm thấy ID sản phẩm.");
         return;
      }

      const productIndex = this.products.findIndex((p) => +p.id === +productId);
      if (productIndex === -1) {
         console.error(`Product with ID ${productId} not found`);
         this.showErrorMessage("Sản phẩm không tồn tại.");
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
         await this.saveLikedProducts(
            this.products,
            this.elements.actionWishCount
         );
      } catch (error) {
         product.liked = originalLiked;
         if (heartSvg) {
            heartSvg.src = product.liked
               ? "./assets/icons/heart-red.svg"
               : "./assets/icons/heart.svg";
         }
         this.showErrorMessage(
            "Không thể cập nhật danh sách yêu thích. Vui lòng kiểm tra server."
         );
      }
   }

   async saveLikedProducts(products, actionWishCount) {
      try {
         const likedProducts = products.filter((p) => p.liked).map((p) => p.id);
         let likedProductsExists = false;
         try {
            const checkResponse = await fetch(
               `${this.API_BASE_URL}/likedProducts`
            );
            likedProductsExists = checkResponse.ok;
         } catch {
            console.log(
               "Endpoint /likedProducts does not exist yet, will create it."
            );
         }

         const method = likedProductsExists ? "PUT" : "POST";
         const response = await fetch(`${this.API_BASE_URL}/likedProducts`, {
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

         if (actionWishCount) {
            actionWishCount.textContent = likedProducts.length;
         }
         return products;
      } catch (error) {
         console.error("Error saving liked products to server:", error.message);
         if (actionWishCount) {
            actionWishCount.textContent = products.filter(
               (p) => p.liked
            ).length;
         }
         throw error;
      }
   }

   async loadLikedProducts(products, actionWishCount) {
      try {
         const likedResponse = await fetch(
            `${this.API_BASE_URL}/likedProducts`
         );
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

         products.forEach((p) => {
            p.liked = likedProductIds.includes(p.id);
         });

         if (actionWishCount) {
            actionWishCount.textContent = likedProductIds.length;
         }

         console.log("Successfully loaded liked products from server");
         return products;
      } catch (error) {
         console.error(
            "Error loading liked products from server:",
            error.message
         );
         if (actionWishCount) {
            actionWishCount.textContent = products.filter(
               (p) => p.liked
            ).length;
         }
         return products;
      }
   }

   handleCartDisplay() {
      try {
         const cartData = JSON.parse(localStorage.getItem("cart")) || [];
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
         this.showErrorMessage("Không thể hiển thị giỏ hàng.");
      }
   }

   async refreshCartUI() {
      try {
         this.cart = await this.fetchCart();
         const cartsProduct = this.products
            .filter((p) => this.cart.some((c) => +c.id === +p.id))
            .map((p) => {
               const itemInCart = this.cart.find((c) => +c.id === +p.id);
               return { ...p, quantity: itemInCart?.quantity || 1 };
            });

         this.renderCart(cartsProduct);
         this.renderCartCount(cartsProduct);
         this.renderTotalSubtotal(cartsProduct);
         this.renderTotalCart(cartsProduct);
      } catch (error) {
         console.error("Error refreshing cart UI:", error);
         this.showErrorMessage("Không thể cập nhật giỏ hàng.");
      }
   }

   async updateCartTotal() {
      try {
         const total = this.cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
         );
         const discountedTotal = total * 0.9;
         if (this.elements.totalPriceHeader) {
            this.elements.totalPriceHeader.textContent = `$${discountedTotal.toFixed(
               2
            )}`;
         }
      } catch (error) {
         console.error("Error updating cart total:", error);
         this.showErrorMessage("Không thể cập nhật tổng giỏ hàng.");
      }
   }

   handleLoginStatus() {
      try {
         const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
         const action = $(".action");
         const actionProfile = $(".action-profile");
         const user = $(".user");

         if (action && actionProfile && user) {
            action.style.display = "block";
            user.style.display = isLoggedIn ? "block" : "none";
            actionProfile.style.display = isLoggedIn ? "none" : "flex";
         }
      } catch (error) {
         console.error("Error handling login status:", error);
         this.showErrorMessage("Không thể kiểm tra trạng thái đăng nhập.");
      }
   }

   showErrorMessage(message) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.textContent = message;
      errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
        `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 5000);
   }

   setupEventListeners() {
      if (this.elements.productsList) {
         this.elements.productsList.addEventListener("click", (e) =>
            this.handleWishlistToggle(e)
         );
      }

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
         this.showErrorMessage("Không tìm thấy nút giỏ hàng hoặc popup.");
      }
   }

   async init() {
      try {
         await this.getProducts();
         this.cart = await this.fetchCart();
         await this.refreshCartUI();
         this.handleLoginStatus();
         this.setupEventListeners();
      } catch (error) {
         console.error("Error initializing page:", error);
         this.showErrorMessage("Không thể khởi tạo trang.");
      }
   }
}

document.addEventListener("DOMContentLoaded", () => {
   const productList = new ProductList();
   productList.init();
});
