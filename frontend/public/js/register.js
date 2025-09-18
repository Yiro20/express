import API_BASE_URL from "../config.js";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ocultar mensajes anteriores
    hideMessages();

    // Validar contraseñas
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showError("Las contraseñas no coinciden");
      return;
    }

    // Validar términos
    const terminos = document.getElementById("terminos").checked;
    if (!terminos) {
      showError("Debes aceptar los términos y condiciones");
      return;
    }

    // Obtener datos del formulario
    const formData = {
      nombre: document.getElementById("nombre").value,
      email: document.getElementById("email").value,
      password: password,
      rol: document.getElementById("rol").value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Cuenta creada exitosamente. Redirigiendo...");

        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        showError(data.error || "Error al crear la cuenta");
      }
    } catch (error) {
      showError("Error de conexión. Intenta nuevamente.");
    }
  });

// Función para mostrar errores
function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
  errorDiv.classList.add("block");
}

// Función para mostrar éxito
function showSuccess(message) {
  const successDiv = document.getElementById("successMessage");
  successDiv.textContent = message;
  successDiv.classList.remove("hidden");
  successDiv.classList.add("block");
}

// Función para ocultar mensajes
function hideMessages() {
  document.getElementById("errorMessage").classList.add("hidden");
  document.getElementById("successMessage").classList.add("hidden");
}

// Validación en tiempo real de contraseñas
document
  .getElementById("confirmPassword")
  .addEventListener("input", function () {
    const password = document.getElementById("password").value;
    const confirmPassword = this.value;

    if (confirmPassword && password !== confirmPassword) {
      this.classList.add("border-red-500");
    } else {
      this.classList.remove("border-red-500");
    }
  });
