'use strict';

let gl;
let programInfo;

async function main(){
	initWebGL();
	await loadShaders();
	// Init webgl components(framebuffers and such)
	// Begin animation loop
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
}

window.onload = main;