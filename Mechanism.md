# Mechanism

## Assumption

The rolling circle doesn't have a collision box. It will keep rolling even if there's an overlapping region:

<img src="doc/overlap.svg" width="400px">

## Computation

Suppose there is a circle with radius r is rolling on the parametric equation defined by

<p align="center"><img alt="$$&#10;\left\{ &#10;    \begin{array}{ll} &#10;        x= f(t)&amp; \\ &#10;        y= g(t)&amp; &#10;    \end{array} &#10;    \right. &#10;    a\leq t\leq b&#10;$$" src="svgs/969eebf5e496548801fc745f116463ca.svg" align="middle" width="175.28445pt" height="39.45249pt"/></p>

<img src="doc/demo.svg" width="780px">

### Calculation of the radians (angle) rotated:

Suppose this circle has its center located on <img alt="$B$" src="svgs/61e84f854bc6258d4108d08d4c4a0852.svg" align="middle" width="13.293555000000003pt" height="22.46574pt"/> and it touches the parametric curve at A when <img alt="$t = t_1$" src="svgs/07ac0c0537c9dfc18c09c0b874c981cb.svg" align="middle" width="40.3425pt" height="20.222069999999988pt"/>. Point <img alt="$E$" src="svgs/84df98c65d88c6adf15d4645ffa25e47.svg" align="middle" width="13.082190000000004pt" height="22.46574pt"/> lies on its circumference. <img alt="$B'$" src="svgs/3b573ce6b242559dcd67e9ed6a52eb21.svg" align="middle" width="17.083440000000003pt" height="24.716340000000006pt"/> corresponds to the center of the circle when <img alt="$t = t_2$" src="svgs/242d79ffb2b66270f35ced2832780324.svg" align="middle" width="40.3425pt" height="20.222069999999988pt"/> and point E'' corresponds to the position of point <img alt="$E$" src="svgs/84df98c65d88c6adf15d4645ffa25e47.svg" align="middle" width="13.082190000000004pt" height="22.46574pt"/> after it has rotated θ radians.

The total length that this circle has rotated through, which is the length of the parametric curve between <img alt="$A$" src="svgs/53d147e7f3fe6e47ee05b88b166bd3f6.svg" align="middle" width="12.328800000000005pt" height="22.46574pt"/> and <img alt="$A'$" src="svgs/63049c301195311c277cd8d2b79e87ca.svg" align="middle" width="16.118850000000002pt" height="24.716340000000006pt"/> (the red curve in the above diagram), can be computed by the following definite integral (the arc length function)

<p align="center"><img alt="$$L_{AA'} = \int_{t_1}^{t_2} \sqrt{[f'(t)]^2+[g'(t)]^2}\ dt$$" src="svgs/792cffcdb014eadd3db6fe688946ea38.svg" align="middle" width="243.95579999999998pt" height="42.009495pt"/></p>

And the rotation angle <img alt="$\theta$" src="svgs/27e556cf3caa0673ac49a8f0de3c73ca.svg" align="middle" width="8.173588500000005pt" height="22.831379999999992pt"/> in radians therefore is

<p align="center"><img alt="$$\theta = 2\pi \frac{L_{AA'}}{2\pi r} = \frac{L_{AA'}}{r}$$" src="svgs/1e84d915b21cdef4fc701e39b9d3b79f.svg" align="middle" width="148.560555pt" height="33.629475pt"/></p>

Since

<p align="center"><img alt="$$\angle F'BE'' = \angle F'B'E' - \theta = \angle FBE - \theta = \angle FBE - \frac{L_{AA'}}{r}$$" src="svgs/39b86e8f698a60f45d6cbcc1598123aa.svg" align="middle" width="411.83009999999996pt" height="33.629475pt"/></p>

The coordinates of that point on the circumference can be found:

<p align="center"><img alt="$$ E'' \left(X_{B'} + r\cos \left(\angle FBE - \frac{L_{AA'}}{r}\right), Y_{B'} + r\sin\left(\angle FBE - \frac{L_{AA'}}{r}\right)\right) $$" src="svgs/81ed27af969f10cc5aece4e97a8c8b15.svg" align="middle" width="493.36485pt" height="39.45249pt"/></p>

### Position of the center of the circle

