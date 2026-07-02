/* =========================
   BLACK CASES MODULE
   Mantiene independiente la lógica de Bandeja de Tickets.
========================= */
const BLACK_API_URL = "https://script.google.com/macros/s/AKfycbwIrUk1l-ip-zYUFb1YTKCIHT8ir1ELh0Joj8wmLr9TisB2RpyYyxBZiSR2KZzHryhq/exec";

const menuBlackCases = document.getElementById("menuBlackCases");
const blackCasesView = document.getElementById("blackCasesView");
const blackCasesTableBody = document.getElementById("blackCasesTableBody");
const btnBlackLimpiarFiltros = document.getElementById("btnBlackLimpiarFiltros");
const btnBlackExportarExcel = document.getElementById("btnBlackExportarExcel");
const btnBlackNuevoCaso = document.getElementById("btnBlackNuevoCaso");
const btnBlackCerrarDrawer = document.getElementById("btnBlackCerrarDrawer");
const btnBlackCancelar = document.getElementById("btnBlackCancelar");
const btnBlackGuardar = document.getElementById("btnBlackGuardar");
const blackCaseDrawer = document.getElementById("blackCaseDrawer");
const blackDrawerTitle = document.getElementById("blackDrawerTitle");
const blackDrawerSubtitle = document.getElementById("blackDrawerSubtitle");
const blackSiteSearch = document.getElementById("blackSiteSearch");
const blackSiteResults = document.getElementById("blackSiteResults");
const blackTimeline = document.getElementById("blackTimeline");
const toastCenter = document.getElementById("toastCenter");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");

const blackFilterTextInputs = {
  id: document.getElementById("blackFilterId"),
  cu: document.getElementById("blackFilterCu"),
  site: document.getElementById("blackFilterSite"),
  comentario: document.getElementById("blackFilterComentario")
};

const BLACK_FORM = {
  FECHA_REGISTRO: document.getElementById("blackFechaRegistro"),
  ID: document.getElementById("blackId"),
  CU: document.getElementById("blackCu"),
  SITE: document.getElementById("blackSite"),
  ZONA: document.getElementById("blackZona"),
  DEPARTAMENTO: document.getElementById("blackDepartamento"),
  TORRERA: document.getElementById("blackTorrera"),
  RESPONSABLE: document.getElementById("blackResponsable"),
  AREA_RESPONSABLE: document.getElementById("blackAreaResponsable"),
  PERSONA_RESPONSABLE: document.getElementById("blackPersonaResponsable"),
  CASUISTICA: document.getElementById("blackCasuistica"),
  DETALLE_CASUISTICA: document.getElementById("blackDetalleCasuistica"),
  AFECTACION_DE_SERVICIOS: document.getElementById("blackAfectacionServicios"),
  INGRESO_A_BLACKLIST: document.getElementById("blackIngresoBlacklist"),
  COMENTARIOS_DEL_TORRERO: document.getElementById("blackComentariosTorrero"),
  CONTRATO: document.getElementById("blackContrato"),
  FECHA_LIBERACION: document.getElementById("blackFechaLiberacion"),
  ACUERDO: document.getElementById("blackAcuerdo"),
  VENCIMIENTO_CONTRATO: document.getElementById("blackVencimientoContrato"),
  SECRETARIA_GENERAL: document.getElementById("blackSecretariaGeneral"),
  ESTATUS: document.getElementById("blackEstatus"),
  RECONFIRMAR_BORRADO: document.getElementById("blackReconfirmarBorrado"),
  MES: document.getElementById("blackMes"),
  ANIO: document.getElementById("blackAnio"),
  CRUCE_COMITE_DISPONIBILIDAD: document.getElementById("blackCruceComite"),
  COMENTARIO_SEGUIMIENTO: document.getElementById("blackComentarioSeguimiento")
};

let blackData = [];
let blackFiltrados = [];
let blackSeleccionado = null;
let blackModo = "nuevo";
let blackFiltroSets = {
  color: new Set(),
  fecha: new Set(),
  zona: new Set(),
  departamento: new Set(),
  torrera: new Set(),
  responsable: new Set(),
  area: new Set(),
  persona: new Set(),
  casuistica: new Set(),
  afectacion: new Set(),
  estatus: new Set(),
  dias: new Set()
};

const BLACK_COLORES_FILA = {
  "": { label: "Sin color", color: "#ffffff", background: "" },
  naranja: { label: "Naranja", color: "#f59e0b", background: "#f5c16c" },
  rojo: { label: "Rojo", color: "#ef4444", background: "#f3a4a4" },
  verde: { label: "Verde limón", color: "#84cc16", background: "#b7d95a" },
  plomo: { label: "Plomo", color: "#6b7280", background: "#c4c7cc" }
};

function blackNormalizarColor(valor) {
  const texto = blackNormalizar(valor);
  if (texto === "naranja" || texto === "anaranjado" || texto === "ambar") return "naranja";
  if (texto === "rojo") return "rojo";
  if (texto === "verde" || texto === "verde limon") return "verde";
  if (texto === "plomo" || texto === "gris") return "plomo";
  return "";
}

function blackObtenerColor(ticket) {
  const colorKey = blackNormalizarColor(ticket?.COLOR);
  return Object.prototype.hasOwnProperty.call(BLACK_COLORES_FILA, colorKey) ? colorKey : "";
}

function blackObtenerLabelColor(ticket) {
  const colorKey = blackObtenerColor(ticket);
  return BLACK_COLORES_FILA[colorKey]?.label || "Sin color";
}

function blackObtenerBackground(ticket) {
  const colorKey = blackObtenerColor(ticket);
  return BLACK_COLORES_FILA[colorKey]?.background || "";
}

