// ─────────────────────────────────────────────────────────────
// Lógica del navegador. El HTML ya viene armado por Astro; aquí solo:
//   1. Guardamos/leemos el progreso en localStorage.
//   2. Marcamos/desmarcamos casillas y actualizamos contadores.
//   3. Cambiamos de pestaña.
//   4. Sincronizamos los números del acta, los pasamos a letras y verificamos.
// No se crea HTML desde JS: solo se cambian clases, atributos y textos.
// ─────────────────────────────────────────────────────────────
import { aLetras } from "../lib/letras";
import { CAMPOS, type Valores } from "../lib/campos";
import type { CampoId } from "../data/etapas";

// ---------- 1. Estado persistente ----------
interface Estado {
  hechos: Record<string, true>; // ids de ítems marcados
  valores: Valores;             // números/horas del acta
  pestana: string;              // pestaña abierta
}
const CLAVE = "mesa-presidente-v1";

function cargar(): Estado {
  const vacio: Estado = { hechos: {}, valores: {}, pestana: "inst" };
  try {
    const crudo = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    return crudo && typeof crudo === "object" ? { ...vacio, ...crudo } : vacio;
  } catch {
    return vacio; // modo incógnito, almacenamiento bloqueado, JSON corrupto…
  }
}
function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento: sigue funcionando en memoria */ }
}
let estado = cargar();

// ---------- Atajos al DOM ----------
const $ = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) => raiz.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, raiz: ParentNode = document) => [...raiz.querySelectorAll<T>(sel)];

// Todos los ítems en orden de aparición = el orden real de la jornada
const items = $$("[data-item]");
const idDe = (el: HTMLElement) => el.dataset.item!;

// ---------- 2. Casillas y contadores ----------
function pintarItem(el: HTMLElement) {
  const hecho = !!estado.hechos[idDe(el)];
  el.classList.toggle("marcado", hecho);
  el.setAttribute("aria-checked", String(hecho));
}

function contar(raiz: ParentNode) {
  const lista = $$("[data-item]", raiz);
  return { hechos: lista.filter((el) => estado.hechos[idDe(el)]).length, total: lista.length };
}

function actualizarContadores() {
  // por paso
  for (const paso of $$("[data-paso]")) {
    const { hechos, total } = contar(paso);
    $("[data-paso-cuenta]", paso)!.textContent = `${hechos}/${total}`;
    paso.classList.toggle("completo", hechos === total);
  }
  // por pestaña
  for (const etiqueta of $$("[data-tab-cuenta]")) {
    const panel = $(`[data-panel="${etiqueta.dataset.tabCuenta}"]`)!;
    const { hechos, total } = contar(panel);
    etiqueta.textContent = `${hechos}/${total}`;
  }
  // global
  const g = contar(document);
  $("[data-progreso-texto]")!.textContent = `${g.hechos} / ${g.total}`;
  $("[data-progreso-barra]")!.style.width = `${(g.hechos / g.total) * 100}%`;

  // siguiente paso pendiente
  items.forEach((el) => el.classList.remove("siguiente"));
  const sig = siguiente();
  const texto = $("[data-siguiente-texto]")!;
  const botonCheck = $("[data-accion='marcar-siguiente']")!;
  if (sig) {
    sig.classList.add("siguiente");
    texto.textContent = $(".texto", sig)!.textContent;
    botonCheck.hidden = false;
  } else {
    texto.textContent = "Mesa cerrada. ¡Buen trabajo!";
    botonCheck.hidden = true;
  }
}

const siguiente = () => items.find((el) => !estado.hechos[idDe(el)]);

function alternar(el: HTMLElement) {
  const id = idDe(el);
  if (estado.hechos[id]) delete estado.hechos[id];
  else estado.hechos[id] = true;
  guardar();
  pintarItem(el);
  actualizarContadores();
}

// ---------- 3. Pestañas ----------
function mostrarPestana(id: string) {
  estado.pestana = id;
  guardar();
  for (const panel of $$("[data-panel]")) panel.hidden = panel.dataset.panel !== id;
  for (const tab of $$("[data-tab]")) tab.setAttribute("aria-selected", String(tab.dataset.tab === id));
}

