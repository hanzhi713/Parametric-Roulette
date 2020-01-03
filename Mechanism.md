# Mechanism

## Assumption

The rolling circle doesn't have a collision box. It will keep rolling even if there's an overlapping region:

<img src="doc/overlap.svg" width="400px">

## Computation

Suppose there is a circle with radius r is rolling on the parametric equation defined by

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/969eebf5e496548801fc745f116463ca.svg?invert_in_darkmode" align=middle width=175.28445pt height=39.45249pt/></p>

<img src="doc/demo.svg" width="780px">

### Calculation of the radians (angle) rotated:

Suppose this circle has its center located on <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/61e84f854bc6258d4108d08d4c4a0852.svg?invert_in_darkmode" align=middle width=13.293555000000003pt height=22.46574pt/> and it touches the parametric curve at A when <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/07ac0c0537c9dfc18c09c0b874c981cb.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/>. Point <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/84df98c65d88c6adf15d4645ffa25e47.svg?invert_in_darkmode" align=middle width=13.082190000000004pt height=22.46574pt/> lies on its circumference. <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/3b573ce6b242559dcd67e9ed6a52eb21.svg?invert_in_darkmode" align=middle width=17.083440000000003pt height=24.716340000000006pt/> corresponds to the center of the circle when <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/242d79ffb2b66270f35ced2832780324.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/> and point E'' corresponds to the position of point <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/84df98c65d88c6adf15d4645ffa25e47.svg?invert_in_darkmode" align=middle width=13.082190000000004pt height=22.46574pt/> after it has rotated θ radians.

The total length that this circle has rotated through, which is the length of the parametric curve between <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/53d147e7f3fe6e47ee05b88b166bd3f6.svg?invert_in_darkmode" align=middle width=12.328800000000005pt height=22.46574pt/> and <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/63049c301195311c277cd8d2b79e87ca.svg?invert_in_darkmode" align=middle width=16.118850000000002pt height=24.716340000000006pt/> (the red curve in the above diagram), can be computed by the following definite integral (the arc length function)

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/792cffcdb014eadd3db6fe688946ea38.svg?invert_in_darkmode" align=middle width=243.95579999999998pt height=42.009495pt/></p>

And the rotation angle <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/27e556cf3caa0673ac49a8f0de3c73ca.svg?invert_in_darkmode" align=middle width=8.173588500000005pt height=22.831379999999992pt/> in radians therefore is

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/1e84d915b21cdef4fc701e39b9d3b79f.svg?invert_in_darkmode" align=middle width=148.560555pt height=33.629475pt/></p>

Since

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/39b86e8f698a60f45d6cbcc1598123aa.svg?invert_in_darkmode" align=middle width=411.83009999999996pt height=33.629475pt/></p>

The coordinates of that point on the circumference can be found:

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/81ed27af969f10cc5aece4e97a8c8b15.svg?invert_in_darkmode" align=middle width=493.36485pt height=39.45249pt/></p>

### Position of the center of the circle

The gradient of the tangent at point <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/63049c301195311c277cd8d2b79e87ca.svg?invert_in_darkmode" align=middle width=16.118850000000002pt height=24.716340000000006pt/> where <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/242d79ffb2b66270f35ced2832780324.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/> can be found by parametric differentiation:

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/9e3449905b9f1ad416d70ec901d0dd71.svg?invert_in_darkmode" align=middle width=154.035585pt height=45.726945pt/></p>

The gradient of the normal <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/585233ff6565a00eca5e333af3026047.svg?invert_in_darkmode" align=middle width=9.867000000000003pt height=22.831379999999992pt/> which passes through the center of the circle can then be found:

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/1aef4e9d771c5c11aa0c63d0e691213d.svg?invert_in_darkmode" align=middle width=127.41695999999999pt height=38.864264999999996pt/></p>

