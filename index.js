const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const PNG = require('pngjs').PNG;
const glsl = require('glslify');


const OUTPUT_SIZE = argv.size !== undefined ? argv.size : 512;
const NOISE_SCALE = argv.noise_scale !== undefined ? argv.noise_scale : 1.0;
const FPS = argv.fps !== undefined ? argv.fps : 60;
const LENGTH = argv.loop_length !== undefined ? argv.loop_length : 60;
const FRAME_COUNT = FPS * LENGTH;
const LOOP_RADIUS = argv.loop_radius !== undefined ? argv.loop_radius : Math.PI;

const VERT_SHADER = glsl(argv.vert !== undefined ? argv.vert : './shaders/default.vert');
const FRAG_SHADER = glsl(argv.frag !== undefined ? argv.frag : './shaders/default.frag');

const time = argv.time !== undefined ? argv.time : 0.0;

const gl = require('headless-gl')(OUTPUT_SIZE, OUTPUT_SIZE);

gl.clearColor(0,0,0,1);
gl.clear(gl.COLOR_BUFFER_BIT);

function createShader(str, type) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw gl.getShaderInfoLog(shader);
	}
	return shader;
}

function createProgram(vstr, fstr) {
	var program = gl.createProgram();
	var vshader = createShader(vstr, gl.VERTEX_SHADER);
	var fshader = createShader(fstr, gl.FRAGMENT_SHADER);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw gl.getProgramInfoLog(program);
	}
	return program;
}



// INITIALIZATION
var boxSize = 1.;



var arrays = {
  position: [-boxSize, -boxSize, 0, boxSize, -boxSize, 0, -boxSize, boxSize, 0, -boxSize, boxSize, 0, boxSize, -boxSize, 0, boxSize, boxSize, 0],
};

var vertexPosBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
var vertices = arrays.position;
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

var program = createProgram(VERT_SHADER,FRAG_SHADER);
gl.useProgram(program);
program.timeUniform = gl.getUniformLocation(program, 'uTime');
program.resolutionUniform = gl.getUniformLocation(program, 'uResolution');

program.seedUniform = gl.getUniformLocation(program, 'uSeed');
program.vertexPosAttrib = gl.getAttribLocation(program, 'position');

function padToFour(number) {
	let n = '';
  if (Math.abs(number)<=9999) {
		n = ("000"+Math.abs(number)).slice(-4);
	}
	if(number < 0) {
		n = `-${n}`;
	}
  return n;
}

function render() {
	gl.uniform2f(program.resolutionUniform, OUTPUT_SIZE, OUTPUT_SIZE);
	gl.uniform1f(program.timeUniform, time*.005);

	gl.uniform2f(program.seedUniform, time, time);

	gl.uniform2f(program.resolutionUniform, OUTPUT_SIZE, OUTPUT_SIZE);

	gl.enableVertexAttribArray(program.vertexPosAttrib);
	gl.vertexAttribPointer(program.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	var pixels = new Uint8Array(OUTPUT_SIZE * OUTPUT_SIZE * 4);
	gl.readPixels(0, 0, OUTPUT_SIZE, OUTPUT_SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

	const png = new PNG({ width: OUTPUT_SIZE, height: OUTPUT_SIZE });

	for(var i=0; i<pixels.length; i+=4) {
	  png.data[i+0] = pixels[i+0];
	  png.data[i+1] = pixels[i+1];
	  png.data[i+2] = pixels[i+2];
	  png.data[i+3] = pixels[i+3];
	}

	png.pack().pipe(fs.createWriteStream(`${process.cwd()}/noise_${OUTPUT_SIZE}_${padToFour(time)}.png`));
}

render();
