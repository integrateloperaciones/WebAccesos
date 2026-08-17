const correoUsuarioTexto = document.getElementById("correoUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const btnRefrescarData = document.getElementById("btnRefrescarData");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const btnGenerarReporte = document.getElementById("btnGenerarReporte");
const btnFiltrarBlackCases = document.getElementById("btnFiltrarBlackCases");
const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const btnCambiarPassword = document.getElementById("btnCambiarPassword");

const loaderOverlay = document.getElementById("loaderOverlay");
const loaderText = document.getElementById("loaderText");

const API_URL = "https://script.google.com/macros/s/AKfycbwIrUk1l-ip-zYUFb1YTKCIHT8ir1ELh0Joj8wmLr9TisB2RpyYyxBZiSR2KZzHryhq/exec";

/* SUPABASE V19 - lectura rápida de historial.
   Pega aquí tu Publishable key de Supabase. Si queda vacío, usará Apps Script como antes. */
const SUPABASE_URL = "https://bfghvgnhmgpkibqxwaod.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_r80JDjWG-iL-epCIqQUvRg_lsJRiMt3";
const SUPABASE_HISTORIAL_TABLE = "historial_unificado";
const SUPABASE_HISTORIAL_ACTIVO = true;


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
const updateIncidencia = document.getElementById("updateIncidencia");
const updateAfectacion = document.getElementById("updateAfectacion");
const updateResponsable = document.getElementById("updateResponsable");
const updateComentario = document.getElementById("updateComentario");
const btnGuardarActualizacion = document.getElementById("btnGuardarActualizacion");
const btnLimpiarGestion = document.getElementById("btnLimpiarGestion");
const chkPasarBlackCase = document.getElementById("chkPasarBlackCase");
const blackcaseToggleBox = document.getElementById("blackcaseToggleBox");
const blackcaseToggleHelp = document.getElementById("blackcaseToggleHelp");

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
let filtroSoloBlackCases = false;


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
  if (payload.incidencia) partes.push(`Incidencia: ${payload.incidencia}`);
  if (payload.afectacion) partes.push(`Afectación: ${payload.afectacion}`);
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

  if (btnFiltrarBlackCases) {
    btnFiltrarBlackCases.addEventListener("click", alternarFiltroBlackCases);
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

function ticketEsBlackCase(ticket) {
  const esBlack = String(ticket?.ES_BLACK_CASE || "").trim().toUpperCase();
  const idBlack = String(ticket?.ID_BLACK_CASE || "").trim();
  return esBlack === "SI" || esBlack === "SÍ" || esBlack === "TRUE" || esBlack === "1" || Boolean(idBlack);
}

function actualizarBotonFiltroBlackCases() {
  if (!btnFiltrarBlackCases) return;
  btnFiltrarBlackCases.classList.toggle("active", filtroSoloBlackCases);
  btnFiltrarBlackCases.textContent = filtroSoloBlackCases ? "Todos los tickets" : "Black cases";
  btnFiltrarBlackCases.title = filtroSoloBlackCases
    ? "Volver a mostrar todos los tickets"
    : "Mostrar solo tickets derivados a Black cases";
}

function alternarFiltroBlackCases() {
  filtroSoloBlackCases = !filtroSoloBlackCases;
  selectedTicketId = null;
  actualizarBotonFiltroBlackCases();
  aplicarFiltros();
}

function limpiarFiltros() {
  filtroSoloBlackCases = false;
  actualizarBotonFiltroBlackCases();
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

  if (filtroSoloBlackCases && !ticketEsBlackCase(ticket)) return false;

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
    filtroSoloBlackCases ||
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
  configurarCheckboxBlackCase(ticket);

  cargarHistorial(ticket.ID);
}

function limpiarFormularioGestion() {
  if (!updateEstado || !updateValidado || !updateResponsable || !updateComentario) return;

  updateEstado.value = "";
  updateValidado.value = "";
  if (updateTorre) updateTorre.value = "";
  if (updateIncidencia) updateIncidencia.value = "";
  if (updateAfectacion) updateAfectacion.value = "";
  updateResponsable.value = "";
  updateComentario.value = "";
  if (chkPasarBlackCase && (!ticketSeleccionado || !ticketEsBlackCase(ticketSeleccionado))) {
    chkPasarBlackCase.checked = false;
  }
}

function configurarCheckboxBlackCase(ticket) {
  if (!chkPasarBlackCase) return;
  const esBlack = ticketEsBlackCase(ticket);
  chkPasarBlackCase.checked = esBlack;
  chkPasarBlackCase.disabled = esBlack || esUsuarioVisualizador();
  if (blackcaseToggleBox) blackcaseToggleBox.classList.toggle("locked", esBlack || esUsuarioVisualizador());
  if (blackcaseToggleHelp) {
    blackcaseToggleHelp.textContent = esBlack
      ? `Este ticket ya fue pasado a Black case${ticket.ID_BLACK_CASE ? " (" + ticket.ID_BLACK_CASE + ")" : ""}. No se puede desmarcar.`
      : "Al guardar se creará un caso en BLACKLIST con IDP correlativo y quedará relacionado a este INC.";
  }
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
  const incidencia = updateIncidencia ? updateIncidencia.value.trim() : "";
  const afectacion = updateAfectacion ? updateAfectacion.value.trim() : "";
  const responsable = updateResponsable.value.trim();
  const comentario = updateComentario.value.trim();
  const pasarABlackCase = Boolean(chkPasarBlackCase?.checked) && !ticketEsBlackCase(ticketSeleccionado);

  const payload = {
    accion: "guardarSeguimiento",
    id: ticketSeleccionado.ID,
    usuario: localStorage.getItem("nombreUsuario") || "Sin usuario",
    rolUsuario: obtenerRolUsuarioActual()
  };

  if (estado) payload.estado = estado;
  if (validado) payload.validado = validado;
  if (torre) payload.torre = torre;
  if (incidencia) payload.incidencia = incidencia;
  if (afectacion) payload.afectacion = afectacion;
  if (responsable) payload.responsable = responsable;
  if (comentario && !pasarABlackCase) payload.comentario = comentario;

  const hayCambiosGestion = Boolean(
    payload.estado ||
    payload.validado ||
    payload.torre ||
    payload.incidencia ||
    payload.afectacion ||
    payload.responsable ||
    payload.comentario
  );

  if (!hayCambiosGestion && !pasarABlackCase) {
    mostrarToastCentral("Sin cambios", "No hay cambios para guardar.", 1600);
    return;
  }

  if (btnGuardarActualizacion) btnGuardarActualizacion.disabled = true;

  try {
    showLoader(pasarABlackCase ? "Guardando y pasando a Black case..." : "Guardando actualización...");

    if (hayCambiosGestion) {
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
      anexarHistorialLocal(ticketSeleccionado.ID, payload, "ACCESO");
    }

    if (pasarABlackCase) {
      const payloadBlack = {
        accion: "pasarTicketABlackCase",
        id: ticketSeleccionado.ID,
        comentario: comentario || "Paso a Black cases",
        usuario: localStorage.getItem("nombreUsuario") || "Sin usuario",
        rolUsuario: obtenerRolUsuarioActual()
      };

      const responseBlack = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payloadBlack),
        cache: "no-store"
      });

      const resultBlack = await responseBlack.json();

      if (!resultBlack.ok) {
        mostrarToastCentral("No se pudo pasar a Black case", `${resultBlack.mensaje || "Error"}${resultBlack.detalle ? " - " + resultBlack.detalle : ""}`, 3000);
        return;
      }

      actualizarTicketLocalBlackCase(ticketSeleccionado.ID, resultBlack.idBlack);
      limpiarCacheHistorialTicket(ticketSeleccionado.ID);
      await cargarHistorial(ticketSeleccionado.ID);
      mostrarToastCentral("Black case creado", `Se creó ${resultBlack.idBlack || "el IDP"} y quedó relacionado al INC.`, 1800);
    } else {
      mostrarToastCentral("Guardado", "Actualización registrada correctamente.", 1200);
    }

    limpiarFormularioGestion();
    if (ticketSeleccionado) configurarCheckboxBlackCase(ticketSeleccionado);
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
    if (payload.incidencia) nuevo.INCIDENCIA = payload.incidencia;
    if (payload.afectacion) nuevo.AFECTACION = payload.afectacion;
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

function anexarHistorialLocal(idTicket, payload, origen = "ACCESO") {
  const id = String(idTicket || "").trim();
  if (!id) return;
  const item = {
    FECHA: new Date().toISOString(),
    TEXTO: construirTextoHistorialLocal(payload),
    USUARIO: payload.usuario || localStorage.getItem("nombreUsuario") || "Sin usuario",
    ETIQUETA_USUARIO: "Usuario",
    ORIGEN: origen
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

function actualizarTicketLocalBlackCase(idTicket, idBlack) {
  const id = String(idTicket || "").trim();
  const blackId = String(idBlack || "").trim();
  const actualizar = (ticket) => {
    if (String(ticket.ID || "").trim() !== id) return ticket;
    return {
      ...ticket,
      ES_BLACK_CASE: "SI",
      ID_BLACK_CASE: blackId,
      ULTIMO_COMENTARIO: blackId ? `Paso a Black cases: ${blackId}` : "Paso a Black cases",
      ULTIMA_ACTUALIZACION: new Date().toISOString()
    };
  };
  ticketsData = ticketsData.map(actualizar);
  ticketsFiltrados = ticketsFiltrados.map(actualizar);
  if (ticketSeleccionado && String(ticketSeleccionado.ID || "").trim() === id) {
    ticketSeleccionado = actualizar(ticketSeleccionado);
  }
  aplicarFiltros();
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

function separarTextoHistorial(texto) {
  const limpio = String(texto || "").trim();
  if (!limpio) return { datos: "", comentario: "" };

  const partes = limpio
    .split("|")
    .map(x => String(x || "").trim())
    .filter(Boolean);

  const datos = [];
  const comentarios = [];

  partes.forEach(parte => {
    const normalizado = parte.toLowerCase();
    if (normalizado.startsWith("comentario:")) {
      comentarios.push(parte.replace(/^comentario\s*:\s*/i, "").trim());
    } else {
      datos.push(parte);
    }
  });

  if (!comentarios.length && !datos.length) comentarios.push(limpio);

  return {
    datos: datos.join(" | "),
    comentario: comentarios.join(" | ")
  };
}

function renderizarHistorialItems(idTicket, historial) {
  const timeline = document.getElementById("timelineHistorial");
  if (!timeline) return;

  if (!Array.isArray(historial) || historial.length === 0) {
    timeline.innerHTML = `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content timeline-card-v16">
          <div class="timeline-head"><span class="timeline-origin-badge">ACCESO</span><span class="timeline-date-inline">-</span></div>
          <p class="timeline-data-line">Sin historial</p>
          <p class="timeline-comment-line">No hay registros para este ticket.</p>
          <div class="timeline-user-line"><span>User:</span> -</div>
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
    const partes = separarTextoHistorial(texto);
    const usuario = item.USUARIO || "-";
    const origen = String(item.ORIGEN || "ACCESO").toUpperCase();
    const esBlack = origen.includes("BLACK");
    const badge = esBlack ? "BLACK CASE" : "ACCESO";

    const div = document.createElement("div");
    div.className = `timeline-item ${esBlack ? "timeline-origen-black" : "timeline-origen-acceso"}`;
    div.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content timeline-card-v16">
        <div class="timeline-head">
          <span class="timeline-origin-badge ${esBlack ? "black" : ""}">${badge}</span>
          <span class="timeline-date-inline">${escapeHtml(fecha)}</span>
        </div>
        ${partes.datos ? `<p class="timeline-data-line">${escapeHtml(partes.datos)}</p>` : ""}
        ${partes.comentario ? `<p class="timeline-comment-line"><span>Comentario:</span> ${escapeHtml(partes.comentario)}</p>` : ""}
        <div class="timeline-separator"></div>
        <div class="timeline-user-line"><span>User:</span> ${escapeHtml(usuario)}</div>
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
      <div class="timeline-item timeline-origen-acceso">
        <div class="timeline-dot"></div>
        <div class="timeline-content timeline-card-v16">
          <div class="timeline-head"><span class="timeline-origin-badge">ACCESO</span><span class="timeline-date-inline">-</span></div>
          <p class="timeline-data-line">Cargando historial...</p>
          <p class="timeline-comment-line">Obteniendo trazabilidad completa.</p>
          <div class="timeline-separator"></div>
          <div class="timeline-user-line"><span>User:</span> -</div>
        </div>
      </div>
    `;
    return;
  }

  timeline.innerHTML = `
    <div class="timeline-item timeline-origen-acceso">
      <div class="timeline-dot"></div>
      <div class="timeline-content timeline-card-v16">
        <div class="timeline-head"><span class="timeline-origin-badge">ACCESO</span><span class="timeline-date-inline">${escapeHtml(formatearFecha(fecha))}</span></div>
        <p class="timeline-data-line">Último comentario disponible. Cargando historial completo...</p>
        <p class="timeline-comment-line"><span>Comentario:</span> ${escapeHtml(comentario)}</p>
        <div class="timeline-separator"></div>
        <div class="timeline-user-line"><span>User:</span> -</div>
      </div>
    </div>
  `;
}

function limpiarCacheHistorialTicket(idTicket) {
  const id = String(idTicket || "").trim();
  if (!id) return;
  historialTicketsCache.delete(id);
  try { sessionStorage.removeItem("historial_ticket_" + id); } catch (_) {}
}


function supabaseHistorialDisponible() {
  return Boolean(
    SUPABASE_HISTORIAL_ACTIVO &&
    SUPABASE_URL &&
    SUPABASE_PUBLISHABLE_KEY &&
    !String(SUPABASE_PUBLISHABLE_KEY).includes("PEGAR_AQUI")
  );
}

function convertirSupabaseAHistorial(item) {
  const origen = String(item.origen || item.ORIGEN || "ACCESO").toUpperCase();
  const partes = [];
  if (item.estado) partes.push(`Estado: ${item.estado}`);
  if (item.validado) partes.push(`Validado: ${item.validado}`);
  if (item.responsable) partes.push(`Responsable: ${item.responsable}`);
  if (item.torrero) partes.push(`Torrero: ${item.torrero}`);
  if (item.estatus) partes.push(`Estatus: ${item.estatus}`);

  const comentarioBase = String(item.comentario || "").trim();
  if (comentarioBase) {
    const comentarioNormalizado = comentarioBase.toLowerCase();
    const esComentarioEstructurado =
      comentarioNormalizado.includes("incidencia:") ||
      comentarioNormalizado.includes("afectación:") ||
      comentarioNormalizado.includes("afectacion:") ||
      comentarioNormalizado.includes("comentario:");

    if (esComentarioEstructurado) {
      partes.push(comentarioBase);
    } else {
      partes.push(`Comentario: ${comentarioBase}`);
    }
  }

  const texto = partes.join(" | ") || (origen.includes("BLACK") ? "Black case creado" : "Ticket creado");

  return {
    FECHA: item.fecha || item.FECHA || item.created_at || "",
    TEXTO: texto,
    USUARIO: item.usuario || item.USUARIO || "-",
    ETIQUETA_USUARIO: "Usuario",
    ORIGEN: origen.includes("BLACK") ? "BLACK CASE" : "ACCESO",
    ID_INC: item.id_inc || "",
    ID_BLACK: item.id_black || ""
  };
}


function construirEventoCreacionAcceso(ticket) {
  if (!ticket) return null;

  const fecha =
    ticket.FECHA_REGISTRO ||
    ticket.FECHA ||
    ticket.FECHA_CREACION ||
    ticket.FECHA_CREACIÓN ||
    "";

  if (!fecha) return null;

  const usuario =
    ticket.REPORTADO ||
    ticket.CORREO ||
    ticket.USER ||
    ticket.USUARIO ||
    "Sistema";

  return {
    FECHA: fecha,
    TEXTO: "Comentario: Ticket creado",
    USUARIO: usuario,
    ETIQUETA_USUARIO: "User",
    ORIGEN: "ACCESO",
    ES_CREACION_VISUAL: true
  };
}

function agregarEventoCreacionAccesoAHistorial(historial, ticket) {
  const lista = Array.isArray(historial) ? historial.slice() : [];
  const eventoCreacion = construirEventoCreacionAcceso(ticket);

  if (!eventoCreacion) return lista;

  const yaExisteCreacion = lista.some(item => {
    const origen = String(item.ORIGEN || "").toUpperCase();
    const texto = String(item.TEXTO || item.COMENTARIO || "").toLowerCase();
    return origen.includes("ACCESO") && texto.includes("ticket creado");
  });

  if (!yaExisteCreacion) {
    lista.push(eventoCreacion);
  }

  return lista;
}

async function cargarHistorialDesdeSupabasePorInc(idInc) {
  if (!supabaseHistorialDisponible()) return null;
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${SUPABASE_HISTORIAL_TABLE}?select=*&id_inc=eq.${encodeURIComponent(idInc)}&order=fecha.desc`;
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    }
  });
  if (!response.ok) throw new Error("Supabase historial HTTP " + response.status);
  const data = await response.json();
  if (!Array.isArray(data)) return null;
  return data.map(convertirSupabaseAHistorial);
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
    let historial = null;

    try {
      historial = await cargarHistorialDesdeSupabasePorInc(id);
    } catch (supabaseError) {
      console.warn("Supabase historial no disponible, usando Apps Script:", supabaseError);
    }

    if (!historial) {
      const response = await fetch(`${API_URL}?accion=obtenerSeguimiento&id=${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store"
      });
      historial = await response.json();
    }

    if (seq !== historialTicketRequestSeq || String(selectedTicketId || "").trim() !== id) return;

    if (!Array.isArray(historial)) throw new Error(historial?.mensaje || "Respuesta inválida del historial");

    // Híbrido V20: la creación del ticket se arma desde el objeto ACCESO ya cargado,
    // y los seguimientos posteriores se leen desde Supabase o fallback Apps Script.
    historial = agregarEventoCreacionAccesoAHistorial(historial, ticketActual);

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



/* =========================
   ASISTENTE GUÍA ACCESS TICKETS
   Respuestas locales. No usa API ni modifica guardados.
========================= */
(function inicializarAsistenteGuia() {
  const respuestas = {
    actualizar: "Para actualizar un ticket:\n1. Selecciona un registro en la bandeja.\n2. Revisa el panel derecho.\n3. Cambia Estado, Validado, Torre, Responsable, Incidencia o Afectación.\n4. Escribe un comentario si corresponde.\n5. Presiona Guardar actualización.",
    blackcases: "Black cases sirve para casos críticos o bloqueados.\nDesde un ticket puedes marcar Pasar a Black case y guardar. El sistema creará el IDP y mantendrá la trazabilidad relacionada.",
    historial: "Para ver historial, selecciona un ticket o Black case. La trazabilidad aparecerá en el panel de detalle con fecha, usuario, cambios y comentarios registrados.",
    filtros: "Usa los filtros de la cabecera para buscar por ID, CU, Site, zona, tipo de incidencia, afectación, torre, estado, responsable o días. Para volver al listado completo, presiona Limpiar filtros.",
    incidencia: "Incidencia clasifica el tipo de problema: acceso, deuda, contrato, insalubridad, corrosión, SPAT, alta temperatura, robo/vandalismo, falta de servidumbre, entre otros.",
    afectacion: "Afectación indica el impacto del caso: parcial, total, sin afectación, N/A o interferencia. Este dato ayuda a priorizar la atención.",
    reporte: "Para generar un reporte, aplica los filtros necesarios y presiona Generar reporte. Se exportará la información visible según la selección actual.",
    ayuda: "Puedo orientarte con: actualizar ticket, Black cases, historial, filtros, incidencia, afectación o reportes. Elige una opción o escribe una palabra clave."
  };

  function cuandoEsteListo(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function detectarTema(texto) {
    const t = String(texto || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (t.includes("black") || t.includes("idp")) return "blackcases";
    if (t.includes("historial") || t.includes("trazabilidad") || t.includes("seguimiento")) return "historial";
    if (t.includes("filtro") || t.includes("buscar") || t.includes("busqueda")) return "filtros";
    if (t.includes("incidencia") || t.includes("problema") || t.includes("casuistica")) return "incidencia";
    if (t.includes("afectacion") || t.includes("impacto")) return "afectacion";
    if (t.includes("reporte") || t.includes("excel") || t.includes("exportar")) return "reporte";
    if (t.includes("actualizar") || t.includes("guardar") || t.includes("comentario") || t.includes("responsable") || t.includes("estado")) return "actualizar";
    return "ayuda";
  }

  cuandoEsteListo(function() {
    const assistant = document.getElementById("guideAssistant");
    const mascotBtn = document.getElementById("guideMascotBtn");
    const card = document.getElementById("guideChatCard");
    const closeBtn = document.getElementById("guideCloseBtn");
    const hideAllBtn = document.getElementById("guideHideAllBtn");
    const reopenBtn = document.getElementById("guideReopenBtn");
    const body = document.getElementById("guideChatBody");
    const options = document.getElementById("guideQuickOptions");
    const form = document.getElementById("guideInputForm");
    const input = document.getElementById("guideInput");

    if (!assistant || !mascotBtn || !card || !body) return;

    function agregarMensaje(texto, tipo) {
      const div = document.createElement("div");
      div.className = "guide-message " + (tipo === "user" ? "guide-message-user" : "guide-message-bot");
      div.textContent = texto;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function responderPorTema(tema) {
      agregarMensaje(respuestas[tema] || respuestas.ayuda, "bot");
    }

    function abrir() {
      card.classList.remove("guide-hidden");
      mascotBtn.setAttribute("aria-label", "Cerrar asistente de ayuda");
    }

    function cerrar() {
      card.classList.add("guide-hidden");
      mascotBtn.setAttribute("aria-label", "Abrir asistente de ayuda");
    }

    function ocultarMascota() {
      cerrar();
      document.body.classList.add("guide-assistant-closed");
    }

    function mostrarMascota() {
      document.body.classList.remove("guide-assistant-closed");
      abrir();
    }

    mascotBtn.addEventListener("click", function() {
      if (card.classList.contains("guide-hidden")) abrir();
      else cerrar();
    });

    if (closeBtn) closeBtn.addEventListener("click", cerrar);
    if (hideAllBtn) hideAllBtn.addEventListener("click", ocultarMascota);
    if (reopenBtn) reopenBtn.addEventListener("click", mostrarMascota);

    if (options) {
      options.addEventListener("click", function(event) {
        const btn = event.target.closest("button[data-guide-topic]");
        if (!btn) return;
        const tema = btn.getAttribute("data-guide-topic");
        agregarMensaje(btn.textContent.trim(), "user");
        responderPorTema(tema);
      });
    }

    if (form && input) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        const texto = input.value.trim();
        if (!texto) return;
        agregarMensaje(texto, "user");
        responderPorTema(detectarTema(texto));
        input.value = "";
      });
    }

    // En escritorio aparece abierto para que se note en la prueba; en móvil inicia cerrado.
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) {
      cerrar();
    } else {
      abrir();
    }
  });
})();

/* =========================================================
   DYNAMIT REPORT - TABLA DINÁMICA
   - Usa ticketsData completo, NO ticketsFiltrados.
   - No modifica la lógica del reporte existente.
========================================================= */
const DYNAMIC_REPORT_FIELDS = [
  "ID",
  "ASUNTO",
  "REPORTADO",
  "CORREO",
  "EMPRESA",
  "AREA",
  "SITE",
  "CU",
  "SITIO",
  "TORRERO",
  "IMPEDIMENTO",
  "INCIDENCIA",
  "DESCRIPCION",
  "ESPECIFICAR",
  "MANETNIMIENTO",
  "AFECTACION",
  "FECHA_REGISTRO",
  "ESTADO",
  "VALIDADO",
  "RESPONSABLE",
  "FECHA_CIERRE",
  "COLOR",
  "ZONA",
  "ULTIMO_COMENTARIO",
  "ULTIMA_ACTUALIZACION",
  "ES_BLACK_CASE",
  "ID_BLACK_CASE"
];

const dynamicReportState = {
  filters: [],
  columns: [],
  rows: [],
  values: [],
  filterValues: {},
  currentData: [],
  pivotMatrix: { headers: [], rows: [] },
  pivotSort: { index: null, direction: "asc" },
  rawSort: { field: null, direction: "asc" }
};

function dynamicEscapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerValorDynamic(ticket, field) {
  if (!ticket) return "";

  // Alias defensivos para respetar los nombres del encabezado ACCESO.
  const alias = {
    MANETNIMIENTO: ["MANETNIMIENTO", "MANTENIMIENTO"],
    REPORTADO: ["REPORTADO", "REPORTADO_POR"],
    AREA: ["AREA", "ÁREA"],
    DESCRIPCION: ["DESCRIPCION", "DESCRIPCIÓN"],
    ULTIMO_COMENTARIO: ["ULTIMO_COMENTARIO", "ÚLTIMO_COMENTARIO"],
    ULTIMA_ACTUALIZACION: ["ULTIMA_ACTUALIZACION", "ÚLTIMA_ACTUALIZACION"],
    ES_BLACK_CASE: ["ES_BLACK_CASE"],
    ID_BLACK_CASE: ["ID_BLACK_CASE"]
  };

  const candidatos = alias[field] || [field];
  let value = "";
  for (const key of candidatos) {
    if (ticket[key] !== undefined && ticket[key] !== null) {
      value = ticket[key];
      break;
    }
  }

  if (field === "FECHA_REGISTRO" || field === "FECHA_CIERRE") {
    return value ? formatearFechaSolo(value) : "";
  }

  if (field === "COLOR") {
    return obtenerLabelColorTicket(ticket);
  }

  if (field === "VALIDADO") {
    return normalizarValidado(value || ticket.VALIDADO || "");
  }

  return String(value ?? "").trim();
}

function obtenerDataCompletaDynamic() {
  // Importante: SIEMPRE se usa ticketsData, nunca ticketsFiltrados.
  return Array.isArray(ticketsData) ? ticketsData.slice() : [];
}

function abrirDynamicReport() {
  const modal = document.getElementById("dynamicReportModal");
  if (!modal) return;

  dynamicReportState.currentData = obtenerDataCompletaDynamic();
  renderizarDynamicFields();
  renderizarDynamicZones();
  actualizarDynamicReport();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function cerrarDynamicReport() {
  const modal = document.getElementById("dynamicReportModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

function renderizarDynamicFields() {
  const cont = document.getElementById("dynamicFieldsList");
  if (!cont) return;
  const query = String(document.getElementById("dynamicFieldSearch")?.value || "").trim().toLowerCase();
  const fields = DYNAMIC_REPORT_FIELDS.filter(f => f.toLowerCase().includes(query));

  cont.innerHTML = fields.map(field => `
    <div class="dynamic-field-item" draggable="true" data-field="${dynamicEscapeHtml(field)}" title="Arrastrar ${dynamicEscapeHtml(field)}">
      <span class="dynamic-field-icon"></span>
      <span>${dynamicEscapeHtml(field)}</span>
    </div>
  `).join("");

  cont.querySelectorAll(".dynamic-field-item").forEach(item => {
    item.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", item.dataset.field || "");
      e.dataTransfer.effectAllowed = "copy";
    });

    item.addEventListener("click", () => {
      agregarCampoDynamic("rows", item.dataset.field || "");
    });
  });
}

function agregarCampoDynamic(zone, field) {
  if (!DYNAMIC_REPORT_FIELDS.includes(field)) return;
  if (!["filters", "columns", "rows", "values"].includes(zone)) return;

  const lista = dynamicReportState[zone];
  if (lista.some(x => (typeof x === "string" ? x : x.field) === field)) return;

  if (zone === "values") {
    lista.push({ field, agg: "COUNT" });
  } else {
    lista.push(field);
    if (zone === "filters" && dynamicReportState.filterValues[field] === undefined) {
      dynamicReportState.filterValues[field] = "__ALL__";
    }
  }

  renderizarDynamicZones();
  actualizarDynamicReport();
}

function eliminarCampoDynamic(zone, field) {
  if (zone === "values") {
    dynamicReportState.values = dynamicReportState.values.filter(v => v.field !== field);
  } else {
    dynamicReportState[zone] = dynamicReportState[zone].filter(f => f !== field);
    if (zone === "filters") delete dynamicReportState.filterValues[field];
  }
  renderizarDynamicZones();
  actualizarDynamicReport();
}

function obtenerOpcionesCampoDynamic(field) {
  return [...new Set(
    obtenerDataCompletaDynamic()
      .map(t => obtenerValorDynamic(t, field))
      .map(v => v || "(Vacío)")
  )].sort((a, b) => String(a).localeCompare(String(b), "es", { numeric: true }));
}

function renderizarDynamicZones() {
  const map = {
    filters: document.getElementById("dynamicZoneFilters"),
    columns: document.getElementById("dynamicZoneColumns"),
    rows: document.getElementById("dynamicZoneRows"),
    values: document.getElementById("dynamicZoneValues")
  };

  Object.entries(map).forEach(([zone, el]) => {
    if (!el) return;
    const items = dynamicReportState[zone];
    if (!items.length) {
      el.innerHTML = `<div class="dynamic-zone-empty">Arrastra campos aquí</div>`;
      return;
    }

    if (zone === "filters") {
      el.innerHTML = items.map(field => {
        const options = obtenerOpcionesCampoDynamic(field);
        const selected = dynamicReportState.filterValues[field] ?? "__ALL__";
        return `
          <div class="dynamic-zone-pill" data-field="${dynamicEscapeHtml(field)}">
            <span>${dynamicEscapeHtml(field)}</span>
            <button class="dynamic-pill-remove" type="button" data-remove-zone="filters" data-remove-field="${dynamicEscapeHtml(field)}">×</button>
            <select class="dynamic-filter-control" data-filter-field="${dynamicEscapeHtml(field)}">
              <option value="__ALL__">(Todos)</option>
              ${options.map(v => `<option value="${dynamicEscapeHtml(v)}" ${selected === v ? "selected" : ""}>${dynamicEscapeHtml(v)}</option>`).join("")}
            </select>
          </div>`;
      }).join("");
    } else if (zone === "values") {
      el.innerHTML = items.map(item => `
        <div class="dynamic-zone-pill">
          <span>${dynamicEscapeHtml(item.field)}</span>
          <select data-value-field="${dynamicEscapeHtml(item.field)}">
            ${["COUNT","COUNT DISTINCT","SUM","AVG","MIN","MAX"].map(agg => `<option value="${agg}" ${item.agg === agg ? "selected" : ""}>${agg}</option>`).join("")}
          </select>
          <button class="dynamic-pill-remove" type="button" data-remove-zone="values" data-remove-field="${dynamicEscapeHtml(item.field)}">×</button>
        </div>
      `).join("");
    } else {
      el.innerHTML = items.map(field => `
        <div class="dynamic-zone-pill">
          <span>${dynamicEscapeHtml(field)}</span>
          <button class="dynamic-pill-remove" type="button" data-remove-zone="${zone}" data-remove-field="${dynamicEscapeHtml(field)}">×</button>
        </div>
      `).join("");
    }
  });

  document.querySelectorAll("#dynamicReportModal .dynamic-pill-remove").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      eliminarCampoDynamic(btn.dataset.removeZone, btn.dataset.removeField);
    });
  });

  document.querySelectorAll("#dynamicReportModal [data-filter-field]").forEach(select => {
    select.addEventListener("change", () => {
      dynamicReportState.filterValues[select.dataset.filterField] = select.value;
      actualizarDynamicReport();
    });
  });

  document.querySelectorAll("#dynamicReportModal [data-value-field]").forEach(select => {
    select.addEventListener("change", () => {
      const valueItem = dynamicReportState.values.find(v => v.field === select.dataset.valueField);
      if (valueItem) valueItem.agg = select.value;
      actualizarDynamicReport();
    });
  });
}

