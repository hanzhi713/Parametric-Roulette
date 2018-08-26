if (typeof (Math.sign) !== "function") {
    Math.sign = function (x) {
        return x === 0 ? 0 : x > 0 ? 1 : -1;
    };
}

var topCanvas = document.getElementById('canvas-top');
var bottomCanvas = document.getElementById('canvas-bottom');
var funcCanvas = document.getElementById('canvas-func');
var tempCanvas = document.getElementById('canvas-temp');
var xParam = document.getElementById('x=');
var yParam = document.getElementById('y=');
var t1Param = document.getElementById('t1');
var t2Param = document.getElementById('t2');
var dxParam = document.getElementById('dx');
var dyParam = document.getElementById('dy');
var scaleParam = document.getElementById('scale');
var circleParam = document.getElementById('circleRadius');
var clearBeforeDrawingCheck = document.getElementById('clearBeforeDrawing');
var drawingStepParam = document.getElementById('step');
var drawingDelayParam = document.getElementById('delay');
var skeletonCheck = document.getElementById('showSk');
var functionCheck = document.getElementById('showFunc');
var revolve = document.getElementById('revolve');

var radiusMultipleParam = document.getElementById('radiusMultiple');

var dotSizeMinParam = document.getElementById('dotSizeMin');
var dotSizeMaxParam = document.getElementById('dotSizeMax');
var dotRatioMinParam = document.getElementById('dotRatioMin');
var dotRatioMaxParam = document.getElementById('dotRatioMax');
var dotRotMinParam = document.getElementById('dotRotMin');
var dotRotMaxParam = document.getElementById('dotRotMax');

var mDotSize = document.getElementById('m-dotSize');
var mDotColor = document.getElementById('m-dotColor');
var mDotRatio = document.getElementById('m-dotRatio');
var mDotRot = document.getElementById('m-dotRot');
var mDotID = document.getElementById('m-dotID');

var gifSizeParam = document.getElementById('f-size');
var gifIntervalParam = document.getElementById('f-interval');
var gifCropCheck = document.getElementById('f-crop');
var gifTransparentCheck = document.getElementById('f-transparent');
var gifBgColorParam = document.getElementById('f-bgcolor');
var gifFrameDelayParam = document.getElementById('f-delay');
var gifQualityParam = document.getElementById('f-quality');
var gifLastFrameDelayParam = document.getElementById('f-lastdelay');

var pngWidthParam = document.getElementById('p-width');
var pngCropCheck = document.getElementById('p-crop');
var pngTransparentCheck = document.getElementById('p-transparent');
var pngBgColorParam = document.getElementById('p-bgcolor');

var dots = {};
var flag = {stop: false};
var currentJobs = [];

var locArray = [];
var cutPoints = [];
var cuspPoints = [];

window.onload = function (ev) {
    parseConfigJSON(localStorage.getItem('cache'));

    window.onchange = function (e) {
        saveConfigToBrowser();
    };

    // parameters that determine the loci. Recalculation of loci is required if they're changed
    var effectors = [dxParam, dyParam, scaleParam, circleParam, drawingStepParam];
    for (var i in effectors) {
        (function (i, existingOnchangeHandler) {
            effectors[i].onchange = function (e) {
                if (typeof existingOnchangeHandler === 'function')
                    existingOnchangeHandler(e);
                stopDrawing();
                disableDrawing();
                locArray = [];
            };
        })(i, effectors[i].onchange);
    }

    // changing these things also requires a reset of cut points
    effectors = [xParam, yParam, t1Param, t2Param];
    for (i in effectors) {
        (function (i, existingOnchangeHandler) {
            effectors[i].onchange = function (e) {
                if (typeof existingOnchangeHandler === 'function')
                    existingOnchangeHandler(e);
                stopDrawing();
                disableDrawing();
                locArray = [];
                cutPoints = [];
                cuspPoints = [];
                document.getElementById('sign-adjust').innerHTML = '';
                document.getElementById('rot-adjust').innerHTML = '';
            };
        })(i, effectors[i].onchange);
    }
    $('[data-toggle="tooltip"]').tooltip();
};

function disableDrawing() {
    document.getElementById('draw').disabled = true;
    var m = document.getElementById('savepng'), n = document.getElementById('savegif');
    m.className = 'dropdown-item disabled';
    n.className = 'dropdown-item disabled';
    m.style.color = '#6c757d';
    n.style.color = '#6c757d';
    m.setAttribute('data-target', '#');
    n.setAttribute('data-target', '#');
}

function enableDrawing() {
    document.getElementById('draw').disabled = false;
    var m = document.getElementById('savepng'), n = document.getElementById('savegif');
    m.className = 'dropdown-item';
    n.className = 'dropdown-item';
    m.style.color = '#000';
    n.style.color = '#000';
    m.setAttribute('data-target', '#PNGModalCenter');
    n.setAttribute('data-target', '#GIFModalCenter');
}

function removeDot(id) {
    delete dots[id];
    $('#' + id).hide(200, function () {
        $('#' + id).remove();
    });
    saveConfigToBrowser();
}

function removeAllDots() {
    for (var id in dots) {
        $('#' + id).remove();
    }
    dots = {};
}

function addDot() {
    var dotSize = +$('#dotSize').val();
    var dotColor = $('#dotColor').val();
    var dotRatio = +$('#dotRatio').val();
    var dotRot = +$('#dotRotOffset').val();

    addDotHelper((new Date()).valueOf().toString(), dotSize, dotColor, dotRatio, dotRot, true);
}

/**
 * return a random integer in [min, max]
 * @param {Number} min
 * @param {Number} max
 * @return Number
 * */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomColor() {
    var R = randInt(0, 255);
    R = R < 16 ? '0' + R.toString(16) : R.toString(16);
    var G = randInt(0, 255);
    G = G < 16 ? '0' + G.toString(16) : G.toString(16);
    var B = randInt(0, 255);
    B = B < 16 ? '0' + B.toString(16) : B.toString(16);
    return '#' + R + G + B;
}

function randomDot() {
    var dotSize = randInt(+dotSizeMinParam.value, +dotSizeMaxParam.value);
    var dotColor = randomColor();
    var dotRatio = randInt(+dotRatioMinParam.value, +dotRatioMaxParam.value);
    var dotRot = randInt(+dotRotMinParam.value, +dotRotMaxParam.value);
    addDotHelper((new Date()).valueOf().toString(), dotSize, dotColor, dotRatio, dotRot, true);
}

