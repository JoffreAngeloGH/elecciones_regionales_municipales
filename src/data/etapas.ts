// Contenido de la guía: es la ÚNICA fuente de verdad.
// Si mañana algo cambia (un paso nuevo, otro texto), se edita aquí y
// Astro vuelve a generar todo el HTML. Los componentes solo "dibujan" estos datos.

/** p = Presidente (tú), s = Secretario (2.º miembro), t = Tercer miembro, todos = los tres */
export type Rol = "p" | "s" | "t" | "todos";

/** Claves de los números que pide el acta (ver src/lib/campos.ts) */
export type CampoId =
  | "habiles" | "recibidas" | "hInst"
  | "votaron" | "noUsadas" | "hFin"
  | "hEsc" | "dobladas" | "eGob" | "eCons" | "eProv" | "eDist";

export interface Item {
  id: string;          // identificador estable: se usa para guardar si está marcado
  texto: string;
  detalle?: string;    // puede llevar <strong>, por eso se pinta con set:html
  roles: Rol[];
  campos?: CampoId[];  // casillas numéricas que se muestran dentro del ítem
  sobres?: boolean;    // muestra la leyenda de colores de los sobres
}

/** Un paso con casillas para marcar */
export interface PasoChecklist { titulo: string; n?: string; nota?: string; items: Item[] }
/** Una ficha de consulta (no se marca) */
export interface PasoReferencia { ref: "flujo" | "especiales" | "lectura" }
export type Paso = PasoChecklist | PasoReferencia;

export interface Etapa { id: "inst" | "suf" | "esc"; nombre: string; hora: string; intro: string; pasos: Paso[] }

