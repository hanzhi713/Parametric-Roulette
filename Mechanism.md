# Mechanism

## Assumption

The rolling circle doesn't have a collision box. It will keep rolling even if there's an overlapping region:

<img src="doc/overlap.svg" width="400px">

## Computation

Suppose there is a circle with radius r is rolling on the parametric equation defined by

<img src="http://latex.codecogs.com/svg.latex?\inline&space;&space;\left\{&space;\begin{array}{lr}&space;x=&space;f(t)&space;&&space;\\&space;y=&space;g(t)&space;\end{array}&space;\right.&space;a\leq&space;t\leq&space;b" title=" \left\{ \begin{array}{lr} x= f(t) & \\ y= g(t) \end{array} \right. a\leq t\leq b" />

<img src="doc/demo.svg" width="780px">

### Calculation of the radians (angle) rotated:

Suppose this circle has its center located on B and it touches the parametric curve at A when t = t<sub>1</sub>. Point E lies on its circumference. B' corresponds to the center of the circle when t = t<sub>2</sub> and point E'' corresponds to the position of point E after it has rotated θ radians.

The total length that this circle has rotated through, which is the length of the parametric curve between A and A' (the red curve in the above diagram), can be computed by the following definite integral (the arc length function)

<img src="http://latex.codecogs.com/svg.latex?&space;L_{AA'}&space;=&space;\int_{t_1}^{t_2}&space;\sqrt{[f'(t)]^2&plus;[g'(t)]^2}\&space;dt" title=" L_{AA'} = \int_{t_1}^{t_2} \sqrt{[f'(t)]^2+[g'(t)]^2}\ dt" />

And the rotation angle θ in radians therefore is

<img src="http://latex.codecogs.com/svg.latex?&space;\theta&space;=&space;2\pi&space;\frac{L_{AA'}}{2\pi&space;r}&space;=&space;\frac{L_{AA'}}{r}" title=" \theta = 2\pi \frac{L_{AA'}}{2\pi r} = \frac{L_{AA'}}{r}" />

Since

<img src="http://latex.codecogs.com/svg.latex?&space;&space;\angle&space;F'BE''&space;=&space;\angle&space;F'B'E'&space;-&space;\theta&space;=&space;\angle&space;FBE&space;-&space;\theta&space;=&space;\angle&space;FBE&space;-&space;\frac{L_{AA'}}{r}" title="  \angle F'BE'' = \angle F'B'E' - \theta = \angle FBE - \theta = \angle FBE - \frac{L_{AA'}}{r}" />

The coordinates of that point on the circumference can be found:

<img src="http://latex.codecogs.com/svg.latex?&space;&space;&space;E''&space;(X_{B'}&space;&plus;&space;r\cos(\angle&space;FBE&space;-&space;\frac{L_{AA'}}{r}),&space;Y_{B'}&space;&plus;&space;r\sin(\angle&space;FBE&space;-&space;\frac{L_{AA'}}{r}))" title="   E'' (X_{B'} + r\cos(\angle FBE - \frac{L_{AA'}}{r}), Y_{B'} + r\sin(\angle FBE - \frac{L_{AA'}}{r}))" />

### Position of the center of the circle

The gradient of the tangent at point A' where t = t<sub>2</sub> can be found by parametric differentiation:

<img src="http://latex.codecogs.com/svg.latex?&space;k&space;=&space;\frac{dy}{dx}&space;=&space;\frac{\frac{dy}{dt}}{\frac{dx}{dt}}&space;=\frac{g'(t)}{f'(t)}" title=" k = \frac{dy}{dx} = \frac{\frac{dy}{dt}}{\frac{dx}{dt}} =\frac{g'(t)}{f'(t)}" />

The gradient of the normal which passes through the center of the circle can then be found:

<img src="http://latex.codecogs.com/svg.latex?&space;n&space;=&space;-\frac{1}{k}&space;=&space;-\frac{f'(t)}{g'(t)}" title=" n = -\frac{1}{k} = -\frac{f'(t)}{g'(t)}" />

The coordinate of A' can be calculated by substituting t = t<sub>2</sub> into the parametric equation

<img src="http://latex.codecogs.com/svg.latex?&space;A'(f(t_2),\&space;g(t_2))" title=" A'(f(t_2),\ g(t_2))" />

