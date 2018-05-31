# Parametric Roulette

## Draw the locus of a point on a circle rolling on an arbitrary parametric function, implemented separately using Geogebra and JavaScript

Note: Originally I planned to implement this using JavaScript as an extension and generalization to my "[Flowers-curve](https://github.com/hanzhi713/Flowers-Curve)" repository (which is about drawing the locus of a point on circle rolling along another circle). However, I was unable to find a JavaScript library that can evaluate the definite integral for the arc length function accurately and efficiently. Therefore, I firstly made the prototype with Geogebra. The geogebra file could be found in the [doc](https://github.com/hanzhi713/Parametric-Roulette/tree/master/doc) folder.

Now, the JS drawer is successfully implemented as I found [Nerdamer](http://nerdamer.com) for symbolic differentiation and I used the trapezoidal rule for numerical integration. To use the online drawer, please visit https://hanzhi713.github.io/Parametric-Roulette/index.html

The interface of my JavaScript drawer is adapted from my [Spirograph drawer](https://github.com/hanzhi713/Flowers-Curve). New inputs are annotated by tooltips. It works best on Chrome and Firefox. Not tested on other browsers.

---

## Mechanism

See [here](Mechanism.md)

---

## Example 1: Rolling on a hyperbola 

<img src="http://latex.codecogs.com/svg.latex?&space;\left\{&space;\begin{array}{lr}&space;x=2\cosh{t}&space;&&space;\\&space;y=&space;1.5\sinh{t}&space;\end{array}&space;\right.&space;-\pi\leq&space;t\leq&space;\pi" title=" \left\{ \begin{array}{lr} x=2\cosh{t} & \\ y= 1.5\sinh{t} \end{array} \right. -\pi\leq t\leq \pi" />

<img src="doc/on-hyperbola.svg" width="500px">

<img src="doc/hyperbola.gif">

Config is available [here](doc/hyperbola.json)

## Example 2: Rolling on the sine function

<img src="http://latex.codecogs.com/svg.latex?\inline&space;\dpi{200}&space;&space;\left\{&space;\begin{array}{lr}&space;x=&space;t&space;&&space;\\&space;y=&space;5\sin(\frac{t}{5})&space;\end{array}&space;\right.&space;-30\leq&space;t\leq&space;30" title=" \left\{ \begin{array}{lr} x= t & \\ y= 5\sin(\frac{t}{5}) \end{array} \right. -30\leq t\leq 30" />

<img src="doc/on-sin(x).svg" width="500px">

<img src="doc/sine.gif">

Config is available [here](doc/sine.json)

## Example 3: Rolling along an ellipse

<img src="http://latex.codecogs.com/svg.latex?\inline&space;\dpi{200}&space;&space;\left\{&space;\begin{array}{lr}&space;x=&space;10\cos(t)&space;&&space;\\&space;y=&space;6\sin(t)&space;\end{array}&space;\right.&space;-\pi<&space;t\leq&space;\pi" title=" \left\{ \begin{array}{lr} x= 10\cos(t) & \\ y= 6\sin(t) \end{array} \right. -\pi< t\leq \pi" />

<img src="doc/on-ellipse.svg" width="500px">

Note: I made a sign adjustment in this case to ensure that the circle will always appear outside the ellipse.

<img src="doc/ellipse.gif">

Config is available [here](doc/ellipse.json)
