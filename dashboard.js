const correoUsuarioTexto = document.getElementById("correoUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const btnRefrescarData = document.getElementById("btnRefrescarData");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const btnGenerarReporte = document.getElementById("btnGenerarReporte");
const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const btnCambiarPassword = document.getElementById("btnCambiarPassword");

const loaderOverlay = document.getElementById("loaderOverlay");
const loaderText = document.getElementById("loaderText");

const API_URL = "https://script.google.com/macros/s/AKfycbwIrUk1l-ip-zYUFb1YTKCIHT8ir1ELh0Joj8wmLr9TisB2RpyYyxBZiSR2KZzHryhq/exec";

const tbody = document.getElementById("ticketsTableBody");

const statTotal = document.getElementById("statTotal");
const statAbiertos = document.getElementById("statAbiertos");
const statEnProceso = document.getElementById("statEnProceso");
const statEnValidacion = document.getElementById("statEnValidacion");
const statCerrados = document.getElementById("statCerrados");
const statCancelados = document.getElementById("statCancelados");
const filterStatus = document.getElementById("filterStatus");

const searchTicketTop = document.getElementById("searchTicketTop");

const filterHeaderColor = document.getElementById("filterHeaderColor");
const filterHeaderFechaRegistro = document.getElementById("filterHeaderFechaRegistro");
const filterHeaderId = document.getElementById("filterHeaderId");
const filterHeaderCu = document.getElementById("filterHeaderCu");
const filterHeaderSite = document.getElementById("filterHeaderSite");
const filterHeaderZona = document.getElementById("filterHeaderZona");
const filterHeaderIncidencia = document.getElementById("filterHeaderIncidencia");
const filterHeaderAfectacion = document.getElementById("filterHeaderAfectacion");
const filterHeaderTorre = document.getElementById("filterHeaderTorre");
const filterHeaderEstado = document.getElementById("filterHeaderEstado");
const filterHeaderResponsable = document.getElementById("filterHeaderResponsable");
const filterHeaderDias = document.getElementById("filterHeaderDias");

const updateEstado = document.getElementById("updateEstado");
const updateValidado = document.getElementById("updateValidado");
const updateTorre = document.getElementById("updateTorre");
const updateResponsable = document.getElementById("updateResponsable");
const updateComentario = document.getElementById("updateComentario");
const btnGuardarActualizacion = document.getElementById("btnGuardarActualizacion");
const btnLimpiarGestion = document.getElementById("btnLimpiarGestion");

const menuBandeja = document.getElementById("menuBandeja");
const menuReportes = document.getElementById("menuReportes");
const bandejaView = document.getElementById("bandejaView");
const reportesView = document.getElementById("reportesView");
const pageTitle = document.getElementById("pageTitle");

const reportModal = document.getElementById("reportModal");
const reportPdfArea = document.getElementById("reportPdfArea");
const reportFiltrosAplicados = document.getElementById("reportFiltrosAplicados");
const reportChartMensual = document.getElementById("reportChartMensual");
const reportChartEstado = document.getElementById("reportChartEstado");
const reportResumenBody = document.getElementById("reportResumenBody");
const reportNotas = document.getElementById("reportNotas");
const reportGeneratedAt = document.getElementById("reportGeneratedAt");
const reportFooterFecha = document.getElementById("reportFooterFecha");
const reportTotalTickets = document.getElementById("reportTotalTickets");
const btnCerrarReporte = document.getElementById("btnCerrarReporte");
const btnDescargarReporteExcel = document.getElementById("btnDescargarReporteExcel");
const btnDescargarReportePdf = document.getElementById("btnDescargarReportePdf");
const btnAgregarTicketsReporte = document.getElementById("btnAgregarTicketsReporte");
const addTicketModal = document.getElementById("addTicketModal");
const btnCerrarAgregarTickets = document.getElementById("btnCerrarAgregarTickets");
const btnCancelarAgregarTickets = document.getElementById("btnCancelarAgregarTickets");
const btnAplicarAgregarTickets = document.getElementById("btnAplicarAgregarTickets");
const addTicketSearch = document.getElementById("addTicketSearch");
const addTicketResultados = document.getElementById("addTicketResultados");
const addTicketSeleccionados = document.getElementById("addTicketSeleccionados");

const chartGeneral = document.getElementById("chartGeneral");
const chartPorTorre = document.getElementById("chartPorTorre");
const filterReporteTorre = document.getElementById("filterReporteTorre");
const filterReporteEstadoTorrero = document.getElementById("filterReporteEstadoTorrero");
const filterReporteIncidencia = document.getElementById("filterReporteIncidencia");
const filterReporteAfectacion = document.getElementById("filterReporteAfectacion");
const filterReporteEstadoMes = document.getElementById("filterReporteEstadoMes");
const chartPorMes = document.getElementById("chartPorMes");

const panelResizer = document.getElementById("panelResizer");

let ticketsData = [];
let ticketsFiltrados = [];
let ticketSeleccionado = null;
let selectedTicketId = null;
let ticketsReporteBase = [];
let ticketsReporteExtras = [];
let ticketsReporteFinal = [];
let ticketsAgregarTemporal = new Set();
let historialTicketsCache = new Map();
let historialTicketRequestSeq = 0;


/* =========================
   PERMISOS / ROLES
========================= */
function obtenerRolUsuarioActual() {
  return String(localStorage.getItem("rolUsuario") || "editor").trim().toLowerCase();
}

function esUsuarioVisualizador() {
  return obtenerRolUsuarioActual() === "viewer";
}

function obtenerModulosUsuarioActual() {
  try {
    const modulos = JSON.parse(localStorage.getItem("modulosUsuario") || "[]");
    return Array.isArray(modulos) && modulos.length ? modulos : ["bandeja", "blackcases", "reportes"];
  } catch (_) {
    return ["bandeja", "blackcases", "reportes"];
  }
}

function puedeVerModulo(nombreModulo) {
  const rol = obtenerRolUsuarioActual();
  if (rol === "admin") return true;
  return obtenerModulosUsuarioActual().includes(nombreModulo);
}

function aplicarPermisosUI() {
  const viewer = esUsuarioVisualizador();
  document.body.classList.toggle("viewer-mode", viewer);

  if (menuBandeja) menuBandeja.style.display = puedeVerModulo("bandeja") ? "" : "none";
  if (menuReportes) menuReportes.style.display = puedeVerModulo("reportes") ? "" : "none";
  const menuBlackCasesPerm = document.getElementById("menuBlackCases");
  if (menuBlackCasesPerm) menuBlackCasesPerm.style.display = puedeVerModulo("blackcases") ? "" : "none";

  [btnGuardarActualizacion, btnLimpiarGestion].forEach(btn => {
    if (btn) btn.style.display = viewer ? "none" : "";
  });

  const updateBox = document.querySelector(".update-box");
  if (updateBox) {
    updateBox.querySelectorAll("input, select, textarea, button").forEach(el => {
      if (el.id !== "btnLimpiarGestion") el.disabled = viewer;
    });
  }
}

const COLORES_FILA = {
  "": {
    label: "Sin color",
    color: "#ffffff",
    background: ""
  },
  naranja: {
    label: "Naranja",
    color: "#f59e0b",
    background: "#f5c16c"
  },
  rojo: {
    label: "Rojo",
    color: "#ef4444",
    background: "#f3a4a4"
  },
  verde: {
    label: "Verde limón",
    color: "#84cc16",
    background: "#b7d95a"
  },
  plomo: {
    label: "Plomo",
    color: "#6b7280",
    background: "#c4c7cc"
  }
};

function normalizarColorTicket(valor) {
  const texto = String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto === "naranja" || texto === "anaranjado" || texto === "ambar") return "naranja";
  if (texto === "rojo") return "rojo";
  if (texto === "verde" || texto === "verde limon") return "verde";
  if (texto === "plomo" || texto === "gris") return "plomo";

  return "";
}

function obtenerColorTicket(ticket) {
  const colorKey = normalizarColorTicket(ticket?.COLOR);
  return Object.prototype.hasOwnProperty.call(COLORES_FILA, colorKey) ? colorKey : "";
}

function obtenerLabelColorTicket(ticket) {
  const colorKey = obtenerColorTicket(ticket);
  return COLORES_FILA[colorKey]?.label || "Sin color";
}

function obtenerBackgroundColorTicket(ticket) {
  const colorKey = obtenerColorTicket(ticket);
  return COLORES_FILA[colorKey]?.background || "";
}


const OPCIONES_RESPONSABLE = [
  "ENERGÍA",
  "FACILITIES",
  "LEASES",
  "DESPLIEGUE",
  "TERRITORIOS"
];

const OPCIONES_TORRE = [
  "TELEFÓNICA",
  "IPT",
  "ATP",
  "SITES PERU",
  "ATC",
  "PHOENIX",
  "TBS",
  "QMC",
  "ICON TOWER",
  "TERCEROS_INTEGRAME",
  "ENTEL",
  "TERCEROS_GOBIERNO_REGIONAL",
  "SBA",
  "TERCEROS_MINA",
  "SIN TORRE",
  "MINERA CERRO VERDE",
  "ICONTOWER",
  "INTEGRATEL",
  "DESARROLLOS TERRESTRES",
  "INFRATEL TOWERS",
  "BITEL",
  "TORRECOM",
  "CLARO",
  "PRONATEL",
  "FITEL",
  "TERCEROS_CLINICA ANGLOAMERICA",
  "TEL. PARTNERS",
  "INFRATEL",
  "CENS",
  "TDP",
  "IPD",
  "TERCEROS_IPD",
  "TERCEROS_ENERSUR",
  "AMERICA TV",
  "TERCEROS_CEMENTOS PACASMAYO",
  "TELECOMMUNICATION PARTNERS",
  "AWC",
  "TERCEROS_MUNICIPALIDAD",
  "TERCEROS_SOUTHERN",
  "TERCEROS_CAMPOSOL"
];

const filtrosMultiples = {
  color: new Set(),
  fechaRegistro: new Set(),
  zona: new Set(),
  incidencia: new Set(),
  afectacion: new Set(),
  torre: new Set(),
  estado: new Set(),
  responsable: new Set(),
  dias: new Set()
};

const filtrosConfig = {
  color: {
    el: filterHeaderColor,
    label: "Color",
    selector: ticket => obtenerLabelColorTicket(ticket)
  },
  fechaRegistro: {
    el: filterHeaderFechaRegistro,
    label: "FECHA_REGISTRO",
    selector: ticket => formatearFechaSolo(ticket.FECHA_REGISTRO)
  },
  zona: {
    el: filterHeaderZona,
    label: "Zona",
    selector: ticket => ticket.ZONA || "Sin dato"
  },
  incidencia: {
    el: filterHeaderIncidencia,
    label: "T. Incidencia",
    selector: ticket => ticket.INCIDENCIA
  },
  afectacion: {
    el: filterHeaderAfectacion,
    label: "T. Afectación",
    selector: ticket => ticket.AFECTACION
  },
  torre: {
    el: filterHeaderTorre,
    label: "Torre",
    selector: ticket => ticket.TORRERO
  },
  estado: {
    el: filterHeaderEstado,
    label: "Estado",
    selector: ticket => ticket.ESTADO
  },
  responsable: {
    el: filterHeaderResponsable,
    label: "Responsable",
    selector: ticket => ticket.RESPONSABLE || "Sin asignar"
  },
  dias: {
    el: filterHeaderDias,
    label: "Días",
    selector: ticket => String(ticket.DIAS_CALCULADOS ?? 0)
  }
};

const INACTIVIDAD_MINUTOS = 15;
const INACTIVIDAD_MS = INACTIVIDAD_MINUTOS * 60 * 1000;
let temporizadorInactividad = null;

function showLoader(texto = "Cargando data...") {
  if (loaderText) loaderText.textContent = texto;
  if (loaderOverlay) loaderOverlay.classList.remove("hidden");
}

function hideLoader() {
  if (loaderOverlay) loaderOverlay.classList.add("hidden");
}

function mostrarToastCentral(titulo = "Listo", mensaje = "Operación realizada correctamente.", duracion = 1400) {
  const toast = document.getElementById("toastCenter");
  const title = document.getElementById("toastTitle");
  const msg = document.getElementById("toastMessage");
  if (!toast) return;
  if (title) title.textContent = titulo;
  if (msg) msg.textContent = mensaje;
  toast.classList.remove("hidden");
  clearTimeout(mostrarToastCentral._timer);
  mostrarToastCentral._timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, duracion);
}

function construirTextoHistorialLocal(payload) {
  const partes = [];
  if (payload.estado) partes.push(`Estado: ${payload.estado}`);
  if (payload.validado) partes.push(`Validado: ${payload.validado}`);
  if (payload.responsable) partes.push(`Responsable: ${payload.responsable}`);
  if (payload.torre) partes.push(`Torrero: ${payload.torre}`);
  if (payload.comentario) partes.push(`Comentario: ${payload.comentario}`);
  return partes.join(" | ") || "Actualización registrada";
}

