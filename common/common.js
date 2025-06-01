const $ = document.querySelector.bind(document);
const API_BASE_URL = "http://localhost:5000";

const actionCartList = $(".pop-list");

async function fetchCart() {
   try {
      const response = await fetch(`${API_BASE_URL}/carts`);
      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();
      return Array.isArray(data) ? data : [];
   } catch (error) {
      console.error("Error fetching cart:", error);
      return [];
   }
}

function renderCartHTML(products) {
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

   if (actionCartList) {
      actionCartList.innerHTML = html;
   }
}


function renderCartCountOnDetail(
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

async function updateCartQuantity(productId, newQuantity) {
   try {
      if (newQuantity <= 0) {
         await removeFromCart(productId);
         return;
      }

      await fetch(`${API_BASE_URL}/carts/${productId}`, {
         method: "PATCH",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ quantity: newQuantity }),
      });
   } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
   }
}

async function removeFromCart(productId) {
   try {
      const response = await fetch(`${API_BASE_URL}/carts/${productId}`, {
         method: "DELETE",
      });

      if (!response.ok) {
         throw new Error("Failed to remove item from cart");
      }
   } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
   }
}
async function clearCart() {
   try {
      const response = await fetch(`${API_BASE_URL}/carts`, {
         method: "DELETE",
      });

      if (!response.ok) {
         throw new Error("Failed to clear cart");
      }
   } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
   }
}

function getCartTotalCount(cartsProduct = []) {
   if (!Array.isArray(cartsProduct)) {
      return 0;
   }

   return cartsProduct.reduce((sum, item) => sum + (item.quantity || 1), 0);
}
function getCartTotalPrice(cartsProduct = [], withDiscount = true) {
   if (!Array.isArray(cartsProduct)) {
      return 0;
   }

   const subtotal = cartsProduct.reduce(
      (acc, { price = 0, quantity = 1 }) => acc + price * quantity,
      0
   );

   if (withDiscount) {
      return subtotal * 0.9; // Apply 10% discount
   }

   return subtotal;
}

export {
   renderCart,
   renderCartCount,
   renderTotalSubtotal,
   renderTotalCart,
   renderCartCountOnDetail,
   fetchCart,
   updateCartQuantity,
   removeFromCart,
   clearCart,
   getCartTotalCount,
   getCartTotalPrice,
};
