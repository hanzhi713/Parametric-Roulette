if (typeof (Math.sign) !== "function")
    Math.sign = function (x) {
        return x === 0 ? 0 : x > 0 ? 1 : -1;
    };

var TwoPI = Math.PI * 2;

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
var reverseDirectionCheck = document.getElementById('direction');

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
    var effectors = [xParam, yParam, t1Param, t2Param, dxParam, dyParam, scaleParam, circleParam, drawingStepParam];
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
    $('#' + id).hide(300, function () {
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

function randomDot() {
    var dotSize = randInt(+dotSizeMinParam.value, +dotSizeMaxParam.value);
    var dotColor = '#' + (Math.floor(Math.random() * 256 * 256 * 256)).toString(16);
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
    for (var i = 0; i < currentJobs.length; i++) {
        clearTimeout(currentJobs[i]);
    }
    currentJobs = [];
}

function adjustDotRatioCap(e) {
}

function saveConfigToBrowser() {
    localStorage.setItem('cache', getConfigJSON());
}

function getConfigJSON() {
    var isLocValid = locArray.length > 0 && locArray[0].length >= 6;
    var cutPointSigns = new Array(cutPoints.length);
    if (isLocValid) {
        for (var i = 0; i < cutPoints.length; i++)
            cutPointSigns[i] = getSign(document.getElementById('c' + i))
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
        reverseDirection: reverseDirectionCheck.checked,

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
            return [+(value[0].toFixed(2)), +(value[1].toFixed(2)), +(value[2].toFixed(2)), +(value[3].toFixed(2)), +(value[4].toFixed(3)), +(value[5].toFixed(4)), +(value[6].toFixed(2))]
        }) : undefined,
        cutPoints: cutPoints,
        cutPointSigns: isLocValid ? cutPointSigns : undefined
    };
    return JSON.stringify(config);
}

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
        reverseDirectionCheck.checked = obj.reverseDirection === undefined ? false : obj.reverseDirection;

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
            cutPoints = obj.cutPoints;
            var g = document.getElementById('sign-adjust');
            g.innerHTML = '';
            for (var i = 0; i < cutPoints.length; i++)
                g.appendChild(createSignElement(i, obj.cutPointSigns[i] === 1 ? '+' : '-',
                    (i - 1) < 0 ? +t1Param.value : cutPoints[i - 1], cutPoints[i]));

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
 * @return Array
 * */
function getRealBounds() {
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
    maxDotRatio = maxDotRatio / 50 * radius;
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
    return [Math.max(-320, minX), Math.min(320, maxX), Math.max(-320, minY), Math.min(320, maxY)];
}

/**
 * @param {Array} realBounds
 * @param {Number} width
 * @return Array
 * */
function getScalingAndTranslation(realBounds, width) {
    var realWidth = realBounds[1] - realBounds[0];
    var realHeight = realBounds[3] - realBounds[2];

    var scaling = width / realWidth;
    var height = width * realHeight / realWidth;

    var wTranslation = -(realBounds[0] + 320);
    var hTranslation = -(320 - realBounds[3]);
    return [height, scaling, wTranslation, hTranslation]
}