The gradient of the tangent at point <img alt="$A'$" src="svgs/63049c301195311c277cd8d2b79e87ca.svg" align="middle" width="16.118850000000002pt" height="24.716340000000006pt"/> where <img alt="$t = t_2$" src="svgs/242d79ffb2b66270f35ced2832780324.svg" align="middle" width="40.3425pt" height="20.222069999999988pt"/> can be found by parametric differentiation:

<p align="center"><img alt="$$k = \frac{dy}{dx} = \frac{\frac{dy}{dt}}{\frac{dx}{dt}} =\frac{g'(t)}{f'(t)}$$" src="svgs/9e3449905b9f1ad416d70ec901d0dd71.svg" align="middle" width="154.035585pt" height="45.726945pt"/></p>

The gradient of the normal <img alt="$\hat{n}$" src="svgs/585233ff6565a00eca5e333af3026047.svg" align="middle" width="9.867000000000003pt" height="22.831379999999992pt"/> which passes through the center of the circle can then be found:

<p align="center"><img alt="$$\hat{n} = -\frac{1}{k} = -\frac{f'(t)}{g'(t)}$$" src="svgs/1aef4e9d771c5c11aa0c63d0e691213d.svg" align="middle" width="127.41695999999999pt" height="38.864264999999996pt"/></p>

The coordinate of A' can be calculated by substituting <img alt="$t = t_2$" src="svgs/242d79ffb2b66270f35ced2832780324.svg" align="middle" width="40.3425pt" height="20.222069999999988pt"/> into the parametric equation

<p align="center"><img alt="$$A'(f(t_2),\ g(t_2))$$" src="svgs/95a8ecbc2fca8932bf2e19f0dc2c6a74.svg" align="middle" width="112.95124499999999pt" height="17.289525pt"/></p>

Knowing the gradient of <img alt="$A'B'$" src="svgs/8f99074256828640ef742071375091bf.svg" align="middle" width="34.024155pt" height="24.716340000000006pt"/>, the coordinate of <img alt="$B'$" src="svgs/3b573ce6b242559dcd67e9ed6a52eb21.svg" align="middle" width="17.083440000000003pt" height="24.716340000000006pt"/> can be obtained using the coordinate of <img alt="$A'$" src="svgs/63049c301195311c277cd8d2b79e87ca.svg" align="middle" width="16.118850000000002pt" height="24.716340000000006pt"/>:

<p align="center"><img alt="$$&#10;\begin{array}{ll}&#10;&amp;\Delta x= \ r \cos(\arctan(\hat{n})) = \frac{r}{\sqrt{\hat{n}^2+1}} \\\\&#10;&amp;B'(f(t_2)+\Delta x,\ g(t_2) + \hat{n}\Delta x) &#10;\end{array}&#10;$$" src="svgs/ed69ef7e3960f2fd8846843064f9f2d8.svg" align="middle" width="230.13375pt" height="58.9149pt"/></p>

## Sign adjustment

By the above method of computation, the roulette will be broken at stationary points where the normal is vertical. For example,

<p align="center"><img alt="$$&#10;\left\{ \begin{array}{lr} x= 16\sin^3(t) &amp; \\ y= 13\cos(t) - 5\cos(2t) - 2\cos(3t) - \cos(4t) \end{array} \right. t\in(-\pi,\pi]&#10;$$" src="svgs/e5f59d37609c9b6732b34485c49f825f.svg" align="middle" width="446.43224999999995pt" height="39.71319pt"/></p>

<br>

<img src="doc/heart.png" width="400px">

This problem could be resolved to some extent by adjusting the sign of <img alt="$\Delta x$" src="svgs/3919bbc84b8079e27194efe99a1f6a80.svg" align="middle" width="23.09373pt" height="22.46574pt"/>, which could be achieved automatically in my JavaScript drawer (not available in Geogebra implementation though). The sign adjustment methods are described below.

### Common adjustment required

It is found that regardless of the sign-changing method used, sign needs to always be adjusted at stationary points. One can see that at the point where the normal changes sign, the gradient must be either zero or infinity. We only want to adjust the sign the case where the gradient is zero. Therefore, we changed the sign at <img alt="$(x(t), y(t))$" src="svgs/9fbe43fbcb89520ba4025e55a5ce7a2e.svg" align="middle" width="75.57857999999999pt" height="24.65759999999998pt"/> iff

