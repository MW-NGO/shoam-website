/* =========================================================
   SHOAM — BACKEND ADAPTER (Supabase)
   ---------------------------------------------------------
   Loaded before site.js on every page. If js/config.js holds a
   project URL and publishable key, this file:

     1. loads supabase-js from the CDN (only when configured),
     2. fetches published projects, members and stories,
     3. puts them in window.SHOAM_REMOTE,
     4. flips SHOAM_BACKEND.active = true.

   site.js then uses that content instead of the files in js/.
   If anything fails (offline, wrong key, missing tables) the
   site quietly falls back to js/data.js — it never goes blank.

   The admin page also uses this file for login, CRUD and photo
   uploads.
   ========================================================= */
(function () {
  "use strict";

  const cfg = window.SHOAM_CONFIG || {};
  const url = String(cfg.supabaseUrl || "").trim();
  const key = String(cfg.supabaseAnonKey || "").trim();
  const bucket = cfg.mediaBucket || "media";
  const configured = /^https?:\/\//i.test(url) && key.length > 20;

  const backend = {
    configured,
    active: false,
    client: null,
    bucket,
    ready: null,
    error: null
  };
  window.SHOAM_BACKEND = backend;
  window.SHOAM_REMOTE = null;

  if (!configured) {
    backend.ready = Promise.resolve(false);
    return;
  }

  /* ---------------------------------------------------------
     Helpers shared with admin.js
     --------------------------------------------------------- */
  function normalizeMember(row) {
    const out = { ...row, group: row.team_group || row.group || "executive" };
    delete out.team_group;
    return out;
  }

  async function fetchPublished(client) {
    const [projects, members, articles] = await Promise.all([
      client.from("projects").select("*").eq("published", true).order("sort_order", { ascending: true }),
      client.from("members").select("*").eq("published", true).order("sort_order", { ascending: true }),
      client.from("articles").select("*").eq("published", true).order("sort_order", { ascending: true }).order("date", { ascending: false })
    ]);

    const failure = [projects, members, articles].find((r) => r && r.error);
    if (failure) throw failure.error;

    return {
      projects: projects.data || [],
      members: (members.data || []).map(normalizeMember),
      articles: articles.data || []
    };
  }

  async function refresh() {
    if (!backend.client) return false;
    try {
      const data = await fetchPublished(backend.client);
      window.SHOAM_REMOTE = data;
      backend.active = true;
      backend.error = null;
      return true;
    } catch (err) {
      // Keep the site usable: fall back to the bundled content.
      backend.active = false;
      backend.error = err;
      window.SHOAM_REMOTE = null;
      console.warn("[SHOAM] Supabase content could not be loaded, using js/data.js instead.", err);
      return false;
    }
  }

  backend.refresh = refresh;

  /* ---------------------------------------------------------
     Bootstrap
     --------------------------------------------------------- */
  backend.ready = (async () => {
    try {
      const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      backend.client = mod.createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storageKey: "shoam-admin-auth"
        }
      });
      await refresh();
    } catch (err) {
      backend.active = false;
      backend.error = err;
      console.warn("[SHOAM] Backend unavailable, using js/data.js instead.", err);
    }
    return backend.active;
  })();

  /* ---------------------------------------------------------
     Auth helpers (used by admin.js)
     --------------------------------------------------------- */
  backend.session = async function () {
    if (!backend.client) return null;
    const { data } = await backend.client.auth.getSession();
    return data.session || null;
  };

  backend.signIn = async function (email, password) {
    if (!backend.client) throw new Error("Supabase is not configured.");
    const { data, error } = await backend.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  };

  backend.signOut = async function () {
    if (backend.client) await backend.client.auth.signOut();
  };

  /* ---------------------------------------------------------
     Content helpers (used by admin.js)
     --------------------------------------------------------- */
  backend.listAll = async function (table) {
    if (!backend.client) throw new Error("Supabase is not configured.");
    const { data, error } = await backend.client
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true })
      .order(table === "articles" ? "date" : "created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  };

  backend.save = async function (table, row) {
    if (!backend.client) throw new Error("Supabase is not configured.");
    const { id, created_at, updated_at, ...payload } = row;
    const query = id
      ? backend.client.from(table).update(payload).eq("id", id).select().single()
      : backend.client.from(table).insert(payload).select().single();
    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  backend.remove = async function (table, id) {
    if (!backend.client) throw new Error("Supabase is not configured.");
    const { error } = await backend.client.from(table).delete().eq("id", id);
    if (error) throw error;
    return true;
  };

  backend.upload = async function (file, folder) {
    if (!backend.client) throw new Error("Supabase is not configured.");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await backend.client.storage.from(bucket).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || "image/jpeg"
    });
    if (error) throw error;
    const { data } = backend.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };
})();