function blackEsViewer() {
  return typeof esUsuarioVisualizador === "function" ? esUsuarioVisualizador() : String(localStorage.getItem("rolUsuario") || "editor").toLowerCase() === "viewer";
}

function blackRolActual() {
  return typeof obtenerRolUsuarioActual === "function" ? obtenerRolUsuarioActual() : String(localStorage.getItem("rolUsuario") || "editor").toLowerCase();
}

const blackFiltrosConfig = {
  color: { el: document.getElementById("blackFilterColor"), label: "Color", selector: t => blackObtenerLabelColor(t) },
  fecha: { el: document.getElementById("blackFilterFecha"), label: "Fecha", selector: t => blackFechaSolo(t.FECHA_REGISTRO) },
  zona: { el: document.getElementById("blackFilterZona"), label: "Zona", selector: t => blackVal(t.ZONA) },
  departamento: { el: document.getElementById("blackFilterDepartamento"), label: "Departamento", selector: t => blackVal(t.DEPARTAMENTO) },
  torrera: { el: document.getElementById("blackFilterTorrera"), label: "Torrera", selector: t => blackVal(t.TORRERA || t.TORRERA_) },
  responsable: { el: document.getElementById("blackFilterResponsable"), label: "Responsable", selector: t => blackVal(t.RESPONSABLE) },
  area: { el: document.getElementById("blackFilterArea"), label: "Área", selector: t => blackVal(t.AREA_RESPONSABLE) },
  persona: { el: document.getElementById("blackFilterPersona"), label: "Persona", selector: t => blackVal(t.PERSONA_RESPONSABLE) },
  casuistica: { el: document.getElementById("blackFilterCasuistica"), label: "Casuística", selector: t => blackVal(t.CASUISTICA) },
  afectacion: { el: document.getElementById("blackFilterAfectacion"), label: "Afectación", selector: t => blackVal(t.AFECTACION_DE_SERVICIOS) },
  estatus: { el: document.getElementById("blackFilterEstatus"), label: "Estatus", selector: t => blackVal(t.ESTATUS || t.STATUS) },
  dias: { el: document.getElementById("blackFilterDias"), label: "Días", selector: t => String(t.DIAS_CALCULADOS ?? t.DIAS ?? 0) }
};

function blackVal(valor) {
  const texto = String(valor ?? "").trim();
  return texto || "Sin dato";
}

function blackNormalizar(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function blackEscape(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function blackFechaSolo(valor) {
  if (!valor) return "";
  if (valor instanceof Date) return valor.toLocaleDateString("es-PE");

  const texto = String(valor).trim();
  if (!texto || texto.toUpperCase() === "NA") return texto;

  const matchIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIso) return `${matchIso[3]}/${matchIso[2]}/${matchIso[1]}`;

  const matchSlash = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (matchSlash) {
    const d = matchSlash[1].padStart(2, "0");
    const m = matchSlash[2].padStart(2, "0");
    return `${d}/${m}/${matchSlash[3]}`;
  }

  const fecha = new Date(texto);
  if (!isNaN(fecha.getTime())) return fecha.toLocaleDateString("es-PE");
  return texto.split(" ")[0];
}

function blackFechaInput(valor) {
  if (!valor) return "";
  const texto = String(valor).trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const slash = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slash) return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
  const fecha = new Date(texto);
  if (!isNaN(fecha.getTime())) return fecha.toISOString().slice(0, 10);
  return "";
}

function blackEstatusCanonico(estatus) {
  const e = blackNormalizar(estatus);
  if (e === "liberado" || e === "liberada") return "Liberado";
  if (e === "cancelado" || e === "cancelada") return "Cancelado";
  if (e === "pendiente" || !e) return "Pendiente";
  if (e.includes("proceso") || e.includes("progreso")) return "En progreso";
  return String(estatus || "Pendiente").trim();
}

function blackEsCerrado(estatus) {
  const e = blackNormalizar(estatus);
  return e === "liberado" || e === "liberada" || e === "cancelado" || e === "cancelada" || e === "cerrado" || e === "cerrada" || e === "cierre" || e === "finalizado" || e === "finalizada";
}

function blackMostrarToast(titulo, mensaje) {
  if (!toastCenter) return;
  if (toastTitle) toastTitle.textContent = titulo || "Listo";
  if (toastMessage) toastMessage.textContent = mensaje || "Operación realizada correctamente.";
  toastCenter.classList.remove("hidden");
  setTimeout(() => toastCenter.classList.add("hidden"), 2200);
}

function blackShowLoader(texto) {
  if (typeof showLoader === "function") showLoader(texto);
}

function blackHideLoader() {
  if (typeof hideLoader === "function") hideLoader();
}

function blackActivo() {
  return blackCasesView && !blackCasesView.classList.contains("hidden");
}

async function blackFetch(params = {}, postData = null) {
  if (postData) {
    const response = await fetch(BLACK_API_URL, {
      method: "POST",
      body: JSON.stringify(postData)
    });
    return response.json();
  }

  const url = new URL(BLACK_API_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url.toString(), { method: "GET" });
  return response.json();
}

async function blackCargarCasos(options = {}) {
  try {
    if (options.showLoading) blackShowLoader(options.loadingText || "Cargando black cases...");
    const data = await blackFetch({ accion: "obtenerBlacklist" });
    if (!Array.isArray(data)) {
      throw new Error(data?.mensaje || "No se pudo obtener la data de BLACKLIST");
    }
    blackData = data;
    blackAplicarFiltros();
  } catch (error) {
    console.error(error);
    blackMostrarToast("No se pudo cargar", String(error.message || error));
  } finally {
    blackHideLoader();
  }
}

