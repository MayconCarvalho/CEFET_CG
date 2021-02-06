// matrizes de model / view / position /
let mMatrix = mat4.create();
let vMatrix = mat4.create();
let pMatrix = mat4.create();

// pilha
let mMatrixPilha = [];

let piramideVertexPositionBuffer;
let piramideVertexColorBuffer;
let cuboVertexPositionBuffer;
let cuboVertexColorBuffer;

// buffer para os indices
let cuboVertexIndexBuffer;

// angulo de rotacao da piramide e do cubo
let rPiramide = 0;
let rCubo = 0;

// Iniciar o ambiente quando a página for carregada
$(function () {
    iniciaWebGL();
});

function iniciaWebGL() {
    let canvas = $('#canvas-webgl')[0]; // obtendo a referencia do objeto canvas
    iniciarGL(canvas); // Definir como um canvas 3D
    iniciarShaders();  // Obter e processar os Shaders
    iniciarBuffers();  // Enviar o triângulo e quadrado na GPU
    iniciarAmbiente(); // Definir background e cor do objeto
    tick();            // Desenhar a cena repetidamente
}

// obtendo o contexto WebGL, um objeto que contém toda a funcionalidade para criar e manipular
// o ambiente 3D, além de envia-lo para a GPU.
function iniciarGL(canvas) {
    try {
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
        if (!gl) alert("Não pode inicializar WebGL, desculpe");
    }
}

// aloca memória na GPU no qual podemos jogar os dados dos objetos 3D
let shaderProgram;
function iniciarShaders() {
    let vertexShader = getShader(gl, "#shader-vs");
    let fragmentShader = getShader(gl, "#shader-fs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Não pode inicializar shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
}

function iniciarBuffers() {
    // vértices da piramide
    piramideVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, piramideVertexPositionBuffer);
    let vertices = [
        // Frente
        0.0, 1.0, 0.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,

        // Direita
        0.0, 1.0, 0.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,

        // Trás
        0.0, 1.0, 0.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,

        // Esquerda
        0.0, 1.0, 0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    piramideVertexPositionBuffer.itemSize = 3;
    piramideVertexPositionBuffer.numItems = 12; // 12 triangulos

    // cores da piramide
    piramideVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, piramideVertexColorBuffer);
    let cores = [
        // Frente
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Direita
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,

        // Trás
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,

        // Esquerda
        1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
    piramideVertexColorBuffer.itemSize = 4;
    piramideVertexColorBuffer.numItems = 12; // quantidade de triangulos

    cuboVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexPositionBuffer);
    vertices = [
        // Frente
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Trás
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Topo
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Base
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Direita
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Esquerda
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cuboVertexPositionBuffer.itemSize = 3;
    cuboVertexPositionBuffer.numItems = 24;

    cuboVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexColorBuffer);
    cores = [
        [1.0, 0.0, 0.0, 1.0],     // Frente
        [1.0, 1.0, 0.0, 1.0],     // Trás
        [0.0, 1.0, 0.0, 1.0],     // Topo
        [1.0, 0.5, 0.5, 1.0],     // Base
        [1.0, 0.0, 1.0, 1.0],     // Direita
        [0.0, 0.0, 1.0, 1.0],     // Esquerda
    ];
    let coresReplicadas = [];
    for (let i in cores) {
        let cor = cores[i];
        for (let j = 0; j < 4; j++) {
            coresReplicadas = coresReplicadas.concat(cor);
        }
    }
    // usar a matriz de cores replicadas
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coresReplicadas), gl.STATIC_DRAW);
    cuboVertexColorBuffer.itemSize = 4;
    cuboVertexColorBuffer.numItems = 24;

    // criado os indices para desenhar o cubo
    cuboVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cuboVertexIndexBuffer);
    let indices = [
        0, 1, 2, 0, 2, 3,         // Frente
        4, 5, 6, 4, 6, 7,         // Trás
        8, 9, 10, 8, 10, 11,      // Topo
        12, 13, 14, 12, 14, 15,   // Base
        16, 17, 18, 16, 18, 19,   // Direita
        20, 21, 22, 20, 22, 23    // Esquerda
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    cuboVertexIndexBuffer.itemSize = 1;
    cuboVertexIndexBuffer.numItems = 36;
}

// define a cor de fundo para preto e habilita o Z-buffer
function iniciarAmbiente() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

// O shader é uma descrição textual de como um simples conjunto de números (vértices e cores)
// se converterão em fragmentos (pixels), descartando os pixels ocultos e definindo suas
// cores baseados em cálculos.
// Compilar os shaders na GPU e retonra o objeto compilado
function getShader(gl, id) {
    let shaderScript = $(id)[0];
    if (!shaderScript) {
        return null;
    }

    let str = "";
    let k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType === 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    let shader;
    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

// limpa a tela, define a perspectiva, preenche as matrizes de modelo e de vizualização
// e desenha os objetos
function desenharCena() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    mat4.identity(mMatrix);
    mat4.identity(vMatrix);

    mat4.translate(mMatrix, mMatrix, [-1.5, 0.0, -7.0]);

    // movimentando o piramide
    mPushMatrix();
    mat4.rotate(mMatrix, mMatrix, degToRad(rPiramide), [0, 1, 0]);

    // desenhando o piramide
    gl.bindBuffer(gl.ARRAY_BUFFER, piramideVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        piramideVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // colorindo o piramide
    gl.bindBuffer(gl.ARRAY_BUFFER, piramideVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        piramideVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();

    // Desenhando a piramide
    gl.drawArrays(gl.TRIANGLES, 0, piramideVertexPositionBuffer.numItems);

    mPopMatrix();

    // transladando o cubo
    mat4.translate(mMatrix, mMatrix, [3.0, 0.0, 0.0]);

    // movimentando o cubo
    mPushMatrix();
    // troca de [1, 0, 0] para [1, 1, 1]
    mat4.rotate(mMatrix, mMatrix, degToRad(rCubo), [1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        cuboVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    // desenhando os indices do cubo
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cuboVertexIndexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        cuboVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // colorindo o cubo
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        cuboVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();

    // desenhando o cubo
    gl.drawElements(gl.TRIANGLES, cuboVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mPopMatrix();
}

// função que enviar matrizes 4x4 para o uniform (espaço de memória na GPU que será tratada pelo shader)
function setMatrixUniforms() {
    // uniformMatrix4fv(endereco da uniform no shader,
    // transformar a matriz em transposta antes de enviar para GPU,
    // matriz a ser enviada)
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}

// executa a próxima translacao do objeto desenhado
function tick() {
    requestAnimFrame(tick);
    desenharCena();
    animar();
}

// copia a matriz atual model e guarda na pilha
function mPushMatrix() {
    let copy = mat4.clone(mMatrix);
    mMatrixPilha.push(copy);
}

// retorna a matriz guardada no topo da pilha para a mMatriz
function mPopMatrix() {
    if (mMatrixPilha.length === 0) {
        throw "inválido popMatrix!";
    }
    mMatrix = mMatrixPilha.pop();
}

let ultimo = 0;
function animar() {
    let agora = new Date().getTime();
    if (ultimo !== 0) {
        let diferenca = agora - ultimo;
        // angulo da piramide
        rPiramide += ((110 * diferenca) / 1000.0) % 360.0;
        // angulo do cubo
        rCubo += ((50 * diferenca) / 1000.0) % 360.0;
    }
    ultimo = agora;
}

function degToRad(graus) {
    return graus * Math.PI / 180;
}
