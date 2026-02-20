let CURRENT_MODE = "general";
let score = 0;
let remaining = [];
let timerInterval = null;
let timeLeft = 10;
let combo = 0;
let playerName = 'Jugador';

const MAX_TIME = 20;
let TOTAL_QUESTIONS = 10;

const DATA = {
  general: [

    // SOCIEDAD Y POLÍTICA
    {term: 'Samurái', def: 'Guerrero de la clase militar que servía a un señor feudal.'},
    {term: 'Daimyō', def: 'Señor feudal que gobernaba un dominio y tenía ejércitos propios.'},
    {term: 'Shōgun', def: 'Máxima autoridad militar de Japón durante el periodo feudal.'},
    {term: 'Emperador', def: 'Figura imperial con autoridad simbólica durante gran parte del Japón feudal.'},
    {term: 'Rōnin', def: 'Samurái sin señor ni maestro.'},
    {term: 'Bakufu', def: 'Gobierno militar dirigido por el shōgun.'},
    {term: 'Han', def: 'Dominio feudal gobernado por un daimyō.'},
    {term: 'Sankin-kōtai', def: 'Sistema que obligaba a los daimyō a residir alternadamente en Edo.'},
    {term: 'Koku', def: 'Unidad de medida de arroz usada para calcular riqueza.'},
    {term: 'Buke', def: 'Clase guerrera en el Japón feudal.'},
    {term: 'Heimin', def: 'Clase social formada por campesinos, artesanos y comerciantes.'},

    // ARMAS Y GUERRA
    {term: 'Katana', def: 'Espada larga curva tradicional del samurái.'},
    {term: 'Tachi', def: 'Espada curva anterior a la katana.'},
    {term: 'Wakizashi', def: 'Espada corta complementaria a la katana.'},
    {term: 'Tantō', def: 'Daga corta japonesa.'},
    {term: 'Naginata', def: 'Arma de asta con hoja curva.'},
    {term: 'Yumi', def: 'Arco largo japonés usado en batalla.'},
    {term: 'Ashigaru', def: 'Soldado de infantería de bajo rango.'},
    {term: 'Kabuto', def: 'Casco de la armadura samurái.'},
    {term: 'Yoroi', def: 'Armadura tradicional del samurái.'},
    {term: 'Tanegashima', def: 'Arcabuz introducido en Japón en el siglo XVI.'},

    // CÓDIGOS Y FILOSOFÍA
    {term: 'Bushidō', def: 'Código ético que guiaba la conducta del samurái.'},
    {term: 'Seppuku', def: 'Suicidio ritual para preservar el honor.'},
    {term: 'Zen', def: 'Escuela budista influyente entre los samuráis.'},
    {term: 'Shintō', def: 'Religión nativa japonesa centrada en los kami.'},
    {term: 'Kami', def: 'Espíritus o deidades del shintoísmo.'},

    // PERIODOS
    {term: 'Sengoku', def: 'Periodo de guerras civiles entre clanes (siglos XV-XVI).'},
    {term: 'Edo', def: 'Periodo de estabilidad bajo el shogunato Tokugawa.'},
    {term: 'Heian', def: 'Periodo anterior al dominio samurái caracterizado por cultura cortesana.'},
    {term: 'Kamakura', def: 'Primer shogunato militar de Japón.'},
    {term: 'Muromachi', def: 'Periodo previo al Sengoku bajo el shogunato Ashikaga.'},
    {term: 'Meiji', def: 'Periodo que abolió el sistema feudal en 1868.'},

    // PERSONAJES
    {term: 'Oda Nobunaga', def: 'Daimyō que inició la unificación de Japón.'},
    {term: 'Toyotomi Hideyoshi', def: 'Líder que continuó la unificación tras Nobunaga.'},
    {term: 'Tokugawa Ieyasu', def: 'Fundador del shogunato Tokugawa.'},
    {term: 'Takeda Shingen', def: 'Daimyō famoso por su caballería.'},
    {term: 'Uesugi Kenshin', def: 'Rival histórico de Takeda Shingen.'},
    {term: 'Date Masamune', def: 'Daimyō conocido por su casco con media luna.'},
    {term: 'Hattori Hanzō', def: 'Famoso ninja al servicio de Tokugawa Ieyasu.'},

    // CLANES
    {term: 'Clan Tokugawa', def: 'Clan que gobernó Japón durante el periodo Edo.'},
    {term: 'Clan Oda', def: 'Clan liderado por Oda Nobunaga.'},
    {term: 'Clan Takeda', def: 'Clan famoso por su caballería.'},
    {term: 'Clan Uesugi', def: 'Clan rival del clan Takeda.'},
    {term: 'Clan Shimazu', def: 'Clan poderoso del sur de Japón.'},
    {term: 'Clan Mori', def: 'Clan naval influyente del periodo Sengoku.'},

    // BATALLAS
    {term: 'Sekigahara', def: 'Batalla decisiva en 1600 que consolidó el poder Tokugawa.'},
    {term: 'Honnō-ji', def: 'Incidente donde Oda Nobunaga fue traicionado en 1582.'},
    {term: 'Kawanakajima', def: 'Serie de batallas entre Takeda y Uesugi.'},
    {term: 'Asedio de Osaka', def: 'Conflicto final contra el clan Toyotomi.'},
    {term: 'Nagashino', def: 'Batalla famosa por el uso masivo de arcabuces.'},

    // CULTURA
    {term: 'Dojo', def: 'Lugar de entrenamiento en artes marciales.'},
    {term: 'Chanoyu', def: 'Ceremonia tradicional del té.'},
    {term: 'Tatami', def: 'Esteras tradicionales de paja de arroz.'},
    {term: 'Mon', def: 'Emblema heráldico de un clan japonés.'},
    {term: 'Onna-bugeisha', def: 'Mujer samurái entrenada en combate.'},
    {term: 'Sōhei', def: 'Monje guerrero budista.'}
  ],

  difficult: [
    {term: 'Iaijutsu', def: 'Arte de desenvainar y cortar en un solo movimiento.'},
    {term: 'Kenjutsu', def: 'Arte tradicional del combate con espada.'},
    {term: 'Daishō', def: 'Conjunto formado por katana y wakizashi.'},
    {term: 'Jitte', def: 'Arma corta utilizada por la policía samurái.'},
    {term: 'Fudai Daimyō', def: 'Señores leales a Tokugawa antes de Sekigahara.'},
    {term: 'Tozama Daimyō', def: 'Señores que se sometieron a Tokugawa después de Sekigahara.'}
  ]
};


