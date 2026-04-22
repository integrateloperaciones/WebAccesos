const correoUsuarioTexto = document.getElementById("correoUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const btnRefrescarData = document.getElementById("btnRefrescarData");
const btnToggleSidebar = document.getElementById("btnToggleSidebar");

const loaderOverlay = document.getElementById("loaderOverlay");
const loaderText = document.getElementById("loaderText");

const API_URL = "https://script.google.com/macros/s/AKfycbyH61t1jGJTog6IKxBu5NjmwGP09XXKFKV8G7nNifzu8eRhAEv3P5x8aDIlS3-iilxe/exec";

const tbody = document.getElementById("ticketsTableBody");

const statTotal = document.getElementById("statTotal");
const statAbiertos = document.getElementById("statAbiertos");
const statEnProceso = document.getElementById("statEnProceso");
const statCerrados = document.getElementById("statCerrados");

const searchTicket = document.getElementById("searchTicket");
const searchTicketTop = document.getElementById("searchTicketTop");
const filterEstado = document.getElementById("filterEstado");
const filterDias = document.getElementById("filterDias");

const updateEstado = document.getElementById("updateEstado");
const updateValidado = document.getElementById("updateValidado");
const updateResponsable = document.getElementById("updateResponsable");
const updateComentario = document.getElementById("updateComentario");
const btnGuardarActualizacion = document.getElementById("btnGuardarActualizacion");
const btnLimpiarGestion = document.getElementById("btnLimpiarGestion");

let ticketsData = [];
let ticketsFiltrados = [];
let ticketSeleccionado = null;
let selectedTicketId = null;

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
  localStorage.removeItem("ultimaActividad");
}

