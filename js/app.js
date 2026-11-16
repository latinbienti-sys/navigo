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
  const POS_WIDE = [[8, 76], [20, 32], [32, 72], [44, 30], [56, 72], [68, 30], [79, 72], [91, 26]];
  const POS_NARROW = [[26, 92], [72, 80], [28, 68], [72, 56], [28, 44], [72, 32], [28, 20], [70, 8]];
  const lugares = (c, max = 4) => { const l = c.donde || []; return l.slice(0, max).map(esc).join(" · ") + (l.length > max ? ` · <i>y ${l.length - max} más</i>` : ""); };
  const areaDe = (c) => (D.AREAS && D.AREAS[c.area]) || { nombre: "Otras", icono: "📌" };
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

  // ===== 5. Expedición al tepuy (estilo de comportamiento) =====
  const TK = ["accion", "conexion", "calma", "precision"];
  VIEWS.expedicion = function (arg) {
    const e = est("expedicion");
    if (S.estilo && arg !== "repetir") return resultadoEstilo();
    const pts = { accion: 0, conexion: 0, calma: 0, precision: 0 };
    const m = { tiempos: [], riesgo: [], info: 0, infoDisp: 0, reparto: null, piedras: { fallos: 0, reintentos: 0, rendido: false, superado: false } };
    let i = 0;

    app.innerHTML = `${backBtn()}${stHead(e)}
      <div class="card stack" style="max-width:720px;margin:0 auto">
        <h3>🏕️ Antes de subir</h3>
        <p>En esta misión vas a coordinar un rescate en el tepuy Roraima. Observaremos <b>cómo tomas decisiones</b>, no lo que sabes.</p>
        <ul>
          <li>No hay respuestas buenas ni malas.</li>
          <li>Responde como actuarías de verdad, no como «se debería».</li>
          <li>Puedes consultar la bitácora 🔍 cuando quieras. El tiempo no te quita puntos.</li>
        </ul>
        <div><button class="btn sun" id="go">Comenzar la expedición →</button></div>
      </div>`;
    $("#go").addEventListener("click", scene);

    function shell(inner) {
      app.innerHTML = `${backBtn()}
        <div class="card stack" style="max-width:760px;margin:0 auto">
          <div class="row" style="justify-content:space-between"><b>🏕️ Escena ${i + 1} de ${D.MISION.length}</b><span class="muted small">⛈️ La tormenta se acerca…</span></div>
          <div class="progress"><span style="width:${(i / D.MISION.length) * 100}%;background:${e.color}"></span></div>
          ${inner}
        </div>`;
    }
    function next() { i++; scene(); }

    function scene() {
      if (i >= D.MISION.length) return terminar();
      const sc = D.MISION[i];
      if (sc.tipo === "recursos") return recursos(sc);
      if (sc.tipo === "piedras") return piedras(sc);
      const opts = shuffle(sc.o);
      shell(`<h3>${esc(sc.s)}</h3>
        ${sc.info ? `<div><button class="btn ghost sm" id="info">🔍 Consultar la bitácora</button><p class="small muted" id="infoTxt" hidden style="margin-top:8px">📓 ${esc(sc.info)}</p></div>` : ""}
        <div class="opts">${opts.map((o, n) => `<button class="opt" data-n="${n}">${esc(o.t)}</button>`).join("")}</div>`);
      if (sc.info) {
        m.infoDisp++;
        $("#info").addEventListener("click", (ev) => { ev.target.disabled = true; $("#infoTxt").hidden = false; m.info++; });
      }
      const t0 = performance.now();
      const leer = (sc.s.length + opts.reduce((a, o) => a + o.t.length, 0)) * 22; // ms estimados de lectura
      $$(".opt").forEach((b) => b.addEventListener("click", () => {
        const o = opts[+b.dataset.n];
        m.tiempos.push({ bruto: performance.now() - t0, ajustado: Math.max(300, performance.now() - t0 - leer) });
        Object.entries(o.p).forEach(([k, v]) => (pts[k] += v));
        if (o.r != null) m.riesgo.push(o.r);
        next();
      }));
    }

    function recursos(sc) {
      const rep = { propio: 0, rescate: 0, reserva: 0 };
      function draw() {
        const quedan = sc.total - rep.propio - rep.rescate - rep.reserva;
        shell(`<h3>🎒 ${esc(sc.s)}</h3>
          <p class="muted">Quedan <b>${quedan}</b> raciones por repartir.</p>
          <div class="stack">${sc.grupos.map((g) => `<div class="row" style="justify-content:space-between;border:1.5px solid var(--line);border-radius:14px;padding:10px 14px">
            <span><b>${esc(g.t)}</b><br><span style="letter-spacing:2px">${"🍞".repeat(rep[g.k]) || '<span class="muted small">—</span>'}</span></span>
            <span class="row"><button class="btn ghost sm" data-k="${g.k}" data-d="-1" ${rep[g.k] ? "" : "disabled"} aria-label="Quitar">−</button><b style="min-width:22px;text-align:center">${rep[g.k]}</b><button class="btn ghost sm" data-k="${g.k}" data-d="1" ${quedan ? "" : "disabled"} aria-label="Agregar">+</button></span>
          </div>`).join("")}</div>
          <div><button class="btn" id="ok" ${quedan ? "disabled" : ""}>Confirmar reparto →</button></div>`);
        $$("[data-k]").forEach((b) => b.addEventListener("click", () => { rep[b.dataset.k] += +b.dataset.d; draw(); }));
        $("#ok").addEventListener("click", () => {
          m.reparto = Object.assign({}, rep);
          pts.accion += (rep.propio / sc.total) * 4;
          pts.calma += (rep.rescate / sc.total) * 3;
          pts.conexion += (rep.rescate / sc.total) * 1;
          pts.precision += (rep.reserva / sc.total) * 4;
          next();
        });
      }
      draw();
    }

    function piedras(sc) {
      const rondas = [3, 4, 5];
      let ronda = 0, seq = [], pos = 0, bloqueado = true;
      const P = m.piedras;
      function tablero(msg) {
        shell(`<h3>🌊 ${esc(sc.s)}</h3>
          <p class="muted" id="pmsg">${msg}</p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:330px;margin:0 auto">
            ${[0, 1, 2, 3, 4, 5].map((k) => `<button class="mem" data-s="${k}" style="color:inherit;background:var(--bg2);font-size:1.6rem" aria-label="Piedra ${k + 1}">🪨</button>`).join("")}
          </div><div id="pact"></div>`);
        $$("[data-s]").forEach((b) => b.addEventListener("click", () => pisar(+b.dataset.s, b)));
      }
      function mostrar() {
        seq = Array.from({ length: rondas[ronda] }, () => Math.floor(Math.random() * 6));
        pos = 0; bloqueado = true;
        tablero(`Ronda ${ronda + 1} de ${rondas.length}: observa las piedras firmes…`);
        seq.forEach((s, k) => {
          later(() => { const b = $(`[data-s="${s}"]`); if (b) b.style.background = "var(--sun)"; }, 500 + k * 700);
          later(() => { const b = $(`[data-s="${s}"]`); if (b) b.style.background = "var(--bg2)"; }, 500 + k * 700 + 450);
        });
        later(() => { bloqueado = false; const el = $("#pmsg"); if (el) el.textContent = "¡Tu turno! Pisa las piedras en el mismo orden."; }, 500 + seq.length * 700);
      }
      function pisar(s, b) {
        if (bloqueado) return;
        if (s === seq[pos]) {
          b.style.background = "var(--ok)"; later(() => (b.style.background = "var(--bg2)"), 250);
          pos++;
          if (pos === seq.length) {
            bloqueado = true; ronda++;
            if (ronda >= rondas.length) { P.superado = true; $("#pmsg").textContent = "¡Cruzaste el río! 🎉"; later(next, 900); }
            else { $("#pmsg").textContent = "¡Bien! Siguiente tramo…"; later(mostrar, 900); }
          }
        } else {
          bloqueado = true; P.fallos++;
          b.style.background = "var(--bad)";
          if (P.fallos >= 5) { $("#pmsg").textContent = "El río creció: rodean por la orilla."; P.rendido = true; later(next, 1200); return; }
          $("#pmsg").textContent = "¡Splash! Pisaste una piedra suelta.";
          $("#pact").innerHTML = `<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" id="retry">Intentar de nuevo</button><button class="btn ghost" id="giveup">Rodear el río (más largo)</button></div>`;
          $("#retry").addEventListener("click", () => { P.reintentos++; mostrar(); });
          $("#giveup").addEventListener("click", () => { P.rendido = true; next(); });
        }
      }
      mostrar();
    }

    function terminar() {
      const aj = m.tiempos.map((t) => t.ajustado).sort((a, b) => a - b);
      const mediana = aj.length ? aj[Math.floor(aj.length / 2)] / 1000 : 0;
      if (mediana < 3) { pts.accion += 1.5; pts.conexion += 0.5; }
      else if (mediana > 7) { pts.precision += 1.5; pts.calma += 0.5; }
      const infoRatio = m.infoDisp ? m.info / m.infoDisp : 0;
      if (infoRatio >= 0.5) pts.precision += 1;

      const total = TK.reduce((a, k) => a + pts[k], 0) || 1;
      const shares = {}; TK.forEach((k) => (shares[k] = Math.round((pts[k] / total) * 100)));
      const diff = 100 - TK.reduce((a, k) => a + shares[k], 0);
      const orden = TK.slice().sort((a, b) => shares[b] - shares[a]);
      shares[orden[0]] += diff;

      const rep = m.reparto || { propio: 0, rescate: 0, reserva: 0 };
      const P = m.piedras;
      const persistencia = P.fallos === 0 ? 70 : clamp(Math.round((P.reintentos / P.fallos) * 100 * (P.superado ? 1 : 0.7)), 0, 100);
      const indicadores = {
        riesgo: Math.round(avg(m.riesgo) * 100),
        cooperacion: clamp(Math.round((rep.rescate / 8) * 100), 0, 100),
        prevision: clamp(Math.round(clamp((rep.reserva / 5) * 100, 0, 100) * 0.6 + infoRatio * 100 * 0.4), 0, 100),
        informacion: Math.round(infoRatio * 100),
        persistencia
      };
      const alertas = [];
      const rapidas = m.tiempos.filter((t) => t.bruto < 2500).length;
      if (m.tiempos.length && rapidas / m.tiempos.length >= 0.5) alertas.push("Muchas decisiones tomadas en menos de 2,5 segundos: puede que no haya leído con atención.");
      if (shares[orden[0]] - shares[orden[1]] < 5) alertas.push("Dos o más tendencias casi empatadas: perfil versátil o poco definido; conviene conversarlo.");
      S.estilo = {
        shares, principal: orden[0], secundario: orden[1], indicadores, ritmoSeg: Math.round(mediana * 10) / 10,
        reparto: rep, piedras: P, alertas, confianza: alertas.length === 0 ? "Alta" : alertas.length === 1 ? "Media" : "Baja"
      };
      save();
      resultadoEstilo();
    }
  };

  const INDICADORES = {
    riesgo: { nombre: "Tolerancia al riesgo", corto: "Tolerancia al riesgo" },
    cooperacion: { nombre: "Cooperación", corto: "Cooperación" },
    prevision: { nombre: "Previsión", corto: "Previsión" },
    informacion: { nombre: "Búsqueda de información", corto: "Busca información" },
    persistencia: { nombre: "Persistencia", corto: "Persistencia" }
  };
  function ritmoTxt(s) { return s < 3 ? "decisiones ágiles" : s > 7 ? "decisiones reflexivas" : "ritmo equilibrado"; }
  function cuadrante(sh) {
    const acel = sh.accion + sh.conexion - (sh.calma + sh.precision);
    const pers = sh.conexion + sh.calma - (sh.accion + sh.precision);
    const x = 130 + clamp(pers, -100, 100) * 1.0, y = 130 - clamp(acel, -100, 100) * 1.0;
    const T = D.TENDENCIAS_ESTILO;
    const q = (k, tx, ty, anchor) => `<text x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="${T[k].color}">${T[k].nombre}</text>`;
    return `<svg class="radar" viewBox="0 0 260 270" role="img" aria-label="Mapa de estilo: ritmo ${acel >= 0 ? "acelerado" : "pausado"}, foco en ${pers >= 0 ? "personas" : "tareas"}">
      <rect x="20" y="20" width="110" height="110" fill="${T.accion.color}" opacity=".10"/><rect x="130" y="20" width="110" height="110" fill="${T.conexion.color}" opacity=".12"/>
      <rect x="130" y="130" width="110" height="110" fill="${T.calma.color}" opacity=".10"/><rect x="20" y="130" width="110" height="110" fill="${T.precision.color}" opacity=".10"/>
      <line x1="20" y1="130" x2="240" y2="130" stroke="var(--line)" stroke-width="1.5"/><line x1="130" y1="20" x2="130" y2="240" stroke="var(--line)" stroke-width="1.5"/>
      ${q("accion", 26, 36, "start")}${q("conexion", 234, 36, "end")}${q("calma", 234, 232, "end")}${q("precision", 26, 232, "start")}
      <text x="130" y="13" text-anchor="middle" font-size="10" fill="var(--muted)">RITMO ACELERADO</text>
      <text x="130" y="255" text-anchor="middle" font-size="10" fill="var(--muted)">RITMO PAUSADO</text>
      <text x="8" y="134" font-size="10" fill="var(--muted)" transform="rotate(-90 8 134)" text-anchor="middle">TAREAS</text>
      <text x="252" y="134" font-size="10" fill="var(--muted)" transform="rotate(90 252 134)" text-anchor="middle">PERSONAS</text>
      <circle cx="${x}" cy="${y}" r="13" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14">${S.perfil ? S.perfil.companero : "•"}</text>
    </svg>`;
  }
  function estiloHtml() {
    const E = S.estilo, T = D.TENDENCIAS_ESTILO, pr = T[E.principal], se = T[E.secundario];
    return `
      <div class="result-hero">
        <div>
          <div class="muted small" style="font-weight:800;text-transform:uppercase">Tu estilo de comportamiento</div>
          <div class="code" style="font-size:2.2rem;letter-spacing:.02em;color:${pr.color}">${pr.estilo}</div>
          <p class="small muted" style="margin:0 0 .6em">${pr.eje} · con un toque de <b>${se.nombre}</b></p>
          <p>${pr.desc}</p>
          <p class="small"><b>Tu reto de crecimiento:</b> ${pr.reto}</p>
        </div>
        ${cuadrante(E.shares)}
      </div>
      <div class="grid g2" style="margin-top:6px">
        <div><h4>Cómo se reparte tu energía</h4>${bars(E.shares, { accion: { corto: T.accion.nombre }, conexion: { corto: T.conexion.nombre }, calma: { corto: T.calma.nombre }, precision: { corto: T.precision.nombre } }, (k) => T[k].color)}</div>
        <div><h4>Lo que mostraron tus decisiones</h4>${bars(E.indicadores, INDICADORES, () => "#c27c0e")}
          <p class="small muted" style="margin-top:8px">⏱️ Ritmo: ${E.ritmoSeg} s por decisión, descontando el tiempo de lectura (${ritmoTxt(E.ritmoSeg)}).</p></div>
      </div>
      <p class="small muted">Confianza del perfil: <b>${E.confianza}</b>${E.alertas.length ? " — " + E.alertas.map(esc).join(" ") : ". Tus respuestas fueron consistentes y pausadas."}</p>`;
  }
  function resultadoEstilo() {
    finishStation("expedicion", estiloHtml() + `<p class="muted small">El estilo describe <b>tendencias</b> de este momento, no te encasilla: todas las personas usamos los cuatro según la situación.</p>`);
  }

  // ===== 6. Mundo laboral =====
  VIEWS.mundo = function (arg) {
    const e = est("mundo");
    let filtro = "todas", tipo = "todas", area = "todas", estado = "todos", q = "", limite = 24;
    const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    function explorer() {
      const list = D.CARRERAS.filter((c) => (filtro === "todas" || c.code.includes(filtro)) && (tipo === "todas" || c.tag === tipo)
        && (area === "todas" || c.area === area)
        && (estado === "todos" || (c.estados || []).includes(estado) || (c.estados || []).includes("Nacional"))
        && (!q || norm(c.n + " " + c.d).includes(norm(q))));
      const cards = list.slice(0, limite).map((c) => `<div class="card career"><div class="row" style="justify-content:space-between"><b>${esc(c.n)}</b><span class="tag ${c.tag}">${c.tag}</span></div><div class="small muted">${areaDe(c).icono} ${esc(areaDe(c).nombre)}</div><div class="small">${esc(c.d)}</div><div class="where">📍 ${lugares(c)}</div><div class="small muted">Intereses: ${[...c.code].map((k) => D.RIASEC[k].nombre).join(", ")}</div></div>`).join("");
      $("#expCount").textContent = `${list.length} de ${D.CARRERAS.length} carreras y oficios`;
      $("#more").hidden = list.length <= limite;
      return cards || '<p class="muted">No hay carreras con ese filtro.</p>';
    }
    app.innerHTML = `${backBtn()}${stHead(e)}
      <h3>🌐 Tendencias que mueven el mundo del trabajo</h3>
      <div class="grid g3">${D.TENDENCIAS.map((t) => `<div class="card"><b>${esc(t.t)}</b><p class="small" style="margin:.4em 0">${esc(t.d)}</p><span class="muted small">Fuente: ${esc(t.f)}</span></div>`).join("")}</div>

      <div class="card stack" style="margin-top:20px" id="mitos"></div>

      <h3 style="margin-top:24px">🔎 Explora las carreras de Venezuela</h3>
      <p class="muted small">Catálogo nacional: universidades públicas y privadas, programas nacionales de formación (PNF) y oficios técnicos.</p>
      <div class="grid g3" style="gap:10px">
        <label class="field" style="margin:0">Buscar<input id="fq" placeholder="Ej.: medicina, diseño, petróleo…" autocomplete="off"></label>
        <label class="field" style="margin:0">Área de conocimiento<select id="fA"><option value="todas">Todas las áreas</option>${Object.entries(D.AREAS || {}).map(([k, a]) => `<option value="${k}">${a.icono} ${esc(a.nombre)}</option>`).join("")}</select></label>
        <label class="field" style="margin:0">¿Dónde quieres estudiar?<select id="fE"><option value="todos">Todo el país</option>${(D.ESTADOS_VE || []).map((s) => `<option>${esc(s)}</option>`).join("")}</select></label>
      </div>
      <div class="row" id="fR" style="margin-top:10px">${["todas", "R", "I", "A", "S", "E", "C"].map((k) => `<button class="chip" data-f="${k}" aria-pressed="${k === "todas"}">${k === "todas" ? "Todos los intereses" : D.RIASEC[k].nombre}</button>`).join("")}</div>
      <div class="row" id="fT" style="margin-top:8px">${["todas", "emergente", "consolidada", "oficio"].map((k) => `<button class="chip" data-t="${k}" aria-pressed="${k === "todas"}">${k === "todas" ? "Todos los tipos" : k}</button>`).join("")}</div>
      <p class="small" style="margin:12px 0 0"><b id="expCount"></b></p>
      <div class="grid g3" id="exp" style="margin-top:10px"></div>
      <div class="center" style="margin-top:12px"><button class="btn ghost sm" id="more">Ver más carreras</button></div>
      <p class="muted small" style="margin-top:10px">La oferta académica cambia cada año: confirma carreras, sedes y requisitos en el <b>Libro de Oportunidades de Estudio</b> del Sistema Nacional de Ingreso (sni.opsu.gob.ve) y en el sitio de cada universidad.</p>`;

    const refresh = (reset = true) => { if (reset) limite = 24; $("#exp").innerHTML = explorer(); };
    refresh();
    $("#fR").addEventListener("click", (ev) => { const b = ev.target.closest(".chip"); if (!b) return; filtro = b.dataset.f; $$("#fR .chip").forEach((x) => x.setAttribute("aria-pressed", x === b)); refresh(); });
    $("#fT").addEventListener("click", (ev) => { const b = ev.target.closest(".chip"); if (!b) return; tipo = b.dataset.t; $$("#fT .chip").forEach((x) => x.setAttribute("aria-pressed", x === b)); refresh(); });
    $("#fq").addEventListener("input", (ev) => { q = ev.target.value.trim(); refresh(); });
    $("#fA").addEventListener("change", (ev) => { area = ev.target.value; refresh(); });
    $("#fE").addEventListener("change", (ev) => { estado = ev.target.value; refresh(); });
    $("#more").addEventListener("click", () => { limite += 24; refresh(false); });

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

  // ===== 7. Teleférico Mukumbarí: fase final jugable =====
  // Diseño de evaluación: Evidence-Centered Design / evaluación encubierta (Mislevy; Shute).
  // Criterios: NOTECHS/CRM (decisiones, cooperación, liderazgo), conciencia situacional (Endsley),
  // propensión al riesgo conductual tipo BART (Lejuez et al., 2002) y competencias socioemocionales CASEL.
  const TRAMOS = [
    { de: "Barinitas", a: "La Montaña", alt: [1577, 2436], viento: 10, rafaga: [26, 34], suelo: "#3f8f4f" },
    { de: "La Montaña", a: "La Aguada", alt: [2436, 3452], viento: 14, rafaga: [30, 40], suelo: "#5f9447" },
    { de: "La Aguada", a: "Loma Redonda", alt: [3452, 4045], viento: 18, rafaga: [34, 44], suelo: "#8d9a52" },
    { de: "Loma Redonda", a: "Pico Espejo", alt: [4045, 4765], viento: 22, rafaga: [36, 48], suelo: "#7d7d86" }
  ];
  const TEL_EVENTOS = [
    { s: "📡 El centro de control avisa: ráfagas laterales de 45 km/h en el próximo tramo. Llevas 60 pasajeros, entre ellos varios niños.",
      info: "Límite de operación: 60 km/h de viento. Protocolo: con viento mayor a 40 km/h, reducir la velocidad al 50 % e informar a los pasajeros.",
      o: [
        { t: "Mantengo la velocidad: todavía estamos bajo el límite.", q: 0.3, r: 1, l: 1, f: "Las ráfagas te tomarán con más fuerza en este tramo." },
        { t: "Reduzco la velocidad a la mitad y explico la situación por el altavoz.", q: 1, r: 0.3, b: 2, l: 1, bien: 10, f: "Pasajeros tranquilos: aplicaste el protocolo." },
        { t: "Detengo la cabina hasta que pase el viento.", q: 0.6, r: 0, bien: -4, f: "Seguro, pero el viaje se retrasa y los pasajeros se impacientan." },
        { t: "Consulto con el jefe de estación y decidimos juntos.", q: 0.8, r: 0.2, e: 2, f: "Buena coordinación: el equipo confirma el protocolo." }
      ] },
    { s: "🤢 Una pasajera mayor se siente mareada por la altura (soroche) y otros pasajeros empiezan a ponerse nerviosos.",
      info: "En La Aguada hay paramédicos y oxígeno. Regresar a La Montaña toma 15 minutos más.",
      o: [
        { t: "Sigo a velocidad segura hasta La Aguada y pido por radio que los paramédicos esperen.", q: 1, r: 0.3, e: 2, l: 1, b: 1, bien: 8, f: "Los paramédicos ya esperan en el andén." },
        { t: "Doy la vuelta y regreso a La Montaña.", q: 0.5, r: 0, bien: -6, f: "La señora es atendida, pero el retraso es grande." },
        { t: "Le pido a un pasajero que la atienda y sigo sin decir nada más.", q: 0.3, r: 0.6, l: 1, bien: -8, f: "Los demás pasajeros siguen nerviosos." },
        { t: "Hablo con calma a todos, explico qué pasa y pido que le den espacio y aire.", q: 0.8, r: 0.3, b: 2, bien: 12, f: "El ambiente en la cabina se calma." }
      ] },
    { s: "⚙️ Un sensor marca una vibración extraña en la polea. El técnico quiere detener todo para revisar; el supervisor dice que es una falsa alarma y que hay que seguir.",
      info: "Historial: este sensor dio 3 falsas alarmas este mes. Una revisión rápida toma 4 minutos.",
      o: [
        { t: "Le hago caso al supervisor: él tiene más autoridad.", q: 0.4, r: 0.8, f: "Seguiste sin verificar: riesgo innecesario." },
        { t: "Escucho a ambos, pido la revisión rápida de 4 minutos y después decido.", q: 1, r: 0.2, e: 2, l: 2, f: "Revisión hecha: era una falsa alarma. ¡Bien gestionado!" },
        { t: "Detengo todo hasta hacer una revisión completa, cueste lo que cueste.", q: 0.7, r: 0, l: 1, bien: -5, f: "Muy seguro, pero el retraso molesta a los pasajeros." },
        { t: "Decido yo seguir: no hay tiempo que perder.", q: 0.2, r: 1, l: 1, f: "Decisión arriesgada y sin escuchar al equipo." }
      ] },
    { s: "⛈️ Llegando a Pico Espejo, una tormenta eléctrica se acerca. Hay 30 turistas arriba esperando la última cabina de bajada, y tu equipo está cansado.",
      info: "La tormenta llega en unos 20 minutos. Un viaje de bajada completo toma 12 minutos. Reglamento: no operar con descargas eléctricas a menos de 10 km.",
      o: [
        { t: "Organizo al equipo: embarque rápido y ordenado, y bajamos de inmediato.", q: 1, r: 0.5, e: 2, l: 2, bien: 6, f: "Todos abordan en orden y bajan antes de la tormenta." },
        { t: "Les pido esperar en el refugio de la estación hasta que pase la tormenta.", q: 0.6, r: 0.1, b: 1, bien: -4, f: "Seguros, pero pasarán la noche arriba con frío." },
        { t: "Hago dos viajes rápidos, aunque el segundo sea en plena tormenta.", q: 0.2, r: 1, l: 1, f: "El segundo viaje habría violado el reglamento de seguridad." },
        { t: "Pido instrucciones a la central y hago exactamente lo que digan.", q: 0.7, r: 0.2, e: 1, f: "La central coordina, pero se pierde tiempo valioso." }
      ] }
  ];
  const CRITERIOS_TEL = {
    decisiones: { nombre: "Toma de decisiones", marco: "NOTECHS: diagnóstico, opciones, evaluación del riesgo y elección" },
    analisis: { nombre: "Análisis (conciencia situacional)", corto: "Análisis", marco: "Modelo de Endsley: percepción, comprensión y proyección" },
    riesgo: { nombre: "Gestión del riesgo", marco: "Seguridad operacional + conducta de riesgo tipo BART (Lejuez et al.)" },
    equipo: { nombre: "Trabajo en equipo", marco: "NOTECHS / CRM: cooperación y comunicación con el equipo" },
    liderazgo: { nombre: "Liderazgo", marco: "NOTECHS: autoridad, coordinación y manejo de la carga de trabajo" },
    blandas: { nombre: "Habilidades socioemocionales", corto: "Habilidades blandas", marco: "CASEL: autogestión, conciencia social y relaciones" }
  };

  VIEWS.teleferico = function (arg) {
    const e = est("teleferico");
    if (S.teleferico && arg !== "repetir") return resultadoTeleferico();
    app.innerHTML = `${backBtn()}${stHead(e)}
      <div class="card stack" style="max-width:760px;margin:0 auto">
        <h3>🚡 Tu misión: operador(a) de la cabina</h3>
        <p>El Teleférico Mukumbarí sube desde <b>Barinitas (1.577 m)</b> hasta <b>Pico Espejo (4.765 m)</b>. Hoy eres quien opera la cabina. Debes llevar a los pasajeros sanos y salvos por los <b>4 tramos</b>, enfrentando viento, imprevistos y decisiones difíciles.</p>
        <div class="grid g2">
          <div><b>🎮 Controles</b><ul class="small">
            <li><b>▲ Acelerar</b> / <b>▼ Frenar</b>: mantén presionado (o usa las flechas ↑ ↓).</li>
            <li><b>📢 Avisar</b>: informa a los pasajeros (tecla A).</li>
            <li><b>📻 Radio</b>: responde cuando una estación te llame (tecla R).</li></ul></div>
          <div><b>⚠️ Reglas</b><ul class="small">
            <li>Cuando veas <b>«RÁFAGA»</b>, frena antes de que llegue.</li>
            <li>Si el <b>balanceo</b> llega al 100 %, hay parada de emergencia y repites el tramo.</li>
            <li>Cuida el <b>bienestar</b> de tus pasajeros.</li></ul></div>
        </div>
        <p class="small muted">Primero cargarás los suministros para la estación de Pico Espejo. Duración aproximada: 6 minutos.</p>
        <div><button class="btn sun" id="tgo">Encender el teleférico →</button></div>
      </div>`;
    $("#tgo").addEventListener("click", carga);

    const R = { bart: { rondas: [], explosiones: 0, puntos: 0 } };

    // --- Fase A: Carga de suministros (tarea de riesgo análoga al BART) ---
    function carga() {
      const RONDAS = 8;
      let ronda = 0, cajas = 0, cap = 0;
      function nueva() { cajas = 0; cap = 1 + Math.floor(Math.random() * 12); draw(); }
      function draw(msg) {
        app.innerHTML = `${backBtn()}
          <div class="card stack" style="max-width:640px;margin:0 auto">
            <div class="row" style="justify-content:space-between"><b>📦 Carga de suministros · Envío ${ronda + 1} de ${RONDAS}</b><b>Puntos: ${R.bart.puntos}</b></div>
            <p class="small">Cada caja que subas a la cabina de carga vale <b>+5 puntos</b>. Pero cada cabina tiene un <b>límite de peso oculto y distinto</b>: si lo superas, el sensor rechaza el envío y pierdes los puntos de esa cabina. Puedes despachar cuando quieras.</p>
            <div class="center" style="font-size:2rem;min-height:3.2rem;letter-spacing:2px">${"📦".repeat(cajas) || '<span class="muted small">Cabina vacía</span>'}</div>
            <p class="center"><b>${cajas * 5}</b> puntos en esta cabina</p>
            <p class="center small" id="bmsg">${msg || ""}</p>
            <div class="row" style="justify-content:center"><button class="btn" id="bmas">📦 Subir una caja</button><button class="btn sun" id="bok" ${cajas ? "" : "disabled"}>✅ Despachar</button></div>
          </div>`;
        $("#bmas").addEventListener("click", () => {
          cajas++;
          if (cajas >= cap) { R.bart.explosiones++; R.bart.rondas.push({ cajas, exploto: true }); fin(`💥 ¡Sobrecarga! El límite era ${cap - 1} cajas.`); }
          else draw();
        });
        $("#bok").addEventListener("click", () => { R.bart.rondas.push({ cajas, exploto: false }); R.bart.puntos += cajas * 5; fin(`✅ Despachado: +${cajas * 5} puntos.`); });
      }
      function fin(msg) {
        ronda++;
        app.innerHTML = `${backBtn()}<div class="card center stack" style="max-width:640px;margin:0 auto"><h3>${msg}</h3><p>Puntos acumulados: <b>${R.bart.puntos}</b></p></div>`;
        later(() => (ronda < RONDAS ? nueva() : juego()), 1100);
      }
      nueva();
    }

    // --- Fase B: Operación de la cabina (juego en tiempo real) ---
    function juego() {
      app.innerHTML = `${backBtn()}
        <div class="tel">
          <div class="tel-hud">
            <div><span class="muted small">Tramo</span><b id="hTramo"></b></div>
            <div><span class="muted small">Altitud</span><b id="hAlt"></b></div>
            <div><span class="muted small">Velocidad</span><b id="hVel"></b></div>
            <div><span class="muted small">Viento</span><b id="hVien"></b></div>
          </div>
          <div class="tel-stage" id="stage">
            <canvas id="cv" aria-label="Cabina del teleférico Mukumbarí cruzando la montaña"></canvas>
            <div class="tel-banner" id="banner" hidden></div>
            <div class="tel-overlay" id="ov" hidden></div>
          </div>
          <div class="tel-meters">
            <div><span class="small"><b>Balanceo</b> <span id="mBalTxt"></span></span><div class="bar big"><span id="mBal"></span></div></div>
            <div><span class="small"><b>Bienestar de pasajeros</b> <span id="mBienTxt"></span></span><div class="bar big"><span id="mBien" style="background:var(--ok)"></span></div></div>
          </div>
          <div class="tel-controls">
            <button class="btn tel-btn brake" id="cBrake">▼ Frenar</button>
            <button class="btn tel-btn accel" id="cAccel">▲ Acelerar</button>
            <button class="btn ghost tel-btn" id="cAviso">📢 Avisar</button>
            <button class="btn ghost tel-btn" id="cRadio" disabled>📻 Radio</button>
          </div>
        </div>`;

      const cv = $("#cv"), ctx = cv.getContext("2d");
      const G = {
        tramo: 0, p: 0, v: 3, sway: 0, swayVel: 0, bien: 80, wind: 10, t: 0, paused: false, over: false,
        gust: { st: "none", t: 0, str: 0, braked: false }, nextGust: 3.5, boost: 0,
        accel: false, brake: false, radio: { st: "none", t: 0, at: 0, used: false }, aviso: false, decision: false,
        emergTramo: 0, asistido: false, radioHecha: {}, decisionHecha: {},
        s: { emergencias: 0, gusts: 0, anticip: 0, percib: 0, gustSpeeds: [], radioOK: 0, radioTotal: 0, avisos: 0, data: 0, dec: [], tiempo: 0 }
      };
      const parts = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), l: 0.02 + Math.random() * 0.04 }));
      let W = 0, H = 0, dpr = 1;
      function resize() {
        const stage = $("#stage"); if (!stage) return;
        dpr = window.devicePixelRatio || 1;
        W = stage.clientWidth; H = Math.round(clamp(W * 0.56, 240, 470));
        cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize(); listen(window, "resize", resize);
      function inicioTramo() {
        G.p = 0; G.v = 3; G.sway = 0; G.swayVel = 0; G.gust = { st: "none", t: 0, str: 0, braked: false }; G.nextGust = 3 + Math.random() * 2; G.boost = 0;
        G.radio = { st: "none", t: 0, at: Math.random() < 0.5 ? 22 + Math.random() * 18 : 68 + Math.random() * 18, used: !!G.radioHecha[G.tramo] };
        G.aviso = false; G.decision = !!G.decisionHecha[G.tramo];
        $("#cAviso").disabled = false; $("#cRadio").disabled = true; $("#cRadio").classList.remove("glow");
      }
      inicioTramo();

      // Controles
      const hold = (id, k) => {
        const b = $(id);
        const on = (ev) => { ev.preventDefault(); G[k] = true; b.classList.add("on"); };
        const off = () => { G[k] = false; b.classList.remove("on"); };
        b.addEventListener("pointerdown", on); ["pointerup", "pointerleave", "pointercancel"].forEach((x) => b.addEventListener(x, off));
      };
      hold("#cAccel", "accel"); hold("#cBrake", "brake");
      $("#cAviso").addEventListener("click", avisar);
      $("#cRadio").addEventListener("click", responder);
      listen(document, "keydown", (ev) => {
        if (["ArrowUp", "w", "W"].includes(ev.key)) { G.accel = true; ev.preventDefault(); }
        if (["ArrowDown", "s", "S", " "].includes(ev.key)) { G.brake = true; ev.preventDefault(); }
        if (ev.key === "a" || ev.key === "A") avisar();
        if (ev.key === "r" || ev.key === "R") responder();
      });
      listen(document, "keyup", (ev) => {
        if (["ArrowUp", "w", "W"].includes(ev.key)) G.accel = false;
        if (["ArrowDown", "s", "S", " "].includes(ev.key)) G.brake = false;
      });
      function avisar() {
        if (G.aviso || G.paused) return;
        G.aviso = true; G.s.avisos++; G.bien = clamp(G.bien + 12, 0, 100); $("#cAviso").disabled = true;
        banner("📢 «Estimados pasajeros: todo está bajo control. Les mantendremos informados.»", "info", 2200);
      }
      function responder() {
        if (G.radio.st !== "pend") return;
        G.radio.st = "ok"; G.s.radioOK++; $("#cRadio").disabled = true; $("#cRadio").classList.remove("glow");
        banner(`📻 Confirmado. La estación ${TRAMOS[G.tramo].a} recibe tu posición.`, "info", 1800);
      }
      let bT;
      function banner(txt, tipo, ms) {
        const b = $("#banner"); if (!b) return;
        b.textContent = txt; b.className = "tel-banner " + (tipo || ""); b.hidden = false;
        clearTimeout(bT); if (ms) bT = setTimeout(() => { if ($("#banner")) $("#banner").hidden = true; }, ms);
      }

      function overlay(html) { const o = $("#ov"); o.innerHTML = html; o.hidden = false; G.paused = true; }
      function cerrarOverlay() { const o = $("#ov"); o.hidden = true; o.innerHTML = ""; G.paused = false; }

      function emergencia() {
        G.s.emergencias++; G.emergTramo++;
        if (G.emergTramo >= 2 && !G.asistido) G.asistido = true;
        G.accel = G.brake = false;
        overlay(`<div class="tel-modal"><h3>🚨 Parada de emergencia</h3><p>La cabina se balanceó demasiado y el sistema de seguridad la detuvo. Los pasajeros están bien, pero hay que reiniciar el tramo.</p>
          ${G.asistido ? '<p class="small">🛟 El centro de control activó el <b>modo asistido</b>: las ráfagas serán más suaves.</p>' : '<p class="small">Consejo: cuando aparezca «RÁFAGA», frena antes de que llegue.</p>'}
          <button class="btn sun" id="rt">Reiniciar el tramo</button></div>`);
        $("#rt").addEventListener("click", () => { inicioTramo(); cerrarOverlay(); });
      }

      function decision() {
        G.decision = true; G.decisionHecha[G.tramo] = true; G.accel = G.brake = false;
        const ev = TEL_EVENTOS[G.tramo], opts = shuffle(ev.o), t0 = performance.now();
        let restante = 20, vioDatos = false;
        overlay(`<div class="tel-modal"><div class="row" style="justify-content:space-between"><b>Decisión de operador</b><span class="timer" id="dt">20s</span></div>
          <p style="font-weight:700">${esc(ev.s)}</p>
          <div><button class="btn ghost sm" id="dd">📊 Ver datos del centro de control</button><p class="small muted" id="ddTxt" hidden style="margin-top:6px">${esc(ev.info)}</p></div>
          <div class="opts" style="margin-top:10px">${opts.map((o, n) => `<button class="opt" data-n="${n}">${esc(o.t)}</button>`).join("")}</div></div>`);
        $("#dd").addEventListener("click", (x) => { x.target.disabled = true; $("#ddTxt").hidden = false; if (!vioDatos) { vioDatos = true; G.s.data++; } });
        const tick = setInterval(() => { restante--; const el = $("#dt"); if (el) el.textContent = restante + "s"; if (restante <= 0) elegir(null); }, 1000);
        onCleanup(() => clearInterval(tick));
        $$("#ov .opt").forEach((b) => b.addEventListener("click", () => elegir(opts[+b.dataset.n])));
        function elegir(o) {
          clearInterval(tick);
          if (G.over) return;
          const rec = { q: o ? o.q : 0, r: o ? o.r : 0.5, e: o ? o.e || 0 : 0, l: o ? o.l || 0 : 0, b: o ? o.b || 0 : 0, timeout: !o, datos: vioDatos, seg: Math.round((performance.now() - t0) / 100) / 10 };
          G.s.dec.push(rec);
          if (o) { G.bien = clamp(G.bien + (o.bien || 0), 0, 100); if (o.r >= 0.8) G.boost = 8; }
          else G.bien = clamp(G.bien - 10, 0, 100);
          const fb = o ? o.f : "Se acabó el tiempo y la cabina siguió sin instrucciones claras.";
          $("#ov").innerHTML = `<div class="tel-modal center"><p style="font-weight:700">${esc(fb)}</p><button class="btn" id="dc">Continuar →</button></div>`;
          $("#dc").addEventListener("click", cerrarOverlay);
        }
      }

      function llegada() {
        G.paused = true;
        const tr = TRAMOS[G.tramo];
        if (G.radio.st === "pend") { G.radio.st = "miss"; $("#cRadio").disabled = true; $("#cRadio").classList.remove("glow"); }
        const ultimo = G.tramo === TRAMOS.length - 1;
        overlay(`<div class="tel-modal center"><div style="font-size:2.4rem">${ultimo ? "🏔️" : "🚉"}</div><h3>Llegaste a ${tr.a}</h3><p>${tr.alt[1].toLocaleString("es-VE")} m de altitud</p>
          ${ultimo ? '<p><b>¡Prueba superada!</b> Llevaste a todos hasta Pico Espejo.</p><button class="btn sun" id="ll">Ver mi licencia de operador →</button>' : '<button class="btn" id="ll">Siguiente tramo →</button>'}</div>`);
        $("#ll").addEventListener("click", () => {
          if (ultimo) return terminar();
          G.tramo++; G.emergTramo = 0; inicioTramo(); cerrarOverlay();
          banner(`Tramo ${G.tramo + 1}: ${TRAMOS[G.tramo].de} → ${TRAMOS[G.tramo].a}`, "info", 2000);
        });
      }

      function update(dt) {
        const tr = TRAMOS[G.tramo];
        G.s.tiempo += dt;
        // Velocidad
        if (G.accel) G.v += 3 * dt;
        if (G.brake) G.v -= 5 * dt;
        G.v = clamp(G.v, 0, G.asistido ? 7 : 10);
        // Ráfagas
        const g = G.gust;
        if (g.st === "none") {
          G.nextGust -= dt;
          if (G.nextGust <= 0) { g.st = "warn"; g.t = 1.9; g.braked = false; g.str = (tr.rafaga[0] + Math.random() * (tr.rafaga[1] - tr.rafaga[0]) + G.boost) * (G.asistido ? 0.6 : 1); banner("⚠️ RÁFAGA EN CAMINO · ¡FRENA!", "warn"); }
        } else if (g.st === "warn") {
          if (G.brake) g.braked = true;
          g.t -= dt;
          if (g.t <= 0) {
            g.st = "on"; g.t = 2.4; G.s.gusts++; if (g.braked) G.s.percib++; if (G.v <= 5) G.s.anticip++; G.s.gustSpeeds.push(G.v);
            banner(`💨 Ráfaga de ${Math.round(g.str + tr.viento)} km/h`, "warn", 2400);
          }
        } else if (g.st === "on") {
          g.t -= dt;
          if (g.t <= 0) { g.st = "none"; G.nextGust = 4.5 + Math.random() * 3; }
        }
        G.wind = tr.viento + (g.st === "on" ? g.str : 0) + Math.sin(G.t * 1.7) * 2;
        // Balanceo (sistema masa-resorte)
        const target = (G.wind / 40) * (0.3 + G.v / 9) * 70;
        G.swayVel += ((target - G.sway) * 7 - G.swayVel * 2.6) * dt;
        G.sway = Math.max(0, G.sway + G.swayVel * dt);
        if (G.sway > 60) G.bien -= 6 * dt * ((G.sway - 60) / 40); else G.bien += 0.8 * dt;
        G.bien = clamp(G.bien, 0, 100);
        if (G.sway >= 100) return emergencia();
        // Radio
        if (!G.radio.used && G.radio.st === "none" && G.p >= G.radio.at) {
          G.radio.st = "pend"; G.radio.t = 6; G.radio.used = true; G.radioHecha[G.tramo] = true; G.s.radioTotal++;
          $("#cRadio").disabled = false; $("#cRadio").classList.add("glow");
          banner(`📻 Estación ${tr.a}: «Operador, ¿confirma su posición?»`, "radio");
        } else if (G.radio.st === "pend") {
          G.radio.t -= dt;
          if (G.radio.t <= 0) { G.radio.st = "miss"; $("#cRadio").disabled = true; $("#cRadio").classList.remove("glow"); banner("📻 Sin respuesta del operador…", "warn", 1500); }
        }
        // Avance
        G.p += G.v * dt * 1.1;
        if (!G.decision && G.p >= 55) return decision();
        if (G.p >= 100) { G.p = 100; return llegada(); }
      }

      // Dibujo
      const ridge = (x, seed, amp) => Math.sin(x * 2.1 + seed) * amp + Math.sin(x * 5.3 + seed * 2) * amp * 0.45 + Math.sin(x * 11 + seed * 3) * amp * 0.15;
      function draw() {
        const tr = TRAMOS[G.tramo], af = (G.tramo + G.p / 100) / TRAMOS.length;
        const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, mix([110, 185, 235], [38, 70, 120], af)); sky.addColorStop(1, mix([210, 236, 250], [150, 175, 210], af));
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
        // Montañas lejanas con nieve
        ctx.fillStyle = mix([125, 150, 185], [95, 110, 140], af);
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H * 0.42 - ridge(x / W, 1 + G.tramo, H * 0.12) - (x / W) * H * 0.1);
        ctx.lineTo(W, H); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.85)";
        for (let x = 0; x <= W; x += 8) { const y = H * 0.42 - ridge(x / W, 1 + G.tramo, H * 0.12) - (x / W) * H * 0.1; if (y < H * 0.3) ctx.fillRect(x, y, 8, 5); }
        // Ladera cercana
        ctx.fillStyle = tr.suelo;
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 6) ctx.lineTo(x, H * 0.95 - (x / W) * H * 0.62 + ridge(x / W, 7 + G.tramo * 2, H * 0.035));
        ctx.lineTo(W, H); ctx.fill();
        // Frailejones del páramo
        if (G.tramo >= 1 && G.tramo <= 2) {
          for (let i = 0; i < 18; i++) {
            const fx = ((i * 97) % 100) / 100 * W, fy = H * 0.95 - (fx / W) * H * 0.62 + 10 + ((i * 31) % 30);
            ctx.fillStyle = "#6b5a3a"; ctx.fillRect(fx, fy - 10, 3, 10);
            ctx.fillStyle = "#c9c36a"; ctx.beginPath(); ctx.arc(fx + 1.5, fy - 12, 5, 0, Math.PI * 2); ctx.fill();
          }
        }
        // Estaciones y cable
        const A = [W * 0.08, H * 0.72], B = [W * 0.92, H * 0.2], M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + H * 0.03];
        const estacion = (x, y, nombre) => {
          ctx.fillStyle = "#e9edf3"; ctx.fillRect(x - 26, y, 52, 30); ctx.fillStyle = "#d62839"; ctx.fillRect(x - 30, y - 6, 60, 8);
          ctx.fillStyle = "#12233d"; ctx.font = "800 12px Nunito, sans-serif"; ctx.textAlign = "center";
          ctx.fillStyle = "rgba(255,255,255,.9)"; const w = ctx.measureText(nombre).width + 10; ctx.fillRect(x - w / 2, y + 34, w, 17);
          ctx.fillStyle = "#12233d"; ctx.fillText(nombre, x, y + 47);
        };
        // Torre intermedia
        ctx.strokeStyle = "#5b6574"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(M[0] - 10, H * 0.95 - (M[0] / W) * H * 0.62 + 6); ctx.lineTo(M[0], M[1]); ctx.lineTo(M[0] + 10, H * 0.95 - (M[0] / W) * H * 0.62 + 6); ctx.stroke();
        const cablePt = (k) => k < 0.5 ? [A[0] + (M[0] - A[0]) * k * 2, A[1] + (M[1] - A[1]) * k * 2 + Math.sin(k * 2 * Math.PI) * 8] : [M[0] + (B[0] - M[0]) * (k - 0.5) * 2, M[1] + (B[1] - M[1]) * (k - 0.5) * 2 + Math.sin((k - 0.5) * 2 * Math.PI) * 8];
        ctx.strokeStyle = "#2a2f38"; ctx.lineWidth = 2;
        for (const off of [0, 5]) { ctx.beginPath(); for (let k = 0; k <= 1.0001; k += 0.02) { const [x, y] = cablePt(k); k === 0 ? ctx.moveTo(x, y - 6 + off) : ctx.lineTo(x, y - 6 + off); } ctx.stroke(); }
        estacion(A[0], A[1] - 4, tr.de); estacion(B[0], B[1] - 4, tr.a);
        // Cabina
        const [cx, cy] = cablePt(G.p / 100);
        const ang = ((G.sway / 100) * 0.38) * Math.sin(G.t * 2.4) + (G.wind > 25 ? 0.05 : 0);
        ctx.save(); ctx.translate(cx, cy - 4); ctx.rotate(ang);
        ctx.fillStyle = "#2a2f38"; ctx.fillRect(-9, -6, 18, 6); ctx.fillRect(-1.5, 0, 3, 30);
        ctx.fillStyle = "#d62839"; ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-30, 30, 60, 42, 8); else ctx.rect(-30, 30, 60, 42);
        ctx.fill();
        ctx.fillStyle = "#e8f4ff"; ctx.fillRect(-25, 36, 50, 15);
        ctx.fillStyle = "#12233d"; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-19 + i * 9.5, 46, 2.6, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = "#fff"; ctx.font = "800 8px Nunito, sans-serif"; ctx.textAlign = "center"; ctx.fillText("MUKUMBARÍ", 0, 64);
        ctx.restore();
        // Viento
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + Math.min(0.5, G.wind / 100)})`; ctx.lineWidth = 1.6;
        parts.forEach((pt) => {
          pt.x += (G.wind / 900) * (G.paused ? 0 : 1); if (pt.x > 1.05) { pt.x = -0.05; pt.y = Math.random(); }
          ctx.beginPath(); ctx.moveTo(pt.x * W, pt.y * H * 0.8); ctx.lineTo((pt.x + pt.l * (G.wind / 25)) * W, pt.y * H * 0.8); ctx.stroke();
        });
        // Neblina en tramos altos
        if (G.tramo >= 2) { ctx.fillStyle = `rgba(235,240,248,${0.12 + 0.08 * Math.sin(G.t)})`; ctx.fillRect(0, H * 0.25, W, H * 0.3); }
        // Aviso de ráfaga
        if (G.gust.st === "warn" && Math.floor(G.t * 6) % 2 === 0) {
          ctx.fillStyle = "#ef5b5b"; ctx.beginPath(); ctx.moveTo(10, H * 0.45); ctx.lineTo(48, H * 0.45 - 22); ctx.lineTo(48, H * 0.45 + 22); ctx.closePath(); ctx.fill();
          ctx.font = "900 14px Nunito, sans-serif"; ctx.textAlign = "left"; ctx.fillText("RÁFAGA", 54, H * 0.45 + 5);
        }
      }
      function hud() {
        const tr = TRAMOS[G.tramo];
        const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
        set("#hTramo", `${G.tramo + 1}/4 · ${tr.de} → ${tr.a}`);
        set("#hAlt", `${Math.round(tr.alt[0] + (tr.alt[1] - tr.alt[0]) * G.p / 100).toLocaleString("es-VE")} m`);
        set("#hVel", `${G.v.toFixed(1)} m/s`);
        set("#hVien", `${Math.round(G.wind)} km/h`);
        const bal = Math.min(100, Math.round(G.sway)), mb = $("#mBal");
        if (mb) { mb.style.width = bal + "%"; mb.style.background = bal > 75 ? "var(--bad)" : bal > 50 ? "var(--sun)" : "var(--teal)"; }
        set("#mBalTxt", bal + " %");
        const mbi = $("#mBien"); if (mbi) mbi.style.width = Math.round(G.bien) + "%";
        set("#mBienTxt", Math.round(G.bien) + " %");
      }
      let last = performance.now(), raf;
      function loop(now) {
        if (G.over) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        G.t += dt;
        if (!G.paused) update(dt);
        draw(); hud();
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
      onCleanup(() => { G.over = true; cancelAnimationFrame(raf); clearTimeout(bT); });
      banner(`Tramo 1: ${TRAMOS[0].de} → ${TRAMOS[0].a} · Mantén ▲ para acelerar`, "info", 2600);

      function terminar() {
        G.over = true; cancelAnimationFrame(raf);
        const s = G.s, dec = s.dec, n = dec.length || 1;
        const timeouts = dec.filter((d) => d.timeout).length;
        const avgQ = avg(dec.map((d) => d.q));
        const sumE = dec.reduce((a, d) => a + d.e, 0), sumL = dec.reduce((a, d) => a + d.l, 0), sumB = dec.reduce((a, d) => a + d.b, 0);
        const maxL = TEL_EVENTOS.reduce((a, ev) => a + Math.max(...ev.o.map((o) => o.l || 0)), 0);
        const maxE = TEL_EVENTOS.reduce((a, ev) => a + Math.max(...ev.o.map((o) => o.e || 0)), 0);
        const gusts = Math.max(1, s.gusts);
        const percepcion = s.percib / gusts, comprension = s.data / TEL_EVENTOS.length, proyeccion = s.anticip / gusts;
        const fastGust = Math.min(4, s.gustSpeeds.filter((v) => v > 7).length);
        const risky = dec.filter((d) => d.r >= 0.8).length;
        const noExpl = R.bart.rondas.filter((r) => !r.exploto);
        const bartAdj = noExpl.length ? avg(noExpl.map((r) => r.cajas)) : 0;
        const propension = Math.round(clamp(0.5 * (bartAdj / 11) * 100 + 0.3 * avg(dec.map((d) => d.r)) * 100 + 0.2 * (avg(s.gustSpeeds) / 10) * 100, 0, 100));
        const autorreg = clamp(100 - timeouts * 20 - s.emergencias * 12, 0, 100);
        const scores = {
          decisiones: Math.round(avgQ * 80 + (1 - timeouts / n) * 20),
          analisis: Math.round(30 * percepcion + 30 * comprension + 40 * proyeccion),
          riesgo: Math.round(clamp(100 - s.emergencias * 20 - risky * 10 - fastGust * 5, 0, 100)),
          equipo: Math.round((s.radioTotal ? s.radioOK / s.radioTotal : 0) * 50 + (sumE / (maxE || 1)) * 50),
          liderazgo: Math.round(clamp((sumL / (maxL || 1)) * 70 + (1 - timeouts / n) * 30, 0, 100)),
          blandas: Math.round(clamp((s.avisos / 4) * 30 + G.bien * 0.35 + autorreg * 0.35 + sumB * 2, 0, 100))
        };
        const general = Math.round(avg(Object.values(scores)));
        S.teleferico = {
          scores, general, estrellas: general >= 80 ? 3 : general >= 60 ? 2 : 1,
          propension, propLabel: propension < 35 ? "Prudente" : propension < 65 ? "Equilibrada" : "Audaz",
          sub: { percepcion: Math.round(percepcion * 100), comprension: Math.round(comprension * 100), proyeccion: Math.round(proyeccion * 100), autorregulacion: autorreg, bienestar: Math.round(G.bien) },
          stats: { emergencias: s.emergencias, rafagas: s.gusts, anticipadas: s.anticip, radio: `${s.radioOK}/${s.radioTotal}`, avisos: s.avisos, datos: s.data, timeouts, tiempo: Math.round(s.tiempo), bartAjustado: Math.round(bartAdj * 10) / 10, bartExplosiones: R.bart.explosiones, bartPuntos: R.bart.puntos }
        };
        save();
        resultadoTeleferico();
      }
    }
  };

  function telefericoHtml() {
    const T = S.teleferico, st = T.stats;
    const orden = Object.entries(T.scores).sort((a, b) => b[1] - a[1]);
    const fuerte = orden.slice(0, 2).map(([k]) => CRITERIOS_TEL[k].nombre.toLowerCase());
    const mejorar = orden.slice(-1).map(([k]) => CRITERIOS_TEL[k].nombre.toLowerCase());
    return `
      <div class="tel-cert">
        <div class="muted small" style="font-weight:800;text-transform:uppercase">Licencia de operador · Teleférico Mukumbarí</div>
        <div class="code" style="font-size:2.4rem">${"★".repeat(T.estrellas)}<span style="opacity:.25">${"★".repeat(3 - T.estrellas)}</span> <span style="font-size:1.4rem">${T.general}/100</span></div>
        <p style="margin:0">Fortalezas: <b>${fuerte.join("</b> y <b>")}</b>. Para seguir creciendo: <b>${mejorar.join("")}</b>. Propensión al riesgo: <b>${T.propLabel}</b> (${T.propension}/100).</p>
      </div>
      <div class="grid g2" style="margin-top:12px">
        <div><h4>Criterios evaluados</h4>${bars(T.scores, CRITERIOS_TEL, () => "#d62839")}</div>
        <div><h4>Evidencias registradas en el juego</h4>
          <table class="small"><tbody>
            <tr><td>Ráfagas anticipadas (frenó antes)</td><td><b>${st.anticipadas}/${st.rafagas}</b></td></tr>
            <tr><td>Paradas de emergencia</td><td><b>${st.emergencias}</b></td></tr>
            <tr><td>Llamadas de radio respondidas</td><td><b>${st.radio}</b></td></tr>
            <tr><td>Avisos a pasajeros</td><td><b>${st.avisos}/4</b></td></tr>
            <tr><td>Consultó datos antes de decidir</td><td><b>${st.datos}/4</b></td></tr>
            <tr><td>Decisiones sin responder a tiempo</td><td><b>${st.timeouts}</b></td></tr>
            <tr><td>Carga de suministros (cajas promedio sin sobrecarga · sobrecargas)</td><td><b>${st.bartAjustado} · ${st.bartExplosiones}</b></td></tr>
            <tr><td>Bienestar final de pasajeros</td><td><b>${T.sub.bienestar} %</b></td></tr>
          </tbody></table></div>
      </div>
      <details style="margin-top:10px"><summary class="small"><b>¿Con qué marco científico se evalúa cada criterio?</b></summary>
        <ul class="small">${Object.entries(CRITERIOS_TEL).map(([k, c]) => `<li><b>${c.nombre}:</b> ${c.marco}.</li>`).join("")}
        <li><b>Análisis (subescalas de Endsley):</b> percepción ${T.sub.percepcion} · comprensión ${T.sub.comprension} · proyección ${T.sub.proyeccion}.</li></ul>
      </details>`;
  }
  function resultadoTeleferico() {
    finishStation("teleferico", telefericoHtml() + `<p class="muted small">Superaste la prueba final. Estos resultados describen cómo actuaste bajo presión en una simulación; conversa sobre ellos con tu orientador(a).</p>`);
  }

  // ===== 6. Carta de navegación =====
  function matches() {
    const r = S.intereses, a = S.aptitudes, c = S.competencias.scores, v = S.valores.scores, w = [3, 2, 1];
    // Afinidad del estilo con cada letra RIASEC (tendencias normalizadas a la mayor = 100)
    const sh = (S.estilo && S.estilo.shares) || { accion: 25, conexion: 25, calma: 25, precision: 25 };
    const mx = Math.max(...TK.map((k) => sh[k])) || 1, n = {}; TK.forEach((k) => (n[k] = (sh[k] / mx) * 100));
    const afin = { R: n.accion, I: n.precision, A: n.conexion, S: (n.conexion + n.calma) / 2, E: (n.accion + n.conexion) / 2, C: (n.precision + n.calma) / 2 };
    return D.CARRERAS.map((k) => {
      const rs = [...k.code].reduce((s, L, i) => s + (r[L] || 0) * w[i], 0) / 6;
      const as = avg(k.apt.map((x) => a[x] || 0));
      const cs = avg(k.comp.map((x) => c[x] || 0));
      const vs = avg(k.val.map((x) => v[x] || 0));
      const es = [...k.code].reduce((s, L, i) => s + (afin[L] || 0) * w[i], 0) / 6;
      return Object.assign({}, k, { score: Math.round(0.5 * rs + 0.2 * as + 0.15 * vs + 0.08 * cs + 0.07 * es), rs, as, vs, cs, es });
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
        En la expedición actuaste con un estilo <b>${D.TENDENCIAS_ESTILO[S.estilo.principal].estilo}</b> (${D.TENDENCIAS_ESTILO[S.estilo.principal].eje.toLowerCase()}), y como operador(a) del teleférico obtuviste <b>${S.teleferico.general}/100</b>, con propensión al riesgo <b>${S.teleferico.propLabel.toLowerCase()}</b>.
        ${p.materias.length ? `Tus materias favoritas (${p.materias.map(esc).join(", ")}) ` : "Tus gustos "}son pistas que vale la pena seguir.</p>
      </div>

      <div class="grid g3" style="margin-top:16px">
        <div class="card"><h3>🎮 Habilidades</h3>${bars(S.aptitudes, D.APTITUDES, (k) => D.APTITUDES[k].color)}</div>
        <div class="card"><h3>⚡ Competencias blandas</h3>${bars(S.competencias.scores, D.COMPETENCIAS, () => "#7a5af5")}</div>
        <div class="card"><h3>💎 Valores</h3><ol class="rank-list">${S.valores.orden.map((k) => `<li>${D.VALORES[k].icono} ${esc(D.VALORES[k].nombre)}</li>`).join("")}</ol></div>
      </div>

      <div class="card" style="margin-top:16px"><h3>🏕️ Estilo de comportamiento</h3>${estiloHtml()}</div>

      <div class="card" style="margin-top:16px"><h3>🚡 Evaluación en acción: operador del teleférico</h3>${telefericoHtml()}</div>

      <h2 style="margin-top:26px">🎯 Rutas profesionales que encajan contigo</h2>
      <p class="muted">La afinidad combina intereses (50 %), habilidades (20 %), valores (15 %), competencias (8 %) y estilo de comportamiento (7 %). Úsala para explorar, no para cerrar puertas.</p>
      <div class="grid g3">
        ${top.slice(0, 6).map((c, i) => `<div class="card career">
          <div class="row" style="justify-content:space-between"><span class="match">${c.score}%</span><span class="tag ${c.tag}">${c.tag}</span></div>
          <b>${i + 1}. ${esc(c.n)}</b>
          <div class="small">${esc(c.d)}</div>
          <div class="small muted">Encaja por: ${[...c.code].slice(0, 2).map((k) => D.RIASEC[k].nombre).join(" + ")} · ${c.apt.map((k) => D.APTITUDES[k].nombre.toLowerCase()).join(", ")} · ${c.val.map((k) => D.VALORES[k].nombre.toLowerCase()).join(", ")}</div>
          <div class="small muted">${areaDe(c).icono} ${esc(areaDe(c).nombre)}</div>
          <div class="where">📍 ${lugares(c)}</div>
        </div>`).join("")}
      </div>

      <div class="card" style="margin-top:16px">
        <h3>🌐 Tu abanico ampliado: la mejor opción en cada área</h3>
        <p class="muted small">Revisamos ${top.length} carreras y oficios de universidades e institutos de todo el país. Así se ve tu mejor opción en cada área del conocimiento, para que no descartes caminos antes de explorarlos.</p>
        <div class="table-wrap"><table><thead><tr><th>Área</th><th>Carrera con mayor afinidad</th><th>Afinidad</th><th>Dónde</th></tr></thead><tbody>
        ${Object.keys(D.AREAS || {}).map((a) => top.find((c) => c.area === a)).filter(Boolean).sort((x, y) => y.score - x.score).map((c) => `<tr><td>${areaDe(c).icono} ${esc(areaDe(c).nombre)}</td><td><b>${esc(c.n)}</b></td><td>${c.score}%</td><td class="small">${esc((c.unis && c.unis.length ? c.unis.slice(0, 3).join(", ") + (c.unis.length > 3 ? "…" : "") : "Ver OPSU"))}</td></tr>`).join("")}
        </tbody></table></div>
      </div>

      <details class="card" style="margin-top:12px"><summary><b>Ver las otras ${top.length - 6} opciones ordenadas por afinidad</b></summary>
        <div class="table-wrap"><table><thead><tr><th>Carrera / oficio</th><th>Área</th><th>Afinidad</th><th>Tipo</th><th>Universidades</th></tr></thead><tbody>
        ${top.slice(6).map((c) => `<tr><td>${esc(c.n)}</td><td>${areaDe(c).icono} ${esc(areaDe(c).nombre)}</td><td>${c.score}%</td><td><span class="tag ${c.tag}">${c.tag}</span></td><td class="small">${esc(c.unis && c.unis.length ? c.unis.join(", ") : "Ver OPSU")}</td></tr>`).join("")}
        </tbody></table></div>
      </details>

      <div class="card" style="margin-top:22px" id="planBox"></div>

      <div class="card" style="margin-top:16px">
        <h3>🗣️ Para conversar con tu orientador(a)</h3>
        <ul>
          <li>¿Qué tienen en común las tres primeras rutas que me salieron? ¿Hay alguna que me sorprenda?</li>
          <li>¿Mis valores principales (${valTop.map((k) => D.VALORES[k].nombre.toLowerCase()).join(", ")}) se cumplen en esas carreras en Venezuela hoy?</li>
          <li>¿Cómo puedo fortalecer <b>${compLow.map((k) => D.COMPETENCIAS[k].corto.toLowerCase()).join("</b> y <b>")}</b> antes de graduarme?</li>
          <li>Mi estilo es <b>${D.TENDENCIAS_ESTILO[S.estilo.principal].estilo}</b>: ¿en qué ambientes de estudio y trabajo me sentiría cómodo(a)? ¿Cómo trabajo mi reto: ${D.TENDENCIAS_ESTILO[S.estilo.principal].reto.toLowerCase()}</li>
          <li>En el teleférico mi criterio más bajo fue <b>${CRITERIOS_TEL[Object.entries(S.teleferico.scores).sort((a, b) => a[1] - b[1])[0][0]].nombre.toLowerCase()}</b>: ¿qué actividades del liceo o la comunidad me ayudarían a desarrollarlo?</li>
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
      valores: S.valores.scores, valoresOrden: S.valores.orden, mitos: S.mitos, estilo: S.estilo, teleferico: S.teleferico,
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
      const sh = {}; let rest = 100; const tk = shuffle(TK);
      tk.forEach((k, i) => { const v = i === 3 ? rest : Math.round(Math.random() * rest * 0.6); sh[k] = v; rest -= v; });
      const ord = TK.slice().sort((x, y) => sh[y] - sh[x]);
      const estilo = { shares: sh, principal: ord[0], secundario: ord[1], confianza: ["Alta", "Alta", "Media", "Baja"][Math.floor(Math.random() * 4)], indicadores: { riesgo: Math.round(Math.random() * 100), cooperacion: Math.round(Math.random() * 100) } };
      const tg = 40 + Math.round(Math.random() * 55);
      const teleferico = { general: tg, estrellas: tg >= 80 ? 3 : tg >= 60 ? 2 : 1, propLabel: ["Prudente", "Equilibrada", "Audaz"][Math.floor(Math.random() * 3)], scores: { decisiones: tg, analisis: tg, riesgo: tg, equipo: tg, liderazgo: tg, blandas: tg } };
      return { app: "navigo", demo: true, teleferico, perfil: { nombre: n + " (ejemplo)", edad: 15 + Math.floor(Math.random() * 3), anio: Math.random() < 0.5 ? "4to año" : "5to año" }, codigo: code, intereses: r, aptitudes: a, competencias: c, valoresOrden: vo, estilo, carreras: [{ n: (car[0] || D.CARRERAS[0]).n, afinidad: 60 + Math.round(Math.random() * 25) }] };
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
        <div class="card"><h3>Estilos de comportamiento</h3>
          <div class="bars">${TK.map((k) => [k, GRUPO.filter((g) => g.estilo && g.estilo.principal === k).length]).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="bar-row"><span>${D.TENDENCIAS_ESTILO[k].estilo}</span><div class="bar"><span style="width:${(v / GRUPO.length) * 100}%;background:${D.TENDENCIAS_ESTILO[k].color}"></span></div><span>${v}</span></div>`).join("")}</div>
          <p class="small" style="margin-top:10px">⚠️ Perfiles con confianza baja (revisar en entrevista): <b>${GRUPO.filter((g) => g.estilo && g.estilo.confianza === "Baja").length}</b></p></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="row" style="justify-content:space-between"><h3 style="margin:0">Estudiantes</h3><button class="btn sm" id="csv">⬇️ Descargar CSV</button></div>
        <div class="table-wrap" style="margin-top:10px"><table>
          <thead><tr><th>Nombre</th><th>Edad</th><th>Año</th><th>Código</th><th>Habilidad top</th><th>Competencia top</th><th>Valor #1</th><th>Estilo</th><th>Confianza</th><th>Teleférico</th><th>Ruta #1</th></tr></thead>
          <tbody>${GRUPO.map((g) => { const r = filaGrupo(g); return `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join("")}</tr>`; }).join("")}</tbody>
        </table></div>
      </div>`;
    $("#csv").addEventListener("click", () => {
      const head = ["Nombre", "Edad", "Año", "Código Holland", "Habilidad top", "Competencia top", "Valor #1", "Estilo", "Confianza del estilo", "Teleférico (puntaje)", "Ruta #1", "Afinidad"];
      const rows = GRUPO.map((g) => filaGrupo(g).concat([(g.carreras && g.carreras[0] && g.carreras[0].afinidad) || ""]));
      const csv = [head].concat(rows).map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\r\n");
      download("navigo-grupo.csv", "﻿" + csv, "text/csv;charset=utf-8");
    });
  }
  function filaGrupo(g) {
    const top = (o, meta) => { const e = Object.entries(o || {}).sort((a, b) => b[1] - a[1])[0]; return e && meta[e[0]] ? (meta[e[0]].corto || meta[e[0]].nombre) : "—"; };
    const p = g.perfil || {};
    return [p.nombre || "—", p.edad || "—", p.anio || "—", g.codigo || "—", top(g.aptitudes, D.APTITUDES), top(g.competencias, D.COMPETENCIAS),
      g.valoresOrden && D.VALORES[g.valoresOrden[0]] ? D.VALORES[g.valoresOrden[0]].nombre : "—",
      g.estilo && D.TENDENCIAS_ESTILO[g.estilo.principal] ? D.TENDENCIAS_ESTILO[g.estilo.principal].estilo : "—",
      (g.estilo && g.estilo.confianza) || "—",
      g.teleferico ? `${g.teleferico.general} ${"★".repeat(g.teleferico.estrellas)}` : "—",
      (g.carreras && g.carreras[0] && g.carreras[0].n) || "—"];
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
        <div class="card"><b>🏕️ Estilo de comportamiento — evaluación basada en juego</b><p class="small">Una misión de rescate en el tepuy Roraima registra decisiones, tiempos, riesgo asumido, reparto de recursos, consulta de información y persistencia ante el error. Se interpreta con un modelo de dos ejes —ritmo (acelerado/pausado) y foco (tareas/personas)— de la tradición de los estilos sociales (Merrill y Reid), que da cuatro estilos: Pionero, Inspirador, Guardián y Estratega. Incluye un índice de confianza del perfil.</p></div>
      </div>
      <div class="card" style="margin-top:16px"><b>🚡 Fase final: operador del Teleférico Mukumbarí</b><p class="small">Videojuego en tiempo real con 4 tramos, de Barinitas a Pico Espejo. El estudiante controla la velocidad frente a ráfagas de viento, responde a la radio de las estaciones, informa a los pasajeros y toma 4 decisiones críticas con tiempo límite. Evalúa toma de decisiones, análisis, gestión del riesgo, trabajo en equipo, liderazgo y habilidades socioemocionales, y entrega una «licencia de operador» al superar la prueba.</p></div>

      <h2 style="margin-top:24px">Marco científico de los análisis</h2>
      <p class="muted small">Cada análisis se apoya en teorías y métodos reconocidos internacionalmente. Los instrumentos de Navigo son adaptaciones gamificadas y deben validarse con estudiantes venezolanos antes de usarse para decisiones institucionales.</p>
      <div class="card table-wrap"><table>
        <thead><tr><th>Qué se analiza</th><th>Teoría o método de referencia</th><th>Dónde se aplica en Navigo</th></tr></thead>
        <tbody>
          <tr><td>Intereses vocacionales</td><td>Teoría RIASEC de Holland (1997); base del O*NET Interest Profiler (Departamento de Trabajo de EE. UU.)</td><td>Sierra Nevada</td></tr>
          <tr><td>Aptitudes cognitivas</td><td>Modelo CHC (Cattell-Horn-Carroll): razonamiento fluido, conocimiento verbal, cálculo y memoria</td><td>Médanos de Coro</td></tr>
          <tr><td>Creatividad</td><td>Pensamiento divergente: Prueba de Usos Alternativos de Guilford (fluidez de ideas)</td><td>La tapara mágica</td></tr>
          <tr><td>Memoria de trabajo visoespacial</td><td>Paradigma de bloques de Corsi</td><td>Cruce del río (Roraima)</td></tr>
          <tr><td>Competencias blandas</td><td>Pruebas de juicio situacional (SJT) + competencias genéricas de la G.O. 38.924 + marco socioemocional CASEL</td><td>Catatumbo</td></tr>
          <tr><td>Valores de trabajo</td><td>Valores laborales de Super y teoría de valores humanos de Schwartz; comparación por pares (Thurstone)</td><td>Salto Ángel</td></tr>
          <tr><td>Estilo de comportamiento</td><td>Estilos sociales de Merrill y Reid (ejes de asertividad y sensibilidad)</td><td>Tepuy Roraima</td></tr>
          <tr><td>Evaluación mediante juego</td><td>Evidence-Centered Design (Mislevy) y evaluación encubierta (Shute): cada acción en el juego es una evidencia de una competencia</td><td>Roraima y teleférico</td></tr>
          <tr><td>Decisiones, liderazgo y cooperación bajo presión</td><td>NOTECHS / Crew Resource Management (habilidades no técnicas de operadores en aviación europea)</td><td>Teleférico</td></tr>
          <tr><td>Análisis de la situación</td><td>Modelo de conciencia situacional de Endsley (1995): percepción, comprensión y proyección</td><td>Teleférico (ráfagas y datos)</td></tr>
          <tr><td>Toma de riesgos</td><td>Balloon Analogue Risk Task (BART, Lejuez et al., 2002): propensión conductual al riesgo</td><td>Carga de suministros (teleférico)</td></tr>
          <tr><td>Proyecto de vida</td><td>Teoría de construcción de carrera de Savickas y metodologías ágiles (Scrum/Kanban)</td><td>Plan en sprints</td></tr>
        </tbody></table></div>

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