function addDotHelper(currentTime, dotSize, dotColor, dotRatio, dotRot, save) {
    dots[currentTime] = new Dot(dotSize, dotColor, dotRatio, dotRot);
    $('#settings').append("<tr id=\"" + currentTime + "\">" +
        "                    <td onclick='preModify(this)' data-toggle=\"modal\" data-target=\"#DotModalCenter\">Ratio: " + dotRatio + "%&nbsp;&nbsp;Color:" +
        "                        <span style=\"width: 15px; height: 15px; background-color: " + dotColor + ";display: inline-block\"></span><br/>" +
        "                        Size: " + dotSize + "&nbsp;&nbsp;Rotation: " + dotRot + "°" +
        "                    </td>" +
        "                    <th width='50px'>" +
        "                        <button type=\"button\" class=\"close\" aria-label=\"Close\" onclick=\"removeDot('" + currentTime + "')\">" +
        "                            <span aria-hidden=\"true\">&times;</span>" +
        "                        </button>" +
        "                    </th>" +
        "                </tr>"
    );
    if (save)
        saveConfigToBrowser();
}

function preModify(td) {
    var dot = dots[td.parentNode.id];
    mDotSize.value = dot.size;
    mDotColor.value = dot.color;
    mDotRatio.value = dot.ratio;
    mDotRot.value = Math.round(dot.rotOffset / Math.PI * 180);
    mDotID.value = td.parentNode.id;
}

function postModify() {
    var dot = dots[mDotID.value];
    var dotSize = +mDotSize.value;
    var dotColor = mDotColor.value;
    var dotRatio = +mDotRatio.value;
    var dotRot = +mDotRot.value;
    var tr = document.getElementById(mDotID.value);
    tr.cells[0].innerHTML = "Ratio: " + dotRatio + "%&nbsp;&nbsp;Color:" +
        "                        <span style=\"width: 15px; height: 15px; background-color: " + dotColor + ";display: inline-block\"></span><br/>" +
        "                        Size: " + dotSize + "&nbsp;&nbsp;Rotation: " + dotRot + "°";
    dot.size = dotSize;
    dot.color = dotColor;
    dot.ratio = dotRatio;
    dot.rotOffset = dotRot / 180 * Math.PI;
    saveConfigToBrowser();
}

function stopDrawing() {
    flag.stop = true;
    for (var i = 0; i < currentJobs.length; i++)
        clearTimeout(currentJobs[i]);
    currentJobs = [];
}

function adjustDotRatioCap(e) {
}

function saveConfigToBrowser() {
    localStorage.setItem('cache', getConfigJSON());
}

/**
 * @return String
 * */
function getConfigJSON() {
    var isLocValid = locArray.length > 0 && locArray[0].length >= 6;
    var cutPointSigns = new Array(cutPoints.length), cuspPointSigns = new Array(cuspPoints.length);
    if (isLocValid) {
        for (var i = 0; i < cutPoints.length; i++)
            cutPointSigns[i] = getSign(document.getElementById('c' + i))

        for (i = 0; i < cuspPoints.length; i++)
            cuspPointSigns[i] = getSign(document.getElementById('r' + i))
    }
    var config = {
        circleRadius: +circleParam.value,
        showSkeleton: skeletonCheck.checked,
        showFunction: functionCheck.checked,
        xParam: xParam.value,
        yParam: yParam.value,
        t1: +t1Param.value,
        t2: +t2Param.value,
        dx: +dxParam.value,
        dy: +dyParam.value,
        scale: +scaleParam.value,
        clearBeforeDrawing: clearBeforeDrawingCheck.checked,
        drawingStep: +drawingStepParam.value,
        drawingDelay: +drawingDelayParam.value,
        revolve: revolve.checked,

        radiusMultiple: +radiusMultipleParam.value,

        dots: dots,

        dotSizeMin: +dotSizeMinParam.value,
        dotSizeMax: +dotSizeMaxParam.value,
        dotRatioMin: +dotRatioMinParam.value,
        dotRatioMax: +dotRatioMaxParam.value,
        dotRotMin: +dotRotMinParam.value,
        dotRotMax: +dotRotMaxParam.value,

        frameSize: +gifSizeParam.value,
        frameDelay: +gifFrameDelayParam.value,
        frameCrop: gifCropCheck.checked,
        frameTransparent: gifTransparentCheck.checked,
        frameBgColor: gifBgColorParam.value,
        frameQuality: +gifQualityParam.value,
        frameInterval: +gifIntervalParam.value,
        lastFrameDelay: +gifLastFrameDelayParam.value,

        pngWidth: +pngWidthParam.value,
        pngTransparent: pngTransparentCheck.checked,
        pngCrop: pngCropCheck.checked,
        pngBgColor: pngBgColorParam.value,

        locArray: isLocValid ? locArray.map(function (value) {
            return [value[0] === null ? NaN : +(value[0].toFixed(2)), value[1] === null ? NaN : +(value[1].toFixed(2)), value[2] === null ? NaN : +(value[2].toFixed(2)),
                value[3] === null ? NaN : +(value[3].toFixed(2)), +(value[4].toFixed(3)), +(value[5].toFixed(4)), +(value[6].toFixed(2))]
        }) : undefined,
        cutPoints: cutPoints,
        cutPointSigns: isLocValid ? cutPointSigns : undefined,
        cuspPoints: cuspPoints,
        cuspPointSigns: isLocValid ? cuspPointSigns : undefined
    };
    return JSON.stringify(config);
}

/**
 * @param {String} json
 * */
