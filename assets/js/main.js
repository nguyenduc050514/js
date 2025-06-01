import { Product, Cart } from "./models.js";
import { fetchProducts, loadLikedProducts, saveLikedProducts } from "./api.js";
import { renderProducts, renderCart, showErrorMessage } from "./ui.js";

const productsList = document.querySelector("#products-list");
const actionWishCount = document.querySelector("#action-wish__count");
const actionCartList = document.querySelector(".pop-list");
const totalPriceText = document.querySelector(".total-price-text");
const totalPriceHeader = document.querySelector(".total-price-header");
const popUpHeading = document.querySelector(".pop-header-heading");

let products = [];
let cart = new Cart();

async function init() {
   try {
      const productData = await fetchProducts();
      products = productData.map((p) => new Product(p));

      const likedIds = await loadLikedProducts();
      products.forEach((p) => {
         p.liked = likedIds.includes(p.id);
      });
      actionWishCount.textContent = likedIds.length;

      renderProducts(products, productsList);

      cart.loadFromLocalStorage();
      renderCart(
         cart,
         actionCartList,
         popUpHeading,
         totalPriceText,
         totalPriceHeader
      );

      initEvents();
   } catch (err) {
      console.error(err);
      showErrorMessage("Không thể khởi tạo ứng dụng");
   }
}

function initEvents() {
   if (productsList) {
      productsList.addEventListener("click", handleWishlistToggle);
   }
   // Nếu có nút thêm vào giỏ thì xử lý thêm ở đây
}

function handleWishlistToggle(e) {
   const wishBtn = e.target.closest(".products-wish");
   if (!wishBtn) return;

   e.preventDefault();

   const productEl = e.target.closest(".products-item");
   if (!productEl) return;

   const productId = Number(productEl.dataset.id);
   const product = products.find((p) => p.id === productId);
   if (!product) return;

   product.liked = !product.liked;
   renderProducts(products, productsList);

   const likedIds = products.filter((p) => p.liked).map((p) => p.id);
   saveLikedProducts(likedIds).catch(() => {
      showErrorMessage("Không thể cập nhật danh sách yêu thích.");
   });

   actionWishCount.textContent = likedIds.length;
}

document.addEventListener("DOMContentLoaded", init);
