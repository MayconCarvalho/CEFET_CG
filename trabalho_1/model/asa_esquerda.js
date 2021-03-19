// triangulo asa esquerda
let triangleBottomLeftVertexPositionBuffer;
let triangleBottomLeftVertexColorBuffer;

// angula de rotacao
let rWingsLeft = 0;

function iniciaBuffersAsaEsquerda() {
    // triangulo asa esquerda vertices
    triangleBottomLeftVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomLeftVertexPositionBuffer);
    vertices = [
        // Frente
        -0.5, -1.0, 0.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Direita
        -0.5, -1.0, 0.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,

        // Trás
        -0.5, -1.0, 0.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Esquerda
        -0.5, -1.0, 0.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleBottomLeftVertexPositionBuffer.itemSize = 3;
    triangleBottomLeftVertexPositionBuffer.numItems = 12;

    // triangulo asa esquerda cores
    triangleBottomLeftVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomLeftVertexColorBuffer);
    cores = [];
    for (let i = 0; i < 12; i++) {
        cores = cores.concat([1.0, 0.0, 0.0, 1.0,]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
    triangleBottomLeftVertexColorBuffer.itemSize = 4;
    triangleBottomLeftVertexColorBuffer.numItems = 3;
}

function desenhaCenaAsaEsquerda() {
    mat4.rotate(mMatrix, mMatrix, degToRad(rWingsLeft), [1, 0, 0]);

    // asa esquerda do foguete vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomLeftVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleBottomLeftVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // asa esquerda do foguete cores
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomLeftVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        triangleBottomLeftVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleBottomLeftVertexPositionBuffer.numItems);
}