function blackMostrarVista() {
  if (typeof aplicarPermisosUI === "function") aplicarPermisosUI();
  if (btnBlackNuevoCaso) btnBlackNuevoCaso.style.display = blackEsViewer() ? "none" : "";
  if (bandejaView) bandejaView.classList.add("hidden");
  if (reportesView) reportesView.classList.add("hidden");
  if (blackCasesView) blackCasesView.classList.remove("hidden");

  if (menuBandeja) menuBandeja.classList.remove("active");
  if (menuReportes) menuReportes.classList.remove("active");
  if (menuBlackCases) menuBlackCases.classList.add("active");

  document.body.classList.remove("reportes-activo");
  if (pageTitle) pageTitle.textContent = "Black cases";
  if (searchTicketTop) {
    searchTicketTop.style.display = "block";
    searchTicketTop.placeholder = "Buscar por ID, CU, SITE o comentario...";
  }
  if (btnRefrescarData) btnRefrescarData.style.display = "inline-flex";
  const topbarStats = document.getElementById("topbarStats");
  if (topbarStats) topbarStats.style.display = "grid";
  blackActualizarStats();

  if (!blackData.length) {
    blackCargarCasos({ showLoading: true, loadingText: "Cargando black cases..." });
  } else {
    blackAplicarFiltros();
  }
}

function blackConfigurarStats() {
  const cards = document.querySelectorAll("#topbarStats .stat-card");
  cards.forEach((card, index) => {
    card.style.display = index < 4 ? "flex" : "none";
  });

  const labels = document.querySelectorAll("#topbarStats .stat-card span");
  if (labels[0]) labels[0].textContent = "Total casos";
  if (labels[1]) labels[1].textContent = "Pendientes";
  if (labels[2]) labels[2].textContent = "Liberados";
  if (labels[3]) labels[3].textContent = "Cancelados";
}

function blackActualizarStats() {
  blackConfigurarStats();

  const total = blackFiltrados.length;
  let pendientes = 0;
  let liberados = 0;
  let cancelados = 0;

  blackFiltrados.forEach(t => {
    const e = blackNormalizar(t.ESTATUS || t.STATUS || "Pendiente");

    if (e === "liberado" || e === "liberada") {
      liberados += 1;
    } else if (e === "cancelado" || e === "cancelada") {
      cancelados += 1;
    } else {
      pendientes += 1;
    }
  });

  const cards = document.querySelectorAll("#topbarStats .stat-card");

  if (cards[0]) cards[0].querySelector("strong").textContent = total;
  if (cards[1]) cards[1].querySelector("strong").textContent = pendientes;
  if (cards[2]) cards[2].querySelector("strong").textContent = liberados;
  if (cards[3]) cards[3].querySelector("strong").textContent = cancelados;

  if (filterStatus) {
    filterStatus.textContent = "Filtro aplicado";
    filterStatus.classList.toggle("hidden", !blackHayFiltroAplicado());
  }
}

function blackHayFiltroAplicado() {
  const texto = Object.values(blackFilterTextInputs).some(input => input && input.value.trim());
  const multi = Object.values(blackFiltroSets).some(set => set.size > 0);
  const top = searchTicketTop && searchTicketTop.value.trim();
  return Boolean(texto || multi || top);
}

function blackAplicarFiltros() {
  const topTerm = blackNormalizar(searchTicketTop?.value || "");
  const idTerm = blackNormalizar(blackFilterTextInputs.id?.value || "");
  const cuTerm = blackNormalizar(blackFilterTextInputs.cu?.value || "");
  const siteTerm = blackNormalizar(blackFilterTextInputs.site?.value || "");
  const comentarioTerm = blackNormalizar(blackFilterTextInputs.comentario?.value || "");

  blackFiltrados = blackData.filter(ticket => {
    const textoGeneral = blackNormalizar([
      ticket.ID,
      ticket.CU,
      ticket.SITE,
      ticket.ULTIMO_COMENTARIO,
      ticket.CASUISTICA,
      ticket.DETALLE_CASUISTICA
    ].join(" "));

    if (topTerm && !textoGeneral.includes(topTerm)) return false;
    if (idTerm && !blackNormalizar(ticket.ID).includes(idTerm)) return false;
    if (cuTerm && !blackNormalizar(ticket.CU).includes(cuTerm)) return false;
    if (siteTerm && !blackNormalizar(ticket.SITE).includes(siteTerm)) return false;
    if (comentarioTerm && !blackNormalizar(ticket.ULTIMO_COMENTARIO).includes(comentarioTerm)) return false;

    for (const [campo, config] of Object.entries(blackFiltrosConfig)) {
      const set = blackFiltroSets[campo];
      if (set && set.size > 0) {
        const valor = String(config.selector(ticket) || "");
        if (!set.has(valor)) return false;
      }
    }
    return true;
  });

  blackRenderizarTabla();
  blackRenderizarFiltrosMultiples();
  blackActualizarStats();
}

function blackObtenerOpcionesFiltro(campo) {
  const config = blackFiltrosConfig[campo];
  if (!config) return [];

  const opciones = new Set();
  blackData.forEach(ticket => {
    let incluir = true;
    for (const [otroCampo, otraConfig] of Object.entries(blackFiltrosConfig)) {
      if (otroCampo === campo) continue;
      const set = blackFiltroSets[otroCampo];
      if (set && set.size > 0) {
        const valorOtro = String(otraConfig.selector(ticket) || "");
        if (!set.has(valorOtro)) {
          incluir = false;
          break;
        }
      }
    }
    if (incluir) opciones.add(String(config.selector(ticket) || "Sin dato"));
  });

  return [...opciones].sort((a, b) => a.localeCompare(b, "es", { numeric: true }));
}