function limpiarDynamicReport() {
  dynamicReportState.filters = [];
  dynamicReportState.columns = [];
  dynamicReportState.rows = [];
  dynamicReportState.values = [];
  dynamicReportState.filterValues = {};
  dynamicReportState.pivotSort = { index: null, direction: "asc" };
  dynamicReportState.rawSort = { field: null, direction: "asc" };
  renderizarDynamicZones();
  actualizarDynamicReport();
}

function filtrarDataDynamic(data) {
  if (!dynamicReportState.filters.length) return data.slice();
  return data.filter(ticket => dynamicReportState.filters.every(field => {
    const selected = dynamicReportState.filterValues[field] ?? "__ALL__";
    if (selected === "__ALL__") return true;
    const value = obtenerValorDynamic(ticket, field) || "(Vacío)";
    return value === selected;
  }));
}

function dynamicNumeric(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value ?? "").replace(/\s/g, "").replace(/,/g, ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function calcularAgregadoDynamic(items, field, agg) {
  if (agg === "COUNT") return items.length;

  const raw = items.map(t => obtenerValorDynamic(t, field));
  if (agg === "COUNT DISTINCT") {
    return new Set(raw.filter(v => v !== "")).size;
  }

  const nums = raw.map(dynamicNumeric).filter(v => v !== null);
  if (!nums.length) return 0;
  if (agg === "SUM") return nums.reduce((a,b) => a+b, 0);
  if (agg === "AVG") return nums.reduce((a,b) => a+b, 0) / nums.length;
  if (agg === "MIN") return Math.min(...nums);
  if (agg === "MAX") return Math.max(...nums);
  return items.length;
}

function formatDynamicNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return value;
  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("es-PE", { maximumFractionDigits: 2 });
}