function irA(el: HTMLElement) {
  const panel = el.closest<HTMLElement>("[data-panel]")!;
  if (panel.hidden) mostrarPestana(panel.dataset.panel!);
  const alturaCabecera = $("header")!.offsetHeight;
  const y = el.getBoundingClientRect().top + window.scrollY - alturaCabecera - 12;
  window.scrollTo({ top: y, behavior: "smooth" });
}

// ---------- 4. Números del acta ----------
const esNumero = (v?: string) => v !== undefined && v.trim() !== "" && !Number.isNaN(Number(v));

function actualizarCampos() {
  for (const el of $$("[data-letras]")) {
    const clave = el.dataset.letras as CampoId;
    const v = estado.valores[clave];
    el.textContent = CAMPOS[clave].tipo === "numero" && esNumero(v) ? aLetras(v!) : "";
  }
  for (const el of $$("[data-aviso]")) {
    const clave = el.dataset.aviso as CampoId;
    const r = CAMPOS[clave].verificar?.(estado.valores) ?? null;
    el.hidden = !r;
    if (r) {
      el.classList.toggle("ok", r[0] === "ok");
      el.classList.toggle("mal", r[0] === "mal");
      el.textContent = r[1];
    }
  }
}

// ---------- Pantalla encendida (Wake Lock API) ----------
let bloqueo: WakeLockSentinel | null = null;
async function alternarPantalla(boton: HTMLElement) {
  try {
    if (bloqueo) { await bloqueo.release(); return; }
    bloqueo = await navigator.wakeLock.request("screen");
    boton.textContent = "Pantalla encendida ✓ (tocar para soltar)";
    bloqueo.addEventListener("release", () => {
      bloqueo = null;
      boton.textContent = "Mantener pantalla encendida";
    });
  } catch {
    boton.textContent = "Este dispositivo no lo permite";
  }
}

// ---------- Eventos (delegación: un solo listener para toda la página) ----------
document.addEventListener("click", (e) => {
  const t = e.target as HTMLElement;
  if (t.closest("input, .campo")) return; // escribir en una casilla no debe marcar el ítem

  const tab = t.closest<HTMLElement>("[data-tab]");
  if (tab) { mostrarPestana(tab.dataset.tab!); window.scrollTo({ top: 0 }); return; }

  const item = t.closest<HTMLElement>("[data-item]");
  if (item) { alternar(item); return; }

  const accion = t.closest<HTMLElement>("[data-accion]");
  const confirmar = $("[data-confirmar]")!;
  switch (accion?.dataset.accion) {
    case "ir-siguiente": { const s = siguiente(); if (s) irA(s); break; }
    case "marcar-siguiente": {
      const s = siguiente();
      if (s) { alternar(s); const s2 = siguiente(); if (s2) irA(s2); }
      break;
    }
    case "pantalla": alternarPantalla(accion); break;
    case "reiniciar": confirmar.hidden = false; break;
    case "reiniciar-no": confirmar.hidden = true; break;
    case "reiniciar-si":
      estado = { hechos: {}, valores: {}, pestana: "inst" };
      guardar();
      $$<HTMLInputElement>("[data-campo]").forEach((i) => (i.value = ""));
      confirmar.hidden = true;
      iniciar();
      window.scrollTo({ top: 0 });
      break;
  }
});

// Teclado: Espacio/Enter marcan el ítem enfocado (accesibilidad)
document.addEventListener("keydown", (e) => {
  const t = e.target as HTMLElement;
  if (t.matches("[data-item]") && (e.key === " " || e.key === "Enter")) {
    e.preventDefault();
    alternar(t);
  }
});

// Al escribir un número: guardar, copiarlo a las demás casillas iguales y verificar
document.addEventListener("input", (e) => {
  const input = e.target as HTMLInputElement;
  const clave = input.dataset.campo as CampoId | undefined;
  if (!clave) return;
  estado.valores[clave] = input.value;
  guardar();
  $$<HTMLInputElement>(`[data-campo="${clave}"]`).forEach((otro) => { if (otro !== input) otro.value = input.value; });
  actualizarCampos();
});

// ---------- Arranque: pintar lo que estaba guardado ----------
function iniciar() {
  items.forEach(pintarItem);
  for (const input of $$<HTMLInputElement>("[data-campo]")) {
    input.value = estado.valores[input.dataset.campo as CampoId] ?? "";
  }
  mostrarPestana(estado.pestana);
  actualizarContadores();
  actualizarCampos();
}
iniciar();
