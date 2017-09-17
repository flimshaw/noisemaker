# noisemaker

Generate tileable perlin noise textures from the command line.

![noisemaker -t 653.0 -o example.png](./example.png?raw=true "noisemaker -t 653.0 -o example.png")

It's reaaaal basic but I figured I'd share it. Uses glsl-noise, headless-gl and pngjs to generate perlin noise fields that are tileable in all directions. Adjust the "time" value to advance the generator. It kinda randomizes them over time, and starts to get a little glitchy after 10000.0 or so.

## installation

`npm install -g noisemaker`

## usage

create a random noise png in the current directory

`noisemaker -t [random float]`

create a png with a specific seed/time in the current directory

`noisemaker -t 1.0`

create a named png that looks just like the image above (example.png):

`noisemaker -t 653.0 -o example_copy.png`

## how does it work?

So, perlin noise is basically the "clouds" filter from photoshop. It's a fuzzy, cloudy kind of noise that you can generate mathematically. You do this by setting some parameters, and then looping over a grid of positions to see what the value of that position is in this noise field.

So, for 2D perlin noise, you can just go over each pixel on your screen and look up what the noise value is, ie:

`float brightness = snoise2(x, y);`

This is already pretty awesome, and you can do fun things by scaling how x and y are portioned out, or passing them through sin functions and all the other things you try when you're messing around with shaders. But this tool generates noise that is also *tileable*, meaning you can repeat the image endlessly in all directions, which is super handy for all sorts of shader tricks.

I will not claim to _completely_ grok the math, but I can tell you what it is doing. Instead of a two-dimensional noise function, we use a four-dimensional one. And instead of giving it our 2D x and y coordinates, we use those 2D coordinates to generate two pairs of x,y coordinates, each transcribing a circle in 3D space perpendicular to the other. You pass these into your 4D noise function like: `snoise(x1,y1,x2,y2);`, and the value of the noise field at that 4 dimensional position is the value of the pixel at that x,y position.

All this code is in `shaders/default.frag`, and I render it on a headless-gl context, and then pipe it back into a PNG file. I do one of these 4D passes with different offsets for each red, green and blue channels of the png.

## thanks

I got some code and concepts from these places, where people generously shared their ideas:

* https://gamedev.stackexchange.com/questions/23625/how-do-you-generate-tileable-perlin-noise
* https://www.gamedev.net/blogs/entry/2138456-seamless-noise/

## help

```noisemaker
+ + +

options:
-size [512]	        png output size in pixels, always square
-noise_scale [1.0]	scale of noise, bigger number = higher frequency
-t [0.0]	          timestamp to render in noise field, like a seed you can fade
-o [./noise_...]	  output path relative to current location for png
```
