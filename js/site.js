/* =========================================================
   SHOAM — shared site behaviour + content store
   ========================================================= */
(function () {
  "use strict";

  const ORG = window.SHOAM.org;
  const STORE_KEY = "shoam.content.v1";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------- helpers ---------------- */
  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const slugify = (s) =>
    String(s).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

  const fmtDate = (iso, opts = { day: "numeric", month: "long", year: "numeric" }) => {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-GB", opts);
  };

  const initials = (name) =>
    String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const statusClass = (s) => (/ongoing/i.test(s) ? "live" : /completed/i.test(s) ? "done" : "soon");

  const icon = {
    camera: '<svg viewBox="0 0 24 24"><path d="M3 8h3l2-3h8l2 3h3v12H3z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
    users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 15.5c.6-.3 1.2-.5 2-.5 2.2 0 4 1.8 4 4"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 16.8 6.1 20l1.2-6.5L2.5 8.9 9.1 8 12 2z"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 3l9 17H3z"/><path d="M12 9v5M12 17.5v.5"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>'
  };

  /* ---------------- toast ---------------- */
  let toastTimer = null;
  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      el.innerHTML = icon.check + '<span></span>';
      document.body.appendChild(el);
    }
    $("span", el).textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  /* ---------------- header / menu ---------------- */
  function initChrome() {
    const header = $(".site-header");
    if (header && !header.classList.contains("solid")) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    } else if (header) {
      header.classList.add("scrolled");
    }

    const toggle = $(".nav-toggle");
    const nav = $("#nav");
    if (toggle && nav) {
      const setMenu = (open) => {
        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.style.overflow = open ? "hidden" : "";
      };
      toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
      $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    }

    // active nav link by filename
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$("#nav a, .foot-nav a").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === file || (file === "" && href === "index.html")) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    // fill contact links from config
    $$("[data-contact]").forEach((el) => {
      const kind = el.dataset.contact;
      const val = ORG[kind === "facebook" ? "facebook" : kind];
      if (!val) { el.closest("li")?.remove() || el.remove(); return; }
      el.href = kind === "email" ? "mailto:" + val : kind === "phone" ? "tel:" + val.replace(/\s/g, "") : val;
      if (el.dataset.text === "true") el.textContent = kind === "email" ? val : kind === "phone" ? val : el.textContent;
    });
    $$("[data-org-email]").forEach((el) => {
      if (!ORG.email) { (el.closest("li") || el).remove(); return; }
      el.href = "mailto:" + ORG.email;
      el.textContent = ORG.email;
    });
    $$("[data-org-phone]").forEach((el) => {
      if (!ORG.phone) { (el.closest("li") || el).remove(); return; }
      el.href = "tel:" + ORG.phone.replace(/\s/g, "");
      el.textContent = ORG.phone;
    });
    $$("[data-org-whatsapp]").forEach((el) => {
      if (!ORG.whatsapp) { el.remove(); return; }
      el.href = "https://wa.me/" + ORG.whatsapp;
    });
  }

  /* ---------------- reveal ---------------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------------- store ---------------- */
  function readStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return {
        projects: Array.isArray(data.projects) ? data.projects : [],
        articles: Array.isArray(data.articles) ? data.articles : [],
        members: Array.isArray(data.members) ? data.members : []
      };
    } catch (e) {
      return { projects: [], articles: [], members: [] };
    }
  }

  function writeStore(data) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      // usually the 5MB quota — photos were too large
      return false;
    }
  }

  // Keep the first occurrence of each key so a published copy wins over a stale browser draft.
  function dedupe(items, key) {
    const seen = new Set();
    return items.filter((item) => {
      if (!item || !item[key]) return true;
      if (seen.has(item[key])) return false;
      seen.add(item[key]);
      return true;
    });
  }

  // When Supabase is configured and the fetch succeeded, the database is the
  // source of truth. If it failed, we quietly fall back to the bundled content.
  function live() {
    const b = window.SHOAM_BACKEND;
    return b && b.active && window.SHOAM_REMOTE ? window.SHOAM_REMOTE : null;
  }

  const store = {
    read: readStore,
    projects() {
      const remote = live();
      if (remote) return remote.projects || [];
      const published = (window.SHOAM_LOCAL && Array.isArray(window.SHOAM_LOCAL.projects)) ? window.SHOAM_LOCAL.projects : [];
      return dedupe([
        ...published,
        ...readStore().projects.map((p) => ({ ...p, local: true })),
        ...(window.SHOAM.projects || [])
      ], "slug");
    },
    articles() {
      const remote = live();
      if (remote) return remote.articles || [];
      const published = (window.SHOAM_LOCAL && Array.isArray(window.SHOAM_LOCAL.articles)) ? window.SHOAM_LOCAL.articles : [];
      return dedupe([
        ...published,
        ...readStore().articles.map((a) => ({ ...a, local: true })),
        ...(window.SHOAM.articles || [])
      ], "slug");
    },
    members() {
      const remote = live();
      if (remote) return remote.members || [];
      const published = (window.SHOAM_LOCAL && Array.isArray(window.SHOAM_LOCAL.members)) ? window.SHOAM_LOCAL.members : [];
      return dedupe([
        ...(window.SHOAM.team || []),
        ...published,
        ...readStore().members.map((m) => ({ ...m, local: true }))
      ], "name");
    },
    findProject(slug) { return store.projects().find((p) => p.slug === slug); },
    findArticle(slug) { return store.articles().find((a) => a.slug === slug); },
    addProject(p) {
      const data = readStore();
      data.projects.unshift(p);
      return writeStore(data);
    },
    addArticle(a) {
      const data = readStore();
      data.articles.unshift(a);
      return writeStore(data);
    },
    removeProject(slug) {
      const data = readStore();
      data.projects = data.projects.filter((p) => p.slug !== slug);
      writeStore(data);
    },
    removeArticle(slug) {
      const data = readStore();
      data.articles = data.articles.filter((a) => a.slug !== slug);
      writeStore(data);
    },
    reset() { localStorage.removeItem(STORE_KEY); },
    export() {
      return JSON.stringify(readStore(), null, 2);
    }
  };

  /* ---------------- backend content ready ---------------- */
  const contentListeners = [];
  let contentReady = false;

  // Page scripts call this once with a render function. If the database
  // already answered, it runs immediately; otherwise it waits.
  function onContent(fn) {
    if (contentReady) {
      try { fn(); } catch (e) { console.error(e); }
      return;
    }
    contentListeners.push(fn);
  }

  // With a real backend the browser studios are not the way content is
  // edited, so remove their public "add" controls instead of leaving
  // buttons that save to localStorage and confuse everyone.
  function hideOfflineStudios() {
    const b = window.SHOAM_BACKEND;
    if (!b || !b.configured) return;
    document.documentElement.classList.add("has-backend");
    ["#open-project-studio", "#fab-project", "#open-story-studio", "#fab-story"].forEach((sel) => {
      const el = $(sel);
      if (el) el.remove();
    });
    $$(".prompt-banner").forEach((el) => {
      if (/team tool|saved in this browser|browser studios/i.test(el.textContent)) el.remove();
    });
  }

  /* ---------------- contact form ---------------- */
  function initContactForm() {
    const form = $("#contact-form");
    if (!form) return;
    const note = $("#form-note");
    const result = $("#form-result");
    let pending = null;

    // Prefill the subject when arriving from "Ask a question", a member card or get-involved.
    const params = new URLSearchParams(location.search);
    const presetSubject = params.get("subject") || (params.get("project") ? "About " + params.get("project") : "");
    if (presetSubject && form.subject && !form.subject.value) form.subject.value = presetSubject;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const subject = form.subject.value.trim() || "Message from the website";

      [form.name, form.email, form.message].forEach((f) => f.classList.remove("invalid"));
      const bad = [];
      if (!name) bad.push(form.name);
      if (!/^\S+@\S+\.\S+$/.test(email)) bad.push(form.email);
      if (message.length < 10) bad.push(form.message);

      if (bad.length) {
        bad.forEach((f) => f.classList.add("invalid"));
        note.className = "form-note err";
        note.textContent = "Please add your name, a valid email and a message of at least 10 characters.";
        bad[0].focus();
        return;
      }

      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

      if (ORG.email) {
        window.location.href = `mailto:${ORG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        note.className = "form-note ok";
        note.textContent = "Your email app should open with the message ready to send.";
        form.reset();
        return;
      }

      // No inbox configured yet: hand the message over through Messenger instead.
      pending = `${message}\n\n— ${name} (${email})`;
      note.className = "form-note ok";
      note.innerHTML = "Your message is ready. Choose how to send it:";
      if (result) {
        result.hidden = false;
        result.innerHTML = `
          <div class="prompt-banner" style="margin-bottom:.8rem">
            ${icon.warn}
            <div><strong>The website inbox is not connected yet.</strong>
            Send this through the Facebook page instead — it reaches the same team.</div>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <a class="btn btn-blue btn-sm" href="${esc(ORG.messenger)}" target="_blank" rel="noopener">${icon.facebook} Open Messenger</a>
            <button class="btn btn-outline btn-sm" type="button" id="copy-msg">${icon.copy} Copy message</button>
          </div>`;
        $("#copy-msg").addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(pending);
            toast("Message copied — paste it into Messenger");
          } catch (err) {
            toast("Could not copy. Please select the text manually.");
          }
        });
      }
    });
  }

  /* ---------------- image handling ---------------- */
  function compressImage(file, maxSide = 1400, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) return reject(new Error("not an image"));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read failed"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("decode failed"));
        img.onload = () => {
          const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------------- shared card templates ---------------- */
  function projectCard(p, i = 0) {
    const cover = (p.photos && p.photos[0]) || "";
    const count = (p.photos || []).length;
    return `
      <button class="project-card reveal reveal-delay-${i % 3}" data-project="${esc(p.slug)}" type="button" aria-label="Open project: ${esc(p.title)}">
        <div class="media">
          ${cover ? `<img src="${esc(cover)}" alt="${esc(p.title)}" loading="lazy">` : `<div class="no-photo">${icon.spark}</div>`}
          <span class="chip ${statusClass(p.status)} on-media">${esc(p.status)}</span>
          ${count > 1 ? `<span class="photo-count">${icon.camera} ${count}</span>` : ""}
        </div>
        <div class="body">
          <h3>${esc(p.title)}</h3>
          <p class="summary">${esc(p.summary)}</p>
          <div class="foot">
            <span>${esc(p.category || "Project")}</span>
            <span class="go">View project ${icon.arrow}</span>
          </div>
        </div>
      </button>`;
  }

  function teamCard(m, i = 0, lead = false) {
    return `
      <button class="team-card ${lead ? "lead" : ""} reveal reveal-delay-${i % 3}" data-member="${esc(m.name)}" type="button" aria-label="Read more about ${esc(m.name)}">
        <div class="team-photo">
          ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" loading="lazy">` : `<div class="initials">${esc(initials(m.name))}</div>`}
        </div>
        <div class="body">
          <h3>${esc(m.name)}</h3>
          <p class="role">${esc(m.role)}</p>
          <p class="focus">${esc(m.focus || m.bio || "")}</p>
          <span class="tag">${esc(m.group === "honorary" ? "Honorary member" : m.group === "executive" ? "Executive member" : m.group === "volunteer" ? "Volunteer" : "Leadership")}</span>
        </div>
      </button>`;
  }

  function articleCard(a, i = 0) {
    return `
      <a class="article-card reveal reveal-delay-${i % 3}" href="article.html?slug=${encodeURIComponent(a.slug)}">
        <div class="media">${a.cover ? `<img src="${esc(a.cover)}" alt="" loading="lazy">` : ""}</div>
        <div class="body">
          <span class="kicker">${esc(a.category || "Story")}</span>
          <h3>${esc(a.title)}</h3>
          <p class="dek">${esc(a.standfirst || "")}</p>
          <div class="meta">
            <span>${esc(a.author || "SHOAM")}</span><span class="dotsep"></span><span>${esc(fmtDate(a.date))}</span>
            ${a.local ? '<span class="dotsep"></span><span style="color:#B3302B">Draft</span>' : ""}
          </div>
        </div>
      </a>`;
  }

  /* ---------------- simple markdown for stories ---------------- */
  function renderStory(md) {
    const inline = (t) =>
      esc(t)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const blocks = String(md).replace(/\r/g, "").split(/\n{2,}/);
    let html = "";
    let inList = false;
    const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };

    blocks.forEach((raw) => {
      const block = raw.trim();
      if (!block) return;

      const img = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (img) {
        closeList();
        html += `<figure><img src="${esc(img[2])}" alt="${esc(img[1])}" loading="lazy">${img[1] ? `<figcaption>${esc(img[1])}</figcaption>` : ""}</figure>`;
        return;
      }
      if (/^###\s+/.test(block)) { closeList(); html += `<h3>${inline(block.replace(/^###\s+/, ""))}</h3>`; return; }
      if (/^##\s+/.test(block)) { closeList(); html += `<h2>${inline(block.replace(/^##\s+/, ""))}</h2>`; return; }
      if (/^>\s?/.test(block)) {
        closeList();
        const lines = block.split("\n").map((l) => l.replace(/^>\s?/, ""));
        const citeLine = lines.find((l) => /^—\s?/.test(l)) || "";
        const quoteLines = lines.filter((l) => !/^—\s?/.test(l));
        html += `<blockquote>${inline(quoteLines.join(" "))}${citeLine ? `<cite>${inline(citeLine.replace(/^—\s?/, ""))}</cite>` : ""}</blockquote>`;
        return;
      }
      if (/^-\s+/.test(block)) {
        const items = block.split("\n").filter((l) => /^-\s+/.test(l)).map((l) => `<li>${inline(l.replace(/^-\s+/, ""))}</li>`);
        html += `<ul>${items.join("")}</ul>`;
        return;
      }
      closeList();
      html += `<p${/^[A-Z0-9"“].{0,40}$/.test(block) ? ' class="lead-in"' : ""}>${inline(block).replace(/\n/g, "<br>")}</p>`;
    });
    closeList();
    return html;
  }

  /* ---------------- expose ---------------- */
  window.SHOAM_UI = { $, $$, esc, slugify, fmtDate, initials, statusClass, icon, toast, store, onContent, compressImage, projectCard, teamCard, articleCard, renderStory };

  /* ---------------- boot ---------------- */
  function renderHome() {
    const fp = $("[data-render='featured-projects']");
    if (fp) {
      const list = store.projects().filter((p) => p.featured).slice(0, 3);
      fp.innerHTML = list.map((p, i) => projectCard(p, i)).join("");
    }
    const ft = $("[data-render='featured-team']");
    if (ft) {
      const list = store.members().filter((m) => m.featured).slice(0, 3);
      ft.innerHTML = list.map((m, i) => teamCard(m, i, true)).join("");
    }
    const fa = $("[data-render='featured-articles']");
    if (fa) {
      const list = store.articles().slice(0, 3);
      fa.innerHTML = list.map((a, i) => articleCard(a, i)).join("");
    }
    // re-observe dynamically added reveal elements
    initReveal();
  }

  function boot() {
    initChrome();
    initReveal();
    initContactForm();
    hideOfflineStudios();

    const backend = window.SHOAM_BACKEND;

    // If a database is configured, wait for it before painting the home
    // cards so visitors never see stale content flash and swap.
    if (!backend || !backend.configured) renderHome();

    const ready = (backend && backend.ready) || Promise.resolve(false);
    ready.then(() => {
      if (backend && backend.configured) renderHome();
      contentReady = true;
      contentListeners.forEach((fn) => {
        try { fn(); } catch (e) { console.error(e); }
      });
      initReveal();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
