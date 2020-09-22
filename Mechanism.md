# Mechanism

## Assumption

The rolling circle doesn't have a collision box. It will keep rolling even if there's an overlapping region:

<img src="doc/images/overlap.svg" width="400px">

## Computation

Suppose there is a circle with radius r is rolling on the parametric equation defined by

<p align="center"><img src="svgs/969eebf5e496548801fc745f116463ca.svg?invert_in_darkmode" align=middle width=175.28445pt height=39.45249pt/></p>

<img src="doc/images/demo.svg" width="780px">

### Calculation of the radians (angle) rotated:

Suppose this circle has its center located on <img src="svgs/61e84f854bc6258d4108d08d4c4a0852.svg?invert_in_darkmode" align=middle width=13.293555000000003pt height=22.46574pt/> and it touches the parametric curve at A when <img src="svgs/07ac0c0537c9dfc18c09c0b874c981cb.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/>. Point <img src="svgs/84df98c65d88c6adf15d4645ffa25e47.svg?invert_in_darkmode" align=middle width=13.082190000000004pt height=22.46574pt/> lies on its circumference. <img src="svgs/3b573ce6b242559dcd67e9ed6a52eb21.svg?invert_in_darkmode" align=middle width=17.083440000000003pt height=24.716340000000006pt/> corresponds to the center of the circle when <img src="svgs/242d79ffb2b66270f35ced2832780324.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/> and point E'' corresponds to the position of point <img src="svgs/84df98c65d88c6adf15d4645ffa25e47.svg?invert_in_darkmode" align=middle width=13.082190000000004pt height=22.46574pt/> after it has rotated θ radians.

The total length that this circle has rotated through, which is the length of the parametric curve between <img src="svgs/53d147e7f3fe6e47ee05b88b166bd3f6.svg?invert_in_darkmode" align=middle width=12.328800000000005pt height=22.46574pt/> and <img src="svgs/63049c301195311c277cd8d2b79e87ca.svg?invert_in_darkmode" align=middle width=16.118850000000002pt height=24.716340000000006pt/> (the red curve in the above diagram), can be computed by the following definite integral (the arc length function)

<p align="center"><img src="svgs/792cffcdb014eadd3db6fe688946ea38.svg?invert_in_darkmode" align=middle width=243.95579999999998pt height=42.009495pt/></p>

And the rotation angle <img src="svgs/27e556cf3caa0673ac49a8f0de3c73ca.svg?invert_in_darkmode" align=middle width=8.173588500000005pt height=22.831379999999992pt/> in radians therefore is

<p align="center"><img src="svgs/1e84d915b21cdef4fc701e39b9d3b79f.svg?invert_in_darkmode" align=middle width=148.560555pt height=33.629475pt/></p>

Since

<p align="center"><img src="svgs/39b86e8f698a60f45d6cbcc1598123aa.svg?invert_in_darkmode" align=middle width=411.83009999999996pt height=33.629475pt/></p>

The coordinates of that point on the circumference can be found:

<p align="center"><img src="svgs/81ed27af969f10cc5aece4e97a8c8b15.svg?invert_in_darkmode" align=middle width=493.36485pt height=39.45249pt/></p>

### Position of the center of the circle

The gradient of the tangent at point <img src="svgs/63049c301195311c277cd8d2b79e87ca.svg?invert_in_darkmode" align=middle width=16.118850000000002pt height=24.716340000000006pt/> where <img src="svgs/242d79ffb2b66270f35ced2832780324.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/> can be found by parametric differentiation:

<p align="center"><img src="svgs/9e3449905b9f1ad416d70ec901d0dd71.svg?invert_in_darkmode" align=middle width=154.035585pt height=45.726945pt/></p>

The gradient of the normal <img src="svgs/585233ff6565a00eca5e333af3026047.svg?invert_in_darkmode" align=middle width=9.867000000000003pt height=22.831379999999992pt/> which passes through the center of the circle can then be found:

<p align="center"><img src="svgs/1aef4e9d771c5c11aa0c63d0e691213d.svg?invert_in_darkmode" align=middle width=127.41695999999999pt height=38.864264999999996pt/></p>

The coordinate of A' can be calculated by substituting <img src="svgs/242d79ffb2b66270f35ced2832780324.svg?invert_in_darkmode" align=middle width=40.3425pt height=20.222069999999988pt/> into the parametric equation

<p align="center"><img src="svgs/95a8ecbc2fca8932bf2e19f0dc2c6a74.svg?invert_in_darkmode" align=middle width=112.95124499999999pt height=17.289525pt/></p>

Knowing the gradient of <img src="svgs/8f99074256828640ef742071375091bf.svg?invert_in_darkmode" align=middle width=34.024155pt height=24.716340000000006pt/>, the coordinate of <img src="svgs/3b573ce6b242559dcd67e9ed6a52eb21.svg?invert_in_darkmode" align=middle width=17.083440000000003pt height=24.716340000000006pt/> can be obtained using the coordinate of <img src="svgs/63049c301195311c277cd8d2b79e87ca.svg?invert_in_darkmode" align=middle width=16.118850000000002pt height=24.716340000000006pt/>:

<p align="center"><img src="svgs/ed69ef7e3960f2fd8846843064f9f2d8.svg?invert_in_darkmode" align=middle width=230.13375pt height=58.9149pt/></p>