function construirPivotDynamic(data) {
  const rowFields = dynamicReportState.rows;
  const colFields = dynamicReportState.columns;
  const values = dynamicReportState.values.length
    ? dynamicReportState.values
    : [{ field: "ID", agg: "COUNT", synthetic: true }];

  if (!rowFields.length && !colFields.length) {
    return {
      headers: ["Métrica", "Valor"],
      rows: values.map(v => [v.synthetic ? "Cantidad de registros" : `${v.agg} de ${v.field}`, calcularAgregadoDynamic(data, v.field, v.agg)])
    };
  }

  const makeKey = (ticket, fields) => fields.map(f => obtenerValorDynamic(ticket, f) || "(Vacío)").join(" | ");
  const rowKeys = rowFields.length ? [...new Set(data.map(t => makeKey(t, rowFields)))] : ["Total"];
  const colKeys = colFields.length ? [...new Set(data.map(t => makeKey(t, colFields)))] : [""];

  rowKeys.sort((a,b) => a.localeCompare(b, "es", { numeric: true }));
  colKeys.sort((a,b) => a.localeCompare(b, "es", { numeric: true }));

  const headers = [...(rowFields.length ? rowFields : ["FILAS"])];
  if (colFields.length) {
    for (const colKey of colKeys) {
      for (const v of values) {
        const metric = v.synthetic ? "Cantidad" : `${v.agg} ${v.field}`;
        headers.push(`${colKey} · ${metric}`);
      }
    }
  } else {
    for (const v of values) headers.push(v.synthetic ? "Cantidad" : `${v.agg} ${v.field}`);
  }

  const rows = rowKeys.map(rowKey => {
    const rowParts = rowFields.length ? rowKey.split(" | ") : ["Total"];
    const out = [...rowParts];
    const rowData = rowFields.length ? data.filter(t => makeKey(t, rowFields) === rowKey) : data;

    for (const colKey of colKeys) {
      const groupData = colFields.length ? rowData.filter(t => makeKey(t, colFields) === colKey) : rowData;
      for (const v of values) out.push(calcularAgregadoDynamic(groupData, v.field, v.agg));
    }
    return out;
  });

  return { headers, rows };
}

