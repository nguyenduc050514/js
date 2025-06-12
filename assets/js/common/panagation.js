class Pagination {
   constructor(options = {}) {
      this.data = options.data || [];
      this.itemsPerPage = options.itemsPerPage || 5;
      this.currentPage = options.currentPage || 1;
      this.containerSelector =
         options.containerSelector || ".pagination-container";
      this.onPageChange = options.onPageChange || null;

      this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
      this.init();
   }

   init() {
      this.createPaginationHTML();
      this.bindEvents();
   }
   getCurrentPageData() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.data.slice(startIndex, endIndex);
   }
   updateData(newData) {
      this.data = newData;
      this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
      this.currentPage = 1; // Reset về trang đầu
      this.createPaginationHTML();
      this.triggerPageChange();
   }
   goToPage(page) {
      if (page < 1 || page > this.totalPages) return;

      this.currentPage = page;
      this.createPaginationHTML();
      this.triggerPageChange();
   }
   previousPage() {
      if (this.currentPage > 1) {
         this.goToPage(this.currentPage - 1);
      }
   }
   nextPage() {
      if (this.currentPage < this.totalPages) {
         this.goToPage(this.currentPage + 1);
      }
   }
   createPaginationHTML() {
      const container = document.querySelector(this.containerSelector);
      if (!container) {
         console.error(
            `Pagination container "${this.containerSelector}" not found`
         );
         return;
      }
      if (this.totalPages <= 1) {
         container.innerHTML = "";
         return;
      }
      const paginationHTML = `
            <div class="pagination-wrapper">
                <div class="pagination-info">
                    Hiển thị ${this.getStartItem()}-${this.getEndItem()} của ${
         this.data.length
      } sản phẩm
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn prev-btn" ${
                       this.currentPage === 1 ? "disabled" : ""
                    }>
                        &laquo; Trước
                    </button>
                    
                    ${this.generatePageNumbers()}
                    
                    <button class="pagination-btn next-btn" ${
                       this.currentPage === this.totalPages ? "disabled" : ""
                    }>
                        Sau &raquo;
                    </button>
                </div>
            </div>
        `;

      container.innerHTML = paginationHTML;
   }

   // Tạo các số trang
   generatePageNumbers() {
      let pages = "";
      const maxVisiblePages = 5;
      let startPage = Math.max(
         1,
         this.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      // Điều chỉnh startPage nếu endPage đã đạt tối đa
      if (endPage - startPage + 1 < maxVisiblePages) {
         startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // Nút trang đầu
      if (startPage > 1) {
         pages += `<button class="pagination-btn page-btn" data-page="1">1</button>`;
         if (startPage > 2) {
            pages += `<span class="pagination-ellipsis">...</span>`;
         }
      }

      // Các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
         pages += `<button class="pagination-btn page-btn ${
            i === this.currentPage ? "active" : ""
         }" data-page="${i}">${i}</button>`;
      }

      // Nút trang cuối
      if (endPage < this.totalPages) {
         if (endPage < this.totalPages - 1) {
            pages += `<span class="pagination-ellipsis">...</span>`;
         }
         pages += `<button class="pagination-btn page-btn" data-page="${this.totalPages}">${this.totalPages}</button>`;
      }

      return pages;
   }

   // Gắn sự kiện
   bindEvents() {
      const container = document.querySelector(this.containerSelector);
      if (!container) return;

      container.addEventListener("click", (e) => {
         // Xử lý click vào số trang
         if (e.target.classList.contains("page-btn")) {
            const page = parseInt(e.target.dataset.page);
            this.goToPage(page);
         }
         // Xử lý nút Trước
         else if (e.target.classList.contains("prev-btn")) {
            this.previousPage();
         }
         // Xử lý nút Sau
         else if (e.target.classList.contains("next-btn")) {
            this.nextPage();
         }
         // Xử lý nút Đi
         else if (e.target.classList.contains("go-btn")) {
            const input = container.querySelector(".page-input");
            const page = parseInt(input.value);
            if (page >= 1 && page <= this.totalPages) {
               this.goToPage(page);
            }
         }
      });

      // Xử lý Enter trong ô nhập trang
      container.addEventListener("keypress", (e) => {
         if (e.target.classList.contains("page-input") && e.key === "Enter") {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= this.totalPages) {
               this.goToPage(page);
            }
         }
      });
   }

   // Kích hoạt callback khi chuyển trang
   triggerPageChange() {
      if (this.onPageChange && typeof this.onPageChange === "function") {
         this.onPageChange(
            this.getCurrentPageData(),
            this.currentPage,
            this.totalPages
         );
      }
   }

   // Lấy số item đầu tiên của trang hiện tại
   getStartItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
   }

   // Lấy số item cuối cùng của trang hiện tại
   getEndItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.data.length);
   }

   // Thiết lập số items per page
   setItemsPerPage(itemsPerPage) {
      this.itemsPerPage = itemsPerPage;
      this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
      this.currentPage = 1;
      this.createPaginationHTML();
      this.triggerPageChange();
   }

   // Lấy thông tin phân trang
   getPaginationInfo() {
      return {
         currentPage: this.currentPage,
         totalPages: this.totalPages,
         itemsPerPage: this.itemsPerPage,
         totalItems: this.data.length,
         startItem: this.getStartItem(),
         endItem: this.getEndItem(),
      };
   }
}

export default Pagination;
