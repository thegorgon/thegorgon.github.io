---
layout: project
title: a clock in javascript
---

This was an experiment in using canvas and React for simple rendering and animation.

I started playing with the idea of using React in order to re-implement an old project - a visualization of the k-means algorithm. As I started building, I found myself building a basic clock in order to implement and test an animation scaffold. I decided to just move forward and implement a clock.

In building the basic clock, I started a small library to abstract canvas drawing, but only needed a few functions to draw a basic clock. I wanted to fill out my library with more functionality like shadows, colors and shape primitives. I had a vision of an old 80's clock - I thought it was maybe from 'Saved By The Bell' or 'Beverly Hills 90210' - but Google Image searches surfaced a giant wrist-watch shaped Swatch wall clock that came close to what I had in my minds eye. I decided to try my best to draw the clock from the photo. The result became the retro clock above.

With two clocks implemented, I wanted to explore another iconic watch - the Movado. I found an amazing photo of a Movado and set about trying to recreate the shadows, sharp gradients and dramatic look of the metal casing, black face, and starkly shining dot. This also allowed me to explore the canvas gradient APIs in order to achieve the three-dimensional shadow effects and black shine gradients.

The code isn't tested or wonderfully architected, but it was a fun exercise in using canvas, drawing with code and integrating canvas with React. You can see the inspiration photos below:

<img src="{{ 'assets/images/swatch-clock.jpg' | prepend: site.baseurl }}?{{site.time | date: '%s%N'}}" width="267" height="201" alt="Swatch Wall Clock" title="Swatch Wall Clock"/>
<img src="{{ 'assets/images/movado-watch.jpg' | prepend: site.baseurl }}?{{site.time | date: '%s%N'}}" width="165" height="202" alt="Movado Watch" title="Movado Watch"/>