function blackRenderizarFiltrosMultiples() {
  Object.entries(blackFiltrosConfig).forEach(([campo, config]) => {
    const el = config.el;
    if (!el) return;
    const seleccionados = blackFiltroSets[campo] || new Set();
    const opciones = blackObtenerOpcionesFiltro(campo);
    const textoBoton = seleccionados.size === 0 ? "Todos" : `${seleccionados.size} sel.`;

    el.classList.toggle("filter-active", seleccionados.size > 0);
    el.innerHTML = `
      <button class="multi-filter-button" type="button">
        <span>${blackEscape(textoBoton)}</span>
        <span class="multi-filter-arrow">▼</span>
      </button>
      <div class="multi-filter-menu">
        <div class="multi-filter-actions">
          <button class="multi-filter-small-btn" type="button" data-action="all">Marcar todo</button>
          <button class="multi-filter-small-btn" type="button" data-action="clear">Limpiar</button>
        </div>
        <div class="multi-filter-list">
          ${opciones.length ? opciones.map(op => `
            <label class="multi-filter-option">
              <input type="checkbox" value="${blackEscape(op)}" ${seleccionados.has(op) ? "checked" : ""} />
              <span>${blackEscape(op)}</span>
            </label>
          `).join("") : '<div class="multi-filter-empty">Sin opciones</div>'}
        </div>
      </div>`;

    const button = el.querySelector(".multi-filter-button");
    button?.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll("#blackCasesView .multi-filter.open").forEach(x => {
        if (x !== el) x.classList.remove("open");
      });
      el.classList.toggle("open");
      const menu = el.querySelector(".multi-filter-menu");
      if (menu) {
        const rect = el.getBoundingClientRect();
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 4}px`;
      }
    });

    el.querySelectorAll("input[type='checkbox']").forEach(chk => {
      chk.addEventListener("change", () => {
        if (chk.checked) seleccionados.add(chk.value);
        else seleccionados.delete(chk.value);
        blackAplicarFiltros();
      });
    });

    el.querySelector("[data-action='all']")?.addEventListener("click", () => {
      opciones.forEach(op => seleccionados.add(op));
      blackAplicarFiltros();
    });

    el.querySelector("[data-action='clear']")?.addEventListener("click", () => {
      seleccionados.clear();
      blackAplicarFiltros();
    });
  });
}

function blackBadge(estatus) {
  const e = blackNormalizar(estatus);
  if (e === "liberado" || e === "liberada") return "badge badge-success";
  if (e === "cancelado" || e === "cancelada") return "badge badge-gray";
  if (e.includes("proceso") || e.includes("progreso")) return "badge badge-warning";
  return "badge badge-danger";
}

function blackRenderizarTabla() {
  if (!blackCasesTableBody) return;
  if (!blackFiltrados.length) {
    blackCasesTableBody.innerHTML = `<tr><td colspan="16" style="text-align:center;padding:20px;">No hay casos para mostrar.</td></tr>`;
    return;
  }

  blackCasesTableBody.innerHTML = blackFiltrados.map(ticket => {
    const id = String(ticket.ID || "");
    const estatus = blackEstatusCanonico(ticket.ESTATUS || ticket.STATUS || "Pendiente");
    const colorSeleccionado = blackObtenerColor(ticket);
    const backgroundFila = blackObtenerBackground(ticket);
    const colorDotBackground = BLACK_COLORES_FILA[colorSeleccionado]?.color || "#ffffff";
    const styleFila = backgroundFila ? ` style="background:${blackEscape(backgroundFila)};"` : "";
    return `
      <tr class="black-row ${blackSeleccionado && blackSeleccionado.ID === id ? "active-row" : ""}" data-id="${blackEscape(id)}"${styleFila}>
        <td class="color-cell">
          <div class="row-color-picker black-color-picker">
            <button class="row-color-dot" type="button" title="Cambiar color de fila" style="background:${blackEscape(colorDotBackground)};"></button>
            <div class="row-color-menu">
              ${Object.entries(BLACK_COLORES_FILA).map(([key, item]) => `
                <button type="button" class="row-color-option" data-color="${blackEscape(key)}" title="${blackEscape(item.label)}">
                  <span style="background:${blackEscape(item.color)};"></span>
                  ${blackEscape(item.label)}
                </button>
              `).join("")}
            </div>
          </div>
        </td>
        <td title="${blackEscape(ticket.FECHA_REGISTRO)}">${blackEscape(blackFechaSolo(ticket.FECHA_REGISTRO))}</td>
        <td><strong>${blackEscape(id)}</strong></td>
        <td>${blackEscape(ticket.CU)}</td>
        <td title="${blackEscape(ticket.SITE)}">${blackEscape(ticket.SITE)}</td>
        <td>${blackEscape(ticket.ZONA)}</td>
        <td>${blackEscape(ticket.DEPARTAMENTO)}</td>
        <td>${blackEscape(ticket.TORRERA)}</td>
        <td>${blackEscape(ticket.RESPONSABLE)}</td>
        <td title="${blackEscape(ticket.AREA_RESPONSABLE)}">${blackEscape(ticket.AREA_RESPONSABLE)}</td>
        <td title="${blackEscape(ticket.PERSONA_RESPONSABLE)}">${blackEscape(ticket.PERSONA_RESPONSABLE)}</td>
        <td title="${blackEscape(ticket.CASUISTICA)}">${blackEscape(ticket.CASUISTICA)}</td>
        <td title="${blackEscape(ticket.AFECTACION_DE_SERVICIOS)}">${blackEscape(ticket.AFECTACION_DE_SERVICIOS)}</td>
        <td><span class="${blackBadge(estatus)}">${blackEscape(estatus || "Pendiente")}</span></td>
        <td>${blackEscape(ticket.DIAS_CALCULADOS ?? ticket.DIAS ?? 0)}</td>
        <td title="${blackEscape(ticket.ULTIMO_COMENTARIO)}">${blackEscape(ticket.ULTIMO_COMENTARIO || "-")}</td>
      </tr>`;
  }).join("");

  blackCasesTableBody.querySelectorAll("tr.black-row").forEach(row => {
    row.addEventListener("click", () => {
      const id = row.getAttribute("data-id");
      const ticket = blackData.find(t => String(t.ID || "") === id);
      if (ticket) blackAbrirEditar(ticket);
    });

    const picker = row.querySelector(".black-color-picker");
    const dot = row.querySelector(".row-color-dot");
    if (picker && dot && !blackEsViewer()) {
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".row-color-picker.open").forEach(el => {
          if (el !== picker) el.classList.remove("open");
        });
        picker.classList.toggle("open");
        if (picker.classList.contains("open") && typeof posicionarMenuColor === "function") {
          posicionarMenuColor(picker);
        }
      });

      picker.querySelectorAll(".row-color-option").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = row.getAttribute("data-id");
          const nuevoColor = btn.getAttribute("data-color") || "";
          blackGuardarColor(id, nuevoColor);
        });
      });
    }
  });
}

function blackLimpiarFiltros() {
  Object.values(blackFiltroSets).forEach(set => set.clear());
  Object.values(blackFilterTextInputs).forEach(input => { if (input) input.value = ""; });
  if (searchTicketTop) searchTicketTop.value = "";
  blackAplicarFiltros();
}

function blackResetForm() {
  Object.values(BLACK_FORM).forEach(el => {
    if (!el) return;
    el.value = "";
  });
  if (blackSiteSearch) blackSiteSearch.value = "";
  if (blackSiteResults) blackSiteResults.innerHTML = "";
  if (blackTimeline) blackTimeline.innerHTML = `<div class="timeline-empty">Sin seguimiento registrado.</div>`;
}

function blackSetForm(ticket) {
  BLACK_FORM.FECHA_REGISTRO.value = blackFechaSolo(ticket.FECHA_REGISTRO || new Date().toISOString());
  BLACK_FORM.ID.value = ticket.ID || "";
  BLACK_FORM.CU.value = ticket.CU || "";
  BLACK_FORM.SITE.value = ticket.SITE || "";
  BLACK_FORM.ZONA.value = ticket.ZONA || "";
  BLACK_FORM.DEPARTAMENTO.value = ticket.DEPARTAMENTO || "";
  BLACK_FORM.TORRERA.value = ticket.TORRERA || "";
  BLACK_FORM.RESPONSABLE.value = ticket.RESPONSABLE || "";
  BLACK_FORM.AREA_RESPONSABLE.value = ticket.AREA_RESPONSABLE || "";
  BLACK_FORM.PERSONA_RESPONSABLE.value = ticket.PERSONA_RESPONSABLE || "";
  BLACK_FORM.CASUISTICA.value = ticket.CASUISTICA || "";
  BLACK_FORM.DETALLE_CASUISTICA.value = ticket.DETALLE_CASUISTICA || "";
  BLACK_FORM.AFECTACION_DE_SERVICIOS.value = ticket.AFECTACION_DE_SERVICIOS || "";
  BLACK_FORM.INGRESO_A_BLACKLIST.value = ticket.INGRESO_A_BLACKLIST || "";
  BLACK_FORM.COMENTARIOS_DEL_TORRERO.value = ticket.COMENTARIOS_DEL_TORRERO || "";
  BLACK_FORM.CONTRATO.value = ticket.CONTRATO || "";
  BLACK_FORM.FECHA_LIBERACION.value = blackFechaInput(ticket.FECHA_LIBERACION);
  BLACK_FORM.ACUERDO.value = ticket.ACUERDO || "";
  BLACK_FORM.VENCIMIENTO_CONTRATO.value = blackFechaInput(ticket.VENCIMIENTO_CONTRATO);
  BLACK_FORM.SECRETARIA_GENERAL.value = ticket.SECRETARIA_GENERAL || "";
  BLACK_FORM.ESTATUS.value = blackEstatusCanonico(ticket.ESTATUS || ticket.STATUS || "Pendiente");
  BLACK_FORM.RECONFIRMAR_BORRADO.value = ticket.RECONFIRMAR_BORRADO || "";
  BLACK_FORM.CRUCE_COMITE_DISPONIBILIDAD.value = ticket.CRUCE_COMITE_DISPONIBILIDAD || "";
  BLACK_FORM.COMENTARIO_SEGUIMIENTO.value = "";
}

async function blackAbrirNuevo() {
  if (blackEsViewer()) {
    blackMostrarToast("Solo visualización", "Tu perfil no tiene permisos para crear casos.");
    return;
  }

  blackModo = "nuevo";
  blackSeleccionado = null;
  blackResetForm();
  if (blackDrawerTitle) blackDrawerTitle.textContent = "Nuevo black case";
  if (blackDrawerSubtitle) blackDrawerSubtitle.textContent = "";
  const siteSearchSection = document.getElementById("blackSiteSearchSection");
  if (siteSearchSection) siteSearchSection.classList.remove("hidden");
  if (blackCaseDrawer) blackCaseDrawer.classList.remove("hidden");
  blackAplicarPermisosFormulario();

  const ahora = new Date();
  BLACK_FORM.FECHA_REGISTRO.value = ahora.toLocaleDateString("es-PE");
  BLACK_FORM.ESTATUS.value = "Pendiente";
  BLACK_FORM.ID.value = "Se generará al guardar";
}

async function blackAbrirEditar(ticket) {
  blackModo = "editar";
  blackSeleccionado = ticket;
  blackSetForm(ticket);
  if (blackDrawerTitle) blackDrawerTitle.textContent = `Editar ${ticket.ID || "black case"}`;
  if (blackDrawerSubtitle) blackDrawerSubtitle.textContent = "";
  const siteSearchSection = document.getElementById("blackSiteSearchSection");
  if (siteSearchSection) siteSearchSection.classList.add("hidden");
  if (blackCaseDrawer) blackCaseDrawer.classList.remove("hidden");
  blackAplicarPermisosFormulario();
  blackCargarHistorial(ticket.ID);
}

function blackCerrarDrawer() {
  if (blackCaseDrawer) blackCaseDrawer.classList.add("hidden");
}

function blackObtenerPayload() {
  return {
    id: blackModo === "editar" ? BLACK_FORM.ID.value.trim() : "",
    CU: BLACK_FORM.CU.value.trim(),
    SITE: BLACK_FORM.SITE.value.trim(),
    ZONA: BLACK_FORM.ZONA.value.trim(),
    DEPARTAMENTO: BLACK_FORM.DEPARTAMENTO.value.trim(),
    TORRERA: BLACK_FORM.TORRERA.value.trim(),
    RESPONSABLE: BLACK_FORM.RESPONSABLE.value.trim(),
    AREA_RESPONSABLE: BLACK_FORM.AREA_RESPONSABLE.value.trim(),
    PERSONA_RESPONSABLE: BLACK_FORM.PERSONA_RESPONSABLE.value.trim(),
    CASUISTICA: BLACK_FORM.CASUISTICA.value.trim(),
    DETALLE_CASUISTICA: BLACK_FORM.DETALLE_CASUISTICA.value.trim(),
    AFECTACION_DE_SERVICIOS: BLACK_FORM.AFECTACION_DE_SERVICIOS.value.trim(),
    INGRESO_A_BLACKLIST: BLACK_FORM.INGRESO_A_BLACKLIST.value.trim(),
    COMENTARIOS_DEL_TORRERO: BLACK_FORM.COMENTARIOS_DEL_TORRERO.value.trim(),
    CONTRATO: BLACK_FORM.CONTRATO.value.trim(),
    FECHA_LIBERACION: BLACK_FORM.FECHA_LIBERACION.value,
    ACUERDO: BLACK_FORM.ACUERDO.value.trim(),
    VENCIMIENTO_CONTRATO: BLACK_FORM.VENCIMIENTO_CONTRATO.value,
    SECRETARIA_GENERAL: BLACK_FORM.SECRETARIA_GENERAL.value.trim(),
    ESTATUS: BLACK_FORM.ESTATUS.value.trim() || "Pendiente",
    RECONFIRMAR_BORRADO: BLACK_FORM.RECONFIRMAR_BORRADO.value.trim(),
    CRUCE_COMITE_DISPONIBILIDAD: BLACK_FORM.CRUCE_COMITE_DISPONIBILIDAD.value.trim(),
    comentarioSeguimiento: BLACK_FORM.COMENTARIO_SEGUIMIENTO.value.trim(),
    usuario: localStorage.getItem("nombreUsuario") || localStorage.getItem("correoUsuario") || "Sin usuario",
    rolUsuario: blackRolActual()
  };
}

async function blackGuardar() {
  if (blackEsViewer()) {
    blackMostrarToast("Solo visualización", "Tu perfil no tiene permisos para guardar cambios.");
    return;
  }

  const payload = blackObtenerPayload();

  if (!payload.CU || !payload.SITE) {
    blackMostrarToast("Falta seleccionar sitio", "Busque y seleccione un CU o SITE antes de guardar.");
    return;
  }

  try {
    blackShowLoader("Guardando black case...");
    const accion = blackModo === "nuevo" ? "crearBlacklist" : "actualizarBlacklist";
    const result = await blackFetch({}, { accion, ...payload });
    if (!result || result.ok === false) throw new Error(result?.mensaje || result?.detalle || "No se pudo guardar");
    blackActualizarLocalTrasGuardar(result, payload);
    blackCerrarDrawer();
  } catch (error) {
    console.error(error);
    blackMostrarToast("No se pudo guardar", String(error.message || error));
  } finally {
    blackHideLoader();
  }
}



function blackCalcularDiasLocal(fechaRegistro, fechaCierre, estatus) {
  const inicio = blackParseFechaLocal(fechaRegistro);
  if (!inicio) return 0;
  let fin = new Date();
  if (blackEsCerrado(estatus)) {
    fin = blackParseFechaLocal(fechaCierre) || new Date();
  }
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  const diff = Math.floor((fin.getTime() - inicio.getTime()) / 86400000);
  return diff < 0 ? 0 : diff;
}

function blackParseFechaLocal(valor) {
  if (!valor) return null;
  const texto = String(valor).trim();
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const slash = texto.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slash) return new Date(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
  const d = new Date(texto);
  return isNaN(d.getTime()) ? null : d;
}

function blackActualizarLocalTrasGuardar(result, payload) {
  const id = result?.id || payload.id || payload.ID;
  if (!id) return;

  const anterior = blackData.find(t => String(t.ID || "") === String(id));
  const fechaRegistro = anterior?.FECHA_REGISTRO || new Date().toISOString();
  const fechaCierre = blackEsCerrado(payload.ESTATUS) ? (anterior?.FECHA_CIERRE || new Date().toISOString()) : "";
  const comentario = payload.comentarioSeguimiento || payload.COMENTARIOS_DEL_TORRERO || anterior?.ULTIMO_COMENTARIO || "";

  const actualizado = {
    ...(anterior || {}),
    ...payload,
    ID: id,
    FECHA_REGISTRO: fechaRegistro,
    FECHA_CIERRE: fechaCierre,
    ULTIMO_COMENTARIO: comentario || "-",
    DIAS_CALCULADOS: blackCalcularDiasLocal(fechaRegistro, fechaCierre, payload.ESTATUS)
  };

  delete actualizado.id;
  delete actualizado.accion;
  delete actualizado.comentarioSeguimiento;
  delete actualizado.rolUsuario;

  if (anterior) {
    blackData = blackData.map(t => String(t.ID || "") === String(id) ? actualizado : t);
  } else {
    blackData = [...blackData, actualizado];
  }

  blackSeleccionado = actualizado;
  blackAplicarFiltros();
}

async function blackGuardarColor(idTicket, colorKey) {
  if (blackEsViewer()) {
    blackMostrarToast("Solo visualización", "Tu perfil no tiene permisos para cambiar colores.");
    return;
  }

  const id = String(idTicket || "").trim();
  const color = blackNormalizarColor(colorKey);
  if (!id) return;

  const anterior = blackData.find(t => String(t.ID || "") === id);
  const colorAnterior = anterior ? blackNormalizarColor(anterior.COLOR) : "";
  blackActualizarColorLocal(id, color);

  try {
    const result = await blackFetch({}, {
      accion: "guardarColorBlacklist",
      id,
      color,
      usuario: localStorage.getItem("nombreUsuario") || localStorage.getItem("correoUsuario") || "Sin usuario",
      rolUsuario: blackRolActual()
    });
    if (!result || result.ok === false) throw new Error(result?.mensaje || result?.detalle || "No se pudo guardar el color");
  } catch (error) {
    console.error(error);
    blackActualizarColorLocal(id, colorAnterior);
    blackMostrarToast("No se pudo guardar", String(error.message || error));
  }
}

function blackActualizarColorLocal(id, color) {
  blackData = blackData.map(t => String(t.ID || "") === id ? { ...t, COLOR: color } : t);
  blackFiltrados = blackFiltrados.map(t => String(t.ID || "") === id ? { ...t, COLOR: color } : t);
  if (blackSeleccionado && String(blackSeleccionado.ID || "") === id) {
    blackSeleccionado = { ...blackSeleccionado, COLOR: color };
  }
  blackRenderizarTabla();
}

function blackAplicarPermisosFormulario() {
  const viewer = blackEsViewer();
  if (btnBlackNuevoCaso) btnBlackNuevoCaso.style.display = viewer ? "none" : "";
  if (btnBlackGuardar) btnBlackGuardar.style.display = viewer ? "none" : "";
  if (blackCaseDrawer) {
    blackCaseDrawer.querySelectorAll("input, select, textarea").forEach(el => {
      if (el.id === "blackSiteSearch") {
        el.disabled = viewer || blackModo === "editar";
      } else {
        el.disabled = viewer || el.readOnly;
      }
    });
  }
}

async function blackCargarHistorial(id) {
  if (!blackTimeline) return;
  blackTimeline.innerHTML = `<div class="timeline-empty">Cargando historial...</div>`;
  try {
    const historial = await blackFetch({ accion: "obtenerSeguimientoBlack", id });
    if (!Array.isArray(historial) || historial.length === 0) {
      blackTimeline.innerHTML = `<div class="timeline-empty">Sin seguimiento registrado.</div>`;
      return;
    }
    blackTimeline.innerHTML = historial.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="timeline-main">${blackEscape(item.TEXTO || "Actualización")}</span>
          <div class="timeline-meta">
            <span>Usuario: ${blackEscape(item.USUARIO || "-")}</span>
            <span class="timeline-date">${blackEscape(blackFechaHora(item.FECHA))}</span>
          </div>
        </div>
      </div>`).join("");
  } catch (error) {
    blackTimeline.innerHTML = `<div class="timeline-empty">No se pudo cargar el historial.</div>`;
  }
}

