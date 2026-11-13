/* NAVIGO — contenido del juego (intereses, habilidades, valores, competencias y carreras) */
window.NAVIGO_DATA = (function () {
  // ---------- RIASEC (Holland) ----------
  const RIASEC = {
    R: { nombre: "Realista", alias: "Hacedor", color: "#e07a2f",
      desc: "Te gusta trabajar con las manos, herramientas, máquinas, la naturaleza y ver resultados concretos." },
    I: { nombre: "Investigador", alias: "Explorador", color: "#2f7de0",
      desc: "Te mueve la curiosidad: analizar, investigar, resolver problemas y entender cómo funcionan las cosas." },
    A: { nombre: "Artístico", alias: "Creador", color: "#b84fd1",
      desc: "Te expresas creando: diseño, música, escritura, imagen. Valoras la originalidad y la libertad." },
    S: { nombre: "Social", alias: "Ayudador", color: "#21a67a",
      desc: "Disfrutas enseñar, cuidar, escuchar y acompañar a otras personas. Tu energía está en la gente." },
    E: { nombre: "Emprendedor", alias: "Persuasor", color: "#e0464f",
      desc: "Te gusta liderar, convencer, negociar y emprender proyectos. Te atraen los retos y las metas." },
    C: { nombre: "Convencional", alias: "Organizador", color: "#8a7a2a",
      desc: "Eres ordenado, preciso y metódico. Te sientes bien con datos, procesos claros y planificación." }
  };

  const INTERESES = [
    { t: "Reparar una moto, una bicicleta o un electrodoméstico", k: "R" },
    { t: "Investigar por qué ocurre el relámpago del Catatumbo", k: "I" },
    { t: "Diseñar el logo y la imagen de un emprendimiento", k: "A" },
    { t: "Explicarle a un compañero el tema que no entiende", k: "S" },
    { t: "Vender un producto y ver crecer tu propio negocio", k: "E" },
    { t: "Llevar las cuentas de la bodega o de la cooperativa", k: "C" },
    { t: "Sembrar y cuidar un huerto o un cultivo", k: "R" },
    { t: "Hacer experimentos en un laboratorio", k: "I" },
    { t: "Tocar el cuatro, cantar o componer una canción", k: "A" },
    { t: "Escuchar y aconsejar a un amigo que la está pasando mal", k: "S" },
    { t: "Liderar a tu equipo en un proyecto del liceo", k: "E" },
    { t: "Organizar archivos, horarios y listas para que todo cuadre", k: "C" },
    { t: "Armar muebles, maquetas o circuitos eléctricos", k: "R" },
    { t: "Resolver acertijos de lógica o aprender a programar", k: "I" },
    { t: "Escribir cuentos, poemas o guiones", k: "A" },
    { t: "Participar en un voluntariado en tu comunidad", k: "S" },
    { t: "Ganar un debate convenciendo con tus argumentos", k: "E" },
    { t: "Revisar un documento para encontrar todos los errores", k: "C" },
    { t: "Manejar herramientas, maquinaria o equipos", k: "R" },
    { t: "Leer sobre el cuerpo humano y las enfermedades", k: "I" },
    { t: "Grabar y editar videos para redes sociales", k: "A" },
    { t: "Cuidar niños, adultos mayores o personas enfermas", k: "S" },
    { t: "Organizar un evento y negociar con los proveedores", k: "E" },
    { t: "Trabajar con hojas de cálculo y tablas de datos", k: "C" },
    { t: "Hacer una excursión al páramo y orientarte con un mapa", k: "R" },
    { t: "Analizar datos para descubrir patrones ocultos", k: "I" },
    { t: "Actuar, bailar o presentarte en un escenario", k: "A" },
    { t: "Organizar actividades para que todos se integren", k: "S" },
    { t: "Representar a tu salón ante la dirección del liceo", k: "E" },
    { t: "Seguir un procedimiento paso a paso con mucha precisión", k: "C" }
  ];

  // ---------- Habilidades (aptitudes) ----------
  const APTITUDES = {
    memoria: { nombre: "Memoria", color: "#2f7de0" },
    logica: { nombre: "Razonamiento lógico", color: "#7a5af5" },
    verbal: { nombre: "Razonamiento verbal", color: "#21a67a" },
    numerica: { nombre: "Cálculo numérico", color: "#e07a2f" },
    creatividad: { nombre: "Creatividad", color: "#b84fd1" }
  };

  const LOGICA = [
    { q: "2, 4, 8, 16, ?", o: ["24", "32", "30", "20"], a: 1 },
    { q: "3, 6, 11, 18, 27, ?", o: ["36", "38", "35", "40"], a: 1 },
    { q: "A, C, F, J, ?", o: ["N", "O", "M", "P"], a: 1 },
    { q: "Si todos los cóndores vuelan y Kuntur es un cóndor, entonces…", o: ["Kuntur no vuela", "Kuntur vuela", "No se puede saber", "Solo vuelan algunos"], a: 1 },
    { q: "1, 1, 2, 3, 5, 8, ?", o: ["11", "12", "13", "14"], a: 2 },
    { q: "Ana es mayor que Luis. Luis es mayor que Pedro. ¿Quién es el menor?", o: ["Ana", "Luis", "Pedro", "No se sabe"], a: 2 },
    { q: "81, 27, 9, 3, ?", o: ["0", "1", "2", "1/2"], a: 1 }
  ];

  const VERBAL = [
    { q: "Arepa es a maíz como pan es a…", o: ["horno", "trigo", "panadería", "desayuno"], a: 1 },
    { q: "Brújula es a navegante como estetoscopio es a…", o: ["hospital", "corazón", "médico", "paciente"], a: 2 },
    { q: "¿Qué palabra NO pertenece al grupo?", o: ["Páramo", "Médano", "Teleférico", "Llanura"], a: 2 },
    { q: "Sinónimo de «perseverante»:", o: ["Constante", "Distraído", "Rápido", "Tímido"], a: 0 },
    { q: "Antónimo de «escaso»:", o: ["Poco", "Abundante", "Raro", "Limitado"], a: 1 },
    { q: "Libro es a capítulo como edificio es a…", o: ["ladrillo", "piso", "ciudad", "arquitecto"], a: 1 },
    { q: "Ordena: «futuro / construye / se / el / hoy» — ¿qué palabra va primero?", o: ["Hoy", "El", "Futuro", "Se"], a: 1 }
  ];

  const MEMORIA_FICHAS = ["🏔️", "🦜", "⚡", "🌊", "🐻", "🌺"];

  // ---------- Competencias blandas (Gaceta Oficial 38.924) ----------
  const COMPETENCIAS = {
    equipo: { nombre: "Trabajo en equipo y cooperación", corto: "Trabajo en equipo" },
    liderazgo: { nombre: "Liderazgo de equipos", corto: "Liderazgo" },
    comunicacion: { nombre: "Comunicación", corto: "Comunicación" },
    adaptabilidad: { nombre: "Adaptabilidad y flexibilidad", corto: "Adaptabilidad" },
    iniciativa: { nombre: "Iniciativa", corto: "Iniciativa" },
    autocontrol: { nombre: "Autocontrol", corto: "Autocontrol" },
    analitico: { nombre: "Pensamiento analítico", corto: "Pensamiento analítico" },
    innovacion: { nombre: "Innovación", corto: "Innovación" },
    social: { nombre: "Conciencia del deber social", corto: "Conciencia social" }
  };

  const ESCENARIOS = [
    { s: "Tu equipo debe entregar la maqueta mañana y dos compañeros no han hecho su parte.",
      o: [
        { t: "Reúno al grupo, repartimos de nuevo las tareas y fijamos una hora límite.", p: { liderazgo: 2, equipo: 1 } },
        { t: "Les escribo con calma para entender qué pasó antes de juzgar.", p: { autocontrol: 2, comunicacion: 1 } },
        { t: "Avanzo yo mismo con lo que falta para no arriesgar la nota.", p: { iniciativa: 2 } },
        { t: "Busco una forma más simple de hacer la maqueta con lo que tenemos.", p: { innovacion: 2, adaptabilidad: 1 } }
      ] },
    { s: "Se va la luz la noche antes de un examen importante.",
      o: [
        { t: "Cambio el plan: estudio con linterna usando resúmenes cortos.", p: { adaptabilidad: 2, iniciativa: 1 } },
        { t: "Llamo a mis compañeros y repasamos juntos por mensajes de voz.", p: { equipo: 2, comunicacion: 1 } },
        { t: "Respiro, me organizo y priorizo los temas que más pesan.", p: { autocontrol: 1, analitico: 2 } },
        { t: "Invento un juego de preguntas para repasar sin apuntes.", p: { innovacion: 2 } }
      ] },
    { s: "En tu comunidad la cancha está abandonada y nadie hace nada.",
      o: [
        { t: "Convoco a los vecinos para una jornada de limpieza.", p: { liderazgo: 1, social: 2 } },
        { t: "Hago un diagnóstico: qué falta, cuánto cuesta y quién puede ayudar.", p: { analitico: 2, iniciativa: 1 } },
        { t: "Propongo convertirla en un espacio de murales y deporte.", p: { innovacion: 2, social: 1 } },
        { t: "Me sumo con gusto a lo que organicen otros.", p: { equipo: 2, social: 1 } }
      ] },
    { s: "Un compañero nuevo, que viene de otro estado, está siempre solo en el recreo.",
      o: [
        { t: "Me acerco y lo invito a sentarse con nosotros.", p: { social: 2, comunicacion: 1 } },
        { t: "Lo incluyo en el próximo trabajo en grupo.", p: { equipo: 2 } },
        { t: "Le pregunto qué le gusta y le presento a gente afín.", p: { comunicacion: 2, social: 1 } },
        { t: "Le cuento a la profesora guía para que lo apoye.", p: { analitico: 1, social: 1 } }
      ] },
    { s: "El profesor cambia a última hora el formato de la exposición: ahora es un video.",
      o: [
        { t: "Perfecto, me adapto y aprendo a editar rápido.", p: { adaptabilidad: 2, iniciativa: 1 } },
        { t: "Pido aclarar los criterios para hacerlo bien.", p: { comunicacion: 2, analitico: 1 } },
        { t: "Propongo un formato creativo: entrevista o animación.", p: { innovacion: 2 } },
        { t: "Organizo quién graba, quién edita y quién escribe el guion.", p: { liderazgo: 2, equipo: 1 } }
      ] },
    { s: "En una discusión de grupo alguien critica tu idea con un tono fuerte.",
      o: [
        { t: "Mantengo la calma y pido que me explique su punto.", p: { autocontrol: 2, comunicacion: 1 } },
        { t: "Comparo con datos ambas ideas para ver cuál funciona mejor.", p: { analitico: 2 } },
        { t: "Busco combinar lo mejor de las dos propuestas.", p: { equipo: 1, innovacion: 1, adaptabilidad: 1 } },
        { t: "Defiendo mi idea con argumentos claros y respeto.", p: { comunicacion: 2, liderazgo: 1 } }
      ] },
    { s: "Tienes la oportunidad de vender tortas para la promoción, pero nunca lo has hecho.",
      o: [
        { t: "Me lanzo: hago un plan de ventas y precios.", p: { iniciativa: 2, analitico: 1 } },
        { t: "Armo un equipo con quien cocina, quien vende y quien promociona.", p: { liderazgo: 2, equipo: 1 } },
        { t: "Le doy un toque diferente: sabores locales y empaque llamativo.", p: { innovacion: 2 } },
        { t: "Pregunto a quien ya lo hizo para aprender de su experiencia.", p: { comunicacion: 1, adaptabilidad: 1, equipo: 1 } }
      ] },
    { s: "Tu equipo perdió el intercolegial por un error tuyo.",
      o: [
        { t: "Lo reconozco ante el equipo y propongo cómo mejorar.", p: { autocontrol: 1, liderazgo: 1, comunicacion: 1 } },
        { t: "Analizo qué falló para no repetirlo.", p: { analitico: 2 } },
        { t: "Me tomo un momento, lo acepto y sigo entrenando.", p: { autocontrol: 2, adaptabilidad: 1 } },
        { t: "Animo al grupo: el próximo torneo es nuestro.", p: { equipo: 1, liderazgo: 1, social: 1 } }
      ] }
  ];

  // ---------- Valores ----------
  const VALORES = {
    servicio: { nombre: "Ayudar a los demás", icono: "🤝" },
    creatividad: { nombre: "Crear cosas nuevas", icono: "🎨" },
    economia: { nombre: "Buena estabilidad económica", icono: "💰" },
    autonomia: { nombre: "Ser independiente / emprender", icono: "🧭" },
    reconocimiento: { nombre: "Ser reconocido por mi trabajo", icono: "🏆" },
    aventura: { nombre: "Variedad, viajes y aventura", icono: "🗺️" },
    equilibrio: { nombre: "Tiempo para mi familia y mi vida", icono: "🏡" },
    conocimiento: { nombre: "Aprender y descubrir siempre", icono: "📚" }
  };

  // ---------- Mundo laboral ----------
  const TENDENCIAS = [
    { t: "170 millones de empleos nuevos", d: "El Foro Económico Mundial (Future of Jobs 2025) estima que hacia 2030 se crearán 170 millones de puestos y se desplazarán 92 millones: un saldo neto de 78 millones.", f: "WEF, 2025" },
    { t: "Las habilidades que más crecen", d: "Inteligencia artificial y big data, redes y ciberseguridad, y alfabetización tecnológica encabezan la lista. Le siguen pensamiento creativo, resiliencia, flexibilidad, curiosidad y aprendizaje continuo.", f: "WEF, 2025" },
    { t: "Lo verde también es empleo", d: "Los roles de transición energética y cuidado ambiental (energías renovables, gestión ambiental) están entre los de mayor crecimiento; la gestión ambiental entró por primera vez al top 10 de habilidades.", f: "WEF, 2025" },
    { t: "Las habilidades blandas pesan", d: "Según estudios citados en la tesis de Carmona (2022), cerca del 75 % del éxito laboral a largo plazo se asocia a habilidades blandas: equipo, liderazgo, adaptación, creatividad.", f: "Carmona, ULA 2022" },
    { t: "Una habilidad dura unos 5 años", d: "Deloitte señala que una habilidad técnica mantiene su vigencia unos 5 años: aprender a aprender es la competencia clave.", f: "Deloitte, 2017 (en Carmona, 2022)" },
    { t: "Venezuela: emprender y adaptarse", d: "Muchos jóvenes combinan estudios con emprendimientos, oficios técnicos o trabajo remoto. Turismo de montaña, agroindustria andina, salud, educación y tecnología son motores en la región andina.", f: "Contexto regional" }
  ];

  const MITOS = [
    { q: "«Si elijo una carrera ya no puedo cambiar nunca.»", a: false, e: "Falso. Las carreras hoy son trayectorias: se puede reorientar, complementar con cursos y cambiar de área." },
    { q: "«Las habilidades blandas importan tanto como las técnicas.»", a: true, e: "Realidad. Los empleadores valoran trabajo en equipo, comunicación y adaptabilidad tanto o más que el título." },
    { q: "«Las carreras técnicas cortas no tienen futuro.»", a: false, e: "Falso. TSU, oficios especializados y certificaciones técnicas tienen alta demanda y permiten trabajar más rápido." },
    { q: "«La tecnología solo sirve si estudio informática.»", a: false, e: "Falso. Salud, agro, arte, educación y comercio usan cada vez más herramientas digitales: la alfabetización tecnológica es transversal." },
    { q: "«Conocer mis intereses y valores me ayuda a decidir mejor.»", a: true, e: "Realidad. Elegir según tus intereses, habilidades y valores aumenta la satisfacción y la permanencia en los estudios." },
    { q: "«Lo mejor es estudiar lo que diga mi familia o lo que estudian mis amigos.»", a: false, e: "Falso. Escuchar consejos es valioso, pero la decisión debe partir de tu propio autoconocimiento." }
  ];

  // ---------- Carreras ----------
  // code: código Holland (orden de peso 3,2,1); apt: aptitudes; comp: competencias blandas; val: valores; tag
  const ULA = "Universidad de Los Andes (ULA)";
  const UPTM = "UPT de Mérida «Kléber Ramírez» (PNF)";
  const INCES = "INCES y centros de formación técnica";
  const CARRERAS = [
    { n: "Ingeniería de Sistemas", code: "IRC", apt: ["logica", "numerica"], comp: ["analitico", "innovacion"], val: ["conocimiento", "economia"], tag: "emergente", d: "Diseña sistemas de software, redes y soluciones tecnológicas.", donde: [ULA, "UNEFA"] },
    { n: "Informática / Desarrollo de software (TSU o PNF)", code: "IRC", apt: ["logica", "creatividad"], comp: ["analitico", "iniciativa"], val: ["autonomia", "economia"], tag: "emergente", d: "Programa aplicaciones web y móviles; ideal para trabajo remoto.", donde: [UPTM, "Institutos universitarios"] },
    { n: "Ciencia de datos y Estadística", code: "ICR", apt: ["numerica", "logica"], comp: ["analitico", "innovacion"], val: ["conocimiento", "economia"], tag: "emergente", d: "Convierte datos en decisiones; base de la inteligencia artificial.", donde: [ULA + " – Estadística"] },
    { n: "Ciberseguridad y redes", code: "IRC", apt: ["logica", "memoria"], comp: ["analitico", "autocontrol"], val: ["economia", "conocimiento"], tag: "emergente", d: "Protege sistemas e información; una de las áreas que más crece.", donde: ["Ing. de Sistemas / Telecomunicaciones + certificaciones"] },
    { n: "Medicina", code: "ISR", apt: ["memoria", "verbal"], comp: ["social", "autocontrol"], val: ["servicio", "conocimiento"], tag: "consolidada", d: "Previene, diagnostica y trata enfermedades.", donde: [ULA] },
    { n: "Enfermería", code: "SIR", apt: ["memoria", "numerica"], comp: ["social", "autocontrol"], val: ["servicio", "equilibrio"], tag: "consolidada", d: "Cuida y acompaña a pacientes; muy demandada dentro y fuera del país.", donde: [ULA] },
    { n: "Odontología", code: "IRS", apt: ["memoria", "logica"], comp: ["autocontrol", "social"], val: ["servicio", "autonomia"], tag: "consolidada", d: "Cuida la salud bucal; permite ejercer de forma independiente.", donde: [ULA] },
    { n: "Farmacia", code: "ICR", apt: ["memoria", "numerica"], comp: ["analitico", "social"], val: ["conocimiento", "economia"], tag: "consolidada", d: "Medicamentos, laboratorio e industria farmacéutica.", donde: [ULA] },
    { n: "Bioanálisis", code: "IRC", apt: ["memoria", "logica"], comp: ["analitico", "autocontrol"], val: ["conocimiento", "servicio"], tag: "consolidada", d: "Análisis clínicos que apoyan el diagnóstico médico.", donde: [ULA] },
    { n: "Nutrición y Dietética", code: "SIC", apt: ["memoria", "numerica"], comp: ["social", "comunicacion"], val: ["servicio", "equilibrio"], tag: "consolidada", d: "Alimentación saludable para personas y comunidades.", donde: [ULA] },
    { n: "Psicología", code: "SIA", apt: ["verbal", "memoria"], comp: ["social", "comunicacion"], val: ["servicio", "conocimiento"], tag: "consolidada", d: "Estudia la conducta y acompaña la salud mental.", donde: ["Universidades nacionales (verificar oferta)"] },
    { n: "Educación (varias menciones)", code: "SAC", apt: ["verbal", "creatividad"], comp: ["comunicacion", "social"], val: ["servicio", "equilibrio"], tag: "consolidada", d: "Forma a niños y jóvenes; alta necesidad de docentes en el país.", donde: [ULA, "UPEL"] },
    { n: "Comunicación Social", code: "AES", apt: ["verbal", "creatividad"], comp: ["comunicacion", "iniciativa"], val: ["creatividad", "reconocimiento"], tag: "consolidada", d: "Periodismo, medios digitales y comunicación estratégica.", donde: [ULA] },
    { n: "Diseño gráfico y multimedia", code: "ARE", apt: ["creatividad", "memoria"], comp: ["innovacion", "comunicacion"], val: ["creatividad", "autonomia"], tag: "emergente", d: "Identidad visual, interfaces y contenido digital.", donde: ["Institutos universitarios de diseño"] },
    { n: "Producción audiovisual y animación", code: "AIR", apt: ["creatividad", "logica"], comp: ["innovacion", "equipo"], val: ["creatividad", "aventura"], tag: "emergente", d: "Video, cine, animación y contenido para plataformas.", donde: [ULA + " – Medios Audiovisuales"] },
    { n: "Arquitectura", code: "ARI", apt: ["creatividad", "numerica"], comp: ["innovacion", "analitico"], val: ["creatividad", "reconocimiento"], tag: "consolidada", d: "Diseña espacios y edificaciones funcionales y bellas.", donde: [ULA] },
    { n: "Artes visuales y Música", code: "ASI", apt: ["creatividad", "memoria"], comp: ["innovacion", "autocontrol"], val: ["creatividad", "autonomia"], tag: "consolidada", d: "Creación artística, docencia del arte y gestión cultural.", donde: [ULA + " – Facultad de Arte"] },
    { n: "Idiomas Modernos y traducción", code: "ASC", apt: ["verbal", "memoria"], comp: ["comunicacion", "adaptabilidad"], val: ["aventura", "conocimiento"], tag: "consolidada", d: "Traducción, interpretación y trabajo internacional remoto.", donde: [ULA] },
    { n: "Derecho", code: "ESC", apt: ["verbal", "memoria"], comp: ["comunicacion", "analitico"], val: ["reconocimiento", "servicio"], tag: "consolidada", d: "Defiende derechos, asesora y resuelve conflictos legales.", donde: [ULA] },
    { n: "Ciencias Políticas", code: "ESI", apt: ["verbal", "logica"], comp: ["comunicacion", "liderazgo"], val: ["servicio", "reconocimiento"], tag: "consolidada", d: "Analiza el poder, las políticas públicas y la sociedad.", donde: [ULA] },
    { n: "Administración y Gerencia", code: "ECS", apt: ["numerica", "verbal"], comp: ["liderazgo", "iniciativa"], val: ["economia", "autonomia"], tag: "consolidada", d: "Dirige organizaciones, equipos y recursos.", donde: [ULA, UPTM] },
    { n: "Contaduría Pública", code: "CEI", apt: ["numerica", "logica"], comp: ["analitico", "autocontrol"], val: ["economia", "equilibrio"], tag: "consolidada", d: "Finanzas, impuestos y auditoría para empresas.", donde: [ULA, UPTM] },
    { n: "Economía", code: "ICE", apt: ["numerica", "logica"], comp: ["analitico", "comunicacion"], val: ["conocimiento", "economia"], tag: "consolidada", d: "Estudia mercados, precios y desarrollo de los países.", donde: [ULA] },
    { n: "Emprendimiento y marketing digital", code: "EAC", apt: ["creatividad", "verbal"], comp: ["iniciativa", "innovacion"], val: ["autonomia", "economia"], tag: "emergente", d: "Crea y vende productos con herramientas digitales.", donde: ["Cursos cortos + Administración / Mercadeo"] },
    { n: "Turismo y hotelería", code: "ESA", apt: ["verbal", "memoria"], comp: ["comunicacion", "adaptabilidad"], val: ["aventura", "servicio"], tag: "consolidada", d: "Mérida es potencia en turismo de montaña y aventura.", donde: [UPTM + " – Turismo"] },
    { n: "Gastronomía y cocina profesional", code: "ARE", apt: ["creatividad", "memoria"], comp: ["innovacion", "equipo"], val: ["creatividad", "autonomia"], tag: "consolidada", d: "Cocina, repostería y emprendimientos gastronómicos.", donde: ["Escuelas de cocina", INCES] },
    { n: "Ingeniería Civil", code: "RIC", apt: ["numerica", "logica"], comp: ["analitico", "liderazgo"], val: ["economia", "reconocimiento"], tag: "consolidada", d: "Construye vías, puentes, edificios y obras hidráulicas.", donde: [ULA] },
    { n: "Ingeniería Eléctrica y energías renovables", code: "RIC", apt: ["numerica", "logica"], comp: ["analitico", "innovacion"], val: ["conocimiento", "economia"], tag: "emergente", d: "Energía solar, eólica y redes eléctricas: empleo verde.", donde: [ULA] },
    { n: "Ingeniería Mecánica", code: "RIC", apt: ["logica", "numerica"], comp: ["analitico", "iniciativa"], val: ["economia", "conocimiento"], tag: "consolidada", d: "Diseña y mantiene máquinas y procesos industriales.", donde: [ULA] },
    { n: "Ingeniería Química", code: "IRC", apt: ["numerica", "logica"], comp: ["analitico", "autocontrol"], val: ["conocimiento", "economia"], tag: "consolidada", d: "Transforma materias primas en productos útiles.", donde: [ULA] },
    { n: "Ingeniería Forestal y ambiental", code: "RIS", apt: ["logica", "memoria"], comp: ["social", "analitico"], val: ["aventura", "servicio"], tag: "emergente", d: "Cuida bosques, agua y ecosistemas; clave en la transición verde.", donde: [ULA + " – Ciencias Forestales y Ambientales"] },
    { n: "Ingeniería Geológica y Geografía", code: "RIA", apt: ["logica", "memoria"], comp: ["analitico", "adaptabilidad"], val: ["aventura", "conocimiento"], tag: "consolidada", d: "Estudia la Tierra, el territorio y sus riesgos.", donde: [ULA] },
    { n: "Agronomía y agroindustria", code: "RIE", apt: ["logica", "numerica"], comp: ["iniciativa", "adaptabilidad"], val: ["autonomia", "aventura"], tag: "emergente", d: "Produce alimentos con técnicas sostenibles; motor andino.", donde: ["Universidades de la región andina (verificar)"] },
    { n: "Biología, Química, Física y Matemática", code: "IRA", apt: ["logica", "numerica"], comp: ["analitico", "innovacion"], val: ["conocimiento", "aventura"], tag: "consolidada", d: "Ciencia básica e investigación: entender el mundo.", donde: [ULA + " – Facultad de Ciencias"] },
    { n: "Trabajo Social", code: "SEC", apt: ["verbal", "memoria"], comp: ["social", "comunicacion"], val: ["servicio", "equilibrio"], tag: "consolidada", d: "Acompaña a familias y comunidades vulnerables.", donde: ["Universidades nacionales (verificar oferta)"] },
    { n: "Fisioterapia y deporte", code: "SRI", apt: ["memoria", "logica"], comp: ["social", "autocontrol"], val: ["servicio", "equilibrio"], tag: "consolidada", d: "Rehabilitación, entrenamiento y salud física.", donde: ["Universidades e institutos de salud (verificar)"] },
    { n: "Técnico en electricidad, mecánica o refrigeración", code: "RCI", apt: ["logica", "numerica"], comp: ["iniciativa", "adaptabilidad"], val: ["autonomia", "economia"], tag: "oficio", d: "Oficios técnicos con alta demanda y salida laboral rápida.", donde: [INCES, "Escuelas técnicas"] },
    { n: "Logística y comercio exterior", code: "CER", apt: ["numerica", "logica"], comp: ["analitico", "adaptabilidad"], val: ["economia", "aventura"], tag: "emergente", d: "Organiza el movimiento de productos en cadenas globales.", donde: ["Administración / TSU en Comercio"] }
  ];

  // ---------- Estilo de comportamiento (Expedición al tepuy) ----------
  // Modelo de dos ejes: RITMO (acelerado ↔ pausado) × FOCO (tareas ↔ personas).
  //   Acción    = ritmo acelerado + foco en tareas
  //   Conexión  = ritmo acelerado + foco en personas
  //   Calma     = ritmo pausado   + foco en personas
  //   Precisión = ritmo pausado   + foco en tareas
  const TENDENCIAS_ESTILO = {
    accion: { nombre: "Acción", estilo: "Pionero", color: "#e0464f", eje: "Ritmo acelerado · foco en la tarea",
      desc: "Decides rápido, te orientas a resultados y te animas con los retos. Tomas la iniciativa cuando otros dudan.",
      reto: "Escuchar antes de decidir y medir los riesgos." },
    conexion: { nombre: "Conexión", estilo: "Inspirador", color: "#ffb020", eje: "Ritmo acelerado · foco en las personas",
      desc: "Contagias entusiasmo, comunicas con facilidad y movilizas al grupo con tu energía.",
      reto: "Aterrizar las ideas en detalles y cerrar lo que empiezas." },
    calma: { nombre: "Calma", estilo: "Guardián", color: "#21a67a", eje: "Ritmo pausado · foco en las personas",
      desc: "Eres paciente, leal y cooperador. Cuidas que nadie se quede atrás y das estabilidad al equipo.",
      reto: "Expresar tu opinión y adaptarte a cambios repentinos." },
    precision: { nombre: "Precisión", estilo: "Estratega", color: "#2f7de0", eje: "Ritmo pausado · foco en la tarea",
      desc: "Analizas, buscas información y cuidas la calidad. Prefieres decidir con datos y criterios claros.",
      reto: "Decidir aunque falte información y tolerar la imperfección." }
  };

  // Escenas de la misión. p: puntos ocultos por tendencia; r: nivel de riesgo (0–1) cuando aplica.
  const MISION = [
    { tipo: "eleccion", s: "Al pie del tepuy Roraima, el guía pemón te cuenta que un equipo de científicos quedó atrapado en la cima por la neblina. La tormenta llega en pocas horas. Eres quien coordina la expedición.",
      info: "Pronóstico: lluvia fuerte en 6 horas. Equipo disponible: 6 personas, 2 radios, 1 botiquín.",
      o: [
        { t: "Salimos ya mismo: cada minuto cuenta.", p: { accion: 2 } },
        { t: "Reúno a todos, explico la misión y les doy ánimo.", p: { conexion: 2 } },
        { t: "Pregunto cómo está cada quien y si alguien necesita apoyo.", p: { calma: 2 } },
        { t: "Reviso el mapa, el pronóstico y el equipo antes de salir.", p: { precision: 2 } }
      ] },
    { tipo: "riesgo", s: "Hay tres caminos para subir. ¿Cuál eliges?",
      info: "Reportes de guardaparques: la grieta tuvo un derrumbe pequeño la semana pasada.",
      o: [
        { t: "🧗 La grieta: 2 horas, pero puede haber derrumbes.", p: { accion: 2 }, r: 1 },
        { t: "🥾 El paso del río: 3,5 horas, riesgo moderado.", p: { conexion: 1, precision: 1 }, r: 0.5 },
        { t: "🛤️ El sendero largo: 5 horas, totalmente seguro.", p: { calma: 2 }, r: 0 }
      ] },
    { tipo: "recursos", s: "Tienes 12 raciones de comida y agua. Repártelas como creas mejor.",
      grupos: [
        { k: "propio", t: "Tu equipo (para mantener la fuerza)" },
        { k: "rescate", t: "Los científicos atrapados" },
        { k: "reserva", t: "Reserva para imprevistos" }
      ], total: 12 },
    { tipo: "eleccion", s: "A mitad de la subida, dos compañeros discuten fuerte por quién carga la mochila más pesada.",
      o: [
        { t: "Decido yo quién la lleva y seguimos: no hay tiempo.", p: { accion: 2 } },
        { t: "Hago una broma para bajar la tensión y los animo.", p: { conexion: 2 } },
        { t: "Escucho a los dos con calma y buscamos un acuerdo.", p: { calma: 2 } },
        { t: "Propongo turnos de 20 minutos, medidos con el reloj.", p: { precision: 2 } }
      ] },
    { tipo: "piedras", s: "Para cruzar el río hay que pisar las piedras firmes en el orden correcto. Observa la secuencia y repítela." },
    { tipo: "eleccion", s: "La neblina lo cubre todo y la brújula empieza a fallar.",
      info: "El teléfono tiene 40 % de batería y el mapa offline descargado.",
      o: [
        { t: "Sigo mi instinto: recuerdo bien por dónde veníamos.", p: { accion: 2 }, r: 1 },
        { t: "Mantengo la moral del grupo cantando y hablando.", p: { conexion: 2 }, r: 0.5 },
        { t: "Nos quedamos juntos y esperamos a que despeje.", p: { calma: 2 }, r: 0 },
        { t: "Uso el GPS y las coordenadas para ubicarnos.", p: { precision: 2 }, r: 0.25 }
      ] },
    { tipo: "eleccion", s: "¡Encuentras a los científicos! Una de ellas tiene un tobillo lesionado.",
      info: "El botiquín incluye vendas elásticas, analgésicos y una férula plegable.",
      o: [
        { t: "La ayudamos a caminar y bajamos de inmediato.", p: { accion: 2 } },
        { t: "Le hablo para tranquilizarla y subirle el ánimo.", p: { conexion: 2 } },
        { t: "La atiendo con paciencia y reparto su carga entre todos.", p: { calma: 2 } },
        { t: "Aplico paso a paso el protocolo de primeros auxilios.", p: { precision: 2 } }
      ] },
    { tipo: "eleccion", s: "El guía te propone que lideres el descenso con el grupo completo.",
      o: [
        { t: "¡Acepto! Me gusta llevar el timón.", p: { accion: 2 } },
        { t: "Acepto si lo hacemos entre todos, motivando al grupo.", p: { conexion: 2 } },
        { t: "Prefiero apoyar a quien lidere; ahí aporto más.", p: { calma: 2 } },
        { t: "Acepto después de revisar ruta, tiempos y riesgos.", p: { precision: 2 } }
      ] },
    { tipo: "eleccion", s: "Empieza a llover. El reglamento del parque prohíbe acampar en la cima, pero bajar de noche es peligroso.",
      info: "Artículo 12 del reglamento: se permite el uso de refugios señalizados en caso de emergencia climática.",
      o: [
        { t: "Bajamos ahora mismo, aunque sea de noche.", p: { accion: 2 }, r: 1 },
        { t: "Llamo por radio a los guardaparques y los convenzo.", p: { conexion: 2 }, r: 0.5 },
        { t: "Esperamos las instrucciones de los guardaparques.", p: { calma: 2 }, r: 0 },
        { t: "Busco en el reglamento si hay refugios de emergencia.", p: { precision: 2 }, r: 0.25 }
      ] },
    { tipo: "eleccion", s: "Misión cumplida: todos llegan a salvo al campamento base. ¿Qué haces primero?",
      o: [
        { t: "Pienso en cuál será el próximo reto.", p: { accion: 2 } },
        { t: "Celebro con todos y agradezco a cada uno.", p: { conexion: 2 } },
        { t: "Me aseguro de que todos coman y descansen.", p: { calma: 2 } },
        { t: "Anoto lo que funcionó y lo que mejoraría.", p: { precision: 2 } }
      ] }
  ];

  // ---------- Estaciones del mapa ----------
  const ESTACIONES = [
    { id: "intereses", lugar: "Sierra Nevada de Mérida", titulo: "Brújula de intereses", icono: "🏔️", color: "#2f7de0", desc: "Descubre qué actividades te encienden. 30 cartas: decide rápido, sin pensarlo mucho.", xp: 200 },
    { id: "habilidades", lugar: "Médanos de Coro", titulo: "Desafíos de habilidades", icono: "🏜️", color: "#e07a2f", desc: "Cinco minijuegos que miden memoria, lógica, lenguaje, cálculo y creatividad.", xp: 250 },
    { id: "competencias", lugar: "Relámpago del Catatumbo", titulo: "La tormenta de la tripulación", icono: "⚡", color: "#7a5af5", desc: "Situaciones reales del liceo y la comunidad: ¿cómo actúas? Revela tus habilidades blandas.", xp: 160 },
    { id: "valores", lugar: "Salto Ángel – Canaima", titulo: "Brújula de valores", icono: "🌊", color: "#21a67a", desc: "Elige entre dos caminos. Descubre lo que más te importa en tu vida profesional.", xp: 160 },
    { id: "expedicion", lugar: "Tepuy Roraima", titulo: "Expedición al tepuy", icono: "🏕️", color: "#c27c0e", desc: "Una misión de rescate llena de decisiones. No hay respuestas correctas: solo tu forma de actuar.", xp: 180 },
    { id: "mundo", lugar: "Archipiélago Los Roques", titulo: "Puerto del futuro", icono: "🏝️", color: "#0aa5b8", desc: "Tendencias del mundo laboral y el reto «¿Mito o realidad?».", xp: 180 },
    { id: "carta", lugar: "Pico Bolívar", titulo: "Tu carta de navegación", icono: "🧭", color: "#e0464f", desc: "Tu perfil completo, las carreras que mejor encajan contigo y tu plan de vida en sprints.", xp: 100 }
  ];

  const RANGOS = [
    { min: 0, n: "Grumete" }, { min: 150, n: "Marinero" }, { min: 400, n: "Timonel" },
    { min: 650, n: "Navegante" }, { min: 900, n: "Capitán" }, { min: 1100, n: "Almirante" }
  ];

  const COMPANEROS = [
    { e: "🦅", n: "Cóndor andino" }, { e: "🦜", n: "Guacamaya" }, { e: "🐻", n: "Oso frontino" },
    { e: "🐆", n: "Jaguar" }, { e: "🐬", n: "Tonina" }, { e: "🐢", n: "Tortuga arrau" }
  ];

  const HOBBIES = ["Deportes", "Música", "Videojuegos", "Dibujo", "Lectura", "Redes sociales", "Cocina", "Naturaleza", "Tecnología", "Baile", "Voluntariado", "Mecánica"];
  const MATERIAS = ["Matemática", "Física", "Química", "Biología", "Castellano", "Inglés", "Historia", "Geografía", "Arte", "Educación física", "Informática", "Orientación y convivencia"];

  return { TENDENCIAS_ESTILO, MISION, RIASEC, INTERESES, APTITUDES, LOGICA, VERBAL, MEMORIA_FICHAS, COMPETENCIAS, ESCENARIOS, VALORES, TENDENCIAS, MITOS, CARRERAS, ESTACIONES, RANGOS, COMPANEROS, HOBBIES, MATERIAS };
})();