function parseConfigJSON(json) {
    if (json === "" || json === null) return;
    try {
        var obj = JSON.parse(json);
        circleParam.value = obj.circleRadius === undefined ? 120 : obj.circleRadius;
        xParam.value = obj.xParam === undefined ? '' : obj.xParam;
        yParam.value = obj.yParam === undefined ? '' : obj.yParam;
        t1Param.value = obj.t1 === undefined ? -5 : obj.t1;
        t2Param.value = obj.t2 === undefined ? 5 : obj.t2;
        dxParam.value = obj.dx === undefined ? 0 : obj.dx;
        dyParam.value = obj.dy === undefined ? 0 : obj.dy;
        scaleParam.value = obj.scale === undefined ? 1 : obj.scale;
        skeletonCheck.checked = obj.showSkeleton === undefined ? true : obj.showSkeleton;
        functionCheck.checked = obj.showFunction === undefined ? true : obj.showFunction;
        clearBeforeDrawingCheck.checked = obj.clearBeforeDrawing === undefined ? true : obj.clearBeforeDrawing;
        drawingStepParam.value = obj.drawingStep === undefined ? 0.005 : obj.drawingStep;
        drawingDelayParam.value = obj.drawingDelay === undefined ? 2 : obj.drawingDelay;
        revolve.checked = obj.revolve === undefined ? false : obj.revolve;

        radiusMultipleParam.value = obj.radiusMultiple === undefined ? 10 : obj.radiusMultiple;

        dotSizeMinParam.value = obj.dotSizeMin === undefined ? 1 : obj.dotSizeMin;
        dotSizeMaxParam.value = obj.dotSizeMax === undefined ? 3 : obj.dotSizeMax;
        dotRatioMinParam.value = obj.dotRatioMin === undefined ? 50 : obj.dotRatioMin;
        dotRatioMaxParam.value = obj.dotRatioMax === undefined ? 100 : obj.dotRatioMax;
        dotRotMinParam.value = obj.dotRotMin === undefined ? 0 : obj.dotRotMin;
        dotRotMaxParam.value = obj.dotRotMax === undefined ? 360 : obj.dotRotMax;

        gifSizeParam.value = obj.frameSize === undefined ? 320 : obj.frameSize;
        gifFrameDelayParam.value = obj.frameDelay === undefined ? 25 : obj.frameDelay;
        gifCropCheck.checked = obj.frameCrop === undefined ? false : obj.frameCrop;
        gifTransparentCheck.checked = obj.frameTransparent === undefined ? false : obj.frameTransparent;
        gifBgColorParam.value = obj.frameBgColor === undefined ? '#FFFFFF' : obj.frameBgColor;

        if (gifTransparentCheck.checked)
            gifBgColorParam.disabled = true;

        gifQualityParam.value = obj.frameQuality === undefined ? 10 : obj.frameQuality;
        gifIntervalParam.value = obj.frameInterval === undefined ? 40 : obj.frameInterval;
        gifLastFrameDelayParam.value = obj.lastFrameDelay === undefined ? 1000 : obj.lastFrameDelay;

        pngWidthParam.value = obj.pngWidth === undefined ? 640 : obj.pngWidth;
        pngTransparentCheck.checked = obj.pngTransparent === undefined ? false : obj.pngTransparent;
        pngCropCheck.checked = obj.pngCrop === undefined ? false : obj.pngCrop;
        pngBgColorParam.value = obj.pngBgColor === undefined ? '#FFFFFF' : obj.pngBgColor;

        if (pngTransparentCheck.checked)
            pngBgColorParam.disabled = true;

        removeAllDots();
        dots = obj.dots;

        for (var key in dots) {
            addDotHelper(key, dots[key].size, dots[key].color, dots[key].ratio,
                Math.round(180 * dots[key].rotOffset / Math.PI), false);
        }

        if (obj.locArray !== undefined) {
            locArray = obj.locArray;
            cutPoints = obj.cutPoints === undefined ? [] : obj.cutPoints;
            cuspPoints = obj.cuspPoints === undefined ? [] : obj.cuspPoints;

            var signRow = document.getElementById('sign-adjust');
            signRow.innerHTML = '';
            for (var i = 0; i < cutPoints.length; i++)
                signRow.appendChild(createSignElement(i, obj.cutPointSigns[i] === 1 ? '+' : '-',
                    (i - 1) < 0 ? +t1Param.value : cutPoints[i - 1], cutPoints[i]));

            var rotRow = document.getElementById('rot-adjust');
            rotRow.innerHTML = '';
            for (var i = 0; i < cuspPoints.length; i++)
                rotRow.appendChild(createRotElement(i, obj.cuspPointSigns[i] === 1 ? '+' : '-',
                    (i - 1) < 0 ? +t1Param.value : cuspPoints[i - 1], cuspPoints[i]));

            drawPreview(+circleParam.value, +scaleParam.value);
        }
    } catch (e) {
        alert(e);
    }
}

function saveConfig() {
    saveAs(new Blob([getConfigJSON()], {type: "text/plain;charset=utf-8"}), "config.json");
}

function loadConfig(files) {
    if (files.length) {
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function () {
            parseConfigJSON(this.result);
        };
        reader.readAsText(file);
    }
}

/**
 * @param {boolean} canvasBounded
 * @return Array
 * */
function getRealBounds(canvasBounded) {
    var maxDotRatio = 0;
    var maxDot = null;
    for (var key in dots) {
        var dotRatio = Math.abs(dots[key].ratio);
        if (dotRatio > maxDotRatio) {
            maxDot = dots[key];
            maxDotRatio = dotRatio;
        }
    }
    var radius = +circleParam.value * +scaleParam.value;
    maxDotRatio = maxDotRatio / 100 * radius + radius;
    if (maxDotRatio < radius * 2)
        maxDotRatio = radius * 2;

    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < locArray.length; i++) {
        if (locArray[i][0] < minX)
            minX = locArray[i][0];
        if (locArray[i][0] > maxX)
            maxX = locArray[i][0];
        if (locArray[i][1] < minY)
            minY = locArray[i][1];
        if (locArray[i][1] > maxY)
            maxY = locArray[i][1];
    }
    minX = minX - maxDotRatio * 2 + +dxParam.value;
    maxX = maxX + maxDotRatio * 2 + +dxParam.value;
    minY = minY - maxDotRatio * 2 + +dyParam.value;
    maxY = maxY + maxDotRatio * 2 + +dyParam.value;
    if (canvasBounded)
        return [Math.max(-320, minX), Math.min(320, maxX), Math.max(-320, minY), Math.min(320, maxY)];
    else
        return [minX, maxX, minY, maxY];
}

/**
 * @param {Array} realBounds
 * @param {Number} width
 * @param {boolean} convention Whether follow the CV coordinate system or the conventional Cartesian system
 * @return Array
 * */
function getScalingAndTranslation(realBounds, width, convention) {
    var realWidth = realBounds[1] - realBounds[0];
    var realHeight = realBounds[3] - realBounds[2];

    var scaling = convention ? Math.min(width / realWidth, width / realHeight) : (realWidth > realHeight ? width / realWidth : width / realHeight);
    var height;
    if (realWidth > realHeight)
        height = width * realHeight / realWidth;
    else {
        height = width;
        width = width * realWidth / realHeight;
    }

    var wTranslation, hTranslation;
    if (convention) {
        wTranslation = -320 + (640 - realWidth * scaling) / 2 - realBounds[0] * scaling;
        hTranslation = 320 - (640 - realHeight * scaling) / 2 - realBounds[3] * scaling;
        // wTranslation = Math.abs(realBounds[0] * scaling - (640 - realWidth * 2 * scaling));
        // hTranslation = Math.abs(realBounds[3] * scaling - (640 - realHeight * 2 * scaling));
    }
    else {
        wTranslation = -(realBounds[0] + 320);
        hTranslation = -(320 - realBounds[3]);
    }
    return [height, scaling, wTranslation, hTranslation, width]
}

function autoAdjustScalingAndTranslation() {
    if (locArray.length > 0 && locArray[0].length >= 6) {
        var result = getScalingAndTranslation(getRealBounds(false), 640, true);
        scaleParam.value = (+scaleParam.value * result[1]).toFixed(1);
        dxParam.value = (+dxParam.value + result[2]).toFixed(1);
        dyParam.value = (+dyParam.value + result[3]).toFixed(1);
        previewRuler();
    }
    else {
        previewRuler();
        autoAdjustScalingAndTranslation();
    }
}

