/* =========================================================
   SHOAM — Projects page
   filters · search · project reader · content studio
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, slugify, statusClass, icon, toast, store, compressImage, projectCard } = window.SHOAM_UI;
  const ORG = window.SHOAM.org;

  const grid = $("#project-grid");
  const countEl = $("#project-count");
  const filtersEl = $("#project-filters");
  const searchEl = $("#project-search");
  if (!grid) return;

  let filter = "All";
  let query = "";

  /* ---------------- listing ---------------- */
  function visible() {
    return store.projects().filter((p) => {
      const okStatus = filter === "All" || (p.status || "").toLowerCase() === filter.toLowerCase();
      const hay = [p.title, p.summary, p.category, p.description, p.location].join(" ").toLowerCase();
      return okStatus && (!query || hay.includes(query));
    });
  }

  function counts() {
    const all = store.projects();
    return {
      All: all.length,
      Ongoing: all.filter((p) => /ongoing/i.test(p.status)).length,
      Upcoming: all.filter((p) => /upcoming/i.test(p.status)).length,
      Completed: all.filter((p) => /completed/i.test(p.status)).length
    };
  }

  function renderFilters() {
    if (!filtersEl) return;
    const c = counts();
    filtersEl.innerHTML = ["All", "Ongoing", "Upcoming", "Completed"]
      .map((f) => `<button class="filter" type="button" data-filter="${f}" aria-pressed="${filter === f}">${f}<span class="count">${c[f]}</span></button>`)
      .join("");
    $$("[data-filter]", filtersEl).forEach((b) => b.addEventListener("click", () => {
      filter = b.dataset.filter;
      renderFilters();
      render();
    }));
  }

  function render() {
    const list = visible();
    grid.innerHTML = list.length
      ? list.map((p, i) => projectCard(p, i)).join("")
      : `<div class="empty-state" style="grid-column:1/-1">
           <strong>No projects match that yet.</strong>
           <p>Try a different filter — or add the project yourself.</p>
           <button class="btn btn-blue btn-sm" type="button" data-open-studio>Add a project</button>
         </div>`;
    if (countEl) countEl.textContent = `${list.length} project${list.length === 1 ? "" : "s"}`;
    $$("[data-project]", grid).forEach((b) => b.addEventListener("click", () => openProject(b.dataset.project)));
    $$("[data-open-studio]", grid).forEach((b) => b.addEventListener("click", openStudio));
    revealNew();
  }

  function revealNew() {
    $$(".reveal:not(.in)", grid).forEach((el) => el.classList.add("in"));
  }

  renderFilters();
  render();
  if (searchEl) searchEl.addEventListener("input", () => { query = searchEl.value.trim().toLowerCase(); render(); });

  window.SHOAM_UI.onContent(() => { renderFilters(); render(); });

  /* ---------------- project reader ---------------- */
  const modal = $("#project-modal");

  function openProject(slug) {
    const p = store.findProject(slug);
    if (!p) return;
    let index = 0;
    const photos = (p.photos || []).filter(Boolean);

    const thumbs = photos.length > 1
      ? `<div class="pd-thumbs" role="tablist" aria-label="Project photos">
          ${photos.map((src, i) => `<button type="button" role="tab" aria-current="${i === 0}" data-thumb="${i}" aria-label="Photo ${i + 1}"><img src="${esc(src)}" alt=""></button>`).join("")}
        </div>` : "";

    const highlights = (p.highlights || []).length
      ? `<div class="pd-desc" style="margin-top:1rem"><strong style="color:var(--navy-800)">What it involves</strong>
          <ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>` : "";

    modal.querySelector(".modal-panel").innerHTML = `
      <button class="modal-close" type="button" aria-label="Close">${icon.close}</button>
      <div class="modal-body">
        <div class="pd">
          <div class="pd-gallery">
            <div class="pd-stage">
              ${photos.length
                ? `<img src="${esc(photos[0])}" alt="${esc(p.title)}" id="pd-img">`
                : `<div class="placeholder">${icon.camera}<p style="margin:.6rem 0 0;font-size:.85rem">No photos yet</p></div>`}
              ${photos.length > 1 ? `<span class="counter" id="pd-counter">1 / ${photos.length}</span>` : ""}
            </div>
            ${thumbs}
          </div>
          <div class="pd-content">
            <div class="pd-top">
              <span class="chip ${statusClass(p.status)}">${esc(p.status)}</span>
              <span class="chip done">${esc(p.category || "Project")}</span>
              ${p.local ? '<span class="chip draft">Added here</span>' : ""}
            </div>
            <h2>${esc(p.title)}</h2>
            <div class="pd-meta">
              ${p.location ? `<span>${icon.pin} ${esc(p.location)}</span>` : ""}
              ${p.timeline ? `<span>${icon.calendar} ${esc(p.timeline)}</span>` : ""}
              ${p.lead ? `<span>${icon.users} ${esc(p.lead)}</span>` : ""}
            </div>
            <p class="pd-summary">${esc(p.summary)}</p>
            <div class="scroll-wrap">
              <div class="scroll-box pd-desc" id="pd-desc" tabindex="0" aria-label="Project description">
                ${String(p.description || "").split(/\n{2,}/).map((para) => {
                  if (/^\s*-\s+/.test(para)) {
                    return `<ul>${para.split("\n").filter(Boolean).map((l) => `<li>${esc(l.replace(/^\s*-\s+/, ""))}</li>`).join("")}</ul>`;
                  }
                  return `<p>${esc(para).replace(/\n/g, "<br>")}</p>`;
                }).join("")}
                ${highlights}
              </div>
            </div>
            <div class="pd-actions">
              <a class="btn btn-blue btn-sm" href="get-involved.html?project=${encodeURIComponent(p.slug)}">Support this project ${icon.arrow}</a>
              <a class="btn btn-outline btn-sm" href="contact.html?subject=${encodeURIComponent("About " + p.title)}">Ask a question</a>
              ${p.local ? `<button class="btn btn-quiet btn-sm" type="button" id="pd-delete" style="color:var(--danger)">Delete local copy</button>` : ""}
            </div>
            <p class="pd-note">Photos and updates are shared first on our <a href="${esc(ORG.facebook)}" target="_blank" rel="noopener" style="color:var(--blue-700)">Facebook page</a>.</p>
          </div>
        </div>
      </div>`;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();

    const desc = modal.querySelector("#pd-desc");
    const wrap = modal.querySelector(".scroll-wrap");
    const syncFade = () => {
      if (!wrap || !desc) return;
      wrap.classList.toggle("at-end", desc.scrollTop + desc.clientHeight >= desc.scrollHeight - 6);
    };
    if (desc) { desc.addEventListener("scroll", syncFade); syncFade(); }

    // gallery
    const setPhoto = (i) => {
      index = (i + photos.length) % photos.length;
      const img = modal.querySelector("#pd-img");
      if (img) {
        img.style.opacity = "0";
        setTimeout(() => { img.src = photos[index]; img.style.opacity = "1"; }, 90);
      }
      const counter = modal.querySelector("#pd-counter");
      if (counter) counter.textContent = `${index + 1} / ${photos.length}`;
      $$("[data-thumb]", modal).forEach((t) => t.setAttribute("aria-current", String(Number(t.dataset.thumb) === index)));
    };
    $$("[data-thumb]", modal).forEach((t) => t.addEventListener("click", () => setPhoto(Number(t.dataset.thumb))));

    const onKey = (e) => {
      if (e.key === "ArrowRight" && photos.length > 1) setPhoto(index + 1);
      if (e.key === "ArrowLeft" && photos.length > 1) setPhoto(index - 1);
    };
    document.addEventListener("keydown", onKey);

    const del = modal.querySelector("#pd-delete");
    if (del) del.addEventListener("click", () => {
      if (!confirm("Remove this project from this browser? The published version (if any) is not affected.")) return;
      store.removeProject(p.slug);
      closeModal();
      renderFilters(); render();
      toast("Local project removed");
    });

    modal.dataset.cleanup = "1";
    modal._cleanup = () => document.removeEventListener("keydown", onKey);
  }

  function closeModal() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
    if (modal._cleanup) modal._cleanup();
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop") || e.target.closest(".modal-close")) closeModal();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* =========================================================
     CONTENT STUDIO — add a project
     ========================================================= */
  const root = $("#studio-root");
  if (!root) return;

  const CATEGORIES = ["Leadership", "Mentorship", "Livelihoods", "Education", "Environment", "Health", "Funding", "Community"];
  let step = 1;
  let photos = [];          // data URLs or paths
  let editing = null;

  root.innerHTML = `
  <div class="studio" id="project-studio" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="studio-title">
    <div class="studio-backdrop" data-close-studio></div>
    <div class="studio-panel">
      <div class="studio-head">
        <div>
          <h2 id="studio-title">Add a project</h2>
          <p>Four short steps. The site checks the important bits before you publish.</p>
        </div>
        <button class="close" type="button" data-close-studio aria-label="Close">${icon.close}</button>
      </div>
      <div class="studio-scroll">
        <div class="stepper" role="tablist" aria-label="Project steps">
          <button type="button" data-step="1" aria-current="true">1 · The basics</button>
          <button type="button" data-step="2">2 · Photos</button>
          <button type="button" data-step="3">3 · The story</button>
          <button type="button" data-step="4">4 · Review</button>
        </div>

        <form id="project-form" novalidate>
          <!-- STEP 1 -->
          <section class="studio-step active" data-panel="1">
            <div class="prompt-banner">${icon.spark}<div><strong>Start with the one-line version.</strong>
              If you can explain the project in a sentence, the rest is easy. You can change everything later.</div></div>
            <div class="studio-card">
              <div class="field">
                <label for="p-title">Project name <span style="color:var(--danger)">*</span></label>
                <input id="p-title" name="title" type="text" placeholder="e.g. Lakeshore Clean-ups" maxlength="90" autocomplete="off">
                <span class="hint">Keep it short and specific. This is the headline people see first.</span>
              </div>
              <div class="field">
                <label for="p-summary">One-sentence summary <span style="color:var(--danger)">*</span></label>
                <textarea id="p-summary" name="summary" rows="2" maxlength="220" placeholder="What happens, for whom, and why it matters — in one breath."></textarea>
                <span class="hint"><span id="summary-count">0</span>/220 · Aim for 15–30 words.</span>
              </div>
              <div class="field">
                <label>Status</label>
                <div class="chip-select" id="status-chips">
                  ${["Ongoing", "Upcoming", "Completed"].map((s) => `<label><input type="radio" name="status" value="${s}" ${s === "Ongoing" ? "checked" : ""}> ${s}</label>`).join("")}
                </div>
              </div>
              <div class="field-row-2">
                <div class="field">
                  <label for="p-category">Category</label>
                  <select id="p-category" name="category">
                    ${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="p-lead">Who leads it?</label>
                  <input id="p-lead" name="lead" type="text" placeholder="Name or team" autocomplete="off">
                </div>
              </div>
              <div class="field-row-2">
                <div class="field">
                  <label for="p-location">Where?</label>
                  <input id="p-location" name="location" type="text" placeholder="e.g. Malawi" autocomplete="off">
                </div>
                <div class="field">
                  <label for="p-timeline">When?</label>
                  <input id="p-timeline" name="timeline" type="text" placeholder="e.g. Rolling cohorts, or March 2027" autocomplete="off">
                </div>
              </div>
              <div class="field" style="padding-bottom:.6rem">
                <label style="display:flex;align-items:center;gap:.5rem;font-weight:500">
                  <input type="checkbox" name="featured" style="width:auto"> Show this project on the home page
                </label>
              </div>
            </div>
          </section>

          <!-- STEP 2 -->
          <section class="studio-step" data-panel="2">
            <div class="prompt-banner">${icon.camera}<div><strong>Photos make people stop scrolling.</strong>
              Add at least one clear photo of real people or the real place. Up to 8 photos; drag them in or tap to choose.</div></div>
            <div class="studio-card" style="padding-bottom:1rem">
              <label class="dropzone" id="p-drop" for="p-photos">
                ${icon.upload}
                <strong>Drop photos here, or tap to browse</strong>
                <span>JPG or PNG · we resize them automatically so the page stays fast</span>
                <input id="p-photos" type="file" accept="image/*" multiple>
              </label>
              <div class="photo-preview-grid" id="p-previews"></div>
              <p class="help" id="photo-help" style="margin-top:.7rem">No photos yet. The first photo becomes the cover — you can change that below.</p>
            </div>
            <div class="studio-card">
              <h3>Photo checklist</h3>
              <ul class="validate-list" style="color:var(--muted)">
                <li class="ok">People doing something, not lined up staring at the camera</li>
                <li class="ok">Daylight, steady hands, faces visible</li>
                <li class="ok">Ask permission before posting anyone's face</li>
              </ul>
            </div>
          </section>

          <!-- STEP 3 -->
          <section class="studio-step" data-panel="3">
            <div class="prompt-banner">${icon.pen}<div><strong>Tell the story, not the brochure.</strong>
              What problem does this solve? What actually happens? What has changed? Write like you are telling a friend.</div></div>
            <div class="studio-card">
              <div class="field">
                <label for="p-description">Project description <span style="color:var(--danger)">*</span></label>
                <textarea id="p-description" name="description" rows="9" placeholder="Three or four short paragraphs is plenty.&#10;&#10;Start with why the project exists. Then say what happens, who it reaches, and what has changed so far."></textarea>
                <span class="hint"><span id="desc-count">0</span> characters · 300+ recommended</span>
              </div>
              <div class="field">
                <label for="p-highlights">What it involves</label>
                <textarea id="p-highlights" name="highlights" rows="3" placeholder="One item per line, e.g.&#10;Weekly mentoring sessions&#10;Transport support for girls&#10;End-of-term community showcase"></textarea>
                <span class="hint">One item per line. These appear as a tidy checklist.</span>
              </div>
            </div>
          </section>

          <!-- STEP 4 -->
          <section class="studio-step" data-panel="4">
            <div class="studio-card" style="padding-bottom:1rem">
              <h3>How it will look</h3>
              <div class="studio-preview">
                <div class="sp-media" id="sp-media"><div class="empty">Your cover photo will appear here</div></div>
                <div class="sp-body">
                  <span class="chip soon" id="sp-status">Ongoing</span>
                  <h4 id="sp-title" style="margin-top:.6rem">Your project name</h4>
                  <p id="sp-summary">Your one-sentence summary will appear here.</p>
                </div>
              </div>
            </div>
            <div class="studio-card" style="padding-bottom:1rem">
              <h3>Before you publish</h3>
              <ul class="validate-list" id="p-checks"></ul>
            </div>
            <div class="studio-card" style="padding-bottom:1rem">
              <h3>Where this is saved</h3>
              <p class="help" style="margin-bottom:.7rem">This static site has no database. Your project is saved in this browser and appears immediately. To make it permanent for everyone, click <strong>Download all site content</strong>, then paste the file's contents into <code>js/local-content.js</code> and upload that file with the site. (The same backup can be restored on another computer.)</p>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                <button class="btn btn-outline btn-sm" type="button" data-export>Download all site content</button>
                <label class="btn btn-quiet btn-sm" style="cursor:pointer">Restore from a backup
                  <input type="file" accept="application/json,.json" id="import-file" hidden>
                </label>
                <button class="btn btn-quiet btn-sm" type="button" data-reset style="color:var(--danger)">Clear browser content</button>
              </div>
            </div>
          </section>
        </form>
      </div>
      <div class="studio-foot">
        <button class="btn btn-outline btn-sm" type="button" id="studio-back" hidden>Back</button>
        <span class="grow"></span>
        <span class="studio-footer-note" id="studio-note"></span>
        <button class="btn btn-blue btn-sm" type="button" id="studio-next">Continue ${icon.arrow}</button>
        <button class="btn btn-gold btn-sm" type="button" id="studio-publish" hidden>Publish project</button>
      </div>
    </div>
  </div>`;

  const studio = $("#project-studio");
  const form = $("#project-form");
  const nextBtn = $("#studio-next");
  const backBtn = $("#studio-back");
  const publishBtn = $("#studio-publish");
  const note = $("#studio-note");

  function openStudio() {
    studio.classList.add("open");
    studio.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    go(1);
    setTimeout(() => $("#p-title")?.focus(), 220);
  }
  function closeStudio() {
    studio.classList.remove("open");
    studio.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  $$("[data-close-studio]").forEach((b) => b.addEventListener("click", closeStudio));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && studio.classList.contains("open")) closeStudio(); });
  window.SHOAMProjects = { openStudio, closeStudio };
  $$("[data-open-studio]").forEach((b) => b.addEventListener("click", openStudio));

  function go(n) {
    step = Math.max(1, Math.min(4, n));
    $$(".studio-step", studio).forEach((s) => s.classList.toggle("active", Number(s.dataset.panel) === step));
    $$(".stepper button", studio).forEach((b) => {
      b.setAttribute("aria-current", String(Number(b.dataset.step) === step));
      b.classList.toggle("done", Number(b.dataset.step) < step);
    });
    backBtn.hidden = step === 1;
    nextBtn.hidden = step === 4;
    publishBtn.hidden = step !== 4;
    studio.querySelector(".studio-scroll").scrollTop = 0;
    if (step === 4) review();
  }

  $$(".stepper button", studio).forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.step))));
  nextBtn.addEventListener("click", () => {
    if (!validateStep(step)) return;
    go(step + 1);
  });
  backBtn.addEventListener("click", () => go(step - 1));

  /* live counters + preview */
  form.summary.addEventListener("input", () => {
    $("#summary-count").textContent = form.summary.value.length;
  });
  form.description.addEventListener("input", () => {
    $("#desc-count").textContent = form.description.value.length;
  });
  $$("input[name=status]", form).forEach((r) => r.addEventListener("change", () => {
    $("#sp-status").textContent = r.value;
    $("#sp-status").className = "chip " + statusClass(r.value);
  }));

  /* photo picker */
  const drop = $("#p-drop");
  const fileInput = $("#p-photos");

  async function addFiles(files) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    const room = 8 - photos.length;
    if (room <= 0) { toast("That is 8 photos — plenty for one project."); return; }
    toast(list.length > room ? `Adding the first ${room} photos (limit is 8)` : "Optimising photos…");
    for (const file of list.slice(0, room)) {
      try {
        const data = await compressImage(file, 1400, 0.82);
        photos.push(data);
      } catch (e) {
        toast("One photo could not be read — try a JPG or PNG.");
      }
    }
    drawPhotos();
  }

  if (fileInput) {
    fileInput.addEventListener("change", (e) => { addFiles(e.target.files); e.target.value = ""; });
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("drag"); }));
    drop.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));
  }

  function drawPhotos() {
    const wrap = $("#p-previews");
    wrap.innerHTML = photos.map((src, i) => `
      <div class="photo-preview">
        <img src="${esc(src)}" alt="Photo ${i + 1}">
        <button class="rm" type="button" data-rm="${i}" aria-label="Remove photo ${i + 1}">×</button>
        ${i === 0
          ? '<span class="cover-tag">Cover</span>'
          : `<button class="make-cover" type="button" data-cover="${i}">Make cover</button>`}
      </div>`).join("");
    $("#photo-help").textContent = photos.length
      ? `${photos.length} photo${photos.length === 1 ? "" : "s"} added. The cover is used on cards and previews.`
      : "No photos yet. The first photo becomes the cover — you can change that below.";
    $$("[data-rm]", wrap).forEach((b) => b.addEventListener("click", () => {
      photos.splice(Number(b.dataset.rm), 1);
      drawPhotos(); drawPreview();
    }));
    $$("[data-cover]", wrap).forEach((b) => b.addEventListener("click", () => {
      const i = Number(b.dataset.cover);
      const [p] = photos.splice(i, 1);
      photos.unshift(p);
      drawPhotos(); drawPreview();
    }));
    drawPreview();
  }

  function drawPreview() {
    const media = $("#sp-media");
    if (!media) return;
    media.innerHTML = photos.length
      ? `<img src="${esc(photos[0])}" alt="">`
      : '<div class="empty">Your cover photo will appear here</div>';
    $("#sp-title").textContent = form.title.value.trim() || "Your project name";
    $("#sp-summary").textContent = form.summary.value.trim() || "Your one-sentence summary will appear here.";
  }
  form.title.addEventListener("input", drawPreview);
  form.summary.addEventListener("input", drawPreview);

  /* validation */
  function validateStep(n) {
    const issues = [];
    if (n === 1) {
      if (form.title.value.trim().length < 4) issues.push({ field: form.title, msg: "Give the project a name (at least 4 characters)." });
      if (form.summary.value.trim().length < 20) issues.push({ field: form.summary, msg: "Write the one-sentence summary — at least 20 characters." });
    }
    if (n === 2 && !photos.length) {
      issues.push({ field: fileInput, msg: "Add at least one photo. A project without a photo rarely gets opened." });
    }
    if (n === 3 && form.description.value.trim().length < 80) {
      issues.push({ field: form.description, msg: "Tell the story in at least a short paragraph (80+ characters)." });
    }
    $$(".invalid", form).forEach((f) => f.classList.remove("invalid"));
    if (issues.length) {
      issues.forEach((i) => i.field?.classList.add("invalid"));
      note.textContent = issues[0].msg;
      note.style.color = "var(--danger)";
      issues[0].field?.focus();
      toast(issues[0].msg);
      return false;
    }
    note.textContent = "";
    return true;
  }

  function review() {
    const checks = [
      { ok: form.title.value.trim().length >= 4, label: "Project name" },
      { ok: form.summary.value.trim().length >= 20, label: "One-sentence summary" },
      { ok: photos.length > 0, label: "At least one photo" },
      { ok: form.description.value.trim().length >= 80, label: "A real description (80+ characters)" }
    ];
    if (photos.length) checks.push({ ok: true, label: `${photos.length} photo${photos.length === 1 ? "" : "s"} ready` });
    $("#p-checks").innerHTML = checks.map((c) => `<li class="${c.ok ? "ok" : ""}">${esc(c.label)}</li>`).join("");
    drawPreview();
    $("#sp-status").textContent = form.status.value;
    $("#sp-status").className = "chip " + statusClass(form.status.value);
  }

  /* publish */
  publishBtn.addEventListener("click", () => {
    [1, 2, 3].forEach((n) => validateStep(n));
    if (!form.title.value.trim() || !form.summary.value.trim() || !photos.length || !form.description.value.trim()) {
      toast("A few things still need attention — check step 4.");
      return;
    }
    const title = form.title.value.trim();
    let slug = slugify(title);
    if (!slug) slug = "project-" + Date.now();
    if (store.findProject(slug)) slug = slug + "-" + Math.random().toString(36).slice(2, 5);

    const project = {
      slug,
      title,
      status: form.status.value,
      category: form.category.value,
      featured: form.featured.checked,
      location: form.location.value.trim(),
      timeline: form.timeline.value.trim(),
      lead: form.lead.value.trim(),
      summary: form.summary.value.trim(),
      description: form.description.value.trim(),
      highlights: form.highlights.value.split("\n").map((s) => s.trim()).filter(Boolean),
      photos,
      created: new Date().toISOString()
    };

    const ok = store.addProject(project);
    if (!ok) {
      toast("This browser is out of storage. Remove a photo and try again, or use smaller images.");
      return;
    }
    closeStudio();
    form.reset();
    photos = [];
    drawPhotos();
    step = 1;
    filter = "All";
    if (searchEl) { searchEl.value = ""; query = ""; }
    renderFilters();
    render();
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Project added. It is live in this browser.");
  });

  /* export / import / reset */
  function download(name, text) {
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  $$("[data-export]", studio).forEach((b) => b.addEventListener("click", () => {
    download("shoam-content.json", store.export());
    toast("Backup downloaded");
  }));

  $("#import-file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        localStorage.setItem("shoam.content.v1", JSON.stringify(data));
        renderFilters(); render();
        closeStudio();
        toast("Content restored from backup");
      } catch (err) {
        toast("That file could not be read.");
      }
    };
    reader.readAsText(file);
  });

  $$("[data-reset]", studio).forEach((b) => b.addEventListener("click", () => {
    if (!confirm("Delete every project and story added in this browser? Drive copies are not affected.")) return;
    store.reset();
    renderFilters(); render();
    closeStudio();
    toast("Browser content cleared");
  }));
})();