function saveToPNG() {
    var circleRadius = +circleParam.value;

    var ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;
    ruler.reverse = reverseDirectionCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(ruler, +drawingDelayParam.value, function () {
        var pngWidth = +pngWidthParam.value;
        var transparent = pngTransparentCheck.checked;
        var bgColor = pngBgColorParam.value;

        tempCanvas.width = pngWidth;
        var tempCxt = tempCanvas.getContext('2d');

        if (pngCropCheck.checked) {
            var parameters = getScalingAndTranslation(getRealBounds(), tempCanvas.width);
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
    var frameSize = +gifSizeParam.value;
    var transparent = gifTransparentCheck.checked;
    var frameInterval = +gifIntervalParam.value;
    var frameDelay = +gifFrameDelayParam.value;

    var circleRadius = +circleParam.value;

    var ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;
    ruler.reverse = reverseDirectionCheck.checked;

    stopDrawing();
    flag.stop = false;

    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');
    var funcCxt = funcCanvas.getContext('2d');
    var tempCxt = tempCanvas.getContext('2d');

    tempCanvas.width = frameSize;
    var gifHeight;

    if (gifCropCheck.checked) {
        var parameters = getScalingAndTranslation(getRealBounds(), tempCanvas.width);
        tempCanvas.height = parameters[0];
        gifHeight = parameters[0];
        if (!transparent) {
            tempCxt.fillStyle = gifBgColorParam.value;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        }
        tempCxt.scale(parameters[1], parameters[1]);
        tempCxt.translate(parameters[2], parameters[3]);
    }
    else {
        // noinspection JSSuspiciousNameCombination
        tempCanvas.height = frameSize;
        if (!transparent) {
            tempCxt.fillStyle = gifBgColorParam.value;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        }
        tempCxt.scale(frameSize / topCanvas.width, frameSize / topCanvas.height);
    }

    var gif = new GIF({
        workers: 4,
        quality: +gifQualityParam.value,
        workerScript: './gif.worker.js',
        width: frameSize,
        height: gifHeight
    });

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
    progressbar.width('0%');

    var epsilon = 0.0001;
    var se = document.getElementById('c0');

    var drawingInterval = +drawingDelayParam.value;
    var sign = se === undefined ? 1 : getSign(se);
    for (var i = 0, delay = 0, counter = 0, cut = 0; i < locArray.length; i++, delay += drawingInterval, counter++) {
        if (cut < cutPoints.length) {
            if ((locArray[i][5] - cutPoints[cut]) > epsilon)
                sign = getSign(document.getElementById('c' + ++cut));
        }
        currentJobs.push((function (i, delay, counter, sign) {
                return setTimeout(function () {
                    if (!flag.stop) {
                        ruler.erase(bottomCxt);
                        ruler.moveTo(locArray[i][0] + sign * locArray[i][2], locArray[i][1] + sign * locArray[i][3]);
                        ruler.angle = locArray[i][4];
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
                                delay: frameDelay //frameInterval + frameInterval * drawingStep
                            });

                            var progress = i / locArray.length * 100;
                            progressbar.width(progress + '%');
                            progressLabel.text(lan['Drawing: '] + 't = ' + locArray[i][5].toFixed(3) + ', rcv = '
                                + locArray[i][6].toFixed(2) + ', ' + progress.toFixed(1) + '%');
                        }
                    }
                }, delay);
            }
        )(i, delay, counter, sign));
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
                            progressLabel.text(lan['Save as GIF: Finished']);
                        }
                        else {
                            p = p * 100;
                            progressbar.width(p + '%');
                            progressLabel.text(lan['Save as GIF: '] + p.toFixed(1) + '%');
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
    for (var key in dots) {
        dotArray.push(dots[key]);
    }
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

function drawPreview(radius, scale) {
    if (clearBeforeDrawingCheck.checked)
        clear();

    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');
    var funcCxt = funcCanvas.getContext('2d');
    funcCxt.strokeStyle = '#000000';
    funcCxt.strokeStyle = '#000000';
    setTransform([topCxt, bottomCxt, funcCxt]);

    funcCxt.moveTo(locArray[0][0], locArray[0][1]);
    for (var i = 1; i < locArray.length; i++)
        funcCxt.lineTo(locArray[i][0], locArray[i][1]);
    funcCxt.stroke();

    var initialSigns = getSign(document.getElementById('c0'));
    var ruler = new Ruler(new Circle(locArray[0][2] + initialSigns * locArray[0][0],
        locArray[0][3] + initialSigns * locArray[0][1], radius * scale), getDotArray());
    ruler.showSkeleton = true;
    ruler.reverse = reverseDirectionCheck.checked;
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
    ruler.reverse = reverseDirectionCheck.checked;

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
    cuspPoints = [];
    //var totalSteps = Math.round((t2 - t1) / step);
    //var arcLengthInt = nerdamer('defint(sqrt((' + dx.text() + ')^2 + (' + dy.text() + ')^2), ' + t1 + ', t2, t)');

    var locations = [];
    var newCutPoints = [];

    var exps = buildNecessaryExpressions(xExp, yExp);
    var dx = exps[0];
    var dy = exps[1];
    var arcLengthExp = exps[2];
    var curvature = exps[3];

    xExp = xExp.buildFunction(['t']);
    yExp = yExp.buildFunction(['t']);

    var lastNormal = 0;
    var arcLength = 0;
    var previousArcLength = arcLength;
    var previousLower = t1;

    // longer slice length will result in better accuracy of numerical integration
    var sliceLength = 256;
    var sliceUpper = sliceLength - 1;
    var cuspThreshold = 0.1;
    var maxError = 0.0001;
    for (var t = t1, counter = 0, idx = 0; t < t2; t += step, counter++, idx++) {
        var x = xExp(t);
        var y = yExp(t);

        var dyE = dy(t), dxE = dx(t);

        var sliceIdx = counter % sliceLength;
        arcLength = previousArcLength + integrate(arcLengthExp, previousLower, t, sliceIdx * 2 + 5);
        if (sliceIdx === sliceUpper) {
            previousLower = t;
            previousArcLength = arcLength;
        }
        var rotAngle = arcLength / radius;
        var cuspSteps = 0;
        //console.log(idx);
        if (dyE === 0) {
            locations[idx] = [x * scale, y * scale, 0, radius * scale, rotAngle, t, 1 / curvature(t)];
        }
        else {
            var normal = -dxE / dyE;

            // now we have a cut point
            if (Math.sign(normal) * Math.sign(lastNormal) === -1 && Math.abs(normal - lastNormal) < 0.5)
                newCutPoints.push(t - step);

            // if (Math.abs(dyE) < cuspThreshold && Math.abs(dxE) < cuspThreshold) {
            //     //console.log('cusp!' + t);
            //     var z1 = findZero(dx, exps[4], t, maxError);
            //     var z2 = findZero(dy, exps[5], t, maxError);
            //     if (!isNaN(z1) && !isNaN(z2) && Math.abs(z1 - z2) < maxError * 10) {
            //         //console.log("Zero: " + z1);
            //         var currentCusp = cuspPoints.length === 0 ? undefined : cuspPoints[cuspPoints.length - 1];
            //         if (cuspPoints.length === 0 || Math.abs(z1 - cuspPoints[cuspPoints.length - 1]) > maxError * 10)
            //             cuspPoints.push(z1);
            //
            //         if (Math.abs(t - currentCusp) < step && Math.sign(t - currentCusp) === -1) {
            //             var rcv = 1 / curvature(currentCusp);
            //             var cuspX = xExp(currentCusp), cuspY = yExp(currentCusp);
            //             var nextNormal = -dx(t + step) / dy(t + step);
            //             var currentRadian = Math.atan(normal);
            //             var targetRadian = Math.atan(nextNormal);
            //             console.log(currentRadian);
            //             console.log(targetRadian);
            //             var radians = targetRadian - currentRadian;
            //             console.log("!!!");
            //             idx++;
            //             for (var i = 0; i < radians; i += step, idx++, cuspSteps++) {
            //                 locations[idx] = [cuspX * scale, cuspY * scale, radius * Math.cos(i + currentRadian) * scale,
            //                     radius * Math.sin(i + currentRadian) * scale, rotAngle + i, currentCusp, rcv];
            //             }
            //             idx--;
            //         }
            //     }
            //
            // }
            lastNormal = normal;

            var delX = radius * Math.sign(normal) / Math.sqrt(normal * normal + 1);
            var delY = delX * normal;
            if (cuspSteps === 0)
                locations[idx] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 1 / curvature(t)];
            else
                locations[idx - cuspSteps] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 1 / curvature(t)];
        }
    }
    newCutPoints.push(t2);
    var g = document.getElementById('sign-adjust');
    var signElements = new Array(newCutPoints.length);
    if (newCutPoints.length === cutPoints.length) {
        for (var i = 0; i < newCutPoints.length; i++) {
            var oldElement = document.getElementById('c' + i);
            signElements[i] = createSignElement(i, oldElement.innerHTML[oldElement.innerHTML.length - 1],
                ((i - 1) < 0 ? t1 : newCutPoints[i - 1]), newCutPoints[i]);
        }
    } else {
        for (var i = 0; i < newCutPoints.length; i++)
            signElements[i] = createSignElement(i, '+', ((i - 1) < 0 ? t1 : newCutPoints[i - 1]), newCutPoints[i]);
    }
    g.innerHTML = '';
    for (var i = 0; i < newCutPoints.length; i++)
        g.appendChild(signElements[i]);

    cutPoints = newCutPoints;
    $('[data-toggle="tooltip"]').tooltip();
    console.log(arcLength);
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
    for (var i = 0; i < 20; i++) {
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
    e.className = 'btn btn-secondary btn-sm';
    e.innerHTML = upper.toFixed(2) + sign;
    e.setAttribute('data-toggle', 'tooltip');
    e.title = 'Change the sign between ' + lower.toFixed(3) + ' and ' + upper.toFixed(3);
    e.onclick = function (ev) {
        var ih = ev.target.innerHTML;
        var sign = ih[ih.length - 1];
        if (sign === '+')
            ev.target.innerHTML = ih.substring(0, ih.length - 1) + '-';
        else
            ev.target.innerHTML = ih.substring(0, ih.length - 1) + '+';
        saveConfigToBrowser();
    };
    return e;
}

function generateRadius() {
    var multiple = +radiusMultipleParam.value;
    var exps = buildNecessaryExpressions(nerdamer(xParam.value), nerdamer(yParam.value));
    var t1 = +t1Param.value, t2 = +t2Param.value;
    var arcLength = integrate(exps[2], t1, t2, Math.round((t2 - t1) / (+drawingStepParam.value)) + 10);
    console.log(arcLength);
    circleParam.value = (arcLength / multiple / TwoPI);
}

/**
 * @param {Ruler} ruler
 * @param {Number} drawingInterval
 * @param {Function} callback
 * */
function draw(ruler, drawingInterval, callback) {
    if (locArray.length < 1)
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
    var epsilon = 0.0001;
    progressbar.width('0%');

    var se = document.getElementById('c0');
    var sign = se === undefined ? 1 : getSign(se);
    for (var i = 0, delay = 0, counter = 0, cut = 0; i < locArray.length; i++, delay += drawingInterval, counter++) {
        if (cut < cutPoints.length) {
            if ((locArray[i][5] - cutPoints[cut]) > epsilon)
                sign = getSign(document.getElementById('c' + ++cut));
        }
        currentJobs.push((function (i, delay, counter, sign) {
                return setTimeout(function () {
                    if (!flag.stop) {
                        ruler.erase(bottomCxt);
                        ruler.moveTo(locArray[i][0] + sign * locArray[i][2], locArray[i][1] + sign * locArray[i][3]);
                        ruler.angle = locArray[i][4];
                        ruler.draw(topCxt, bottomCxt);

                        if (counter % 10 === 0) {
                            var progress = i / locArray.length * 100;
                            progressbar.width(progress + '%');
                            progressLabel.text(lan['Drawing: '] + 't = ' + locArray[i][5].toFixed(3) +
                                ', rcv = ' + locArray[i][6].toFixed(2) + ', ' + progress.toFixed(1) + '%');
                        }
                    }
                }, delay);
            }
        )(i, delay, counter, sign));
    }
    currentJobs.push((function (delay) {
            return setTimeout(function () {
                progressbar.width('100%');
                progressLabel.text(lan['Drawing: Finished']);
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

    this.rotCorrection = false;
    this.reverse = false;

    this.calculateRotation = function (i) {
        return (this.reverse ^ this.rotCorrection) ?
            this.angle + this.dots[i].rotOffset : TwoPI - (this.angle + this.dots[i].rotOffset) % TwoPI
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
            topCxt.arc(dotPos[0], dotPos[1], this.dots[i].size, 0, TwoPI);
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
                bottomCxt.arc(this.circle.x, this.circle.y, 2, 0, TwoPI);
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
        cxt.arc(this.x, this.y, this.radius, 0, TwoPI);
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