#version 300 es
precision highp float;

in vec2 uv;

out vec4 outColor;

uniform sampler2D ourTexture; // The raw texture of conways game of life

void main(){
	vec3 texColor = texture(ourTexture, uv).rrr;
	outColor = vec4(texColor, 1.0);

	float texelSize = 1.0 / float(textureSize(ourTexture, 0).x);

	if(uv.x <= texelSize || uv.x >= 1.0 - texelSize || uv.y <= texelSize || uv.y >= 1.0 - texelSize){
		outColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
}