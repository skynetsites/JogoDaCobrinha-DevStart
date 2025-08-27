// Variáveis do jogo
let cobra = [{x: 10, y: 10}];
let comida = null; // Inicializada como null
let comidaEspecial = null;
let direcao = 'DIREITA';
let proximaDirecao = 'DIREITA';
let velocidade = 150;
let pontos = 0;
let recorde = localStorage.getItem('recorde') || 0;
let intervalo;
let pausado = false;
let fimDeJogo = false;
let timerComidaEspecial = null;

// Elementos DOM
const iniciarBtn = document.getElementById('iniciarBtn');
const pausarBtn = document.getElementById('pausarBtn');
const reiniciarBtn = document.getElementById('reiniciarBtn');
const gameOverElement = document.getElementById('gameOver');
const pontosElement = document.getElementById('score');
const recordeElement = document.getElementById('highScore');
const pontosFinaisElement = document.getElementById('finalScore');

// Inicializa o jogo
function iniciar() {
    recordeElement.textContent = recorde;
    
    iniciarBtn.addEventListener('click', iniciarJogo);
    pausarBtn.addEventListener('click', alternarPausa);
    reiniciarBtn.addEventListener('click', reiniciarJogo);
}

// Inicia o jogo
function iniciarJogo() {
    if (intervalo) {
        clearInterval(intervalo);
    }
    
    // Reinicia estado do jogo
    cobra = [{x: 10, y: 10}];
    direcao = 'DIREITA';
    proximaDirecao = 'DIREITA';
    pontos = 0;
    pontosElement.textContent = pontos;
    fimDeJogo = false;
    pausado = false;
    gameOverElement.style.display = 'none';
    
    comida = gerarComida(); // Agora comida é inicializada aqui
    if (comidaEspecial) {
        clearTimeout(timerComidaEspecial);
        comidaEspecial = null;
    }
    
    iniciarBtn.disabled = true;
    pausarBtn.disabled = false;
    
    intervalo = setInterval(loopJogo, velocidade);
}

// Loop principal do jogo
function loopJogo() {
    if (pausado || fimDeJogo) return;
    
    direcao = proximaDirecao;
    moverCobra();
    criarTabuleiro();
}

// Cria o tabuleiro
function criarTabuleiro() {
    const tabuleiro = document.getElementById('gameBoard');
    tabuleiro.innerHTML = '';
    
    // Desenha a cobra
    cobra.forEach((segmento, index) => {
        const elemento = document.createElement('div');
        elemento.style.gridRowStart = segmento.y;
        elemento.style.gridColumnStart = segmento.x;
        elemento.classList.add(index === 0 ? 'snake-head' : 'snake');
        tabuleiro.appendChild(elemento);
    });
    
    // Desenha a comida (se existir)
    if (comida) {
        const elementoComida = document.createElement('div');
        elementoComida.style.gridRowStart = comida.y;
        elementoComida.style.gridColumnStart = comida.x;
        elementoComida.classList.add('food');
        tabuleiro.appendChild(elementoComida);
    }
    
    // Desenha comida especial se existir
    if (comidaEspecial) {
        const elementoEspecial = document.createElement('div');
        elementoEspecial.style.gridRowStart = comidaEspecial.y;
        elementoEspecial.style.gridColumnStart = comidaEspecial.x;
        elementoEspecial.classList.add('special-food');
        tabuleiro.appendChild(elementoEspecial);
    }
}

// Gera comida aleatória
function gerarComida() {
    let novaComida;
    while (!novaComida || posicaoOcupada(novaComida)) {
        novaComida = {
            x: Math.floor(Math.random() * 20) + 1,
            y: Math.floor(Math.random() * 20) + 1
        };
    }
    
    // 20% de chance de aparecer comida especial
    if (Math.random() < 0.2 && !comidaEspecial) {
        gerarComidaEspecial();
    }
    
    return novaComida;
}

// Gera comida especial que desaparece depois de 5 segundos
function gerarComidaEspecial() {
    let novaComida;
    while (!novaComida || posicaoOcupada(novaComida)) {
        novaComida = {
            x: Math.floor(Math.random() * 20) + 1,
            y: Math.floor(Math.random() * 20) + 1
        };
    }
    
    comidaEspecial = novaComida;
    
    timerComidaEspecial = setTimeout(() => {
        comidaEspecial = null;
        criarTabuleiro();
    }, 5000);
}