function actualizarDynamicReport() {
  const source = obtenerDataCompletaDynamic();
  const used = filtrarDataDynamic(source);
  dynamicReportState.currentData = used;
  dynamicReportState.pivotMatrix = construirPivotDynamic(used);
  renderizarPivotDynamic();
  renderizarRawDynamic();

  const summary = document.getElementById("dynamicSummaryText");
  if (summary) {
    const rowText = dynamicReportState.rows.length ? `Filas: ${dynamicReportState.rows.join(", ")}` : "Sin filas";
    const colText = dynamicReportState.columns.length ? `Columnas: ${dynamicReportState.columns.join(", ")}` : "Sin columnas";
    summary.textContent = `${rowText} · ${colText} · ${used.length} registros`;
  }
}

function obtenerFechaOrdenDynamic(valor) {
  const texto = String(valor ?? "").trim();
  if (!texto) return null;

  const match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;

  const [, dia, mes, anio, hora = "0", minuto = "0", segundo = "0"] = match;
  const fecha = new Date(
    Number(anio),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto),
    Number(segundo)
  );

  return isNaN(fecha.getTime()) ? null : fecha.getTime();
}

function compararValoresDynamic(a, b) {
  const textoA = String(a ?? "").trim();
  const textoB = String(b ?? "").trim();

  if (!textoA && !textoB) return 0;
  if (!textoA) return 1;
  if (!textoB) return -1;

  const fechaA = obtenerFechaOrdenDynamic(textoA);
  const fechaB = obtenerFechaOrdenDynamic(textoB);
  if (fechaA !== null && fechaB !== null) return fechaA - fechaB;

  const numeroA = dynamicNumeric(textoA);
  const numeroB = dynamicNumeric(textoB);
  if (numeroA !== null && numeroB !== null) return numeroA - numeroB;

  return textoA.localeCompare(textoB, "es", {
    numeric: true,
    sensitivity: "base"
  });
}