<p align="center"><img alt="$$&#10;\text{sgn}(\hat{n_{t^-}}) = - \text{sgn}(\hat{n_{t^+}}) \text{ and } &#10;|\hat{n_{t^-}} - \hat{n_{t^+}}| \le \epsilon&#10;$$" src="svgs/54d87def0fef5708d309e292fcee5c0e.svg" align="middle" width="303.8112pt" height="16.438356pt"/></p>

where <img alt="$\hat{n_{t^-}}$" src="svgs/86658f47f487f0023e50149906c0e1d4.svg" align="middle" width="23.736900000000002pt" height="22.831379999999992pt"/> is the gradient of the normal at <img alt="$t^-$" src="svgs/9bf9252ccb5fb8814379d38eae960418.svg" align="middle" width="16.21026pt" height="26.177579999999978pt"/>, <img alt="$\hat{n_{t^+}}$" src="svgs/a5836f91021c93a484c4f6b2b0a6613b.svg" align="middle" width="23.280345pt" height="22.831379999999992pt"/> is the gradient of the normal at <img alt="$t^+$" src="svgs/7e94ba42f89d8bcbab69742be5a10f69.svg" align="middle" width="16.027605000000005pt" height="26.177579999999978pt"/>, <img alt="$t^- &lt; t &lt; t^+$" src="svgs/5bbc1b1bfaa1f01c0c4cdfefb01ec8f1.svg" align="middle" width="82.830825pt" height="26.177579999999978pt"/>, and for some any small <img alt="$\epsilon, \delta$" src="svgs/53b1075e90e35778d668349fa892f611.svg" align="middle" width="21.906390000000002pt" height="22.831379999999992pt"/>, 
<img alt="$|t^- - t| = |t - t^+ | \le \delta$" src="svgs/1057f56cd2e4757183a9f0c40a2f41b6.svg" align="middle" width="155.96426999999997pt" height="26.177579999999978pt"/>.

### 1. Auto sign-changing by switching sides

I keep the roulette continuous by changing both the sign of <img alt="$\Delta x$" src="svgs/3919bbc84b8079e27194efe99a1f6a80.svg" align="middle" width="23.09373pt" height="22.46574pt"/> at vertical cusp and changing the rotation direction of the circle at all cusps. Cusps are the points where the curvature is infinity. I record the sequence of increasing curvatures which are above 50 and pick and maximum (and assume it is the cusp). The (unsigned) curvature formula is shown below.

<p align="center"><img alt="$$&#10;\kappa ={\frac {|x'y''-y'x''|}{\left({x'}^{2}+{y'}^{2}\right)^{\frac {3}{2}}}}.&#10;$$" src="svgs/62da3a2f3332300c34eef2c86ff5f55a.svg" align="middle" width="131.239515pt" height="47.56752pt"/></p>

The effect is shown in the following table.

| Heart                                      | Astroid                                      |
| ------------------------------------------ | -------------------------------------------- |
| <img src="doc/heart.gif">                  | <img src="doc/astroid.gif">                  |
| config is available [here](doc/heart.json) | config is available [here](doc/astroid.json) |

Currently there's no way to perfectly deal with parametric curve with three cusps because the roulette will always be broken at one cusp.

<img src="doc/three-cusps.png" width="300px"/>

### 2. Revolving around cusps 

Some considered the first method to be unnatural as the roulette doesn't appear consistently inside or outside the parametric curve. Therefore, I came up with this method in order to correct that issue.

The roulette is kept consistently inside or outside the parametric curve by switching signs of <img alt="$\Delta x$" src="svgs/3919bbc84b8079e27194efe99a1f6a80.svg" align="middle" width="23.09373pt" height="22.46574pt"/> at all cusps except horizontal cusps. The rotation direction of the circle is consistent throughout.

Additionally, a cusp is met, the circle will revolve around the cusp. The drawback of this method is that the path of revolution and the previous roulette may appear to be not contiguous. This is mainly caused by inaccuracies in floating point arithmetic. The effect of this method is shown below.

| Heart                                              | Astroid                                              |
| -------------------------------------------------- | ---------------------------------------------------- |
| <img src="doc/heart-revolve.gif">                  | <img src="doc/astroid-revolve.gif">                  |
| config is available [here](doc/heart-revolve.json) | config is available [here](doc/astroid-revolve.json) |

Sometimes cusps may not be detected due to the numerical nature of my method. In such cases, try to decrease the drawing step so better numerical accuracy can be achieved.