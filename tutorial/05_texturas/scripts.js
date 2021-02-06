// matrizes de model / view / position /
let mMatrix = mat4.create();
let vMatrix = mat4.create();
let pMatrix = mat4.create();

// aloca memória na GPU no qual podemos jogar os dados dos objetos 3D
let shaderProgram;

// buffers cubo
let cuboVertexPositionBuffer;
let cuboVertexIndexBuffer;
let cuboVertexTextureCoordBuffer;

// variavel para textura do cubo de mandeira
let woodTexture;

// rotacionar o cubo
let xRot = 0;
let yRot = 0;
let zRot = 0;

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
    iniciarTextura();  // Criar a textura da imagem
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

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexTextureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
}

function iniciarBuffers() {
    cuboVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexPositionBuffer);
    let vertices = [
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

    // criando a textura do cubo
    cuboVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexTextureCoordBuffer);

    //  Os texels podem ser referenciados dentro da faixa de valores reais [0.0, 1.0]
    //  onde 0.0 é o lado esquerdo da textura, e 1.0 é o extremo direito
    let coordTextura = [
        // Frente
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Trás
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Topo
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Base
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Direita
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Esquerda
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];
    // Assim como as posições e cores são atributos do vértices, as coordenadas de textura também são.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordTextura), gl.STATIC_DRAW);
    cuboVertexTextureCoordBuffer.itemSize = 2;
    cuboVertexTextureCoordBuffer.numItems = 24;

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

    // Desenhando o Cubo
    let translation = vec3.create();
    vec3.set (translation,3.0, 0.0, 0.0);
    mat4.translate(mMatrix, mMatrix, [0.0, 0.0, -5.0]);

    // alterando a rotação do cubo
    mat4.rotate(mMatrix, mMatrix, degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mMatrix, mMatrix, degToRad(yRot), [0, 1, 0]);
    mat4.rotate(mMatrix, mMatrix, degToRad(zRot), [0, 0, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        cuboVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // aplicando a textura no cubo
    gl.bindBuffer(gl.ARRAY_BUFFER, cuboVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute,
        cuboVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // set a textura usada nos 32 registros
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, woodTexture);
    gl.uniform1i(shaderProgram.samplerUniform,0); // associa o shader ao registro

    // desenhando os indices do cubo
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cuboVertexIndexBuffer);
    setMatrixUniforms();

    // desenhando o cubo
    gl.drawElements(gl.TRIANGLES, cuboVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
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

// cria uma textura a partir de um arquivo de imagem
function iniciarTextura() {
    woodTexture = gl.createTexture();
    woodTexture.image = new Image();
    // woodTexture.crossOrigin.image = "anonymous";  // ask for CORS permission();

    woodTexture.image.onload = function() {
        tratarTextura(woodTexture);
    }
    woodTexture.image.src = "wood.jpg";
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}

// enviar a textura para a GPU
function tratarTextura(textura) {
    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    // comando q envia a textura para a GPU
    // tipo da textura, nivel da textura, espaco de cores, tamanho de cada pixel, matriz de pixels (texels)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textura.image);

    // borrar a imagem quando a câmera está muito perto (TEXTURE_MAG_FILTER)
    // definindo a cor dde um pixel a partir do texel vizinho mais próximo
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // ao ver o objeto de longe (TEXTURE_MIN_FILTER), não há espaço nos polígones para tantos texels
    // deve escolher alguns texels para serem mostrados
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

let ultimo = 0;
function animar() {
    let agora = new Date().getTime();
    if (ultimo !== 0) {
        let diferenca = agora - ultimo;
        // angulo do cubo
        xRot  += ((90*diferenca)/1000.0) % 360.0;
        yRot  += ((75*diferenca)/1000.0) % 360.0;
        zRot  += ((50*diferenca)/1000.0) % 360.0;
    }
    ultimo = agora;
}

function degToRad(graus) {
    return graus * Math.PI / 180;
}
