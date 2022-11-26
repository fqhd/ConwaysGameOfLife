#version 300 es
precision highp float;

in vec2 uv;

out vec4 outColor;

uniform sampler2D ourTexture; // The raw texture of conways game of life

void main(){
    float texelSize = 1.0 / 128.0;

    int numNeighbors = 0;
    for(int x = -1; x <= 1; ++x)
    {
        for(int y = -1; y <= 1; ++y)
        {
            if(!(x == 0 && y == 0)){
                float neighbor = texture(ourTexture, uv + vec2(x, y) * texelSize).r;
                if(neighbor < 0.5){
                    numNeighbors++;
                }
            }
        }    
    }

	float texColor = texture(ourTexture, uv).r;

    outColor = vec4(texColor, texColor, texColor, 1.0);
    if(texColor < 0.5){
        if(numNeighbors == 2 || numNeighbors == 3){
        	outColor = vec4(0.0, 0.0, 0.0, 1.0);
        }else{
        	outColor = vec4(1.0);
        }
    }else{
        if(numNeighbors == 3){
            outColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
}