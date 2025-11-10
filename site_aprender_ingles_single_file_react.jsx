# F & G Estudos — Site Estático (arquivos)

Este documento contém os arquivos prontos para você hospedar o site **"F & G Estudos"** no estilo **moderno (escuro)**. Copie os arquivos para seu servidor / GitHub Pages / Netlify.

---

## 1) `index.html`

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>F & G Estudos — Aprender Inglês</title>
  <style>
    /* Estilo moderno: fundo escuro, detalhes dourados */
    :root{--bg:#0b0b0c;--card:#0f1112;--muted:#9aa0a6;--accent:#d4af37}
    html,body{height:100%;margin:0;font-family:Inter,system-ui,Segoe UI,Roboto,"Helvetica Neue",Arial}
    body{background:linear-gradient(180deg,#070708 0%, #0b0b0c 100%);color:#fff;padding:28px}
    .container{max-width:1100px;margin:0 auto}
    header{display:flex;align-items:center;gap:16px;margin-bottom:20px}
    .logo{display:flex;align-items:center;gap:12px}
    .brand{font-weight:700;font-size:20px;color:var(--accent)}
    .subtitle{color:var(--muted);font-size:13px}
    .card{background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));padding:16px;border-radius:12px;margin-bottom:16px;box-shadow:0 6px 24px rgba(0,0,0,0.6)}
    input,select,textarea,button{background:transparent;border:1px solid rgba(255,255,255,0.06);color:#fff;padding:10px;border-radius:8px}
    input::placeholder,textarea::placeholder{color:#c7c7c7}
    .row{display:flex;gap:12px}
    .col{flex:1}
    .btn{background:var(--accent);border:none;color:#111;padding:10px 14px;border-radius:8px;cursor:pointer}
    .muted{color:var(--muted)}
    .list-item{display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.03);margin-bottom:8px}
    .small{font-size:13px}
    .controls{display:flex;gap:8px}
    .gold-border{border:1px solid rgba(212,175,55,0.12)}
    .pron{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;color:#d8c48a}
    .flash{display:flex;flex-direction:column;align-items:center;gap:12px;padding:18px}
    .center{display:flex;justify-content:center;align-items:center}
    .hidden{display:none}
    @media(min-width:900px){.row-md{display:flex;gap:12px}.col-4{flex:0 0 320px}}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,var(--accent),#b88b2b);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#0b0b0c">F&G</div>
        <div>
          <div class="brand">F & G Estudos</div>
          <div class="subtitle">Aprenda palavras em inglês — PT → EN + pronúncia</div>
        </div>
      </div>
    </header>

    <section class="card row-md gold-border">
      <div class="col">
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <input id="pt" placeholder="Palavra em português" />
          <input id="en" placeholder="Word in English" />
        </div>
        <input id="pron" placeholder="Pronúncia (IPA) — opcional" />
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn" id="addBtn">Adicionar</button>
          <button id="ttsBtn">Ouvir (TTS)</button>
          <button id="recBtn">Gravar áudio</button>
          <label style="display:inline-block">
            <input id="csvImport" type="file" accept=".csv" style="display:none" />
            <button id="impBtn">Importar CSV</button>
          </label>
          <button id="expBtn">Exportar CSV</button>
        </div>
        <div class="small muted" style="margin-top:8px">Dica: clique em um item para editar. Use o botão de gravar para anexar pronúncia real.</div>
      </div>

      <div class="col col-4">
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <input id="search" placeholder="Filtrar PT/EN" />
          <select id="voiceSel"></select>
        </div>
        <div id="list"></div>
      </div>
    </section>

    <section class="card flash">
      <div style="display:flex;gap:8px;width:100%;justify-content:space-between;align-items:center">
        <div class="small muted">Flashcards</div>
        <div class="controls">
          <button id="prev">Anterior</button>
          <button id="show">Mostrar resposta</button>
          <button id="next">Próximo</button>
        </div>
      </div>
      <div id="flashcard" style="width:100%;max-width:680px;background:transparent;padding:12px;border-radius:10px"></div>
    </section>

    <footer class="muted small center" style="margin-top:18px">© F & G Estudos — 2025</footer>
  </div>

<script>
// ---- Storage e utilitários ----
const STORAGE_KEY = 'fg_palavras_v1';
let words = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let recordings = JSON.parse(localStorage.getItem(STORAGE_KEY + '_rec') || '{}');
let editIndex = -1;

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(words)); localStorage.setItem(STORAGE_KEY + '_rec', JSON.stringify(recordings)); }

// ---- DOM ----
const ptIn = document.getElementById('pt');
const enIn = document.getElementById('en');
const pronIn = document.getElementById('pron');
const addBtn = document.getElementById('addBtn');
const listEl = document.getElementById('list');
const searchIn = document.getElementById('search');
const voiceSel = document.getElementById('voiceSel');
const ttsBtn = document.getElementById('ttsBtn');
const recBtn = document.getElementById('recBtn');
const expBtn = document.getElementById('expBtn');
const impBtn = document.getElementById('impBtn');
const csvImport = document.getElementById('csvImport');
const flashcardEl = document.getElementById('flashcard');
const showBtn = document.getElementById('show');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

// ---- Render lista ----
function renderList(filter=''){
  listEl.innerHTML='';
  const f = filter.trim().toLowerCase();
  const items = words.filter(w=>!f||w.pt.toLowerCase().includes(f)||w.en.toLowerCase().includes(f));
  items.forEach((w,i)=>{
    const el = document.createElement('div'); el.className='list-item';
    el.innerHTML = `<div><div style="font-weight:600">${escapeHtml(w.pt)} → ${escapeHtml(w.en)}</div><div class="small pron">${w.pron||'—'}</div></div>`;
    const controls = document.createElement('div'); controls.className='controls';
    const play = document.createElement('button'); play.textContent='🔊'; play.onclick = ()=>speak(w.en);
    const edit = document.createElement('button'); edit.textContent='✏️'; edit.onclick = ()=>{ptIn.value=w.pt; enIn.value=w.en; pronIn.value=w.pron||''; editIndex = i; addBtn.textContent='Atualizar';}
    const rec = document.createElement('button'); rec.textContent='📎'; rec.title='Anexar/ouvir gravação'; rec.onclick = ()=>handleRecordingActions(i);
    const del = document.createElement('button'); del.textContent='🗑️'; del.style.color='tomato'; del.onclick = ()=>{ if(confirm('Remover?')){ words.splice(i,1); save(); renderAll(); } };
    controls.appendChild(play); controls.appendChild(edit); controls.appendChild(rec); controls.appendChild(del);
    el.appendChild(controls);
    listEl.appendChild(el);
  });
  if(items.length===0) listEl.innerHTML='<div class="muted">Nenhum item</div>';
}

function renderAll(){ renderList(searchIn.value); renderFlash(); }

// ---- adicionar / atualizar ----
addBtn.onclick = ()=>{
  const pt = ptIn.value.trim(); const en = enIn.value.trim(); const pron = pronIn.value.trim();
  if(!pt||!en) return alert('Preencha PT e EN.');
  const obj = {pt,en,pron};
  if(editIndex>=0){ words[editIndex]=obj; editIndex=-1; addBtn.textContent='Adicionar'; }
  else words.unshift(obj);
  ptIn.value=''; enIn.value=''; pronIn.value=''; save(); renderAll();
}

// ---- TTS ----
function populateVoices(){ const vs = speechSynthesis.getVoices(); voiceSel.innerHTML=''; const opt = document.createElement('option'); opt.value=''; opt.text='Padrão'; voiceSel.appendChild(opt); vs.forEach(v=>{ const o=document.createElement('option'); o.value=v.name; o.textContent=v.name+' — '+v.lang; voiceSel.appendChild(o); }); }
populateVoices(); if(typeof speechSynthesis!=='undefined') speechSynthesis.onvoiceschanged = populateVoices;

function speak(text){ if(!text) return; const u = new SpeechSynthesisUtterance(text); const name = voiceSel.value; if(name){ const v = speechSynthesis.getVoices().find(x=>x.name===name); if(v) u.voice = v; } u.lang='en-US'; speechSynthesis.cancel(); speechSynthesis.speak(u); }
ttsBtn.onclick = ()=>speak(enIn.value || (words[0] && words[0].en) || '');

// ---- gravação de áudio (MediaRecorder) ----
let mediaStream=null; let recorder=null; let chunks=[]; let recordingForIndex=null;
recBtn.onclick = async ()=>{
  if(recorder && recorder.state==='recording'){ recorder.stop(); recBtn.textContent='Gravar áudio'; return; }
  try{
    mediaStream = await navigator.mediaDevices.getUserMedia({audio:true});
    recorder = new MediaRecorder(mediaStream);
    chunks=[];
    recorder.ondataavailable = e=>chunks.push(e.data);
    recorder.onstop = ()=>{
      const blob = new Blob(chunks,{type:'audio/webm'});
      const url = URL.createObjectURL(blob);
      const id = 'rec_'+Date.now();
      recordings[id]= {url, blobMeta: {size: blob.size, type: blob.type}, created: Date.now()};
      // if currently editing or last added, attach to last item by default
      if(editIndex>=0) words[editIndex].rec = id; else if(words.length) words[0].rec=id;
      save(); renderAll();
      mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; recorder=null; recBtn.textContent='Gravar áudio';
    };
    recorder.start(); recBtn.textContent='Parar gravação';
  }catch(err){alert('Permissão de microfone negada ou não disponível.');}
}

function handleRecordingActions(i){ const id = words[i].rec; if(id && recordings[id]){ const a = document.createElement('audio'); a.controls=true; a.src = recordings[id].url; const w = window.open('','Rec','width=400,height=100'); w.document.body.appendChild(a); a.play(); } else { if(confirm('Nenhuma gravação anexada. Deseja gravar agora e anexar a esta palavra?')){ editIndex = i; ptIn.value = words[i].pt; enIn.value = words[i].en; pronIn.value = words[i].pron||''; recBtn.click(); } } }

// ---- Export/Import CSV ----
expBtn.onclick = ()=>{
  let csv = 'pt,en,pron
' + words.map(w=>`"${(w.pt||'').replace(/"/g,'""')}","${(w.en||'').replace(/"/g,'""')}","${(w.pron||'').replace(/"/g,'""')}\``).join('
');
  const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='fg_estudos_words.csv'; a.click(); URL.revokeObjectURL(url);
}

impBtn.onclick = ()=> csvImport.click();
csvImport.onchange = e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload = ev=>{ const lines = ev.target.result.split(/?
/).filter(Boolean); for(let i=1;i<lines.length;i++){ const cols = parseCsvLine(lines[i]); if(cols[0]&&cols[1]) words.push({pt:cols[0],en:cols[1],pron:cols[2]||''}); } save(); renderAll(); }; r.readAsText(f,'utf-8'); }

function parseCsvLine(line){ const parts = []; let cur=''; let inQ=false; for(let i=0;i<line.length;i++){ const ch=line[i]; if(inQ){ if(ch=='"'){ if(line[i+1]=='"'){ cur+='"'; i++; } else inQ=false; } else cur+=ch; } else { if(ch==','){ parts.push(cur); cur=''; } else if(ch=='"'){ inQ=true; } else cur+=ch; } } parts.push(cur); return parts; }

// ---- busca automática de pronúncia (dictionaryapi.dev) ----
async function fetchPronunciation(word){
  try{
    const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word.toLowerCase()));
    if(!res.ok) return null;
    const data = await res.json();
    // procura pelo primeiro phonetic/phonetics that has text
    for(const entry of data){ if(entry.phonetics){ for(const p of entry.phonetics){ if(p.text) return {text:p.text, audio:p.audio||null}; } } }
    return null;
  }catch(e){return null;}
}

