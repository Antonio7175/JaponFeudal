async function fetchJSON(u){ const r = await fetch(u); if(!r.ok) throw new Error(r.status); return r.json(); }

async function render(){
  document.getElementById("clansLoader")?.classList.add("show");
  const data = await fetchJSON("/directory/clans").catch(()=>[]);
  document.getElementById("clansLoader")?.classList.remove("show");

  const tbody = document.querySelector("#clansTable tbody");
  tbody.innerHTML = "";
  data.forEach(c=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${c.name||""}</td><td>${c.provinceOrigin||""}</td><td>${c.era||""}</td>
                    <td>${c.crestUrl?`<img src="${c.crestUrl}" alt="mon" style="height:26px"/>`:""}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById("clansEmpty").style.display = data.length? "none":"block";
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("clanRefresh")?.addEventListener("click", render);
  document.getElementById("clanSearch")?.addEventListener("input", async (e)=>{
    const term = (e.target.value||"").toLowerCase();
    const data = await fetchJSON("/directory/clans").catch(()=>[]);
    const tbody = document.querySelector("#clansTable tbody"); tbody.innerHTML="";
    const filtered = data.filter(c => (c.name||"").toLowerCase().includes(term));
    filtered.forEach(c=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${c.name||""}</td><td>${c.provinceOrigin||""}</td><td>${c.era||""}</td>
                      <td>${c.crestUrl?`<img src="${c.crestUrl}" alt="mon" style="height:26px"/>`:""}</td>`;
      tbody.appendChild(tr);
    });
    document.getElementById("clansEmpty").style.display = filtered.length? "none":"block";
  });
  render();
});