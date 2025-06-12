import ApiService from "./apis/api-service.js";
import Modal from "./common/modal.js";
import Pagination from "./common/panagation.js";
import { showNotification } from "./utils/ui-utils.js";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
class Admin {
   constructor() {
      this.API_BASE_URL = "http://localhost:5000";
      this.products = [];
      this.categories = [];
      this.apiService = new ApiService(this.API_BASE_URL);
      this.elements = {
         sidebarNav: $(".sidebar-nav"),
         navItems: $$(".nav-item"),
         rapperHeader: $(".wrapper-header"),
         wrapperHeader: $(".wrapper-header"),
         catWrapper: $(".cat-wrapper"),
         umContainer: $(".um-container"),
         coffeeDashboard: $(".coffee-dashboard"),
         btnPrimary: $(".btn-primary"),
         categoryFilter: $("#categoryFilter"),
         productTableBody: $("#productTableBody"),
         catBtnAdd: $(".cat-btn-add"),
         tbody: $("#categoryTableBody"),
         addProductBtn: $("#addProductBtn"),
         tbodyUsers: $("#tbodyUsers"),
         userAvatar: $(".user-avatar_img"),
         userRole: $(".user-role"),
      };
   }

   async initPagination() {
      if (!document.querySelector(".pagination-container")) {
         const paginationContainer = document.createElement("div");
         paginationContainer.className = "pagination-container";
         paginationContainer.style.padding = "0 15px";
         const tableContainer =
            this.elements.productTableBody.closest("table").parentNode;
         tableContainer.appendChild(paginationContainer);
      }
      this.pagination = new Pagination({
         data: this.products,
         itemsPerPage: 5,
         containerSelector: ".pagination-container",
         onPageChange: (currentPageData) => {
            this.renderProducts(currentPageData);
            window.scrollTo({ top: 0, behavior: "smooth" });
         },
      });

      if (!document.querySelector(".category-pagination-container")) {
         const categoryPaginationContainer = document.createElement("div");
         categoryPaginationContainer.className =
            "category-pagination-container";
         categoryPaginationContainer.style.padding = "0 15px";
         const categoryTableContainer =
            this.elements.tbody.closest("table").parentNode;
         categoryTableContainer.appendChild(categoryPaginationContainer);
      }
      this.categoryPagination = new Pagination({
         data: this.categories,
         itemsPerPage: 5,
         containerSelector: ".category-pagination-container",
         onPageChange: (currentPageData) => {
            this.renderCategories(currentPageData);
            window.scrollTo({ top: 0, behavior: "smooth" });
         },
      });
   }

   async init() {
      this.users = await this.apiService.getUsers();
      const admin = this.users.find((u) => u.role === "admin");
      this.elements.userAvatar.src = admin.avatar;
      this.elements.userRole.textContent = admin.role;
      this.params = new URLSearchParams(window.location.search);
      try {
         this.products = await this.apiService.getProducts();
         this.users = await this.apiService.getUsers();
         const apiCategories = await this.apiService.getCategories();
         this.categories = apiCategories.length
            ? apiCategories
            : this.categories;
         this.attachNavigationListeners();
         this.attachCategoryListeners();
         this.initPagination();
         this.switchView(`${this.params.get("type")}`);
         this.attachProductListeners();
      } catch (error) {
         console.error("Initialization failed:", error.message, error.stack);
         alert(
            "Failed to load dashboard data. Please check the server and try again."
         );
      }
   }

   typeActiveBlock(type) {
      this.params.set("type", type);
      history.pushState(null, "", "?" + this.params.toString());
      this.type = this.params.get("type");
   }

