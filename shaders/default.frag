precision highp float;
#pragma glslify: cnoise4 = require(glsl-noise/periodic/4d)
// #pragma glslify: cnoise4 = require('glsl-fractal-brownian-noise/4d')
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uSeed;
uniform float uNoiseScale;
uniform float uSteps;

#define NOISE_SCALE 1.
#define OCTAVES 16
#define PI 3.1415
#define PERIOD 2.425e3
#define PERSISTENCE .7

float rand(float n){return fract(sin(n) * 43758.5453123);}

float persistence = 0.;

float getNoise(vec2 uv, float frequency, vec2 seed) {
  float x1 = -(uNoiseScale * frequency) + seed.x;
  float y1 = -(uNoiseScale * frequency) + seed.y;
  float x2 = (uNoiseScale * frequency) + seed.x;
  float y2 = (uNoiseScale * frequency) + seed.y;

  float dx = (x2-x1);
  float dy = (y2-y1);

  float dxPi = dx/(2.0*PI);
  float dyPi = dy/(2.0*PI);

  float s = uv.x;
  float t = uv.y;

  float nx = x1 + cos(s*2.0*PI)*dxPi;
  float ny = y1 + cos(t*2.0*PI)*dyPi;
  float nz = x1 + sin(s*2.0*PI)*dxPi;
  float nw = y1 + sin(t*2.0*PI)*dyPi;

  float r = cnoise4(vec4(nx, ny, nz, nw), vec4(PERIOD));
  return r*1.5+.5;
}

float OctavePerlin(vec2 uv, int octaves, float persistence, vec2 seed) {
    float total = 0.0;
    float frequency = 1./float(OCTAVES/2);
    float amplitude = 1.0;
    float maxValue = 0.0;  // Used for normalizing result to 0.0 - 1.0
    persistence = PERSISTENCE;
    for(int i=0;i<octaves;++i) {
        total += getNoise(uv, frequency, seed) * amplitude;

        maxValue += amplitude;

        amplitude *= persistence;
        frequency *= 1.5;
    }

    return total/maxValue;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  vec2 seed = uSeed;

  vec2 rn = seed + 55.;
  vec2 gn = seed + 26.;// + PI*2.;
  vec2 bn = seed + 22.;// + PI*4.;
  vec2 an = seed + 29.;// + PI*6.;

  float r = OctavePerlin(uv, OCTAVES, persistence, rn);
  float g = OctavePerlin(uv, OCTAVES, persistence, gn);
  float b = OctavePerlin(uv, OCTAVES, persistence, bn);
  float a = 1.;//OctavePerlin(uv + uSteps * 3., OCTAVES, persistence, an);


  gl_FragColor = vec4(r,g,b,a);

}
