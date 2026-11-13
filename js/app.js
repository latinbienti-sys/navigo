/* NAVIGO — lógica de la experiencia gamificada */
(function () {
  "use strict";
  const D = window.NAVIGO_DATA;
  const KEY = "navigo.v1";
  const app = document.getElementById("app");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------------- Estado ----------------
  function blank() {
    return { perfil: null, xp: 0, done: {}, insignias: [], intereses: null, aptitudes: {}, competencias: null, valores: null, mitos: null, plan: null, creado: new Date().toISOString() };
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* sin almacenamiento */ }
    return blank();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } }
  let S = load();

  // ---------------- Gamificación ----------------
  const rango = (xp) => D.RANGOS.reduce((r, x) => (xp >= x.min ? x : r), D.RANGOS[0]);
  const nextRango = (xp) => D.RANGOS.find((x) => x.min > xp);

  function hud() {
    const el = $("#hud");
    if (!S.perfil) { el.hidden = true; return; }
    el.hidden = false;
    const r = rango(S.xp), n = nextRango(S.xp);
    $("#hudAvatar").textContent = S.perfil.companero || "🧭";
    $("#hudRank").textContent = r.n;
    $("#hudXp").textContent = S.xp;
    $("#hudBar").style.width = (n ? ((S.xp - r.min) / (n.min - r.min)) * 100 : 100) + "%";
  }
  let toastT;
  function toast(t) {
    const el = $("#toast");
    el.textContent = t; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function confetti() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ffb020", "#0aa5b8", "#ef5b5b", "#1b6fb5", "#1f9d6b", "#b84fd1"];
    for (let i = 0; i < 46; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = Math.random() * 0.5 + "s";
      c.style.animationDuration = 1.4 + Math.random() * 1.2 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }
  function addXp(n, motivo) {
    const antes = rango(S.xp).n;
    S.xp += n; save(); hud();
    const despues = rango(S.xp).n;
    if (despues !== antes) { toast(`¡Ascendiste a ${despues}! (+${n} XP)`); confetti(); }
    else toast(`+${n} XP${motivo ? " · " + motivo : ""}`);
  }
  function badge(nombre) { if (!S.insignias.includes(nombre)) { S.insignias.push(nombre); save(); } }

  // ---------------- Router ----------------
  let cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function every(fn, ms) { const id = setInterval(fn, ms); onCleanup(() => clearInterval(id)); return id; }
  function later(fn, ms) { const id = setTimeout(fn, ms); onCleanup(() => clearTimeout(id)); return id; }
  function listen(target, ev, fn) { target.addEventListener(ev, fn); onCleanup(() => target.removeEventListener(ev, fn)); }

  function go(view, arg) {
    cleanups.forEach((f) => f()); cleanups = [];
    if (!S.perfil && !["inicio", "fundamentos", "orientador"].includes(view)) view = "inicio";
    (VIEWS[view] || VIEWS.mapa)(arg);
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
    hud();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    e.preventDefault();
    go(b.dataset.go, b.dataset.arg);
  });

  const unlocked = (i) => i === 0 || !!S.done[D.ESTACIONES[i - 1].id];
  const est = (id) => D.ESTACIONES.find((e) => e.id === id);
  const backBtn = () => `<button class="back no-print" data-go="mapa">← Volver al mapa</button>`;
  const stHead = (e, extra = "") => `
    <div class="st-head" style="--c:${e.color}">
      <div class="lugar">${e.icono} ${esc(e.lugar)}</div>
      <h2>${esc(e.titulo)}</h2>
      <p style="margin:0">${esc(e.desc)}</p>${extra}
    </div>`;

  function finishStation(id, html) {
    const e = est(id);
    const first = !S.done[id];
    if (first) { S.done[id] = true; badge(e.titulo); save(); addXp(e.xp, "estación completada"); confetti(); }
    app.innerHTML = `${backBtn()}${stHead(e)}
      <div class="card stack">
        <h3>${first ? "🏅 ¡Insignia desbloqueada: " + esc(e.titulo) + "!" : "Tus resultados"}</h3>
        ${html}
        <div class="row no-print">
          <button class="btn" data-go="mapa">Seguir navegando →</button>
          <button class="btn ghost" data-go="${id}" data-arg="repetir">Repetir estación</button>
        </div>
      </div>`;
  }

  // ---------------- Vistas ----------------
  const VIEWS = {};

  // ===== Inicio / registro =====
  VIEWS.inicio = function () {
    const p = S.perfil || { nombre: "", edad: "", anio: "", companero: "", hobbies: [], materias: [] };
    const tmp = { companero: p.companero, hobbies: p.hobbies.slice(), materias: p.materias.slice() };
    app.innerHTML = `
      <section class="hero">
        <svg class="mountains" viewBox="0 0 400 160" aria-hidden="true"><path d="M0 160 L70 60 L110 100 L170 20 L230 110 L270 70 L330 130 L400 80 L400 160Z" fill="#fff"/><path d="M160 34 L170 20 L182 38 L176 34 L170 40Z" fill="#0f4c81"/></svg>
        <h1>Navega hacia tu talento</h1>
        <p>Navigo es una ruta de juego por Venezuela —de la Sierra Nevada de Mérida al Pico Bolívar— donde descubres tus <b>intereses</b>, <b>habilidades</b>, <b>valores</b> y <b>comportamientos</b>, y los conectas con las oportunidades reales del mundo laboral.</p>
        <p class="small" style="opacity:.85">Duración aproximada: 25–35 minutos · Puedes pausar y continuar cuando quieras.</p>
      </section>

      <div class="grid g3 pillars">
        ${[["🧭", "Intereses", "Qué te apasiona (modelo RIASEC de Holland)."],
           ["🎮", "Habilidades", "Minijuegos de memoria, lógica, lenguaje, cálculo y creatividad."],
           ["⚡", "Comportamientos", "Situaciones reales que revelan tus habilidades blandas."],
           ["💎", "Valores", "Lo que más te importa para tu proyecto de vida."]]
          .map(([i, t, d]) => `<div class="card pillar"><span class="ico">${i}</span><div><b>${t}</b><div class="muted small">${d}</div></div></div>`).join("")}
      </div>

      <form class="card" id="reg" style="margin-top:22px">
        <h2>${S.perfil ? "Edita tu bitácora" : "Prepara tu bitácora de viaje"}</h2>
        <p class="muted small">Solo pedimos lo mínimo. Tus datos se guardan únicamente en este dispositivo.</p>
        <div class="grid g3">
          <label class="field">¿Cómo te llamamos?
            <input name="nombre" maxlength="30" required placeholder="Tu nombre o apodo" value="${esc(p.nombre)}">
          </label>
          <label class="field">Edad
            <select name="edad" required>
              <option value="">Elige…</option>
              ${[12, 13, 14, 15, 16, 17, 18, 19].map((n) => `<option ${String(p.edad) === String(n) ? "selected" : ""}>${n}</option>`).join("")}
            </select>
          </label>
          <label class="field">Año que cursas
            <select name="anio" required>
              <option value="">Elige…</option>
              ${["1er año", "2do año", "3er año", "4to año", "5to año", "6to año (técnica)", "Ya me gradué"].map((n) => `<option ${p.anio === n ? "selected" : ""}>${n}</option>`).join("")}
            </select>
          </label>
        </div>

        <h3>Elige tu compañero de viaje</h3>
        <div class="companions" id="comps">
          ${D.COMPANEROS.map((c) => `<button type="button" class="comp" data-e="${c.e}" aria-pressed="${tmp.companero === c.e}"><span class="e">${c.e}</span>${c.n}</button>`).join("")}
        </div>

        <h3 style="margin-top:18px">¿Qué te gusta hacer en tu tiempo libre?</h3>
        <div class="row" id="hob">${D.HOBBIES.map((h) => `<button type="button" class="chip" data-v="${esc(h)}" aria-pressed="${tmp.hobbies.includes(h)}">${esc(h)}</button>`).join("")}</div>

        <h3 style="margin-top:18px">Tus materias favoritas <span class="muted small">(hasta 3)</span></h3>
        <div class="row" id="mat">${D.MATERIAS.map((h) => `<button type="button" class="chip" data-v="${esc(h)}" aria-pressed="${tmp.materias.includes(h)}">${esc(h)}</button>`).join("")}</div>

        <div class="row" style="margin-top:22px">
          <button class="btn sun" type="submit">${S.perfil ? "Guardar y volver al mapa" : "⛵ Zarpar"}</button>
          <span class="muted small" id="regMsg"></span>
        </div>
      </form>`;

    $("#comps").addEventListener("click", (e) => {
      const b = e.target.closest(".comp"); if (!b) return;
      tmp.companero = b.dataset.e;
      $$("#comps .comp").forEach((x) => x.setAttribute("aria-pressed", x === b));
    });
    function toggler(sel, list, max) {
      $(sel).addEventListener("click", (e) => {
        const b = e.target.closest(".chip"); if (!b) return;
        const v = b.dataset.v, i = list.indexOf(v);
        if (i >= 0) list.splice(i, 1);
        else { if (max && list.length >= max) { toast(`Máximo ${max} materias`); return; } list.push(v); }
        b.setAttribute("aria-pressed", list.includes(v));
      });
    }
    toggler("#hob", tmp.hobbies); toggler("#mat", tmp.materias, 3);
    $("#reg").addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      if (!tmp.companero) { $("#regMsg").textContent = "Elige un compañero de viaje 🙂"; return; }
      const nuevo = !S.perfil;
      S.perfil = { nombre: f.get("nombre").trim(), edad: f.get("edad"), anio: f.get("anio"), companero: tmp.companero, hobbies: tmp.hobbies, materias: tmp.materias };
      save();
      if (nuevo) { badge("Zarpaste"); addXp(50, "¡A bordo!"); }
      go("mapa");
    });
  };

  // ===== Mapa =====
  const POS_WIDE = [[12, 74], [29, 30], [47, 70], [64, 30], [80, 70], [88, 26]];
  const POS_NARROW = [[26, 89], [72, 75], [28, 59], [72, 43], [28, 27], [70, 11]];
  VIEWS.mapa = function () {
    const narrow = window.innerWidth <= 640;
    const pos = narrow ? POS_NARROW : POS_WIDE;
    const doneCount = D.ESTACIONES.filter((e) => S.done[e.id]).length;
    const nextIdx = D.ESTACIONES.findIndex((e) => !S.done[e.id]);
    const d = pos.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `Q${(pos[i - 1][0] + p[0]) / 2 + (i % 2 ? -8 : 8)} ${(pos[i - 1][1] + p[1]) / 2} ${p[0]} ${p[1]}`)).join(" ");
    const r = rango(S.xp), n = nextRango(S.xp);

    app.innerHTML = `
      <div class="row" style="justify-content:space-between;margin-bottom:14px">
        <div>
          <h2 style="margin:0">¡Hola, ${esc(S.perfil.nombre)}! ${S.perfil.companero}</h2>
          <div class="muted">${doneCount === D.ESTACIONES.length ? "Completaste la ruta. ¡Eres parte de la tripulación de Navigo!" : `Estación ${doneCount + 1} de ${D.ESTACIONES.length} · Rango <b>${r.n}</b>${n ? ` · faltan ${n.min - S.xp} XP para ${n.n}` : ""}`}</div>
        </div>
        <button class="btn ghost sm" data-go="inicio">✏️ Mi bitácora</button>
      </div>
      <div class="map-wrap">
        <div class="map" role="group" aria-label="Mapa de la ruta Navigo">
          <svg class="route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 ${narrow ? 6 : 12} q 10 -3 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#fff" stroke-opacity=".35" vector-effect="non-scaling-stroke" stroke-width="2"/>
            <path d="M0 ${narrow ? 97 : 94} q 10 -3 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#fff" stroke-opacity=".35" vector-effect="non-scaling-stroke" stroke-width="2"/>
            <path d="${d}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 10" vector-effect="non-scaling-stroke"/>
          </svg>
          ${D.ESTACIONES.map((e, i) => {
            const cls = [S.done[e.id] ? "done" : "", !unlocked(i) ? "locked" : "", i === nextIdx ? "next" : ""].join(" ");
            return `<button class="node ${cls}" style="left:${pos[i][0]}%;top:${pos[i][1]}%;--c:${e.color}" data-station="${e.id}" data-i="${i}" aria-label="${esc(e.titulo)} en ${esc(e.lugar)}${unlocked(i) ? "" : " (bloqueada)"}">
              <span class="bubble">${unlocked(i) ? e.icono : "🔒"}</span>
              <span class="lbl">${esc(e.lugar)}</span>
            </button>`;
          }).join("")}
        </div>
      </div>

      <div class="grid g2 stations">
        ${D.ESTACIONES.map((e, i) => `
          <button class="card station-card ${unlocked(i) ? "" : "locked"}" style="--c:${e.color}" data-station="${e.id}" data-i="${i}">
            <span class="ico">${e.icono}</span>
            <span>
              <b>${i + 1}. ${esc(e.titulo)}</b> ${S.done[e.id] ? '<span class="tag emergente">Completada</span>' : unlocked(i) ? '<span class="tag consolidada">Disponible</span>' : ""}
              <div class="muted small">${esc(e.lugar)} · +${e.xp} XP</div>
              <div class="small">${esc(e.desc)}</div>
            </span>
          </button>`).join("")}
      </div>

      <div class="card" style="margin-top:18px">
        <h3>Insignias</h3>
        <div class="badges">${S.insignias.length ? S.insignias.map((b) => `<span class="badge">🏅 ${esc(b)}</span>`).join("") : '<span class="muted">Aún no tienes insignias. ¡Completa tu primera estación!</span>'}</div>
      </div>`;

    $$("[data-station]", app).forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.i;
      if (!unlocked(i)) { toast(`Primero completa: ${D.ESTACIONES[i - 1].titulo}`); return; }
      go(b.dataset.station);
    }));
    let lastNarrow = narrow;
    listen(window, "resize", () => { const nw = window.innerWidth <= 640; if (nw !== lastNarrow) { lastNarrow = nw; go("mapa"); } });
  };

  // ===== 1. Intereses (RIASEC) =====
  VIEWS.intereses = function (arg) {
    const e = est("intereses");
    if (S.intereses && arg !== "repetir") return resultadoIntereses();
    const resp = [];
    let i = 0;
    function render() {
      if (i >= D.INTERESES.length) return terminar();
      const it = D.INTERESES[i];
      app.innerHTML = `${backBtn()}${stHead(e)}
        <div class="swipe">
          <div class="row" style="justify-content:space-between"><b>Carta ${i + 1} de ${D.INTERESES.length}</b>${i > 0 ? '<button class="btn ghost sm" id="undo">↶ Deshacer</button>' : ""}</div>
          <div class="progress" style="margin:8px 0 14px"><span style="width:${(i / D.INTERESES.length) * 100}%"></span></div>
          <p class="muted center small">¿Te gustaría…</p>
          <div class="card swipe-card">${esc(it.t)}</div>
          <div class="swipe-actions">
            <button class="btn no" data-v="0"><span class="e">🙅</span>No es lo mío</button>
            <button class="btn meh" data-v="1"><span class="e">🤔</span>Más o menos</button>
            <button class="btn yes" data-v="2"><span class="e">😍</span>¡Me encanta!</button>
          </div>
          <p class="muted center small" style="margin-top:10px">Atajos de teclado: 1, 2, 3</p>
        </div>`;
      $$(".swipe-actions .btn").forEach((b) => b.addEventListener("click", () => pick(+b.dataset.v)));
      const u = $("#undo"); if (u) u.addEventListener("click", () => { resp.pop(); i--; render(); });
    }
    function pick(v) { resp.push(v); i++; render(); }
    listen(document, "keydown", (ev) => { if (["1", "2", "3"].includes(ev.key) && i < D.INTERESES.length) pick(+ev.key - 1); });
    function terminar() {
      const sum = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, cnt = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
      D.INTERESES.forEach((it, k) => { sum[it.k] += resp[k]; cnt[it.k] += 2; });
      S.intereses = {}; Object.keys(sum).forEach((k) => (S.intereses[k] = Math.round((sum[k] / cnt[k]) * 100)));
      save();
      resultadoIntereses();
    }
    render();
  };
  function hollandCode() {
    return Object.entries(S.intereses).sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]).join("");
  }
  function resultadoIntereses() {
    const code = hollandCode();
    finishStation("intereses", `
      <p>Tu código de intereses es <b class="code" style="font-size:2rem">${code}</b></p>
      ${radar(S.intereses)}
      <div class="grid g3">${[...code].map((k) => `<div class="card" style="border-top:5px solid ${D.RIASEC[k].color}"><b>${D.RIASEC[k].nombre} · «${D.RIASEC[k].alias}»</b><div class="small">${D.RIASEC[k].desc}</div></div>`).join("")}</div>`);
  }

  function radar(vals) {
    const keys = ["R", "I", "A", "S", "E", "C"], cx = 160, cy = 150, R = 105;
    const pt = (i, v) => { const a = (-90 + i * 60) * Math.PI / 180; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
    const ring = (v) => keys.map((_, i) => pt(i, v).join(",")).join(" ");
    const poly = keys.map((k, i) => pt(i, Math.max(0.04, (vals[k] || 0) / 100)).join(",")).join(" ");
    return `<svg class="radar" viewBox="0 0 320 300" role="img" aria-label="Gráfico de intereses RIASEC: ${keys.map((k) => D.RIASEC[k].nombre + " " + (vals[k] || 0) + "%").join(", ")}">
      ${[0.25, 0.5, 0.75, 1].map((v) => `<polygon points="${ring(v)}" fill="none" stroke="var(--line)" stroke-width="1"/>`).join("")}
      ${keys.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`; }).join("")}
      <polygon points="${poly}" fill="var(--teal)" fill-opacity=".28" stroke="var(--teal)" stroke-width="2.5" stroke-linejoin="round"/>
      ${keys.map((k, i) => { const [x, y] = pt(i, Math.max(0.04, (vals[k] || 0) / 100)); return `<circle cx="${x}" cy="${y}" r="4.5" fill="${D.RIASEC[k].color}"/>`; }).join("")}
      ${keys.map((k, i) => { const [x, y] = pt(i, 1.2); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="800" fill="var(--ink)">${D.RIASEC[k].nombre}</text><text x="${x}" y="${y + 14}" text-anchor="middle" font-size="11" fill="var(--muted)">${vals[k] || 0}%</text>`; }).join("")}
    </svg>`;
  }

  // ===== 2. Habilidades (minijuegos) =====
  const JUEGOS = [
    { id: "memoria", t: "Memoria de la Sierra", i: "🃏", d: "Encuentra las parejas con la menor cantidad de intentos." },
    { id: "logica", t: "Secuencias del médano", i: "🧩", d: "Completa series y razonamientos. 90 segundos." },
    { id: "verbal", t: "Palabras en el viento", i: "📝", d: "Analogías, sinónimos y lenguaje. 90 segundos." },
    { id: "numerica", t: "Cálculo relámpago", i: "➗", d: "Resuelve todas las operaciones que puedas en 60 segundos." },
    { id: "creatividad", t: "La tapara mágica", i: "💡", d: "¿Cuántos usos distintos se te ocurren? 75 segundos." }
  ];
  VIEWS.habilidades = function (arg) {
    const e = est("habilidades");
    if (arg === "repetir") { S.aptitudes = {}; save(); }
    const hechos = JUEGOS.filter((j) => S.aptitudes[j.id] != null).length;
    if (hechos === JUEGOS.length && arg !== "hub") return resultadoHabilidades();
    app.innerHTML = `${backBtn()}${stHead(e, `<div class="progress" style="margin-top:12px;background:rgba(255,255,255,.3)"><span style="width:${(hechos / JUEGOS.length) * 100}%;background:#fff"></span></div>`)}
      <div class="grid g2 games">
        ${JUEGOS.map((j) => `<button class="card game-tile" data-game="${j.id}">
          <div style="font-size:2rem">${j.i}</div><b>${j.t}</b>
          <div class="muted small">${j.d}</div>
          ${S.aptitudes[j.id] != null ? `<div class="score">✓ Puntaje: ${S.aptitudes[j.id]}/100 · Jugar otra vez</div>` : '<div class="small"><b>▶ Jugar</b></div>'}
        </button>`).join("")}
      </div>`;
    $$("[data-game]").forEach((b) => b.addEventListener("click", () => GAMES[b.dataset.game]()));
  };
  function gameDone(id, score, msg) {
    S.aptitudes[id] = Math.round(clamp(score, 0, 100)); save();
    addXp(20, "minijuego");
    const faltan = JUEGOS.filter((j) => S.aptitudes[j.id] == null);
    app.innerHTML = `${backBtn()}${stHead(est("habilidades"))}
      <div class="card center stack">
        <div style="font-size:3rem">🎯</div>
        <h2>${S.aptitudes[id]}/100</h2>
        <p>${msg}</p>
        <div class="row" style="justify-content:center">
          ${faltan.length ? `<button class="btn" id="nextG">Siguiente desafío: ${faltan[0].t} →</button>` : `<button class="btn sun" id="fin">Ver mis habilidades 🏅</button>`}
          <button class="btn ghost" id="hub">Ver todos los desafíos</button>
        </div>
      </div>`;
    if (faltan.length) $("#nextG").addEventListener("click", () => GAMES[faltan[0].id]());
    else $("#fin").addEventListener("click", () => resultadoHabilidades());
    $("#hub").addEventListener("click", () => go("habilidades", "hub"));
  }
  function gameShell(j, inner) {
    cleanups.forEach((f) => f()); cleanups = [];
    app.innerHTML = `<button class="back" id="toHub">← Desafíos</button>
      <div class="card stack"><div class="row" style="justify-content:space-between"><h2 style="margin:0">${j.i} ${j.t}</h2><span class="timer" id="timer"></span></div>${inner}</div>`;
    $("#toHub").addEventListener("click", () => go("habilidades", "hub"));
    window.scrollTo(0, 0);
  }
  function countdown(secs, onEnd) {
    let s = secs; const el = $("#timer"); el.textContent = s + "s";
    every(() => { s--; el.textContent = Math.max(0, s) + "s"; if (s <= 0) { cleanups.forEach((f) => f()); cleanups = []; onEnd(); } }, 1000);
  }
  const GAMES = {
    memoria() {
      const j = JUEGOS[0];
      const deck = shuffle(D.MEMORIA_FICHAS.concat(D.MEMORIA_FICHAS));
      gameShell(j, `<p class="muted">Intentos: <b id="moves">0</b> · Parejas: <b id="pairs">0</b>/6</p>
        <div class="mem-grid">${deck.map((f, k) => `<button class="mem" data-k="${k}" aria-label="Carta ${k + 1}">${f}</button>`).join("")}</div>`);
      let open = [], moves = 0, pairs = 0, lock = false;
      $$(".mem").forEach((b) => b.addEventListener("click", () => {
        if (lock || b.classList.contains("open") || b.classList.contains("ok")) return;
        b.classList.add("open"); open.push(b);
        if (open.length === 2) {
          moves++; $("#moves").textContent = moves; lock = true;
          const [a, c] = open;
          if (deck[a.dataset.k] === deck[c.dataset.k]) {
            a.classList.replace("open", "ok"); c.classList.replace("open", "ok"); open = []; lock = false; pairs++;
            $("#pairs").textContent = pairs;
            if (pairs === 6) later(() => gameDone("memoria", 100 - (moves - 6) * 7, `Completaste el tablero en ${moves} intentos. ¡Buena memoria visual!`), 500);
          } else {
            later(() => { a.classList.remove("open"); c.classList.remove("open"); open = []; lock = false; }, 750);
          }
        }
      }));
    },
    logica() { quizGame(JUEGOS[1], D.LOGICA, "logica"); },
    verbal() { quizGame(JUEGOS[2], D.VERBAL, "verbal"); },
    numerica() {
      const j = JUEGOS[3];
      let ok = 0, tot = 0, cur;
      function gen() {
        const op = ["+", "−", "×"][Math.floor(Math.random() * 3)];
        let a, b, r;
        if (op === "+") { a = 10 + Math.floor(Math.random() * 80); b = 5 + Math.floor(Math.random() * 60); r = a + b; }
        else if (op === "−") { a = 30 + Math.floor(Math.random() * 70); b = 5 + Math.floor(Math.random() * (a - 5)); r = a - b; }
        else { a = 2 + Math.floor(Math.random() * 11); b = 2 + Math.floor(Math.random() * 9); r = a * b; }
        cur = { t: `${a} ${op} ${b}`, r };
        $("#mq").textContent = cur.t; $("#mi").value = ""; $("#mi").focus();
      }
      gameShell(j, `<p class="muted center">Escribe el resultado y presiona Enter. Correctas: <b id="mok">0</b></p>
        <div class="math-q" id="mq"></div>
        <form id="mf"><input class="math-in" id="mi" inputmode="numeric" autocomplete="off" aria-label="Resultado"></form>
        <div class="row" style="justify-content:center"><button class="btn ghost sm" id="skip" type="button">Saltar</button></div>`);
      gen();
      $("#mf").addEventListener("submit", (ev) => {
        ev.preventDefault(); tot++;
        if (parseInt($("#mi").value, 10) === cur.r) { ok++; $("#mok").textContent = ok; }
        gen();
      });
      $("#skip").addEventListener("click", () => { tot++; gen(); });
      countdown(60, () => gameDone("numerica", (ok / 12) * 100 - Math.max(0, tot - ok - 3) * 3, `Resolviste ${ok} operaciones correctas de ${tot} intentadas en 60 segundos.`));
    },
    creatividad() {
      const j = JUEGOS[4];
      const ideas = [];
      gameShell(j, `<p>Una <b>tapara</b> (totuma) es el fruto seco del taparo. ¿Para cuántas cosas diferentes se podría usar? Escribe cada idea y presiona Enter. ¡Vale todo lo original!</p>
        <form id="cf" class="addtask"><input id="ci" maxlength="60" placeholder="Ej.: una maraca" autocomplete="off" aria-label="Nueva idea"><button class="btn sm">Agregar</button></form>
        <div class="ideas" id="cl"></div>
        <div class="row"><b>Ideas: <span id="cn">0</span></b><button class="btn ghost sm" id="cend" type="button">Terminar</button></div>`);
      $("#ci").focus();
      $("#cf").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const v = $("#ci").value.trim(), low = v.toLowerCase();
        if (v.length >= 3 && !ideas.some((x) => x.toLowerCase() === low)) {
          ideas.push(v); $("#cl").insertAdjacentHTML("beforeend", `<span class="chip">💡 ${esc(v)}</span>`); $("#cn").textContent = ideas.length;
        }
        $("#ci").value = ""; $("#ci").focus();
      });
      const end = () => gameDone("creatividad", (ideas.length / 10) * 100, `Generaste ${ideas.length} ideas diferentes. La fluidez de ideas es una señal de pensamiento creativo.`);
      $("#cend").addEventListener("click", () => { cleanups.forEach((f) => f()); cleanups = []; end(); });
      countdown(75, end);
    }
  };
  function quizGame(j, preguntas, id) {
    const qs = shuffle(preguntas);
    let k = 0, ok = 0, busy = false;
    gameShell(j, `<div class="progress"><span id="qp" style="width:0"></span></div><h3 id="qq"></h3><div class="opts" id="qo"></div>`);
    function show() {
      if (k >= qs.length) return fin();
      const q = qs[k];
      $("#qp").style.width = (k / qs.length) * 100 + "%";
      $("#qq").textContent = q.q;
      $("#qo").innerHTML = q.o.map((o, n) => `<button class="opt" data-n="${n}">${esc(o)}</button>`).join("");
      busy = false;
      $$("#qo .opt").forEach((b) => b.addEventListener("click", () => {
        if (busy) return; busy = true;
        const n = +b.dataset.n;
        if (n === q.a) { ok++; b.classList.add("right"); } else { b.classList.add("wrong"); $$("#qo .opt")[q.a].classList.add("right"); }
        k++; later(show, 650);
      }));
    }
    function fin() { cleanups.forEach((f) => f()); cleanups = []; gameDone(id, (ok / qs.length) * 100, `Acertaste ${ok} de ${qs.length}.`); }
    countdown(90, fin);
    show();
  }
  function bars(obj, meta, colorFn) {
    return `<div class="bars">${Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      `<div class="bar-row"><span>${esc(meta[k].corto || meta[k].nombre)}</span><div class="bar"><span style="width:${v}%;background:${colorFn(k)}"></span></div><span>${v}</span></div>`).join("")}</div>`;
  }
  function resultadoHabilidades() {
    const top = Object.entries(S.aptitudes).sort((a, b) => b[1] - a[1])[0];
    finishStation("habilidades", `
      <p>Tu habilidad más destacada en esta ruta: <b>${D.APTITUDES[top[0]].nombre}</b>.</p>
      ${bars(S.aptitudes, D.APTITUDES, (k) => D.APTITUDES[k].color)}
      <p class="muted small">Estos minijuegos son una muestra rápida, no un test psicométrico. Las habilidades se entrenan: ¡practicar mejora el puntaje!</p>`);
  }

  // ===== 3. Competencias (escenarios) =====
  VIEWS.competencias = function (arg) {
    const e = est("competencias");
    if (S.competencias && arg !== "repetir") return resultadoCompetencias();
    const pts = {}; Object.keys(D.COMPETENCIAS).forEach((k) => (pts[k] = 0));
    let i = 0;
    function render() {
      if (i >= D.ESCENARIOS.length) return terminar();
      const sc = D.ESCENARIOS[i];
      const opts = shuffle(sc.o);
      app.innerHTML = `${backBtn()}${stHead(e)}
        <div class="card stack" style="max-width:720px;margin:0 auto">
          <div class="row" style="justify-content:space-between"><b>Situación ${i + 1} de ${D.ESCENARIOS.length}</b><span class="muted small">No hay respuestas malas: elige lo que realmente harías.</span></div>
          <div class="progress"><span style="width:${(i / D.ESCENARIOS.length) * 100}%;background:${e.color}"></span></div>
          <h3>⚡ ${esc(sc.s)}</h3>
          <div class="opts">${opts.map((o, n) => `<button class="opt" data-n="${n}">${esc(o.t)}</button>`).join("")}</div>
        </div>`;
      $$(".opt").forEach((b) => b.addEventListener("click", () => {
        Object.entries(opts[+b.dataset.n].p).forEach(([k, v]) => (pts[k] += v));
        i++; render();
      }));
    }
    function terminar() {
      const max = {}; Object.keys(D.COMPETENCIAS).forEach((k) => (max[k] = 0));
      D.ESCENARIOS.forEach((sc) => Object.keys(max).forEach((k) => (max[k] += Math.max(...sc.o.map((o) => o.p[k] || 0)))));
      const scores = {}; Object.keys(max).forEach((k) => (scores[k] = max[k] ? Math.round((pts[k] / max[k]) * 100) : 0));
      S.competencias = { scores }; save();
      resultadoCompetencias();
    }
    render();
  };
  function resultadoCompetencias() {
    const top = Object.entries(S.competencias.scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
    finishStation("competencias", `
      <p>Tus habilidades blandas más fuertes: ${top.map(([k]) => `<b>${D.COMPETENCIAS[k].corto}</b>`).join(", ")}.</p>
      ${bars(S.competencias.scores, D.COMPETENCIAS, () => "#7a5af5")}
      <p class="muted small">Las competencias provienen del Manual Descriptivo de Competencias Genéricas (Gaceta Oficial N.º 38.924), que usan las organizaciones venezolanas para seleccionar talento. Conocerlas desde el liceo te da ventaja.</p>`);
  }

  // ===== 4. Valores (duelos) =====
  VIEWS.valores = function (arg) {
    const e = est("valores");
    if (S.valores && arg !== "repetir") return resultadoValores();
    const keys = Object.keys(D.VALORES);
    const pairs = [];
    keys.forEach((k, i) => { pairs.push([k, keys[(i + 1) % 8]]); pairs.push([k, keys[(i + 3) % 8]]); });
    const order = shuffle(pairs).map((p) => (Math.random() < 0.5 ? p : [p[1], p[0]]));
    const wins = {}; keys.forEach((k) => (wins[k] = 0));
    let i = 0;
    function render() {
      if (i >= order.length) return terminar();
      const [a, b] = order[i];
      app.innerHTML = `${backBtn()}${stHead(e)}
        <div class="card stack">
          <div class="row" style="justify-content:space-between"><b>Duelo ${i + 1} de ${order.length}</b><span class="muted small">En tu futuro trabajo, ¿qué pesa más para ti?</span></div>
          <div class="progress"><span style="width:${(i / order.length) * 100}%;background:${e.color}"></span></div>
          <div class="duel">
            <button class="duel-opt" data-v="${a}"><span class="e">${D.VALORES[a].icono}</span>${esc(D.VALORES[a].nombre)}</button>
            <span class="vs">o</span>
            <button class="duel-opt" data-v="${b}"><span class="e">${D.VALORES[b].icono}</span>${esc(D.VALORES[b].nombre)}</button>
          </div>
        </div>`;
      $$(".duel-opt").forEach((btn) => btn.addEventListener("click", () => { wins[btn.dataset.v]++; i++; render(); }));
    }
    function terminar() {
      const scores = {}; keys.forEach((k) => (scores[k] = Math.round((wins[k] / 4) * 100)));
      S.valores = { scores, orden: keys.slice().sort((x, y) => scores[y] - scores[x]) }; save();
      resultadoValores();
    }
    render();
  };
  function resultadoValores() {
    finishStation("valores", `
      <p>Así quedó tu brújula de valores, de lo más importante a lo menos:</p>
      <ol class="rank-list">${S.valores.orden.map((k) => `<li>${D.VALORES[k].icono} ${esc(D.VALORES[k].nombre)} <span class="muted small">(${S.valores.scores[k]}%)</span></li>`).join("")}</ol>
      <p class="muted small">Tus valores no dicen «qué carrera», sino «cómo» quieres vivirla: en qué tipo de lugar, con qué ritmo y para qué.</p>`);
  }

  // ===== 5. Mundo laboral =====
  VIEWS.mundo = function (arg) {
    const e = est("mundo");
    let filtro = "todas", tipo = "todas";
    function explorer() {
      const list = D.CARRERAS.filter((c) => (filtro === "todas" || c.code.includes(filtro)) && (tipo === "todas" || c.tag === tipo));
      return list.map((c) => `<div class="card career"><div class="row" style="justify-content:space-between"><b>${esc(c.n)}</b><span class="tag ${c.tag}">${c.tag}</span></div><div class="small">${esc(c.d)}</div><div class="where">📍 ${c.donde.map(esc).join(" · ")}</div><div class="small muted">Intereses: ${[...c.code].map((k) => D.RIASEC[k].nombre).join(", ")}</div></div>`).join("") || '<p class="muted">No hay carreras con ese filtro.</p>';
    }
    app.innerHTML = `${backBtn()}${stHead(e)}
      <h3>🌐 Tendencias que mueven el mundo del trabajo</h3>
      <div class="grid g3">${D.TENDENCIAS.map((t) => `<div class="card"><b>${esc(t.t)}</b><p class="small" style="margin:.4em 0">${esc(t.d)}</p><span class="muted small">Fuente: ${esc(t.f)}</span></div>`).join("")}</div>

      <div class="card stack" style="margin-top:20px" id="mitos"></div>

      <h3 style="margin-top:24px">🔎 Explora carreras y oficios</h3>
      <div class="row" id="fR">${["todas", "R", "I", "A", "S", "E", "C"].map((k) => `<button class="chip" data-f="${k}" aria-pressed="${k === "todas"}">${k === "todas" ? "Todos los intereses" : D.RIASEC[k].nombre}</button>`).join("")}</div>
      <div class="row" id="fT" style="margin-top:8px">${["todas", "emergente", "consolidada", "oficio"].map((k) => `<button class="chip" data-t="${k}" aria-pressed="${k === "todas"}">${k === "todas" ? "Todos los tipos" : k}</button>`).join("")}</div>
      <div class="grid g3" id="exp" style="margin-top:14px">${explorer()}</div>
      <p class="muted small" style="margin-top:10px">La oferta académica cambia: confirma carreras y requisitos en el sitio de cada universidad y en el Sistema Nacional de Ingreso (OPSU).</p>`;

    $("#fR").addEventListener("click", (ev) => { const b = ev.target.closest(".chip"); if (!b) return; filtro = b.dataset.f; $$("#fR .chip").forEach((x) => x.setAttribute("aria-pressed", x === b)); $("#exp").innerHTML = explorer(); });
    $("#fT").addEventListener("click", (ev) => { const b = ev.target.closest(".chip"); if (!b) return; tipo = b.dataset.t; $$("#fT .chip").forEach((x) => x.setAttribute("aria-pressed", x === b)); $("#exp").innerHTML = explorer(); });

    // Reto ¿Mito o realidad?
    const box = $("#mitos");
    let k = 0, ok = 0;
    function mito() {
      if (S.mitos && arg !== "repetir" && k === 0) {
        box.innerHTML = `<h3>🏝️ Reto «¿Mito o realidad?»</h3><p>Ya superaste el reto con <b>${S.mitos.ok}/${D.MITOS.length}</b>. ¡Insignia guardada!</p><div><button class="btn ghost sm" id="rep">Jugar otra vez</button></div>`;
        $("#rep").addEventListener("click", () => { arg = "repetir"; mito(); });
        return;
      }
      if (k >= D.MITOS.length) {
        S.mitos = { ok }; save();
        if (!S.done.mundo) addXp(ok * 10, "respuestas correctas");
        box.innerHTML = `<h3>🏝️ Reto completado: ${ok}/${D.MITOS.length}</h3><p>Ahora conoces mejor el mundo laboral que te espera.</p><div class="row"><button class="btn sun" id="fm">Reclamar insignia y continuar →</button></div>`;
        $("#fm").addEventListener("click", () => finishStation("mundo", `<p>Superaste el reto «¿Mito o realidad?» con ${ok}/${D.MITOS.length} aciertos y exploraste las tendencias del trabajo hacia 2030.</p><p class="small muted">Recuerda: en tu carta de navegación verás qué carreras encajan mejor con tu perfil.</p>`));
        return;
      }
      const m = D.MITOS[k];
      box.innerHTML = `<div class="row" style="justify-content:space-between"><h3 style="margin:0">🏝️ Reto «¿Mito o realidad?»</h3><b>${k + 1}/${D.MITOS.length}</b></div>
        <p style="font-size:1.15rem;font-weight:700">${esc(m.q)}</p>
        <div class="row"><button class="btn" data-a="1">✅ Realidad</button><button class="btn ghost" data-a="0">❌ Mito</button></div><div id="mf"></div>`;
      $$("[data-a]", box).forEach((b) => b.addEventListener("click", () => {
        const right = (b.dataset.a === "1") === m.a;
        if (right) ok++;
        $$("[data-a]", box).forEach((x) => (x.disabled = true));
        $("#mf").innerHTML = `<p style="margin-top:12px"><b>${right ? "¡Correcto! 🎉" : "Casi…"}</b> ${esc(m.e)}</p><button class="btn sm" id="mn">Siguiente</button>`;
        $("#mn").addEventListener("click", () => { k++; mito(); });
      }));
    }
    mito();
  };

  // ===== 6. Carta de navegación =====
  function matches() {
    const r = S.intereses, a = S.aptitudes, c = S.competencias.scores, v = S.valores.scores, w = [3, 2, 1];
    return D.CARRERAS.map((k) => {
      const rs = [...k.code].reduce((s, L, i) => s + (r[L] || 0) * w[i], 0) / 6;
      const as = avg(k.apt.map((x) => a[x] || 0));
      const cs = avg(k.comp.map((x) => c[x] || 0));
      const vs = avg(k.val.map((x) => v[x] || 0));
      return Object.assign({}, k, { score: Math.round(0.55 * rs + 0.2 * as + 0.15 * vs + 0.1 * cs), rs, as, vs, cs });
    }).sort((x, y) => y.score - x.score);
  }
  function planInicial(top) {
    const comp = Object.entries(S.competencias.scores).sort((a, b) => a[1] - b[1])[0][0];
    const apt = Object.entries(S.aptitudes).sort((a, b) => b[1] - a[1])[0][0];
    const t = (txt) => ({ id: Math.random().toString(36).slice(2, 9), t: txt, col: 0, xp: false });
    return {
      sprint: 1,
      cerradas: 0,
      tareas: [
        t(`Conversar mis resultados de Navigo con mi orientador(a)`),
        t(`Investigar el pensum de ${top[0].n}`),
        t(`Entrevistar a un profesional de ${top[1].n} (familia, vecinos, redes)`),
        t(`Revisar requisitos de ingreso en ${top[0].donde[0]}`),
        t(`Practicar 15 min diarios mi fortaleza: ${D.APTITUDES[apt].nombre}`),
        t(`Reto de la semana: fortalecer ${D.COMPETENCIAS[comp].corto} en un trabajo de grupo`),
        t(`Hacer un curso gratuito en línea relacionado con ${top[2].n}`)
      ]
    };
  }
  VIEWS.carta = function () {
    const e = est("carta");
    const faltan = D.ESTACIONES.filter((x) => x.id !== "carta" && !S.done[x.id]);
    if (faltan.length) { toast("Completa primero: " + faltan[0].titulo); return go("mapa"); }
    const first = !S.done.carta;
    if (first) { S.done.carta = true; badge("Cumbre del Pico Bolívar"); save(); addXp(e.xp, "¡Ruta completada!"); confetti(); }
    const top = matches();
    if (!S.plan) { S.plan = planInicial(top); save(); }
    const code = hollandCode();
    const valTop = S.valores.orden.slice(0, 3);
    const compTop = Object.entries(S.competencias.scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]);
    const aptTop = Object.entries(S.aptitudes).sort((a, b) => b[1] - a[1]).slice(0, 2).map((x) => x[0]);
    const compLow = Object.entries(S.competencias.scores).sort((a, b) => a[1] - b[1]).slice(0, 2).map((x) => x[0]);
    const p = S.perfil;

    app.innerHTML = `${backBtn()}
      <div class="st-head" style="--c:${e.color}">
        <div class="lugar">🧭 Pico Bolívar · 4.978 m</div>
        <h1 style="margin:.1em 0">Carta de navegación de ${esc(p.nombre)} ${p.companero}</h1>
        <p style="margin:0">${esc(p.edad)} años · ${esc(p.anio)} · Rango <b>${rango(S.xp).n}</b> · ${S.xp} XP · ${new Date().toLocaleDateString("es-VE")}</p>
      </div>

      <div class="card result-hero">
        <div>
          <div class="muted small" style="font-weight:800;text-transform:uppercase">Tu código de intereses</div>
          <div class="code" style="margin:.2em 0">${code}</div>
          ${[...code].map((k) => `<p><b style="color:${D.RIASEC[k].color}">${D.RIASEC[k].nombre}:</b> ${D.RIASEC[k].desc}</p>`).join("")}
        </div>
        ${radar(S.intereses)}
      </div>

      <div class="card" style="margin-top:16px">
        <h3>✨ Tus talentos, en palabras</h3>
        <p>${esc(p.nombre)}, eres una persona con perfil <b>${D.RIASEC[code[0]].alias.toLowerCase()}</b> y <b>${D.RIASEC[code[1]].alias.toLowerCase()}</b>.
        En los desafíos destacaste en <b>${aptTop.map((k) => D.APTITUDES[k].nombre.toLowerCase()).join("</b> y <b>")}</b>, y frente a situaciones reales sueles mostrar
        <b>${compTop.map((k) => D.COMPETENCIAS[k].corto.toLowerCase()).join("</b>, <b>")}</b>. Para tu vida profesional valoras especialmente
        <b>${valTop.map((k) => D.VALORES[k].nombre.toLowerCase()).join("</b>, <b>")}</b>.
        ${p.materias.length ? `Tus materias favoritas (${p.materias.map(esc).join(", ")}) ` : "Tus gustos "}son pistas que vale la pena seguir.</p>
      </div>

      <div class="grid g3" style="margin-top:16px">
        <div class="card"><h3>🎮 Habilidades</h3>${bars(S.aptitudes, D.APTITUDES, (k) => D.APTITUDES[k].color)}</div>
        <div class="card"><h3>⚡ Competencias blandas</h3>${bars(S.competencias.scores, D.COMPETENCIAS, () => "#7a5af5")}</div>
        <div class="card"><h3>💎 Valores</h3><ol class="rank-list">${S.valores.orden.map((k) => `<li>${D.VALORES[k].icono} ${esc(D.VALORES[k].nombre)}</li>`).join("")}</ol></div>
      </div>

      <h2 style="margin-top:26px">🎯 Rutas profesionales que encajan contigo</h2>
      <p class="muted">La afinidad combina intereses (55 %), habilidades (20 %), valores (15 %) y competencias (10 %). Úsala para explorar, no para cerrar puertas.</p>
      <div class="grid g3">
        ${top.slice(0, 6).map((c, i) => `<div class="card career">
          <div class="row" style="justify-content:space-between"><span class="match">${c.score}%</span><span class="tag ${c.tag}">${c.tag}</span></div>
          <b>${i + 1}. ${esc(c.n)}</b>
          <div class="small">${esc(c.d)}</div>
          <div class="small muted">Encaja por: ${[...c.code].slice(0, 2).map((k) => D.RIASEC[k].nombre).join(" + ")} · ${c.apt.map((k) => D.APTITUDES[k].nombre.toLowerCase()).join(", ")} · ${c.val.map((k) => D.VALORES[k].nombre.toLowerCase()).join(", ")}</div>
          <div class="where">📍 ${c.donde.map(esc).join(" · ")}</div>
        </div>`).join("")}
      </div>
      <details class="card" style="margin-top:12px"><summary><b>Ver otras ${top.length - 6} opciones ordenadas por afinidad</b></summary>
        <div class="table-wrap"><table><thead><tr><th>Carrera / oficio</th><th>Afinidad</th><th>Tipo</th></tr></thead><tbody>
        ${top.slice(6).map((c) => `<tr><td>${esc(c.n)}</td><td>${c.score}%</td><td><span class="tag ${c.tag}">${c.tag}</span></td></tr>`).join("")}
        </tbody></table></div>
      </details>

      <div class="card" style="margin-top:22px" id="planBox"></div>

      <div class="card" style="margin-top:16px">
        <h3>🗣️ Para conversar con tu orientador(a)</h3>
        <ul>
          <li>¿Qué tienen en común las tres primeras rutas que me salieron? ¿Hay alguna que me sorprenda?</li>
          <li>¿Mis valores principales (${valTop.map((k) => D.VALORES[k].nombre.toLowerCase()).join(", ")}) se cumplen en esas carreras en Venezuela hoy?</li>
          <li>¿Cómo puedo fortalecer <b>${compLow.map((k) => D.COMPETENCIAS[k].corto.toLowerCase()).join("</b> y <b>")}</b> antes de graduarme?</li>
          <li>¿Qué opciones cortas (TSU, oficios, cursos) me permiten empezar mientras estudio?</li>
        </ul>
      </div>

      <div class="row no-print" style="margin-top:20px">
        <button class="btn" id="print">🖨️ Imprimir / guardar PDF</button>
        <button class="btn ghost" id="export">📤 Exportar para mi orientador(a)</button>
        <button class="btn ghost" id="reset">↺ Empezar una nueva ruta</button>
      </div>`;

    renderPlan();
    $("#print").addEventListener("click", () => window.print());
    $("#export").addEventListener("click", () => exportar(top));
    $("#reset").addEventListener("click", () => {
      if (!confirm("¿Seguro? Se borrará tu progreso en este dispositivo. Te recomendamos exportar antes tu carta.")) return;
      S = blank(); save(); go("inicio");
    });
  };

  function renderPlan() {
    const box = $("#planBox"); if (!box) return;
    const P = S.plan, cols = ["📋 Por hacer", "🚣 Haciendo", "✅ Hecho"];
    box.innerHTML = `
      <div class="row" style="justify-content:space-between">
        <div><h3 style="margin:0">🗺️ Mi proyecto de vida en sprints</h3>
        <div class="muted small">Sprint ${P.sprint} · próximos 30 días. Como los equipos ágiles: metas cortas, revisión y mejora continua. Cada tarea terminada suma +10 XP.</div></div>
        <button class="btn sun sm no-print" id="closeSprint">Cerrar sprint ${P.sprint}</button>
      </div>
      <div class="kanban" style="margin-top:12px">
        ${cols.map((c, ci) => `<div class="col"><h4>${c}<span class="muted">${P.tareas.filter((t) => t.col === ci).length}</span></h4>
          ${P.tareas.filter((t) => t.col === ci).map((t) => `<div class="task">${esc(t.t)}
            <div class="row no-print">${ci > 0 ? `<button data-mv="${t.id}" data-d="-1" aria-label="Mover atrás">←</button>` : ""}${ci < 2 ? `<button data-mv="${t.id}" data-d="1" aria-label="Mover adelante">→</button>` : ""}<button data-del="${t.id}" aria-label="Eliminar">✕</button></div></div>`).join("")}
          ${ci === 0 ? `<form class="addtask no-print" id="addT"><input maxlength="90" placeholder="Nueva meta…" aria-label="Nueva meta"><button class="btn sm">+</button></form>` : ""}
        </div>`).join("")}
      </div>`;
    $$("[data-mv]", box).forEach((b) => b.addEventListener("click", () => {
      const t = P.tareas.find((x) => x.id === b.dataset.mv);
      t.col = clamp(t.col + +b.dataset.d, 0, 2);
      save();
      if (t.col === 2 && !t.xp) { t.xp = true; save(); addXp(10, "meta cumplida"); }
      renderPlan();
    }));
    $$("[data-del]", box).forEach((b) => b.addEventListener("click", () => { P.tareas = P.tareas.filter((x) => x.id !== b.dataset.del); save(); renderPlan(); }));
    $("#addT").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const v = ev.target.querySelector("input").value.trim(); if (!v) return;
      P.tareas.push({ id: Math.random().toString(36).slice(2, 9), t: v, col: 0, xp: false }); save(); renderPlan();
    });
    $("#closeSprint").addEventListener("click", () => {
      const hechas = P.tareas.filter((t) => t.col === 2).length;
      if (!hechas) { toast("Termina al menos una meta antes de cerrar el sprint"); return; }
      P.tareas = P.tareas.filter((t) => t.col !== 2);
      P.cerradas += hechas; P.sprint++; save();
      badge(`Sprint ${P.sprint - 1} cerrado`);
      addXp(40, `Retrospectiva: ${hechas} metas logradas`); confetti();
      renderPlan();
    });
  }

  function exportPayload(top) {
    return {
      app: "navigo", version: 1, fecha: new Date().toISOString(),
      perfil: S.perfil, xp: S.xp, rango: rango(S.xp).n, codigo: hollandCode(),
      intereses: S.intereses, aptitudes: S.aptitudes, competencias: S.competencias.scores,
      valores: S.valores.scores, valoresOrden: S.valores.orden, mitos: S.mitos,
      carreras: top.slice(0, 6).map((c) => ({ n: c.n, afinidad: c.score })),
      plan: S.plan ? { sprint: S.plan.sprint, metasLogradas: S.plan.cerradas } : null
    };
  }
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function exportar(top) {
    const slug = (S.perfil.nombre || "estudiante").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-");
    download(`navigo-${slug}.json`, JSON.stringify(exportPayload(top), null, 2), "application/json");
    toast("Archivo descargado. Entrégalo a tu orientador(a).");
  }

  // ===== Panel del orientador =====
  let GRUPO = [];
  VIEWS.orientador = function () {
    const mine = S.perfil && S.done.carta;
    app.innerHTML = `
      <h1>Panel del orientador(a)</h1>
      <p class="muted">Reúne las cartas de navegación exportadas por tus estudiantes para ver el perfil del grupo y preparar el acompañamiento individual. Los archivos se procesan solo en este navegador; no se envía nada a internet.</p>
      <label class="drop card" style="display:block">
        <b>📂 Cargar archivos de estudiantes (.json)</b>
        <div class="muted small">Puedes seleccionar varios a la vez</div>
        <input type="file" id="files" accept=".json,application/json" multiple style="margin-top:10px">
      </label>
      <div class="row" style="margin-top:10px">
        ${mine ? '<button class="btn ghost sm" id="addMine">Agregar los resultados de este dispositivo</button>' : ""}
        <button class="btn ghost sm" id="demo">Cargar grupo de ejemplo</button>
        <button class="btn ghost sm" id="clear">Vaciar</button>
      </div>
      <div id="grp" style="margin-top:18px"></div>`;
    $("#files").addEventListener("change", async (ev) => {
      let bad = 0;
      for (const f of ev.target.files) {
        try { const j = JSON.parse(await f.text()); if (j.app === "navigo" && j.intereses) GRUPO.push(j); else bad++; } catch (e) { bad++; }
      }
      if (bad) toast(`${bad} archivo(s) no son cartas de Navigo`);
      renderGrupo();
    });
    if (mine) $("#addMine").addEventListener("click", () => { GRUPO.push(exportPayload(matches())); renderGrupo(); });
    $("#demo").addEventListener("click", () => { GRUPO = GRUPO.concat(demoGrupo()); renderGrupo(); });
    $("#clear").addEventListener("click", () => { GRUPO = []; renderGrupo(); });
    renderGrupo();
  };
  function demoGrupo() {
    const nombres = ["Andrea", "Luis", "María José", "Carlos", "Valentina", "Jesús", "Daniela", "Samuel", "Paola", "Kevin", "Isabel", "Diego"];
    const keys = Object.keys(D.RIASEC);
    return nombres.map((n) => {
      const r = {}; keys.forEach((k) => (r[k] = Math.round(Math.random() * 100)));
      const a = {}; Object.keys(D.APTITUDES).forEach((k) => (a[k] = 30 + Math.round(Math.random() * 70)));
      const c = {}; Object.keys(D.COMPETENCIAS).forEach((k) => (c[k] = Math.round(Math.random() * 100)));
      const vo = shuffle(Object.keys(D.VALORES));
      const code = Object.entries(r).sort((x, y) => y[1] - x[1]).slice(0, 3).map((x) => x[0]).join("");
      const car = D.CARRERAS.filter((x) => x.code[0] === code[0]);
      return { app: "navigo", demo: true, perfil: { nombre: n + " (ejemplo)", edad: 15 + Math.floor(Math.random() * 3), anio: Math.random() < 0.5 ? "4to año" : "5to año" }, codigo: code, intereses: r, aptitudes: a, competencias: c, valoresOrden: vo, carreras: [{ n: (car[0] || D.CARRERAS[0]).n, afinidad: 60 + Math.round(Math.random() * 25) }] };
    });
  }
  function renderGrupo() {
    const box = $("#grp"); if (!box) return;
    if (!GRUPO.length) { box.innerHTML = '<div class="card muted">Aún no hay estudiantes cargados.</div>'; return; }
    const dom = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    GRUPO.forEach((g) => (dom[(g.codigo || "R")[0]]++));
    const compAvg = {}; Object.keys(D.COMPETENCIAS).forEach((k) => (compAvg[k] = Math.round(avg(GRUPO.map((g) => (g.competencias || {})[k] || 0)))));
    const low = Object.entries(compAvg).sort((a, b) => a[1] - b[1]).slice(0, 2).map((x) => D.COMPETENCIAS[x[0]].corto.toLowerCase());
    box.innerHTML = `
      <div class="grid g2">
        <div class="card"><h3>Intereses dominantes del grupo (${GRUPO.length})</h3>
          <div class="bars">${Object.entries(dom).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="bar-row"><span>${D.RIASEC[k].nombre}</span><div class="bar"><span style="width:${(v / GRUPO.length) * 100}%;background:${D.RIASEC[k].color}"></span></div><span>${v}</span></div>`).join("")}</div>
        </div>
        <div class="card"><h3>Competencias blandas promedio</h3>${bars(compAvg, D.COMPETENCIAS, () => "#7a5af5")}
          <p class="small" style="margin-top:10px">💡 Sugerencia de taller grupal: trabajar <b>${low.join("</b> y <b>")}</b>.</p></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="row" style="justify-content:space-between"><h3 style="margin:0">Estudiantes</h3><button class="btn sm" id="csv">⬇️ Descargar CSV</button></div>
        <div class="table-wrap" style="margin-top:10px"><table>
          <thead><tr><th>Nombre</th><th>Edad</th><th>Año</th><th>Código</th><th>Habilidad top</th><th>Competencia top</th><th>Valor #1</th><th>Ruta #1</th></tr></thead>
          <tbody>${GRUPO.map((g) => { const r = filaGrupo(g); return `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`; }).join("")}</tbody>
        </table></div>
      </div>`;
    $("#csv").addEventListener("click", () => {
      const head = ["Nombre", "Edad", "Año", "Código Holland", "Habilidad top", "Competencia top", "Valor #1", "Ruta #1", "Afinidad"];
      const rows = GRUPO.map((g) => filaGrupo(g).concat([(g.carreras && g.carreras[0] && g.carreras[0].afinidad) || ""]));
      const csv = [head].concat(rows).map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\r\n");
      download("navigo-grupo.csv", "﻿" + csv, "text/csv;charset=utf-8");
    });
  }
  function filaGrupo(g) {
    const top = (o, meta) => { const e = Object.entries(o || {}).sort((a, b) => b[1] - a[1])[0]; return e && meta[e[0]] ? (meta[e[0]].corto || meta[e[0]].nombre) : "—"; };
    const p = g.perfil || {};
    return [p.nombre || "—", p.edad || "—", p.anio || "—", g.codigo || "—", top(g.aptitudes, D.APTITUDES), top(g.competencias, D.COMPETENCIAS),
      g.valoresOrden && D.VALORES[g.valoresOrden[0]] ? D.VALORES[g.valoresOrden[0]].nombre : "—", (g.carreras && g.carreras[0] && g.carreras[0].n) || "—"];
  }

  // ===== Fundamentos =====
  VIEWS.fundamentos = function () {
    app.innerHTML = `
      <button class="back" data-go="${S.perfil ? "mapa" : "inicio"}">← Volver</button>
      <h1>Fundamentos de Navigo</h1>
      <p class="muted">Por qué existe esta herramienta y en qué se basa.</p>
      <div class="grid g2">
        <div class="card"><h3>El problema</h3><p>En el estado Mérida, la orientación vocacional suele limitarse a test y charlas que no abordan de forma integral e individual las necesidades del estudiante. La falta de información, la presión social y la dificultad para reconocer los propios talentos afectan la elección de carrera.</p></div>
        <div class="card"><h3>El objetivo</h3><p>Captar a través del juego los intereses, habilidades, valores y comportamientos de estudiantes de bachillerato en Venezuela, para que descubran sus talentos y los asocien con las oportunidades actuales y emergentes del mundo laboral.</p></div>
      </div>
      <h2 style="margin-top:24px">Cómo se mide cada dimensión</h2>
      <div class="grid g2">
        <div class="card"><b>🧭 Intereses — modelo RIASEC de Holland</b><p class="small">30 actividades cotidianas y contextualizadas en Venezuela clasifican tus intereses en seis tipos: Realista, Investigador, Artístico, Social, Emprendedor y Convencional. Es el mismo modelo que usan Aventúrate (Salinas, 2023) y la mayoría de las herramientas de orientación.</p></div>
        <div class="card"><b>🎮 Habilidades — minijuegos</b><p class="small">Siguiendo la estructura de «desafíos» de Aventúrate (memorice, laberinto, sopa de letras), cinco minijuegos estiman memoria, razonamiento lógico, razonamiento verbal, cálculo y creatividad (fluidez de ideas).</p></div>
        <div class="card"><b>⚡ Comportamientos — competencias genéricas</b><p class="small">Ocho situaciones de juicio situacional revelan habilidades blandas tomadas del Manual Descriptivo de Competencias Genéricas (Gaceta Oficial N.º 38.924), que la tesis de Carmona (ULA, 2022) propone para la selección del talento humano por competencias.</p></div>
        <div class="card"><b>💎 Valores — comparación por pares</b><p class="small">Dieciséis duelos entre ocho valores laborales producen un orden de prioridades personal, insumo clave para el proyecto de vida.</p></div>
      </div>
      <h2 style="margin-top:24px">Gamificación y metodologías ágiles</h2>
      <div class="card"><ul>
        <li><b>Narrativa y mapa:</b> una ruta por paisajes venezolanos (Sierra Nevada, Médanos de Coro, Catatumbo, Canaima, Los Roques, Pico Bolívar) que refuerza la identidad local, como propone Aventúrate con los paisajes chilenos.</li>
        <li><b>Mecánicas:</b> puntos de experiencia, rangos náuticos, insignias, desbloqueo progresivo de estaciones, retroalimentación inmediata y retos con tiempo.</li>
        <li><b>Ágil:</b> el proyecto de vida se gestiona en <i>sprints</i> de 30 días con un tablero Kanban (Por hacer · Haciendo · Hecho) y una retrospectiva al cerrar cada sprint.</li>
        <li><b>Acompañamiento experto:</b> la carta de navegación se exporta al panel del orientador(a), que ve el perfil del grupo y prepara la conversación individual.</li>
        <li><b>Diseño instruccional:</b> modelo ADDIE (Análisis, Diseño, Desarrollo, Implementación, Evaluación) para iterar el contenido con estudiantes reales.</li>
      </ul></div>
      <h2 style="margin-top:24px">Fuentes</h2>
      <div class="card small"><ul>
        <li>Carmona, W. (2022). <i>Modelo de selección del talento humano basado en las competencias laborales.</i> Universidad de Los Andes, Mérida.</li>
        <li>Salinas, M. (2023). <i>Aventúrate: la ruta vocacional. Diseño de interfaz de una aplicación de orientación vocacional aplicando elementos de gamificación.</i> Santiago de Chile.</li>
        <li>República Bolivariana de Venezuela (2008). Gaceta Oficial N.º 38.924: Manual Descriptivo de Competencias Genéricas.</li>
        <li>Holland, J. L. (1997). <i>Making Vocational Choices.</i> PAR.</li>
        <li><a href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/" target="_blank" rel="noopener">World Economic Forum (2025). Future of Jobs Report 2025.</a></li>
        <li><a href="https://redined.educacion.gob.es/xmlui/handle/11162/257563" target="_blank" rel="noopener">Gamificación como herramienta para promover la madurez vocacional en estudiantes de bachillerato (REDINED).</a></li>
      </ul></div>`;
  };

  // ---------------- Arranque ----------------
  go(S.perfil ? "mapa" : "inicio");
})();