function saveToPNG() {
    var circleRadius = +circleParam.value;

    var ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(ruler, +drawingDelayParam.value, function () {
        var pngWidth = +pngWidthParam.value;
        var transparent = pngTransparentCheck.checked;
        var bgColor = pngBgColorParam.value;

        tempCanvas.width = pngWidth;
        var tempCxt = tempCanvas.getContext('2d');

        if (pngCropCheck.checked) {
            var parameters = getScalingAndTranslation(getRealBounds(true), tempCanvas.width, false);
            tempCanvas.width = parameters[4];
            tempCanvas.height = parameters[0];
            if (!transparent) {
                tempCxt.fillStyle = bgColor;
                tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
            }
            tempCxt.scale(parameters[1], parameters[1]);
            tempCxt.translate(parameters[2], parameters[3]);

        }
        else {
            // noinspection JSSuspiciousNameCombination
            tempCanvas.height = pngWidth;
            if (!transparent) {
                tempCxt.fillStyle = bgColor;
                tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
            }
            tempCxt.scale(pngWidth / topCanvas.width, pngWidth / topCanvas.height);
        }

        tempCxt.drawImage(funcCanvas, 0, 0);
        tempCxt.drawImage(bottomCanvas, 0, 0);
        tempCxt.drawImage(topCanvas, 0, 0);

        tempCanvas.toBlobHD(function (blob) {
            saveAs(blob, 'parametric-roulette.png');
        });
    });
}

/**
 * @param {HTMLElement} element
 * */
function getSign(element) {
    if (element === null || element === undefined) return 1;
    var x = element.innerHTML[element.innerHTML.length - 1];
    return x === '+' ? 1 : -1;
}

function saveToGIF() {
    var _locArray = locArray;

    var frameSize = +gifSizeParam.value;
    var transparent = gifTransparentCheck.checked;
    var frameInterval = +gifIntervalParam.value;
    var frameDelay = +gifFrameDelayParam.value;

    var drawingInterval = +drawingDelayParam.value;

    var circleRadius = +circleParam.value;

    var ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    stopDrawing();
    flag.stop = false;

    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');
    var funcCxt = funcCanvas.getContext('2d');
    var tempCxt = tempCanvas.getContext('2d');

    tempCanvas.width = frameSize;
    var gifHeight;

    var gif;

    if (gifCropCheck.checked) {
        var parameters = getScalingAndTranslation(getRealBounds(true), tempCanvas.width, false);
        tempCanvas.width = parameters[4];
        tempCanvas.height = parameters[0];
        if (!transparent) {
            tempCxt.fillStyle = gifBgColorParam.value;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        }
        tempCxt.scale(parameters[1], parameters[1]);
        tempCxt.translate(parameters[2], parameters[3]);

        gif = new GIF({
            workers: 4,
            quality: +gifQualityParam.value,
            workerScript: './gif.worker.js',
            width: parameters[4],
            height: parameters[0]
        });
    }
    else {
        tempCanvas.height = frameSize;
        if (!transparent) {
            tempCxt.fillStyle = gifBgColorParam.value;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        }
        tempCxt.scale(frameSize / topCanvas.width, frameSize / topCanvas.height);
        gif = new GIF({
            workers: 4,
            quality: +gifQualityParam.value,
            workerScript: './gif.worker.js',
            width: frameSize,
            height: frameSize
        });
    }

    ruler.showSkeleton = skeletonCheck.checked;

    if (clearBeforeDrawingCheck.checked || !ruler.showSkeleton) {
        clearBottom();
        clearTop();
    }

    if (!functionCheck.checked)
        clearFunc();

    setTransform([topCxt, bottomCxt, funcCxt]);

    var progressLabel = $('#progressLabel');
    var progressbar = $('#progressbar');
    var epsilon = 0.0001;
    progressbar.width('0%');

    var sign = getSign(document.getElementById('c0'));
    var rot = getSign(document.getElementById('r0'));
    for (var i = 0, delay = 0, counter = 0, cut = 0, cusp = 0; i < _locArray.length; i++, delay += drawingInterval, counter++) {
        var changeRot = i === 0;
        if (cut < cutPoints.length) {
            if ((_locArray[i][5] - cutPoints[cut]) > epsilon)
                sign = getSign(document.getElementById('c' + ++cut));
        }
        if (cusp < cuspPoints.length) {
            if ((_locArray[i][5] - cuspPoints[cusp]) > epsilon) {
                rot = getSign(document.getElementById('r' + ++cusp));
                changeRot = true;
            }
        }
        currentJobs.push((function (i, delay, counter, sign, rot, changeRot) {
                return setTimeout(function () {
                    if (!flag.stop) {
                        ruler.erase(bottomCxt);
                        if (_locArray[i][6] === 1)
                            ruler.moveTo(_locArray[i][0] + _locArray[i][2], _locArray[i][1] + _locArray[i][3]);
                        else if (_locArray[i][6] !== 2)
                            ruler.moveTo(_locArray[i][0] + sign * _locArray[i][2], _locArray[i][1] + sign * _locArray[i][3]);
                        ruler.angle = _locArray[i][4];
                        if (changeRot)
                            ruler.changeDirection(rot);

                        ruler.draw(topCxt, bottomCxt);

                        if (counter % frameInterval === 0) {
                            if (transparent)
                                tempCxt.clearRect(0, 0, topCanvas.width, topCanvas.height);
                            else
                                tempCxt.fillRect(0, 0, topCanvas.width, topCanvas.height);

                            tempCxt.drawImage(funcCanvas, 0, 0);
                            tempCxt.drawImage(bottomCanvas, 0, 0);
                            tempCxt.drawImage(topCanvas, 0, 0);

                            gif.addFrame(tempCxt, {
                                copy: true,
                                delay: frameDelay
                            });

                            var progress = i / _locArray.length * 100;
                            progressbar.width(progress + '%');
                            progressLabel.text('Drawing: t = ' + _locArray[i][5].toFixed(3) + ', ' + progress.toFixed(1) + '%');
                        }
                    }
                }, delay);
            }
        )(i, delay, counter, sign, rot, changeRot));
    }
    currentJobs.push((function (i, delay) {
            return setTimeout(function () {
                if (!flag.stop) {
                    if (transparent)
                        tempCxt.clearRect(0, 0, topCanvas.width, topCanvas.height);
                    else
                        tempCxt.fillRect(0, 0, topCanvas.width, topCanvas.height);

                    tempCxt.drawImage(funcCanvas, 0, 0);
                    tempCxt.drawImage(bottomCanvas, 0, 0);
                    tempCxt.drawImage(topCanvas, 0, 0);
                    gif.addFrame(tempCxt, {
                        copy: true,
                        delay: +gifLastFrameDelayParam.value
                    });

                    progressbar.width('0%');

                    gif.on('progress', function (p) {
                        if (Math.abs(1 - p) < 0.0001) {
                            progressbar.width('100%');
                            progressLabel.text('Save as GIF: Finished');
                        }
                        else {
                            p = p * 100;
                            progressbar.width(p + '%');
                            progressLabel.text('Save as GIF: ' + p.toFixed(1) + '%');
                        }
                    });

                    gif.on('finished', function (blob) {
                        saveAs(blob, 'parametric-roulette.gif');
                    });

                    gif.render();
                }
            }, delay);
        }
    )(i, delay + drawingInterval));
}