async function apiPostDashboard(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.json();
}

function abrirPasswordModal() {
  const modal = document.getElementById("passwordModal");
  const msg = document.getElementById("passwordModalMsg");
  if (msg) msg.textContent = "";
  if (modal) modal.classList.remove("hidden");
}

function cerrarPasswordModal() {
  const modal = document.getElementById("passwordModal");
  if (modal) modal.classList.add("hidden");
  ["passwordActual", "passwordNueva", "passwordNueva2"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

async function guardarCambioPasswordDashboard() {
  const msg = document.getElementById("passwordModalMsg");
  const actual = document.getElementById("passwordActual")?.value || "";
  const nueva = document.getElementById("passwordNueva")?.value || "";
  const nueva2 = document.getElementById("passwordNueva2")?.value || "";
  const email = localStorage.getItem("correoUsuario") || "";

  if (msg) {
    msg.textContent = "";
    msg.style.color = "#dc2626";
  }

  if (!actual || !nueva || !nueva2) {
    if (msg) msg.textContent = "Completa todos los campos.";
    return;
  }

  if (nueva !== nueva2) {
    if (msg) msg.textContent = "Las nuevas contraseñas no coinciden.";
    return;
  }

  if (nueva.length < 6) {
    if (msg) msg.textContent = "La nueva contraseña debe tener mínimo 6 caracteres.";
    return;
  }

  const btn = document.getElementById("btnGuardarPassword");
  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Guardando...";
    }

    const resultado = await apiPostDashboard({
      accion: "cambiarPassword",
      email,
      passwordActual: actual,
      passwordNueva: nueva
    });

    if (!resultado || resultado.ok !== true) {
      throw new Error(resultado?.mensaje || resultado?.detalle || "No se pudo cambiar la contraseña");
    }

    if (msg) {
      msg.style.color = "#16a34a";
      msg.textContent = "Contraseña actualizada. Se cerrará la sesión.";
    }

    setTimeout(() => {
      cerrarPasswordModal();
      cerrarSesion("Contraseña actualizada");
    }, 750);
  } catch (error) {
    if (msg) msg.textContent = String(error.message || error);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Guardar contraseña";
    }
  }
}

function inicializarCambioPassword() {
  if (btnCambiarPassword) btnCambiarPassword.addEventListener("click", abrirPasswordModal);
  const btnCerrar = document.getElementById("btnCerrarPasswordModal");
  const btnCancelar = document.getElementById("btnCancelarPassword");
  const btnGuardar = document.getElementById("btnGuardarPassword");
  const modal = document.getElementById("passwordModal");
  if (btnCerrar) btnCerrar.addEventListener("click", cerrarPasswordModal);
  if (btnCancelar) btnCancelar.addEventListener("click", cerrarPasswordModal);
  if (btnGuardar) btnGuardar.addEventListener("click", guardarCambioPasswordDashboard);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) cerrarPasswordModal();
    });
  }
}

function validarSesion() {
  const logueado = localStorage.getItem("usuarioLogueado");
  const correoUsuario = localStorage.getItem("correoUsuario");

  if (logueado !== "true" || !correoUsuario) {
    limpiarSesion();
    window.location.replace("index.html");
    return false;
  }

  return true;
}

function limpiarSesion() {
  localStorage.removeItem("usuarioLogueado");
  localStorage.removeItem("correoUsuario");
  localStorage.removeItem("nombreUsuario");
  localStorage.removeItem("rolUsuario");
  localStorage.removeItem("modulosUsuario");
  localStorage.removeItem("ultimaActividad");
}

function mostrarOverlaySesion(titulo = "Cerrando sesión...", mensaje = "Un momento por favor.") {
  const overlay = document.getElementById("sessionOverlay");
  const title = document.getElementById("sessionOverlayTitle");
  const msg = document.getElementById("sessionOverlayMessage");
  if (title) title.textContent = titulo;
  if (msg) msg.textContent = mensaje;
  if (overlay) overlay.classList.remove("hidden");
}

function cerrarSesion(motivo = "Cerrando sesión...") {
  mostrarOverlaySesion("Cerrando sesión...", "Te estamos enviando al login.");
  setTimeout(() => {
    limpiarSesion();
    window.location.replace("index.html");
  }, 650);
}

function reiniciarTemporizadorInactividad() {
  localStorage.setItem("ultimaActividad", String(Date.now()));

  if (temporizadorInactividad) {
    clearTimeout(temporizadorInactividad);
  }

  temporizadorInactividad = setTimeout(() => {
    cerrarSesion("La sesión se cerró automáticamente por 15 minutos de inactividad.");
  }, INACTIVIDAD_MS);
}

function vigilarInactividad() {
  const eventos = ["click", "mousemove", "keydown", "scroll", "touchstart"];

  eventos.forEach((evento) => {
    document.addEventListener(evento, reiniciarTemporizadorInactividad, { passive: true });
  });

  reiniciarTemporizadorInactividad();
}

function restaurarSidebar() {
  const sidebarColapsado = localStorage.getItem("sidebarColapsado") === "true";
  document.body.classList.toggle("sidebar-collapsed", sidebarColapsado);
}

function toggleSidebar() {
  const colapsado = document.body.classList.toggle("sidebar-collapsed");
  localStorage.setItem("sidebarColapsado", String(colapsado));
}

function actualizarCorreoUsuario() {
  const correoUsuario = localStorage.getItem("correoUsuario");
  if (correoUsuarioTexto) {
    correoUsuarioTexto.textContent = correoUsuario || "Sin usuario";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!validarSesion()) return;

  restaurarSidebar();
  actualizarCorreoUsuario();
  aplicarPermisosUI();
  vigilarInactividad();
  inicializarResizerPaneles();

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener("click", toggleSidebar);
  }

  inicializarCambioPassword();

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      cerrarSesion("Sesión cerrada correctamente.");
    });
  }

  if (menuBandeja) {
    menuBandeja.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarVista("bandeja");
    });
  }



  if (menuReportes) {
    menuReportes.addEventListener("click", (e) => {
      e.preventDefault();
      mostrarVista("reportes");
    });
  }

  if (searchTicketTop) {
    searchTicketTop.addEventListener("input", aplicarFiltros);
  }

  [filterHeaderId, filterHeaderCu, filterHeaderSite].forEach(input => {
    if (input) {
      input.addEventListener("input", aplicarFiltros);
    }
  });

  Object.entries(filtrosConfig).forEach(([campo, config]) => {
    if (config.el) {
      config.el.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  });

  document.addEventListener("click", () => {
    cerrarTodosLosFiltrosMultiples();
    document.querySelectorAll(".row-color-picker.open").forEach(el => {
      el.classList.remove("open");
    });
  });

  if (filterReporteTorre) {
    filterReporteTorre.addEventListener("change", renderizarReportes);
  }

  if (filterReporteEstadoTorrero) {
    filterReporteEstadoTorrero.addEventListener("change", renderizarReportes);
  }

  if (filterReporteIncidencia) {
    filterReporteIncidencia.addEventListener("change", renderizarReportes);
  }

  if (filterReporteAfectacion) {
    filterReporteAfectacion.addEventListener("change", renderizarReportes);
  }

  if (filterReporteEstadoMes) {
    filterReporteEstadoMes.addEventListener("change", renderizarReportes);
  }



  if (btnLimpiarGestion) {
    btnLimpiarGestion.addEventListener("click", limpiarFormularioGestion);
  }

  if (btnGuardarActualizacion) {
    btnGuardarActualizacion.addEventListener("click", guardarActualizacion);
  }

  if (btnRefrescarData) {
    btnRefrescarData.addEventListener("click", async () => {
      await cargarTickets(selectedTicketId, {
        showLoading: true,
        loadingText: "Refrescando data..."
      });
    });
  }

  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener("click", limpiarFiltros);
  }

  if (btnGenerarReporte) {
    btnGenerarReporte.addEventListener("click", abrirVentanaReporte);
  }

  if (btnCerrarReporte) {
    btnCerrarReporte.addEventListener("click", cerrarVentanaReporte);
  }

  if (btnDescargarReporteExcel) {
    btnDescargarReporteExcel.addEventListener("click", descargarReporteExcel);
  }

  if (btnAgregarTicketsReporte) {
    btnAgregarTicketsReporte.addEventListener("click", abrirAgregarTicketsReporte);
  }

  if (btnCerrarAgregarTickets) {
    btnCerrarAgregarTickets.addEventListener("click", cerrarAgregarTicketsReporte);
  }

  if (btnCancelarAgregarTickets) {
    btnCancelarAgregarTickets.addEventListener("click", cerrarAgregarTicketsReporte);
  }

  if (btnAplicarAgregarTickets) {
    btnAplicarAgregarTickets.addEventListener("click", aplicarTicketsAgregadosReporte);
  }

  if (addTicketSearch) {
    addTicketSearch.addEventListener("input", renderizarResultadosAgregarTickets);
  }

  if (addTicketModal) {
    addTicketModal.addEventListener("click", (e) => {
      if (e.target === addTicketModal) cerrarAgregarTicketsReporte();
    });
  }

  if (reportModal) {
    reportModal.addEventListener("click", (e) => {
      if (e.target === reportModal) cerrarVentanaReporte();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && addTicketModal && !addTicketModal.classList.contains("hidden")) {
      cerrarAgregarTicketsReporte();
      return;
    }

    if (e.key === "Escape" && reportModal && !reportModal.classList.contains("hidden")) {
      cerrarVentanaReporte();
    }
  });

  if (btnDescargarReportePdf) {
    btnDescargarReportePdf.addEventListener("click", descargarReportePdf);
  }

  await cargarTickets(null, {
    showLoading: true,
    loadingText: "Cargando data..."
  });
});

window.addEventListener("pageshow", () => {
  validarSesion();
});

window.addEventListener("focus", () => {
  validarSesion();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    validarSesion();
  }
});

/* =========================
   VISTAS
========================= */
function mostrarVista(vista) {
  const esBandeja = vista === "bandeja";
  const esReportes = vista === "reportes";

  if (bandejaView) bandejaView.classList.toggle("hidden", !esBandeja);
  if (reportesView) reportesView.classList.toggle("hidden", !esReportes);

  const blackCasesViewLocal = document.getElementById("blackCasesView");
  const blackCaseDrawerLocal = document.getElementById("blackCaseDrawer");
  const menuBlackCasesLocal = document.getElementById("menuBlackCases");
  if (blackCasesViewLocal) blackCasesViewLocal.classList.add("hidden");
  if (blackCaseDrawerLocal) blackCaseDrawerLocal.classList.add("hidden");
  if (menuBlackCasesLocal) menuBlackCasesLocal.classList.remove("active");

  if (menuBandeja) menuBandeja.classList.toggle("active", esBandeja);
  if (menuReportes) menuReportes.classList.toggle("active", esReportes);

  document.body.classList.toggle("reportes-activo", esReportes);
  if (esReportes) {
    ajustarPowerBI();
  }

  if (pageTitle) {
    if (esBandeja) pageTitle.textContent = "REPORTINC";
    if (esReportes) pageTitle.textContent = "Reportes";
  }

  if (searchTicketTop) {
    searchTicketTop.style.display = esBandeja ? "block" : "none";
  }

  if (btnRefrescarData) {
    btnRefrescarData.style.display = esBandeja ? "inline-flex" : "none";
  }

  const topbarStats = document.getElementById("topbarStats");
  if (topbarStats) {
    topbarStats.style.display = esBandeja ? "grid" : "none";
  }

  if (filterStatus) {
    filterStatus.classList.toggle("hidden", !esBandeja || !hayFiltroAplicado());
  }

  aplicarPermisosUI();
}


/* =========================
   RESIZER DE PANELES
========================= */
function inicializarResizerPaneles() {
  if (!panelResizer || !bandejaView) return;

  const anchoGuardado = localStorage.getItem("anchoPanelTickets");
  if (anchoGuardado && Number(anchoGuardado) > 0 && window.innerWidth > 1280) {
    bandejaView.style.gridTemplateColumns = `${Number(anchoGuardado)}px 8px minmax(420px, 1fr)`;
  }

  let arrastrando = false;

  panelResizer.addEventListener("mousedown", (e) => {
    if (window.innerWidth <= 1280) return;

    arrastrando = true;
    document.body.classList.add("resizing-panels");
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!arrastrando) return;

    const rect = bandejaView.getBoundingClientRect();
    const anchoTotal = rect.width;
    const posicionMouse = e.clientX - rect.left;

    const minimoIzquierda = 360;
    const minimoDerecha = 420;
    const anchoResizer = 8;

    let nuevoAnchoIzquierda = posicionMouse;

    if (nuevoAnchoIzquierda < minimoIzquierda) {
      nuevoAnchoIzquierda = minimoIzquierda;
    }

    if (nuevoAnchoIzquierda > anchoTotal - minimoDerecha - anchoResizer) {
      nuevoAnchoIzquierda = anchoTotal - minimoDerecha - anchoResizer;
    }

    bandejaView.style.gridTemplateColumns = `${nuevoAnchoIzquierda}px 8px minmax(${minimoDerecha}px, 1fr)`;
    localStorage.setItem("anchoPanelTickets", String(Math.round(nuevoAnchoIzquierda)));
  });

  document.addEventListener("mouseup", () => {
    if (!arrastrando) return;

    arrastrando = false;
    document.body.classList.remove("resizing-panels");
  });
}