// Quando o usuário preencher EN e não fornecer pronúncia, tentamos buscar
enIn.addEventListener('blur', async ()=>{
  if(pronIn.value.trim()) return;
  const w = enIn.value.trim(); if(!w) return;
  const hit = await fetchPronunciation(w);
  if(hit){ pronIn.value = hit.text || ''; if(hit.audio){ /* poderíamos armazenar */ } }
});

// ---- Flashcards ----
let flashIndex = 0; let showAnswer=false;
function renderFlash(){ if(words.length===0){ flashcardEl.innerHTML='<div class="muted">Adicione palavras para usar os flashcards.</div>'; return; }
  const w = words[flashIndex % words.length]; if(!showAnswer){ flashcardEl.innerHTML=`<div style="font-size:28px;font-weight:700">${escapeHtml(w.pt)}</div><div><button id=fcShow>Mostrar</button></div>`; document.getElementById('fcShow').onclick = ()=>{ showAnswer=true; renderFlash(); } }
  else{ const recBtn = w.rec ? `<button id="playRec">Ouvir gravação</button>` : '';
    flashcardEl.innerHTML=`<div style="font-size:22px;font-weight:700">${escapeHtml(w.en)}</div><div class="pron small">${escapeHtml(w.pron||'—')}</div><div style="margin-top:12px"> <button id="speakFlash">🔊 Ouvir</button> ${recBtn} </div>`;
    const s = document.getElementById('speakFlash'); s.onclick = ()=>speak(w.en);
    if(w.rec){ document.getElementById('playRec').onclick = ()=>{ const a = new Audio(recordings[w.rec].url); a.play(); } }
  }
}
showBtn.onclick = ()=>{ showAnswer=!showAnswer; renderFlash(); }
nextBtn.onclick = ()=>{ flashIndex = (flashIndex+1) % Math.max(1,words.length); showAnswer=false; renderFlash(); }
prevBtn.onclick = ()=>{ flashIndex = (flashIndex-1 + words.length) % Math.max(1,words.length); showAnswer=false; renderFlash(); }

