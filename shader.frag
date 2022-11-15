#version 300 es
precision mediump float;

in vec2 uv;

out vec4 outColor;

uniform sampler2D ourTexture; // The raw texture of conways game of life

void main(){
	vec3 texColor = texture(ourTexture, uv).rrr;
	outColor = vec4(texColor, 1.0);
}