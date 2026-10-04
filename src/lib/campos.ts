// Los números que pide el acta y las comprobaciones que deben cuadrar.
// Este archivo lo usan los dos lados:
//  - el servidor (Campo.astro) para poner la etiqueta de cada casilla
//  - el navegador (scripts/mesa.ts) para avisar en vivo si algo no cuadra
import type { CampoId } from "../data/etapas";

export type Valores = Partial<Record<CampoId, string>>;
/** ["ok" | "mal", mensaje] o null si aún faltan datos para comprobar */
export type Resultado = ["ok" | "mal", string] | null;

interface DefCampo {
  etiqueta: string;
  ayuda?: string;
  tipo: "numero" | "hora";
  verificar?: (v: Valores) => Resultado;
}

const lleno = (x?: string) => x !== undefined && x.trim() !== "" && !Number.isNaN(Number(x));

/** Compara un total del escrutinio con el total de ciudadanos que votaron */
function igualAVotaron(clave: CampoId) {
  return (v: Valores): Resultado => {
    if (!lleno(v[clave]) || !lleno(v.votaron)) return null;
    const dif = Number(v[clave]) - Number(v.votaron);
    if (dif === 0) return ["ok", "Igual al total que votó"];
    return ["mal", (dif > 0 ? `Sobran ${dif}` : `Faltan ${-dif}`) + " → revisar y anotar en Observaciones"];
  };
}

export const CAMPOS: Record<CampoId, DefCampo> = {
  habiles: {
    etiqueta: "Electores hábiles",
    ayuda: "Preimpreso en el paquete de cédulas, la Lista y las actas",
    tipo: "numero",
  },
  recibidas: {
    etiqueta: "Cédulas recibidas",
    tipo: "numero",
    verificar: (v) => {
      if (!lleno(v.recibidas) || !lleno(v.habiles)) return null;
      return Number(v.recibidas) === Number(v.habiles)
        ? ["ok", "Coincide con hábiles"]
        : ["mal", `No coincide con hábiles (${v.recibidas} vs ${v.habiles})`];
    },
  },
  hInst: { etiqueta: "Hora de inicio de instalación", tipo: "hora" },
  votaron: {
    etiqueta: "Total de ciudadanos que votaron",
    ayuda: "Suma de subtotales de la Lista de electores",
    tipo: "numero",
  },
  noUsadas: {
    etiqueta: "Cédulas no utilizadas",
    tipo: "numero",
    // Regla de cuadre: cada cédula recibida o se usó o sobró.
    verificar: (v) => {
      if (!lleno(v.noUsadas) || !lleno(v.votaron) || !lleno(v.recibidas)) return null;
      const suma = Number(v.votaron) + Number(v.noUsadas);
      return suma === Number(v.recibidas)
        ? ["ok", "Votaron + no usadas = recibidas"]
        : ["mal", `Votaron + no usadas = ${suma}, recibidas = ${v.recibidas}`];
    },
  },
  hFin: { etiqueta: "Hora de término de la votación", tipo: "hora" },
  hEsc: { etiqueta: "Hora de inicio del escrutinio", tipo: "hora" },
  dobladas: { etiqueta: "Cédulas dobladas en el ánfora", tipo: "numero", verificar: igualAVotaron("dobladas") },
  eGob: { etiqueta: "Emitidos · Gobernador (5a)", tipo: "numero", verificar: igualAVotaron("eGob") },
  eCons: { etiqueta: "Emitidos · Consejero (5b)", tipo: "numero", verificar: igualAVotaron("eCons") },
  eProv: { etiqueta: "Emitidos · Provincial (5c)", tipo: "numero", verificar: igualAVotaron("eProv") },
  eDist: { etiqueta: "Emitidos · Distrital (5d)", tipo: "numero", verificar: igualAVotaron("eDist") },
};