function cerrarSesion(motivo = "Sesión cerrada.") {
  limpiarSesion();
  alert(motivo);
  window.location.replace("index.html");
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
  vigilarInactividad();

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener("click", toggleSidebar);
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      cerrarSesion("Sesión cerrada correctamente.");
    });
  }

  if (searchTicket) {
    searchTicket.addEventListener("input", () => {
      if (searchTicketTop) searchTicketTop.value = searchTicket.value;
      aplicarFiltros();
    });
  }

  if (searchTicketTop) {
    searchTicketTop.addEventListener("input", () => {
      if (searchTicket) searchTicket.value = searchTicketTop.value;
      aplicarFiltros();
    });
  }

  if (filterEstado) filterEstado.addEventListener("change", aplicarFiltros);
  if (filterDias) filterDias.addEventListener("change", aplicarFiltros);

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
          <td colspan="7" style="text-align:center; padding:20px;">
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
      RESPONSABLE: String(ticket.RESPONSABLE || "").trim()
    }));

    if (idASeleccionar) {
      selectedTicketId = idASeleccionar;
    }

    actualizarTarjetas(ticketsData);
    aplicarFiltros();
  } catch (error) {
    console.error("Error al cargar tickets:", error);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px;">
          Error al cargar la data.
        </td>
      </tr>
    `;
    limpiarDetalle();
  } finally {
    if (showLoading) hideLoader();
  }
}

function actualizarTarjetas(tickets) {
  const total = tickets.length;
  const abiertos = tickets.filter(t => normalizarEstado(t.ESTADO) === "abierto").length;
  const enProceso = tickets.filter(t => normalizarEstado(t.ESTADO) === "en proceso").length;
  const cerrados = tickets.filter(t => normalizarEstado(t.ESTADO) === "cerrado").length;

  if (statTotal) statTotal.textContent = total;
  if (statAbiertos) statAbiertos.textContent = abiertos;
  if (statEnProceso) statEnProceso.textContent = enProceso;
  if (statCerrados) statCerrados.textContent = cerrados;
}

function aplicarFiltros() {
  const textoBusqueda = (searchTicket?.value || "").trim().toLowerCase();
  const estadoSeleccionado = filterEstado?.value || "Todos";
  const diasSeleccionado = filterDias?.value || "Todos";

  ticketsFiltrados = ticketsData.filter(ticket => {
    const id = String(ticket.ID || "").toLowerCase();
    const site = String(ticket.SITE || "").toLowerCase();
    const asunto = String(ticket.ASUNTO || "").toLowerCase();
    const empresa = String(ticket.EMPRESA || "").toLowerCase();
    const incidencia = String(ticket.INCIDENCIA || "").toLowerCase();

    const coincideBusqueda =
      textoBusqueda === "" ||
      id.includes(textoBusqueda) ||
      site.includes(textoBusqueda) ||
      asunto.includes(textoBusqueda) ||
      empresa.includes(textoBusqueda) ||
      incidencia.includes(textoBusqueda);

    const coincideEstado =
      estadoSeleccionado === "Todos" ||
      normalizarEstado(ticket.ESTADO) === estadoSeleccionado.toLowerCase();

    let coincideDias = true;
    const dias = Number(ticket.DIAS_CALCULADOS || 0);

    if (diasSeleccionado !== "Todos") {
      if (diasSeleccionado === "7+") {
        coincideDias = dias >= 7;
      } else {
        coincideDias = dias === Number(diasSeleccionado);
      }
    }

    return coincideBusqueda && coincideEstado && coincideDias;
  });

  renderizarTabla(ticketsFiltrados);
}

function renderizarTabla(tickets) {
  tbody.innerHTML = "";

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px;">
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

    tr.innerHTML = `
      <td>${escapeHtml(ticket.ID || "")}</td>
      <td>${escapeHtml(ticket.INCIDENCIA || "")}</td>
      <td>${escapeHtml(ticket.AFECTACION || "")}</td>
      <td>${escapeHtml(ticket.TORRERO || "")}</td>
      <td>${escapeHtml(ticket.SITE || "")}</td>
      <td>
        <span class="badge ${obtenerClaseEstado(ticket.ESTADO)}">
          ${escapeHtml(ticket.ESTADO || "")}
        </span>
      </td>
      <td>${ticket.DIAS_CALCULADOS ?? 0}</td>
    `;

    tr.addEventListener("click", function () {
      selectedTicketId = ticket.ID;
      document.querySelectorAll(".ticket-row").forEach(f => f.classList.remove("active-row"));
      tr.classList.add("active-row");
      mostrarDetalle(ticket);
    });

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
  if (texto.includes("abierto")) return "badge-danger";
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
  setText("detailCU", ticket.CU || "-");
  setText("detailSitio", ticket.SITIO || "-");
  setText("detailTorrero", ticket.TORRERO || "-");
  setText("detailImpedimento", ticket.IMPEDIMENTO || "-");
  setText("detailAfectacion", ticket.AFECTACION || "-");
  setText("detailAtencion", ticket.ATENCION || "-");
  setText("detailPara", ticket.PARA || "-");
  setText("detailFechaRegistro", formatearFecha(ticket.FECHA_REGISTRO));

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
  updateResponsable.value = "";
  updateComentario.value = "";
}

async function guardarActualizacion() {
  if (!ticketSeleccionado) {
    alert("Primero selecciona un ticket.");
    return;
  }

  const estado = updateEstado.value.trim();
  const validado = updateValidado.value.trim();
  const responsable = updateResponsable.value.trim();
  const comentario = updateComentario.value.trim();

  const payload = {
    accion: "guardarSeguimiento",
    id: ticketSeleccionado.ID,
    usuario: localStorage.getItem("nombreUsuario") || "Sin usuario"
  };

  if (estado) payload.estado = estado;
  if (validado) payload.validado = validado;
  if (responsable) payload.responsable = responsable;
  if (comentario) payload.comentario = comentario;

  const noHayCambios =
    !payload.estado &&
    !payload.validado &&
    !payload.responsable &&
    !payload.comentario;

  if (noHayCambios) {
    alert("No hay cambios para guardar.");
    return;
  }

  try {
    showLoader("Guardando actualización...");

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
      alert((result.mensaje || "No se pudo guardar la actualización.") + "\n" + (result.detalle || ""));
      return;
    }

    alert("Actualización guardada correctamente.");
    await cargarTickets(ticketSeleccionado.ID, {
      showLoading: false
    });
    limpiarFormularioGestion();
  } catch (error) {
    console.error("Error al guardar actualización:", error);
    alert("Error al guardar la actualización.");
  } finally {
    hideLoader();
  }
}

async function cargarHistorial(idTicket) {
  const timeline = document.getElementById("timelineHistorial");
  if (!timeline) return;

  timeline.innerHTML = `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <strong>Cargando...</strong>
        <p>Obteniendo historial del ticket.</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch(`${API_URL}?accion=obtenerSeguimiento&id=${encodeURIComponent(idTicket)}`, {
      method: "GET",
      cache: "no-store"
    });

    const historial = await response.json();

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

    timeline.innerHTML = "";

    historial.forEach(item => {
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
  } catch (error) {
    console.error("Error al cargar historial:", error);
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