/* =========================
   DATA
========================= */
async function cargarTickets(idASeleccionar = null, options = {}) {
  const {
    showLoading = true,
    loadingText = "Cargando data..."
  } = options;

  try {
    if (showLoading) showLoader(loadingText);

    const response = await fetch(`${API_URL}?accion=obtenerTickets`, {
      method: "GET",
      cache: "no-store"
    });

    const tickets = await response.json();

    if (!Array.isArray(tickets)) {
      console.error("La respuesta no es una lista válida:", tickets);
      tbody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align:center; padding:20px;">
            No se pudo cargar la data.
          </td>
        </tr>
      `;
      limpiarDetalle();
      return;
    }

    ticketsData = tickets.map(ticket => ({
      ...ticket,
      DIAS_CALCULADOS: calcularDiasTicket(ticket.FECHA_REGISTRO, ticket.FECHA_CIERRE),
      VALIDADO: normalizarValidado(ticket.VALIDADO),
      RESPONSABLE: String(ticket.RESPONSABLE || "").trim(),
      COLOR: normalizarColorTicket(ticket.COLOR)
    }));

    if (idASeleccionar) {
      selectedTicketId = idASeleccionar;
    }

    cargarFiltrosReportes();
    actualizarOpcionesFiltrosEncabezados();
    aplicarFiltros();
    renderizarReportes();
  } catch (error) {
    console.error("Error al cargar tickets:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center; padding:20px;">
          Error al cargar la data.
        </td>
      </tr>
    `;
    limpiarDetalle();
  } finally {
    if (showLoading) hideLoader();
  }
}

function configurarStatsBandeja() {
  const cards = document.querySelectorAll("#topbarStats .stat-card");
  cards.forEach(card => card.style.display = "flex");

  const labels = document.querySelectorAll("#topbarStats .stat-card span");
  if (labels[0]) labels[0].textContent = "Total tickets";
  if (labels[1]) labels[1].textContent = "Abiertos";
  if (labels[2]) labels[2].textContent = "En proceso";
  if (labels[3]) labels[3].textContent = "En validación";
  if (labels[4]) labels[4].textContent = "Cerrados";
  if (labels[5]) labels[5].textContent = "Cancelados";
}

function actualizarTarjetas(tickets) {
  configurarStatsBandeja();

  const total = tickets.length;
  const abiertos = tickets.filter(t => normalizarEstado(t.ESTADO) === "abierto").length;
  const enProceso = tickets.filter(t => normalizarEstado(t.ESTADO) === "en proceso").length;
  const enValidacion = tickets.filter(t => {
    const estado = normalizarEstado(t.ESTADO);
    return estado === "en validación" || estado === "en validacion";
  }).length;
  const cerrados = tickets.filter(t => normalizarEstado(t.ESTADO) === "cerrado").length;
  const cancelados = tickets.filter(t => normalizarEstado(t.ESTADO) === "cancelado").length;

  if (statTotal) statTotal.textContent = total;
  if (statAbiertos) statAbiertos.textContent = abiertos;
  if (statEnProceso) statEnProceso.textContent = enProceso;
  if (statEnValidacion) statEnValidacion.textContent = enValidacion;
  if (statCerrados) statCerrados.textContent = cerrados;
  if (statCancelados) statCancelados.textContent = cancelados;
}

function limpiarFiltros() {
  if (searchTicketTop) searchTicketTop.value = "";
  if (filterHeaderId) filterHeaderId.value = "";
  if (filterHeaderCu) filterHeaderCu.value = "";
  if (filterHeaderSite) filterHeaderSite.value = "";

  Object.keys(filtrosMultiples).forEach(campo => {
    filtrosMultiples[campo].clear();
  });

  selectedTicketId = null;
  cerrarTodosLosFiltrosMultiples();
  aplicarFiltros();
}

function obtenerFiltrosActuales() {
  return {
    busquedaGeneral: (searchTicketTop?.value || "").trim().toLowerCase(),
    color: new Set(filtrosMultiples.color),
    fechaRegistro: new Set(filtrosMultiples.fechaRegistro),
    zona: new Set(filtrosMultiples.zona),
    id: (filterHeaderId?.value || "").trim().toLowerCase(),
    cu: (filterHeaderCu?.value || "").trim().toLowerCase(),
    site: (filterHeaderSite?.value || "").trim().toLowerCase(),
    incidencia: new Set(filtrosMultiples.incidencia),
    afectacion: new Set(filtrosMultiples.afectacion),
    torre: new Set(filtrosMultiples.torre),
    estado: new Set(filtrosMultiples.estado),
    responsable: new Set(filtrosMultiples.responsable),
    dias: new Set(filtrosMultiples.dias)
  };
}

function obtenerValorCampo(ticket, campo) {
  if (campo === "color") {
    const color = obtenerColorTicket(ticket);
    return color || "sin_color";
  }

  if (campo === "fechaRegistro") return formatearFechaSolo(ticket.FECHA_REGISTRO);
  if (campo === "zona") return String(ticket.ZONA || "Sin dato").trim() || "Sin dato";
  if (campo === "incidencia") return String(ticket.INCIDENCIA || "").trim();
  if (campo === "afectacion") return String(ticket.AFECTACION || "").trim();
  if (campo === "torre") return String(ticket.TORRERO || "").trim();
  if (campo === "estado") return String(ticket.ESTADO || "").trim();
  if (campo === "responsable") return String(ticket.RESPONSABLE || "Sin asignar").trim() || "Sin asignar";
  if (campo === "dias") return String(ticket.DIAS_CALCULADOS ?? 0);
  return "";
}

function ticketCumpleFiltros(ticket, filtros, excluirCampo = null) {
  const id = String(ticket.ID || "").toLowerCase();
  const cu = String(ticket.CU || "").toLowerCase();
  const site = String(ticket.SITE || "").toLowerCase();
  const zona = String(ticket.ZONA || "").toLowerCase();

  const cumpleBusquedaGeneral =
    filtros.busquedaGeneral === "" ||
    id.includes(filtros.busquedaGeneral) ||
    site.includes(filtros.busquedaGeneral) ||
    zona.includes(filtros.busquedaGeneral) ||
    cu.includes(filtros.busquedaGeneral);

  if (excluirCampo !== "busquedaGeneral" && !cumpleBusquedaGeneral) return false;
  if (excluirCampo !== "id" && filtros.id !== "" && !id.includes(filtros.id)) return false;
  if (excluirCampo !== "cu" && filtros.cu !== "" && !cu.includes(filtros.cu)) return false;
  if (excluirCampo !== "site" && filtros.site !== "" && !site.includes(filtros.site)) return false;

  const camposMultiples = ["color", "fechaRegistro", "zona", "incidencia", "afectacion", "torre", "estado", "responsable", "dias"];

  for (const campo of camposMultiples) {
    if (excluirCampo === campo) continue;

    const seleccionados = filtros[campo];
    if (seleccionados && seleccionados.size > 0) {
      const valorTicket = obtenerValorCampo(ticket, campo);
      if (!seleccionados.has(valorTicket)) return false;
    }
  }

  return true;
}

function aplicarFiltros() {
  const filtros = obtenerFiltrosActuales();

  ticketsFiltrados = ticketsData.filter(ticket => ticketCumpleFiltros(ticket, filtros));

  actualizarTarjetas(ticketsFiltrados);
  actualizarEstadoFiltro();
  actualizarEstadoVisualFiltrosTexto();
  actualizarOpcionesFiltrosEncabezados();
  renderizarTabla(ticketsFiltrados);
}

function hayFiltroAplicado() {
  const filtros = obtenerFiltrosActuales();

  const hayFiltroMultiple = Object.keys(filtrosMultiples).some(campo => filtrosMultiples[campo].size > 0);

  return Boolean(
    filtros.busquedaGeneral ||
    filtros.id ||
    filtros.cu ||
    filtros.site ||
    hayFiltroMultiple
  );
}

function actualizarEstadoFiltro() {
  if (!filterStatus) return;
  filterStatus.classList.toggle("hidden", !hayFiltroAplicado());
}

function actualizarEstadoVisualFiltrosTexto() {
  if (filterHeaderId) filterHeaderId.classList.toggle("filter-active", filterHeaderId.value.trim() !== "");
  if (filterHeaderCu) filterHeaderCu.classList.toggle("filter-active", filterHeaderCu.value.trim() !== "");
  if (filterHeaderSite) filterHeaderSite.classList.toggle("filter-active", filterHeaderSite.value.trim() !== "");
}

function actualizarOpcionesFiltrosEncabezados() {
  const filtros = obtenerFiltrosActuales();

  Object.entries(filtrosConfig).forEach(([campo, config]) => {
    const opciones = obtenerValoresDisponibles(campo, filtros, config.selector);
    renderizarFiltroMultiple(campo, opciones);
  });
}

function obtenerValoresDisponibles(campoExcluido, filtros, selectorValor) {
  if (campoExcluido === "color") {
    return ["sin_color", "naranja", "rojo", "verde", "plomo"];
  }

  return [...new Set(
    ticketsData
      .filter(ticket => ticketCumpleFiltros(ticket, filtros, campoExcluido))
      .map(ticket => String(selectorValor(ticket) || "").trim())
      .filter(Boolean)
  )].sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);

    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    return a.localeCompare(b, "es");
  });
}

function renderizarFiltroMultiple(campo, opciones) {
  const config = filtrosConfig[campo];
  if (!config || !config.el) return;

  const seleccionados = filtrosMultiples[campo];
  const estabaAbierto = config.el.classList.contains("open");
  const tieneFiltro = seleccionados.size > 0;

  config.el.classList.toggle("filter-active", tieneFiltro);

  function obtenerTextoFiltro(valor) {
    if (campo === "color") {
      if (valor === "sin_color") return "Sin color";
      return COLORES_FILA[valor]?.label || valor;
    }

    return valor;
  }

  const textoBoton =
    seleccionados.size === 0
      ? "Todos"
      : seleccionados.size === 1
        ? obtenerTextoFiltro([...seleccionados][0])
        : `${seleccionados.size} seleccionados`;

  const opcionesHtml = opciones.length === 0
    ? `<div class="multi-filter-empty">Sin opciones</div>`
    : opciones.map(valor => {
        const checked = seleccionados.has(valor) ? "checked" : "";
        const textoVisible = obtenerTextoFiltro(valor);

        return `
          <label class="multi-filter-option" title="${escapeAttribute(textoVisible)}">
            <input type="checkbox" value="${escapeAttribute(valor)}" ${checked} />
            <span>${escapeHtml(textoVisible)}</span>
          </label>
        `;
      }).join("");

  config.el.innerHTML = `
    <button class="multi-filter-button" type="button" title="${escapeAttribute(textoBoton)}">
      <span>${escapeHtml(textoBoton)}</span>
      <span class="multi-filter-arrow">▼</span>
    </button>

    <div class="multi-filter-menu">
      <div class="multi-filter-actions">
        <button class="multi-filter-small-btn" type="button" data-action="select-all">Todos</button>
        <button class="multi-filter-small-btn" type="button" data-action="clear">Limpiar</button>
      </div>

      <div class="multi-filter-list">
        ${opcionesHtml}
      </div>
    </div>
  `;

  if (estabaAbierto) {
    config.el.classList.add("open");
  }

  const button = config.el.querySelector(".multi-filter-button");
  const menu = config.el.querySelector(".multi-filter-menu");

  if (button) {
    button.addEventListener("click", (e) => {
      e.stopPropagation();

      const estabaAbiertoAhora = config.el.classList.contains("open");
      cerrarTodosLosFiltrosMultiples();

      if (!estabaAbiertoAhora) {
        config.el.classList.add("open");
        posicionarMenuFiltro(config.el);
      }
    });
  }

  if (menu) {
    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  const btnTodos = config.el.querySelector('[data-action="select-all"]');
  const btnLimpiar = config.el.querySelector('[data-action="clear"]');

  if (btnTodos) {
    btnTodos.addEventListener("click", (e) => {
      e.stopPropagation();
      filtrosMultiples[campo] = new Set(opciones);
      aplicarFiltros();
      config.el.classList.add("open");
      posicionarMenuFiltro(config.el);
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", (e) => {
      e.stopPropagation();
      filtrosMultiples[campo].clear();
      aplicarFiltros();
      config.el.classList.add("open");
      posicionarMenuFiltro(config.el);
    });
  }

  config.el.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();

      const valor = checkbox.value;

      if (checkbox.checked) {
        filtrosMultiples[campo].add(valor);
      } else {
        filtrosMultiples[campo].delete(valor);
      }

      aplicarFiltros();
      config.el.classList.add("open");
      posicionarMenuFiltro(config.el);
    });
  });
}