export const ETAPAS: Etapa[] = [
 { id:"inst", nombre:"Instalación", hora:"6:00", intro:"Desde las 6:00 a. m. hasta abrir la votación. Cinco pasos en orden.",
   pasos:[
   { titulo:"Llegada y recepción del material", n:"6:00", items:[
     { id:"i1", texto:"Llegar al local, ubicar el aula y conformar la mesa con los otros dos miembros", roles:["todos"]},
     { id:"i2", texto:"Recibir de la ONPE la caja sellada con los 3 paquetes", detalle:"<strong>Útiles</strong>, <strong>Instalación</strong> y <strong>Escrutinio</strong>.", roles:["p"]},
   ]},
   { titulo:"Acondicionar el aula y revisar", items:[
     { id:"i3", texto:"Separar el paquete de Escrutinio y ponerlo en la mesa auxiliar", roles:["todos"]},
     { id:"i4", texto:"Pegar la etiqueta «Restos electorales» en la caja vacía y dejarla al lado de la mesa", detalle:"Solo para depositar el material sobrante.", roles:["todos"]},
     { id:"i5", texto:"Verificar que la Lista de electores esté pegada fuera del aula", roles:["todos"]},
     { id:"i6", texto:"Verificar que los carteles de candidatos estén dentro de la cámara secreta", roles:["todos"]},
     { id:"i7", texto:"Contar las cédulas recibidas", detalle:"Deben coincidir con el total de electores hábiles (viene preimpreso en el paquete de cédulas, la Lista y las actas).", roles:["todos"], campos:["habiles","recibidas"]},
     { id:"i8", texto:"Los 3 miembros firman el reverso de TODAS las cédulas", detalle:"Los personeros pueden firmar si quieren (opcional).", roles:["todos"]},
   ]},
   { titulo:"Control de asistencia", items:[
     { id:"i9", texto:"Desglosar la hoja de control de asistencia: firman y ponen huella los presentes", detalle:"Si alguien no vino, escribir <strong>«faltó»</strong>.", roles:["todos"]},
     { id:"i10", texto:"Si alguien de la fila asume el cargo: anotar datos, firma y huella", detalle:"En la <strong>Relación de miembros de mesa no sorteados</strong>. Si no hubo reemplazos, marca y sigue.", roles:["p"]},
     { id:"i11", texto:"Marcar recepción de los 3 refrigerios y de la información del RIET, y firmar la hoja", roles:["p"]},
     { id:"i12", texto:"Guardar la hoja de asistencia en el sobre plástico ANARANJADO", roles:["p"]},
   ]},
   { titulo:"Sección A · Acta de Instalación", nota:"Se llena igual en las 8 actas (4 regionales + 4 municipales). Números y letras claros.", items:[
     { id:"i13", texto:"Desglosar las 4 actas regionales y las 4 municipales y ordenarlas en dos grupos", roles:["todos"]},
     { id:"i14", texto:"Escribir la hora exacta en que inició la instalación", roles:["todos"], campos:["hInst"]},
     { id:"i15", texto:"Marcar que el material se recibió en buen estado", roles:["todos"]},
     { id:"i16", texto:"Escribir la cantidad de cédulas recibidas en números y en letras", detalle:"Usa el número y las letras de abajo.", roles:["todos"], campos:["recibidas"]},
     { id:"i17", texto:"Los 3 miembros escriben nombres, apellidos y DNI, y firman en la casilla de su cargo", detalle:"Si alguien no puede firmar: pone su huella y se anota <strong>obligatoriamente</strong> en Observaciones.", roles:["todos"]},
     { id:"i18", texto:"Si escribieron algo en Observaciones, pegar encima la lámina autoadhesiva", detalle:"Si Observaciones quedó vacío en esta sección, marca y sigue.", roles:["todos"]},
   ]},
   { titulo:"Reparto de roles", items:[
     { id:"i19", texto:"Tú (Presidente): custodias y entregas las cédulas a cada elector", roles:["p"]},
     { id:"i20", texto:"Secretario: lista de electores, verifica identidad con DNI y maneja el tampón", roles:["s"]},
     { id:"i21", texto:"Tercer miembro: custodia el ánfora", roles:["t"]},
   ]},
 ]},
 { id:"suf", nombre:"Sufragio", hora:"8–17 h", intro:"Atención de votantes de 8:00 a. m. a 5:00 p. m. El flujo por elector se repite; no se marca, solo es de consulta.",
   pasos:[
   { titulo:"Apertura de la votación", n:"8:00", items:[
     { id:"s1", texto:"Votan primero los miembros de mesa presentes", roles:["todos"]},
     { id:"s2", texto:"Votan los personeros, si les corresponde esta mesa", roles:["todos"]},
     { id:"s3", texto:"Abrir la atención a los electores", roles:["p"]},
   ]},
   { ref:"flujo" },
   { ref:"especiales" },
   { titulo:"Cierre de la votación", n:"17:00", items:[
     { id:"s4", texto:"Cerrar puertas a las 5:00 p. m.", detalle:"Solo votan quienes ya están en la fila dentro del local.", roles:["todos"]},
     { id:"s5", texto:"Lista de electores: marcar con una X el recuadro «NO VOTÓ» de los que no vinieron", roles:["s"]},
     { id:"s6", texto:"Contar firmas y huellas de cada página y anotar el subtotal por página", roles:["s","todos"]},
     { id:"s7", texto:"Sumar los subtotales: ese es el total de ciudadanos que votaron", detalle:"Este número se usa en todas las actas y para cuadrar el escrutinio.", roles:["todos"], campos:["votaron"]},
     { id:"s8", texto:"Firmar la última página de la Lista de electores", detalle:"Los personeros pueden firmar si quieren.", roles:["p"]},
     { id:"s9", texto:"Guardar la Lista de electores en el sobre plástico ANARANJADO", roles:["p"]},
   ]},
   { titulo:"Sección B · Acta de Sufragio", nota:"En las 8 actas (4 regionales + 4 municipales).", items:[
     { id:"s10", texto:"Total de ciudadanos que votaron, en letras y números", roles:["todos"], campos:["votaron"]},
     { id:"s11", texto:"Total de cédulas no utilizadas, en letras y números", roles:["todos"], campos:["noUsadas"]},
     { id:"s12", texto:"Hora exacta de término de la votación", roles:["todos"], campos:["hFin"]},
     { id:"s13", texto:"Firmas, nombres y DNI de los 3 miembros", detalle:"Personeros, si lo desean.", roles:["todos"]},
   ]},
 ]},
 { id:"esc", nombre:"Escrutinio", hora:"17 h →", intro:"Se cuentan 4 elecciones: Gobernador, Consejero, Provincial y Distrital. Primero lo regional, se entrega, y luego lo municipal.",
   pasos:[
   { titulo:"Fase I · Preparación y ánfora", items:[
     { id:"e1", texto:"Guardar lapiceros y útiles: sobre la mesa queda solo el ánfora", roles:["todos"]},
     { id:"e2", texto:"Desglosar Hoja Borrador 5a (Gobernador, anverso) y 5b (Consejero, reverso)", roles:["todos"]},
     { id:"e3", texto:"Escribir la hora de inicio del escrutinio en ambas hojas borrador", roles:["todos"], campos:["hEsc"]},
     { id:"e4", texto:"Abrir el ánfora, vaciar y contar las cédulas DOBLADAS, sin abrirlas", detalle:"Deben ser igual al total que votó. <strong>Si sobran:</strong> retirar al azar las de más, sin abrir, y destruirlas. <strong>Si faltan:</strong> se continúa. En ambos casos se anota en Observaciones del Acta de Escrutinio.", roles:["todos"], campos:["dobladas"]},
     { id:"e5", texto:"Desplegar las cédulas cara interna hacia abajo y verificar tu firma al reverso", detalle:"La que no tenga firma del Presidente se separa como <strong>voto nulo</strong>.", roles:["p"]},
   ]},
   { ref:"lectura" },
   { titulo:"Fase II · Conteo regional", items:[
     { id:"e6", texto:"Ubicarse: tú al centro, Secretario con la hoja borrador, Tercer miembro apila", detalle:"Tú lees y muestras; el Secretario marca palotes de 5 en 5; el Tercer miembro apila las cédulas leídas.", roles:["todos"]},
     { id:"e7", texto:"Gobernador: leer la columna Gobernador voto por voto → palotes en Hoja 5a", roles:["p","s"]},
     { id:"e8", texto:"Consejero: voltear las mismas cédulas, leer la columna Consejero → Hoja 5b", roles:["p","s"]},
     { id:"e9", texto:"Sumar palotes por partido, blancos, nulos e impugnados en la columna «Total de votos»", detalle:"Luego sumar toda la columna = <strong>Total de votos emitidos</strong>.", roles:["todos"]},
     { id:"e10", texto:"Comprobar: total de votos emitidos = total de ciudadanos que votaron", detalle:"Si no coincide, revisar la suma. Si la diferencia sigue, escribirla en Observaciones.", roles:["todos"], campos:["eGob","eCons"]},
   ]},
   { titulo:"Fase III · Actas regionales y entrega", items:[
     { id:"e11", texto:"Desglosar las 4 actas regionales y copiar en la Sección C los resultados de 5a y 5b", detalle:"También hora de inicio, hora de término y total de votantes.", roles:["todos"], campos:["hEsc"]},
     { id:"e12", texto:"Firman los 3 miembros (personeros si desean)", roles:["todos"]},
     { id:"e13", texto:"Pegar la lámina autoadhesiva sobre los números y sobre Observaciones", detalle:"Sobre Observaciones <strong>aunque esté en blanco</strong>.", roles:["todos"]},
     { id:"e14", texto:"Ensobrar 1 acta por sobre y cerrar", sobres:true, roles:["todos"]},
     { id:"e15", texto:"Entregar los sobres al coordinador de la ONPE y marcar el cargo de entrega", roles:["p"]},
     { id:"e16", texto:"Llenar y pegar el Cartel de Resultados REGIONAL fuera del aula", roles:["p"]},
   ]},
   { titulo:"Fase IV · Conteo municipal", items:[
     { id:"e17", texto:"Desglosar Hojas Borrador 5c (Provincial) y 5d (Distrital)", roles:["todos"]},
     { id:"e18", texto:"Provincial: leer la columna Provincial → palotes en Hoja 5c", roles:["p","s"]},
     { id:"e19", texto:"Distrital: leer la columna Distrital → palotes en Hoja 5d", roles:["p","s"]},
     { id:"e20", texto:"Sumar y comprobar: total emitidos = total que votó", roles:["todos"], campos:["eProv","eDist"]},
     { id:"e21", texto:"Copiar los totales a la Sección C de las 4 actas municipales y firmar", roles:["todos"]},
     { id:"e22", texto:"Pegar las láminas de protección (números y Observaciones)", roles:["todos"]},
     { id:"e23", texto:"Ensobrar en plomo, rojo, verde y celeste y entregar a la ONPE", sobres:true, roles:["todos","p"]},
     { id:"e24", texto:"Pegar el Cartel de Resultados MUNICIPAL fuera del aula", roles:["p"]},
   ]},
   { titulo:"Fase V · Cierre y devolución", items:[
     { id:"e25", texto:"Llenar y entregar los certificados de participación a los 3 miembros", roles:["p"]},
     { id:"e26", texto:"Cédulas votadas NO impugnadas → bolsa de repliegue, sellar y entregar a la ONPE", detalle:"Estas <strong>no se botan</strong>.", roles:["todos"]},
     { id:"e27", texto:"Cédulas NO usadas: romperlas y echarlas en la caja de Restos Electorales", detalle:"Junto con la bolsa de reciclaje (lapiceros, tampón sobrante).", roles:["todos"]},
     { id:"e28", texto:"Entregar a la ONPE la caja de restos, el ánfora y las cabinas", roles:["p"]},
     { id:"e29", texto:"Firmar y recibir el Cargo de entrega de actas y material electoral", detalle:"Guárdalo: es tu constancia.", roles:["p"]},
   ]},
 ]},
];

export const esReferencia = (p: Paso): p is PasoReferencia => "ref" in p;
