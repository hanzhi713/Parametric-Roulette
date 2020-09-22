# Mechanism

## Assumption

The rolling circle doesn't have a collision box. It will keep rolling even if there's an overlapping region:

<img src="doc/images/overlap.svg" width="400px">

## Computation

Suppose there is a circle with radius r is rolling on the parametric equation defined by

$$
\left\{ 
    \begin{array}{ll} 
        x= f(t)& \\ 
        y= g(t)& 
    \end{array} 
    \right. 
    a\leq t\leq b
$$

<img src="doc/images/demo.svg" width="780px">

### Calculation of the radians (angle) rotated:

Suppose this circle has its center located on $B$ and it touches the parametric curve at A when $t = t_1$. Point $E$ lies on its circumference. $B'$ corresponds to the center of the circle when $t = t_2$ and point E'' corresponds to the position of point $E$ after it has rotated θ radians.

The total length that this circle has rotated through, which is the length of the parametric curve between $A$ and $A'$ (the red curve in the above diagram), can be computed by the following definite integral (the arc length function)

$$L_{AA'} = \int_{t_1}^{t_2} \sqrt{[f'(t)]^2+[g'(t)]^2}\ dt$$

And the rotation angle $\theta$ in radians therefore is

$$\theta = 2\pi \frac{L_{AA'}}{2\pi r} = \frac{L_{AA'}}{r}$$

Since

$$\angle F'BE'' = \angle F'B'E' - \theta = \angle FBE - \theta = \angle FBE - \frac{L_{AA'}}{r}$$

The coordinates of that point on the circumference can be found:

$$ E'' \left(X_{B'} + r\cos \left(\angle FBE - \frac{L_{AA'}}{r}\right), Y_{B'} + r\sin\left(\angle FBE - \frac{L_{AA'}}{r}\right)\right) $$

### Position of the center of the circle

The gradient of the tangent at point $A'$ where $t = t_2$ can be found by parametric differentiation:

$$k = \frac{dy}{dx} = \frac{\frac{dy}{dt}}{\frac{dx}{dt}} =\frac{g'(t)}{f'(t)}$$

The gradient of the normal $\hat{n}$ which passes through the center of the circle can then be found:

$$\hat{n} = -\frac{1}{k} = -\frac{f'(t)}{g'(t)}$$

The coordinate of A' can be calculated by substituting $t = t_2$ into the parametric equation

$$A'(f(t_2),\ g(t_2))$$

Knowing the gradient of $A'B'$, the coordinate of $B'$ can be obtained using the coordinate of $A'$:

$$
\begin{array}{ll}
&\Delta x= \ r \cos(\arctan(\hat{n})) = \frac{r}{\sqrt{\hat{n}^2+1}} \\\\
&B'(f(t_2)+\Delta x,\ g(t_2) + \hat{n}\Delta x) 
\end{array}
$$

## Sign adjustment

By the above method of computation, the roulette will be broken at stationary points where the normal is vertical. For example,

$$
\left\{ \begin{array}{lr} x= 16\sin^3(t) & \\ y= 13\cos(t) - 5\cos(2t) - 2\cos(3t) - \cos(4t) \end{array} \right. t\in(-\pi,\pi]
$$

<br>

<img src="doc/images/heart.png" width="400px">

This problem could be resolved to some extent by adjusting the sign of $\Delta x$, which could be achieved automatically in my JavaScript drawer (not available in Geogebra implementation though). The sign adjustment methods are described below.

### Common adjustments required

It is found that regardless of the sign-changing method used, sign needs to always be adjusted at stationary points. At the point where the normal changes sign, the gradient must be either zero or infinity. We only want to adjust the sign the case where the gradient is zero. Hence, we should change the sign at $(f(t), g(t))$ iff

$$
\text{sgn}(\hat{n_{t^-}}) = - \text{sgn}(\hat{n_{t^+}}) \text{ and } 
|\hat{n_{t^-}} - \hat{n_{t^+}}| \le \epsilon
$$

where $\epsilon$ is some small number, $\hat{n_{t^-}}$ and $\hat{n_{t^+}}$ are the gradient of the normal at $t^-$ and $t^+$, respectively. Additionally, $t^- < t < t^+$, and for some any small $\delta$, $|t^- - t| = |t - t^+ | \le \delta$.

### 1. Auto sign-changing by switching sides

I keep the roulette continuous by changing both the sign of $\Delta x$ at vertical cusp and changing the rotation direction of the circle at all cusps. Cusps are the points where the curvature is infinity. I record the sequence of increasing curvatures which are above 50 and pick and maximum (and assume it is the cusp). The (unsigned) curvature formula is shown below.

$$
\kappa ={\frac {|x'y''-y'x''|}{\left({x'}^{2}+{y'}^{2}\right)^{\frac {3}{2}}}}.
$$

The effect is shown in the following table.

| Heart                                      | Astroid                                      |
| ------------------------------------------ | -------------------------------------------- |
| <img src="doc/images/heart.gif">                  | <img src="doc/images/astroid.gif">                  |
| config is available [here](doc/config/heart.json) | config is available [here](doc/config/astroid.json) |

Currently, this method cannot perfectly deal with parametric curve with odd number of cusps, because the roulette will always be broken at one cusp.

<img src="doc/images/three-cusps.png" width="300px"/>

### 2. Revolving around cusps 

Some considered the first method to be unnatural as the roulette doesn't appear consistently inside or outside the parametric curve. Therefore, I came up with this method in order to correct that issue.

The roulette is kept consistently inside or outside the parametric curve by switching signs of $\Delta x$ at all cusps except horizontal cusps. The rotation direction of the circle is consistent throughout. Additionally, when a cusp is met, the circle will revolve around the cusp. The effect of this method is shown below.

| Heart                                              | Astroid                                              |
| -------------------------------------------------- | ---------------------------------------------------- |
| <img src="doc/images/heart-revolve.gif">                  | <img src="doc/images/astroid-revolve.gif">                  |
| config is available [here](doc/config/heart-revolve.json) | config is available [here](doc/config/astroid-revolve.json) |

The drawback of this method is that the path of revolution and the previous roulette may appear to be not contiguous. This is mainly caused by inaccuracies in floating point arithmetic. Moreover, sometimes cusps may not be detected due to the numerical nature of my method. In such cases, try to decrease the drawing step so better numerical accuracy can be achieved.