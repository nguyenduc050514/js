const API_BASE_URL = "http://localhost:5000";

export async function fetchProducts() {
   const res = await fetch(`${API_BASE_URL}/products`);
   if (!res.ok) throw new Error("Failed to fetch products");
   return await res.json();
}

export async function loadLikedProducts() {
   const res = await fetch(`${API_BASE_URL}/likedProducts`);
   if (!res.ok) throw new Error("Failed to load liked products");
   const data = await res.json();
   return Array.isArray(data.ids) ? data.ids : [];
}

export async function saveLikedProducts(ids) {
   await fetch(`${API_BASE_URL}/likedProducts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
   });
}