function posicionarMenuFiltro(filtroEl) {
  const menu = filtroEl.querySelector(".multi-filter-menu");
  const boton = filtroEl.querySelector(".multi-filter-button");

  if (!menu || !boton) return;

  const rect = boton.getBoundingClientRect();
  const menuWidth = Math.max(rect.width, 210);
  const margen = 8;

  let left = rect.left;
  let top = rect.bottom + 4;

  if (left + menuWidth > window.innerWidth - margen) {
    left = window.innerWidth - menuWidth - margen;
  }

  if (top + 280 > window.innerHeight - margen) {
    top = rect.top - 284;
  }

  menu.style.left = `${Math.max(margen, left)}px`;
  menu.style.top = `${Math.max(margen, top)}px`;
  menu.style.width = `${menuWidth}px`;
}

function cerrarTodosLosFiltrosMultiples() {
  document.querySelectorAll(".multi-filter.open").forEach(el => {
    el.classList.remove("open");
  });
}

function renderizarTabla(tickets) {
  tbody.innerHTML = "";

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center; padding:20px;">
          No se encontraron tickets.
        </td>
      </tr>
    `;
    limpiarDetalle();
    return;
  }

  let ticketParaMostrar = null;

  tickets.forEach((ticket) => {
    const tr = document.createElement("tr");
    tr.className = "ticket-row";

    const esSeleccionado = selectedTicketId && String(ticket.ID) === String(selectedTicketId);
    if (esSeleccionado) {
      tr.classList.add("active-row");
      ticketParaMostrar = ticket;
    }

    const responsable = String(ticket.RESPONSABLE || "Sin asignar").trim() || "Sin asignar";
    const colorSeleccionado = obtenerColorTicket(ticket);
    const backgroundFila = obtenerBackgroundColorTicket(ticket);
    const colorDotBackground = COLORES_FILA[colorSeleccionado]?.color || "#ffffff";

    if (backgroundFila) {
      tr.style.background = backgroundFila;
    }

    tr.innerHTML = `
      <td class="color-cell">
        <div class="row-color-picker">
          <button
            class="row-color-dot"
            type="button"
            title="Cambiar color de fila"
            style="background:${escapeAttribute(colorDotBackground)};">
          </button>

          <div class="row-color-menu">
            ${Object.entries(COLORES_FILA).map(([key, item]) => `
              <button
                type="button"
                class="row-color-option"
                data-color="${escapeAttribute(key)}"
                title="${escapeAttribute(item.label)}"
              >
                <span style="background:${escapeAttribute(item.color)};"></span>
                ${escapeHtml(item.label)}
              </button>
            `).join("")}
          </div>
        </div>
      </td>
      <td title="${escapeAttribute(formatearFechaSolo(ticket.FECHA_REGISTRO))}">${escapeHtml(formatearFechaSolo(ticket.FECHA_REGISTRO))}</td>
      <td title="${escapeAttribute(ticket.ID || "")}">${escapeHtml(ticket.ID || "")}</td>
      <td title="${escapeAttribute(ticket.CU || "")}">${escapeHtml(ticket.CU || "")}</td>
      <td title="${escapeAttribute(ticket.SITE || "")}">${escapeHtml(ticket.SITE || "")}</td>
      <td title="${escapeAttribute(ticket.ZONA || "")}">${escapeHtml(ticket.ZONA || "")}</td>
      <td title="${escapeAttribute(ticket.INCIDENCIA || "")}">${escapeHtml(ticket.INCIDENCIA || "")}</td>
      <td title="${escapeAttribute(ticket.AFECTACION || "")}">${escapeHtml(ticket.AFECTACION || "")}</td>
      <td title="${escapeAttribute(ticket.TORRERO || "")}">${escapeHtml(ticket.TORRERO || "")}</td>
      <td>
        <span class="badge ${obtenerClaseEstado(ticket.ESTADO)}">
          ${escapeHtml(ticket.ESTADO || "")}
        </span>
      </td>
      <td title="${escapeAttribute(responsable)}">${escapeHtml(responsable)}</td>
      <td>${ticket.DIAS_CALCULADOS ?? 0}</td>
    `;

    tr.addEventListener("click", function () {
      selectedTicketId = ticket.ID;
      document.querySelectorAll(".ticket-row").forEach(f => f.classList.remove("active-row"));
      tr.classList.add("active-row");
      mostrarDetalle(ticket);
    });

    const colorPicker = tr.querySelector(".row-color-picker");
    const colorDot = tr.querySelector(".row-color-dot");

    if (colorPicker && colorDot && !esUsuarioVisualizador()) {
      colorDot.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".row-color-picker.open").forEach(el => {
          if (el !== colorPicker) el.classList.remove("open");
        });
        colorPicker.classList.toggle("open");
        if (colorPicker.classList.contains("open")) {
          posicionarMenuColor(colorPicker);
        }
      });

      colorPicker.querySelectorAll(".row-color-option").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const nuevoColor = btn.getAttribute("data-color") || "";
          guardarColorTicket(ticket.ID, nuevoColor);
        });
      });
    }

    tbody.appendChild(tr);
  });

  if (!ticketParaMostrar) {
    ticketParaMostrar = tickets[0];
    selectedTicketId = ticketParaMostrar.ID;

    const primeraFila = tbody.querySelector(".ticket-row");
    if (primeraFila) {
      primeraFila.classList.add("active-row");
    }
  }

  mostrarDetalle(ticketParaMostrar);
}

function limpiarDetalle() {
  ticketSeleccionado = null;
  selectedTicketId = null;

  setText("detailId", "-");
  setText("detailAsunto", "Sin resultados");
  setText("detailEmpresa", "-");
  setText("detailValidado", "-");
  setText("detailResponsable", "-");
  setText("detailDias", "0");
  setText("detailIncidencia", "-");
  setText("detailMantenimiento", "-");
  setText("detailDescripcion", "-");
  setText("detailReportado", "-");
  setText("detailArea", "-");
  setText("detailSite", "-");
  setText("detailZona", "-");
  setText("detailCU", "-");
  setText("detailSitio", "-");
  setText("detailTorrero", "-");
  setText("detailImpedimento", "-");
  setText("detailAfectacion", "-");
  setText("detailAtencion", "-");
  setText("detailPara", "-");
  setText("detailFechaRegistro", "-");

  const detailEstado = document.getElementById("detailEstado");
  if (detailEstado) {
    detailEstado.textContent = "-";
    detailEstado.className = "badge badge-gray";
  }

  renderizarEvidencias([]);

  const timeline = document.getElementById("timelineHistorial");
  if (timeline) timeline.innerHTML = "";

  limpiarFormularioGestion();
}

function normalizarEstado(estado) {
  return String(estado || "").trim().toLowerCase();
}

function normalizarValidado(valor) {
  const texto = String(valor || "").trim().toLowerCase();
  if (texto === "sí" || texto === "si") return "Sí";
  return "No";
}

function obtenerClaseEstado(estado) {
  const texto = normalizarEstado(estado);

  if (texto.includes("cerrado")) return "badge-success";
  if (texto.includes("cancelado")) return "badge-gray";
  if (texto.includes("abierto")) return "badge-danger";
  if (texto.includes("validación") || texto.includes("validacion")) return "badge-info";
  return "badge-warning";
}

function convertirAFechaLocal(fechaValor) {
  if (!fechaValor) return null;

  const fecha = new Date(fechaValor);
  if (isNaN(fecha.getTime())) return null;

  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function obtenerHoyPeruSoloFecha() {
  const hoyPeruTexto = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  return new Date(`${hoyPeruTexto}T00:00:00`);
}

function calcularDiasTicket(fechaRegistro, fechaCierre) {
  const fechaInicio = convertirAFechaLocal(fechaRegistro);
  if (!fechaInicio) return 0;

  const fechaFin = convertirAFechaLocal(fechaCierre) || obtenerHoyPeruSoloFecha();

  const diferenciaMs = fechaFin - fechaInicio;
  const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

  return dias >= 0 ? dias : 0;
}

function mostrarDetalle(ticket) {
  if (!ticket) {
    limpiarDetalle();
    return;
  }

  ticketSeleccionado = ticket;
  selectedTicketId = ticket.ID;

  setText("detailId", ticket.ID || "");
  setText("detailAsunto", ticket.ASUNTO || "Sin asunto");
  setText("detailEmpresa", ticket.EMPRESA || "-");
  setText("detailValidado", ticket.VALIDADO || "No");
  setText("detailResponsable", ticket.RESPONSABLE || "Sin asignar");
  setText("detailDias", ticket.DIAS_CALCULADOS ?? 0);
  setText("detailIncidencia", ticket.INCIDENCIA || "-");
  setText("detailMantenimiento", ticket.MANTENIMIENTO || ticket.MANETNIMIENTO || "-");
  setText("detailDescripcion", ticket.DESCRIPCION || "-");
  setText("detailReportado", ticket.REPORTADO || "-");
  setText("detailArea", ticket.AREA || "-");
  setText("detailSite", ticket.SITE || "-");
  setText("detailZona", ticket.ZONA || "-");
  setText("detailCU", ticket.CU || "-");
  setText("detailSitio", ticket.SITIO || "-");
  setText("detailTorrero", ticket.TORRERO || "-");
  setText("detailImpedimento", ticket.IMPEDIMENTO || "-");
  setText("detailAfectacion", ticket.AFECTACION || "-");
  setText("detailAtencion", ticket.ATENCION || "-");
  setText("detailPara", ticket.PARA || "-");
  setText("detailFechaRegistro", formatearFechaSolo(ticket.FECHA_REGISTRO));

  const detailEstado = document.getElementById("detailEstado");
  if (detailEstado) {
    detailEstado.textContent = ticket.ESTADO || "";
    detailEstado.className = `badge ${obtenerClaseEstado(ticket.ESTADO)}`;
  }

  renderizarEvidencias([
    ticket.EVIDENCIA_1 || "",
    ticket.EVIDENCIA_2 || "",
    ticket.EVIDENCIA_3 || ""
  ]);

  limpiarFormularioGestion();

  cargarHistorial(ticket.ID);
}

function limpiarFormularioGestion() {
  if (!updateEstado || !updateValidado || !updateResponsable || !updateComentario) return;

  updateEstado.value = "";
  updateValidado.value = "";
  if (updateTorre) updateTorre.value = "";
  updateResponsable.value = "";
  updateComentario.value = "";
}

async function guardarActualizacion() {
  if (esUsuarioVisualizador()) {
    mostrarToastCentral("Solo visualización", "Tu perfil no tiene permisos para guardar cambios.", 1800);
    return;
  }

  if (!ticketSeleccionado) {
    mostrarToastCentral("Selecciona un ticket", "Primero selecciona un ticket para actualizar.", 1800);
    return;
  }

  const estado = updateEstado.value.trim();
  const validado = updateValidado.value.trim();
  const torre = updateTorre ? updateTorre.value.trim() : "";
  const responsable = updateResponsable.value.trim();
  const comentario = updateComentario.value.trim();

  const payload = {
    accion: "guardarSeguimiento",
    id: ticketSeleccionado.ID,
    usuario: localStorage.getItem("nombreUsuario") || "Sin usuario",
    rolUsuario: obtenerRolUsuarioActual()
  };

  if (estado) payload.estado = estado;
  if (validado) payload.validado = validado;
  if (torre) payload.torre = torre;
  if (responsable) payload.responsable = responsable;
  if (comentario) payload.comentario = comentario;

  const noHayCambios =
    !payload.estado &&
    !payload.validado &&
    !payload.torre &&
    !payload.responsable &&
    !payload.comentario;

  if (noHayCambios) {
    mostrarToastCentral("Sin cambios", "No hay cambios para guardar.", 1600);
    return;
  }

  if (btnGuardarActualizacion) btnGuardarActualizacion.disabled = true;

  try {
    showLoader("Guardando actualización...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const result = await response.json();

    if (!result.ok) {
      mostrarToastCentral("No se pudo guardar", `${result.mensaje || "Error"}${result.detalle ? " - " + result.detalle : ""}`, 2600);
      return;
    }

    actualizarTicketLocalTrasGuardar(ticketSeleccionado.ID, payload);
    anexarHistorialLocal(ticketSeleccionado.ID, payload);
    limpiarFormularioGestion();
    mostrarToastCentral("Guardado", "Actualización registrada correctamente.", 1200);
  } catch (error) {
    console.error("Error al guardar actualización:", error);
    mostrarToastCentral("Error", "No se pudo guardar la actualización.", 2200);
  } finally {
    if (btnGuardarActualizacion) btnGuardarActualizacion.disabled = false;
    hideLoader();
  }
}

function actualizarTicketLocalTrasGuardar(idTicket, payload) {
  const id = String(idTicket || "").trim();
  const ahoraIso = new Date().toISOString();
  const actualizar = (ticket) => {
    if (String(ticket.ID || "").trim() !== id) return ticket;
    const nuevo = { ...ticket };
    if (payload.estado) {
      nuevo.ESTADO = payload.estado;
      const estadoNorm = normalizarEstado(payload.estado);
      nuevo.FECHA_CIERRE = (estadoNorm === "cerrado" || estadoNorm === "cancelado") ? ahoraIso : "";
    }
    if (payload.validado) nuevo.VALIDADO = payload.validado;
    if (payload.torre) nuevo.TORRERO = payload.torre;
    if (payload.responsable) nuevo.RESPONSABLE = payload.responsable;
    if (payload.comentario) nuevo.ULTIMO_COMENTARIO = payload.comentario;
    nuevo.ULTIMA_ACTUALIZACION = ahoraIso;
    return nuevo;
  };

  ticketsData = ticketsData.map(actualizar);
  ticketsFiltrados = ticketsFiltrados.map(actualizar);
  ticketSeleccionado = actualizar(ticketSeleccionado);
  aplicarFiltros();
}

function anexarHistorialLocal(idTicket, payload) {
  const id = String(idTicket || "").trim();
  if (!id) return;
  const item = {
    FECHA: new Date().toISOString(),
    TEXTO: construirTextoHistorialLocal(payload),
    USUARIO: payload.usuario || localStorage.getItem("nombreUsuario") || "Sin usuario",
    ETIQUETA_USUARIO: "Usuario"
  };
  const actual = historialTicketsCache.get(id) || [];
  historialTicketsCache.set(id, [item, ...actual]);
  renderizarHistorialItems(id, historialTicketsCache.get(id));
}

async function guardarColorTicket(idTicket, colorKey) {
  if (esUsuarioVisualizador()) {
    alert("Tu perfil es solo visualizador. No tienes permisos para cambiar colores.");
    return;
  }

  const id = String(idTicket || "").trim();
  const color = normalizarColorTicket(colorKey);

  if (!id) {
    alert("No se encontró el ID del ticket.");
    return;
  }

  const ticketOriginal = ticketsData.find(ticket => String(ticket.ID) === id);
  const colorAnterior = ticketOriginal ? normalizarColorTicket(ticketOriginal.COLOR) : "";

  // Optimización: primero actualizamos la pantalla localmente para que se vea inmediato.
  // Luego guardamos en Google Sheets sin volver a cargar todos los tickets.
  actualizarColorLocalTicket(id, color);

  try {
    const payload = {
      accion: "guardarColorTicket",
      id,
      color,
      usuario: localStorage.getItem("nombreUsuario") || "Sin usuario",
      rolUsuario: obtenerRolUsuarioActual()
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    const result = await response.json();

    if (!result.ok) {
      actualizarColorLocalTicket(id, colorAnterior);
      alert((result.mensaje || "No se pudo guardar el color.") + "\n" + (result.detalle || ""));
      return;
    }
  } catch (error) {
    console.error("Error al guardar color:", error);
    actualizarColorLocalTicket(id, colorAnterior);
    alert("Error al guardar el color.");
  }
}

function actualizarColorLocalTicket(idTicket, nuevoColor) {
  const id = String(idTicket || "").trim();
  const color = normalizarColorTicket(nuevoColor);

  ticketsData = ticketsData.map(ticket => {
    if (String(ticket.ID) !== id) return ticket;
    return { ...ticket, COLOR: color };
  });

  ticketsFiltrados = ticketsFiltrados.map(ticket => {
    if (String(ticket.ID) !== id) return ticket;
    return { ...ticket, COLOR: color };
  });

  if (ticketSeleccionado && String(ticketSeleccionado.ID) === id) {
    ticketSeleccionado = { ...ticketSeleccionado, COLOR: color };
  }

  // Respeta filtros actuales y no consulta nuevamente la API.
  renderizarTabla(ticketsFiltrados);
}

function posicionarMenuColor(colorPicker) {
  const menu = colorPicker.querySelector(".row-color-menu");
  const boton = colorPicker.querySelector(".row-color-dot");

  if (!menu || !boton) return;

  const rect = boton.getBoundingClientRect();
  const menuWidth = 160;
  const margen = 8;

  let left = rect.left;
  let top = rect.bottom + 6;

  if (left + menuWidth > window.innerWidth - margen) {
    left = window.innerWidth - menuWidth - margen;
  }

  if (top + 210 > window.innerHeight - margen) {
    top = rect.top - 210;
  }

  menu.style.left = `${Math.max(margen, left)}px`;
  menu.style.top = `${Math.max(margen, top)}px`;
}

function cerrarTodosLosMenusColor() {
  document.querySelectorAll(".row-color-picker.open").forEach(el => {
    el.classList.remove("open");
  });
}

function renderizarHistorialItems(idTicket, historial) {
  const timeline = document.getElementById("timelineHistorial");
  if (!timeline) return;

  if (!Array.isArray(historial) || historial.length === 0) {
    timeline.innerHTML = `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <strong>Sin historial</strong>
          <p>No hay registros para este ticket.</p>
        </div>
      </div>
    `;
    return;
  }

  const historialOrdenado = [...historial].sort((a, b) => obtenerTiempoHistorial(b.FECHA) - obtenerTiempoHistorial(a.FECHA));
  timeline.innerHTML = "";

  historialOrdenado.forEach(item => {
    const fecha = formatearFecha(item.FECHA);
    const texto = item.TEXTO || "Sin detalle";
    const etiquetaUsuario = item.ETIQUETA_USUARIO || "Usuario";
    const usuario = item.USUARIO ? `${etiquetaUsuario}: ${item.USUARIO}` : "";

    const div = document.createElement("div");
    div.className = "timeline-item";
    div.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <strong>${escapeHtml(fecha)}</strong>
        <p>${escapeHtml(texto)}</p>
        ${usuario ? `<p>${escapeHtml(usuario)}</p>` : ""}
      </div>
    `;
    timeline.appendChild(div);
  });
}


