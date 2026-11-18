/* =========================================================
   SHOAM — Admin / content studio
   ---------------------------------------------------------
   Sign in with a Supabase account, then add or edit projects,
   team members and stories. Saves go straight to the database
   and appear on the public site immediately.
   ========================================================= */
(function () {
  "use strict";

  const backend = window.SHOAM_BACKEND || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const ui = {
    setup: $("#setup"),
    login: $("#login"),
    app: $("#app"),
    loginForm: $("#login-form"),
    loginNote: $("#login-note"),
    email: $("#admin-email")
  };

  const LABEL = { projects: "project", members: "member", articles: "story" };
  const GROUP_LABEL = { leadership: "Leadership", executive: "Executive", volunteer: "Volunteer", honorary: "Honorary" };
  const LAYOUTS = [
    ["feature", "Feature — clean editorial read"],
    ["interview", "Interview — Q&A styling"],
    ["photo-essay", "Photo essay — pictures lead"],
    ["field-note", "Field note — warm notebook page"]
  ];

  const rows = { projects: [], members: [], articles: [] };
  let signedIn = false;
  let loaded = false;

  /* ---------------- small helpers ---------------- */
  const esc = (s = "") =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const slugify = (s) =>
    String(s).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

  const lines = (v) => String(v || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const commas = (v) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
  const today = () => new Date().toISOString().slice(0, 10);

  let toastTimer = null;
  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  function note(el, msg, kind) {
    if (!el) return;
    el.className = "admin-note" + (kind ? " " + kind : "");
    el.textContent = msg || "";
  }

  function show(which) {
    ui.setup.hidden = which !== "setup";
    ui.login.hidden = which !== "login";
    ui.app.hidden = which !== "app";
  }

  /* ---------------- boot ---------------- */
  if (!backend.configured) {
    show("setup");
    return;
  }

  (async function init() {
    await backend.ready;

    if (!backend.client) {
      show("login");
      note(ui.loginNote, "Could not reach Supabase. Check your internet connection and the values in js/config.js.", "err");
      return;
    }

    backend.client.auth.onAuthStateChange((_event, session) => applySession(session));
    applySession(await backend.session());
  })();

  function applySession(session) {
    signedIn = !!session;
    if (!session) {
      ui.app.hidden = true;
      show("login");
      return;
    }
    ui.email.textContent = session.user.email || "Signed in";
    show("app");
    if (!loaded) {
      loaded = true;
      loadAll();
    }
  }

  /* ---------------- auth ---------------- */
  ui.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = ui.loginForm.email.value.trim();
    const password = ui.loginForm.password.value;
    const button = $("#login-submit");

    if (!email || !password) {
      note(ui.loginNote, "Enter both your email and password.", "err");
      return;
    }

    button.disabled = true;
    button.textContent = "Signing in…";
    note(ui.loginNote, "");
    try {
      await backend.signIn(email, password);
      ui.loginForm.reset();
      note(ui.loginNote, "");
    } catch (err) {
      const msg = /invalid login credentials/i.test(err.message || "")
        ? "That email and password do not match an account. Ask the person who set up Supabase to check Authentication → Users."
        : err.message || "Could not sign in.";
      note(ui.loginNote, msg, "err");
    } finally {
      button.disabled = false;
      button.textContent = "Sign in";
    }
  });

  $("#sign-out").addEventListener("click", async () => {
    await backend.signOut();
    loaded = false;
    rows.projects = [];
    rows.members = [];
    rows.articles = [];
    toast("Signed out");
  });

  /* ---------------- lists ---------------- */
  async function loadAll() {
    ["projects", "members", "articles"].forEach((t) => {
      $("#list-" + t).innerHTML = `<div class="empty-state"><strong>Loading…</strong></div>`;
    });
    try {
      const [projects, members, articles] = await Promise.all([
        backend.listAll("projects"),
        backend.listAll("members"),
        backend.listAll("articles")
      ]);
      rows.projects = projects;
      rows.members = members;
      rows.articles = articles;
      renderLists();
    } catch (err) {
      toast("Could not load content: " + (err.message || "unknown error"));
      ["projects", "members", "articles"].forEach((t) => {
        $("#list-" + t).innerHTML = `<div class="empty-state"><strong>Could not load.</strong><p>${esc(err.message || "")}</p></div>`;
      });
    }
  }

  function renderLists() {
    renderList("projects");
    renderList("members");
    renderList("articles");
  }

  function renderList(type) {
    const list = $("#list-" + type);
    const data = rows[type];
    $("#count-" + type).textContent = data.length ? `(${data.length})` : "(empty)";

    if (!data.length) {
      list.innerHTML = `<div class="empty-state"><strong>Nothing here yet.</strong><p>Use “New ${LABEL[type]}” to add the first one.</p></div>`;
      return;
    }

    list.innerHTML = data.map((row) => {
      const title = type === "members" ? row.name : row.title;
      const meta =
        type === "projects" ? [row.status, row.category, row.location].filter(Boolean).join(" · ")
        : type === "members" ? [GROUP_LABEL[row.team_group] || row.team_group, row.role, row.based].filter(Boolean).join(" · ")
        : [row.category, row.author, row.date].filter(Boolean).join(" · ");
      const photo = type === "members" ? row.photo : (row.photos && row.photos[0]) || row.cover || "";

      return `<div class="admin-row">
        ${photo ? `<img class="thumb" src="${esc(photo)}" alt="">` : `<div class="thumb empty">none</div>`}
        <div class="grow">
          <strong>${esc(title || "Untitled")}</strong>
          <small>${esc(meta)}</small>
        </div>
        ${row.featured ? '<span class="flag feat">Featured</span>' : ""}
        <span class="flag ${row.published ? "" : "off"}">${row.published ? "Live" : "Hidden"}</span>
        <div class="actions">
          <button type="button" class="btn btn-outline btn-sm" data-edit="${type}" data-id="${esc(row.id)}">Edit</button>
          <button type="button" class="btn btn-quiet btn-sm" data-del="${type}" data-id="${esc(row.id)}">Delete</button>
        </div>
      </div>`;
    }).join("");
  }

  /* ---------------- tabs / new / edit ---------------- */
  $$("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      $$("[data-tab]").forEach((b) => {
        const on = b === button;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      $$("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });
    });
  });

  document.addEventListener("click", async (e) => {
    const newBtn = e.target.closest("[data-new]");
    if (newBtn) { openEditor(newBtn.dataset.new); return; }

    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) { openEditor(editBtn.dataset.edit, editBtn.dataset.id); return; }

    const delBtn = e.target.closest("[data-del]");
    if (delBtn) {
      const type = delBtn.dataset.del;
      const row = rows[type].find((r) => r.id === delBtn.dataset.id);
      const name = type === "members" ? row?.name : row?.title;
      if (!row) return;
      if (!confirm(`Delete “${name || "this item"}”? This cannot be undone.`)) return;
      try {
        await backend.remove(type, row.id);
        toast("Deleted");
        await loadAll();
      } catch (err) {
        toast("Could not delete: " + (err.message || "unknown error"));
      }
    }
  });

  /* ---------------- editor ---------------- */
  function emptyRow(type) {
    if (type === "projects") {
      return {
        title: "", status: "Ongoing", category: "", summary: "", description: "", lead: "",
        location: "Malawi", timeline: "", highlights: [], photos: [],
        featured: false, published: true, sort_order: rows.projects.length
      };
    }
    if (type === "members") {
      return {
        name: "", role: "", team_group: "executive", studies: "", based: "Malawi", focus: "",
        bio: "", quote: "", email: "", photo: "", featured: false, published: true,
        sort_order: rows.members.length
      };
    }
    return {
      title: "", standfirst: "", category: "Story", author: "SHOAM Communications", date: today(),
      layout: "feature", cover: "", tags: [], body: "", featured: false, published: true,
      sort_order: rows.articles.length
    };
  }

  function options(values, current) {
    return values.map((v) => `<option value="${esc(v)}" ${v === current ? "selected" : ""}>${esc(v)}</option>`).join("");
  }

  function formFields(type, r) {
    if (type === "projects") {
      return `
        <div class="field">
          <label for="f-title">Project name <span style="color:var(--danger)">*</span></label>
          <input id="f-title" name="title" value="${esc(r.title)}" placeholder="e.g. Youth Leadership Training">
        </div>
        <div class="form-row">
          <div class="field">
            <label for="f-status">Status</label>
            <select id="f-status" name="status">${options(["Ongoing", "Upcoming", "Completed"], r.status)}</select>
          </div>
          <div class="field">
            <label for="f-category">Category</label>
            <input id="f-category" name="category" value="${esc(r.category)}" placeholder="Leadership, Health, Livelihoods…">
          </div>
        </div>
        <div class="field">
          <label for="f-summary">One-sentence summary <span style="color:var(--danger)">*</span></label>
          <textarea id="f-summary" name="summary" rows="2">${esc(r.summary)}</textarea>
          <span class="hint">This is what appears on the card. Keep it under about 160 characters.</span>
        </div>
        <div class="form-row">
          <div class="field"><label for="f-location">Location</label><input id="f-location" name="location" value="${esc(r.location)}"></div>
          <div class="field"><label for="f-timeline">Timeline</label><input id="f-timeline" name="timeline" value="${esc(r.timeline)}" placeholder="Rolling cohorts"></div>
        </div>
        <div class="field">
          <label for="f-lead">Who leads it</label>
          <input id="f-lead" name="lead" value="${esc(r.lead)}" placeholder="SHOAM training team">
        </div>
        <div class="field">
          <label for="f-description">Description <span style="color:var(--danger)">*</span></label>
          <textarea id="f-description" name="description" rows="8">${esc(r.description)}</textarea>
          <span class="hint">Plain paragraphs. ## for a heading, - for a list, **bold**, *italic*.</span>
        </div>
        <div class="field">
          <label for="f-highlights">Highlights</label>
          <textarea id="f-highlights" name="highlights" rows="4">${esc((r.highlights || []).join("\n"))}</textarea>
          <span class="hint">One per line. These become the tick list in the project reader.</span>
        </div>
        <div class="field">
          <label>Photos <span style="color:var(--danger)">*</span></label>
          <div class="upload-row">
            <input id="f-photos" type="file" accept="image/*" multiple>
            <span class="hint" id="upload-note">The first photo is the cover. Up to about 8 is sensible.</span>
          </div>
          <div class="photo-strip" id="photo-strip"></div>
        </div>
        <div class="check-row">
          <label><input type="checkbox" name="featured" ${r.featured ? "checked" : ""}> Feature on the home page</label>
          <label><input type="checkbox" name="published" ${r.published !== false ? "checked" : ""}> Show on the public site</label>
        </div>
        <div class="field" style="max-width:220px;margin-top:.7rem">
          <label for="f-order">Position in the list</label>
          <input id="f-order" name="sort_order" type="number" value="${Number(r.sort_order || 0)}">
        </div>`;
    }

    if (type === "members") {
      return `
        <div class="form-row">
          <div class="field">
            <label for="f-name">Full name <span style="color:var(--danger)">*</span></label>
            <input id="f-name" name="name" value="${esc(r.name)}" placeholder="e.g. Pemphero Kamapalira">
          </div>
          <div class="field">
            <label for="f-role">Role</label>
            <input id="f-role" name="role" value="${esc(r.role)}" placeholder="e.g. Vice Secretary">
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label for="f-group">Group</label>
            <select id="f-group" name="team_group">
              ${["leadership", "executive", "volunteer", "honorary"].map((g) => `<option value="${g}" ${g === (r.team_group || "executive") ? "selected" : ""}>${GROUP_LABEL[g]}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="f-based">Based in</label>
            <input id="f-based" name="based" value="${esc(r.based)}" placeholder="Malawi">
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label for="f-studies">Studies / work</label><input id="f-studies" name="studies" value="${esc(r.studies)}" placeholder="Public Health, Domasi Development College"></div>
          <div class="field"><label for="f-focus">Focus</label><input id="f-focus" name="focus" value="${esc(r.focus)}" placeholder="Safeguarding and welfare"></div>
        </div>
        <div class="field">
          <label for="f-bio">Short biography</label>
          <textarea id="f-bio" name="bio" rows="5">${esc(r.bio)}</textarea>
          <span class="hint">Two or three honest sentences. Leave a blank line between paragraphs.</span>
        </div>
        <div class="field">
          <label for="f-quote">Quote <span class="hint" style="display:inline">(optional — only if they actually said it)</span></label>
          <input id="f-quote" name="quote" value="${esc(r.quote)}">
        </div>
        <div class="field">
          <label for="f-email">Email to show publicly <span class="hint" style="display:inline">(optional)</span></label>
          <input id="f-email" name="email" type="email" value="${esc(r.email)}" placeholder="Leave blank to hide">
        </div>
        <div class="field">
          <label>Photo</label>
          <div class="upload-row">
            <input id="f-photo" type="file" accept="image/*">
            <span class="hint" id="upload-note">A clear, recent photo. Ask before publishing a face.</span>
          </div>
          <div class="photo-strip" id="photo-strip"></div>
        </div>
        <div class="check-row">
          <label><input type="checkbox" name="featured" ${r.featured ? "checked" : ""}> Show in the leadership row</label>
          <label><input type="checkbox" name="published" ${r.published !== false ? "checked" : ""}> Show on the public site</label>
        </div>
        <div class="field" style="max-width:220px;margin-top:.7rem">
          <label for="f-order">Position in the list</label>
          <input id="f-order" name="sort_order" type="number" value="${Number(r.sort_order || 0)}">
        </div>`;
    }

    return `
      <div class="field">
        <label for="f-title">Headline <span style="color:var(--danger)">*</span></label>
        <input id="f-title" name="title" value="${esc(r.title)}" placeholder="e.g. Change does not begin with wealth">
      </div>
      <div class="field">
        <label for="f-standfirst">Standfirst</label>
        <textarea id="f-standfirst" name="standfirst" rows="2">${esc(r.standfirst)}</textarea>
        <span class="hint">One or two sentences under the headline. Give people a reason to keep reading.</span>
      </div>
      <div class="form-row">
        <div class="field"><label for="f-category">Category</label><input id="f-category" name="category" value="${esc(r.category)}" placeholder="Essay, Field notes, Opinion…"></div>
        <div class="field"><label for="f-author">Byline</label><input id="f-author" name="author" value="${esc(r.author)}"></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="f-date">Date</label><input id="f-date" name="date" type="date" value="${esc(r.date || today())}"></div>
        <div class="field">
          <label for="f-layout">Layout</label>
          <select id="f-layout" name="layout">${LAYOUTS.map(([v, l]) => `<option value="${v}" ${v === r.layout ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>
        </div>
      </div>
      <div class="field">
        <label for="f-tags">Tags</label>
        <input id="f-tags" name="tags" value="${esc((r.tags || []).join(", "))}" placeholder="Malawi, Students, Education">
        <span class="hint">Separate with commas.</span>
      </div>
      <div class="field">
        <label for="f-body">Story <span style="color:var(--danger)">*</span></label>
        <textarea id="f-body" name="body" rows="14" style="font-family:ui-monospace,monospace;font-size:.86rem">${esc(r.body)}</textarea>
        <span class="hint">## heading · &gt; pull quote · - list item · **bold** · *italic* · ![caption](image-url)</span>
      </div>
      <div class="field">
        <label>Cover photo</label>
        <div class="upload-row">
          <input id="f-cover" type="file" accept="image/*">
          <span class="hint" id="upload-note">Used at the top of the story and on cards.</span>
        </div>
        <div class="photo-strip" id="photo-strip"></div>
      </div>
      <div class="check-row">
        <label><input type="checkbox" name="featured" ${r.featured ? "checked" : ""}> Lead the stories page</label>
        <label><input type="checkbox" name="published" ${r.published !== false ? "checked" : ""}> Show on the public site</label>
      </div>
      <div class="field" style="max-width:220px;margin-top:.7rem">
        <label for="f-order">Position in the list</label>
        <input id="f-order" name="sort_order" type="number" value="${Number(r.sort_order || 0)}">
      </div>`;
  }

  let photos = [];
  let busy = false;

  function renderStrip() {
    const strip = $("#photo-strip");
    if (!strip) return;
    strip.innerHTML = photos.map((url, i) => `
      <div class="photo-tile">
        <img src="${esc(url)}" alt="">
        ${i === 0 ? '<span class="cover-tag">Cover</span>' : ""}
        <div class="tile-tools">
          ${i === 0 ? "<span></span>" : `<button type="button" data-cover="${i}">Cover</button>`}
          <button type="button" data-remove="${i}">Remove</button>
        </div>
      </div>`).join("");
  }

  function openEditor(type, id) {
    const existing = id ? rows[type].find((r) => r.id === id) : null;
    const row = existing ? { ...existing } : emptyRow(type);

    photos = type === "projects" ? [...(row.photos || [])]
      : type === "members" ? (row.photo ? [row.photo] : [])
      : (row.cover ? [row.cover] : []);

    const root = $("#editor-root");
    root.innerHTML = `
      <div class="modal open" id="editor" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <div class="modal-backdrop" data-close-editor></div>
        <div class="modal-panel editor-panel">
          <button class="modal-close" type="button" data-close-editor aria-label="Close">&#10005;</button>
          <div class="modal-body editor-body">
            <h2 id="editor-title">${existing ? "Edit" : "New"} ${LABEL[type]}</h2>
            <p class="hint">${type === "articles" ? "This saves the story for everyone immediately." : "Changes go live on the public site as soon as you save."}</p>
            <form id="editor-form" novalidate style="margin-top:1.1rem">
              ${formFields(type, row)}
              <p class="admin-note" id="editor-note" role="status" aria-live="polite"></p>
              <div class="editor-actions">
                <button class="btn btn-blue" type="submit" id="editor-save">Save</button>
                <button class="btn btn-outline" type="button" data-close-editor>Cancel</button>
                <span class="spacer"></span>
                ${existing ? '<button class="btn btn-quiet" type="button" id="editor-delete">Delete</button>' : ""}
              </div>
            </form>
          </div>
        </div>
      </div>`;

    document.body.style.overflow = "hidden";
    renderStrip();

    const form = $("#editor-form");
    const editorNote = $("#editor-note");

    // photo tools
    $("#photo-strip").addEventListener("click", (e) => {
      const coverBtn = e.target.closest("[data-cover]");
      if (coverBtn) {
        const i = Number(coverBtn.dataset.cover);
        const [moved] = photos.splice(i, 1);
        photos.unshift(moved);
        renderStrip();
        return;
      }
      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        photos.splice(Number(removeBtn.dataset.remove), 1);
        renderStrip();
      }
    });

    const multiple = type === "projects";
    const fileInput = $("#" + (multiple ? "f-photos" : type === "members" ? "f-photo" : "f-cover"));
    fileInput.addEventListener("change", async () => {
      const files = Array.from(fileInput.files || []);
      if (!files.length) return;
      busy = true;
      note(editorNote, "Uploading photo" + (files.length > 1 ? "s" : "") + "…");
      for (const file of files) {
        try {
          const compressed = await compress(file);
          const url = await backend.upload(compressed, type);
          if (multiple) photos.push(url);
          else photos = [url];
          renderStrip();
        } catch (err) {
          note(editorNote, "Upload failed: " + (err.message || "unknown error") + ". Check that the media storage bucket and its policies exist.", "err");
        }
      }
      busy = false;
      fileInput.value = "";
      if (!editorNote.classList.contains("err")) note(editorNote, "Photo ready. Remember to save.");
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) { note(editorNote, "Wait for the photo to finish uploading.", "err"); return; }

      const values = Object.fromEntries(new FormData(form).entries());
      const out = { ...row };

      if (type === "projects") {
        out.title = (values.title || "").trim();
        out.status = values.status || "Ongoing";
        out.category = (values.category || "").trim();
        out.summary = (values.summary || "").trim();
        out.description = (values.description || "").trim();
        out.lead = (values.lead || "").trim();
        out.location = (values.location || "").trim();
        out.timeline = (values.timeline || "").trim();
        out.highlights = lines(values.highlights);
        out.photos = photos;
        out.featured = !!values.featured;
        out.published = !!values.published;
        out.sort_order = Number(values.sort_order || 0);
        out.slug = uniqueSlug(slugify(out.title), type, out.id);

        if (!out.title) return note(editorNote, "Give the project a name.", "err");
        if (!out.summary) return note(editorNote, "Add the one-sentence summary that appears on the card.", "err");
        if (!out.description) return note(editorNote, "Add a description — what it is and why it exists.", "err");
        if (!out.photos.length) return note(editorNote, "Add at least one photo. The first one becomes the cover.", "err");
      }

      if (type === "members") {
        out.name = (values.name || "").trim();
        out.role = (values.role || "").trim();
        out.team_group = values.team_group || "executive";
        out.studies = (values.studies || "").trim();
        out.based = (values.based || "").trim();
        out.focus = (values.focus || "").trim();
        out.bio = (values.bio || "").trim();
        out.quote = (values.quote || "").trim();
        out.email = (values.email || "").trim();
        out.photo = photos[0] || "";
        out.featured = !!values.featured;
        out.published = !!values.published;
        out.sort_order = Number(values.sort_order || 0);

        if (!out.name) return note(editorNote, "A member needs a name.", "err");
        if (!out.bio) return note(editorNote, "Add a short biography so the profile is not empty.", "err");
      }

      if (type === "articles") {
        out.title = (values.title || "").trim();
        out.standfirst = (values.standfirst || "").trim();
        out.category = (values.category || "").trim() || "Story";
        out.author = (values.author || "").trim() || "SHOAM Communications";
        out.date = values.date || today();
        out.layout = values.layout || "feature";
        out.tags = commas(values.tags);
        out.body = (values.body || "").trim();
        out.cover = photos[0] || "";
        out.featured = !!values.featured;
        out.published = !!values.published;
        out.sort_order = Number(values.sort_order || 0);
        out.slug = uniqueSlug(slugify(out.title), type, out.id);

        if (!out.title) return note(editorNote, "Give the story a headline.", "err");
        if (!out.body) return note(editorNote, "The story body cannot be empty.", "err");
        if (!out.standfirst) return note(editorNote, "Add a standfirst — it is what people see before they click.", "err");
        if (!out.cover) return note(editorNote, "Add a cover photo.", "err");
      }

      const saveBtn = $("#editor-save");
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving…";
      note(editorNote, "");
      try {
        await backend.save(type, out);
        closeEditor();
        toast(existing ? "Saved" : "Added");
        await loadAll();
      } catch (err) {
        const msg = /duplicate key/i.test(err.message || "")
          ? "A " + LABEL[type] + " with that name already exists. Change the title slightly."
          : err.message || "Could not save.";
        note(editorNote, msg, "err");
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
      }
    });

    const delBtn = $("#editor-delete");
    if (delBtn) {
      delBtn.addEventListener("click", async () => {
        const name = type === "members" ? row.name : row.title;
        if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
        delBtn.disabled = true;
        try {
          await backend.remove(type, row.id);
          closeEditor();
          toast("Deleted");
          await loadAll();
        } catch (err) {
          note(editorNote, "Could not delete: " + (err.message || "unknown error"), "err");
          delBtn.disabled = false;
        }
      });
    }

    $("#f-title, #f-name").addEventListener("focus", (e) => e.target.select());
    setTimeout(() => $("#f-title, #f-name")?.focus(), 30);
  }

  function uniqueSlug(base, type, currentId) {
    let slug = base || "untitled";
    const taken = new Set(rows[type].filter((r) => r.id !== currentId).map((r) => r.slug));
    if (!taken.has(slug)) return slug;
    let i = 2;
    while (taken.has(`${slug}-${i}`)) i++;
    return `${slug}-${i}`;
  }

  function closeEditor() {
    const root = $("#editor-root");
    if (root) root.innerHTML = "";
    document.body.style.overflow = "";
    photos = [];
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#editor")) closeEditor();
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-editor]")) closeEditor();
  });

  /* ---------------- image compression ---------------- */
  function compress(file, max = 1400, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) { reject(new Error("That file is not an image")); return; }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const scale = Math.min(1, max / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) { reject(new Error("Could not process that image")); return; }
          resolve(new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
        }, "image/jpeg", quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image")); };
      img.src = url;
    });
  }
})();
