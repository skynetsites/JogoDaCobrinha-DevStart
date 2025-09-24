// Sons e música
const somComida = new Audio('https://freesound.org/data/previews/256/256113_3263906-lq.mp3');
const somEspecial = new Audio('https://freesound.org/data/previews/198/198841_285997-lq.mp3');
const somFim = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');
const musicaFundo = new Audio('https://freesound.org/data/previews/556/556258_7037-lq.mp3');
musicaFundo.loop = true;

// Variáveis
let cobra=[{x:10,y:10}], comida=null, comidaEspecial=null, direcao='DIREITA', proximaDirecao='DIREITA';
let velocidade=150, pontos=0, recorde=localStorage.getItem('recorde')||0, intervalo, pausado=false, fimDeJogo=false, timerComidaEspecial=null;

// DOM
const iniciarBtn=document.getElementById('iniciarBtn');
const pausarBtn=document.getElementById('pausarBtn');
const reiniciarBtn=document.getElementById('reiniciarBtn');
const gameOverElement=document.getElementById('gameOver');
const pontosElement=document.getElementById('score');
const recordeElement=document.getElementById('highScore');
const pontosFinaisElement=document.getElementById('finalScore');

// Inicializa
function iniciar(){
    recordeElement.textContent=recorde;
    iniciarBtn.addEventListener('click', iniciarJogo);
    pausarBtn.addEventListener('click', alternarPausa);
    reiniciarBtn.addEventListener('click', reiniciarJogo);
}

// Iniciar jogo
function iniciarJogo(){
    musicaFundo.play();
    if(intervalo) clearInterval(intervalo);
    cobra=[{x:10,y:10}]; direcao='DIREITA'; proximaDirecao='DIREITA';
    pontos=0; pontosElement.textContent=pontos; fimDeJogo=false; pausado=false; velocidade=150;
    gameOverElement.style.display='none';
    comida=gerarComida();
    if(comidaEspecial) clearTimeout(timerComidaEspecial), comidaEspecial=null;
    iniciarBtn.disabled=true; pausarBtn.disabled=false;
    intervalo=setInterval(loopJogo, velocidade);
}

// Loop
function loopJogo(){
    if(pausado||fimDeJogo) return;
    direcao=proximaDirecao;
    moverCobra();
    criarTabuleiro();
}

// Criar tabuleiro
function criarTabuleiro(){
    const tabuleiro=document.getElementById('gameBoard'); tabuleiro.innerHTML='';
    cobra.forEach((seg,idx)=>{
        const div=document.createElement('div');
        div.style.gridRowStart=seg.y; div.style.gridColumnStart=seg.x;
        div.classList.add(idx===0?'snake-head':'snake');
        tabuleiro.appendChild(div);
    });
    if(comida){ const f=document.createElement('div'); f.style.gridRowStart=comida.y; f.style.gridColumnStart=comida.x; f.classList.add('food'); tabuleiro.appendChild(f);}
    if(comidaEspecial){ const s=document.createElement('div'); s.style.gridRowStart=comidaEspecial.y; s.style.gridColumnStart=comidaEspecial.x; s.classList.add('special-food'); tabuleiro.appendChild(s);}
}

// Gerar comida
function gerarComida(){
    let nova;
    while(!nova||posicaoOcupada(nova)){ nova={x:Math.floor(Math.random()*20)+1, y:Math.floor(Math.random()*20)+1}; }
    if(Math.random()<0.2&&!comidaEspecial) gerarComidaEspecial();
    return nova;
}

// Comida especial
function gerarComidaEspecial(){
    let nova;
    while(!nova||posicaoOcupada(nova)){ nova={x:Math.floor(Math.random()*20)+1, y:Math.floor(Math.random()*20)+1}; }
    comidaEspecial=nova;
    timerComidaEspecial=setTimeout(()=>{ comidaEspecial=null; criarTabuleiro(); },5000);
}

// Checar posição
function posicaoOcupada(pos){
    return cobra.some(s=>s.x===pos.x&&s.y===pos.y)||(comida?pos.x===comida.x&&pos.y===comida.y:false)||(comidaEspecial?pos.x===comidaEspecial.x&&pos.y===comidaEspecial.y:false);
}

// Direção
function mudarDirecao(e){
    const t=e.key;
    if(t==='ArrowUp'&&direcao!=='BAIXO') proximaDirecao='CIMA';
    else if(t==='ArrowDown'&&direcao!=='CIMA') proximaDirecao='BAIXO';
    else if(t==='ArrowLeft'&&direcao!=='DIREITA') proximaDirecao='ESQUERDA';
    else if(t==='ArrowRight'&&direcao!=='ESQUERDA') proximaDirecao='DIREITA';
    else if(t===' ') alternarPausa();
}

// Mover
function moverCobra(){
    const cabeca={...cobra[0]};
    switch(direcao){
        case'CIMA': cabeca.y--; break;
        case'BAIXO': cabeca.y++; break;
        case'ESQUERDA': cabeca.x--; break;
        case'DIREITA': cabeca.x++; break;
    }
    if(verificarColisao(cabeca)){ fimDeJogoFuncao(); return; }
    cobra.unshift(cabeca);
    if(comida&&cabeca.x===comida.x&&cabeca.y===comida.y){ pontos+=10; atualizarPontos(); somComida.play(); comida=gerarComida(); }
    else if(comidaEspecial&&cabeca.x===comidaEspecial.x&&cabeca.y===comidaEspecial.y){ pontos+=30; atualizarPontos(); somEspecial.play(); clearTimeout(timerComidaEspecial); comidaEspecial=null; }
    else{ cobra.pop(); }
}

// Atualizar pontos
function atualizarPontos(){ pontosElement.textContent=pontos; }

// Colisão
function verificarColisao(cabeca){
    if(cabeca.x<1||cabeca.x>20||cabeca.y<1||cabeca.y>20) return true;
    for(let i=1;i<cobra.length;i++){ if(cabeca.x===cobra[i].x&&cabeca.y===cobra[i].y) return true; }
    return false;
}

// Fim de jogo
function fimDeJogoFuncao(){
    clearInterval(intervalo); fimDeJogo=true; somFim.play();
    if(pontos>recorde){ recorde=pontos; localStorage.setItem('recorde',recorde); recordeElement.textContent=recorde; }
    pontosFinaisElement.textContent=pontos; gameOverElement.style.display='block';
    iniciarBtn.disabled=false; pausarBtn.disabled=true;
    musicaFundo.pause();
}

// Pausa
function alternarPausa(){ pausado=!pausado; pausarBtn.textContent=pausado?'Continuar':'Pausar'; }

// Reiniciar
function reiniciarJogo(){ gameOverElement.style.display='none'; iniciarJogo(); }

// Eventos
document.addEventListener('keydown', mudarDirecao);
iniciar();
