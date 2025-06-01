// Tạo form bằng JavaScript
const app = document.getElementById("formContainer");
const formHTML = `
            <div class="container">
                <div class="input-group">
                    <input type="email" class="input" placeholder="Email" id="email">
                    <div class="error-text" id="emailError"></div>
                </div>
                
                <div class="input-group">
                    <input type="password" class="input" placeholder="Password" id="password">
                    <div class="error-text" id="passwordError"></div>
                </div>
                
                <div class="input-group">
                    <input type="password" class="input" placeholder="Confirm Password" id="confirmPassword">
                    <div class="error-text" id="confirmPasswordError"></div>
                </div>
                
                <div class="checkbox-row">
                    <input type="checkbox" id="defaultCard">
                    <label for="defaultCard">Set as default card</label>
                </div>
                
                <div class="recovery">
                    <a href="#">Recovery Password</a>
                </div>
                
                <button type="button" class="btn-signup" onclick="signUp()">Sign Up</button>
                <button class="btn-google" onclick="googleSignIn()">
                    <span>G</span> Sign in with Gmail
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

function signUp() {
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   const confirmPassword = document.getElementById("confirmPassword").value;
   hideError("email");
   hideError("password");
   hideError("confirmPassword");

   let isValid = true;
   if (!email) {
      showError("email", "Email không được để trống");
      isValid = false;
   }

   if (!password) {
      showError("password", "Mật khẩu không được để trống");
      isValid = false;
   } else if (password.length < 6) {
      showError("password", "Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
   }

   if (!confirmPassword) {
      showError("confirmPassword", "Vui lòng xác nhận mật khẩu");
      isValid = false;
   } else if (password !== confirmPassword) {
      showError("confirmPassword", "Mật khẩu không khớp");
      isValid = false;
   }

   if (isValid) {
      const userData = {
         email: email,
         password: password,
         defaultCard: defaultCard,
         signupDate: new Date().toISOString(),
      };

      localStorage.setItem("userData", JSON.stringify(userData));

      alert("Đăng ký thành công!");
      window.location.href = "signIn.html";
      console.log("Đã lưu vào localStorage:", userData);
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
      document.getElementById("confirmPassword").value = "";
      document.getElementById("defaultCard").checked = false;
   }
}

function googleSignIn() {
   alert("Chuyển đến đăng nhập Google...");
}