// Verifica se posição está ocupada
function posicaoOcupada(posicao) {
    // Verifica se está ocupada pela cobra
    const ocupadaPelaCobra = cobra.some(segmento => 
        segmento.x === posicao.x && segmento.y === posicao.y
    );
    
    // Verifica se está ocupada pela comida (se existir)
    const ocupadaPelaComida = comida ? 
        (posicao.x === comida.x && posicao.y === comida.y) : false;
    
    // Verifica se está ocupada pela comida especial (se existir)
    const ocupadaPelaEspecial = comidaEspecial ?
        (posicao.x === comidaEspecial.x && posicao.y === comidaEspecial.y) : false;
    
    return ocupadaPelaCobra || ocupadaPelaComida || ocupadaPelaEspecial;
}

// Muda a direção
function mudarDirecao(evento) {
    const tecla = evento.key;
    if (tecla === 'ArrowUp' && direcao !== 'BAIXO') proximaDirecao = 'CIMA';
    else if (tecla === 'ArrowDown' && direcao !== 'CIMA') proximaDirecao = 'BAIXO';
    else if (tecla === 'ArrowLeft' && direcao !== 'DIREITA') proximaDirecao = 'ESQUERDA';
    else if (tecla === 'ArrowRight' && direcao !== 'ESQUERDA') proximaDirecao = 'DIREITA';
    else if (tecla === ' ') alternarPausa(); // Espaço pausa
}

// Move a cobra
function moverCobra() {
    const cabeca = {...cobra[0]};
    
    // Move a cabeça
    switch (direcao) {
        case 'CIMA': cabeca.y--; break;
        case 'BAIXO': cabeca.y++; break;
        case 'ESQUERDA': cabeca.x--; break;
        case 'DIREITA': cabeca.x++; break;
    }
    
    // Verifica colisões
    if (verificarColisao(cabeca)) {
        fimDeJogoFuncao();
        return;
    }
    
    // Adiciona nova cabeça
    cobra.unshift(cabeca);
    
    // Verifica se comeu comida normal
    if (comida && cabeca.x === comida.x && cabeca.y === comida.y) {
        pontos += 10;
        atualizarPontos();
        comida = gerarComida();
    } 
    // Verifica se comeu comida especial
    else if (comidaEspecial && cabeca.x === comidaEspecial.x && cabeca.y === comidaEspecial.y) {
        pontos += 30;
        atualizarPontos();
        clearTimeout(timerComidaEspecial);
        comidaEspecial = null;
    } else {
        // Remove a cauda se não comeu
        cobra.pop();
    }
}

// Atualiza a exibição dos pontos
function atualizarPontos() {
    pontosElement.textContent = pontos;
}

// Verifica colisões
function verificarColisao(cabeca) {
    // Colisão com as paredes
    if (cabeca.x < 1 || cabeca.x > 20 || cabeca.y < 1 || cabeca.y > 20) {
        return true;
    }
    
    // Colisão com o próprio corpo (ignora a cabeça)
    for (let i = 1; i < cobra.length; i++) {
        if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
            return true;
        }
    }
    
    return false;
}

// Fim de jogo
function fimDeJogoFuncao() {
    clearInterval(intervalo);
    fimDeJogo = true;
    
    // Atualiza recorde
    if (pontos > recorde) {
        recorde = pontos;
        localStorage.setItem('recorde', recorde);
        recordeElement.textContent = recorde;
    }
    
    // Mostra tela de fim de jogo
    pontosFinaisElement.textContent = pontos;
    gameOverElement.style.display = 'block';
    iniciarBtn.disabled = false;
    pausarBtn.disabled = true;
}

// Alterna entre pausado e em jogo
function alternarPausa() {
    pausado = !pausado;
    pausarBtn.textContent = pausado ? 'Continuar' : 'Pausar';
}

// Reinicia o jogo
function reiniciarJogo() {
    gameOverElement.style.display = 'none';
    iniciarJogo();
}

// Event listeners
document.addEventListener('keydown', mudarDirecao);

// Inicia o jogo
iniciar();