function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function startGame(mode=CURRENT_MODE){
  CURRENT_MODE = mode;
  score = 0;
  combo = 0;
  // read player name from input
  const pn = document.getElementById('playerName') && document.getElementById('playerName').value.trim();
  playerName = pn && pn.length ? pn : 'Jugador';

  // mixed pool: combine general + difficult, shuffle and pick up to TOTAL_QUESTIONS
  const pool = shuffle([...(DATA.general||[]), ...(DATA.difficult||[])]);
  const take = Math.min(TOTAL_QUESTIONS, pool.length);
  remaining = pool.slice(0, take);

  document.getElementById("finished").style.display="none";
  document.getElementById("gameArea").style.display="block";

  // set total questions count
  document.getElementById('totalQuestions').textContent = take;
  document.getElementById('answeredCount').textContent = 0;

  updateUI();
  nextQuestion();
}

function updateUI(){
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = combo;
  const total = parseInt(document.getElementById('totalQuestions').textContent || '0', 10) || TOTAL_QUESTIONS;
  const answered = total - remaining.length;
  let progress = total ? (answered / total) * 100 : 0;
  document.getElementById("progressBar").style.width = progress + "%";
  document.getElementById('answeredCount').textContent = Math.max(0, answered);
}

function startTimer(){
  timeLeft = MAX_TIME;
  document.getElementById("timer").textContent = timeLeft;

  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;
    if(timeLeft<=0){
      clearInterval(timerInterval);
      wrongAnswer();
    }
  },1000);
}

function nextQuestion(){
  if(remaining.length===0){
    finishGame();
    return;
  }

  const area = document.getElementById("answers");
  area.innerHTML = "";

  const item = remaining.pop();

  const q = document.getElementById("questionCard");
  q.classList.remove("fade-in");
  void q.offsetWidth;
  q.classList.add("fade-in");

  q.innerHTML = `<h5>¿Qué significa <strong>${item.term}</strong>?</h5>`;

  const choices = [item.def];
  const combined = [...(DATA.general||[]), ...(DATA.difficult||[])];
  const others = combined.filter(g=>g.term!==item.term).map(g=>g.def);

  shuffle(others);
  for(let i=0;i<3 && i<others.length;i++)
    choices.push(others[i]);

  shuffle(choices);

  choices.forEach(c=>{
    const btn=document.createElement("button");
    btn.className="btn btn-outline-dark";
    btn.textContent=c;

    btn.onclick=()=>{
      clearInterval(timerInterval);

      if(c===item.def){
        correctAnswer(btn);
      } else {
        wrongAnswer(btn);
      }
    };

    area.appendChild(btn);
  });

  startTimer();
}