Knowing the gradient of A'B', the coordinate of B' can be obtained using the coordinate of A':

<img src="http://latex.codecogs.com/svg.latex?\begin{array}{l}&space;\textup{let}\&space;\Delta&space;x=&space;\textup{sgn(n)}\&space;r&space;\cos(\arctan(n))&space;=&space;r\frac{\textup{sgn(n)}}{\sqrt{n^2&plus;1}}&space;\\\\&space;\Delta&space;y&space;=&space;n\Delta&space;x&space;\\\\&space;B'(f(t_2)&plus;\Delta&space;x,\&space;g(t_2)&plus;\Delta&space;y)&space;\end{array}" title="\begin{array}{l} \textup{let}\ \Delta x= \textup{sgn(n)}\ r \cos(\arctan(n)) = r\frac{\textup{sgn(n)}}{\sqrt{n^2+1}} \\\\ \Delta y = n\Delta x \\\\ B'(f(t_2)+\Delta x,\ g(t_2)+\Delta y) \end{array}" />

where sgn(n) is the sign of the gradient of the normal.

---

## Sign adjustment

By the above method of computation, the circle will always appear above the graph, which may cause weird "jumps" at the point where the gradient is undefined. Example:

<img src="http://latex.codecogs.com/svg.latex?&space;&space;\left\{&space;\begin{array}{lr}&space;x=&space;16\sin^3(t)&space;&&space;\\&space;y=&space;13\cos(t)&space;-&space;5\cos(2t)&space;-&space;2\cos(3t)&space;-&space;\cos(4t)&space;\end{array}&space;\right.&space;t\in(-\pi,\pi]" title="\left\{ \begin{array}{lr} x= 16\sin^3(t) & \\ y= 13\cos(t) - 5\cos(2t) - 2\cos(3t) - \cos(4t) \end{array} \right. t\in(-\pi,\pi]" />

<img src="doc/heart.svg" width="500px">

This problem could be resolved to some extent by adjusting the sign of &Delta;x, which could be achieved automatically in my JavaScript drawer (not available in Geogebra implementation though). There are two ways to do this, but one is experimental.

## Common adjustment required

