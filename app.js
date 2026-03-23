const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

const usuarios = [
  { email: "admin@tickets.com", password: "12345", nombre: "Administrador" },
  { email: "nicolf@accesos.com", password: "#Nicol2026", nombre: "Nicol Fiorella Huaman Molina" },
  { email: "hermanr@accesos.com", password: "#Herman2026", nombre: "Herman Andre Robles Cuadros" },
  { email: "patriciay@accesos.com", password: "#Patricia2026", nombre: "Patricia Janeth Yalerque Saenz" },
  { email: "margaritav@accesos.com", password: "#Margarita2026", nombre: "Filonila Margarita Valverde Rivera" },
  { email: "beatrizv@accesos.com", password: "#Beatriz2026", nombre: "Beatriz Paredes Velásquez" },
  { email: "lourdesf@accesos.com", password: "#Lourdes2026", nombre: "Lourdes Nathalia Fores Zarate" }
];

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

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } else {
    mensaje.textContent = "Correo o contraseña incorrectos.";
  }
});