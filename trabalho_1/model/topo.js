// triangulo topo
let triangleTopVertexPositionBuffer;
let triangleTopVertexColorBuffer;

function iniciaBuffersTopo() {
    // triangulo do topo vertices
    triangleTopVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTopVertexPositionBuffer);
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
    triangleTopVertexPositionBuffer.itemSize = 3;
    triangleTopVertexPositionBuffer.numItems = 12;

    // triangulo do topo cores
    triangleTopVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTopVertexColorBuffer);
    let cores = [];
    for (let i = 0; i < 12; i++) {
        cores = cores.concat([1.0, 1.0, 0.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
    triangleTopVertexColorBuffer.itemSize = 4;
    triangleTopVertexColorBuffer.numItems = 12;
}

function desenhaCenaTopo() {
    mat4.rotate(mMatrix, mMatrix, degToRad(rBody), [0, 1, 0]);

    // triangulo topo vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTopVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleTopVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // triangulo topo cores
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTopVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        triangleTopVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, triangleTopVertexPositionBuffer.numItems);
}
