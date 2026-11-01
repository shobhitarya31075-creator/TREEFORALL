// Animated, keyed SVG renderer. Existing node groups are updated in place so
// position and color changes transition instead of redrawing the whole tree.
window.TreeForAllVisualization = {
  lastData: null,
  render(data) {
    this.lastData = data;
    const svg = document.getElementById("tree-svg");
    if (!svg) return;
    const ns = "http://www.w3.org/2000/svg";
    const el = (tag, attrs = {}) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
      return node;
    };
    if (svg.dataset.treeInitialized !== "1") { svg.replaceChildren(); svg.dataset.treeInitialized = "1"; }
    svg.setAttribute("viewBox", "0 0 900 480");
    let title = svg.querySelector("#tree-title");
    if (!title) { title = el("title", {id:"tree-title"}); svg.append(title); }
    title.textContent = "Live Red-Black Tree";
    let desc = svg.querySelector("#tree-desc");
    if (!desc) { desc = el("desc", {id:"tree-desc"}); svg.append(desc); }
    desc.textContent = this.describeTree(data);
    let links = svg.querySelector("#tree-links");
    if (!links) { links = el("g", {id:"tree-links"}); svg.append(links); }
    let nodesLayer = svg.querySelector("#tree-nodes");
    if (!nodesLayer) { nodesLayer = el("g", {id:"tree-nodes"}); svg.append(nodesLayer); }
    links.replaceChildren();

    const nodes = data.nodes || [];
    if (!nodes.length) {
      nodesLayer.querySelectorAll("g[data-node-id]").forEach(g => {
        g.classList.add("node-exit");
        setTimeout(() => g.remove(), 360);
      });
      let empty = svg.querySelector("#tree-empty");
      if (!empty) { empty = el("text", {id:"tree-empty",x:450,y:230,fill:"#aab4ca","font-size":20,"text-anchor":"middle"}); svg.append(empty); }
      empty.textContent = "Your tree is empty — insert a value to begin";
      return;
    }
    const empty = svg.querySelector("#tree-empty"); if (empty) empty.remove();
    const maxDepth = Math.max(...nodes.map(n => n.depth));
    const levelGap = Math.min(100, 350 / Math.max(1, maxDepth));
    const positions = new Map();
    [...nodes].sort((a,b) => a.x_order-b.x_order).forEach((n,i) => {
      positions.set(n.id,{x:25+(i+.5)*(850/nodes.length),y:55+n.depth*levelGap});
    });
    nodes.forEach(n => {
      const p=positions.get(n.id);
      [n.left,n.right].forEach(cid => {
        if (cid !== null && positions.has(cid)) {
          const c=positions.get(cid);
          links.append(el("line",{x1:p.x,y1:p.y+23,x2:c.x,y2:c.y-23,stroke:"#66708a","stroke-width":2.5,"stroke-linecap":"round"}));
        }
      });
    });
    const liveIds = new Set();
    nodes.forEach(n => {
      liveIds.add(String(n.id));
      let g=nodesLayer.querySelector(`g[data-node-id="${n.id}"]`);
      const p=positions.get(n.id), red=n.color==="RED";
      if (!g) {
        g=el("g",{"data-node-id":n.id,opacity:0,transform:`translate(${p.x} ${p.y}) scale(.35)`});
        g.append(el("circle",{r:23,fill:red?"#e34e68":"#20283b",stroke:red?"#ff91a4":"#9aa8c2","stroke-width":2,"data-value":n.value}));
        const label=el("text",{x:0,y:5,fill:"#fff","font-size":14,"font-weight":700,"text-anchor":"middle"});
        label.textContent=n.value;g.append(label);nodesLayer.append(g);
        requestAnimationFrame(()=>{g.setAttribute("opacity","1");g.setAttribute("transform",`translate(${p.x} ${p.y}) scale(1)`);});
      } else {
        g.classList.remove("node-exit");
        g.setAttribute("transform",`translate(${p.x} ${p.y}) scale(1)`);
        const circle=g.querySelector("circle");
        circle.setAttribute("fill",red?"#e34e68":"#20283b");
        circle.setAttribute("stroke",red?"#ff91a4":"#9aa8c2");
        circle.setAttribute("data-value",n.value);
        const label=g.querySelector("text"); if(label)label.textContent=n.value;
      }
    });
    nodesLayer.querySelectorAll("g[data-node-id]").forEach(g=>{
      if(!liveIds.has(g.getAttribute("data-node-id"))){
        g.classList.add("node-exit");g.setAttribute("opacity","0");g.setAttribute("transform",g.getAttribute("transform").replace(/scale\([^)]*\)/,"scale(.25)"));
        setTimeout(()=>g.remove(),380);
      }
    });
  },
  highlight(value, found) {
    const svg=document.getElementById("tree-svg");if(!svg)return;
    svg.querySelectorAll("circle[data-value]").forEach(c=>{
      const active=Number(c.getAttribute("data-value"))===value&&found;
      c.setAttribute("stroke",active?"#facc15":(c.getAttribute("fill")==="#e34e68"?"#ff91a4":"#9aa8c2"));
      c.setAttribute("stroke-width",active?5:2);
    });
  },
  describeTree(data) {
    if(!data||!data.nodes||!data.nodes.length)return "The Red-Black Tree is empty.";
    const root=data.nodes.find(n=>n.id===data.root_id);
    return `Red-Black Tree with ${data.size} nodes. Root is ${root?`${root.value}, ${root.color.toLowerCase()}`:"not available"}. Height is ${data.height}. Inorder traversal: ${(data.traversals?.inorder||[]).join(", ")}. Tree validation ${data.valid?"passed":"failed"}.`;
  }
};
