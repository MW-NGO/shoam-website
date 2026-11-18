/* =========================================================
   SHOAM — Team page
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, initials, icon, store, teamCard } = window.SHOAM_UI;
  const ORG = window.SHOAM.org;

  const leadEl = $("#team-leadership");
  const gridEl = $("#team-grid");
  if (!gridEl) return;

  const LABEL = { leadership: "Leadership", executive: "Executive", volunteer: "Volunteer", honorary: "Honorary" };
  let filter = "All";

  function groupOf(m) { return LABEL[m.group] || "Executive"; }

  function all() {
    // keep config order, then locally added members
    return store.members();
  }

  function renderFilters() {
    const el = $("#team-filters");
    if (!el) return;
    const groups = ["All", ...Object.values(LABEL)];
    const counts = all().reduce((acc, m) => { acc[groupOf(m)] = (acc[groupOf(m)] || 0) + 1; return acc; }, {});
    el.innerHTML = groups.map((g) => {
      const n = g === "All" ? all().length : counts[g] || 0;
      return `<button class="filter" type="button" data-group="${esc(g)}" aria-pressed="${filter === g}">${esc(g)}<span class="count">${n}</span></button>`;
    }).join("");
    $$("[data-group]", el).forEach((b) => b.addEventListener("click", () => {
      filter = b.dataset.group;
      renderFilters();
      render();
      gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  function render() {
    const list = all();
    const isAll = filter === "All";
    const leads = isAll ? list.filter((m) => m.featured) : [];
    const leadSection = $("#leadership-section");
    if (leadSection) leadSection.style.display = isAll ? "" : "none";
    if (leadEl) {
      leadEl.innerHTML = leads.length ? leads.map((m, i) => teamCard(m, i, true)).join("") : "";
      leadEl.style.display = leads.length ? "" : "none";
    }

    const rest = list
      .filter((m) => (isAll ? !m.featured : true))
      .filter((m) => filter === "All" || groupOf(m) === filter);

    gridEl.innerHTML = rest.length
      ? rest.map((m, i) => teamCard(m, i, false)).join("")
      : `<div class="empty-state" style="grid-column:1/-1"><strong>No one in this group yet.</strong><p>That is a gap worth filling — every role matters.</p></div>`;

    $$("[data-member]", document).forEach((b) => b.addEventListener("click", () => openMember(b.dataset.member)));
    $$(".reveal", document).forEach((e) => e.classList.add("in"));
    renderDirectory();
  }

  function renderDirectory() {
    const tbody = $("#dir-body");
    if (!tbody) return;
    const list = all();
    tbody.innerHTML = list.map((m) => `
      <tr>
        <td><span class="who"><span class="mini">${m.photo ? `<img src="${esc(m.photo)}" alt="">` : esc(initials(m.name))}</span>${esc(m.name)}</span></td>
        <td>${esc(m.role)}</td>
        <td>${esc(groupOf(m))}</td>
        <td>${esc(m.based || "Malawi")}</td>
      </tr>`).join("");
    const count = $("#dir-count");
    if (count) count.textContent = list.length;
  }

  /* ---------------- member modal ---------------- */
  const modal = $("#member-modal");
  function openMember(name) {
    const m = all().find((x) => x.name === name);
    if (!m) return;
    modal.querySelector(".modal-panel").innerHTML = `
      <button class="modal-close" type="button" aria-label="Close">${icon.close}</button>
      <div class="modal-body">
        <div class="md">
          <div class="md-photo">
            ${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}">` : `<div class="initials-big">${esc(initials(m.name))}</div>`}
          </div>
          <div class="md-content">
            <span class="chip live">${esc(groupOf(m))}</span>
            <h2 style="margin-top:.6rem">${esc(m.name)}</h2>
            <p class="role">${esc(m.role)}</p>
            <dl class="md-facts">
              ${m.studies ? `<div><dt>Studies</dt><dd>${esc(m.studies)}</dd></div>` : ""}
              ${m.based ? `<div><dt>Based in</dt><dd>${esc(m.based)}</dd></div>` : ""}
              ${m.focus ? `<div><dt>Focus</dt><dd>${esc(m.focus)}</dd></div>` : ""}
            </dl>
            <div class="md-bio scroll-box">${esc(m.bio || "").split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
            ${m.quote ? `<p class="md-quote">“${esc(m.quote)}”</p>` : ""}
            <div class="pd-actions">
              <a class="btn btn-blue btn-sm" href="contact.html?subject=${encodeURIComponent("Message for " + m.name)}">Message the team</a>
              ${m.email ? `<a class="btn btn-outline btn-sm" href="mailto:${esc(m.email)}">Email ${esc(m.name.split(" ")[0])}</a>` : ""}
            </div>
          </div>
        </div>
      </div>`;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
  modal?.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop") || e.target.closest(".modal-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  renderFilters();
  render();

  // page header count
  const total = $("#team-count");
  if (total) total.textContent = all().length;

  // If the database answers after this page has painted, render again.
  window.SHOAM_UI.onContent(() => {
    renderFilters();
    render();
    if (total) total.textContent = all().length;
  });

  // organisation name in copy
  $$("[data-org-name]").forEach((el) => { el.textContent = ORG.name; });
})();