function obtenerFilasPivotOrdenadasDynamic() {
  const matrix = dynamicReportState.pivotMatrix;
  const filas = Array.isArray(matrix.rows) ? matrix.rows.slice() : [];
  const sort = dynamicReportState.pivotSort;

  if (sort.index === null || sort.index < 0 || sort.index >= matrix.headers.length) {
    return filas;
  }

  const factor = sort.direction === "desc" ? -1 : 1;
  return filas.sort((a, b) => compararValoresDynamic(a[sort.index], b[sort.index]) * factor);
}

function obtenerDataRawOrdenadaDynamic() {
  const data = Array.isArray(dynamicReportState.currentData)
    ? dynamicReportState.currentData.slice()
    : [];

  const sort = dynamicReportState.rawSort;
  if (!sort.field) return data;

  const factor = sort.direction === "desc" ? -1 : 1;
  return data.sort((a, b) => {
    const valorA = obtenerValorDynamic(a, sort.field);
    const valorB = obtenerValorDynamic(b, sort.field);
    return compararValoresDynamic(valorA, valorB) * factor;
  });
}

function indicadorOrdenPivotDynamic(index) {
  const sort = dynamicReportState.pivotSort;
  if (sort.index !== index) return " ↕";
  return sort.direction === "asc" ? " ▲" : " ▼";
}

