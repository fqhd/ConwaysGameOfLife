#version 300 es

layout (location = 0) in vec2 aPosition;

out vec2 uv;

uniform mat4 orthoMatrix;

void main(){
	uv = (aPosition + 1.0) / 2.0;
	uv = (orthoMatrix * vec4(uv, 0.0, 1.0)).xy;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}