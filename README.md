# Navigo: la ruta de tu talento

Navigo es una web de orientación vocacional gamificada para estudiantes de bachillerato en Venezuela (Mérida). La fundamentación completa está en [INFORME.md](INFORME.md).

## Cómo abrirla
Haz doble clic en `index.html`. No necesita servidor, instalación ni internet; solo usa internet para cargar las fuentes tipográficas, y si no hay conexión usa las del sistema.

## Estructura
- `index.html`: la página y la barra superior (XP, rango, accesos a Fundamentos y al panel del orientador).
- `css/styles.css`: el diseño, que se adapta al móvil, al modo oscuro y a la impresión.
- `js/data.js`: todo el contenido (ítems RIASEC, minijuegos, situaciones, valores, tendencias y las 38 carreras). **Aquí se edita el contenido sin tocar la lógica.**
- `js/app.js`: la lógica del juego, el puntaje, la carta de navegación, el plan en sprints y el panel del orientador.

## Ruta del estudiante
1. Sierra Nevada de Mérida: intereses (RIASEC).
2. Médanos de Coro: 5 minijuegos de habilidades.
3. Relámpago del Catatumbo: competencias blandas (G.O. 38.924).
4. Salto Ángel: valores (duelos por pares).
5. Los Roques: mundo laboral y reto «¿Mito o realidad?».
6. Pico Bolívar: carta de navegación, carreras afines y plan de vida en sprints.

Los datos se guardan solo en el navegador (localStorage). El estudiante exporta un `.json` y el orientador lo carga en **Panel del orientador**.
