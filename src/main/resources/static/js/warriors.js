async function fetchJSON(u){ const r = await fetch(u); if(!r.ok) throw new Error(r.status); return r.json(); }

async function render(){
  document.getElementById("warLoader")?.classList.add("show");
  // Always fetch full list and filter client-side (safer than relying on exact clan match)
  const data = await fetchJSON(`/directory/warriors`).catch(()=>[]);
  document.getElementById("warLoader")?.classList.remove("show");

  const clanFilter = (document.getElementById("warClan")?.value||"").toLowerCase();
  const term = (document.getElementById("warSearch")?.value||"").toLowerCase();
  const filtered = data.filter(w => {
    const byClan = !clanFilter || (w.clan||"").toLowerCase().includes(clanFilter);
    const byName = !term || (w.name||"").toLowerCase().includes(term);
    return byClan && byName;
  });

  const tbody = document.querySelector("#warriorsTable tbody"); tbody.innerHTML = "";
  filtered.forEach(w=>{
    const tr = document.createElement("tr");
    const imgSrc = w.imageUrl || w.crestUrl || "";
    const safeTitle = (w.name||"").replace(/"/g,'&quot;');
    const nameLink = imgSrc ? `<a href="#" class="img-link" data-img="${imgSrc}" data-title="${safeTitle}">${w.name||""}</a>` : (w.name||"");
    tr.innerHTML = `<td>${nameLink}</td><td>${w.clan||""}</td><td>${w.role||""}</td><td>${w.era||""}</td><td>${w.bio||""}</td><td>${imgSrc?`<img src="${imgSrc}" class="thumb thumb-sm"/>`:""}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById("warEmpty").style.display = filtered.length? "none":"block";
}

document.addEventListener("DOMContentLoaded", ()=>{
  const clanEl = document.getElementById("warClan");
  const searchEl = document.getElementById("warSearch");
  clanEl?.addEventListener("input", render);
  clanEl?.addEventListener("change", render);
  searchEl?.addEventListener("input", render);
  render();
});

// Image preview modal (delegated)
function ensureImageModal(){
  if(document.getElementById('imgPreviewModal')) return;
  const modal = document.createElement('div'); modal.id='imgPreviewModal'; modal.className='img-modal'; modal.style.display='none';
  modal.innerHTML = `<div class="img-modal__card"><button class="img-modal__close" aria-label="Cerrar">✕</button><img class="img-modal__img" src="" alt=""/><div class="img-modal__caption"></div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('.img-modal__close').addEventListener('click', ()=> modal.style.display='none');
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.style.display='none'; });
}

function showImageModal(src, title){
  if(!src) return;
  ensureImageModal();
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
  showImageModal(a.dataset.img, a.dataset.title);
});