function indicadorOrdenRawDynamic(field) {
  const sort = dynamicReportState.rawSort;
  if (sort.field !== field) return " ↕";
  return sort.direction === "asc" ? " ▲" : " ▼";
}

function renderizarPivotDynamic() {
  const head = document.getElementById("dynamicPivotHead");
  const body = document.getElementById("dynamicPivotBody");
  if (!head || !body) return;

  const matrix = dynamicReportState.pivotMatrix;
  const filasOrdenadas = obtenerFilasPivotOrdenadasDynamic();

  head.innerHTML = `
    <tr>
      ${matrix.headers.map((h, index) => `
        <th
          data-dynamic-pivot-sort="${index}"
          title="Ordenar ascendente / descendente"
          style="cursor:pointer; user-select:none;"
        >
          ${dynamicEscapeHtml(h)}${indicadorOrdenPivotDynamic(index)}
        </th>
      `).join("")}
    </tr>
  `;

  body.innerHTML = filasOrdenadas.length
    ? filasOrdenadas.map(row => `
        <tr>
          ${row.map((v,i) => `
            <td class="${typeof v === "number" && i >= dynamicReportState.rows.length ? "dynamic-number" : ""}">
              ${dynamicEscapeHtml(formatDynamicNumber(v))}
            </td>
          `).join("")}
        </tr>
      `).join("")
    : `<tr><td colspan="${Math.max(1, matrix.headers.length)}">Sin datos para la configuración seleccionada.</td></tr>`;

  head.querySelectorAll("[data-dynamic-pivot-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const index = Number(th.dataset.dynamicPivotSort);

      if (dynamicReportState.pivotSort.index === index) {
        dynamicReportState.pivotSort.direction =
          dynamicReportState.pivotSort.direction === "asc" ? "desc" : "asc";
      } else {
        dynamicReportState.pivotSort = { index, direction: "asc" };
      }

      renderizarPivotDynamic();
    });
  });
}

