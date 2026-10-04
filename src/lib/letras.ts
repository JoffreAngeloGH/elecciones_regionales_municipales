// Convierte un número a letras en español, como lo pide el acta
// ("doscientos cuarenta y tres"). Cubre de 0 a 999 999, más que suficiente
// para una mesa (unos 300 electores como máximo).

const UNIDADES = [
  "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
];
const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

/** 0–999. Del 0 al 29 cada número tiene nombre propio; desde 30 se arma "decena y unidad". */
function menorQueMil(n: number): string {
  if (n < 30) return UNIDADES[n];
  if (n < 100) return DECENAS[Math.floor(n / 10)] + (n % 10 ? " y " + UNIDADES[n % 10] : "");
  if (n === 100) return "cien"; // 100 exacto es "cien"; 101 en adelante es "ciento ..."
  return CENTENAS[Math.floor(n / 100)] + (n % 100 ? " " + menorQueMil(n % 100) : "");
}

export function aLetras(valor: number | string): string {
  const n = Math.floor(Number(valor));
  if (!Number.isFinite(n) || n < 0) return "";
  if (n < 1000) return menorQueMil(n);
  if (n < 1_000_000) {
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;
    // "mil", "dos mil", "veintiún mil" (uno → un delante de "mil")
    const prefijo = miles === 1 ? "mil" : menorQueMil(miles).replace(/veintiuno$/, "veintiún").replace(/uno$/, "un") + " mil";
    return prefijo + (resto ? " " + menorQueMil(resto) : "");
  }
  return String(n);
}