The coordinate of A' can be calculated by substituting <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/242d79ffb2b66270f35ced2832780324.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/> into the parametric equation

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/95a8ecbc2fca8932bf2e19f0dc2c6a74.svg?invert_in_darkmode" align=middle width=112.95124499999999pt height=17.289525pt/></p>

Knowing the gradient of <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/8f99074256828640ef742071375091bf.svg?invert_in_darkmode" align=middle width=34.024155pt height=24.716340000000006pt/>, the coordinate of <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/3b573ce6b242559dcd67e9ed6a52eb21.svg?invert_in_darkmode" align=middle width=17.083440000000003pt height=24.716340000000006pt/> can be obtained using the coordinate of <img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/63049c301195311c277cd8d2b79e87ca.svg?invert_in_darkmode" align=middle width=16.118850000000002pt height=24.716340000000006pt/>:

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/ed69ef7e3960f2fd8846843064f9f2d8.svg?invert_in_darkmode" align=middle width=230.13375pt height=58.9149pt/></p>

---

## Sign adjustment

By the above method of computation, the roulette will be broken at stationary points where the normal is vertical. For example,

<p align="center"><img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/e5f59d37609c9b6732b34485c49f825f.svg?invert_in_darkmode" align=middle width=446.43224999999995pt height=39.71319pt/></p>

<br>

<img src="doc/heart.png" width="400px">

This problem could be resolved to some extent by adjusting the sign of &Delta;x, which could be achieved automatically in my JavaScript drawer (not available in Geogebra implementation though). There are two ways to do this.

## Common adjustment required

It is found that regardless of the sign-changing method used, sign needs to always be adjusted at stationary points. One can see that at the point where the normal changes sign, the gradient must be either zero or infinity. We only want the case 


<img src="https://rawgit.com/hanzhi713/Parametric-Roulette (fetch/refactor/svgs/b7651dd91993206cef76defcd3f18964.svg?invert_in_darkmode" align=middle width=184.14561pt height=82.33829999999998pt/>


## 1. Auto sign-changing by switching sides

I keep the roulette continuous by changing both the sign of &Delta;x at vertical cusp and changing the rotation direction of the circle at all cusps:


The effect is shown in the following table.

| Heart                                      | Astroid                                      |
| ------------------------------------------ | -------------------------------------------- |
| <img src="doc/heart.gif">                  | <img src="doc/astroid.gif">                  |
| config is available [here](doc/heart.json) | config is available [here](doc/astroid.json) |

Currently there's no way to perfectly deal with parametric curve with three cusps because the roulette will always be broken at one cusp.

<img src="doc/three-cusps.png" width="400px"/>

## 2. Revolving around cusps 

Some considered the first method to be unnatural as the roulette doesn't appear consistently inside or outside the parametric curve. Therefore, I came up with this method in order to correct that issue.

The roulette is kept consistently inside or outside the parametric curve by switching signs of &Delta;x at horizontal cusp rather than vertical cusp. The rotation direction of the circle is consistent throughout.


Additionally, when a vertical or horizontal cusp is met, the circle will revolve around the cusp. The drawback of this method is that the path of revolution and the previous roulette may appear to be not contiguous. This is mainly caused by inaccuracies in floating point arithmetic. The effect of this method is shown below, in comparison with the previous method.

| Heart                                              | Astroid                                              |
| -------------------------------------------------- | ---------------------------------------------------- |
| <img src="doc/heart-revolve.gif">                  | <img src="doc/astroid-revolve.gif">                  |
| config is available [here](doc/heart-revolve.json) | config is available [here](doc/astroid-revolve.json) |

However, the direction of rotation and the sign (whether the half-circle at the cusp should point upward or downward) depend on the original rotation direction, dy/dt, dx/dt and (maybe) some other unknown factors. Up to now, I am unable to find an algorithm that can correctly generate the path of revolution around the cusp for ALL CASES, so you may found the direction of revolution incorrect for some parametric curves. Moreover, current method does not consider oblique cusps, which can be seen in a previous picture.

I will add buttons for you to manually adjust the path of revolution around cusps later.