function obtenerFilaRawDynamic(ticket) {
  const row = {};
  DYNAMIC_REPORT_FIELDS.forEach(field => {
    row[field] = obtenerValorDynamic(ticket, field);
  });
  return row;
}

function renderizarRawDynamic() {
  const head = document.getElementById("dynamicRawHead");
  const body = document.getElementById("dynamicRawBody");
  const count = document.getElementById("dynamicDataCount");
  if (!head || !body) return;

  const data = obtenerDataRawOrdenadaDynamic();
  if (count) count.textContent = `${data.length} registros`;

  head.innerHTML = `
    <tr>
      ${DYNAMIC_REPORT_FIELDS.map(field => `
        <th
          data-dynamic-raw-sort="${dynamicEscapeHtml(field)}"
          title="Ordenar A-Z / Z-A, menor-mayor o fecha"
          style="cursor:pointer; user-select:none;"
        >
          ${dynamicEscapeHtml(field)}${indicadorOrdenRawDynamic(field)}
        </th>
      `).join("")}
    </tr>
  `;

  // Para mantener el modal ágil, se muestran hasta 300 filas en pantalla.
  // La exportación Excel incluye TODAS las filas utilizadas.
  const visible = data.slice(0, 300);

  body.innerHTML = visible.length
    ? visible.map(ticket => {
        const row = obtenerFilaRawDynamic(ticket);
        return `<tr>${DYNAMIC_REPORT_FIELDS.map(f => `<td>${dynamicEscapeHtml(row[f])}</td>`).join("")}</tr>`;
      }).join("")
    : `<tr><td colspan="${DYNAMIC_REPORT_FIELDS.length}">Sin registros.</td></tr>`;

  if (data.length > 300) {
    body.insertAdjacentHTML(
      "beforeend",
      `<tr><td colspan="${DYNAMIC_REPORT_FIELDS.length}"><strong>Vista limitada a 300 filas. Excel exportará los ${data.length} registros.</strong></td></tr>`
    );
  }

  head.querySelectorAll("[data-dynamic-raw-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const field = th.dataset.dynamicRawSort;

      if (dynamicReportState.rawSort.field === field) {
        dynamicReportState.rawSort.direction =
          dynamicReportState.rawSort.direction === "asc" ? "desc" : "asc";
      } else {
        dynamicReportState.rawSort = { field, direction: "asc" };
      }

      renderizarRawDynamic();
    });
  });
}

