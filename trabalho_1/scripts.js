// Matrizes de model view position
let mMatrix = mat4.create();
let vMatrix = mat4.create();
let pMatrix = mat4.create();

// pilha
let mMatrixPilha = [];

// angula de rotacao
let rFire = 0;
let rBody = 0;
let rWings = 0;

// shader
let shaderProgram;

// Iniciar o ambiente quando a página for carregada
$(function () {
    iniciaWebGL();
});

function iniciaWebGL() {
    let canvas = $('#canvas-webgl')[0];
    iniciarGL(canvas); // Definir como um canvas 3D
    iniciarShaders();  // Obter e processar os Shaders
    iniciarBuffers();  // Enviar o triângulo e quadrado na GPU
    iniciarAmbiente(); // Definir background e cor do objeto
    tick();            // Desenhar a cena repetidamente
}

function iniciarGL(canvas) {
    try {
        gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
        if (!gl)
            alert("Não pode inicializar WebGL, desculpe");
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

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
}

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

function iniciarBuffers() {
    iniciaBuffersTopo();
    iniciaBuffersCorpo();
    iniciaBuffersJanela();
    iniciaBuffersAsaEsquerda();
    iniciaBuffersAsaDireita();
    iniciaBuffersFogo();
}

function iniciarAmbiente() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

function tick() {
    requestAnimFrame(tick);
    desenharCena();
    animar();
}

function desenharCena() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    mat4.identity(mMatrix);
    mat4.identity(vMatrix);

    // Desenhando Triângulo do topo
    let translation = vec3.create();
    vec3.set(translation, 0, 2.7, -7.0);
    mat4.translate(mMatrix, mMatrix, translation);

    mPushMatrix();

    desenhaCenaTopo();

    mPopMatrix();

    // Desenhando o corpo do foguete
    for (let i = 0; i < 2; i++) {
        vec3.set(translation, 0.0, -2.1, 0.0);
        mat4.translate(mMatrix, mMatrix, translation);

        mPushMatrix();

        desenhaCenaCorpo();

        mPopMatrix();
    }

    // desenhando a janela do foguete
    vec3.set(translation, 0, 2.1, 1.01);
    mat4.translate(mMatrix, mMatrix, translation);

    mPushMatrix();
    vec3.set(translation, 0, 0, -1.01);
    mat4.translate(mMatrix, mMatrix, translation);
    mat4.rotate(mMatrix, mMatrix, degToRad(rBody), [0, 1, 0]);

    vec3.set(translation, 0, 0, 1.01);
    mat4.translate(mMatrix, mMatrix, translation);
    desenhaCenaJanela();

    mPopMatrix();

    // desenhando a asa esquerda do foguete
    vec3.set(translation, -2.1, -2.1, -1.01);
    mat4.translate(mMatrix, mMatrix, translation);

    mPushMatrix();
    vec3.set(translation, 2.1, 0, 0);
    mat4.translate(mMatrix, mMatrix, translation);
    mat4.rotate(mMatrix, mMatrix, degToRad(rBody), [0, 1, 0]);

    vec3.set(translation, -2.1, 0, 0);
    mat4.translate(mMatrix, mMatrix, translation);
    desenhaCenaAsaEsquerda();

    // desenhando a asa direita do foguete
    vec3.set(translation, 4.2, 0, 0.0);
    mat4.translate(mMatrix, mMatrix, translation);
    desenhaCenaAsaDireita();

    mPopMatrix();

    // desenhando o fogo do foguete
    vec3.set(translation, 0.6, -1.7, 0.0);
    mat4.translate(mMatrix, mMatrix, translation);
    for (let i = 0; i < 4; i++) {
        vec3.set(translation, 0.6, 0, 0.0);
        mat4.translate(mMatrix, mMatrix, translation);

        mPushMatrix();
        desenhaCenaFogo();
        mPopMatrix();
    }
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}

let ultimo = 0;

function animar() {
    let agora = new Date().getTime();
    if (ultimo !== 0) {
        let diferenca = agora - ultimo;
        rFire += ((50 * diferenca) / 1000.0) % 360.0;
        rBody += ((70 * diferenca) / 1000.0) % 360.0;
        rWings += ((100 * diferenca) / 1000.0) % 360.0;
    }
    ultimo = agora;
}

function degToRad(graus) {
    return graus * Math.PI / 180;
}

function mPushMatrix() {
    let copy = mat4.clone(mMatrix);
    mMatrixPilha.push(copy);
}

function mPopMatrix() {
    if (mMatrixPilha.length === 0) {
        throw "inválido popMatrix!";
    }
    mMatrix = mMatrixPilha.pop();
}
