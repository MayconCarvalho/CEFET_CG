// triangulo asa direita
let triangleBottomRightVertexPositionBuffer;
let triangleBottomRightVertexColorBuffer;

function iniciaBuffersAsaDireita() {
    // triangulo asa direita vertices
    triangleBottomRightVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomRightVertexPositionBuffer);
    vertices = [
        // Frente
        0.5, -1.0, 0.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Direita
        0.5, -1.0, 0.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,

        // Trás
        0.5, -1.0, 0.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,

        // Esquerda
        0.5, -1.0, 0.0,
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleBottomRightVertexPositionBuffer.itemSize = 3;
    triangleBottomRightVertexPositionBuffer.numItems = 12;

    // triangulo asa direita cores
    triangleBottomRightVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomRightVertexColorBuffer);
    cores = [];
    for (let i = 0; i < 12; i++) {
        cores = cores.concat([0.0, 1.0, 0.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
    triangleBottomRightVertexColorBuffer.itemSize = 4;
    triangleBottomRightVertexColorBuffer.numItems = 3;
}

function desenhaCenaAsaDireita() {
    mat4.rotate(mMatrix, mMatrix, degToRad(rWings), [1, 0, 0]);

    // asa direita do foguete vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomRightVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleBottomRightVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // asa direita do foguete vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBottomRightVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        triangleBottomRightVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleBottomRightVertexPositionBuffer.numItems);
}
