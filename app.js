const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");
const API_URL = "https://script.google.com/macros/s/AKfycbxpyeJ3zz3THhw1vPFcIn7YDIz3XGgvRha2zeW7Kv4PhtGxBc9YZgBz370VhqC-Cc8z/exec";

const btnLoginCambiarPassword = document.getElementById("btnLoginCambiarPassword");
const loginPasswordModal = document.getElementById("loginPasswordModal");
const btnCerrarLoginPassword = document.getElementById("btnCerrarLoginPassword");
const btnGuardarLoginPassword = document.getElementById("btnGuardarLoginPassword");
const changePasswordMsg = document.getElementById("changePasswordMsg");

function irAlDashboardSiYaHaySesion() {
  const logueado = localStorage.getItem("usuarioLogueado");
  if (logueado === "true") {
    window.location.replace("dashboard.html");
  }
}

function setMensaje(texto, color = "red") {
  if (!mensaje) return;
  mensaje.textContent = texto;
  mensaje.style.color = color;
}

function setChangeMsg(texto, color = "red") {
  if (!changePasswordMsg) return;
  changePasswordMsg.textContent = texto;
  changePasswordMsg.style.color = color;
}

async function apiPost(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.json();
}

function abrirModalCambioPassword() {
  if (!loginPasswordModal) return;
  const emailLogin = document.getElementById("email")?.value || "";
  const changeEmail = document.getElementById("changeEmail");
  if (changeEmail && emailLogin) changeEmail.value = emailLogin.trim();
  setChangeMsg("");
  loginPasswordModal.classList.remove("hidden");
}

function cerrarModalCambioPassword() {
  if (!loginPasswordModal) return;
  loginPasswordModal.classList.add("hidden");
  ["changeOldPassword", "changeNewPassword", "changeNewPassword2"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

async function cambiarPasswordDesdeLogin() {
  const email = document.getElementById("changeEmail")?.value.trim() || "";
  const passwordActual = document.getElementById("changeOldPassword")?.value || "";
  const passwordNueva = document.getElementById("changeNewPassword")?.value || "";
  const passwordNueva2 = document.getElementById("changeNewPassword2")?.value || "";

  setChangeMsg("");

  if (!email || !passwordActual || !passwordNueva || !passwordNueva2) {
    setChangeMsg("Completa todos los campos.");
    return;
  }

  if (passwordNueva !== passwordNueva2) {
    setChangeMsg("Las nuevas contraseñas no coinciden.");
    return;
  }

  if (passwordNueva.length < 6) {
    setChangeMsg("La nueva contraseña debe tener mínimo 6 caracteres.");
    return;
  }

  try {
    btnGuardarLoginPassword.disabled = true;
    btnGuardarLoginPassword.textContent = "Guardando...";

    const resultado = await apiPost({
      accion: "cambiarPassword",
      email,
      passwordActual,
      passwordNueva
    });

    if (!resultado || resultado.ok !== true) {
      throw new Error(resultado?.mensaje || resultado?.detalle || "No se pudo cambiar la contraseña");
    }

    setChangeMsg("Contraseña actualizada. Inicia sesión nuevamente.", "green");
    setTimeout(() => {
      cerrarModalCambioPassword();
      const emailInput = document.getElementById("email");
      const passInput = document.getElementById("password");
      if (emailInput) emailInput.value = email;
      if (passInput) passInput.value = "";
      setMensaje("Contraseña actualizada. Ingresa nuevamente.", "green");
    }, 900);
  } catch (error) {
    setChangeMsg(String(error.message || error));
  } finally {
    btnGuardarLoginPassword.disabled = false;
    btnGuardarLoginPassword.textContent = "Guardar contraseña";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  irAlDashboardSiYaHaySesion();

  if (btnLoginCambiarPassword) {
    btnLoginCambiarPassword.addEventListener("click", abrirModalCambioPassword);
  }

  if (btnCerrarLoginPassword) {
    btnCerrarLoginPassword.addEventListener("click", cerrarModalCambioPassword);
  }

  if (loginPasswordModal) {
    loginPasswordModal.addEventListener("click", (e) => {
      if (e.target === loginPasswordModal) cerrarModalCambioPassword();
    });
  }

  if (btnGuardarLoginPassword) {
    btnGuardarLoginPassword.addEventListener("click", cambiarPasswordDesdeLogin);
  }
});

window.addEventListener("pageshow", () => {
  irAlDashboardSiYaHaySesion();
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  setMensaje("");

  if (!email || !password) {
    setMensaje("Completa todos los campos.");
    return;
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailValido.test(email)) {
    setMensaje("Ingresa un correo válido.");
    return;
  }

  try {
    const btn = loginForm.querySelector("button[type='submit']");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Validando...";
    }

    const resultado = await apiPost({
      accion: "loginUsuario",
      email,
      password
    });

    if (!resultado || resultado.ok !== true) {
      throw new Error(resultado?.mensaje || "Correo o contraseña incorrectos.");
    }

    setMensaje("Inicio de sesión correcto...", "green");

    localStorage.setItem("usuarioLogueado", "true");
    localStorage.setItem("correoUsuario", resultado.email || email);
    localStorage.setItem("nombreUsuario", resultado.nombre || "Usuario");
    localStorage.setItem("rolUsuario", resultado.rol || "editor");
    localStorage.setItem("modulosUsuario", JSON.stringify(resultado.modulos || ["bandeja", "blackcases", "reportes"]));
    localStorage.setItem("ultimaActividad", String(Date.now()));

    setTimeout(() => {
      window.location.replace("dashboard.html");
    }, 500);
  } catch (error) {
    setMensaje(String(error.message || error));
  } finally {
    const btn = loginForm.querySelector("button[type='submit']");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Iniciar sesión";
    }
  }
});
