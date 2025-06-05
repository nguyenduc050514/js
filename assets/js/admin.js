import Modal from "./common/modal.js";
import ApiService from "./apis/api-service.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const API_BASE_URL = "http://localhost:5000";
const navItem = $$(".nav-item");
const wrapperHeader = $(".wrapper-header");
const catWrapper = $(".cat-wrapper");
const coffeeDashboard = $(".coffee-dashboard");
const btnPrimary = $(".btn-primary");
const categoryFilter = $("#categoryFilter");
const searchInput = $("#searchInput");
const productTableBody = $("#productTableBody");
const catBtnAdd = $(".cat-btn-add");

const apiService = new ApiService(API_BASE_URL);
const products = await apiService.getProducts();
const categories = await apiService.getCategories();

[...navItem].forEach((i) =>
   i.addEventListener("click", (e) => {
      // Remove active class from all nav links
      $$(".nav-item").forEach((link) => {
         link.classList.remove("active");
      });
      e.target.classList.add("active");

      // Handle Products navigation
      if (e.target.textContent.trim().includes("Products")) {
         renderProducts(products);
         catWrapper.style.display = "none";
         coffeeDashboard.style.display = "none";
         wrapperHeader.style.display = "block";
         return;
      }

      // Handle Categories navigation
      if (e.target.textContent.trim().includes("Categories")) {
         renderCategories();
         wrapperHeader.style.display = "none";
         coffeeDashboard.style.display = "none";
         catWrapper.style.display = "block";
         return;
      }

      // Handle Dashboard navigation
      if (e.target.textContent.trim().includes("Dashboard")) {
         coffeeDashboard.style.display = "block";
         wrapperHeader.style.display = "none";
         catWrapper.style.display = "none";
         return;
      }
   })
);

