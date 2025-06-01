export class Product {
   constructor({ id, name, brand, price, rating, image, liked = false }) {
      this.id = id;
      this.name = name;
      this.brand = brand;
      this.price = price;
      this.rating = rating;
      this.image = image;
      this.liked = liked;
   }
}

export class CartItem {
   constructor(product, quantity = 1) {
      this.product = product;
      this.quantity = quantity;
   }

   get totalPrice() {
      return this.product.price * this.quantity;
   }
}

export class Cart {
   constructor() {
      this.items = [];
   }

   addProduct(product, quantity = 1) {
      const existing = this.items.find(
         (item) => item.product.id === product.id
      );
      if (existing) {
         existing.quantity += quantity;
      } else {
         this.items.push(new CartItem(product, quantity));
      }
   }

   removeProduct(productId) {
      this.items = this.items.filter((item) => item.product.id !== productId);
   }

   updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.product.id === productId);
      if (item) {
         item.quantity = quantity > 0 ? quantity : 1;
      }
   }

   get totalQuantity() {
      return this.items.reduce((sum, item) => sum + item.quantity, 0);
   }

   get subtotal() {
      return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
   }

   get discount() {
      return this.subtotal * 0.1;
   }

   get shipping() {
      return this.subtotal > 0 ? 10 : 0;
   }

   get finalTotal() {
      return this.subtotal - this.discount + this.shipping;
   }

   loadFromLocalStorage() {
      const data = JSON.parse(localStorage.getItem("cart")) || [];
      this.items = data.map(({ product, quantity }) => {
         return new CartItem(new Product(product), quantity);
      });
   }

   saveToLocalStorage() {
      const data = this.items.map(({ product, quantity }) => ({
         product,
         quantity,
      }));
      localStorage.setItem("cart", JSON.stringify(data));
   }
}
