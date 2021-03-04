// triangulo fogo
let triangleFireVertexPositionBuffer;

function iniciaBuffersFogo() {
    // triangulo dos fogos vertices
    triangleFireVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleFireVertexPositionBuffer);
    vertices = [
        // Frente
        0.0, 0.5, 0.0,
        -0.20, -0.5, 0.20,
        0.20, -0.5, 0.20,

        // Direita
        0.0, 0.5, 0.0,
        0.20, -0.5, 0.20,
        0.20, -0.5, -0.20,

        // Trás
        0.0, 0.5, 0.0,
        0.20, -0.5, -0.20,
        -0.20, -0.5, -0.20,

        // Esquerda
        0.0, 0.5, 0.0,
        -0.20, -0.5, -0.20,
        -0.20, -0.5, 0.20
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleFireVertexPositionBuffer.itemSize = 3;
    triangleFireVertexPositionBuffer.numItems = 12;
}

function desenhaCenaFogo() {
    mat4.rotate(mMatrix, mMatrix, degToRad(-rFire), [0, 1, 0]);

    // fogo do foguete vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleFireVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleFireVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleFireVertexPositionBuffer.numItems);
}