/**
 * @return Array
 * */
function getDotArray() {
    var dotArray = [];
    for (var key in dots)
        dotArray.push(dots[key]);
    return dotArray;
}

/**
 * @param {Array} cxts
 * */
function setTransform(cxts) {
    var sx = +dxParam.value;
    var sy = +dyParam.value;
    for (var i = 0; i < cxts.length; i++)
        cxts[i].setTransform(1, 0, 0, -1, sx + 320, 320 - sy);
}

/**
 * @param {Number} radius
 * @param {Number} scale
 * */
function drawPreview(radius, scale) {
    if (clearBeforeDrawingCheck.checked)
        clear();

    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');
    var funcCxt = funcCanvas.getContext('2d');
    setTransform([topCxt, bottomCxt, funcCxt]);

    funcCxt.strokeStyle = '#000000';
    funcCxt.moveTo(locArray[0][0], locArray[0][1]);
    for (var i = 1; i < locArray.length; i++)
        if (!locArray[i][6])
            funcCxt.lineTo(locArray[i][0], locArray[i][1]);
    funcCxt.stroke();

    var initialSigns = getSign(document.getElementById('c0'));
    var ruler = new Ruler(new Circle(initialSigns * locArray[0][2] + locArray[0][0],
        initialSigns * locArray[0][3] + locArray[0][1], radius * scale), getDotArray());
    ruler.showSkeleton = true;
    ruler.draw(topCxt, bottomCxt);
    enableDrawing();
}

function previewRuler() {
    stopDrawing();
    var radius = +circleParam.value;
    var scale = +scaleParam.value;
    locArray = calculateLocations(+t1Param.value, +t2Param.value, nerdamer(xParam.value),
        nerdamer(yParam.value), +drawingStepParam.value, radius, scale);
    drawPreview(radius, scale);
    saveConfigToBrowser();
}

function clear() {
    clearTop();
    clearBottom();
    clearFunc();
}

function clearTop() {
    topCanvas.height++;
    topCanvas.height--;
}

function clearBottom() {
    bottomCanvas.height++;
    bottomCanvas.height--;
}

function clearFunc() {
    funcCanvas.height++;
    funcCanvas.height--;
}

/**
 * @param {Function} callback
 * */
function caller(callback) {
    var circleRadius = +circleParam.value;

    var ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(ruler, +drawingDelayParam.value, undefined);
}

/**
 * @param {nerdamer} xExp
 * @param {nerdamer} yExp
 * @return Array
 * */
function buildNecessaryExpressions(xExp, yExp) {
    var dx = nerdamer.diff(xExp);
    var dy = nerdamer.diff(yExp);
    // console.log(dx.text());
    // console.log(dy.text());

    var dx_2 = nerdamer.diff(dx);
    var dy_2 = nerdamer.diff(dy);
    // console.log(dy_2.text());
    // console.log(dx_2.text());

    var curvatureString = '((' + dx.text() + ') * (' + dy_2.text() + ') - (' + dx_2.text() + ') * (' + dy.text() + '))/((' + dx.text() + ')^2 + (' + dy.text() + ')^2)^1.5';
    var curvatureExp = nerdamer(curvatureString);
    // console.log(curvatureExp.text());
    // console.log(curvatureString);

    var arcLengthExp = nerdamer('sqrt((' + dx.text() + ')^2 + (' + dy.text() + ')^2)');
    return [dx.buildFunction(['t']), dy.buildFunction(['t']), arcLengthExp.buildFunction(['t']),
        curvatureExp.buildFunction(['t']), dx_2.buildFunction(['t']), dy_2.buildFunction(['t'])];
}

/**
 * @param {Number} t1
 * @param {Number} t2
 * @param {nerdamer} xExp
 * @param {nerdamer} yExp
 * @param {Number} step
 * @param {Number} radius
 * @param {Number} scale
 * @return Array
 * */
