// TreeForAll Phase 5: operation timeline, playback, explanations and history.
window.TreeForAllPhase5 = (() => {
  let steps = [], index = 0, timer = null, history = [];
  const $ = id => document.getElementById(id);
  const explain = (before, after, action, value, changed) => {
    if (action === "search") return [
      {title:"Search the tree", detail:`Start at the root and compare each visited value with ${value}.`},
      {title: changed ? "Value found" : "Value not found", detail: changed ? `${value} exists in the current Red-Black Tree.` : `${value} is not present. The tree structure stays unchanged.`}
    ];
    if (!changed) return [{title:"No structural change",detail:`The ${action} operation did not change the tree.`}];
    const out = [];
    if (action === "insert") {
      out.push({title:"BST insertion",detail:`Insert ${value} at the correct position using binary-search-tree ordering. A newly inserted Red-Black Tree node starts red.`});
      const old = new Map((before.nodes||[]).map(n=>[n.id,n]));
      const fresh = (after.nodes||[]).find(n=>!old.has(n.id));
      if (fresh) out.push({title:"New node added",detail:`Node ${value} is now in the tree${fresh.color==="RED"?" and is red.":"."}`});
    } else {
      out.push({title:"Find and remove",detail:`Locate ${value} and remove it while preserving binary-search-tree ordering.`});
      out.push({title:"Restore balance",detail:"Deletion can change the black-height on a path. The Red-Black Tree fix-up restores the coloring and balance rules."});
    }
    const oldNodes = new Map((before.nodes||[]).map(n=>[n.id,n]));
    const recolored = (after.nodes||[]).filter(n=>oldNodes.has(n.id) && oldNodes.get(n.id).color!==n.color);
    if (recolored.length) out.push({title:"Recoloring",detail:`${recolored.map(n=>`${n.value} becomes ${n.color.toLowerCase()}`).join("; ")}. Recoloring helps remove red-red conflicts or restore black-height.`});
    const oldLinks = new Map((before.nodes||[]).map(n=>[n.id,`${n.left}|${n.right}`]));
    const rotated = (after.nodes||[]).some(n=>oldLinks.has(n.id)&&oldLinks.get(n.id)!==`${n.left}|${n.right}`);
    if (rotated) out.push({title:"Structural rebalance",detail:"Parent-child links changed during balancing. This is consistent with a tree rotation or transplant in the Red-Black Tree fix-up."});
    out.push({title:"Validate properties",detail:after.valid ? "The root is black, red nodes have black children, every root-to-leaf path has equal black-height, and BST ordering is preserved." : "The engine reports a validation problem. Inspect the tree engine before continuing."});
    return out;
  };
  function stop(){ if(timer){clearInterval(timer);timer=null;} const b=$("phase5-play");if(b)b.textContent="▶ Play"; }
  function show(){
    if(!steps.length)return;
    const s=steps[index];
    window.TreeForAllVisualization.render(s.snapshot);
    if(s.focus!==undefined && s.focus!==null) window.TreeForAllVisualization.highlight(s.focus,true);
    $("phase5-step-title").textContent=s.title;
    $("phase5-step-detail").textContent=s.detail;
    $("phase5-step-count").textContent=`Step ${index+1} of ${steps.length}`;
    $("phase5-progress").style.width=`${((index+1)/steps.length)*100}%`;
    $("phase5-prev").disabled=index===0;
    $("phase5-next").disabled=index===steps.length-1;
    const alt=$("phase5-live"); if(alt)alt.textContent=`${s.title}. ${s.detail}`;
  }
  function setTimeline(before,after,action,value,changed,events=[]){
    stop();
    steps=[{title:"Before operation",detail:`The tree before ${action} ${value}. Review its current structure and colors.`,snapshot:before,focus:null}];
    if (action !== "search" && changed && events.length) {
      events.forEach(event => steps.push({title:event.title,detail:event.detail,snapshot:event.snapshot,focus:event.focus}));
      if (!events.some(e => e.title === "Insertion complete" || e.title === "Deletion complete"))
        steps.push({title:"Operation complete",detail:after.valid?"The updated tree passes the Red-Black Tree validation checks.":"The updated tree needs validation.",snapshot:after,focus:value});
    } else {
      const descriptions=explain(before,after,action,value,changed);
      descriptions.forEach(d=>steps.push({...d,snapshot:after,focus:action==="search"?value:(after.nodes||[]).find(n=>n.value===value)?.value}));
    }
    index=0; show();
    history.unshift({action,value,changed,valid:after.valid,time:new Date().toLocaleTimeString()});
    history=history.slice(0,10); renderHistory();
  }
  function renderHistory(){
    const list=$("phase5-history"); if(!list)return;
    list.replaceChildren();
    if(!history.length){const li=document.createElement("li");li.textContent="No operations yet.";list.append(li);return;}
    history.forEach(h=>{const li=document.createElement("li");const strong=document.createElement("strong");strong.textContent=`${h.action.toUpperCase()} ${h.value}`;const small=document.createElement("small");small.textContent=`${h.changed?"Changed":"No change"} · ${h.valid?"Valid tree":"Check validation"} · ${h.time}`;li.append(strong,small);list.append(li);});
  }
  function move(delta){stop();index=Math.max(0,Math.min(steps.length-1,index+delta));show();}
  function play(){if(!steps.length)return;if(timer){stop();return;}if(index>=steps.length-1)index=0;show();$("phase5-play").textContent="Ⅱ Pause";const speed=Number($("phase5-speed")?.value)||1800;timer=setInterval(()=>{if(index>=steps.length-1){stop();return;}index++;show();},speed);}
  function init(){
    $("phase5-prev").addEventListener("click",()=>move(-1));
    $("phase5-next").addEventListener("click",()=>move(1));
    $("phase5-play").addEventListener("click",play);
    $("phase5-restart").addEventListener("click",()=>{stop();index=0;show();});
    $("phase5-speed").addEventListener("change",()=>{if(timer){stop();play();}});
    renderHistory();
  }
  document.addEventListener("DOMContentLoaded",init);
  return {setTimeline,stop};
})();
