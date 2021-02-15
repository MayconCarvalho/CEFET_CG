// variáveis global
let mMatrix = mat4.create();
let vMatrix = mat4.create();
let pMatrix = mat4.create();

let triangleTopVertexPositionBuffer;
let triangleBottomLeftVertexPositionBuffer;
let triangleBottomRightVertexPositionBuffer;
let triangleFireVertexPositionBuffer;
let squareVertexPositionBuffer;

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
    desenharCena();    // Usar os itens anteriores e desenhar
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
    // triangulo do topo
    triangleTopVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTopVertexPositionBuffer);
    let vertices = [
        0.0, 0.5, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleTopVertexPositionBuffer.itemSize = 3;
    triangleTopVertexPositionBuffer.numItems = 3;

    // quadrado do corpo
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    // triangulo asa esquerda
    triangleBottomLeftVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomLeftVertexPositionBuffer);
    vertices = [
        1.0, 0.5, 0.0,
        -0.5, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleBottomLeftVertexPositionBuffer.itemSize = 3;
    triangleBottomLeftVertexPositionBuffer.numItems = 3;

    // triangulo asa direita
    triangleBottomRightVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomRightVertexPositionBuffer);
    vertices = [
        -0.5, 0.5, 0.0,
        -0.5, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleBottomRightVertexPositionBuffer.itemSize = 3;
    triangleBottomRightVertexPositionBuffer.numItems = 3;

    // triangulo dos fogos
    triangleFireVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleFireVertexPositionBuffer);
    vertices = [
        0.0, 0.5, 0.0,
        -0.25, -1.0, 0.0,
        0.25, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleFireVertexPositionBuffer.itemSize = 3;
    triangleFireVertexPositionBuffer.numItems = 3;
}

function radian(degree) {
    return degree * (Math.PI / 180);
}

function iniciarAmbiente() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

function desenharCena() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    mat4.identity(mMatrix);
    mat4.identity(vMatrix);

    // Desenhando Triângulo do topo
    let translation = vec3.create();
    vec3.set(translation, 0, 3.2, -7.0);
    mat4.translate(mMatrix, mMatrix, translation);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTopVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleTopVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleTopVertexPositionBuffer.numItems);

    // Desenhando o corpo do foguete
    for (let i = 0; i < 2; i++) {
        vec3.set(translation, 0.0, -2.1, 0.0);
        mat4.translate(mMatrix, mMatrix, translation);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
            squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
    }

    // desenhando a asa esquerda do foguete
    vec3.set(translation, -2.1, 0, 0.0);
    mat4.translate(mMatrix, mMatrix, translation);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomLeftVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleBottomLeftVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleBottomLeftVertexPositionBuffer.numItems);

    // desenhando a asa direita do foguete
    vec3.set(translation, 3.7, 0, 0.0);
    mat4.translate(mMatrix, mMatrix, translation);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomRightVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleBottomRightVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleBottomRightVertexPositionBuffer.numItems);

    // desenhando o fogo do foguete
    vec3.set(translation, -3.1, -1.7, 0.0);
    mat4.translate(mMatrix, mMatrix, translation);
    for (let i = 0; i < 4; i++) {
        vec3.set(translation, 0.6, 0, 0.0);
        mat4.translate(mMatrix, mMatrix, translation);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleFireVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
            triangleFireVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, triangleFireVertexPositionBuffer.numItems);
    }
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}
