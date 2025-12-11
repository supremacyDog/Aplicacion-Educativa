document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const toggleBtn = document.querySelector(".contraseña-toggle");
  const passwordInput = document.getElementById("contraseña");

  toggleBtn.addEventListener("click", () => {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";

    passwordInput.setAttribute("type", type);

    toggleBtn.innerHTML =
      type === "password"
        ? "<i class=\"fas fa-eye\"></i>"
        : "<i class=\"fas fa-eye-slash\"></i>";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    try {
      const response = await fetch("/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        window.location.href = data.redirect;
      } else {
        alert(data.message || "Error al iniciar sesión");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor");
    }
  });
});