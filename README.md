# Parametric Roulette

## Draw the locus of a point on a circle rolling on an arbitrary parametric function, implemented using Geogebra

Note: Originally I planned to implement this using JavaScript as an extension and generalization to my "Flowers-curve" repository (which is about drawing the locus of a point on circle rolling along another circle). However, I was unable to find a JavaScript library that can evaluate the definite integral for the arc length function accurately and efficiently. Therefore, I made this prototype with Geogebra instead. If you found a suitable JS calculus library, please notify me. 

---

## Example 1: Rolling on a parabola 

<img src="http://latex.codecogs.com/svg.latex?\inline&space;\dpi{200}&space;\large&space;\left\{&space;\begin{array}{lr}&space;x=&space;t&space;&&space;\\&space;y=&space;\frac{t^2}{10}&space;\end{array}&space;\right.&space;-30\leq&space;t\leq&space;30" title="\large \left\{ \begin{array}{lr} x= t & \\ y= \frac{t^2}{10} \end{array} \right. -30\leq t\leq 30" />

<img src="on-parabola.svg" width="600px">

## Example 2: Rolling on the sine function

<img src="http://latex.codecogs.com/svg.latex?\inline&space;\dpi{200}&space;\large&space;\left\{&space;\begin{array}{lr}&space;x=&space;t&space;&&space;\\&space;y=&space;5\sin(\frac{t}{5})&space;\end{array}&space;\right.&space;-30\leq&space;t\leq&space;30" title="\large \left\{ \begin{array}{lr} x= t & \\ y= 5\sin(\frac{t}{5}) \end{array} \right. -30\leq t\leq 30" />

<img src="doc/on-sin(x).svg" width="600px">

## Example 3: Rolling along an ellipse

<img src="http://latex.codecogs.com/svg.latex?\inline&space;\dpi{200}&space;\large&space;\left\{&space;\begin{array}{lr}&space;x=&space;10\cos(t)&space;&&space;\\&space;y=&space;6\sin(t)&space;\end{array}&space;\right.&space;-\pi<&space;t\leq&space;\pi" title="\large \left\{ \begin{array}{lr} x= 10\cos(t) & \\ y= 6\sin(t) \end{array} \right. -\pi< t\leq \pi" />

<img src="doc/on-ellipse.svg" width="600px">

Note: I made a sign adjustment in this case to ensure that the circle will always appear outside the ellipse.

---

# Mechanism

## Assumption

The radius of curvature at any point on the parametric equation is greater than the radius of the circle rolling on it. If this condition is not met, then the circle may appear to be overlapped with the parametric equation. For example:

<img src="doc/overlap.svg" width="400px">

## Computation

Suppose there is a circle with radius r is rolling on the parametric equation defined by 

<img src="http://latex.codecogs.com/svg.latex?\inline&space;\large&space;\left\{&space;\begin{array}{lr}&space;x=&space;f(t)&space;&&space;\\&space;y=&space;g(t)&space;\end{array}&space;\right.&space;a\leq&space;t\leq&space;b" title="\large \left\{ \begin{array}{lr} x= f(t) & \\ y= g(t) \end{array} \right. a\leq t\leq b" />

<img src="doc/demo.svg" width="780px">

### Calculation of the radians (angle) rotated:

Suppose this circle has its center located on B and it touches the parametric curve at A when t = t<sub>1</sub>. Point E lies on its circumference. B' corresponds to the center of the circle when t = t<sub>2</sub> and point E'' corresponds to the position of point E after it has rotated θ radians.

The total length that this circle has rotated through, which is the length of the parametric curve between A and A' (the red curve in the above diagram), can be computed by the following definite integral (the arc length function)

<img src="http://latex.codecogs.com/svg.latex?\large&space;L_{AA'}&space;=&space;\int_{t_1}^{t_2}&space;\sqrt{[f'(t)]^2&plus;[g'(t)]^2}\&space;dt" title="\large L_{AA'} = \int_{t_1}^{t_2} \sqrt{[f'(t)]^2+[g'(t)]^2}\ dt" />

And the rotation angle θ in radians therefore is

