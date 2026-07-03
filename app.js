const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

const usuarios = [
  { email: "admin@tickets.com", password: "12345", nombre: "Administrador", rol: "admin", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "nicolf@accesos.com", password: "#Nicol2026", nombre: "Nicol Fiorella Huaman Molina", rol: "editor", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "hermanr@accesos.com", password: "#Herman2026", nombre: "Herman Andre Robles Cuadros", rol: "editor", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "patriciay@accesos.com", password: "#Patricia2026", nombre: "Patricia Janeth Yalerque Saenz", rol: "editor", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "margaritav@accesos.com", password: "#Margarita2026", nombre: "Filonila Margarita Valverde Rivera", rol: "editor", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "beatrizv@accesos.com", password: "#Beatriz2026", nombre: "Beatriz Paredes Velásquez", rol: "editor", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "orlandos@accesos.com", password: "#Orlando2026", nombre: "Orlando Aurelio Salgado Quiroz", rol: "editor", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "lourdesf@accesos.com", password: "#Lourdes2026", nombre: "Lourdes Nathalia Fores Zarate", rol: "editor", modulos: ["bandeja", "blackcases", "reportes"] },

  // Perfiles solo visualizador
  { email: "eduardof@accesos.com", password: "#Eduardo2026", nombre: "Eduardo Jony Flores Villanueva", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "davida@accesos.com", password: "#David2026", nombre: "David Cesar Arenas Jara", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "planning@accesos.com", password: "#Planning2026", nombre: "Área de Planning", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "calidad@accesos.com", password: "#Calidad2026", nombre: "Área de Calidad", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "supervisor001@accesos.com", password: "#001Super2026", nombre: "Supervisor 001", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "supervisor002@accesos.com", password: "#002Super2026", nombre: "Supervisor 002", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "supervisor003@accesos.com", password: "#003Super2026", nombre: "Supervisor 003", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "supervisor004@accesos.com", password: "#004Super2026", nombre: "Supervisor 004", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "supervisor005@accesos.com", password: "#005Super2026", nombre: "Supervisor 005", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "supervisor006@accesos.com", password: "#006Super2026", nombre: "Supervisor 006", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] },
  { email: "supervisor007@accesos.com", password: "#007Super2026", nombre: "Supervisor 007", rol: "viewer", modulos: ["bandeja", "blackcases", "reportes"] }
];

function irAlDashboardSiYaHaySesion() {
  const logueado = localStorage.getItem("usuarioLogueado");
  if (logueado === "true") {
    window.location.replace("dashboard.html");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  irAlDashboardSiYaHaySesion();
});

window.addEventListener("pageshow", () => {
  irAlDashboardSiYaHaySesion();
});

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  mensaje.textContent = "";
  mensaje.style.color = "red";

  if (!email || !password) {
    mensaje.textContent = "Completa todos los campos.";
    return;
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailValido.test(email)) {
    mensaje.textContent = "Ingresa un correo válido.";
    return;
  }

  const usuarioEncontrado = usuarios.find(
    (usuario) =>
      usuario.email.toLowerCase() === email.toLowerCase() &&
      usuario.password === password
  );

  if (usuarioEncontrado) {
    mensaje.style.color = "green";
    mensaje.textContent = "Inicio de sesión correcto...";

    localStorage.setItem("usuarioLogueado", "true");
    localStorage.setItem("correoUsuario", usuarioEncontrado.email);
    localStorage.setItem("nombreUsuario", usuarioEncontrado.nombre);
    localStorage.setItem("rolUsuario", usuarioEncontrado.rol || "editor");
    localStorage.setItem("modulosUsuario", JSON.stringify(usuarioEncontrado.modulos || ["bandeja", "blackcases", "reportes"]));
    localStorage.setItem("ultimaActividad", String(Date.now()));

    setTimeout(() => {
      window.location.replace("dashboard.html");
    }, 700);
  } else {
    mensaje.textContent = "Correo o contraseña incorrectos.";
  }
});