## Sign adjustment

By the above method of computation, the roulette will be broken at stationary points where the normal is vertical. For example,

<p align="center"><img src="svgs/e5f59d37609c9b6732b34485c49f825f.svg?invert_in_darkmode" align=middle width=446.43224999999995pt height=39.71319pt/></p>

<br>

<img src="doc/images/heart.png" width="400px">

This problem could be resolved to some extent by adjusting the sign of <img src="svgs/3919bbc84b8079e27194efe99a1f6a80.svg?invert_in_darkmode" align=middle width=23.09373pt height=22.46574pt/>, which could be achieved automatically in my JavaScript drawer (not available in Geogebra implementation though). The sign adjustment methods are described below.

### Common adjustments required

It is found that regardless of the sign-changing method used, sign needs to always be adjusted at stationary points. At the point where the normal changes sign, the gradient must be either zero or infinity. We only want to adjust the sign the case where the gradient is zero. Hence, we should change the sign at <img src="svgs/27732120cfc70a4ee8e7da6c168b3260.svg?invert_in_darkmode" align=middle width=75.78219pt height=24.65759999999998pt/> iff

<p align="center"><img src="svgs/54d87def0fef5708d309e292fcee5c0e.svg?invert_in_darkmode" align=middle width=303.8112pt height=16.438356pt/></p>

where <img src="svgs/7ccca27b5ccc533a2dd72dc6fa28ed84.svg?invert_in_darkmode" align=middle width=6.672451500000003pt height=14.155350000000013pt/> is some small number, <img src="svgs/86658f47f487f0023e50149906c0e1d4.svg?invert_in_darkmode" align=middle width=23.736900000000002pt height=22.831379999999992pt/> and <img src="svgs/a5836f91021c93a484c4f6b2b0a6613b.svg?invert_in_darkmode" align=middle width=23.280345pt height=22.831379999999992pt/> are the gradient of the normal at <img src="svgs/9bf9252ccb5fb8814379d38eae960418.svg?invert_in_darkmode" align=middle width=16.21026pt height=26.177579999999978pt/> and <img src="svgs/7e94ba42f89d8bcbab69742be5a10f69.svg?invert_in_darkmode" align=middle width=16.027605000000005pt height=26.177579999999978pt/>, respectively. Additionally, <img src="svgs/5bbc1b1bfaa1f01c0c4cdfefb01ec8f1.svg?invert_in_darkmode" align=middle width=82.830825pt height=26.177579999999978pt/>, and for some any small <img src="svgs/38f1e2a089e53d5c990a82f284948953.svg?invert_in_darkmode" align=middle width=7.928134500000003pt height=22.831379999999992pt/>, <img src="svgs/1057f56cd2e4757183a9f0c40a2f41b6.svg?invert_in_darkmode" align=middle width=155.96426999999997pt height=26.177579999999978pt/>.

### 1. Auto sign-changing by switching sides

I keep the roulette continuous by changing both the sign of <img src="svgs/3919bbc84b8079e27194efe99a1f6a80.svg?invert_in_darkmode" align=middle width=23.09373pt height=22.46574pt/> at vertical cusp and changing the rotation direction of the circle at all cusps. Cusps are the points where the curvature is infinity. I record the sequence of increasing curvatures which are above 50 and pick and maximum (and assume it is the cusp). The (unsigned) curvature formula is shown below.

<p align="center"><img src="svgs/62da3a2f3332300c34eef2c86ff5f55a.svg?invert_in_darkmode" align=middle width=131.239515pt height=47.56752pt/></p>

The effect is shown in the following table.

| Heart                                      | Astroid                                      |
| ------------------------------------------ | -------------------------------------------- |
| <img src="doc/images/heart.gif">                  | <img src="doc/images/astroid.gif">                  |
| config is available [here](doc/configs/heart.json) | config is available [here](doc/configs/astroid.json) |

Currently, this method cannot perfectly deal with parametric curve with odd number of cusps, because the roulette will always be broken at one cusp.

<img src="doc/images/three-cusps.png" width="300px"/>

### 2. Revolving around cusps 

Some considered the first method to be unnatural as the roulette doesn't appear consistently inside or outside the parametric curve. Therefore, I came up with this method in order to correct that issue.

The roulette is kept consistently inside or outside the parametric curve by switching signs of <img src="svgs/3919bbc84b8079e27194efe99a1f6a80.svg?invert_in_darkmode" align=middle width=23.09373pt height=22.46574pt/> at all cusps except horizontal cusps. The rotation direction of the circle is consistent throughout. Additionally, when a cusp is met, the circle will revolve around the cusp. The effect of this method is shown below.

| Heart                                              | Astroid                                              |
| -------------------------------------------------- | ---------------------------------------------------- |
| <img src="doc/images/heart-revolve.gif">                  | <img src="doc/images/astroid-revolve.gif">                  |
| config is available [here](doc/configs/heart-revolve.json) | config is available [here](doc/configs/astroid-revolve.json) |

The drawback of this method is that the path of revolution and the previous roulette may appear to be not contiguous. This is mainly caused by inaccuracies in floating point arithmetic. Moreover, sometimes cusps may not be detected due to the numerical nature of my method. In such cases, try to decrease the drawing step so better numerical accuracy can be achieved.