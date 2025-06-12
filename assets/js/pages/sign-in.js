import { showNotification } from "../utils/ui-utils.js";
// API Base URL
const API_BASE_URL = "http://localhost:5000";

// Tạo form bằng JavaScript
const app = document.getElementById("form-sing-in");

const formHTML = `
            <div class="container">
                <div class="input-group">
                    <input type="email" class="input" placeholder="Email" id="email">
                    <div class="input-icon"> <img src="../../assets/icons/email.svg" alt=""/></div>
                    <div class="error-text" id="emailError"></div>
                </div>
                
                <div class="input-group">
                    <input type="password" class="input" placeholder="Password" id="password">
                    <div class="input-icon"> <img src="../../assets/icons/pass.svg" alt=""/></div>
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

// API Helper Functions
async function fetchUsers() {
   try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
         throw new Error("Failed to fetch users");
      }
      return await response.json();
   } catch (error) {
      console.error("Error fetching users:", error);
      return [];
   }
}

async function createLoginSession(loginData) {
   try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(loginData),
      });
      return response.ok;
   } catch (error) {
      console.error("Error creating session:", error);
      return false;
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

async function signIn() {
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
      try {
         // Fetch users from JSON server
         const users = await fetchUsers();

         if (users.length === 0) {
            showError(
               "email",
               "Tài khoản không tồn tại. Vui lòng đăng ký trước."
            );
            return;
         }

         // Find user with matching email and password
         const user = users.find(
            (u) => u.email === email && u.password === password
         );
         
         if (user) {
            const loginData = {
               id: `${Date.now()}`,
               userId: user.id,
               email: email,
               defaultCard: defaultCard,
               loginTime: new Date().toISOString(),
            };
            showNotification("Đăng nhập thành công!");

            if (email === "duc@gmail.com") {
               window.location.href = "admin.html";
               return;
            }

            const sessionCreated = await createLoginSession(loginData);
            if (sessionCreated) {
               document.getElementById("email").value = "";
               document.getElementById("password").value = "";
               document.getElementById("defaultCard").checked = false;
               localStorage.setItem("isLoggedIn", "true");
               localStorage.setItem("currentUserId", user.id.toString());
               window.location.href = "../index.html";
            } else {
               alert("Lỗi khi tạo phiên đăng nhập. Vui lòng thử lại.");
            }
         } else {
            const emailExists = users.some((u) => u.email === email);
            if (emailExists) {
               showError("password", "Mật khẩu không đúng");
            } else {
               showError("email", "Email không tồn tại");
            }
         }
      } catch (error) {
         console.error("Login error:", error);
         alert("Lỗi kết nối đến server. Vui lòng thử lại.");
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

window.googleSignIn = googleSignIn;
window.signIn = signIn;
window.fetchUsers = fetchUsers;
window.createLoginSession = createLoginSession;
