'use strict';

const { mat4, vec3 } = glMatrix;

const GRID_WIDTH = 512;
let canvasWidth;
let canvasHeight;
let gl;
let shaderProgram;
const camera = {
	x: 200,
	y: 200,
	zoom: 32
};
let texture;
let isMouseDown = false;


async function main(){
	initWebGL();
	await loadShaders();
	loadWebGLComponents();
	beginAnimationLoop();
}

function initWebGL(){
	const canvas = document.getElementById('ourCanvas');
	gl = canvas.getContext('webgl2');
	canvasWidth = canvas.clientWidth;
	canvasHeight = canvas.clientHeight;
	canvas.addEventListener('mousedown', e => {
		if(e.button == 0){
			isMouseDown = true;
		}
	});
	canvas.addEventListener('mouseup', e => {
		if(e.button == 0){
			isMouseDown = false;
		}
	});
	canvas.addEventListener('mousemove', e => {
		if(isMouseDown){
			camera.x -= e.movementX * 1/camera.zoom;
			camera.y += e.movementY * 1/camera.zoom;
		}
	});
	canvas.addEventListener('wheel', e => {
		if(e.deltaY > 0) {
			camera.zoom /= 1.1;
		}else{
			camera.zoom *= 1.1;
		}
	});
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
	for(let y = 0; y < GRID_WIDTH; y++){
		for(let x = 0; x < GRID_WIDTH; x++){
			if(Math.random() < 0.5){
				imageData.push(0);
			}else{
				imageData.push(255);
			}
		}
	}

	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, GRID_WIDTH, GRID_WIDTH, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(imageData));
}

function loadWebGLComponents(){
	createQuad();
	loadTexture();
}

function createQuad() {
	const positions = [
		0, 0,
		0, GRID_WIDTH,
		GRID_WIDTH, GRID_WIDTH,
		0, 0,
		GRID_WIDTH, GRID_WIDTH,
		GRID_WIDTH, 0
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
	
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
		return null;
	}

	gl.useProgram(shaderProgram);
	gl.uniform1f(gl.getUniformLocation(shaderProgram, 'gridWidth'), GRID_WIDTH);
}

function getCameraOrthoMatrix(){
	const matrix = mat4.create();
	mat4.ortho(matrix, 0, canvasWidth, 0, canvasHeight, 0.0, 1.0);

	const sMatrix = mat4.create();
	mat4.scale(sMatrix, sMatrix, vec3.fromValues(camera.zoom, camera.zoom, 0.0));
	mat4.translate(matrix, matrix, vec3.fromValues(-camera.x + gl.canvas.clientWidth/2, -camera.y + gl.canvas.clientHeight/2, 0));

	mat4.mul(matrix, sMatrix, matrix);

	return matrix;
}

function beginAnimationLoop(){
	// Update texture
	drawFrame();
	requestAnimationFrame(beginAnimationLoop);
}

function drawFrame() {
	const matrix = getCameraOrthoMatrix();
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'orthoMatrix'), false, matrix);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

window.onload = main;