function calculateLocations(t1, t2, xExp, yExp, step, radius, scale) {
    var callAgain = false, prevxExp = xExp, prevyExp = yExp;
    var cStep = step;
    var num = 1;
    while (cStep < 1) {
        cStep *= 10;
        num++;
    }

    var newCuspPoints = [];
    var c_newCuspPoints = [];
    var firstRotEle = document.getElementById('r0'), firstSignEle = document.getElementById('c0');
    var rotDirection = getSign(firstRotEle);
    var sign = getSign(firstSignEle);

    if (firstRotEle === null || firstSignEle === null)

    // require regeneration of sign-elements (a temporary solution)
        callAgain = true;

    var initialRotIncrementDirection = rotDirection * sign;

    //var totalSteps = Math.round((t2 - t1) / step);
    //var arcLengthInt = nerdamer('defint(sqrt((' + dx.text() + ')^2 + (' + dy.text() + ')^2), ' + t1 + ', t2, t)');
    var exps = buildNecessaryExpressions(xExp, yExp);
    var dx = exps[0], dy = exps[1];
    var arcLengthExp = exps[2];
    var curvature = exps[3];

    var locations = [];
    var newCutPoints = [];
    var defaultCutPointSigns = [-1];

    xExp = xExp.buildFunction(['t']);
    yExp = yExp.buildFunction(['t']);

    var lastNormal = 0;
    var arcLength = 0;
    var previousArcLength = arcLength;
    var previousLower = t1;

    // longer slice length will result in better accuracy of numerical integration
    var sliceLength = 256;
    var sliceUpper = sliceLength - 1;

    // cusp detection threshold
    var cuspThreshold = 0.1;

    // don't know which value is appropriate here
    var epsilon = 1e-9;
    var maxError = 1e-6;
    for (var t = t1, counter = 0, cut = 0, idx = 0; t < t2; t += step, counter++, idx++) {

        t = +(t.toFixed(num));
        var x = xExp(t), y = yExp(t);
        var dyE = dy(t), dxE = dx(t);
        var normal = -dxE / dyE;

        var delX, delY;
        if (normal === 0) {
            delX = Math.sign(lastNormal) * radius;
            delY = 0;
        }
        else {
            delX = radius * Math.sign(normal) / Math.sqrt(normal * normal + 1);
            delY = delX * normal;
        }


        var sliceIdx = counter % sliceLength;
        arcLength = previousArcLength + integrate(arcLengthExp, previousLower, t, sliceIdx * 2 + 5);
        if (sliceIdx === sliceUpper) {
            previousLower = t;
            previousArcLength = arcLength;
        }
        var rotAngle = arcLength / radius;
        var lastSign = defaultCutPointSigns[defaultCutPointSigns.length - 1];

        var z1 = undefined, z2 = undefined;

        if (Math.abs(dxE) < cuspThreshold) {

            // may be a cusp
            if (Math.abs(dyE) < cuspThreshold) {
                var cuspSteps = 0;
                var currentCusp = newCuspPoints.length === 0 ? undefined : newCuspPoints[newCuspPoints.length - 1];
                if (currentCusp === undefined || Math.abs(currentCusp - t) > 10 * step) {

                    // no need to recalculate
                    if (z1 === undefined) z1 = findZero(dx, exps[4], t, maxError);
                    if (z2 === undefined) z2 = findZero(dy, exps[5], t, maxError);

                    // both dy/dt and dx/dt approaches the same value
                    if (!isNaN(z1) && !isNaN(z2) && Math.abs(z1 - z2) < maxError * 2) {
                        if (t < z1 && z1 < t2 && (newCuspPoints.length === 0 || Math.abs(z1 - newCuspPoints[newCuspPoints.length - 1]) > maxError * 10)) {
                            newCuspPoints.push(z1);
                            newCutPoints.push(z1);
                            c_newCuspPoints = newCuspPoints.concat();
                            if (Math.abs(normal - lastNormal) < 0.5) {
                                // vertical cusp does not require sign-adjustment when we want the circle to consistently inside or outside the parametric curve
                                if (revolve.checked)
                                    defaultCutPointSigns.push(lastSign);
                                else
                                    defaultCutPointSigns.push(-lastSign);
                            }
                            else {
                                // horizontal cusp requires sign-adjustment when we want the circle to consistently inside or outside the parametric curve
                                if (revolve.checked)
                                    defaultCutPointSigns.push(-lastSign);
                                // stationary point does not need sign-adjustment
                                else
                                    defaultCutPointSigns.push(lastSign);
                            }
                        }

                    }
                }
                currentCusp = c_newCuspPoints.length === 0 ? undefined : c_newCuspPoints[c_newCuspPoints.length - 1];
                if (currentCusp !== undefined && revolve.checked) {
                    var nextNormal = -dx(t + step + epsilon) / dy(t + step + epsilon);
                    var cNormal = normal;

                    // switch to last normal if t is too close
                    if (Math.abs(t - currentCusp) < maxError)
                        cNormal = lastNormal;
                    if (Math.sign(cNormal) * Math.sign(nextNormal) === -1 && (t + step) <= t2 && Math.abs(t - currentCusp) <= step) {
                        c_newCuspPoints.splice(c_newCuspPoints.length - 1, 1);
                        var cuspX = xExp(currentCusp), cuspY = yExp(currentCusp);

                        // console.log(t + '||' + currentCusp + '||' + (t + step));
                        var r1 = Math.atan(cNormal);
                        var r2 = Math.atan(nextNormal);
                        var radians;

                        if (Math.abs(cNormal - nextNormal) < 0.5) {
                            radians = Math.PI - Math.abs(r1) - Math.abs(r2);
                            if (dyE < 0) {
                                r1 -= Math.PI;
                            }

                        }
                        else {
                            radians = Math.abs(r1) + Math.abs(r2);
                            if (dxE < 0) {
                                r1 -= Math.PI;
                            }
                        }

                        // sign-changing still not guaranteed to work for ALL CASES.
                        // TODO: add manual sign-changing buttons instead
                        for (var i = 0; i < newCutPoints.length; i++) {
                            if (t >= +(newCutPoints[i].toFixed(num))) {
                                var ele = document.getElementById('c' + i);
                                sign = ele === undefined ? defaultCutPointSigns[i] : getSign(ele);
                                console.log(t + '||' + sign);
                                break;
                            }
                        }

                        if (Math.abs(lastNormal - nextNormal) > 0.5 && initialRotIncrementDirection === 1) {
                            sign = -sign;
                        }
                        else {
                            sign = initialRotIncrementDirection * sign;
                        }

                        var tempSign = 1;

                        idx++;
                        for (var i = 0; i < radians; i += step * 4, idx++, cuspSteps++) {
                            locations[idx] = [cuspX * scale, cuspY * scale, tempSign * sign * radius * Math.cos(r1 + rotDirection * i) * scale,
                                tempSign * sign * radius * Math.sin(r1 + rotDirection * i) * scale, rotAngle + i, currentCusp, 1];
                        }
                        cuspSteps++;
                        locations[idx++] = [cuspX * scale, cuspY * scale, tempSign * sign * radius * Math.cos(r1 + rotDirection * radians) * scale,
                            tempSign * sign * radius * Math.sin(r1 + rotDirection * radians) * scale, rotAngle + radians, currentCusp, 1];
                        idx--;
                        previousArcLength += radius * radians;
                    }
                }

                // only matters when it's EXACTLY zero. Set [6] to 2 to disable drawing at this point
                if (dyE === 0) {
                    locations[idx - cuspSteps] = [NaN, NaN, NaN, NaN, rotAngle, t, 2];
                }
                else {
                    locations[idx - cuspSteps] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 0];
                }
            }
            else {
                if (Math.sign(normal) * Math.sign(lastNormal) === -1 || Math.sign(normal) === 0) {
                    z1 = findZero(dx, exps[4], t, maxError);

                    // a vertical tangent or horizontal tangent (stationary point)
                    if (!isNaN(z1) && Math.abs(z1 - t) <= step) {
                        newCutPoints.push(z1);
                        if (Math.abs(normal - lastNormal) < 0.5) {
                            defaultCutPointSigns.push(-lastSign);
                        }

                        // no need to change sign at stationary point as the Math.sign(normal) in delX does the thing.
                        else {
                            defaultCutPointSigns.push(lastSign);
                        }
                    }
                }
                locations[idx] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 0];
            }
        }
        else {
            if (dyE === 0) {
                locations[idx] = [x * scale, y * scale, 0, radius * scale, rotAngle, t, 0];
            }
            else {
                locations[idx] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 0];
            }
        }
        lastNormal = normal;
    }

    newCutPoints.push(t2);
    newCuspPoints.push(t2);

    var signRow = document.getElementById('sign-adjust');
    var signElements = new Array(newCutPoints.length);
    if (newCutPoints.length === cutPoints.length) {
        for (var i = 0; i < newCutPoints.length; i++) {
            var oldElement = document.getElementById('c' + i);
            signElements[i] = createSignElement(i, oldElement.innerHTML[oldElement.innerHTML.length - 1],
                ((i - 1) < 0 ? t1 : newCutPoints[i - 1]), newCutPoints[i]);
        }
    } else {
        for (var i = 0; i < newCutPoints.length; i++)
            signElements[i] = createSignElement(i, defaultCutPointSigns[i] === 1 ? '+' : '-', ((i - 1) < 0 ? t1 : newCutPoints[i - 1]), newCutPoints[i]);
    }
    signRow.innerHTML = '';
    for (var i = 0; i < newCutPoints.length; i++)
        signRow.appendChild(signElements[i]);

    var rotRow = document.getElementById('rot-adjust');
    var rotElements = new Array(newCuspPoints.length);
    if (newCuspPoints.length === cuspPoints.length) {
        for (var i = 0; i < newCuspPoints.length; i++) {
            var oldElement = document.getElementById('r' + i);
            rotElements[i] = createRotElement(i, oldElement.innerHTML[oldElement.innerHTML.length - 1],
                ((i - 1) < 0 ? t1 : newCuspPoints[i - 1]), newCuspPoints[i]);
        }
    } else {
        if (revolve.checked)
            for (var i = 0; i < newCuspPoints.length; i++)
                rotElements[i] = createRotElement(i, '+', ((i - 1) < 0 ? t1 : newCuspPoints[i - 1]), newCuspPoints[i]);
        else
            for (var i = 0; i < newCuspPoints.length; i++)
                rotElements[i] = createRotElement(i, i % 2 === 0 ? '-' : '+', ((i - 1) < 0 ? t1 : newCuspPoints[i - 1]), newCuspPoints[i]);
    }
    rotRow.innerHTML = '';
    for (var i = 0; i < newCuspPoints.length; i++)
        rotRow.appendChild(rotElements[i]);

    cutPoints = newCutPoints;
    cuspPoints = newCuspPoints;
    $('[data-toggle="tooltip"]').tooltip();

    if (callAgain)
        return calculateLocations(t1, t2, prevxExp, prevyExp, step, radius, scale);
    return locations;
}

