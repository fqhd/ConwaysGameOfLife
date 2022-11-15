'use strict';

const WIDTH = 100;
const HEIGHT = 100;
let gl;
let programInfo;
const camera = {
	x: 0,
	y: 0,
	zoom: 1
};
let texture;

async function main(){
	initWebGL();
	await loadShaders();
	loadWebGLComponents();
	beginAnimationLoop();
}

function initWebGL(){
	const canvas = document.getElementById('ourCanvas');
	gl = canvas.getContext('webgl2');
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function loadTexture() {
	const imageData = [];
	for(let y = 0; y < HEIGHT; y++){
		for(let x = 0; x < WIDTH; x++){
			if(x == y){
				imageData.push(255);
			}else{
				imageData.push(0);
			}
		}
	}

	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, WIDTH, HEIGHT, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(imageData));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function loadWebGLComponents(){
	createQuad();
	loadTexture();
}

function createQuad() {
	const positions = [
		-1, -1,
		-1, 1,
		1, 1,
		-1, -1,
		1, 1,
		1, -1
	];

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

async function loadShaders(){
	let vsSource = await fetch('./shader.vert');
	vsSource = await vsSource.text();

	let fsSource = await fetch('./shader.frag');
	fsSource = await fsSource.text();

	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
		return null;
	}

	programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aPosition'),
		}
	};

	gl.useProgram(programInfo.program);
}

function beginAnimationLoop(){
	// Update texture
	// Draw texture
	drawFrame();
	requestAnimationFrame(beginAnimationLoop);
}

function drawFrame() {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

window.onload = main;