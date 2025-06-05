const $ = document.querySelector.bind(document);
function Modal() {
   this.open = ({ templateId }) => {
      if (!templateId) {
         console.error("No templateId");
         return;
      }
      const template = $(`#${templateId}`);
      const content = template.content.cloneNode(template);
      const modalBackdrop = document.createElement("div");
      modalBackdrop.className = "modal-backdrop";
      const modalContainer = document.createElement("div");
      modalContainer.className = "modal-container";
      const modalClose = document.createElement("button");
      modalClose.className = "modal-close";
      modalClose.innerHTML = "&times";
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";
      modalContent.append(content);
      modalContainer.append(modalClose);
      modalContainer.append(modalContent);
      modalBackdrop.append(modalContainer);
      document.body.append(modalBackdrop);
      setTimeout(() => modalBackdrop.classList.add("show"), 0);
      modalClose.onclick = () => this.close(modalBackdrop);
      return modalBackdrop;
   };

   this.close = (modal) => {
      modal.classList.remove("show");
      document.addEventListener("transitionend", () => {
         modal.remove();
      });
   };
}

export default Modal;