/**
 * Newton's method to find a zero
 * @param {Function} f
 * @param {Function} fp The first derivative
 * @param {Number} x0 initial value
 * @param {Number} err Error bound
 * */
function findZero(f, fp, x0, err) {
    var x_n = x0, x_n1;
    err /= 2;
    for (var i = 0; i < 16; i++) {
        x_n1 = x_n - f(x_n) / fp(x_n);
        if (Math.abs(x_n1 - x_n) < err)
            return x_n1;
        x_n = x_n1;
    }
    return NaN;
}

/**
 * a template for sign element (the button for changing the sign)
 * @param {Number} index
 * @param {string} sign
 * @param {Number} lower
 * @param {Number} upper
 * */
function createSignElement(index, sign, lower, upper) {
    var e = document.createElement('button');
    e.id = 'c' + index;
    e.type = 'button';
    e.className = 'btn btn-secondary btn-sm sign-ele';
    e.innerHTML = upper.toFixed(2) + sign;
    e.setAttribute('data-toggle', 'tooltip');
    e.title = 'Change the sign for t between ' + lower.toFixed(3) + ' and ' + upper.toFixed(3);
    e.disabled = revolve.checked;
    if (!revolve.checked)
        e.onclick = function (ev) {
            reverseSign([ev.target]);
        };
    return e;
}

/**
 * @param {Array} targets
 * */
function reverseSign(targets) {
    for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        var ih = t.innerHTML;
        var sign = ih[ih.length - 1];
        if (sign === '+')
            t.innerHTML = ih.substring(0, ih.length - 1) + '-';
        else
            t.innerHTML = ih.substring(0, ih.length - 1) + '+';
    }
    if (revolve.checked)
        previewRuler();
    else
        saveConfigToBrowser();
}

/**
 * a template for rot (rotation) element (the button for changing the direction of rotation)
 * @param {Number} index
 * @param {string} sign
 * @param {Number} lower
 * @param {Number} upper
 * */
function createRotElement(index, sign, lower, upper) {
    var e = document.createElement('button');
    e.id = 'r' + index;
    e.type = 'button';
    e.className = 'btn btn-outline-dark btn-sm rot-ele';
    e.innerHTML = upper.toFixed(2) + sign;
    e.setAttribute('data-toggle', 'tooltip');
    e.title = 'Change the direction of rotation for t between ' + lower.toFixed(3) + ' and ' + upper.toFixed(3);
    e.disabled = revolve.checked;
    if (!revolve.checked)
        e.onclick = function (ev) {
            reverseSign([ev.target]);
        };
    return e;
}

function generateRadius() {
    var multiple = +radiusMultipleParam.value;
    var exps = buildNecessaryExpressions(nerdamer(xParam.value), nerdamer(yParam.value));
    var t1 = +t1Param.value, t2 = +t2Param.value;
    var arcLength = integrate(exps[2], t1, t2, Math.round((t2 - t1) / (+drawingStepParam.value)) + 10);
    circleParam.value = (arcLength / multiple / (2 * Math.PI));
    previewRuler();
}

/**
 * @param {Ruler} ruler
 * @param {Number} drawingInterval
 * @param {Function} callback
 * */
function draw(ruler, drawingInterval, callback) {
    // storing the reference to global variable for efficiency
    var _locArray = locArray;
    if (_locArray.length < 1)
        return alert('You must first click \'preview\' to calculate drawing path');

    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');
    var funcCxt = funcCanvas.getContext('2d');

    ruler.showSkeleton = skeletonCheck.checked;

    if (clearBeforeDrawingCheck.checked || !ruler.showSkeleton) {
        clearBottom();
        clearTop();
    }

    if (!functionCheck.checked)
        clearFunc();

    setTransform([topCxt, bottomCxt, funcCxt]);

    var progressLabel = $('#progressLabel');
    var progressbar = $('#progressbar');
    var epsilon = 1e-12;
    progressbar.width('0%');

    var sign = getSign(document.getElementById('c0'));
    var rot = getSign(document.getElementById('r0'));
    for (var i = 0, delay = 0, counter = 0, cut = 0, cusp = 0; i < _locArray.length; i++, delay += drawingInterval, counter++) {
        var changeRot = i === 0;
        if (cut < cutPoints.length) {
            if ((_locArray[i][5] - cutPoints[cut]) > epsilon)
                sign = getSign(document.getElementById('c' + ++cut));
        }
        if (cusp < cuspPoints.length) {
            if ((_locArray[i][5] - cuspPoints[cusp]) > epsilon) {
                rot = getSign(document.getElementById('r' + ++cusp));
                changeRot = true;
            }
        }
        currentJobs.push((function (i, delay, counter, sign, rot, changeRot) {
                return setTimeout(function () {
                    if (!flag.stop) {
                        ruler.erase(bottomCxt);
                        if (_locArray[i][6] === 1)
                            ruler.moveTo(_locArray[i][0] + _locArray[i][2], _locArray[i][1] + _locArray[i][3]);
                        else if (_locArray[i][6] !== 2)
                            ruler.moveTo(_locArray[i][0] + sign * _locArray[i][2], _locArray[i][1] + sign * _locArray[i][3]);
                        ruler.angle = _locArray[i][4];

                        if (changeRot)
                            ruler.changeDirection(rot);

                        ruler.draw(topCxt, bottomCxt);

                        if (counter % 10 === 0) {
                            var progress = i / _locArray.length * 100;
                            progressbar.width(progress + '%');
                            progressLabel.text('Drawing: t = ' + _locArray[i][5].toFixed(3) + ', ' + progress.toFixed(1) + '%');
                        }
                    }
                }, delay);
            }
        )(i, delay, counter, sign, rot, changeRot));
    }
    currentJobs.push((function (delay) {
            return setTimeout(function () {
                progressbar.width('100%');
                progressLabel.text('Drawing: Finished');
                if (callback !== undefined)
                    callback();
            }, delay);
        }
    )(delay));
}

