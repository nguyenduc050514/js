// API Base URL
const API_BASE_URL = "http://localhost:5000";

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

// API Helper Functions
async function checkEmailExists(email) {
   try {
      const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
      if (!response.ok) {
         throw new Error("Failed to check email");
      }
      const users = await response.json();
      return users.length > 0;
   } catch (error) {
      console.error("Error checking email:", error);
      return false;
   }
}

async function createUser(userData) {
   try {
      const response = await fetch(`${API_BASE_URL}/users`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(userData),
      });

      if (!response.ok) {
         throw new Error("Failed to create user");
      }

      return await response.json();
   } catch (error) {
      console.error("Error creating user:", error);
      return null;
   }
}

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

function isValidEmail(email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
}

async function signUp() {
   const email = document.getElementById("email").value;
   const password = document.getElementById("password").value;
   const confirmPassword = document.getElementById("confirmPassword").value;
   const defaultCard = document.getElementById("defaultCard").checked;

   hideError("email");
   hideError("password");
   hideError("confirmPassword");

   let isValid = true;
   if (!email) {
      showError("email", "Email không được để trống");
      isValid = false;
   } else if (!isValidEmail(email)) {
      showError("email", "Email không hợp lệ");
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
      try {
         const emailExists = await checkEmailExists(email);
         if (emailExists) {
            showError("email", "Email này đã được sử dụng");
            return;
         }
         const role = email === "duc@gmail.com" ? "admin" : "user";
         const avatar =
            role === "user"
               ? "https://hoseiki.vn/wp-content/uploads/2025/03/avatar-mac-dinh-5.jpg"
               : "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg";
         const userData = {
            email,
            avatar,
            password,
            defaultCard,
            signupDate: new Date().toISOString(),
            role,
         };
         const createdUser = await createUser(userData);
         if (createdUser) {
            window.location.href = "./signIn.html";
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
            document.getElementById("confirmPassword").value = "";
            document.getElementById("defaultCard").checked = false;
            window.location.href = "signIn.html";
         } else {
            alert("Lỗi khi tạo tài khoản. Vui lòng thử lại.");
         }
      } catch (error) {
         console.error("Signup error:", error);
         alert("Lỗi kết nối đến server. Vui lòng thử lại.");
      }
   }
}

function googleSignIn() {
   alert("Chuyển đến đăng nhập Google...");
}
