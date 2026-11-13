# Informe: Navigo, orientación vocacional gamificada para bachillerato en Venezuela

**Fecha:** 13 de noviembre de 2026
**Ámbito:** liceos públicos y privados del estado Mérida, Venezuela
**Producto:** prototipo web interactivo «Navigo, la ruta de tu talento» (carpeta `navigo/`)

---

## 1. Rol y objetivo

Este informe está escrito desde el rol de especialista en orientación vocacional con experiencia en actividades gamificadas y metodologías ágiles. Su objetivo es **usar herramientas tecnológicas gamificadas que, a través del juego, capten los intereses, habilidades, valores y comportamientos de estudiantes de bachillerato**. Así los estudiantes descubren sus talentos y los asocian con oportunidades profesionales, tanto las que ya existen como las que están surgiendo.

## 2. Diagnóstico del contexto

- **El problema en Mérida.** La orientación vocacional se reduce casi siempre a tests de lápiz y papel y a charlas generales. Ninguno de los dos atiende de forma integral ni individual a cada estudiante. Además pesan la falta de información, la presión social (de la familia y de los amigos) y la dificultad para reconocer los propios talentos.
- **El mercado laboral venezolano.** La prensa nacional describe un mercado muy deteriorado. Muchos jóvenes combinan los estudios con emprendimientos, oficios técnicos y trabajo remoto, y algunos profesionales han migrado a oficios por los bajos salarios (El Diario, 2026). Un estudio de la UCAB recoge además la percepción de que las carreras largas no garantizan estabilidad, aunque el interés por ellas se recuperó levemente en 2025 (Crónica Uno / Diario de Los Andes, 2025).
- **Las tendencias globales.** El *Future of Jobs Report 2025* del Foro Económico Mundial estima que hacia 2030 se crearán 170 millones de empleos y se desplazarán 92 millones, con un saldo neto de 78 millones. Las habilidades que más crecen son la inteligencia artificial y el big data, las redes y la ciberseguridad y la alfabetización tecnológica. Les siguen el pensamiento creativo, la resiliencia, la flexibilidad y el aprendizaje continuo. La gestión ambiental entra por primera vez al top 10, y el 63 % de los empleadores señala la brecha de habilidades como su principal barrera.
- **Las competencias que pide el empleador.** La tesis de Carmona (ULA, 2022) muestra que las organizaciones de Mérida avanzan hacia una selección del talento basada en competencias. También recoge que cerca del 75 % del éxito laboral a largo plazo se asocia a habilidades blandas y que una habilidad técnica conserva su vigencia unos cinco años (Deloitte). La tesis cita además la **Gaceta Oficial N.º 38.924**, el Manual Descriptivo de Competencias Genéricas: trabajo en equipo, liderazgo, comunicación, adaptabilidad, iniciativa, autocontrol, pensamiento analítico, innovación y conciencia del deber social, entre otras.

**Conclusión del diagnóstico.** La orientación debe preparar al estudiante para hacer *trayectorias* y no solo para elegir *una carrera*. Eso exige que conozca sus intereses, valores y habilidades blandas, que maneje información actualizada sobre el mercado y que cuente con el acompañamiento de un experto.

## 3. Evidencia sobre la gamificación en la orientación vocacional

- **Aventúrate: la ruta vocacional** (Salinas, Chile, 2023) es el referente directo de este proyecto. Es una aplicación organizada en un mapa de paisajes nacionales. Cada nivel combina un test vocacional (Holland, CHASIDE o Kuder) con tres desafíos lúdicos (memoria, laberinto y sopa de letras), un reto final y estaciones informativas sobre carreras y el mercado laboral. El registro pide solo los datos mínimos (nombre, edad, hobbies y materias favoritas). Su contenido se diseñó con el modelo ADDIE y design thinking, y se validó con el modelo *UX Honeycomb* de Morville.
- **«Decidiendo mi futuro»** (Jalisco, México) fue una intervención gamificada para promover la madurez vocacional en bachillerato. Los estudiantes percibieron que su plan vocacional se iba construyendo y mostraron más motivación y participación. Hay que leer este resultado con cautela: la muestra fue de solo 16 estudiantes y no hubo grupo de control.
- **Balance de la evidencia.** Hay indicios consistentes de que la gamificación **aumenta la motivación y la participación**. En cambio, todavía falta evidencia experimental de que mejore la calidad de la decisión vocacional. Por eso Navigo se presenta como **un complemento del orientador, no como un sustituto**, y propone medirse con un diseño de pre y postest (ver la sección 7).

## 4. Propuesta: Navigo

Navigo es una ruta de juego por paisajes venezolanos. Cada estación capta una dimensión del estudiante:

| # | Estación (lugar) | Dimensión | Instrumento gamificado | Base teórica |
|---|---|---|---|---|
| 1 | Sierra Nevada de Mérida | Intereses | 30 cartas tipo *swipe* con 3 respuestas | Modelo RIASEC de Holland |
| 2 | Médanos de Coro | Habilidades | 5 minijuegos: memoria, lógica, verbal, cálculo y creatividad (usos de una tapara) | Desafíos de Aventúrate; pruebas de aptitud |
| 3 | Relámpago del Catatumbo | Comportamientos y habilidades blandas | 8 situaciones de juicio situacional (liceo y comunidad) | Competencias genéricas de la G.O. 38.924 (Carmona, 2022) |
| 4 | Salto Ángel, Canaima | Valores | 16 duelos por pares entre 8 valores laborales | Jerarquía de valores laborales |
| 5 | Archipiélago Los Roques | Información del mundo laboral | Tendencias, reto «¿Mito o realidad?» y explorador de carreras | WEF 2025; contexto venezolano |
| 6 | Pico Bolívar | Integración | Carta de navegación con perfil, afinidad con 38 carreras y oficios y un plan en *sprints* | Proyecto de vida y metodología ágil |

