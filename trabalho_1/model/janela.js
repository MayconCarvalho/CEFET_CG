// circulo janela foguete
let circleVertexPositionBuffer;
let circleVertexColorBuffer;

function iniciaBuffersJanela() {
    // circulo da janela vertices
    circleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer)
    let retas = [];
    let radius = 0.8;
    let qtd_vertices = 25;
    for (let i = 0; i < 2 * Math.PI; i += 2 * Math.PI / qtd_vertices) {
        retas.push(Math.cos(i) * radius, Math.sin(i) * radius, 0);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(retas), gl.STATIC_DRAW);
    circleVertexPositionBuffer.itemSize = 3;
    circleVertexPositionBuffer.numItems = retas.length / 3;

    // circulo da janela cores
    circleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
    cores = [];
    for (let i = 0; i < retas.length / 3; i++) {
        cores = cores.concat([1.0, 1.0, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cores), gl.STATIC_DRAW);
    circleVertexColorBuffer.itemSize = 3;
    circleVertexColorBuffer.numItems = retas.length / 3;
}

function desenhaCenaJanela() {
    // janela vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        circleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //janela cores
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        circleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertexPositionBuffer.numItems);
}