function correctAnswer(btn){
  combo++;
  score += 1 + Math.floor(combo/3);
  btn.className="btn btn-success";
  updateUI();
  setTimeout(nextQuestion,20000);
}

function wrongAnswer(btn){
  combo=0;
  if(btn) btn.className="btn btn-danger";
  setTimeout(nextQuestion,20000);
}

function finishGame(){
  clearInterval(timerInterval);

  // remove unload warning when game finished
  try{ window.removeEventListener('beforeunload', beforeUnloadHandler); }catch(e){}

  document.getElementById("gameArea").style.display="none";
  document.getElementById("finished").style.display="block";
  saveRanking(score, playerName);
  document.getElementById("finalScore").textContent =
    playerName + " — " + score + " pts - " + getRank(score);
  loadRanking();
}

function getRank(points){
  if(points<=3) return "Campesino";
  if(points<=6) return "Ashigaru";
  if(points<=10) return "Samurái";
  if(points<=15) return "Daimyō";
  return "Shōgun Supremo";
}

function saveRanking(points, name){
  const rank = JSON.parse(localStorage.getItem("ranking")||"[]");
  rank.push({name: name || 'Jugador', score: points});
  rank.sort((a,b)=>b.score - a.score);
  localStorage.setItem("ranking",JSON.stringify(rank.slice(0,5)));
}

function loadRanking(){
  const rank = JSON.parse(localStorage.getItem("ranking")||"[]");
  const list=document.getElementById("ranking");
  list.innerHTML="";
  rank.forEach((r,i)=>{
    const li=document.createElement("li");
    li.textContent=`#${i+1} - ${r.name}: ${r.score} pts`;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  // Mode buttons should select mode; Start button triggers the game and asks for name if needed
  const modeGen = document.getElementById("modeGeneral");
  const modeDiff = document.getElementById("modeDifficult");
  const startBtn = document.getElementById("btnStart");
  const replayBtn = document.getElementById("btnReplay");

  function selectMode(mode){
    CURRENT_MODE = mode;
    if(modeGen) modeGen.className = mode==='general' ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm';
    if(modeDiff) modeDiff.className = mode==='difficult' ? 'btn btn-danger btn-sm' : 'btn btn-outline-danger btn-sm';
  }

  function ensureNameThenStart(){
    const input = document.getElementById('playerName');
    let pn = input && input.value.trim();
    if(!pn){
      pn = prompt('Introduce tu nombre para jugar:', '');
      if(pn===null) return; // usuario canceló
      pn = pn.trim();
      if(input) input.value = pn;
    }
    playerName = pn && pn.length ? pn : 'Jugador';
    startGame(CURRENT_MODE);
  }

  if(modeGen) modeGen.onclick = ()=> selectMode('general');
  if(modeDiff) modeDiff.onclick = ()=> selectMode('difficult');
  if(startBtn) startBtn.onclick = ()=> ensureNameThenStart();
  if(replayBtn) replayBtn.onclick = ()=> ensureNameThenStart();

  // default selected mode visual
  selectMode(CURRENT_MODE);

  // beforeunload handler to warn when game is in progress
  window.beforeUnloadHandler = function(e){
    if(isGameInProgress()){
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  };

  // helper to determine if a game is ongoing
  window.isGameInProgress = function(){
    try{
      const ga = document.getElementById('gameArea');
      if(!ga) return false;
      const visible = ga.style.display !== 'none';
      return visible && Array.isArray(remaining) && remaining.length>0;
    }catch(e){return false;}
  };

  // attach click confirmer to menu button
  const menuBtn = document.getElementById('btnMenu');
  function confirmLeave(e, href){
    if(isGameInProgress()){
      e.preventDefault();
      const ok = confirm('Estás a punto de abandonar la partida. ¿Quieres salir sin guardar tu progreso?');
      if(ok){
        try{ window.removeEventListener('beforeunload', beforeUnloadHandler); }catch(ex){}
        window.location = href;
      }
    }
  }
  if(menuBtn) menuBtn.addEventListener('click', (e)=>confirmLeave(e, menuBtn.href));

  // register the beforeunload warning
  try{ window.addEventListener('beforeunload', beforeUnloadHandler); }catch(e){}
});
