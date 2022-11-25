#version 300 es

layout (location = 0) in vec2 aPosition;

out vec2 uv;

uniform mat4 orthoMatrix;
uniform float gridWidth;

void main() {
	uv = aPosition / gridWidth;
	gl_Position = orthoMatrix * vec4(aPosition, 0.0, 1.0);
}