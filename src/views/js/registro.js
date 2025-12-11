class FormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);

    this.fields = {
      nombre: document.getElementById("nombre"),
      apellido: document.getElementById("apellidos"),
      email: document.getElementById("email"),
      password: document.getElementById("password"),
      confirmPassword: document.getElementById("confirmPassword")
    };

    this.errors = {
      nombre: document.getElementById("nombreError"),
      apellido: document.getElementById("apellidosError"),
      email: document.getElementById("emailError"),
      password: document.getElementById("passwordError"),
      confirmPassword: document.getElementById("confirmPasswordError")
    };

    this.init();
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    Object.keys(this.fields).forEach((fieldName) => {
      this.fields[fieldName].addEventListener("blur", () => {
        this.validateField(fieldName);
      });

      this.fields[fieldName].addEventListener("input", () => {
        if (this.errors[fieldName].classList.contains("show")) {
          this.validateField(fieldName);
        }
      });
    });

    this.setupPasswordToggles();
  }

  setupPasswordToggles() {
    const togglePassword = document.getElementById("togglePassword");
    const toggleConfirmPassword = document.getElementById(
      "toggleConfirmPassword"
    );

    togglePassword.addEventListener("click", () => {
      this.togglePasswordVisibility("password");
    });

    toggleConfirmPassword.addEventListener("click", () => {
      this.togglePasswordVisibility("confirmPassword");
    });
  }

  togglePasswordVisibility(fieldName) {
    const field = this.fields[fieldName];
    field.type = field.type === "password" ? "text" : "password";
  }

  validateField(fieldName) {
    const value = this.fields[fieldName].value.trim();
    let errorMessage = "";
    let valid = true;

    if (fieldName === "nombre") {
      if (!value) {
        errorMessage = "El nombre es requerido.";
        valid = false;
      } else if (value.length < 2) {
        errorMessage = "Debe tener al menos 2 caracteres.";
        valid = false;
      }
    }

    if (fieldName === "apellido") {
      if (!value) {
        errorMessage = "El apellido es requerido.";
        valid = false;
      } else if (value.length < 2) {
        errorMessage = "Debe tener al menos 2 caracteres.";
        valid = false;
      }
    }

    if (fieldName === "email") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) {
        errorMessage = "El correo es requerido.";
        valid = false;
      } else if (!regex.test(value)) {
        errorMessage = "Correo inválido.";
        valid = false;
      }
    }

    if (fieldName === "password") {
      if (!value) {
        errorMessage = "La contraseña es requerida.";
        valid = false;
      } else if (value.length < 6) {
        errorMessage = "Debe tener mínimo 6 caracteres.";
        valid = false;
      }
    }

    if (fieldName === "confirmPassword") {
      if (!value) {
        errorMessage = "Debe confirmar la contraseña.";
        valid = false;
      } else if (value !== this.fields.password.value) {
        errorMessage = "Las contraseñas no coinciden.";
        valid = false;
      }
    }

    this.showError(fieldName, errorMessage, !valid);
    return valid;
  }

  showError(fieldName, message, show) {
    const error = this.errors[fieldName];

    if (show) {
      error.textContent = message;
      error.classList.add("show");
    } else {
      error.classList.remove("show");
    }
  }

  validateAll() {
    return Object.keys(this.fields).every((field) =>
      this.validateField(field)
    );
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateAll()) return;

    const userData = {
      nombre: this.fields.nombre.value.trim(),
      apellido: this.fields.apellido.value.trim(),
      correo: this.fields.email.value.trim(),
      contraseña: this.fields.password.value
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/";
      } else {
        alert(data.message || "Error al registrarse");
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FormValidator("registrationForm");
});
