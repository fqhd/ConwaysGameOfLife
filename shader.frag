#version 300 es
precision highp float;

in vec2 uv;

out vec4 outColor;

uniform sampler2D ourTexture; // The raw texture of conways game of life

void main(){
	float texColor = texture(ourTexture, uv).r;
	outColor = vec4(texColor, texColor, texColor, 1.0);
}