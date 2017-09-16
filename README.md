# noisemaker
Generate tileable perlin noise textures from the command line. It's reaaaal basic but I figured I'd share it.

## installation

`npm install -g noisemaker`

## usage

create a random noise png in the current directory

`noisemaker -t [random float]`

create a png with a specific seed/time in the current directory

`noisemaker -t 1.0`

## help

```noisemaker
+ + +

options:
-size [512]	        png output size in pixels, always square
-noise_scale [1.0]	scale of noise, bigger number = higher frequency
-t [0.0]	          timestamp to render in noise field, like a seed you can fade
-o [./noise_...]	  output path relative to current location for png
```