function blackFechaHora(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (!isNaN(fecha.getTime())) {
    return fecha.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
  }
  return String(valor);
}

function blackRenderizarBusquedaSites() {
  if (!blackSiteResults) return;
  const term = blackNormalizar(blackSiteSearch?.value || "");
  if (term.length < 2) {
    blackSiteResults.innerHTML = "";
    return;
  }

  let dataSites = [];
  try {
    dataSites = Array.isArray(sitesData) ? sitesData : [];
  } catch (_) {
    dataSites = [];
  }

  const resultados = dataSites.filter(site => {
    const texto = blackNormalizar([site.codigoUnico, site.site, site.departamento, site.zona, site.torre].join(" "));
    return texto.includes(term);
  }).slice(0, 25);

  if (!resultados.length) {
    blackSiteResults.innerHTML = `<div class="multi-filter-empty">No se encontraron sites.</div>`;
    return;
  }

  blackSiteResults.innerHTML = resultados.map(site => `
    <div class="black-site-result" data-cu="${blackEscape(site.codigoUnico)}">
      <strong>${blackEscape(site.codigoUnico)} · ${blackEscape(site.site)}</strong>
      <span>${blackEscape(site.departamento)} · ${blackEscape(site.zona)} · ${blackEscape(site.torre)}</span>
    </div>`).join("");

  blackSiteResults.querySelectorAll(".black-site-result").forEach(item => {
    item.addEventListener("click", () => {
      const cu = item.getAttribute("data-cu");
      const site = resultados.find(x => String(x.codigoUnico) === cu);
      if (!site) return;
      BLACK_FORM.CU.value = site.codigoUnico || "";
      BLACK_FORM.SITE.value = site.site || "";
      BLACK_FORM.DEPARTAMENTO.value = site.departamento || "";
      BLACK_FORM.ZONA.value = site.zona || "";
      BLACK_FORM.TORRERA.value = site.torre || "";
      if (blackSiteSearch) blackSiteSearch.value = `${site.codigoUnico} - ${site.site}`;
      blackSiteResults.innerHTML = "";
    });
  });
}