function obtenerHistorialCachePersistente(id) {
  try {
    const raw = sessionStorage.getItem("historial_ticket_" + id);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.items)) return null;
    if (Date.now() - Number(data.ts || 0) > 10 * 60 * 1000) return null;
    return data.items;
  } catch (_) {
    return null;
  }
}

function guardarHistorialCachePersistente(id, items) {
  try {
    sessionStorage.setItem("historial_ticket_" + id, JSON.stringify({ ts: Date.now(), items }));
  } catch (_) {}
}

function renderizarHistorialRapidoDesdeTicket(ticket) {
  const timeline = document.getElementById("timelineHistorial");
  if (!timeline || !ticket) return;

  const comentario = String(ticket.ULTIMO_COMENTARIO || "").trim();
  const fecha = ticket.ULTIMA_ACTUALIZACION || ticket.FECHA_REGISTRO || "";

  if (!comentario) {
    timeline.innerHTML = `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <strong>Cargando historial...</strong>
          <p>Obteniendo trazabilidad completa.</p>
        </div>
      </div>
    `;
    return;
  }

  timeline.innerHTML = `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <strong>${escapeHtml(formatearFecha(fecha))}</strong>
        <p>${escapeHtml(comentario)}</p>
        <p>Último comentario disponible. Cargando historial completo...</p>
      </div>
    </div>
  `;
}

