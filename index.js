'use strict';

const { mat4, vec3 } = glMatrix;

let GRID_WIDTH = 4096;
let gl;
let framebufferShader;
let canvasShader;
const camera = {
	x: 0,
	y: 0,
	zoom: 32
};
let textures = [];
let isMouseDown = false;
let framebuffer;
let textureCounter = 0;

async function main(){
	initWebGL();
	await loadShaders();
	loadWebGLComponents();
	beginAnimationLoop();
}

/*
function loadGameOfLife(path) {
	const image = new Image();
	image.onload = () => {
		GRID_WIDTH = image.width;
		gl.bindTexture(gl.TEXTURE_2D, getCurrentCanvasTexture());
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, getCurrentFramebufferTexture());
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.useProgram(canvasShader);
		gl.uniform1f(gl.getUniformLocation(canvasShader, 'gridWidth'), GRID_WIDTH);
	};
	image.src = path;
}
*/

function initWebGL(){
	const canvas = document.getElementById('ourCanvas');
	gl = canvas.getContext('webgl2');
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
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
	document.addEventListener('keypress', () => {
		updateTexture();
	});
	framebuffer = gl.createFramebuffer();
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

function createTextures(){
	textures.push(createTexture());
	textures.push(createTexture());
}

function setPixel(imageData, x, y, c){
	imageData[y * GRID_WIDTH + x] = c;
}

function createTexture() {
	const imageData = [];
	for(let y = 0; y < GRID_WIDTH; y++){
		for(let x = 0; x < GRID_WIDTH; x++){
			if(Math.random() >= 0.1){
				imageData.push(255);
			}else{
				imageData.push(0);
			}
		}
	}

	setPixel(imageData, 40, 40, 0);
	setPixel(imageData, 40, 41, 0);
	setPixel(imageData, 40, 42, 0);

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, GRID_WIDTH, GRID_WIDTH, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array(imageData));

	return texture;
}

function loadWebGLComponents(){
	createQuad();
	createTextures();
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
	framebufferShader = await loadShaderProgram('./framebufferShader.vert', './framebufferShader.frag');
	canvasShader = await loadShaderProgram('./canvasShader.vert', './canvasShader.frag');
	gl.useProgram(canvasShader);
	gl.uniform1f(gl.getUniformLocation(canvasShader, 'gridWidth'), GRID_WIDTH);
}

async function loadShaderProgram(vsPath, fsPath){
	let vsSource = await fetch(vsPath);
	vsSource = await vsSource.text();

	let fsSource = await fetch(fsPath);
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

	return shaderProgram;
}

function getCameraOrthoMatrix(){
	const matrix = mat4.create();
	mat4.ortho(matrix, 0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight, 0.0, 1.0); 

	const sMatrix = mat4.create();
	mat4.scale(sMatrix, sMatrix, vec3.fromValues(camera.zoom, camera.zoom, 0.0));
	mat4.mul(matrix, sMatrix, matrix);
	mat4.translate(matrix, matrix, vec3.fromValues(-camera.x + gl.canvas.clientWidth/2 - GRID_WIDTH/2, -camera.y + gl.canvas.clientHeight/2 - GRID_WIDTH/2, 0));

	return matrix;
}

function getCurrentFramebufferTexture(){
	return textures[textureCounter % 2];
}

function getCurrentCanvasTexture(){
	return textures[(textureCounter + 1) % 2];
}

function updateTexture() {
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, getCurrentFramebufferTexture(), 0);
	gl.bindTexture(gl.TEXTURE_2D, getCurrentCanvasTexture());
	gl.viewport(0, 0, GRID_WIDTH, GRID_WIDTH);
	gl.useProgram(framebufferShader);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	textureCounter++;
}

function beginAnimationLoop(){
	updateTexture();
	drawFrame();
	requestAnimationFrame(beginAnimationLoop);
}

function drawFrame() {
	const matrix = getCameraOrthoMatrix();
	gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
	gl.useProgram(canvasShader);
	gl.uniformMatrix4fv(gl.getUniformLocation(canvasShader, 'orthoMatrix'), false, matrix);
	gl.bindTexture(gl.TEXTURE_2D, getCurrentCanvasTexture());
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

window.onload = main;