function renderProducts(products) {
   const tbody = document.getElementById("productTableBody");
   if (!tbody) return;

   tbody.innerHTML = "";

   if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No products available</td></tr>`;
      return;
   }

   const html = products
      .map(
         (product) => `
        <tr class="product-item" data-product="${product.id}">
            <td>
                <div class="item-cell">
                    <div class="item-image">
                         <img src="${product.image}" alt="${
            product.name
         }" class="product-img" />
                    </div>
                     <div class="item-info">
                            <h3>${product.name}</h3>
                        </div>
                </div>
            </td>
            <td>${product.categories}</td>
            <td class="price">$${product.price.toFixed(2)}</td>
            <td>
                <div class="actions">
                    <a href="detail.html?id=${
                       product.id
                    }" class="btn-action btn-view" title="View">
                        <i class="fas fa-eye"></i>
                    </a>
                   <a href="#!" class="btn-action btn-edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </a>
                   <a href="#!" class="btn-action btn-delete" title="Delete" data-name="${
                      product.name
                   }">
                         <i class="fas fa-trash"></i>
                    </a>
                </div>
            </td>
        </tr>
    `
      )
      .join("");
   tbody.innerHTML = html;
}

function renderCategories() {
   const tbody = document.getElementById("categoryTableBody");
   if (!tbody) return;
   tbody.innerHTML = "";
   const html = categories
      .map(
         (c) => `
            <tr data-category="${c.id}" class="category-item">
                <td>
                   <img src="${c.image}" alt="${c.name}" class="cat-img" />
                </td>
                <td>${c.name}</td>
                <td>${c.description}</td>
                <td>${c.products}</td>
                <td>
                    <button class="cat-btn-icon edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="cat-btn-icon delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
    `
      )
      .join("");
   tbody.innerHTML = html;
}

catBtnAdd.addEventListener("click", (e) => {
   const modal = new Modal();
   const modalForm = modal.open({ templateId: "addCategories" });
   const addCategoriesForm = modalForm.querySelector("#addCategoriesForm");
   if (!addCategoriesForm) return;
   addCategoriesForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const categoryImage = modalForm.querySelector("#categoryImage");
      const categoryName = modalForm.querySelector("#categoryName");
      const categoryDesc = modalForm.querySelector("#categoryDesc");
      const categoryCount = modalForm.querySelector("#categoryCount");
      if (!categoryCount || !categoryImage || !categoryDesc || !categoryName) {
         console.error("Not found ");
         return;
      }
      const img = categoryImage.value.trim();
      const name = categoryName.value.trim();
      const desc = categoryDesc.value.trim();
      const count = categoryCount.value.trim();
      categories.push({
         id: categories.length + 1,
         name,
         image: img,
         description: desc,
         products: count,
      });
      localStorage.setItem("categories", JSON.stringify(categories));
      renderCategories();
      modal.close(modalForm);
      addCategoriesForm.reset();
   });
});

categoryTableBody.addEventListener("click", (e) => {
   const categoryItem = e.target.closest(".category-item");
   const id = +categoryItem?.dataset.category;
   const categoryIndex = categories.findIndex((c) => c.id === id);
   const deleteBtn = e.target.closest(".cat-btn-icon.delete");
   if (!deleteBtn) {
      console.error("Not found deleteBtn");
      return;
   }
   if (confirm("Are you sure delete")) {
      categories.splice(categoryIndex, 1);
      renderCategories();
      localStorage.setItem("categories", JSON.stringify(categories));
   }
});

renderProducts(products);
if (btnPrimary) {
   btnPrimary.addEventListener("click", () => {
      const modal = new Modal();
      const modalForm = modal.open({ templateId: "addProductModal" });
      const addProductForm = modalForm.querySelector("#addProductForm");
      if (addProductForm) {
         addProductForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = modalForm.querySelector("#productName").value.trim();
            const category = modalForm.querySelector("#productCategory").value;
            const price = parseFloat(
               modalForm.querySelector("#productPrice").value
            );
            const imageInput = modalForm.querySelector("#productImage");
            const rating = parseFloat(
               modalForm.querySelector("#productRating").value
            );

            if (
               !name ||
               !category ||
               isNaN(price) ||
               !imageInput.value ||
               !rating
            ) {
               alert("Vui lòng điền đầy đủ thông tin sản phẩm.");
               return;
            }

            const newProduct = {
               id: products.length + 1,
               name,
               categories: category,
               price,
               image: imageInput.value,
               rating,
            };

            products.push(newProduct);
            try {
               localStorage.setItem("products", JSON.stringify(products));
            } catch (e) {
               console.warn("localStorage not available");
            }
            renderProducts(products);
            modal.close(modalForm);
            addProductForm.reset();
         });
      }
   });
}

if (productTableBody) {
   productTableBody.addEventListener("click", (e) => {
      const productItem = e.target.closest(".product-item");
      if (!productItem) return;

      const idProduct = +productItem?.dataset.product;
      if (!idProduct) return;

      const product = products.find((p) => p.id === idProduct);
      if (!product) return;

      // Handle delete
      if (e.target.closest(".btn-delete")) {
         const confirmDelete = confirm(
            `Are you sure you want to delete the product "${product.name}"?`
         );
         if (confirmDelete) {
            const index = products.findIndex((p) => p.id === product.id);
            if (index !== -1) {
               products.splice(index, 1);
               try {
                  localStorage.setItem("products", JSON.stringify(products));
               } catch (e) {
                  console.warn("localStorage not available");
               }
               renderProducts(products);
            }
         }
         return;
      }

      // Handle edit
      if (e.target.closest(".btn-edit")) {
         const modal = new Modal();
         const modalForm = modal.open({ templateId: "editProductModal" });

         // Pre-fill form with current product data
         modalForm.querySelector("#productName").value = product.name;
         modalForm.querySelector("#productCategory").value = product.categories;
         modalForm.querySelector("#productPrice").value = product.price;
         modalForm.querySelector("#productImage").value = product.image;

         const editForm = modalForm.querySelector("#addProductForm");
         if (editForm) {
            editForm.addEventListener("submit", function (e) {
               e.preventDefault();

               product.name = modalForm
                  .querySelector("#productName")
                  .value.trim();
               product.categories =
                  modalForm.querySelector("#productCategory").value;
               product.price = parseFloat(
                  modalForm.querySelector("#productPrice").value
               );
               product.image = modalForm.querySelector("#productImage").value;

               try {
                  localStorage.setItem("products", JSON.stringify(products));
               } catch (e) {
                  console.warn("localStorage not available");
               }

               renderProducts(products);
               modal.close(modalForm);
            });
         }
      }
   });
}

// Search functionality
if (searchInput) {
   searchInput.addEventListener("input", (e) => {
      const searchValue = e.target.value.trim().toLowerCase();
      let productsAll;

      try {
         productsAll = JSON.parse(localStorage.getItem("products")) || products;
      } catch (e) {
         productsAll = products;
      }

      const filteredProducts = productsAll.filter((p) =>
         p.name.toLowerCase().includes(searchValue)
      );
      renderProducts(filteredProducts);
   });
}

// Category filter
if (categoryFilter) {
   categoryFilter.addEventListener("change", (e) => {
      const selectedCategory = e.target.value;
      let productsAll;

      try {
         productsAll = JSON.parse(localStorage.getItem("products")) || products;
      } catch (e) {
         productsAll = products;
      }

      const filteredProducts =
         selectedCategory === "all"
            ? productsAll
            : productsAll.filter((p) => p.categories === selectedCategory);
      renderProducts(filteredProducts);
   });
}