   switchView(view = "dashboard") {
      const { wrapperHeader, catWrapper, coffeeDashboard, umContainer } =
         this.elements;
      wrapperHeader.style.display = "none";
      catWrapper.style.display = "none";
      coffeeDashboard.style.display = "none";
      umContainer.style.display = "none";
      try {
         switch (view) {
            case "products":
               wrapperHeader.style.display = "block";
               this.typeActiveBlock("products");
               if (this.pagination) {
                  this.renderProducts(this.pagination.getCurrentPageData());
               } else {
                  console.warn(
                     "Pagination not initialized, rendering first 5 products"
                  );
                  this.renderProducts(this.products.slice(0, 5));
               }
               break;
            case "categories":
               catWrapper.style.display = "block";
               this.typeActiveBlock("categories");
               this.renderCategories(
                  this.categoryPagination
                     ? this.categoryPagination.getCurrentPageData()
                     : this.categories.slice(0, 5)
               );
               break;
            case "dashboard":
               coffeeDashboard.style.display = "block";
               this.typeActiveBlock("dashboard");
               break;
            case "users":
               umContainer.style.display = "block";
               this.typeActiveBlock("users");
               this.renderUsers();
               break;
            default:
               coffeeDashboard.style.display = "block";
               this.typeActiveBlock("dashboard");
         }
      } catch (error) {
         console.error(
            `Error switching to view ${view}:`,
            error.message,
            error.stack
         );
         showNotification(
            `Failed to load ${view} view. Please try again.`,
            "error"
         );
      }
   }

