'use strict';

let gl;

async function main(){
	initWebGL();
	// Load shaders
	// Init webgl components(framebuffers and such)
	// Begin animation loop
}

function initWebGL(){
	const canvas = document.getElementById('ourCanvas');
	gl = canvas.getContext('webgl2');
}

window.onload = main;