**Mecánicas de juego:** experiencia (XP), rangos náuticos (de Grumete a Almirante), insignias, desbloqueo progresivo de estaciones, retroalimentación inmediata, retos con tiempo, confeti y celebraciones, y compañeros de viaje de la fauna venezolana.

**Cómo se calcula la afinidad con cada carrera:** intereses RIASEC con pesos 3-2-1 sobre el código de la carrera (55 %), habilidades (20 %), valores (15 %) y competencias blandas (10 %). Los resultados se muestran como «rutas para explorar», no como un veredicto.

**Componente ágil:** el proyecto de vida se gestiona en *sprints* de 30 días con un tablero Kanban (Por hacer, Haciendo, Hecho). Las metas iniciales se generan a partir del perfil. Al cerrar un sprint se hace una «retrospectiva» que da XP e insignias.

**Acompañamiento experto:** el estudiante exporta su carta de navegación en un archivo JSON. El **panel del orientador** reúne las cartas del grupo, muestra la distribución de intereses dominantes y el promedio de competencias, sugiere talleres grupales y exporta un CSV.

**Privacidad:** se piden datos mínimos y todo queda en el dispositivo (localStorage). No hay servidor ni se envía información a internet. Esto es importante porque los usuarios son menores de edad.

## 5. Oportunidades profesionales incluidas

El catálogo tiene 38 carreras y oficios clasificados como **emergentes**, **consolidados** u **oficios técnicos**. Entre los emergentes están ciencia de datos, ciberseguridad, desarrollo de software, energías renovables, ingeniería ambiental, agroindustria, marketing digital, producción audiovisual y logística. Entre los consolidados, que tienen fuerte presencia en Mérida, están medicina, enfermería, educación, derecho, administración y turismo de montaña. Los oficios técnicos (electricidad, mecánica, refrigeración) se forman en el INCES.

Las instituciones de referencia son la Universidad de Los Andes (ULA), la UPT de Mérida «Kléber Ramírez» (programas nacionales de formación), la UNEFA, la UPEL y el INCES. *La oferta académica cambia: hay que validarla cada año con las universidades y con el Sistema Nacional de Ingreso (OPSU).*

## 6. Plan de implementación (ADDIE con sprints)

1. **Análisis (sprint 0):** validar con 2 o 3 liceos de Mérida y sus orientadores la lista de carreras, el lenguaje y las situaciones.
2. **Diseño:** ajustar los ítems con un panel de expertos (orientadores y psicólogos) y revisar la validez de contenido.
3. **Desarrollo:** iterar el prototipo actual en sprints de 2 semanas.
4. **Implementación:** hacer un piloto con 4.º y 5.º año en sesiones de 40 minutos en el laboratorio o con el teléfono, seguidas de una entrevista individual con el orientador.
5. **Evaluación:** aplicar un pretest y un postest de madurez vocacional, medir la usabilidad (SUS) y la satisfacción, y hacer seguimiento del plan de sprints a los 30 y 60 días.

## 7. Indicadores sugeridos

- El porcentaje de estudiantes que completa la ruta y su tiempo promedio.
- La variación en la autopercepción de claridad vocacional (antes y después).
- El número de metas cumplidas por sprint.
- La satisfacción del orientador con la información recibida.
- La consistencia de los resultados en una nueva aplicación a las 4 semanas (confiabilidad test-retest).

## 8. Limitaciones

Los minijuegos y las escalas son **instrumentos de exploración, no tests psicométricos estandarizados**. Antes de usarlos de forma institucional deben validarse con una población venezolana. Los datos del mercado laboral venezolano son escasos, por lo que se recomienda actualizar el catálogo con información local (gremios, cámaras, universidades).

## 9. Fuentes

- Carmona, W. (2022). *Modelo de selección del talento humano basado en las competencias laborales, Mérida-Venezuela.* ULA-CIDE.
- Salinas, M. (2023). *Aventúrate: la ruta vocacional.* Memoria de título, Diseño Gráfico, Santiago de Chile.
- República Bolivariana de Venezuela (2008). Gaceta Oficial N.º 38.924, Manual Descriptivo de Competencias Genéricas.
- World Economic Forum (2025). [Future of Jobs Report 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/) y [nota de prensa](https://www.weforum.org/media/future-of-jobs-report-2025-78-million-new-job-opportunities-by-2030-but-urgent-upskilling-needed-to-prepare-workforces/).
- [Gamificación como herramientas para promover la madurez vocacional en estudiantes de bachillerato (REDINED)](https://redined.educacion.gob.es/xmlui/handle/11162/257563).
- [El Diario (2025): bachilleres y carreras largas](https://eldiario.com/2025/07/23/bachilleres-egresados-escuelas-privadas-estudiar-carreras-largas/); [Diario de Los Andes: estudio UCAB](https://diariodelosandes.com/disminuye-el-numero-de-estudiantes-que-planea-emigrar-despues-de-graduarse-segun-estudio-de-la-ucab); [El Diario (2026): profesionales que cambian a oficios](https://eldiario.com/2026/04/20/cambio-carrera-profesionales-oficios-bajos-salarios/).
- Holland, J. L. (1997). *Making Vocational Choices.* PAR.