   attachNavigationListeners() {
      const { sidebarNav } = this.elements;
      if (!sidebarNav) {
         console.error("Sidebar navigation element not found.");
         return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      const typeParam = urlParams.get("type");
      if (typeParam) {
         const targetNavItem = Array.from(this.elements.navItems).find(
            (item) => item.dataset.view === typeParam
         );
         if (targetNavItem) {
            this.elements.navItems.forEach((item) => {
               item.classList.remove("active");
            });
            targetNavItem.classList.add("active");
            this.switchView(typeParam);
         }
      }
      sidebarNav.addEventListener("click", (e) => {
         const view = e.target.dataset.view;
         if (!view) {
            console.warn("No data-view attribute found on nav item.");
            return;
         }
         const activeItem = document.getElementById(view);
         if (!activeItem) {
            showNotification("Not Found activeItem", "error", view);
            return;
         }
         this.elements.navItems.forEach((item) => {
            item.classList.remove("active");
         });
         e.target.classList.add("active");
         const url = new URL(window.location);
         url.searchParams.set("type", view);
         window.history.pushState({}, "", url);
         this.switchView(view);
      });
   }

   renderProducts(products = this.products) {
      const { productTableBody } = this.elements;
      if (!productTableBody) {
         console.error("Product table body element not found.");
         return;
      }
      const productsToRender =
         products ||
         (this.pagination
            ? this.pagination.getCurrentPageData()
            : this.products.slice(0, 5));
      productTableBody.innerHTML = productsToRender.length
         ? productsToRender
              .map((product) => {
                 const categories = Array.isArray(product.categories)
                    ? product.categories.map(this.escapeHTML).join(", ")
                    : this.escapeHTML(product.categories || "");
                 return `
                    <tr class="product-item" data-product="${product.id}">
                        <td>
                            <div class="item-cell">
                                <div class="item-image">
                                    <img src="${this.escapeHTML(
                                       product.image
                                    )}" alt="${this.escapeHTML(
                    product.name
                 )}" class="product-img" />
                                </div>
                                <div class="item-info">
                                    <h3>${this.escapeHTML(product.name)}</h3>
                                </div>
                            </div>
                        </td>
                        <td>${categories}</td>
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
                                <a href="#!" class="btn-action btn-delete" title="Delete">
                                   <i class="fas fa-trash"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                 `;
              })
              .join("")
         : `<tr><td colspan="4">No products available</td></tr>`;
   }

   escapeHTML(str) {
      const div = document.createElement("div");
      div.textContent = str || "";
      return div.innerHTML;
   }

   renderCategories(categories = this.categories) {
      if (!this.elements.tbody) {
         console.error("Category table body element not found.");
         return;
      }
      const productsToRender =
         categories ||
         (this.pagination
            ? this.pagination.getCurrentPageData()
            : this.categories.slice(0, 5));
      this.elements.tbody.innerHTML = productsToRender.length
         ? productsToRender
              .map(
                 (c) => `
                 <tr data-category="${c.id}" class="category-item">
                     <td>
                         <img src="${this.escapeHTML(
                            c.image
                         )}" alt="${this.escapeHTML(c.name)}" class="cat-img" />
                     </td>
                     <td>${this.escapeHTML(c.name)}</td>
                     <td>${this.escapeHTML(c.description)}</td>
                     <td>${this.escapeHTML(String(c.products))}</td>
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
              .join("")
         : `<tr><td colspan="5">No categories available</td></tr>`;
   }

   renderUsers(users = this.users) {
      const { tbodyUsers } = this.elements;
      console.log(tbodyUsers);
      if (!tbodyUsers) {
         console.error("User table body element not found");
         return;
      }
      const html = users
         .map(
            ({ avatar, email, id, signupDate, role }) =>
               `
          <tr>
                              <td class="um-td">
                                 <div class="um-user-cell">
                                       <img src="${avatar}" alt="" id="um-user-avt" />
                                    <div class="um-user-info">
                                       <div class="um-user-name">John Doe</div>
                                       <div class="um-user-handle">
                                          @johndoe
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td class="um-td">${email}</td>
                              <td class="um-td">${role}</td>
                              <td class="um-td">${signupDate}</td>
                              <td class="um-td">
                                 <div class="um-actions">
                                    <button class="um-action-btn" title="View">
                                       <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="um-action-btn" title="Edit">
                                       <i class="fas fa-edit"></i>
                                    </button>
                                    <button
                                       class="um-action-btn"
                                       title="Delete"
                                    >
                                      <i class="fas fa-trash"></i>
                                    </button>
                                 </div>
                              </td>
                           </tr>`
         )
         .join(" ");

      tbodyUsers.innerHTML = html;
   }

   attachCategoryListeners() {
      const { catBtnAdd } = this.elements;
      if (!catBtnAdd) {
         showNotification("Category add button not found.", "error");
         return;
      }
      console.log(123);

      catBtnAdd.addEventListener("click", () => {
         const modal = new Modal();
         const modalForm = modal.open({ templateId: "addCategories" });
         const addCategoriesForm =
            modalForm.querySelector("#addCategoriesForm");
         if (!addCategoriesForm) {
            showNotification("Add categories form not found.", "error");
            showNotification("Failed to load category form.", "error");
            return;
         }
         addCategoriesForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const categoryImage = modalForm.querySelector("#categoryImage");
            const categoryName = modalForm.querySelector("#categoryName");
            const categoryDesc = modalForm.querySelector("#categoryDescArea");
            const categoryCount = modalForm.querySelector("#categoryCount");
            if (
               !categoryImage ||
               !categoryName ||
               !categoryDesc ||
               !categoryCount
            ) {
               showNotification("Form fields missing.", "error");
               return;
            }
            const img = categoryImage.value.trim();
            const name = categoryName.value.trim();
            const desc = categoryDesc.value.trim();
            const count = categoryCount.value.trim();
            if (!img || !name || !desc || !count) {
               showNotification("All fields are required.", "error");
               return;
            }
            if (isNaN(count) || count < 0) {
               showNotification(
                  "Product count must be a valid number.",
                  "error"
               );
               return;
            }
            const newCategory = {
               id: (
                  Math.max(...this.categories.map((cat) => parseInt(cat.id))) +
                  1
               ).toString(),
               name,
               image: img,
               description: desc,
               products: parseInt(count, 10),
            };

            try {
               const res = await this.apiService.createCategory(newCategory);
               if (res.ok) {
                  const createdCategory = await res.json();
                  this.categories.push(createdCategory);
                  this.renderCategories(this.categories);
                  modal.close(modalForm);
                  addCategoriesForm.reset();
                  showNotification("Success add category");
               }
            } catch (error) {
               console.error("Error creating category:", error);
            }
         });
      });

      this.elements.tbody.addEventListener("click", (e) => {
         const categoryItem = e.target.closest(".category-item");
         if (!categoryItem) {
            showNotification(`Not Found Id "category - item"`);
            return;
         }
         const id = +categoryItem?.dataset.category;
         const product = this.categories.find((p) => +p.id === id);
         if (e.target.closest(".cat-btn-icon.delete")) {
            const modal = new Modal();
            const modalDeleteCategories = modal.open({
               templateId: "deleteModal",
            });
            const $ = modalDeleteCategories.querySelector.bind(
               modalDeleteCategories
            );
            const confirmDelete = $("#confirmDelete");
            $("#cancelDelete").onclick = () =>
               modal.close(modalDeleteCategories);
            confirmDelete.onclick = async () => {
               try {
                  const res = await this.apiService.deleteCategories(id);
                  if (!res.ok) {
                     throw new Error(`HTTP error! status: ${res.status}`);
                  }
                  const createdCategory = await res.json();
                  this.renderCategories(this.categories);
                  modal.close(modalDeleteCategories);
                  showNotification("Delete add category");
               } catch (error) {
                  showNotification("Error delete category", "error", error);
               }
            };
            return;
         }

         if (e.target.closest(".cat-btn-icon.edit")) {
            const modal = new Modal();
            const modalEdit = modal.open({
               templateId: "addCategories",
            });
            const $ = modalEdit.querySelector.bind(modalEdit);
            const categoryImage = $("#categoryImage");
            const categoryName = $("#categoryName");
            const categoryDescArea = $("#categoryDescArea");
            const categoryCount = $("#categoryCount");
            const { id, image, name, description, products } = product;

            categoryImage.value = image;
            categoryName.value = name;
            categoryDescArea.value = description;
            categoryCount.value = products;

            $(".btn-primary").onclick = async () => {
               const categoryImageInput = categoryImage.value;
               const categoryNameInput = categoryName.value;
               const categoryDescAreaInput = categoryDescArea.value;
               const categoryCountInput = categoryCount.value;

               const newCategory = {
                  id,
                  image: categoryImageInput,
                  name: categoryNameInput,
                  description: categoryDescAreaInput,
                  products: categoryCountInput,
               };

               try {
                  const res = await fetch(
                     `${this.API_BASE_URL}/categories/${id}`,
                     {
                        method: "PATCH",
                        headers: {
                           "Content-Type": "application/json",
                        },
                        body: JSON.stringify(newCategory),
                     }
                  );
                  if (!res.ok) {
                     throw new Error(`HTTP error! status: ${res.status}`);
                  }
                  const createdCategory = await res.json();
                  this.renderCategories(this.categories);
                  modal.close(modalEdit);
               } catch (error) {
                  showNotification("Error delete category", "error", error);
               }
            };
         }
      });
   }

   attachProductListeners() {
      const { addProductBtn } = this.elements;

      const modal = new Modal();
      addProductBtn.addEventListener("click", (e) => {
         const modalAddProduct = modal.open({ templateId: "addProductModal" });
         const addProductForm =
            modalAddProduct.querySelector("#addProductForm");
         const $ = modalAddProduct.querySelector.bind(modalAddProduct);
         addProductForm.onsubmit = async (e) => {
            e.preventDefault();

            // Get form values
            const name = $("#productName").value.trim();
            const category = $("#productCategory").value;
            const price = parseFloat($("#productPrice").value);
            const imageInput = $("#productImage");
            if (!name || !category || isNaN(price) || !imageInput.value) {
               showNotification("Vui lòng nhập đầy đủ thông tin", "error");
               return;
            }
            const newProduct = {
               id: `${this.products.length + 1}`,
               name,
               categories: category,
               brand: category,
               price,
               image: imageInput.value,
               rating: 5,
            };

            try {
               const res = await fetch(`${this.API_BASE_URL}/products`, {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                  },
                  body: JSON.stringify(newProduct),
               });

               if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
               }
               const savedProduct = await res.json();
               this.products.push(savedProduct || newProduct);
               showNotification("Add product finished", "success");
               this.renderProducts(this.products);
               addProductForm.reset();
               modal.close(modalAddProduct);
            } catch (error) {
               console.error("Error adding product:", error);
               showNotification("Failed add product!", "error");
            }
         };
      });

      productTableBody.addEventListener("click", (e) => {
         const productItem = e.target.closest(".product-item");
         if (!productItem) {
            showNotification('Not found "product-item"', "error");
            return;
         }
         const idProduct = +productItem?.dataset.product;
         const product = this.products.find((p) => +p.id === idProduct);

         if (e.target.closest(".btn-action.btn-delete")) {
            const modalDelete = modal.open({
               templateId: "deleteProductModal",
            });
            const $ = modalDelete.querySelector.bind(modalDelete);
            const confirmDeleteProduct = $("#confirmDeleteProduct");
            confirmDeleteProduct.onclick = async () => {
               try {
                  const res = await this.apiService.deleteProduct(product.id);
                  console.log(res);
                  debugger;
                  if (!res.ok) {
                     throw new Error(`HTTP error! status: ${res.status}`);
                  }
                  this.renderProducts(this.products);
                  modal.close(modalDelete);
                  showNotification("Delete product finished");
               } catch (error) {
                  showNotification("Error delete category", "error", error);
               }
            };
         }
      });
   }
}

const admin = new Admin();
admin.init();