It is found that regardless of the sign-changing method used, sign needs to always be adjust at vertical tangent. The value of t is calculated using [Newton's method](https://en.wikipedia.org/wiki/Newton%27s_method). 

<img src="http://latex.codecogs.com/svg.latex?\begin{array}{l}&space;\textup{vertical&space;tangent&space;at}\&space;t&space;=&space;t_{vt}\\\\&space;\left\{&space;\begin{array}{lr}&space;f'(t_{vt})\ne&space;0&space;&&space;\\&space;g'(t_{vt})=0&space;\end{array}&space;\right.\end{array}" title="\begin{array}{l} \textup{vertical tangent at}\ t = t_{vt}\\\\ \left\{ \begin{array}{lr} f'(t_{vt})\ne 0 & \\ g'(t_{vt})=0 \end{array} \right.\end{array}" />

## 1. Auto sign-changing by switching sides

I keep the roulette continuous by changing both the sign of &Delta;x at vertical cusp and changing the rotation direction of the circle at all cusps:

<img src="http://latex.codecogs.com/svg.latex?\begin{array}{l}&space;\textup{vertical&space;cusp&space;at}\&space;t&space;=&space;t_{vc}\\\\&space;\left\{&space;\begin{array}{lr}&space;f'(t_{vc})=0&space;&&space;\\&space;g'(t_{vc})=0&space;\\&space;\lim\limits_{t\to&space;t_{vc}^&plus;}\frac{g'(t)}{f'(t)}=\infty\&space;\textup{and}&space;\lim\limits_{t\to&space;t_{vc}^-}\frac{g'(t)}{f'(t)}=-\infty\&space;\textup{or}\&space;\lim\limits_{t\to&space;t_{vc}^&plus;}\frac{g'(t)}{f'(t)}=-\infty\&space;\textup{and}&space;\lim\limits_{t\to&space;t_{vc}^-}\frac{g'(t)}{f'(t)}=\infty\&space;\end{array}\right.&space;\end{array}" title="\begin{array}{l} \textup{vertical cusp at}\ t = t_{vc}\\\\ \left\{ \begin{array}{lr} f'(t_{vc})=0 & \\ g'(t_{vc})=0 \\ \lim\limits_{t\to t_{vc}^+}\frac{g'(t)}{f'(t)}=\infty\ \textup{and} \lim\limits_{t\to t_{vc}^-}\frac{g'(t)}{f'(t)}=-\infty\ \textup{or}\ \lim\limits_{t\to t_{vc}^+}\frac{g'(t)}{f'(t)}=-\infty\ \textup{and} \lim\limits_{t\to t_{vc}^-}\frac{g'(t)}{f'(t)}=\infty\ \end{array}\right. \end{array}" />

The effect is shown in the following table.

| Heart | Astroid |
| ---- | ---- |
|<img src="doc/heart.gif"> | <img src="doc/astroid.gif"> |
| config is available [here](doc/heart.json) |config is available [here](doc/astroid.json) |

Currently there's no way to perfectly deal with parametric curve with three cusps because the roulette will always be broken at one cusp.

<img src="doc/three-cusps.png" width="400px"/>

## 2. Revolving around cusps 

Some considered the first method to be unnatural as the roulette doesn't appear consistently inside or outside the parametric curve. Therefore, I came up with this method in order to correct that issue.

The roulette is kept consistently inside or outside the parametric curve by switching signs of &Delta;x at horizontal cusp rather than vertical cusp. The rotation direction of the circle is consistent throughout.

<img src="http://latex.codecogs.com/svg.latex?\begin{array}{l}&space;\textup{horizontal&space;cusp&space;at}\&space;t&space;=&space;t_{hc}\\\\&space;\left\{&space;\begin{array}{lr}&space;f'(t_{hc})=0&space;&&space;\\&space;g'(t_{hc})=0&space;\\&space;\frac{g'(t)}{f'(t)}\to0^&plus;\&space;\textup{as}\&space;t\to&space;t_{hc}^&plus;\&space;\textup{and}\&space;\frac{g'(t)}{f'(t)}\to&space;0^-\&space;\textup{as}\&space;t\to&space;t_{hc}^-\&space;\&space;\textup{or}\&space;\&space;\frac{g'(t)}{f'(t)}\to0^-\&space;\textup{as}\&space;t\to&space;t_{hc}^&plus;\&space;\textup{and}\&space;\frac{g'(t)}{f'(t)}\to&space;0^&plus;\&space;\textup{as}\&space;t\to&space;t_{hc}^-\&space;\end{array}&space;\right.&space;\end{array}" title="\begin{array}{l} \textup{horizontal cusp at}\ t = t_{hc}\\\\ \left\{ \begin{array}{lr} f'(t_{hc})=0 & \\ g'(t_{hc})=0 \\ \frac{g'(t)}{f'(t)}\to0^+\ \textup{as}\ t\to t_{hc}^+\ \textup{and}\ \frac{g'(t)}{f'(t)}\to 0^-\ \textup{as}\ t\to t_{hc}^-\ \ \textup{or}\ \ \frac{g'(t)}{f'(t)}\to0^-\ \textup{as}\ t\to t_{hc}^+\ \textup{and}\ \frac{g'(t)}{f'(t)}\to 0^+\ \textup{as}\ t\to t_{hc}^-\ \end{array} \right. \end{array}" />

Additionally, when a vertical or horizontal cusp is met, the circle will revolve around the cusp. The drawback of this method is that the path of revolution and the previous roulette may appear to be not contiguous. This is mainly caused by inaccuracies in floating point arithmetic. The effect of this method is shown below, in comparison with the previous method.

| Heart | Astroid |
| ---- | ---- |
|<img src="doc/heart-revolve.gif"> | <img src="doc/astroid-revolve.gif"> |
| config is available [here](doc/heart-revolve.json) |config is available [here](doc/astroid-revolve.json) |

However, the direction of rotation and the sign (whether the half-circle at the cusp should point upward or downward) depend on the original rotation direction, dy/dt, dx/dt and (maybe) some other unknown factors. Up to now, I am unable to find an algorithm that can correctly generate the path of revolution around the cusp for ALL CASES, so you may found the direction of revolution incorrect for some parametric curves. Additionally, current method does not consider oblique cusps, which can be seen in a previous picture.

I will add buttons for you to manually adjust the path of revolution around cusps later.