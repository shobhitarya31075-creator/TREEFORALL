// TreeForAll Phase 4: live frontend/backend integration.
document.addEventListener("DOMContentLoaded", async () => {
  const input = document.getElementById("node-value");
  const message = document.getElementById("operation-message");
  const speechStatus = document.getElementById("speech-status");
  const API = "/api";
  let treeState = null;

  const $ = (id) => document.getElementById(id);
  function announce(text, kind = "") {
    message.textContent = text;
    message.classList.remove("success", "error");
    if (kind) message.classList.add(kind);
  }
  function getValue() {
    const raw = input.value.trim();
    if (!raw) { announce("Please enter a whole number first.", "error"); input.focus(); return null; }
    const value = Number(raw);
    if (!Number.isSafeInteger(value)) {
      announce("Enter a whole number within JavaScript's safe integer range.", "error");
      input.focus(); return null;
    }
    return value;
  }
  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${API}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
      });
    } catch (err) {
      throw new Error("Cannot reach the TreeForAll backend. Start it with the instructions in README.md.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || "The request could not be completed.");
    return data;
  }
  async function refreshTree() {
    const data = await request("/tree");
    treeState = data;
    window.TreeForAllVisualization.render(data);
    updateStats(data);
    updateTraversals(data.traversals || {});
    const badge = document.querySelector(".preview");
    if (badge) { badge.innerHTML = "<i></i> Backend connected"; badge.classList.add("connected"); }
  }
  function updateStats(data) {
    const stats = document.querySelectorAll(".stat");
    if (stats.length >= 4) {
      stats[0].querySelector("strong").textContent = data.root === null ? "—" : data.root;
      stats[0].querySelector("em").textContent = data.root === null ? "Empty tree" : (data.root_color || "Black");
      stats[1].querySelector("strong").textContent = String(data.size).padStart(2, "0");
      stats[1].querySelector("em").textContent = "Live values";
      stats[2].querySelector("strong").textContent = data.height;
      stats[2].querySelector("em").textContent = "Levels";
      stats[3].querySelector("strong").textContent = data.valid ? "Valid" : "Error";
      stats[3].querySelector("strong").classList.toggle("pending", !data.valid);
      stats[3].querySelector("em").textContent = data.valid ? "RB properties pass" : "Check tree engine";
    }
    const foot = document.querySelector(".tree-foot");
    if (foot) foot.innerHTML = `<span>● Root: ${data.root === null ? "—" : `${data.root} (${data.root_color})`}</span><span>${data.size} node${data.size === 1 ? "" : "s"} · Live data</span>`;
    const title = document.querySelector("#tree-title");
    if (title) title.textContent = "Live Red-Black Tree";
    const panelCopy = document.querySelector(".tree-panel .panel-head .muted");
    if (panelCopy) panelCopy.textContent = "Connected to the Python Red-Black Tree engine";
    const alt = $("tree-alt");
    if (alt) alt.textContent = window.TreeForAllVisualization.describeTree(data);
  }
  function updateTraversals(t) {
    const values = [
      ["Inorder", t.inorder], ["Preorder", t.preorder],
      ["Postorder", t.postorder], ["Level order", t.level_order]
    ];
    document.querySelectorAll(".traversal").forEach((row, i) => {
      if (values[i]) row.querySelector("code").textContent = values[i][1]?.length ? values[i][1].join(" → ") : "—";
    });
    const note = document.querySelector(".traversals .small");
    if (note) note.textContent = "Traversal values are returned by the live backend.";
  }
  async function operate(action) {
    const value = getValue();
    if (value === null) return;
    try {
      const before = treeState ? JSON.parse(JSON.stringify(treeState)) : await request("/tree");
      const data = await request(`/${action}`, {
        method: "POST", body: JSON.stringify({ value })
      });
      await refreshTree();
      if (window.TreeForAllPhase5 && treeState) {
        const changed = action === "search" ? !!data.found : !!data.changed;
        window.TreeForAllPhase5.setTimeline(before, treeState, action, value, changed, data.events || []);
      }
      if (action === "search") {
        announce(data.found ? `${value} was found in the tree.` : `${value} was not found in the tree.`, data.found ? "success" : "");
        window.TreeForAllVisualization.highlight(value, !!data.found);
      } else if (action === "insert") {
        announce(data.changed ? `Inserted ${value} and restored Red-Black Tree properties.` : `${value} already exists; duplicates are not inserted.`, data.changed ? "success" : "");
      } else {
        announce(data.changed ? `Deleted ${value} and restored Red-Black Tree properties.` : `${value} was not in the tree; nothing was deleted.`, data.changed ? "success" : "");
      }
    } catch (err) { announce(err.message, "error"); }
  }
  $("insert-btn").addEventListener("click", () => operate("insert"));
  $("delete-btn").addEventListener("click", () => operate("delete"));
  $("search-btn").addEventListener("click", () => operate("search"));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") operate("insert"); });
  $("reset-btn").addEventListener("click", async () => {
    try {
      await request("/reset", { method: "POST", body: JSON.stringify({}) });
      input.value = "";
      await refreshTree();
      announce("Tree reset. The live tree is now empty.", "success");
    } catch (err) { announce(err.message, "error"); }
  });
  $("speak-btn").addEventListener("click", () => {
    const description = treeState ? window.TreeForAllVisualization.describeTree(treeState) : "The tree is loading.";
    window.TreeForAllSpeech.speak(description, text => speechStatus.textContent = text);
  });
  $("stop-btn").addEventListener("click", () => {
    window.TreeForAllSpeech.stop(); speechStatus.textContent = "Speech stopped.";
  });
  try {
    await refreshTree();
    announce("Backend connected. Insert, delete, search, and reset now use the live tree.", "success");
  } catch (err) {
    const badge = document.querySelector(".preview");
    if (badge) badge.textContent = "Backend offline";
    announce(err.message, "error");
  }
});