async function cargarHistorial(idTicket) {
  const timeline = document.getElementById("timelineHistorial");
  const id = String(idTicket || "").trim();
  if (!timeline || !id) return;

  if (historialTicketsCache.has(id)) {
    renderizarHistorialItems(id, historialTicketsCache.get(id));
    return;
  }

  const cachePersistente = obtenerHistorialCachePersistente(id);
  if (cachePersistente) {
    historialTicketsCache.set(id, cachePersistente);
    renderizarHistorialItems(id, cachePersistente);
    return;
  }

  const seq = ++historialTicketRequestSeq;
  const ticketActual = ticketsData.find(t => String(t.ID || "").trim() === id) || ticketSeleccionado;
  renderizarHistorialRapidoDesdeTicket(ticketActual);

  try {
    const response = await fetch(`${API_URL}?accion=obtenerSeguimiento&id=${encodeURIComponent(id)}`, {
      method: "GET",
      cache: "no-store"
    });

    const historial = await response.json();
    if (seq !== historialTicketRequestSeq || String(selectedTicketId || "").trim() !== id) return;

    if (!Array.isArray(historial)) throw new Error(historial?.mensaje || "Respuesta inválida del historial");
    historialTicketsCache.set(id, historial);
    guardarHistorialCachePersistente(id, historial);
    renderizarHistorialItems(id, historial);
  } catch (error) {
    console.error("Error al cargar historial:", error);
    if (seq !== historialTicketRequestSeq) return;
    const ticketActual = ticketsData.find(t => String(t.ID || "").trim() === id) || ticketSeleccionado;
    if (ticketActual && String(ticketActual.ULTIMO_COMENTARIO || "").trim()) {
      renderizarHistorialRapidoDesdeTicket(ticketActual);
      const aviso = document.createElement("div");
      aviso.className = "timeline-item";
      aviso.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <strong>Historial completo pendiente</strong>
          <p>No se pudo cargar todo el historial en este intento.</p>
        </div>
      `;
      timeline.appendChild(aviso);
    } else {
      timeline.innerHTML = `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <strong>Error</strong>
            <p>No se pudo cargar el historial.</p>
          </div>
        </div>
      `;
    }
  }
}

function obtenerTiempoHistorial(valorFecha) {
  if (!valorFecha) return 0;

  const fechaDirecta = new Date(valorFecha);
  if (!isNaN(fechaDirecta.getTime())) {
    return fechaDirecta.getTime();
  }

  const texto = String(valorFecha).trim();
  const match = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (match) {
    const [, dia, mes, anio, hora, minuto, segundo = "00"] = match;
    const fechaLocal = new Date(
      Number(anio),
      Number(mes) - 1,
      Number(dia),
      Number(hora),
      Number(minuto),
      Number(segundo)
    );

    if (!isNaN(fechaLocal.getTime())) {
      return fechaLocal.getTime();
    }
  }

  return 0;
}

function renderizarEvidencias(evidenciasInput) {
  const grid = document.getElementById("evidenceGrid");
  if (!grid) return;

  const enlaces = Array.isArray(evidenciasInput)
    ? evidenciasInput.filter(Boolean).slice(0, 3)
    : obtenerListaEnlaces(evidenciasInput).slice(0, 3);

  grid.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const enlace = enlaces[i];

    if (!enlace) {
      const div = document.createElement("div");
      div.className = "evidence-box empty";
      div.textContent = "Sin evidencia";
      grid.appendChild(div);
      continue;
    }

    const imageUrl = convertirDriveUrlAImagen(enlace);

    const div = document.createElement("div");
    div.className = "evidence-box";

    div.innerHTML = `
      <a class="evidence-link" href="${escapeAttribute(enlace)}" target="_blank" rel="noopener noreferrer">
        <img
          class="evidence-image"
          src="${escapeAttribute(imageUrl)}"
          alt="Evidencia ${i + 1}"
          onerror="
            this.style.display='none';
            this.parentElement.innerHTML = '<span class=&quot;evidence-fallback-text&quot;>Abrir evidencia</span>';
          "
        />
      </a>
    `;

    grid.appendChild(div);
  }
}

function obtenerListaEnlaces(texto) {
  return String(texto || "")
    .split("|")
    .map(item => item.trim())
    .filter(item => item !== "");
}

function convertirDriveUrlAImagen(url) {
  const texto = String(url || "").trim();

  let fileId = "";

  if (texto.includes("uc?export=view&id=")) {
    const matchId = texto.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      fileId = matchId[1];
    }
  }

  if (!fileId) {
    const match = texto.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }

  if (!fileId) {
    return texto;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
}

function formatearFechaSolo(fecha) {
  if (!fecha) return "";

  const d = new Date(fecha);
  if (isNaN(d.getTime())) return String(fecha);

  return d.toLocaleDateString("es-PE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

/* =========================
   REPORTES
========================= */
function cargarFiltrosReportes() {
  cargarFiltroTorres();
  cargarFiltroOpciones(
    filterReporteIncidencia,
    ticketsData.map(t => t.INCIDENCIA),
    "Todas las incidencias"
  );
  cargarFiltroOpciones(
    filterReporteAfectacion,
    ticketsData.map(t => t.AFECTACION),
    "Todas las afectaciones"
  );
}

function cargarFiltroOpciones(select, valores, textoTodos) {
  if (!select) return;

  const valorActual = select.value || "Todos";

  const opciones = [...new Set(
    valores
      .map(valor => String(valor || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "es"));

  select.innerHTML = `<option value="Todos">${escapeHtml(textoTodos)}</option>`;

  opciones.forEach(valor => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = valor;
    select.appendChild(option);
  });

  const existeValorAnterior = [...select.options].some(opt => opt.value === valorActual);
  select.value = existeValorAnterior ? valorActual : "Todos";
}

function cargarFiltroTorres() {
  if (!filterReporteTorre) return;

  const valorActual = filterReporteTorre.value || "Todos";

  const torres = [...new Set(
    ticketsData
      .map(t => String(t.TORRERO || "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "es"));

  filterReporteTorre.innerHTML = `<option value="Todos">Todas las torres</option>`;

  torres.forEach(torre => {
    const option = document.createElement("option");
    option.value = torre;
    option.textContent = torre;
    filterReporteTorre.appendChild(option);
  });

  const existeValorAnterior = [...filterReporteTorre.options].some(opt => opt.value === valorActual);
  filterReporteTorre.value = existeValorAnterior ? valorActual : "Todos";
}

function contarPorEstados(tickets) {
  return {
    abierto: tickets.filter(t => normalizarEstado(t.ESTADO) === "abierto").length,
    proceso: tickets.filter(t => normalizarEstado(t.ESTADO) === "en proceso").length,
    cerrado: tickets.filter(t => normalizarEstado(t.ESTADO) === "cerrado").length
  };
}

function renderizarReportes() {
  if (!chartGeneral || !chartPorTorre || !chartPorMes) return;

  const estadoTorrero = filterReporteEstadoTorrero?.value || "Todos";
  const incidenciaSeleccionada = filterReporteIncidencia?.value || "Todos";
  const afectacionSeleccionada = filterReporteAfectacion?.value || "Todos";

  renderizarGraficaTorrerosConFiltros(
    chartGeneral,
    estadoTorrero,
    incidenciaSeleccionada,
    afectacionSeleccionada
  );

  const torreSeleccionada = filterReporteTorre?.value || "Todos";
  const dataPorTorre = filtrarPorTorre(ticketsData, torreSeleccionada);
  const conteoPorTorre = contarPorEstados(dataPorTorre);
  renderizarGraficaEstadosCompacta(chartPorTorre, conteoPorTorre);

  const estadoMes = filterReporteEstadoMes?.value || "Todos";
  renderizarGraficaTicketsPorMes(chartPorMes, dataPorTorre, estadoMes);
}

function filtrarPorTorre(tickets, torreSeleccionada) {
  if (torreSeleccionada === "Todos") return tickets;

  return tickets.filter(t => String(t.TORRERO || "").trim() === torreSeleccionada);
}

function filtrarPorEstado(tickets, estadoSeleccionado) {
  if (!estadoSeleccionado || estadoSeleccionado === "Todos") return tickets;

  return tickets.filter(t => normalizarEstado(t.ESTADO) === estadoSeleccionado.toLowerCase());
}

function filtrarPorValorExacto(tickets, campo, valorSeleccionado) {
  if (!valorSeleccionado || valorSeleccionado === "Todos") return tickets;

  return tickets.filter(t => String(t[campo] || "").trim() === valorSeleccionado);
}

function renderizarGraficaTorrerosConFiltros(contenedor, estadoSeleccionado, incidenciaSeleccionada, afectacionSeleccionada) {
  let data = [...ticketsData];

  data = filtrarPorEstado(data, estadoSeleccionado);
  data = filtrarPorValorExacto(data, "INCIDENCIA", incidenciaSeleccionada);
  data = filtrarPorValorExacto(data, "AFECTACION", afectacionSeleccionada);

  const conteoPorTorrero = {};

  data.forEach(ticket => {
    const torrero = String(ticket.TORRERO || "").trim() || "Sin torrero";

    if (!conteoPorTorrero[torrero]) {
      conteoPorTorrero[torrero] = 0;
    }

    conteoPorTorrero[torrero]++;
  });

  const filas = Object.entries(conteoPorTorrero)
    .map(([torrero, valor]) => ({
      label: torrero,
      valor: valor
    }))
    .sort((a, b) => b.valor - a.valor || a.label.localeCompare(b.label, "es"));

  if (filas.length === 0) {
    contenedor.innerHTML = `
      <div class="chart-empty">
        No hay tickets con los filtros seleccionados.
      </div>
    `;
    return;
  }

  const maximo = Math.max(...filas.map(fila => fila.valor), 1);
  const claseEstado = obtenerClaseBarraPorEstado(estadoSeleccionado);

  contenedor.innerHTML = `
    <div class="chart-list-inner">
      ${filas.map(fila => {
        const porcentaje = Math.max(Math.round((fila.valor / maximo) * 100), 3);

        return `
          <div class="chart-row">
            <div class="chart-label" title="${escapeAttribute(fila.label)}">
              ${escapeHtml(fila.label)}
            </div>
            <div class="chart-track">
              <div class="chart-bar ${claseEstado}" style="width:${porcentaje}%;"></div>
            </div>
            <div class="chart-value">${fila.valor}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function obtenerClaseBarraPorEstado(estado) {
  const estadoTexto = normalizarEstado(estado);

  if (estadoTexto === "abierto") return "abierto";
  if (estadoTexto === "en proceso") return "proceso";
  if (estadoTexto === "cerrado") return "cerrado";
  if (estadoTexto === "cancelado") return "gray";

  return "todos";
}

function renderizarGraficaEstadosCompacta(contenedor, conteo) {
  const total = conteo.abierto + conteo.proceso + conteo.cerrado;

  if (total === 0) {
    contenedor.innerHTML = `<div class="chart-empty">No hay datos para mostrar.</div>`;
    return;
  }

  const filas = [
    { label: "Abierto", valor: conteo.abierto, clase: "abierto" },
    { label: "En proceso", valor: conteo.proceso, clase: "proceso" },
    { label: "Cerrado", valor: conteo.cerrado, clase: "cerrado" }
  ];

  const maximo = Math.max(...filas.map(fila => fila.valor), 1);

  contenedor.innerHTML = `
    <div class="vertical-chart">
      ${filas.map(fila => {
        const porcentaje = Math.max(Math.round((fila.valor / maximo) * 100), fila.valor > 0 ? 5 : 0);
        const porcentajeTotal = total === 0 ? 0 : Math.round((fila.valor / total) * 100);

        return `
          <div class="vertical-item">
            <div class="vertical-value">${fila.valor}</div>
            <div class="vertical-track">
              <div class="vertical-bar ${fila.clase}" style="height:${porcentaje}%;"></div>
            </div>
            <div class="vertical-label">${escapeHtml(fila.label)}</div>
            <div class="vertical-percent">${porcentajeTotal}%</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderizarGraficaTicketsPorMes(contenedor, tickets, estadoSeleccionado) {
  const data = filtrarPorEstado(tickets, estadoSeleccionado);
  const conteoPorMes = {};

  data.forEach(ticket => {
    const fecha = obtenerFechaValida(ticket.FECHA_REGISTRO);
    if (!fecha) return;

    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

    if (!conteoPorMes[key]) {
      conteoPorMes[key] = {
        key,
        fecha,
        label: formatearMesAnio(fecha),
        valor: 0
      };
    }

    conteoPorMes[key].valor++;
  });

  const filas = Object.values(conteoPorMes)
    .sort((a, b) => a.key.localeCompare(b.key));

  if (filas.length === 0) {
    contenedor.innerHTML = `<div class="chart-empty">No hay tickets registrados para el filtro seleccionado.</div>`;
    return;
  }

  const maximo = Math.max(...filas.map(fila => fila.valor), 1);
  const claseEstado = obtenerClaseBarraPorEstado(estadoSeleccionado);

  contenedor.innerHTML = `
    <div class="month-chart-inner" style="min-width:${Math.max(520, filas.length * 96)}px;">
      ${filas.map(fila => {
        const porcentaje = Math.max(Math.round((fila.valor / maximo) * 100), fila.valor > 0 ? 5 : 0);

        return `
          <div class="month-item">
            <div class="month-value">${fila.valor}</div>
            <div class="month-track">
              <div class="month-bar ${claseEstado}" style="height:${porcentaje}%;"></div>
            </div>
            <div class="month-label">${escapeHtml(fila.label)}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function obtenerFechaValida(fechaValor) {
  if (!fechaValor) return null;

  const fecha = new Date(fechaValor);
  if (isNaN(fecha.getTime())) return null;

  return fecha;
}

function formatearMesAnio(fecha) {
  const mes = fecha.toLocaleDateString("es-PE", {
    month: "short",
    timeZone: "America/Lima"
  }).replace(".", "");

  return `${capitalizarTexto(mes)} ${fecha.getFullYear()}`;
}

function capitalizarTexto(texto) {
  const valor = String(texto || "").trim();
  if (!valor) return "";

  return valor.charAt(0).toUpperCase() + valor.slice(1);
}
function ajustarPowerBI() {
  const iframe = document.querySelector(".powerbi-frame");
  const reportes = document.getElementById("reportesView");

  if (!iframe || !reportes) return;

  setTimeout(() => {
    reportes.style.height = "calc(100vh - 16px)";
    iframe.style.height = "calc(100vh - 16px)";

    if (iframe.dataset.ajustado !== "true") {
      iframe.dataset.ajustado = "true";
      iframe.src = iframe.src;
    }
  }, 350);
}



/* =========================
   MODAL GENERAR REPORTE PDF
========================= */
function abrirVentanaReporte() {
  if (!Array.isArray(ticketsFiltrados) || ticketsFiltrados.length === 0) {
    alert("No hay tickets filtrados para generar el reporte.");
    return;
  }

  renderizarReporteModal();

  if (reportModal) {
    reportModal.classList.remove("hidden");
    reportModal.setAttribute("aria-hidden", "false");
  }
}

function cerrarVentanaReporte() {
  if (reportModal) {
    reportModal.classList.add("hidden");
    reportModal.setAttribute("aria-hidden", "true");
  }
}

function obtenerFechaHoraPeruTexto() {
  return new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderizarReporteModal() {
  const fechaHora = obtenerFechaHoraPeruTexto();

  if (reportGeneratedAt) reportGeneratedAt.textContent = `Generado: ${fechaHora}`;
    if (reportTotalTickets) reportTotalTickets.textContent = `${ticketsFiltrados.length} ticket(s) considerados`;
  if (reportNotas) reportNotas.value = "";

  renderizarFiltrosAplicadosReporte();
  renderizarGraficoMensualReporte(ticketsFiltrados);
  renderizarGraficoEstadoReporte(ticketsFiltrados);
  renderizarResumenReporte(ticketsFiltrados);
}

function renderizarFiltrosAplicadosReporte() {
  if (!reportFiltrosAplicados) return;

  const filtros = [];
  const filtrosActuales = obtenerFiltrosActuales();

  if (filtrosActuales.busquedaGeneral) filtros.push(["Búsqueda", filtrosActuales.busquedaGeneral]);
  if (filtrosActuales.id) filtros.push(["ID", filtrosActuales.id]);
  if (filtrosActuales.cu) filtros.push(["CU", filtrosActuales.cu]);
  if (filtrosActuales.site) filtros.push(["Site", filtrosActuales.site]);

  const multiples = [
    ["Color", filtrosMultiples.color, valor => valor === "sin_color" ? "Sin color" : (COLORES_FILA[valor]?.label || valor)],
    ["Fecha", filtrosMultiples.fechaRegistro, valor => valor],
    ["Zona", filtrosMultiples.zona, valor => valor],
    ["T. Incidencia", filtrosMultiples.incidencia, valor => valor],
    ["T. Afectación", filtrosMultiples.afectacion, valor => valor],
    ["Torre", filtrosMultiples.torre, valor => valor],
    ["Estado", filtrosMultiples.estado, valor => valor],
    ["Responsable", filtrosMultiples.responsable, valor => valor],
    ["Días", filtrosMultiples.dias, valor => valor]
  ];

  multiples.forEach(([label, setValores, formatter]) => {
    if (setValores && setValores.size > 0) {
      filtros.push([label, [...setValores].map(formatter).join(", ")]);
    }
  });

  if (filtros.length === 0) {
    reportFiltrosAplicados.innerHTML = `<span class="report-chip report-chip-empty">Sin filtros aplicados / todos los tickets visibles</span>`;
    return;
  }

  reportFiltrosAplicados.innerHTML = filtros.map(([label, valor]) => `
    <span class="report-chip"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(valor)}</span>
  `).join("");
}

function renderizarGraficoMensualReporte(tickets) {
  if (!reportChartMensual) return;

  const meses = {};

  tickets.forEach(ticket => {
    const fecha = obtenerFechaValida(ticket.FECHA_REGISTRO);
    if (!fecha) return;

    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    if (!meses[key]) {
      meses[key] = {
        key,
        label: formatearMesCorto(fecha),
        valor: 0
      };
    }
    meses[key].valor++;
  });

  const data = Object.values(meses).sort((a, b) => a.key.localeCompare(b.key));

  if (data.length === 0) {
    reportChartMensual.innerHTML = `<div class="report-chart-empty">Sin fechas válidas.</div>`;
    return;
  }

  const width = 640;
  const height = 150;
  const paddingX = 42;
  const top = 24;
  const bottom = 44;
  const chartHeight = height - top - bottom;
  const max = Math.max(...data.map(x => x.valor), 1);
  const step = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const x = data.length === 1 ? width / 2 : paddingX + index * step;
    const y = top + chartHeight - ((item.valor / max) * chartHeight);
    return { ...item, x, y };
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");

  reportChartMensual.innerHTML = `
    <div class="report-line-chart-scroll">
      <svg class="report-line-chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Vista mensual">
        <line x1="${paddingX}" y1="${top + chartHeight}" x2="${width - paddingX}" y2="${top + chartHeight}" class="report-axis" />
        <polyline points="${polyline}" class="report-line" />
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="4.3" class="report-point" />
          <text x="${p.x}" y="${Math.max(12, p.y - 11)}" text-anchor="middle" class="report-line-value">${p.valor}</text>
          <text x="${p.x}" y="${height - 16}" text-anchor="middle" class="report-line-label">${escapeHtml(p.label)}</text>
        `).join("")}
      </svg>
    </div>
  `;
}
function renderizarGraficoEstadoReporte(tickets) {
  if (!reportChartEstado) return;

  const estados = [
    { label: "Abierto", key: "abierto", clase: "abierto" },
    { label: "En proceso", key: "en proceso", clase: "proceso" },
    { label: "En validación", key: "en validacion", clase: "validacion" },
    { label: "Cerrado", key: "cerrado", clase: "cerrado" },
    { label: "Cancelado", key: "cancelado", clase: "gray" }
  ];

  const data = estados.map(estado => ({
    ...estado,
    valor: tickets.filter(ticket => {
      const texto = normalizarEstado(ticket.ESTADO).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return texto === estado.key;
    }).length
  }));

  const max = Math.max(...data.map(x => x.valor), 1);

  reportChartEstado.innerHTML = `
    <div class="report-state-chart">
      ${data.map(item => {
        const ancho = Math.max(Math.round((item.valor / max) * 100), item.valor > 0 ? 8 : 0);
        return `
          <div class="report-state-row">
            <div class="report-state-label">${escapeHtml(item.label)}</div>
            <div class="report-state-track"><div class="report-state-bar ${item.clase}" style="width:${ancho}%;"></div></div>
            <div class="report-state-value">${item.valor}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderizarResumenReporte(tickets) {
  if (!reportResumenBody) return;

  reportResumenBody.innerHTML = tickets.map(ticket => {
    const responsable = String(ticket.RESPONSABLE || "Sin asignar").trim() || "Sin asignar";
    const comentario = String(ticket.ULTIMO_COMENTARIO || "").trim();

    return `
      <tr>
        <td>${escapeHtml(formatearFechaSolo(ticket.FECHA_REGISTRO))}</td>
        <td>${escapeHtml(ticket.ID || "")}</td>
        <td>${escapeHtml(ticket.CU || "")}</td>
        <td>${escapeHtml(ticket.SITE || "")}</td>
        <td>${escapeHtml(ticket.INCIDENCIA || "")}</td>
        <td>${escapeHtml(ticket.AFECTACION || "")}</td>
        <td>${escapeHtml(ticket.TORRERO || "")}</td>
        <td>${escapeHtml(ticket.ESTADO || "")}</td>
        <td>${escapeHtml(responsable)}</td>
        <td>${escapeHtml(ticket.DIAS_CALCULADOS ?? 0)}</td>
        <td>${escapeHtml(comentario || "-")}</td>
      </tr>
    `;
  }).join("");
}

function formatearMesCorto(fecha) {
  const mes = fecha.toLocaleDateString("es-PE", {
    month: "short",
    timeZone: "America/Lima"
  }).replace(".", "");

  return `${capitalizarTexto(mes)} ${fecha.getFullYear()}`;
}

async function descargarReportePdf() {
  if (!reportPdfArea) return;

  const nombreArchivo = `reporte_integratel_${new Date().toISOString().slice(0, 10)}.pdf`;
  let notaImprimible = null;
  let displayOriginalNotas = "";

  try {
    showLoader("Generando PDF...");
    document.body.classList.add("generando-pdf");

    // html2canvas suele renderizar los textarea como una sola línea.
    // Para el PDF se reemplaza temporalmente por un bloque que conserva saltos de línea.
    if (reportNotas) {
      displayOriginalNotas = reportNotas.style.display;
      notaImprimible = document.createElement("div");
      notaImprimible.className = "report-notes-print";
      const nota = String(reportNotas.value || "").trim();
      notaImprimible.innerHTML = nota ? escapeHtml(nota).replace(/\n/g, "<br>") : "&nbsp;";
      reportNotas.style.display = "none";
      reportNotas.parentNode.insertBefore(notaImprimible, reportNotas.nextSibling);
    }

    if (window.html2pdf) {
      const opciones = {
        margin: [6, 6, 6, 6],
        filename: nombreArchivo,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff"
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape"
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };

      await window.html2pdf().set(opciones).from(reportPdfArea).save();
    } else {
      window.print();
    }
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("No se pudo generar el PDF. Revisa la consola o intenta nuevamente.");
  } finally {
    if (notaImprimible) notaImprimible.remove();
    if (reportNotas) reportNotas.style.display = displayOriginalNotas;
    document.body.classList.remove("generando-pdf");
    hideLoader();
  }
}

/* =========================
   UTILIDADES
========================= */
function formatearFecha(fecha) {
  if (!fecha) return "-";

  const d = new Date(fecha);
  if (isNaN(d.getTime())) return String(fecha);

  return d.toLocaleString("es-PE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setText(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor ?? "-";
}

function escapeHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* =========================================================
   AJUSTES V4 REPORTE
   - Descargar Excel de la tabla
   - Agregar tickets puntuales al reporte sin tocar filtros de bandeja
   - Filtros aplicados muestran los ID adicionados como parte del filtro
   - Gráfica mensual multilínea por estado cuando hay varios estados
========================================================= */
function obtenerTicketsReporteActual() {
  const ids = new Set();
  const resultado = [];

  [...ticketsReporteBase, ...ticketsReporteExtras].forEach(ticket => {
    const id = String(ticket.ID || "").trim();
    if (!id || ids.has(id)) return;
    ids.add(id);
    resultado.push(ticket);
  });

  ticketsReporteFinal = resultado;
  return resultado;
}

function abrirVentanaReporte() {
  if (!Array.isArray(ticketsFiltrados) || ticketsFiltrados.length === 0) {
    alert("No hay tickets filtrados para generar el reporte.");
    return;
  }

  ticketsReporteBase = [...ticketsFiltrados];
  ticketsReporteExtras = [];
  ticketsReporteFinal = [...ticketsReporteBase];
  renderizarReporteModal();

  if (reportModal) {
    reportModal.classList.remove("hidden");
    reportModal.setAttribute("aria-hidden", "false");
  }
}

function renderizarReporteModal() {
  const ticketsReporte = obtenerTicketsReporteActual();
  const fechaHora = obtenerFechaHoraPeruTexto();

  if (reportGeneratedAt) reportGeneratedAt.textContent = `Generado: ${fechaHora}`;
  if (reportTotalTickets) reportTotalTickets.textContent = `${ticketsReporte.length} ticket(s) considerados`;
  if (reportNotas && ticketsReporteExtras.length === 0) reportNotas.value = "";

  renderizarFiltrosAplicadosReporte();
  renderizarGraficoMensualReporte(ticketsReporte);
  renderizarGraficoEstadoReporte(ticketsReporte);
  renderizarResumenReporte(ticketsReporte);
}

function obtenerIdsTicketsExtrasReporte() {
  const idsBase = new Set(ticketsReporteBase.map(ticket => String(ticket.ID || "").trim()).filter(Boolean));
  return ticketsReporteExtras
    .map(ticket => String(ticket.ID || "").trim())
    .filter(id => id && !idsBase.has(id));
}

function renderizarFiltrosAplicadosReporte() {
  if (!reportFiltrosAplicados) return;

  const filtros = [];
  const filtrosActuales = obtenerFiltrosActuales();
  const idsExtras = obtenerIdsTicketsExtrasReporte();

  if (filtrosActuales.busquedaGeneral) filtros.push(["Búsqueda", filtrosActuales.busquedaGeneral]);

  const valoresId = [];
  if (filtrosActuales.id) valoresId.push(filtrosActuales.id);
  idsExtras.forEach(id => valoresId.push(id));
  if (valoresId.length > 0) filtros.push(["ID", valoresId.join(", ")]);

  if (filtrosActuales.cu) filtros.push(["CU", filtrosActuales.cu]);
  if (filtrosActuales.site) filtros.push(["Site", filtrosActuales.site]);

  const multiples = [
    ["Color", filtrosMultiples.color, valor => valor === "sin_color" ? "Sin color" : (COLORES_FILA[valor]?.label || valor)],
    ["Fecha", filtrosMultiples.fechaRegistro, valor => valor],
    ["Zona", filtrosMultiples.zona, valor => valor],
    ["T. Incidencia", filtrosMultiples.incidencia, valor => valor],
    ["T. Afectación", filtrosMultiples.afectacion, valor => valor],
    ["Torre", filtrosMultiples.torre, valor => valor],
    ["Estado", filtrosMultiples.estado, valor => valor],
    ["Responsable", filtrosMultiples.responsable, valor => valor],
    ["Días", filtrosMultiples.dias, valor => valor]
  ];

  multiples.forEach(([label, setValores, formatter]) => {
    if (setValores && setValores.size > 0) {
      filtros.push([label, [...setValores].map(formatter).join(", ")]);
    }
  });

  if (filtros.length === 0) {
    reportFiltrosAplicados.innerHTML = `<span class="report-chip report-chip-empty">Sin filtros aplicados / todos los tickets visibles</span>`;
    return;
  }

  reportFiltrosAplicados.innerHTML = filtros.map(([label, valor]) => `
    <span class="report-chip"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(valor)}</span>
  `).join("");
}

function obtenerEstadoCanonicoReporte(estado) {
  const texto = String(estado || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto === "abierto") return "abierto";
  if (texto === "en proceso") return "en proceso";
  if (texto === "en validacion") return "en validacion";
  if (texto === "cerrado") return "cerrado";
  if (texto === "cancelado") return "cancelado";
  return texto || "sin estado";
}

function obtenerConfigEstadoReporte(estadoCanonico) {
  const mapa = {
    "abierto": { label: "Abierto", clase: "abierto", color: "#ef4444" },
    "en proceso": { label: "En proceso", clase: "proceso", color: "#f59e0b" },
    "en validacion": { label: "En validación", clase: "validacion", color: "#3b82f6" },
    "cerrado": { label: "Cerrado", clase: "cerrado", color: "#22c55e" },
    "cancelado": { label: "Cancelado", clase: "gray", color: "#94a3b8" },
    "sin estado": { label: "Sin estado", clase: "gray", color: "#64748b" }
  };

  return mapa[estadoCanonico] || {
    label: capitalizarTexto(estadoCanonico),
    clase: "gray",
    color: "#64748b"
  };
}

function obtenerMesesOrdenadosReporte(tickets) {
  const meses = {};

  tickets.forEach(ticket => {
    const fecha = obtenerFechaValida(ticket.FECHA_REGISTRO);
    if (!fecha) return;

    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    if (!meses[key]) {
      meses[key] = { key, label: formatearMesCorto(fecha) };
    }
  });

  return Object.values(meses).sort((a, b) => a.key.localeCompare(b.key));
}

function renderizarGraficoMensualReporte(tickets) {
  if (!reportChartMensual) return;

  const meses = obtenerMesesOrdenadosReporte(tickets);

  if (meses.length === 0) {
    reportChartMensual.innerHTML = `<div class="report-chart-empty">Sin fechas válidas.</div>`;
    return;
  }

  const estadosPresentes = [...new Set(
    tickets.map(ticket => obtenerEstadoCanonicoReporte(ticket.ESTADO)).filter(Boolean)
  )].sort((a, b) => {
    const orden = { "abierto": 1, "en proceso": 2, "en validacion": 3, "cerrado": 4 };
    return (orden[a] || 99) - (orden[b] || 99) || a.localeCompare(b, "es");
  });

  if (estadosPresentes.length <= 1) {
    renderizarGraficoMensualSimpleReporte(tickets, meses);
    return;
  }

  renderizarGraficoMensualPorEstadoReporte(tickets, meses, estadosPresentes);
}

function renderizarGraficoMensualSimpleReporte(tickets, meses) {
  const conteo = {};
  meses.forEach(mes => { conteo[mes.key] = 0; });

  tickets.forEach(ticket => {
    const fecha = obtenerFechaValida(ticket.FECHA_REGISTRO);
    if (!fecha) return;
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    conteo[key] = (conteo[key] || 0) + 1;
  });

  const data = meses.map(mes => ({ ...mes, valor: conteo[mes.key] || 0 }));
  const width = 640;
  const height = 150;
  const paddingX = 42;
  const top = 24;
  const bottom = 44;
  const chartHeight = height - top - bottom;
  const max = Math.max(...data.map(x => x.valor), 1);
  const step = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const x = data.length === 1 ? width / 2 : paddingX + index * step;
    const y = top + chartHeight - ((item.valor / max) * chartHeight);
    return { ...item, x, y };
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");

  reportChartMensual.innerHTML = `
    <div class="report-line-chart-scroll">
      <svg class="report-line-chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Vista mensual">
        <line x1="${paddingX}" y1="${top + chartHeight}" x2="${width - paddingX}" y2="${top + chartHeight}" class="report-axis" />
        <polyline points="${polyline}" class="report-line" />
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="4.3" class="report-point" />
          <text x="${p.x}" y="${Math.max(12, p.y - 11)}" text-anchor="middle" class="report-line-value">${p.valor}</text>
          <text x="${p.x}" y="${height - 16}" text-anchor="middle" class="report-line-label">${escapeHtml(p.label)}</text>
        `).join("")}
      </svg>
    </div>
  `;
}

function renderizarGraficoMensualPorEstadoReporte(tickets, meses, estadosPresentes) {
  const width = 720;
  const height = 190;
  const paddingX = 44;
  const top = 58;
  const bottom = 40;
  const chartHeight = height - top - bottom;

  const conteo = {};
  estadosPresentes.forEach(estado => {
    conteo[estado] = {};
    meses.forEach(mes => { conteo[estado][mes.key] = 0; });
  });

  tickets.forEach(ticket => {
    const fecha = obtenerFechaValida(ticket.FECHA_REGISTRO);
    if (!fecha) return;

    const estado = obtenerEstadoCanonicoReporte(ticket.ESTADO);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

    if (!conteo[estado]) return;
    conteo[estado][key] = (conteo[estado][key] || 0) + 1;
  });

  const totalesPorMes = {};
  meses.forEach(mes => {
    totalesPorMes[mes.key] = estadosPresentes.reduce((acc, estado) => {
      return acc + (conteo[estado][mes.key] || 0);
    }, 0);
  });

  const max = Math.max(
    ...estadosPresentes.flatMap(estado => meses.map(mes => conteo[estado][mes.key] || 0)),
    1
  );

  const step = meses.length > 1 ? (width - paddingX * 2) / (meses.length - 1) : 0;

  const lineasSvg = estadosPresentes.map((estado, estadoIndex) => {
    const config = obtenerConfigEstadoReporte(estado);
    const puntos = meses.map((mes, index) => {
      const valor = conteo[estado][mes.key] || 0;
      const x = meses.length === 1 ? width / 2 : paddingX + index * step;
      const y = top + chartHeight - ((valor / max) * chartHeight);
      return { ...mes, valor, x, y };
    });

    const polyline = puntos.map(p => `${p.x},${p.y}`).join(" ");
    const offsetBase = estadoIndex % 2 === 0 ? -9 : 13;

    return `
      <polyline points="${polyline}" class="report-line-state report-line-${config.clase}" />
      ${puntos.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="3.7" class="report-point-state report-point-${config.clase}" />
        ${p.valor > 0 ? `<text x="${p.x}" y="${Math.max(12, Math.min(height - 24, p.y + offsetBase))}" text-anchor="middle" class="report-line-state-value report-value-${config.clase}">${p.valor}</text>` : ""}
      `).join("")}
    `;
  }).join("");

  const labelsSvg = meses.map((mes, index) => {
    const x = meses.length === 1 ? width / 2 : paddingX + index * step;
    return `<text x="${x}" y="${height - 15}" text-anchor="middle" class="report-line-label">${escapeHtml(mes.label)}</text>`;
  }).join("");

  const totalesMensualesSvg = meses.map((mes, index) => {
    const x = meses.length === 1 ? width / 2 : paddingX + index * step;
    const totalMes = totalesPorMes[mes.key] || 0;
    return `<text x="${x}" y="31" text-anchor="middle" class="report-month-total-label">${totalMes}</text>`;
  }).join("");

  const leyenda = estadosPresentes.map(estado => {
    const config = obtenerConfigEstadoReporte(estado);
    return `<span class="report-line-legend-item"><i class="report-line-legend-dot ${config.clase}"></i>${escapeHtml(config.label)}</span>`;
  }).join("");

  reportChartMensual.innerHTML = `
    <div class="report-line-chart-wrap">
      <div class="report-line-top-right">
        <div class="report-line-legend">${leyenda}</div>
        <div class="report-line-total-label">Total: ${tickets.length}</div>
      </div>
      <div class="report-line-chart-scroll">
        <svg class="report-line-chart report-line-chart-multi" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Vista mensual por estado">
          <line x1="${paddingX}" y1="${top + chartHeight}" x2="${width - paddingX}" y2="${top + chartHeight}" class="report-axis" />
          ${totalesMensualesSvg}
          ${lineasSvg}
          ${labelsSvg}
        </svg>
      </div>
    </div>
  `;
}

function renderizarResumenReporte(tickets) {
  if (!reportResumenBody) return;

  reportResumenBody.innerHTML = tickets.map(ticket => {
    const responsable = String(ticket.RESPONSABLE || "Sin asignar").trim() || "Sin asignar";
    const comentario = String(ticket.ULTIMO_COMENTARIO || "").trim();

    return `
      <tr>
        <td>${escapeHtml(formatearFechaSolo(ticket.FECHA_REGISTRO))}</td>
        <td>${escapeHtml(ticket.ID || "")}</td>
        <td>${escapeHtml(ticket.CU || "")}</td>
        <td>${escapeHtml(ticket.SITE || "")}</td>
        <td>${escapeHtml(ticket.INCIDENCIA || "")}</td>
        <td>${escapeHtml(ticket.AFECTACION || "")}</td>
        <td>${escapeHtml(ticket.TORRERO || "")}</td>
        <td>${escapeHtml(ticket.ESTADO || "")}</td>
        <td>${escapeHtml(responsable)}</td>
        <td>${escapeHtml(ticket.DIAS_CALCULADOS ?? 0)}</td>
        <td>${escapeHtml(comentario || "-")}</td>
      </tr>
    `;
  }).join("");
}

function abrirAgregarTicketsReporte() {
  if (!addTicketModal) return;

  ticketsAgregarTemporal = new Set(obtenerIdsTicketsExtrasReporte());
  if (addTicketSearch) addTicketSearch.value = "";

  renderizarSeleccionadosAgregarTickets();
  renderizarResultadosAgregarTickets();

  addTicketModal.classList.remove("hidden");
  addTicketModal.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    if (addTicketSearch) addTicketSearch.focus();
  }, 80);
}

function cerrarAgregarTicketsReporte() {
  if (!addTicketModal) return;
  addTicketModal.classList.add("hidden");
  addTicketModal.setAttribute("aria-hidden", "true");
}

function obtenerIdsBaseReporte() {
  return new Set(ticketsReporteBase.map(ticket => String(ticket.ID || "").trim()).filter(Boolean));
}

function obtenerTicketPorId(id) {
  const buscado = String(id || "").trim();
  return ticketsData.find(ticket => String(ticket.ID || "").trim() === buscado) || null;
}

function renderizarSeleccionadosAgregarTickets() {
  if (!addTicketSeleccionados) return;

  const ids = [...ticketsAgregarTemporal];

  if (ids.length === 0) {
    addTicketSeleccionados.innerHTML = `<span class="add-ticket-empty">Sin tickets adicionales seleccionados.</span>`;
    return;
  }

  addTicketSeleccionados.innerHTML = ids.map(id => `
    <span class="add-ticket-chip">
      ${escapeHtml(id)}
      <button type="button" data-remove-id="${escapeAttribute(id)}" title="Quitar">×</button>
    </span>
  `).join("");

  addTicketSeleccionados.querySelectorAll("[data-remove-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      ticketsAgregarTemporal.delete(btn.getAttribute("data-remove-id") || "");
      renderizarSeleccionadosAgregarTickets();
      renderizarResultadosAgregarTickets();
    });
  });
}

function renderizarResultadosAgregarTickets() {
  if (!addTicketResultados) return;

  const texto = String(addTicketSearch?.value || "").trim().toLowerCase();
  const idsBase = obtenerIdsBaseReporte();

  const candidatos = ticketsData
    .filter(ticket => {
      const id = String(ticket.ID || "").trim();
      if (!id || idsBase.has(id)) return false;

      const idLower = id.toLowerCase();
      const cu = String(ticket.CU || "").toLowerCase();
      const site = String(ticket.SITE || "").toLowerCase();

      if (!texto) return true;
      return idLower.includes(texto) || cu.includes(texto) || site.includes(texto);
    })
    .slice(0, 60);

  if (candidatos.length === 0) {
    addTicketResultados.innerHTML = `<div class="add-ticket-empty-results">No se encontraron tickets disponibles para adicionar.</div>`;
    return;
  }

  addTicketResultados.innerHTML = `
    <table class="add-ticket-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>CU</th>
          <th>SITE</th>
          <th>Estado</th>
          <th>Días</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${candidatos.map(ticket => {
          const id = String(ticket.ID || "").trim();
          const seleccionado = ticketsAgregarTemporal.has(id);
          return `
            <tr>
              <td>${escapeHtml(id)}</td>
              <td>${escapeHtml(ticket.CU || "")}</td>
              <td>${escapeHtml(ticket.SITE || "")}</td>
              <td>${escapeHtml(ticket.ESTADO || "")}</td>
              <td>${escapeHtml(ticket.DIAS_CALCULADOS ?? 0)}</td>
              <td>
                <button class="add-ticket-row-btn ${seleccionado ? "selected" : ""}" type="button" data-id="${escapeAttribute(id)}">
                  ${seleccionado ? "Seleccionado" : "Agregar"}
                </button>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;

  addTicketResultados.querySelectorAll(".add-ticket-row-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id") || "";
      if (!id) return;

      if (ticketsAgregarTemporal.has(id)) {
        ticketsAgregarTemporal.delete(id);
      } else {
        ticketsAgregarTemporal.add(id);
      }

      renderizarSeleccionadosAgregarTickets();
      renderizarResultadosAgregarTickets();
    });
  });
}

