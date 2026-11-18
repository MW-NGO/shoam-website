/* =========================================================
   SHOAM — Stories
   listing · filters · writing studio · single story renderer
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, slugify, fmtDate, icon, toast, store, compressImage, renderStory, articleCard } = window.SHOAM_UI;
  const ORG = window.SHOAM.org;

  const LAYOUTS = {
    "feature": { name: "Feature", blurb: "A clean editorial read with a drop cap." },
    "interview": { name: "Interview", blurb: "Q&A styling for conversations." },
    "photo-essay": { name: "Photo essay", blurb: "Let the pictures carry the story." },
    "field-note": { name: "Field note", blurb: "Warm paper, like a page from a notebook." }
  };

  const readTime = (body = "") => Math.max(1, Math.round(String(body).split(/\s+/).length / 200));

  /* =========================================================
     LISTING PAGE
     ========================================================= */
  const listEl = $("#article-list");
  if (listEl) {
    let filter = "All";

    function categories() {
      const set = new Set(store.articles().map((a) => a.category).filter(Boolean));
      return ["All", ...Array.from(set)];
    }

    function renderFilters() {
      const el = $("#article-filters");
      if (!el) return;
      const cats = categories();
      el.innerHTML = cats.map((c) => `<button class="filter" type="button" data-cat="${esc(c)}" aria-pressed="${filter === c}">${esc(c)}</button>`).join("");
      $$("[data-cat]", el).forEach((b) => b.addEventListener("click", () => { filter = b.dataset.cat; renderFilters(); render(); }));
    }

    function render() {
      const all = store.articles();
      const featured = all.find((a) => a.featured) || all[0];
      const featEl = $("#featured-article");
      if (featEl) {
        featEl.innerHTML = featured ? `
          <a class="featured-article" href="article.html?slug=${encodeURIComponent(featured.slug)}">
            <div class="media"><img src="${esc(featured.cover || "")}" alt="" loading="lazy"></div>
            <div class="body">
              <span class="kicker" style="font-family:var(--font-head);font-size:.72rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-700)">Latest · ${esc(featured.category || "Story")}</span>
              <h2>${esc(featured.title)}</h2>
              <p>${esc(featured.standfirst || "")}</p>
              <div class="meta" style="font-size:.8rem;color:var(--muted);margin-bottom:.8rem">${esc(featured.author)} · ${esc(fmtDate(featured.date))} · ${readTime(featured.body)} min read</div>
              <span class="read">Read the story ${icon.arrow}</span>
            </div>
          </a>` : "";
      }

      const rest = all.filter((a) => !featured || a.slug !== featured.slug)
        .filter((a) => filter === "All" || a.category === filter);
      listEl.innerHTML = rest.length
        ? rest.map((a, i) => articleCard(a, i)).join("")
        : `<div class="empty-state" style="grid-column:1/-1"><strong>Nothing here yet.</strong><p>Try another category, or write the first story.</p></div>`;
      $$(".reveal", listEl).forEach((e) => e.classList.add("in"));
    }

    renderFilters();
    render();
    window.SHOAM_UI.onContent(() => { renderFilters(); render(); });
    const root = $("#studio-root");
    if (!root) return;

    root.innerHTML = `
    <div class="studio" id="article-studio" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="story-studio-title">
      <div class="studio-backdrop" data-close-story></div>
      <div class="studio-panel">
        <div class="studio-head">
          <div>
            <h2 id="story-studio-title">Write a story</h2>
            <p>Write it, shape it, see it. The preview on the right is the real article design.</p>
          </div>
          <button class="close" type="button" data-close-story aria-label="Close">${icon.close}</button>
        </div>
        <div class="studio-scroll">
          <div class="prompt-banner">${icon.pen}<div><strong>Stories are how people meet you.</strong>
            A good story has one person, one moment and one honest detail. Skip the press-release voice — write the way you would tell a friend.</div></div>

          <form id="story-form" novalidate>
            <div class="studio-card">
              <div class="field">
                <label for="a-title">Headline <span style="color:var(--danger)">*</span></label>
                <input id="a-title" name="title" type="text" maxlength="110" placeholder="e.g. Education is for all — what that actually means">
              </div>
              <div class="field">
                <label for="a-standfirst">Standfirst <span style="color:var(--danger)">*</span></label>
                <textarea id="a-standfirst" name="standfirst" rows="2" maxlength="240" placeholder="One or two sentences under the headline. Give people a reason to keep reading."></textarea>
              </div>
              <div class="field-row-3">
                <div class="field">
                  <label for="a-category">Category</label>
                  <input id="a-category" name="category" type="text" list="cat-list" placeholder="Essay">
                  <datalist id="cat-list">
                    ${["Essay", "Field notes", "Interview", "Member spotlight", "Opinion", "Project update", "Announcement"].map((c) => `<option>${c}</option>`).join("")}
                  </datalist>
                </div>
                <div class="field">
                  <label for="a-author">Byline</label>
                  <input id="a-author" name="author" type="text" value="Student Helping Organization of Malawi">
                </div>
                <div class="field">
                  <label for="a-date">Date</label>
                  <input id="a-date" name="date" type="date" value="${new Date().toISOString().slice(0, 10)}">
                </div>
              </div>
            </div>

            <div class="studio-card">
              <h3>Cover image</h3>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem" class="cover-grid">
                <label class="dropzone" id="a-drop" for="a-cover" style="padding:1.1rem">
                  ${icon.upload}
                  <strong>Choose a cover photo</strong>
                  <span>The image people see first</span>
                  <input id="a-cover" type="file" accept="image/*">
                </label>
                <div id="a-cover-preview" style="border-radius:12px;overflow:hidden;background:var(--sky);min-height:110px;display:grid;place-items:center;color:var(--muted);font-size:.78rem;border:1px solid rgba(15,63,158,.12)">No cover yet</div>
              </div>
            </div>

            <div class="studio-card">
              <h3>Design this story</h3>
              <p class="help">Same content, four different reading experiences. You can change it any time.</p>
              <div class="chip-select" id="layout-chips" style="gap:.6rem">
                ${Object.entries(LAYOUTS).map(([key, l], i) => `
                  <label style="border-radius:12px;padding:.7rem .9rem;align-items:flex-start;flex-direction:column;gap:.15rem;max-width:170px">
                    <input type="radio" name="layout" value="${key}" ${i === 0 ? "checked" : ""}>
                    <strong style="font-size:.82rem">${l.name}</strong>
                    <span style="font-size:.7rem;opacity:.75;line-height:1.35">${l.blurb}</span>
                  </label>`).join("")}
              </div>
            </div>

            <div class="studio-card">
              <h3>The story <span style="color:var(--danger)">*</span></h3>
              <p class="help">Plain writing, lightly formatted:
                <code>## heading</code> · <code>&gt; pull quote</code> · <code>- list item</code> · <code>**bold**</code> · <code>![caption](link)</code>
              </p>
              <div class="field">
                <textarea id="a-body" name="body" rows="14" placeholder="Start with the moment. Who is in it, and what changed?&#10;&#10;Then widen out: why does it matter for Malawi?&#10;&#10;Finish with what comes next — and how someone can join in."></textarea>
                <span class="hint"><span id="body-count">0</span> characters · <span id="body-read">1</span> min read</span>
              </div>
              <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">
                <label class="btn btn-outline btn-sm" style="cursor:pointer">${icon.camera} Add a photo inside the story
                  <input type="file" id="a-inline" accept="image/*" hidden>
                </label>
                <button class="btn btn-quiet btn-sm" type="button" id="a-quote">Insert pull quote</button>
              </div>
              <div class="field">
                <label for="a-tags">Tags</label>
                <input id="a-tags" name="tags" type="text" placeholder="Leadership, Malawi, Youth">
              </div>
            </div>

            <div class="studio-card">
              <h3>Live preview</h3>
              <div class="studio-preview">
                <div class="sp-media" id="sp-cover"><div class="empty">Cover photo</div></div>
                <div class="sp-body">
                  <span class="chip soon" id="sp-cat">Story</span>
                  <h4 id="sp-title" style="margin-top:.6rem">Your headline</h4>
                  <p id="sp-dek">Your standfirst will appear here.</p>
                  <p style="margin-top:.6rem;font-size:.75rem">${esc(ORG.name)} · today</p>
                </div>
              </div>
              <div class="article-body" id="sp-body" style="margin-top:1rem;box-shadow:none;border:1px solid rgba(15,63,158,.1);padding:1.1rem;font-size:.92rem;max-height:220px;overflow:auto">
                <p style="color:var(--muted);font-family:var(--font-body);font-size:.85rem">Your formatted story will preview here as you type.</p>
              </div>
            </div>

            <div class="prompt-banner">
              ${icon.warn}
              <div><strong>Where this story is saved.</strong>
                Publishing here saves the story in <em>this browser</em> so you can read it immediately. To make it live for everyone, click <strong>Download backup</strong>, paste the contents into <code>js/local-content.js</code>, and upload that file with the rest of the site. Full instructions are in the README.</div>
            </div>
          </form>
        </div>
        <div class="studio-foot">
          <span class="studio-footer-note" id="story-note"></span>
          <span class="grow"></span>
          <button class="btn btn-outline btn-sm" type="button" id="story-export">Download backup</button>
          <button class="btn btn-gold btn-sm" type="button" id="story-publish">Publish story</button>
        </div>
      </div>
    </div>`;

    const studio = $("#article-studio");
    const form = $("#story-form");
    let cover = "";

    function openStudio() {
      studio.classList.add("open");
      studio.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setTimeout(() => $("#a-title")?.focus(), 200);
      updatePreview();
    }
    window.SHOAMStories = { open: openStudio, close: closeStory };
    $$("[data-open-story]").forEach((b) => b.addEventListener("click", openStudio));
    $$("[data-close-story]").forEach((b) => b.addEventListener("click", closeStory));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeStory(); });

    function closeStory() {
      studio.classList.remove("open");
      studio.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    $("#a-cover").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        cover = await compressImage(f, 1600, 0.84);
        $("#a-cover-preview").innerHTML = `<img src="${esc(cover)}" alt="" style="width:100%;height:100%;object-fit:cover">`;
        updatePreview();
        toast("Cover ready");
      } catch (err) { toast("That image could not be read."); }
    });

    $("#a-inline").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const data = await compressImage(f, 1400, 0.82);
        const caption = prompt("Caption for this photo (optional):", "") || "";
        const ta = form.body;
        const pos = ta.selectionStart ?? ta.value.length;
        const snippet = `\n\n![${caption}](${data})\n\n`;
        ta.value = ta.value.slice(0, pos) + snippet + ta.value.slice(pos);
        updatePreview();
        toast("Photo added to the story");
      } catch (err) { toast("That image could not be read."); }
    });

    $("#a-quote").addEventListener("click", () => {
      const quote = prompt("The pull quote:", "");
      if (!quote) return;
      const ta = form.body;
      const pos = ta.selectionStart ?? ta.value.length;
      ta.value = ta.value.slice(0, pos) + `\n\n> ${quote}\n\n` + ta.value.slice(pos);
      updatePreview();
    });

    const sync = () => updatePreview();
    ["input", "change"].forEach((ev) => form.addEventListener(ev, sync));

    function updatePreview() {
      const title = form.title.value.trim();
      $("#sp-title").textContent = title || "Your headline";
      $("#sp-dek").textContent = form.standfirst.value.trim() || "Your standfirst will appear here.";
      $("#sp-cat").textContent = form.category.value.trim() || "Story";
      $("#body-count").textContent = form.body.value.length;
      const wordCount = form.body.value.trim() ? form.body.value.trim().split(/\s+/).length : 0;
      const readEl = $("#body-read");
      if (readEl) readEl.textContent = Math.max(1, Math.round(wordCount / 200));
      const media = $("#sp-cover");
      media.innerHTML = cover ? `<img src="${esc(cover)}" alt="" style="width:100%;height:100%;object-fit:cover">` : '<div class="empty">Cover photo</div>';
      const body = $("#sp-body");
      body.innerHTML = form.body.value.trim()
        ? renderStory(form.body.value)
        : '<p style="color:var(--muted);font-family:var(--font-body);font-size:.85rem">Your formatted story will preview here as you type.</p>';
    }

    $("#story-publish").addEventListener("click", () => {
      const title = form.title.value.trim();
      const dek = form.standfirst.value.trim();
      const body = form.body.value.trim();
      const bad = [];
      if (title.length < 8) bad.push([form.title, "Give the story a headline (8+ characters)."]);
      if (dek.length < 15) bad.push([form.standfirst, "Write a standfirst — one or two sentences to pull people in."]);
      if (body.length < 120) bad.push([form.body, "The story needs a little more: at least 120 characters."]);
      $$(".invalid", form).forEach((f) => f.classList.remove("invalid"));
      if (bad.length) {
        bad.forEach(([f]) => f.classList.add("invalid"));
        $("#story-note").textContent = bad[0][1];
        $("#story-note").style.color = "var(--danger)";
        bad[0][0].focus();
        toast(bad[0][1]);
        return;
      }

      let slug = slugify(title) || "story-" + Date.now();
      if (store.findArticle(slug)) slug = slug + "-" + Math.random().toString(36).slice(2, 5);

      const article = {
        slug,
        title,
        standfirst: dek,
        category: form.category.value.trim() || "Story",
        author: form.author.value.trim() || ORG.name,
        date: form.date.value || new Date().toISOString().slice(0, 10),
        layout: (form.querySelector("input[name=layout]:checked") || {}).value || "feature",
        cover,
        tags: form.tags.value.split(",").map((s) => s.trim()).filter(Boolean),
        body,
        created: new Date().toISOString()
      };

      if (!store.addArticle(article)) {
        toast("This browser is out of storage. Try a smaller cover photo.");
        return;
      }
      closeStory();
      renderFilters(); render();
      toast("Story published in this browser");
      window.location.href = "article.html?slug=" + encodeURIComponent(slug);
    });

    $("#story-export").addEventListener("click", () => {
      const blob = new Blob([store.export()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "shoam-content.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast("Backup downloaded");
    });
  }

  /* =========================================================
     SINGLE STORY PAGE
     ========================================================= */
  const articleRoot = $("#article-root");
  if (!articleRoot) return;

  const slug = new URLSearchParams(location.search).get("slug");

  function renderArticlePage() {
  const all = store.articles();
  const article = slug ? all.find((a) => a.slug === slug) : all[0];

  if (!article) {
    const missing = slug
      ? "<strong>That story could not be found.</strong><p>It may have been unpublished, or the link may be wrong.</p>"
      : "<strong>No stories yet.</strong><p>Be the first to write one.</p>";
    articleRoot.innerHTML = `<section class="section"><div class="container empty-state">${missing}<a class="btn btn-blue" href="articles.html">Back to stories</a></div></section>`;
    document.title = `Story not found | ${ORG.name}`;
    return;
  }

  document.title = `${article.title} | ${ORG.name}`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", article.standfirst || "");

  const mins = readTime(article.body);
  const tags = (article.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
  const related = all.filter((a) => a.slug !== article.slug).slice(0, 3);

  articleRoot.innerHTML = `
    <div class="reading-progress" id="progress"></div>
    <header class="article-hero">
      <div class="bg">${article.cover ? `<img src="${esc(article.cover)}" alt="">` : ""}</div>
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="articles.html">Stories</a> / <span>${esc(article.category || "Story")}</span></nav>
        <p class="eyebrow">${esc(article.category || "Story")}</p>
        <h1>${esc(article.title)}</h1>
        <p class="dek">${esc(article.standfirst || "")}</p>
        <div class="byline">
          <span class="av">${esc((article.author || "S").slice(0, 2).toUpperCase())}</span>
          <span><strong>${esc(article.author || ORG.name)}</strong>${esc(fmtDate(article.date))} · ${mins} min read</span>
          ${article.local ? '<span class="chip draft" style="margin-left:.4rem">Draft in this browser</span>' : ""}
        </div>
      </div>
    </header>
    <section class="article-layout" style="padding:0 0 70px">
      <div class="container" style="max-width:1080px">
        <div style="display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:2rem;align-items:start" class="story-grid">
          <article class="article-body layout-${esc(article.layout || "feature")}" id="story-body">
            ${renderStory(article.body)}
            <div class="article-tags">${tags}</div>
          </article>
          <aside class="article-side">
            <div class="share" aria-label="Share this story">
              <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">${icon.facebook} Share on Facebook</a>
              <a href="https://wa.me/?text=${encodeURIComponent(article.title + " " + location.href)}" target="_blank" rel="noopener">${icon.users} Share on WhatsApp</a>
              <button type="button" id="copy-link">${icon.copy} Copy link</button>
            </div>
            <div class="author-box">
              <span class="av">${esc((article.author || "S").slice(0, 2).toUpperCase())}</span>
              <div>
                <strong>${esc(article.author || ORG.name)}</strong>
                <p>${esc(ORG.description)}</p>
              </div>
            </div>
            <div class="author-box" style="display:block">
              <p style="margin-bottom:.5rem"><strong>More from Malawi</strong></p>
              ${related.map((r) => `<a href="article.html?slug=${encodeURIComponent(r.slug)}" style="display:block;text-decoration:none;font-size:.82rem;padding:.45rem 0;border-bottom:1px solid rgba(15,63,158,.08);color:var(--navy-800)">${esc(r.title)}</a>`).join("")}
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section tight sand">
      <div class="container">
        <div class="section-head"><p class="eyebrow sand" style="color:var(--gold-700)">Keep reading</p><h2 style="font-size:1.9rem">More stories</h2></div>
        <div class="article-grid">
          ${related.map((r, i) => articleCard(r, i)).join("")}
        </div>
      </div>
    </section>`;

  }

  // Sharing works across re-renders because the listener lives on the document.
  document.addEventListener("click", async (e) => {
    if (!e.target.closest("#copy-link")) return;
    try { await navigator.clipboard.writeText(location.href); toast("Link copied"); }
    catch (err) { toast("Copy the address from your browser bar"); }
  });

  // Reading progress reads the live elements, so it survives a re-render.
  function onScroll() {
    const bar = $("#progress");
    const body = $("#story-body");
    if (!bar || !body) return;
    const rect = body.getBoundingClientRect();
    const total = body.offsetHeight - window.innerHeight * 0.5;
    const done = Math.min(1, Math.max(0, (-rect.top + window.innerHeight * 0.3) / Math.max(total, 1)));
    bar.style.width = (done * 100).toFixed(1) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  const backend = window.SHOAM_BACKEND;
  if (backend && backend.configured && !backend.active) {
    articleRoot.innerHTML = `<section class="section"><div class="container" style="max-width:640px"><p class="eyebrow dark">Loading story</p><p style="color:var(--muted)">Fetching the latest version from the server.</p></div></section>`;
  } else {
    renderArticlePage();
  }

  window.SHOAM_UI.onContent(() => { renderArticlePage(); onScroll(); });
})();
