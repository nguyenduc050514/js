function showErrorMessage(message) {
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

function showNotification(message, type = "success") {
   const notification = document.createElement("div");
   notification.className = `notification ${type}`;
   notification.textContent = message;

   notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === "success" ? "#4CAF50" : "#f44336"};
            color: white;
            border-radius: 4px;
            z-index: 9999;
            transition: opacity 0.3s;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        `;

   document.body.appendChild(notification);

   setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
         if (document.body.contains(notification)) {
            document.body.removeChild(notification);
         }
      }, 300);
   }, 3000);
}

export { showErrorMessage, showNotification };
