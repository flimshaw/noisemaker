precision highp float;

varying vec2 vUv;
uniform float zoom;
uniform vec2 offset;
void main() {

  float square;

  float x = 0.0;
  float y = 0.0;

  float xt;
  float yt;

  vec2 c = (vUv - vec2(0.5, 0.5)) * 4.0 / zoom - offset;

  for(float i = 0.0; i < 1.0; i += 0.001) {

    xt = x * x - y * y + c.x;
    yt = 2.0 * x * y + c.y;

    x = xt;
    y = yt;

    square = x * x + y * y;
    gl_FragColor = vec4(sin(i * 2.0), i, sin(i * 2.0), 1.0);

    if(square >= 4.0) break;
  }

}
