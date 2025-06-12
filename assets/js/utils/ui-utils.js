function showNotification(message, type = "success") {
   const notification = document.createElement("div");
   notification.className = `notification ${type}`;
   notification.textContent = message;
   const notificationStyles = {
      success: {
         background: "#4CAF50",
         icon: "✓",
      },
      error: {
         background: "#f44336",
         icon: "✕",
      },
      warning: {
         background: "#ff9800",
         icon: "⚠",
      },
      info: {
         background: "#2196F3",
         icon: "ℹ",
      },
      loading: {
         background: "#607D8B",
         icon: "⟳",
      },
      purple: {
         background: "#9C27B0",
         icon: "★",
      },
      dark: {
         background: "#424242",
         icon: "●",
      },
   };
   const style = notificationStyles[type] || notificationStyles.success;
   notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${style.background};
        color: white;
        border-radius: 6px;
        z-index: 9999;
        transition: all 0.3s ease;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 250px;
        max-width: 400px;
        word-wrap: break-word;
    `;
   const iconSpan = document.createElement("span");
   iconSpan.textContent = style.icon;
   iconSpan.style.cssText = `
        font-weight: bold;
        font-size: 16px;
        flex-shrink: 0;
    `;
   const messageSpan = document.createElement("span");
   messageSpan.textContent = message;
   messageSpan.style.flex = "1";

   notification.innerHTML = "";
   notification.appendChild(iconSpan);
   notification.appendChild(messageSpan);
   const existingNotifications = document.querySelectorAll(".notification");
   const offset = existingNotifications.length * 70;
   notification.style.top = `${20 + offset}px`;

   document.body.appendChild(notification);
   if (type === "loading") {
      iconSpan.style.animation = "spin 1s linear infinite";
      const style = document.createElement("style");
      style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
      document.head.appendChild(style);
   }
   if (type !== "loading") {
      setTimeout(() => {
         notification.style.opacity = "0";
         notification.style.transform = "translateX(100%)";
         setTimeout(() => {
            if (document.body.contains(notification)) {
               document.body.removeChild(notification);
            }
         }, 300);
      }, 4000);
   }
   return notification;
}
const notify = {
   success: (message) => showNotification(message, "success"),
   error: (message) => showNotification(message, "error"),
   warning: (message) => showNotification(message, "warning"),
   info: (message) => showNotification(message, "info"),
   loading: (message) => showNotification(message, "loading"),
   purple: (message) => showNotification(message, "purple"),
   dark: (message) => showNotification(message, "dark"),
};
function dismissNotification(notification) {
   if (notification && document.body.contains(notification)) {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
         if (document.body.contains(notification)) {
            document.body.removeChild(notification);
         }
      }, 300);
   }
}
function dismissAllNotifications() {
   const notifications = document.querySelectorAll(".notification");
   notifications.forEach((notification) => {
      dismissNotification(notification);
   });
}

export {
   showNotification,
   notify,
   dismissNotification,
   dismissAllNotifications,
};