/**
 * Numerically integrate function f over [a, b] using the trapezoidal rule
 * @param {Function} f
 * @param {Number} a
 * @param {Number} b
 * @param {Number} n
 * @return Number
 * */
function integrate(f, a, b, n) {
    var step = (b - a) / n;
    var sum = f(a);
    for (var i = 1; i < n - 1; i++)
        sum += 2 * f(a + i * step);
    return (sum + f(b)) * 0.5 * step;
}

/**
 * @param {Number} x
 * @param {Number} y
 * @return Number
 * */
function lcm(x, y) {
    var a = x, b = y;
    while (a % b !== 0) {
        var c = a % b;
        a = b;
        b = c;
    }
    return x * y / b
}

/**
 * @param {Number} x
 * @param {Number} y
 * @param {Number} radius
 * @param {Number} rad
 * @return Array
 * */
function rad2cor(x, y, radius, rad) {
    return [x + radius * Math.cos(rad), y + radius * Math.sin(rad)];
}

/**
 * @constructor
 * @param {Circle} circle
 * @param {Array} dots
 * */
function Ruler(circle, dots) {
    this.circle = circle;

    /**
     * @type {Array}
     * */
    this.dots = dots;
    this.angle = 0;
    this.showSkeleton = true;

    this.previousRotation = 0;
    this.rotSign = 1;

    this.calculateRotation = function (i) {
        return this.rotSign * this.angle - this.dots[i].rotOffset + 2 * this.previousRotation;
    };

    this.changeDirection = function (sign) {
        this.previousRotation = sign === -1 ? this.angle : 0;
        this.rotSign = sign;
    };

    /**
     * @param {CanvasRenderingContext2D} topCxt
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.draw = function (topCxt, bottomCxt) {
        this.drawCircle(bottomCxt);
        this.drawDots(topCxt);
        this.drawSkeleton(bottomCxt);
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.erase = function (bottomCxt) {
        if (this.showSkeleton) {
            var previousLineWidth = bottomCxt.lineWidth;
            bottomCxt.lineWidth = previousLineWidth + 2;
            bottomCxt.globalCompositeOperation = 'destination-out';
            this.eraseCircle(bottomCxt);
            this.eraseSkeleton(bottomCxt);
            bottomCxt.globalCompositeOperation = 'source-over';
            bottomCxt.lineWidth = previousLineWidth;
        }
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.drawCircle = function (bottomCxt) {
        if (this.showSkeleton)
            this.circle.draw(bottomCxt);
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.eraseCircle = function (bottomCxt) {
        this.circle.draw(bottomCxt);
    };
    /**
     * @param {CanvasRenderingContext2D} topCxt
     * */
    this.drawDots = function (topCxt) {
        //var previousStyle = topCxt.fillStyle;
        for (var i = 0; i < this.dots.length; i++) {
            var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].ratio / 100 * this.circle.radius,
                this.calculateRotation(i));
            topCxt.fillStyle = this.dots[i].color;
            topCxt.beginPath();
            topCxt.arc(dotPos[0], dotPos[1], this.dots[i].size, 0, 2 * Math.PI);
            topCxt.closePath();
            topCxt.fill();
        }
        //topCxt.fillStyle = previousStyle;
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.drawSkeleton = function (bottomCxt) {
        if (this.showSkeleton) {
            for (var i = 0; i < this.dots.length; i++) {
                var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].ratio / 100 * this.circle.radius,
                    this.calculateRotation(i));
                bottomCxt.moveTo(this.circle.x, this.circle.y);
                bottomCxt.lineTo(dotPos[0], dotPos[1]);
            }
            bottomCxt.stroke();
        }
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.eraseSkeleton = function (bottomCxt) {
        if (this.showSkeleton) {
            bottomCxt.beginPath();
            for (var i = 0; i < this.dots.length; i++) {
                var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].ratio / 100 * this.circle.radius,
                    this.calculateRotation(i));
                bottomCxt.moveTo(this.circle.x, this.circle.y);
                bottomCxt.lineTo(dotPos[0], dotPos[1]);
                bottomCxt.arc(this.circle.x, this.circle.y, 2, 0, 2 * Math.PI);
            }
            bottomCxt.closePath();
            bottomCxt.stroke();
            bottomCxt.fill();
        }
    };
    /**
     * @param {Number} x
     * @param {Number} y
     * */
    this.moveTo = function (x, y) {
        this.circle.moveTo(x, y);
    };
}

/**
 * @constructor
 * @param {Number} size
 * @param {string} color
 * @param {Number} ratio
 * @param {Number} rotOffset
 * */
function Dot(size, color, ratio, rotOffset) {
    this.size = size;
    this.color = color;
    this.ratio = ratio;
    this.rotOffset = rotOffset / 180 * Math.PI;
}

/**
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} radius
 * */
function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    /**
     * @param {CanvasRenderingContext2D} cxt
     * */
    this.draw = function (cxt) {
        cxt.beginPath();
        cxt.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        cxt.closePath();
        cxt.stroke();
    };

    /**
     * @param {CanvasRenderingContext2D} cxt
     * */
    this.erase = function (cxt) {
        cxt.globalCompositeOperation = 'destination-out';
        var previousLineWidth = cxt.lineWidth;
        cxt.lineWidth = previousLineWidth + 2;
        this.draw(cxt);
        cxt.lineWidth = previousLineWidth;
    };

    /**
     * @param {Number} x
     * @param {Number} y
     * */
    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    }
}