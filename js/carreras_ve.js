/* NAVIGO — Catálogo nacional de carreras de Venezuela.
   Amplía NAVIGO_DATA.CARRERAS sin modificar las carreras originales:
   - asigna un área de conocimiento y las universidades venezolanas donde se ofrecen,
   - agrega carreras nuevas de todas las áreas.
   Referencia: Libro de Oportunidades de Estudio (OPSU / Sistema Nacional de Ingreso) y portales universitarios.
   La oferta cambia cada año: verificar siempre en sni.opsu.gob.ve y en cada universidad. */
(function () {
  const D = window.NAVIGO_DATA;

  const AREAS = {
    salud: { nombre: "Ciencias de la Salud", icono: "🩺" },
    ingenieria: { nombre: "Ingeniería, Arquitectura y Tecnología", icono: "⚙️" },
    basicas: { nombre: "Ciencias Básicas", icono: "🔬" },
    agro: { nombre: "Ciencias del Agro y del Ambiente", icono: "🌱" },
    economicas: { nombre: "Ciencias Económicas y Administrativas", icono: "📊" },
    sociales: { nombre: "Ciencias Sociales y Jurídicas", icono: "⚖️" },
    educacion: { nombre: "Educación", icono: "🍎" },
    humanidades: { nombre: "Humanidades, Artes y Diseño", icono: "🎭" },
    seguridad: { nombre: "Seguridad, Defensa y Gestión de Riesgos", icono: "🛡️" }
  };

  // Universidades e institutos (código → nombre, sede, estados)
  const UNIS = {
    ULA: ["Universidad de Los Andes", "Mérida, Táchira y Trujillo", ["Mérida", "Táchira", "Trujillo"]],
    UCV: ["Universidad Central de Venezuela", "Caracas y Maracay", ["Distrito Capital", "Aragua"]],
    LUZ: ["Universidad del Zulia", "Maracaibo", ["Zulia"]],
    UC: ["Universidad de Carabobo", "Valencia", ["Carabobo"]],
    USB: ["Universidad Simón Bolívar", "Sartenejas, Miranda", ["Miranda"]],
    UCLA: ["Universidad Centroccidental Lisandro Alvarado", "Barquisimeto", ["Lara"]],
    UDO: ["Universidad de Oriente", "Sucre, Anzoátegui, Monagas, Bolívar y Nueva Esparta", ["Sucre", "Anzoátegui", "Monagas", "Bolívar", "Nueva Esparta"]],
    UNET: ["Universidad Nacional Experimental del Táchira", "San Cristóbal", ["Táchira"]],
    UNELLEZ: ["UNELLEZ (Ezequiel Zamora)", "Barinas, Portuguesa, Apure y Cojedes", ["Barinas", "Portuguesa", "Apure", "Cojedes"]],
    UPEL: ["Universidad Pedagógica Experimental Libertador", "Institutos en todo el país", ["Nacional"]],
    UNEFA: ["UNEFA (Fuerza Armada)", "Núcleos en todo el país", ["Nacional"]],
    UNA: ["Universidad Nacional Abierta", "A distancia, centros locales en todo el país", ["Nacional"]],
    UCAB: ["Universidad Católica Andrés Bello", "Caracas y Guayana", ["Distrito Capital", "Bolívar"]],
    UNIMET: ["Universidad Metropolitana", "Caracas", ["Miranda"]],
    URBE: ["Universidad Dr. Rafael Belloso Chacín", "Maracaibo", ["Zulia"]],
    UCAT: ["Universidad Católica del Táchira", "San Cristóbal", ["Táchira"]],
    UNEXPO: ["UNEXPO (Antonio José de Sucre)", "Barquisimeto, Caracas y Guayana", ["Lara", "Distrito Capital", "Bolívar"]],
    UNEFM: ["Universidad Francisco de Miranda", "Coro", ["Falcón"]],
    UNERG: ["Universidad Rómulo Gallegos", "San Juan de los Morros", ["Guárico"]],
    UNESUR: ["Universidad Sur del Lago", "Santa Bárbara del Zulia", ["Zulia"]],
    UPTM: ["UPT de Mérida «Kléber Ramírez»", "Mérida", ["Mérida"]],
    UPT: ["Universidades Politécnicas Territoriales (PNF)", "En casi todos los estados", ["Nacional"]],
    UNEARTE: ["Universidad Nacional Experimental de las Artes", "Caracas y núcleos regionales", ["Nacional"]],
    UNES: ["Universidad Nacional Experimental de la Seguridad", "Caracas y núcleos regionales", ["Nacional"]],
    UMBV: ["Universidad Militar Bolivariana de Venezuela", "Caracas", ["Distrito Capital"]],
    UMC: ["Universidad Marítima del Caribe", "La Guaira", ["La Guaira"]],
    USM: ["Universidad Santa María", "Caracas", ["Distrito Capital"]],
    UJAP: ["Universidad José Antonio Páez", "Valencia", ["Carabobo"]],
    UBV: ["Universidad Bolivariana de Venezuela", "Sedes en todo el país", ["Nacional"]]
  };

  // Carreras originales → área y universidades a nivel nacional
  const ORIGINALES = {
    "Ingeniería de Sistemas": ["ingenieria", "ULA,UNEFA,UNIMET,URBE,UDO"],
    "Informática / Desarrollo de software (TSU o PNF)": ["ingenieria", "UPTM,UPT,UBV"],
    "Ciencia de datos y Estadística": ["basicas", "ULA,UCV"],
    "Ciberseguridad y redes": ["ingenieria", ""],
    "Medicina": ["salud", "ULA,UCV,LUZ,UC,UCLA,UDO,UNEFM,UNERG"],
    "Enfermería": ["salud", "ULA,UCV,LUZ,UC,UCLA,UDO"],
    "Odontología": ["salud", "ULA,UCV,LUZ,UC,USM"],
    "Farmacia": ["salud", "ULA,UCV,LUZ,USM"],
    "Bioanálisis": ["salud", "ULA,UCV,LUZ,UC,UDO"],
    "Nutrición y Dietética": ["salud", "ULA,UCV,LUZ"],
    "Psicología": ["sociales", "UCV,UCAB,URBE"],
    "Educación (varias menciones)": ["educacion", "ULA,UPEL,UCV,LUZ,UC,UNA"],
    "Comunicación Social": ["sociales", "ULA,UCV,LUZ,UCAB,URBE,UCAT"],
    "Diseño gráfico y multimedia": ["humanidades", ""],
    "Producción audiovisual y animación": ["humanidades", "ULA,UNEARTE"],
    "Arquitectura": ["ingenieria", "ULA,UCV,LUZ,USB"],
    "Artes visuales y Música": ["humanidades", "ULA,UCV,UNEARTE"],
    "Idiomas Modernos y traducción": ["humanidades", "ULA,UCV"],
    "Derecho": ["sociales", "ULA,UCV,LUZ,UC,UCAB,UCAT,URBE"],
    "Ciencias Políticas": ["sociales", "ULA,UCV,LUZ"],
    "Administración y Gerencia": ["economicas", "ULA,UCV,LUZ,UC,UCLA,UDO,UCAB,UNIMET,URBE,UJAP,UPTM,UNA"],
    "Contaduría Pública": ["economicas", "ULA,UCV,LUZ,UC,UCLA,UDO,UCAB,UNA,UPTM"],
    "Economía": ["economicas", "ULA,UCV,LUZ,UC,UCAB,UNIMET"],
    "Emprendimiento y marketing digital": ["economicas", ""],
    "Turismo y hotelería": ["economicas", "UPTM,UDO"],
    "Gastronomía y cocina profesional": ["humanidades", ""],
    "Ingeniería Civil": ["ingenieria", "ULA,UCV,LUZ,UC,UDO,UNET,UCAB,UNIMET"],
    "Ingeniería Eléctrica y energías renovables": ["ingenieria", "ULA,UCV,LUZ,UC,USB,UNEXPO,UDO"],
    "Ingeniería Mecánica": ["ingenieria", "ULA,UCV,LUZ,UC,USB,UNEXPO,UDO,UNET"],
    "Ingeniería Química": ["ingenieria", "ULA,UCV,LUZ,UC,USB,UDO,UNIMET"],
    "Ingeniería Forestal y ambiental": ["agro", "ULA,UNELLEZ"],
    "Ingeniería Geológica y Geografía": ["ingenieria", "ULA,UCV,UDO"],
    "Agronomía y agroindustria": ["agro", "UCV,LUZ,UCLA,UNET,UNELLEZ"],
    "Biología, Química, Física y Matemática": ["basicas", "ULA,UCV,LUZ,USB,UDO,UC"],
    "Trabajo Social": ["sociales", "UCV,LUZ"],
    "Fisioterapia y deporte": ["salud", ""],
    "Técnico en electricidad, mecánica o refrigeración": ["ingenieria", "UPT"],
    "Logística y comercio exterior": ["economicas", ""]
  };

  // Carreras nuevas: Nombre | código Holland | aptitudes | competencias | valores | tipo (c/e/o) | universidades | descripción
  const NUEVAS = {
    salud: `
Medicina Integral Comunitaria|SIR|memoria verbal|social comunicacion|servicio equilibrio|c|UNEFM,UBV|Medicina con enfoque preventivo y comunitario.
Medicina Veterinaria|IRS|memoria logica|analitico social|servicio aventura|c|UCV,LUZ,UCLA,UNELLEZ,UNERG|Salud de animales domésticos, silvestres y de producción.
Terapia Ocupacional|SAR|creatividad verbal|social adaptabilidad|servicio equilibrio|c||Ayuda a recuperar la autonomía en las actividades diarias.
Fonoaudiología|SIA|verbal memoria|comunicacion social|servicio conocimiento|c||Trata trastornos de la voz, el habla, el lenguaje y la audición.
Radiología e Imagenología|RIC|memoria logica|analitico autocontrol|servicio economia|e||Diagnóstico por rayos X, tomografía y ecografía.
Instrumentación Quirúrgica|RSC|memoria logica|equipo autocontrol|servicio equilibrio|c||Asiste al equipo de cirugía en el quirófano.
Optometría|IRS|memoria logica|analitico social|servicio autonomia|c||Cuida la salud visual y adapta lentes.
Salud Pública y Epidemiología|ISE|numerica logica|analitico social|servicio conocimiento|e||Previene enfermedades a escala de comunidades y países.
Higiene y Seguridad Laboral|RCI|logica memoria|analitico liderazgo|servicio economia|e|UPT,UNEFA|Previene accidentes y enfermedades en el trabajo.`,
    ingenieria: `
Ingeniería Informática|IRC|logica numerica|analitico innovacion|conocimiento economia|e|UCAB,UCLA,UNET|Software, bases de datos y sistemas de información.
Computación (Licenciatura)|ICR|logica numerica|analitico innovacion|conocimiento autonomia|e|UCV,LUZ|Ciencia de la computación: algoritmos, IA y software.
Ingeniería de Computación|IRC|logica numerica|analitico innovacion|conocimiento economia|e|USB|Hardware, software y sistemas embebidos.
Ingeniería en Telecomunicaciones|IRC|logica numerica|analitico adaptabilidad|economia conocimiento|e|UCAB,UNEFA,URBE|Redes, fibra óptica, telefonía móvil y satélites.
Ingeniería Electrónica|IRC|logica numerica|analitico innovacion|conocimiento economia|c|USB,UNEXPO,UNEFA|Circuitos, automatización y dispositivos electrónicos.
Ingeniería Industrial|ECR|numerica logica|liderazgo analitico|economia reconocimiento|c|UC,UCAB,UNEXPO,UNET|Optimiza procesos, costos y calidad en las empresas.
Ingeniería de Producción|ECR|numerica logica|liderazgo analitico|economia reconocimiento|c|USB,UNIMET,UCLA|Planifica y mejora la producción industrial.
Ingeniería de Petróleo|RIC|numerica logica|analitico adaptabilidad|economia aventura|c|UCV,LUZ,UDO|Exploración y producción de hidrocarburos.
Ingeniería de Minas|RIC|numerica logica|analitico autocontrol|aventura economia|c|UCV,UDO|Extracción responsable de minerales.
Ingeniería Metalúrgica y de Materiales|IRC|numerica logica|analitico innovacion|conocimiento economia|c|UCV,USB,UNEXPO|Diseña y mejora metales, polímeros y cerámicos.
Ingeniería Hidrometeorológica|IRC|numerica logica|analitico social|conocimiento aventura|e|UCV|Clima, lluvias, ríos y prevención de desastres.
Ingeniería Geodésica|RIC|numerica logica|analitico autocontrol|aventura conocimiento|c|LUZ|Mide y georreferencia el territorio con GPS y satélites.
Ingeniería Ambiental|RIS|logica numerica|analitico social|servicio conocimiento|e|UNET|Agua, aire, residuos y control de la contaminación.
Ingeniería Aeronáutica|RIC|numerica logica|analitico autocontrol|aventura reconocimiento|c|UNEFA|Diseño y mantenimiento de aeronaves.
Ingeniería Naval y Marítima|RIC|numerica logica|analitico equipo|aventura economia|c|UNEFA,UMC|Buques, puertos y operaciones marítimas.
Ingeniería Biomédica|IRS|logica numerica|innovacion analitico|servicio conocimiento|e||Tecnología para la salud: equipos médicos y prótesis.
Ingeniería Mecatrónica y Robótica|RIC|logica numerica|innovacion analitico|conocimiento economia|e||Mecánica, electrónica y programación integradas.
Ingeniería de Mantenimiento|RCI|logica numerica|analitico iniciativa|economia equilibrio|c|UPT|Mantiene plantas, máquinas e instalaciones.
Ingeniería en Alimentos|IRC|numerica logica|analitico innovacion|conocimiento economia|e|UNESUR|Procesa y conserva alimentos seguros y nutritivos.
Urbanismo|IEA|creatividad numerica|analitico social|servicio creatividad|c|USB|Planifica ciudades y territorios.
Diseño Industrial|ARE|creatividad logica|innovacion iniciativa|creatividad autonomia|e||Diseña productos útiles, bellos y fabricables.
Inteligencia Artificial y Robótica (formación emergente)|IRA|logica creatividad|innovacion analitico|conocimiento creatividad|e||Programas, diplomados y cursos de IA y automatización.
Desarrollo de Videojuegos|AIR|creatividad logica|innovacion equipo|creatividad autonomia|e||Diseño, arte y programación de videojuegos.
PNF en Electricidad|RIC|logica numerica|iniciativa adaptabilidad|economia autonomia|o|UPT|Instalaciones y sistemas eléctricos (TSU e ingeniería).
PNF en Mecánica|RIC|logica numerica|iniciativa analitico|economia autonomia|o|UPT|Mantenimiento y fabricación mecánica.
PNF en Instrumentación y Control|RIC|logica numerica|analitico innovacion|economia conocimiento|o|UPT|Automatiza procesos industriales con sensores.
PNF en Procesos Químicos|IRC|numerica logica|analitico autocontrol|economia conocimiento|o|UPT|Opera plantas de procesos químicos.
PNF en Construcción Civil|RCE|numerica logica|equipo iniciativa|economia autonomia|o|UPT|Construye y supervisa obras civiles.`,
    basicas: `
Biología|IRA|logica memoria|analitico innovacion|conocimiento aventura|c|ULA,UCV,LUZ,USB,UDO,UC|Estudia los seres vivos y los ecosistemas.
Química|IRC|numerica logica|analitico autocontrol|conocimiento economia|c|ULA,UCV,LUZ,USB,UDO,UC|Composición y transformación de la materia.
Física|IRA|numerica logica|analitico innovacion|conocimiento reconocimiento|c|ULA,UCV,LUZ,USB,UDO,UC|Las leyes del universo: energía, materia y movimiento.
Matemática|ICA|numerica logica|analitico autocontrol|conocimiento autonomia|c|ULA,UCV,LUZ,USB,UDO,UC|Modelos, demostraciones y cálculo para todas las ciencias.
Ciencias Actuariales|CIE|numerica logica|analitico autocontrol|economia conocimiento|c|UCV|Mide riesgos para seguros, pensiones y finanzas.
Geoquímica|IRC|numerica logica|analitico adaptabilidad|conocimiento aventura|c|UCV|Química de rocas, suelos, aguas y petróleo.
Biología Marina|IRA|logica memoria|analitico adaptabilidad|aventura conocimiento|c|UDO|Vida en mares, costas y arrecifes.
Biotecnología|IRC|logica numerica|innovacion analitico|conocimiento economia|e||Usa organismos vivos para crear productos y soluciones.
Geografía|IRA|memoria logica|analitico social|aventura conocimiento|c|ULA,UCV|Territorio, población, ambiente y mapas.`,
    agro: `
Ingeniería Agronómica|RIE|logica numerica|iniciativa adaptabilidad|aventura autonomia|c|UCV,LUZ,UCLA,UNET,UNELLEZ,UDO|Producción agrícola sostenible y manejo de cultivos.
Ingeniería Agroindustrial|RIE|logica numerica|innovacion iniciativa|economia autonomia|e|UCLA,UNESUR|Transforma productos del campo en alimentos y bienes.
Ingeniería de Producción Animal|RIS|logica memoria|iniciativa social|autonomia aventura|c|UNELLEZ,UNET,UDO|Cría y manejo de ganado, aves y peces.
PNF en Agroalimentación|RIS|logica memoria|social iniciativa|servicio autonomia|o|UPT,UBV|Producción de alimentos con las comunidades.
Gestión Ambiental|SIR|memoria logica|social analitico|servicio aventura|e|UBV|Proyectos comunitarios para cuidar el ambiente.
Acuicultura y Pesca|RIE|logica memoria|iniciativa adaptabilidad|aventura autonomia|e||Cultivo de peces y camarones y pesca responsable.`,
    economicas: `
Relaciones Industriales|SEC|verbal memoria|comunicacion social|servicio equilibrio|c|UC,UCAB|Gestión del talento humano y relaciones laborales.
Mercadeo|EAC|creatividad verbal|comunicacion innovacion|economia creatividad|c|URBE,UJAP|Estudia a los clientes y diseña estrategias de venta.
Banca y Finanzas|CEI|numerica logica|analitico autocontrol|economia equilibrio|c||Inversiones, créditos y servicios financieros.
Ciencias Fiscales y Tributación|CEI|numerica memoria|analitico autocontrol|economia equilibrio|c||Impuestos y finanzas públicas.
Gestión Pública|ECS|verbal numerica|liderazgo social|servicio reconocimiento|c||Administra instituciones y políticas del Estado.`,
    sociales: `
Sociología|ISE|verbal logica|analitico comunicacion|conocimiento servicio|c|UCV,UCAB,LUZ|Estudia cómo se organiza y cambia la sociedad.
Antropología|IAS|verbal memoria|analitico adaptabilidad|conocimiento aventura|c|UCV|Culturas, pueblos y diversidad humana.
Estudios Internacionales|EIS|verbal memoria|comunicacion adaptabilidad|aventura reconocimiento|c|UCV|Diplomacia, comercio y relaciones entre países.
Criminología|ISC|verbal logica|analitico autocontrol|servicio conocimiento|c|ULA|Causas del delito y su prevención.
Bibliotecología y Archivología|CIA|memoria verbal|analitico autocontrol|conocimiento equilibrio|c|UCV|Organiza y preserva información y memoria histórica.`,
    educacion: `
Educación Inicial|SAC|verbal creatividad|comunicacion social|servicio equilibrio|c|UPEL,ULA,LUZ,UNA|Acompaña el desarrollo de niños de 0 a 6 años.
Educación Integral (Primaria)|SAC|verbal numerica|comunicacion social|servicio equilibrio|c|UPEL,ULA,UNA|Docencia en educación primaria.
Educación en Matemática y Física|SIC|numerica logica|comunicacion analitico|servicio conocimiento|c|ULA,UPEL|Enseña ciencias exactas en liceos.
Educación en Biología y Química|SIC|memoria logica|comunicacion analitico|servicio conocimiento|c|ULA,UPEL|Enseña ciencias naturales en liceos.
Educación en Lenguas Extranjeras|SAC|verbal memoria|comunicacion adaptabilidad|servicio aventura|c|ULA,UPEL|Enseña inglés, francés y otras lenguas.
Educación Física y Deporte|SRE|memoria logica|liderazgo equipo|servicio equilibrio|c|ULA,UPEL|Formación deportiva y vida saludable.
Educación Especial|SAC|verbal creatividad|social autocontrol|servicio equilibrio|c|UPEL|Educación para personas con discapacidad o necesidades especiales.
Educación en Ciencias Sociales e Historia|SAI|memoria verbal|comunicacion social|servicio conocimiento|c|ULA,UPEL|Enseña historia, geografía y ciudadanía.
Educación en Informática|SIR|logica creatividad|comunicacion innovacion|servicio conocimiento|e|UPEL|Enseña tecnología y pensamiento computacional.
Educación Musical y Artística|ASE|creatividad memoria|comunicacion innovacion|creatividad servicio|c|UPEL,UNEARTE|Enseña música y artes.
Orientación|SAI|verbal memoria|social comunicacion|servicio conocimiento|c|UPEL,UC|Acompaña a estudiantes en su desarrollo personal y vocacional.`,
    humanidades: `
Letras|AIS|verbal memoria|comunicacion analitico|creatividad conocimiento|c|ULA,UCV,UCAB|Literatura, lengua y escritura creativa.
Historia|IAS|memoria verbal|analitico comunicacion|conocimiento aventura|c|ULA,UCV|Investiga el pasado para entender el presente.
Filosofía|IAS|verbal logica|analitico comunicacion|conocimiento autonomia|c|ULA,UCV,UCAB|Piensa las grandes preguntas: ética, verdad y sociedad.
Música|ASI|creatividad memoria|innovacion autocontrol|creatividad reconocimiento|c|ULA,UNEARTE|Interpretación, composición y producción musical.
Danza|ASR|creatividad memoria|equipo autocontrol|creatividad aventura|c|UNEARTE|Creación e interpretación de la danza.
Artes Escénicas (Teatro)|ASE|creatividad verbal|comunicacion equipo|creatividad reconocimiento|c|UNEARTE|Actuación, dirección y producción teatral.
Diseño de Modas|ARE|creatividad memoria|innovacion iniciativa|creatividad autonomia|e||Diseña y produce colecciones de ropa.
Fotografía y Artes Digitales|ARI|creatividad memoria|innovacion iniciativa|creatividad aventura|e||Imagen, edición y arte digital.`,
    seguridad: `
Ciencias y Artes Militares|REC|logica memoria|liderazgo autocontrol|servicio reconocimiento|c|UMBV,UNEFA|Formación de oficiales de la Fuerza Armada.
Servicio de Policía|SER|memoria verbal|autocontrol social|servicio aventura|c|UNES|Seguridad ciudadana y prevención del delito.
Protección Civil y Administración de Desastres|RSE|logica memoria|liderazgo autocontrol|servicio aventura|e|UNES|Prevención y respuesta ante emergencias y desastres.
Servicio de Bomberos|RSE|logica memoria|equipo autocontrol|servicio aventura|c|UNES|Prevención y atención de incendios y rescates.`
  };

  const TIPO = { c: "consolidada", e: "emergente", o: "oficio" };
  const uniNombre = (k) => (UNIS[k] ? `${UNIS[k][0]} (${UNIS[k][1]})` : k);

  // 1) Enriquecer carreras originales
  D.CARRERAS.forEach((c) => {
    const o = ORIGINALES[c.n];
    c.area = o ? o[0] : "humanidades";
    c.unis = o && o[1] ? o[1].split(",") : [];
  });

  // 2) Agregar carreras nuevas
  Object.entries(NUEVAS).forEach(([area, txt]) => {
    txt.trim().split("\n").forEach((line) => {
      const [n, code, apt, comp, val, tag, unis, d] = line.split("|").map((s) => s.trim());
      if (!n || D.CARRERAS.some((c) => c.n === n)) return;
      const u = unis ? unis.split(",") : [];
      D.CARRERAS.push({
        n, code, apt: apt.split(" "), comp: comp.split(" "), val: val.split(" "), tag: TIPO[tag] || "consolidada", d,
        area, unis: u, donde: u.length ? u.map(uniNombre) : ["Consulta el Libro de Oportunidades de Estudio (OPSU)"]
      });
    });
  });

  // 3) Estados donde se puede estudiar cada carrera
  D.CARRERAS.forEach((c) => {
    const est = new Set();
    c.unis.forEach((k) => (UNIS[k] ? UNIS[k][2] : []).forEach((e) => est.add(e)));
    c.estados = Array.from(est);
  });

  D.AREAS = AREAS;
  D.UNIS = UNIS;
  D.uniNombre = uniNombre;
  D.ESTADOS_VE = Array.from(new Set(Object.values(UNIS).flatMap((u) => u[2]))).filter((e) => e !== "Nacional").sort((a, b) => a.localeCompare(b, "es"));
})();
