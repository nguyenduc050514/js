// Tạo form bằng JavaScript
const app = document.getElementById("form-sing-in");

const formHTML = `
            <div class="container">
                <div class="input-group">
                    <input type="email" class="input" placeholder="Email" id="email">
                    <div class="input-icon">📧</div>
                    <div class="error-text" id="emailError"></div>
                </div>
                
                <div class="input-group">
                    <input type="password" class="input" placeholder="Password" id="password">
                    <div class="input-icon">🔒</div>
                    <div class="error-text" id="passwordError"></div>
                </div>
                
                <div class="form-row">
                    <div class="checkbox-group">
                        <input type="checkbox" class="checkbox" id="defaultCard">
                        <label for="defaultCard" class="checkbox-label">Set as default card</label>
                    </div>
                    <a href="#" class="forgot-link">Forgot password?</a>
                </div>
                
                <button class="btn-signin" type="button" onclick="signIn()">Sign In</button>
                <button class="btn-google" onclick="googleSignIn()">
                    <span class="google-icon">G</span> Sign in with Google
                </button>
            </div>
        `;

app.innerHTML = formHTML;

function showError(inputId, message) {
   const input = document.getElementById(inputId);
   const errorElement = document.getElementById(inputId + "Error");
   input.classList.add("error");
   errorElement.textContent = message;
   errorElement.style.display = "block";
}

function hideError(inputId) {
   const input = document.getElementById(inputId);
   const errorElement = document.getElementById(inputId + "Error");

   input.classList.remove("error");
   errorElement.style.display = "none";
}

function signIn() {
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   const defaultCard = document.getElementById("defaultCard").checked;
   hideError("email");
   hideError("password");

   let isValid = true;

   if (!email) {
      showError("email", "Email không được để trống");
      isValid = false;
   }

   if (!password) {
      showError("password", "Mật khẩu không được để trống");
      isValid = false;
   }
   
   if (isValid) {
      const userData = localStorage.getItem("userData");
      if (userData) {
         const user = JSON.parse(userData);
         if (user.email === email && user.password === password) {
            const loginData = {
               email: email,
               defaultCard: defaultCard,
               loginTime: new Date().toISOString(),
            };
            localStorage.setItem("currentUser", JSON.stringify(loginData));
            alert("Đăng nhập thành công!");
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
            document.getElementById("defaultCard").checked = false;
            localStorage.setItem("isLoggedIn", "true");
            window.location.href = "../index.html";
         } else {
            if (user.email !== email) {
               showError("email", "Email không tồn tại");
            } else {
               showError("password", "Mật khẩu không đúng");
            }
         }
      } else {
         showError("email", "Tài khoản không tồn tại. Vui lòng đăng ký trước.");
      }
   }
}

function googleSignIn() {
   alert("Chuyển đến đăng nhập Google...");
   console.log("Google Sign In clicked");
}

document.querySelector(".forgot-link").addEventListener("click", function (e) {
   e.preventDefault();
   alert("Chức năng quên mật khẩu");
});
