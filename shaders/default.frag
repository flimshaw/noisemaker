precision highp float;
#pragma glslify: cnoise4 = require(glsl-noise/classic/4d)
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uSeed;
uniform float uNoiseScale;

#define NOISE_SCALE 1.
#define OCTAVES 16
#define PI 3.1415

float rand(float n){return fract(sin(n) * 43758.5453123);}

float getNoise(vec2 uv, float scale, vec2 seed) {
  float x1 = -(uNoiseScale * scale) + seed.x;
  float y1 = -(uNoiseScale * scale) + seed.y;
  float x2 = (uNoiseScale * scale) + seed.x;
  float y2 = (uNoiseScale * scale) + seed.y;

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

  float r = cnoise4(vec4(nx, ny, nz, nw));
  return r + .25;
}

float OctavePerlin(vec2 uv, int octaves, float persistence, vec2 seed) {
    float total = 0.0;
    float frequency = .5;
    float amplitude = 1.0;
    float maxValue = 0.0;  // Used for normalizing result to 0.0 - 1.0
    for(int i=0;i<octaves;++i) {
        total += getNoise(uv, frequency, seed) * amplitude;

        maxValue += amplitude;

        amplitude *= persistence;
        frequency *= 2.0;
    }

    return total/maxValue;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  vec2 seed = uSeed;
  float persistence = .55;

  vec2 rn = seed;
  vec2 gn = seed + PI*2.;
  vec2 bn = seed + PI*4.;
  vec2 an = seed + PI*6.;

  float r = OctavePerlin(uv, OCTAVES, persistence, rn);
  float g = OctavePerlin(uv, OCTAVES, persistence, gn);
  float b = OctavePerlin(uv, OCTAVES, persistence, bn);
  float a = OctavePerlin(uv, OCTAVES, persistence, an);


  gl_FragColor = vec4(r,g,b,a);

}