function blackExportarExcel() {
  const filas = blackFiltrados.map(t => ({
    FECHA_REGISTRO: blackFechaSolo(t.FECHA_REGISTRO),
    ID: t.ID || "",
    CU: t.CU || "",
    SITE: t.SITE || "",
    ZONA: t.ZONA || "",
    DEPARTAMENTO: t.DEPARTAMENTO || "",
    TORRERA: t.TORRERA || "",
    RESPONSABLE: t.RESPONSABLE || "",
    AREA_RESPONSABLE: t.AREA_RESPONSABLE || "",
    PERSONA_RESPONSABLE: t.PERSONA_RESPONSABLE || "",
    CASUISTICA: t.CASUISTICA || "",
    DETALLE_CASUISTICA: t.DETALLE_CASUISTICA || "",
    AFECTACION_DE_SERVICIOS: t.AFECTACION_DE_SERVICIOS || "",
    INGRESO_A_BLACKLIST: t.INGRESO_A_BLACKLIST || "",
    COMENTARIOS_DEL_TORRERO: t.COMENTARIOS_DEL_TORRERO || "",
    CONTRATO: t.CONTRATO || "",
    FECHA_LIBERACION: blackFechaSolo(t.FECHA_LIBERACION),
    ACUERDO: t.ACUERDO || "",
    VENCIMIENTO_CONTRATO: blackFechaSolo(t.VENCIMIENTO_CONTRATO),
    SECRETARIA_GENERAL: t.SECRETARIA_GENERAL || "",
    ESTATUS: blackEstatusCanonico(t.ESTATUS || t.STATUS || "Pendiente"),
    RECONFIRMAR_BORRADO: t.RECONFIRMAR_BORRADO || "",
    CRUCE_COMITE_DISPONIBILIDAD: t.CRUCE_COMITE_DISPONIBILIDAD || "",
    USER: t.USER || "",
    DIAS: t.DIAS_CALCULADOS ?? t.DIAS ?? 0,
    FECHA_CIERRE: blackFechaSolo(t.FECHA_CIERRE),
    ULTIMO_COMENTARIO: t.ULTIMO_COMENTARIO || ""
  }));

  if (!filas.length) {
    blackMostrarToast("Sin datos", "No hay casos filtrados para exportar.");
    return;
  }

  if (typeof XLSX === "undefined") {
    blackMostrarToast("No disponible", "No se cargó la librería XLSX.");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(filas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "BLACKLIST");
  XLSX.writeFile(wb, `black_cases_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function blackInterceptarTopbar(e) {
  if (!blackActivo()) return;
  e.preventDefault();
  e.stopImmediatePropagation();
}

function blackOcultarVista() {
  if (blackCasesView) blackCasesView.classList.add("hidden");
  if (blackCaseDrawer) blackCaseDrawer.classList.add("hidden");
  if (menuBlackCases) menuBlackCases.classList.remove("active");
  if (searchTicketTop) searchTicketTop.placeholder = "Buscar por ID, SITE o CU...";
  if (typeof configurarStatsBandeja === "function") configurarStatsBandeja();
  if (typeof aplicarFiltros === "function") {
    setTimeout(() => { try { aplicarFiltros(); } catch (e) {} }, 0);
  }
}

function blackInicializar() {
  if (!menuBlackCases || !blackCasesView) return;

  if (btnBlackNuevoCaso) btnBlackNuevoCaso.style.display = blackEsViewer() ? "none" : "";
  if (typeof aplicarPermisosUI === "function") aplicarPermisosUI();

  menuBlackCases.addEventListener("click", (e) => {
    e.preventDefault();
    blackMostrarVista();
  });

  menuBandeja?.addEventListener("click", blackOcultarVista);
  menuReportes?.addEventListener("click", blackOcultarVista);

  if (btnRefrescarData) {
    btnRefrescarData.addEventListener("click", (e) => {
      if (!blackActivo()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      blackCargarCasos({ showLoading: true, loadingText: "Refrescando black cases..." });
    }, true);
  }

  if (searchTicketTop) {
    searchTicketTop.addEventListener("input", (e) => {
      if (!blackActivo()) return;
      e.stopImmediatePropagation();
      blackAplicarFiltros();
    }, true);
  }

  Object.values(blackFilterTextInputs).forEach(input => {
    input?.addEventListener("input", blackAplicarFiltros);
  });

  document.addEventListener("click", () => {
    document.querySelectorAll("#blackCasesView .multi-filter.open").forEach(x => x.classList.remove("open"));
  });

  Object.values(blackFiltrosConfig).forEach(config => {
    config.el?.addEventListener("click", e => e.stopPropagation());
  });

  btnBlackLimpiarFiltros?.addEventListener("click", blackLimpiarFiltros);
  btnBlackExportarExcel?.addEventListener("click", blackExportarExcel);
  btnBlackNuevoCaso?.addEventListener("click", blackAbrirNuevo);
  btnBlackCerrarDrawer?.addEventListener("click", blackCerrarDrawer);
  btnBlackCancelar?.addEventListener("click", blackCerrarDrawer);
  btnBlackGuardar?.addEventListener("click", blackGuardar);
  blackCaseDrawer?.addEventListener("click", (e) => {
    if (e.target === blackCaseDrawer) blackCerrarDrawer();
  });
  blackSiteSearch?.addEventListener("input", blackRenderizarBusquedaSites);
}

window.addEventListener("DOMContentLoaded", blackInicializar);
