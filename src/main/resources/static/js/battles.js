async function fetchJSON(u){ const r = await fetch(u); if(!r.ok) throw new Error(r.status); return r.json(); }

function buildQuery(){
  const clan = (document.getElementById('bClan')?.value||"").trim();
  const warrior = (document.getElementById('bWarrior')?.value||"").trim();
  const fromYear = (document.getElementById('bFrom')?.value||"").trim();
  const toYear = (document.getElementById('bTo')?.value||"").trim();
  const params = new URLSearchParams();
  if(clan) params.set('clan', clan);
  if(warrior) params.set('warrior', warrior);
  if(fromYear) params.set('fromYear', fromYear);
  if(toYear) params.set('toYear', toYear);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function render(){
  document.getElementById("bLoader")?.classList.add("show");
  const qs = buildQuery();
  const data = await fetchJSON(`/api/battles${qs}`).catch(()=>[]);
  document.getElementById("bLoader")?.classList.remove("show");

  const tbody = document.querySelector("#battlesTable tbody"); tbody.innerHTML = "";
  data.forEach(b=>{
    const tr = document.createElement("tr");
    const clanNames = (b.clans||[]).map(c=>c.name).join(", ");
    const clanImgs = (b.clans||[]).map(c=> c.crestUrl?`<img src="${c.crestUrl}" style="height:20px;margin-right:6px;border-radius:6px"/>`:"" ).join("");
    const battleImg = b.imageUrl ? `<img src="${b.imageUrl}" class="thumb thumb-md" style="margin-right:8px;border-radius:8px"/>` : "";
    const nameLink = b.imageUrl ? `<a href="#" class="img-link" data-img="${b.imageUrl}" data-title="${(b.name||"").replace(/"/g,'&quot;')}">${b.name||""}</a>` : (b.name||"");
    // Add 'Ver en mapa' link that opens the map centered on this battle
    const viewMapLink = b.id ? `<a href="/map?battleId=${b.id}" class="btn-secondary" style="display:inline-block;padding:6px 10px;border-radius:8px">Ver en mapa</a>` : '';
    tr.innerHTML = `<td>${battleImg}${nameLink}<div style="margin-top:8px">${viewMapLink}</div></td><td>${b.date||""}</td><td>${b.era||""}</td><td>${clanImgs} ${clanNames}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById("bEmpty").style.display = data.length? "none":"block";
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById('bApply')?.addEventListener('click', render);
  document.getElementById('bReset')?.addEventListener('click', ()=>{
    document.getElementById('bClan').value = '';
    document.getElementById('bWarrior').value = '';
    document.getElementById('bFrom').value = '';
    document.getElementById('bTo').value = '';
    render();
  });
  // Allow Enter key on inputs to apply
  ['bClan','bWarrior','bFrom','bTo'].forEach(id=>{
    const el = document.getElementById(id);
    el && el.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') render(); });
  });
  render();
});

// Modal handling (re-use same modal behavior as warriors)
function ensureImageModalBattles(){
  if(document.getElementById('imgPreviewModal')) return;
  const modal = document.createElement('div'); modal.id='imgPreviewModal'; modal.className='img-modal'; modal.style.display='none';
  modal.innerHTML = `<div class="img-modal__card"><button class="img-modal__close" aria-label="Cerrar">✕</button><img class="img-modal__img" src="" alt=""/><div class="img-modal__caption"></div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.img-modal__close').addEventListener('click', ()=> modal.style.display='none');
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.style.display='none'; });
}

function showImageModalBattles(src, title){
  if(!src) return;
  ensureImageModalBattles();
  const modal = document.getElementById('imgPreviewModal');
  modal.querySelector('.img-modal__img').src = src;
  modal.querySelector('.img-modal__img').alt = title || '';
  modal.querySelector('.img-modal__caption').textContent = title || '';
  modal.style.display = 'flex';
}

document.addEventListener('click', (e)=>{
  const a = e.target.closest && e.target.closest('a.img-link');
  if(!a) return;
  e.preventDefault();
  showImageModalBattles(a.dataset.img, a.dataset.title);
});