function exportarDynamicExcel() {
  if (!window.XLSX) {
    alert("La librería XLSX no está disponible.");
    return;
  }

  const matrix = dynamicReportState.pivotMatrix;
  const pivotRowsOrdenadas = obtenerFilasPivotOrdenadasDynamic();
  const rawData = obtenerDataRawOrdenadaDynamic().map(obtenerFilaRawDynamic);

  if (!rawData.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const wb = XLSX.utils.book_new();
  const pivotAoa = [matrix.headers, ...pivotRowsOrdenadas.map(r => r.map(formatDynamicNumber))];
  const wsPivot = XLSX.utils.aoa_to_sheet(pivotAoa);
  const wsData = XLSX.utils.json_to_sheet(rawData, { header: DYNAMIC_REPORT_FIELDS });

  wsPivot["!cols"] = matrix.headers.map((h, i) => ({ wch: Math.min(Math.max(String(h).length + 4, i < dynamicReportState.rows.length ? 18 : 14), 38) }));
  wsData["!cols"] = DYNAMIC_REPORT_FIELDS.map(f => ({
    wch: ["DESCRIPCION", "ULTIMO_COMENTARIO"].includes(f) ? 55 : Math.min(Math.max(f.length + 4, 14), 25)
  }));

  XLSX.utils.book_append_sheet(wb, wsPivot, "Tabla Dinamica");
  XLSX.utils.book_append_sheet(wb, wsData, "Data Utilizada");

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `dynamit_report_${fecha}.xlsx`);
}

function inicializarDynamicReport() {
  const btn = document.getElementById("btnDynamicReport");
  const modal = document.getElementById("dynamicReportModal");
  const btnClose = document.getElementById("btnCerrarDynamicReport");
  const search = document.getElementById("dynamicFieldSearch");
  const btnLimpiar = document.getElementById("btnDynamicLimpiar");
  const btnActualizar = document.getElementById("btnDynamicActualizar");
  const btnExport = document.getElementById("btnDynamicExportExcel");

  if (btn) btn.addEventListener("click", abrirDynamicReport);
  if (btnClose) btnClose.addEventListener("click", cerrarDynamicReport);
  if (search) search.addEventListener("input", renderizarDynamicFields);
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarDynamicReport);
  if (btnActualizar) btnActualizar.addEventListener("click", actualizarDynamicReport);
  if (btnExport) btnExport.addEventListener("click", exportarDynamicExcel);

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) cerrarDynamicReport();
    });
  }

  document.querySelectorAll("#dynamicReportModal .dynamic-drop-zone").forEach(zoneEl => {
    zoneEl.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      zoneEl.classList.add("drag-over");
    });
    zoneEl.addEventListener("dragleave", () => zoneEl.classList.remove("drag-over"));
    zoneEl.addEventListener("drop", e => {
      e.preventDefault();
      zoneEl.classList.remove("drag-over");
      const field = e.dataTransfer.getData("text/plain");
      agregarCampoDynamic(zoneEl.dataset.zone, field);
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) cerrarDynamicReport();
  });

  renderizarDynamicFields();
  renderizarDynamicZones();
}

document.addEventListener("DOMContentLoaded", inicializarDynamicReport);