function aplicarTicketsAgregadosReporte() {
  const idsBase = obtenerIdsBaseReporte();
  const extras = [];

  ticketsAgregarTemporal.forEach(id => {
    if (idsBase.has(id)) return;
    const ticket = obtenerTicketPorId(id);
    if (ticket) extras.push(ticket);
  });

  ticketsReporteExtras = extras;
  renderizarReporteModal();
  cerrarAgregarTicketsReporte();
}

function obtenerDataTablaReporteParaExportar() {
  const tickets = obtenerTicketsReporteActual();

  return tickets.map(ticket => ({
    FECHA: formatearFechaSolo(ticket.FECHA_REGISTRO),
    ID: ticket.ID || "",
    CU: ticket.CU || "",
    SITE: ticket.SITE || "",
    "T. INCIDENCIA": ticket.INCIDENCIA || "",
    "T. AFECTACIÓN": ticket.AFECTACION || "",
    TORRE: ticket.TORRERO || "",
    ESTADO: ticket.ESTADO || "",
    RESPONSABLE: String(ticket.RESPONSABLE || "Sin asignar").trim() || "Sin asignar",
    DÍAS: ticket.DIAS_CALCULADOS ?? 0,
    COMENTARIO: String(ticket.ULTIMO_COMENTARIO || "").trim() || "-"
  }));
}

function descargarReporteExcel() {
  const data = obtenerDataTablaReporteParaExportar();

  if (!data.length) {
    alert("No hay filas para exportar a Excel.");
    return;
  }

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  const nombreArchivo = `reporte_integratel_${fechaArchivo}.xlsx`;

  if (window.XLSX) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tickets");

    ws["!cols"] = [
      { wch: 12 },
      { wch: 13 },
      { wch: 11 },
      { wch: 22 },
      { wch: 24 },
      { wch: 20 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 8 },
      { wch: 60 }
    ];

    XLSX.writeFile(wb, nombreArchivo);
    return;
  }

  descargarReporteCsvFallback(data, nombreArchivo.replace(/\.xlsx$/i, ".csv"));
}

function descargarReporteCsvFallback(data, nombreArchivo) {
  const columnas = Object.keys(data[0]);
  const filas = [columnas.join(";")];

  data.forEach(row => {
    filas.push(columnas.map(col => {
      const valor = String(row[col] ?? "").replaceAll('"', '""');
      return `"${valor}"`;
    }).join(";"));
  });

  const blob = new Blob(["\ufeff" + filas.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

