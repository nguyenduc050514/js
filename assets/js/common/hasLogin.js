import { showNotification } from "../utils/ui-utils.js";
function handleHasLogin() {
   if (!this.hasLogin) {
      showNotification("Bạn vui lòng đăng nhập!!", "error");
      return;
   }
   return;
}
export default handleHasLogin;