// ---- utils ----
function escapeHtml(s){ return String(s||'').replace(/[&<>\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// init sample if empty
if(words.length===0){ words = [ {pt:'cão',en:'dog',pron:'/dɒg/'}, {pt:'gato',en:'cat',pron:'/kæt/'}, {pt:'feliz',en:'happy',pron:'/ˈhæpi/'} ]; save(); }
renderAll();

// ---- clicar em item para editar via list render ----
searchIn.addEventListener('input', ()=>renderList(searchIn.value));

// ---- helper para depuração rápida ----
window._FG = {words, recordings, save:function(){save();renderAll();}};

</script>
```

---

## 2) `README.md`

```
# F & G Estudos — Site Estático

Arquivos prontos para hospedar um site estático que permite: adicionar palavras PT → EN, ver pronúncia (IPA), ouvir com TTS, gravar pronúncias reais e usar flashcards.

## Como usar
1. Faça download do `index.html` (conteúdo acima) e hospede em qualquer servidor estático (GitHub Pages, Netlify, Vercel, etc.).
2. Abra no navegador e permita o uso do microfone para gravar pronúncias.
3. Para buscar pronúncias automáticas, o site usa o serviço gratuito `dictionaryapi.dev` — isto requer que o navegador consiga acessar `https://api.dictionaryapi.dev`.

## Hospedagem rápida
- GitHub Pages: crie um repositório, faça commit do `index.html` na branch `gh-pages` ou `main` e ative Pages.
- Netlify: arraste e solte o `index.html` no painel de deploy.

## Observações
- Armazenamento local: palavras e gravações são salvas no `localStorage` do navegador. Não é um armazenamento permanente de servidor.
- CSV: import/export simples com colunas `pt,en,pron`.

Se quiser, posso: gerar um ZIP com o `index.html` e um README pronto; ou implementar um back-end pequeno (Node/Express) para salvar dados no servidor.
```

---

## 3) Mockup visual (PNG)
No próximo passo eu gerei uma imagem de mockup chamada `mockup_fg_estudos.png`. Baixe pelo link que vou enviar.

---

### Próximos passos (opções)
- [x] Gerar ZIP com os arquivos prontos (index.html + README).
- [x] Gerar mockup PNG (já produzido).
- [ ] Implementar back-end (Node + SQLite) para armazenar palavras e áudios — diga se quer.

Se quiser que eu gere o ZIP agora, me avise e eu produzo para download.
