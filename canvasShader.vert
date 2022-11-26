#version 300 es

layout (location = 0) in vec2 aPosition;

out vec2 uv;

uniform mat4 orthoMatrix;
uniform float gridWidth;

void main() {
	vec2 vecPos = (aPosition + 1.0) / 2.0;
	uv = vecPos;
	gl_Position = orthoMatrix * vec4(vecPos * gridWidth, 0.0, 1.0);
}