<img src="http://latex.codecogs.com/svg.latex?\large&space;\theta&space;=&space;2\pi&space;\frac{L_{AA'}}{2\pi&space;r}&space;=&space;\frac{L_{AA'}}{r}" title="\large \theta = 2\pi \frac{L_{AA'}}{2\pi r} = \frac{L_{AA'}}{r}" />

Since 

<img src="http://latex.codecogs.com/svg.latex?\large&space;\large&space;\angle&space;F'BE''&space;=&space;\angle&space;F'B'E'&space;-&space;\theta&space;=&space;\angle&space;FBE&space;-&space;\theta&space;=&space;\angle&space;FBE&space;-&space;\frac{L_{AA'}}{r}" title="\large \large \angle F'BE'' = \angle F'B'E' - \theta = \angle FBE - \theta = \angle FBE - \frac{L_{AA'}}{r}" />

The coordinates of that point on the circumference can be found:

<img src="http://latex.codecogs.com/svg.latex?\large&space;\large&space;\large&space;E''&space;(X_{B'}&space;&plus;&space;r\cos(\angle&space;FBE&space;-&space;\frac{L_{AA'}}{r}),&space;Y_{B'}&space;&plus;&space;r\sin(\angle&space;FBE&space;-&space;\frac{L_{AA'}}{r}))" title="\large \large \large E'' (X_{B'} + r\cos(\angle FBE - \frac{L_{AA'}}{r}), Y_{B'} + r\sin(\angle FBE - \frac{L_{AA'}}{r}))" />

### Position of the center of the circle

The gradient of the tangent at point A' where t = t<sub>2</sub> can be found by parametric differentiation:

<img src="http://latex.codecogs.com/svg.latex?\large&space;k&space;=&space;\frac{dy}{dx}&space;=&space;\frac{\frac{dy}{dt}}{\frac{dx}{dt}}&space;=\frac{g'(t)}{f'(t)}" title="\large k = \frac{dy}{dx} = \frac{\frac{dy}{dt}}{\frac{dx}{dt}} =\frac{g'(t)}{f'(t)}" />

The gradient of the normal which passes through the center of the circle can then be found:

<img src="http://latex.codecogs.com/svg.latex?\large&space;n&space;=&space;-\frac{1}{k}&space;=&space;-\frac{f'(t)}{g'(t)}" title="\large n = -\frac{1}{k} = -\frac{f'(t)}{g'(t)}" />

The coordinate of A' can be calculated by substituting t = t<sub>2</sub> into the parametric equation

<img src="http://latex.codecogs.com/svg.latex?\large&space;A'(f(t_2),\&space;g(t_2))" title="\large A'(f(t_2),\ g(t_2))" />

Knowing the gradient of A'B', the coordinate of B' can be obtained using the coordinate of A':

<img src="http://latex.codecogs.com/svg.latex?\large&space;B'(f(t_2)\&space;&plus;\&space;\textup{sgn(n)}\&space;r&space;\cos(\arctan(n)),\&space;g(t_2)\&space;&plus;\&space;\textup{sgn(n)}\&space;r&space;\sin(\arctan(n)))" title="\large B'(f(t_2)\ +\ \textup{sgn(n)}\ r \cos(\arctan(n)),\ g(t_2)\ +\ \textup{sgn(n)}\ r \sin(\arctan(n)))" />

where sgn(n) is the sign of n, the gradient of the normal.

---

# Known deficiency

The circle will always appear ABOVE the graph, which sometimes causes weird "jumps". Example:

<img src="http://latex.codecogs.com/svg.latex?\large&space;\large&space;\left\{&space;\begin{array}{lr}&space;x=&space;16\sin^3(t)&space;&&space;\\&space;y=&space;13\cos(t)&space;-&space;5\cos(2t)&space;-&space;2\cos(3t)&space;-&space;\cos(4t)&space;\end{array}&space;\right.&space;t\in(-\pi,\pi]" title="\large \large \left\{ \begin{array}{lr} x= 16\sin^3(t) & \\ y= 13\cos(t) - 5\cos(2t) - 2\cos(3t) - \cos(4t) \end{array} \right. t\in(-\pi,\pi]" />

<img src="doc/heart.svg" width="600px">