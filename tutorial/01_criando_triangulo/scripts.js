// variáveis global
let mMatrix = mat4.create();
let vMatrix = mat4.create();
let pMatrix = mat4.create();

let triangleVertexPositionBuffer;
let squareVertexPositionBuffer;

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
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    let vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

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

    // Desenhando Triângulo
    let translation = vec3.create();
    vec3.set(translation, -1.5, 1.0, -7.0);
    mat4.translate(mMatrix, mMatrix, translation);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

    // Desenhando o Quadrado
    vec3.set(translation, 3.0, 0.0, 0.0);
    mat4.translate(mMatrix, mMatrix, translation);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}
