$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
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

var dotSizeMinParam = document.getElementById('dotSizeMin');
var dotSizeMaxParam = document.getElementById('dotSizeMax');
var dotDistanceMinParam = document.getElementById('dotDistanceMin');
var dotDistanceMaxParam = document.getElementById('dotDistanceMax');
var dotRotMinParam = document.getElementById('dotRotMin');
var dotRotMaxParam = document.getElementById('dotRotMax');

var mDotSize = document.getElementById('m-dotSize');
var mDotColor = document.getElementById('m-dotColor');
var mDotDistance = document.getElementById('m-dotDistance');
var mDotRot = document.getElementById('m-dotRot');
var mDotID = document.getElementById('m-dotID');

var gifSizeParam = document.getElementById('f-size');
var gifIntervalParam = document.getElementById('f-interval');
var gifTransparentCheck = document.getElementById('f-transparent');
var gifBgColorParam = document.getElementById('f-bgcolor');
var gifFrameDelayParam = document.getElementById('f-delay');
var gifQualityParam = document.getElementById('f-quality');
var gifLastFrameDelayParam = document.getElementById('f-lastdelay');

var pngWidthParam = document.getElementById('p-width');
var pngHeightParam = document.getElementById('p-height');
var pngTransparentCheck = document.getElementById('p-transparent');
var pngBgColorParam = document.getElementById('p-bgcolor');

var dots = {};
var flag = {stop: false};
var currentJobs = [];

var locArray = [];
var cutPoints = [];

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
                locArray = [];
                disableDrawing();
            };
        })(i, effectors[i].onchange);
    }
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

function addDot() {
    var dotSize = +$('#dotSize').val();
    var dotColor = $('#dotColor').val();
    var dotDist = +$('#dotDistance').val();
    var dotRot = +$('#dotRotOffset').val();

    // var dotDistCap = +innerCircleParam.value;
    // if (dotDist > dotDistCap)
    //     alert('Dot distance should be no greater than the inner circle radius');
    // else
    addDotHelper((new Date()).valueOf().toString(), dotSize, dotColor, dotDist, dotRot, true);
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
    // var dotDistCap = +innerCircleParam.value;
    var randDotDistMax = +dotDistanceMaxParam.value;

    var dotSize = randInt(+dotSizeMinParam.value, +dotSizeMaxParam.value);
    var dotColor = '#' + (Math.floor(Math.random() * 256 * 256 * 256)).toString(16);
    var dotDist = randInt(+dotDistanceMinParam.value, randDotDistMax); //> dotDistCap ? dotDistCap : randDotDistMax);
    var dotRot = randInt(+dotRotMinParam.value, +dotRotMaxParam.value);
    addDotHelper((new Date()).valueOf().toString(), dotSize, dotColor, dotDist, dotRot, true);
}

function addDotHelper(currentTime, dotSize, dotColor, dotDist, dotRot, save) {
    dots[currentTime] = new Dot(dotSize, dotColor, dotDist, dotRot);
    $('#settings').append("<tr id=\"" + currentTime + "\">" +
        "                    <td onclick='preModify(this)' data-toggle=\"modal\" data-target=\"#DotModalCenter\">Distance: " + dotDist + "&nbsp;&nbsp;Color:" +
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
    mDotDistance.value = dot.distance;
    mDotRot.value = Math.round(dot.rotOffset / Math.PI * 180);
    mDotID.value = td.parentNode.id;
}

function postModify() {
    var dot = dots[mDotID.value];
    var dotSize = +mDotSize.value;
    var dotColor = mDotColor.value;
    var dotDist = +mDotDistance.value;
    var dotRot = +mDotRot.value;
    var tr = document.getElementById(mDotID.value);
    tr.cells[0].innerHTML = "Distance: " + dotDist + "&nbsp;&nbsp;Color:" +
        "                        <span style=\"width: 15px; height: 15px; background-color: " + dotColor + ";display: inline-block\"></span><br/>" +
        "                        Size: " + dotSize + "&nbsp;&nbsp;Rotation: " + dotRot + "°";
    dot.size = dotSize;
    dot.color = dotColor;
    dot.distance = dotDist;
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

function adjustDotDistanceCap() {
    var newCap = (+circleParam.value) * (+scaleParam.value);
    // var oldCap = +dotDistanceMaxParam.max;
    dotDistanceMaxParam.max = newCap;
    var oldValue = +dotDistanceMaxParam.value;
    if (oldValue > newCap)
        dotDistanceMaxParam.value = newCap;
}

function saveConfigToBrowser() {
    localStorage.setItem('cache', getConfigJSON());
}

function getConfigJSON() {
    var isLocValid = locArray.length > 0 && locArray[0].length === 6;
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

        dots: dots,

        dotSizeMin: +dotSizeMinParam.value,
        dotSizeMax: +dotSizeMaxParam.value,
        dotDistanceMin: +dotDistanceMinParam.value,
        dotDistanceMax: +dotDistanceMaxParam.value,
        dotRotMin: +dotRotMinParam.value,
        dotRotMax: +dotRotMaxParam.value,

        frameSize: +gifSizeParam.value,
        frameDelay: +gifFrameDelayParam.value,
        frameTransparent: gifTransparentCheck.checked,
        frameBgColor: gifBgColorParam.value,
        frameQuality: +gifQualityParam.value,
        frameInterval: +gifIntervalParam.value,
        lastFrameDelay: +gifLastFrameDelayParam.value,

        pngWidth: +pngWidthParam.value,
        pngHeight: +pngHeightParam.value,
        pngTransparent: pngTransparentCheck.checked,
        pngBgColor: pngBgColorParam.value,

        locArray: isLocValid ? locArray.map(function (value) {
            return value.map(function (v) {
                return +(v.toFixed(3))
            })
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

        dots = obj.dots;

        dotSizeMinParam.value = obj.dotSizeMin === undefined ? 1 : obj.dotSizeMin;
        dotSizeMaxParam.value = obj.dotSizeMax === undefined ? 5 : obj.dotSizeMax;
        dotDistanceMinParam.value = obj.dotDistanceMin === undefined ? 0 : obj.dotDistanceMin;
        dotDistanceMaxParam.value = obj.dotDistanceMax === undefined ? 120 : obj.dotDistanceMax;
        dotRotMinParam.value = obj.dotRotMin === undefined ? 0 : obj.dotRotMin;
        dotRotMaxParam.value = obj.dotRotMax === undefined ? 360 : obj.dotRotMax;

        gifSizeParam.value = obj.frameSize === undefined ? 320 : obj.frameSize;
        gifFrameDelayParam.value = obj.frameDelay === undefined ? 25 : obj.frameDelay;
        gifTransparentCheck.checked = obj.frameTransparent === undefined ? false : obj.frameTransparent;
        gifBgColorParam.value = obj.frameBgColor === undefined ? '#FFFFFF' : obj.frameBgColor;

        if (gifTransparentCheck.checked)
            gifBgColorParam.disabled = true;

        gifQualityParam.value = obj.frameQuality === undefined ? 10 : obj.frameQuality;
        gifIntervalParam.value = obj.frameInterval === undefined ? 40 : obj.frameInterval;
        gifLastFrameDelayParam.value = obj.lastFrameDelay === undefined ? 1000 : obj.lastFrameDelay;

        pngWidthParam.value = obj.pngWidth === undefined ? 640 : obj.pngWidth;
        pngHeightParam.value = obj.pngHeight === undefined ? 640 : obj.pngHeight;
        pngTransparentCheck.checked = obj.pngTransparent === undefined ? false : obj.pngTransparent;
        pngBgColorParam.value = obj.pngBgColor === undefined ? '#FFFFFF' : obj.pngBgColor;

        if (pngTransparentCheck.checked)
            pngBgColorParam.disabled = true;

        for (var key in dots) {
            addDotHelper(key, dots[key].size, dots[key].color, dots[key].distance, Math.round(180 * dots[key].rotOffset / Math.PI), false);
        }

        if (obj.locArray !== undefined) {
            locArray = obj.locArray;
            cutPoints = obj.cutPoints;
            var g = document.getElementById('sign-adjust');
            g.innerHTML = '';
            var counter = 0;
            for (var i = 0; i < cutPoints.length; i++) {
                var e = document.createElement('button');
                e.id = 'c' + counter;
                e.type = 'button';
                e.className = 'btn btn-secondary btn-sm';
                e.innerHTML = cutPoints[i].toFixed(2) + (obj.cutPointSigns[i] === 1 ? '+' : '-');
                g.appendChild(e);

                e.onclick = function (ev) {
                    var ih = ev.target.innerHTML;
                    var sign = ih[ih.length - 1];
                    if (sign === '+')
                        ev.target.innerHTML = ih.substring(0, ih.length - 1) + '-';
                    else
                        ev.target.innerHTML = ih.substring(0, ih.length - 1) + '+';
                    saveConfigToBrowser();
                };
                counter++;
            }
            var topCxt = topCanvas.getContext('2d');
            var bottomCxt = bottomCanvas.getContext('2d');
            var funcCxt = funcCanvas.getContext('2d');
            funcCxt.strokeStyle = '#000000';
            setTransform([topCxt, bottomCxt, funcCxt]);

            funcCxt.moveTo(locArray[0][0], locArray[0][1]);
            for (i = 1; i < locArray.length; i++)
                funcCxt.lineTo(locArray[i][0], locArray[i][1]);
            funcCxt.stroke();

            var ruler = new Ruler(new Circle(locArray[0][2] + locArray[0][0], locArray[0][3] + locArray[0][1], +circleParam.value * +scaleParam.value), getDotArray());
            ruler.showSkeleton = true;
            ruler.reverse = reverseDirectionCheck.checked;
            ruler.draw(topCxt, bottomCxt);

            enableDrawing();
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

// /**
//  * @return Array
//  * */
// function getRealBounds() {
//     var maxDotDist = 0;
//     var maxDot = null;
//     for (var key in dots) {
//         var dotDist = Math.abs(dots[key].distance);
//         if (dotDist > maxDotDist) {
//             maxDot = dots[key];
//             maxDotDist = dotDist;
//         }
//     }
//     var radius = +circleParam.value * +scaleParam.value;
//     var minX = Infinity, maxX = -Infinity;
//     var minY = Infinity, maxY = -Infinity;
//     for (var i = 0; i < locArray.length; i++) {
//         if (locArray[i][0] < minX)
//             minX = locArray[i][0];
//         if (locArray[i][0] > maxX)
//             maxX = locArray[i][0];
//         if (locArray[i][1] < minY)
//             minY = locArray[i][1];
//         if (locArray[i][1] > maxY)
//             maxY = locArray[i][1];
//     }
//     return [minX - maxDotDist * 2, maxX + maxDotDist * 2, minY - maxDotDist * 2, maxY + maxDotDist * 2];
// }

// /**
//  * @param {Number} realSize
//  * @return Number
//  * */
// function getTranslation(realSize) {
//     return realSize / 2 - topCanvas.width / 2;
// }

function saveToPNG() {
    var circleRadius = +circleParam.value;

    var ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;
    ruler.reverse = reverseDirectionCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(ruler, +drawingDelayParam.value, function () {
        var pngWidth = +pngWidthParam.value;
        var pngHeight = +pngHeightParam.value;
        var transparent = pngTransparentCheck.checked;
        var bgColor = pngBgColorParam.value;

        tempCanvas.width = pngWidth;
        tempCanvas.height = pngHeight;
        var tempCxt = tempCanvas.getContext('2d');

        if (!transparent) {
            tempCxt.fillStyle = bgColor;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        }

        tempCxt.scale(pngWidth / topCanvas.width, pngHeight / topCanvas.height);
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
    var gif = new GIF({
        workers: 4,
        quality: +gifQualityParam.value,
        workerScript: './gif.worker.js',
        width: frameSize,
        height: frameSize
    });

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
    tempCanvas.height = frameSize;


    if (!transparent) {
        tempCxt.fillStyle = gifBgColorParam.value;
        tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    // var realPatternSize = getRealSize(), translation = getTranslation(realPatternSize);
    tempCxt.scale(frameSize / topCanvas.width, frameSize / topCanvas.height);
    // funcCxt.translate(translation, translation);

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

    var se = document.getElementById('c0');

    var drawingInterval = +drawingDelayParam.value;
    var sign = se === undefined ? 1 : getSign(se);
    for (var i = 0, delay = 0, counter = 0, cut = 0; i < locArray.length; i++, delay += drawingInterval, counter++) {
        if (cut < cutPoints.length) {
            if ((locArray[i][5] - cutPoints[cut]) > 0.000001) {
                cut++;
                sign = getSign(document.getElementById('c' + cut));
            }
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
                            progressLabel.text(lan['Drawing: '] + 't = ' + locArray[i][5].toFixed(2) + ', ' + progress.toFixed(1) + '%');
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

function previewRuler() {
    stopDrawing();
    var radius = +circleParam.value;
    var scale = +scaleParam.value;
    locArray = calculateLocations(+t1Param.value, +t2Param.value, nerdamer(xParam.value), nerdamer(yParam.value), +drawingStepParam.value, radius, scale);

    if (clearBeforeDrawingCheck.checked)
        clear();

    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');
    var funcCxt = funcCanvas.getContext('2d');
    funcCxt.strokeStyle = '#000000';
    setTransform([topCxt, bottomCxt, funcCxt]);

    funcCxt.moveTo(locArray[0][0], locArray[0][1]);
    for (var i = 1; i < locArray.length; i++)
        funcCxt.lineTo(locArray[i][0], locArray[i][1]);
    funcCxt.stroke();

    var ruler = new Ruler(new Circle(locArray[0][2] + locArray[0][0], locArray[0][3] + locArray[0][1], radius * scale), getDotArray());
    ruler.showSkeleton = true;
    ruler.reverse = reverseDirectionCheck.checked;
    ruler.draw(topCxt, bottomCxt);
    enableDrawing();
    saveConfigToBrowser();
}

function clear() {
    clearTop();
    clearBottom();
    clearFunc();
}

function clearTop() {
    var topCxt = topCanvas.getContext('2d');
    topCanvas.height++;
    topCanvas.height--;
}

function clearBottom() {
    var bottomCxt = bottomCanvas.getContext('2d');
    bottomCanvas.height++;
    bottomCanvas.height--;
}

function clearFunc() {
    var cxt = funcCanvas.getContext('2d');
    funcCanvas.height = funcCanvas.height;
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

    var arcLengthExp = nerdamer('sqrt((' + dx.text() + ')^2 + (' + dy.text() + ')^2)');
    return [dx.buildFunction(['t']), dy.buildFunction(['t']), arcLengthExp.buildFunction(['t'])];
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
    var totalSteps = Math.round((t2 - t1) / step);
    //var arcLengthInt = nerdamer('defint(sqrt((' + dx.text() + ')^2 + (' + dy.text() + ')^2), ' + t1 + ', t2, t)');

    var locations = new Array(totalSteps);
    cutPoints = [];

    var exps = buildNecessaryExpressions(xExp, yExp);
    var dx = exps[0];
    var dy = exps[1];
    var arcLengthExp = exps[2];

    xExp = xExp.buildFunction(['t']);
    yExp = yExp.buildFunction(['t']);

    var lastNormal = 0;
    var previousLower = t1;
    var previousArcLength = 0;

    for (var t = t1, counter = 0; t < t2; t += step, counter++) {
        var normal = -dx(t) / dy(t);

        if (Math.sign(normal) * Math.sign(lastNormal) === -1 && Math.abs(normal - lastNormal) < 1)
            cutPoints.push(t - step);

        lastNormal = normal;
        var arcLength = integrate(arcLengthExp, t1, t, counter + 10);

        var x = xExp(t);
        var y = yExp(t);
        var delX = radius * Math.sign(normal) * (Math.cos(Math.atan(normal))); //Math.sqrt(radius * radius / (normal * normal + 1));//
        var delY = delX * normal;

        var rotAngle = arcLength / radius;
        locations[counter] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t];
    }
    cutPoints.push(t2);
    var g = document.getElementById('sign-adjust');
    g.innerHTML = '';
    var handler = function (ev) {
        var ih = ev.target.innerHTML;
        var sign = ih[ih.length - 1];
        if (sign === '+')
            ev.target.innerHTML = ih.substring(0, ih.length - 1) + '-';
        else
            ev.target.innerHTML = ih.substring(0, ih.length - 1) + '+';
        saveConfigToBrowser();
    };
    for (var i in cutPoints) {
        var e = document.createElement('button');
        e.id = 'c' + i;
        e.type = 'button';
        e.className = 'btn btn-secondary btn-sm';
        e.innerHTML = cutPoints[i].toFixed(2) + '+';
        g.appendChild(e);
        e.onclick = handler;
    }
    return locations;
}

function generateRadius() {
    var multiple = +document.getElementById('radiusMultiple').value;
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
    progressbar.width('0%');

    var se = document.getElementById('c0');
    var getSign = function (element) {
        if (element === null || element === undefined) return 1;
        var x = element.innerHTML[element.innerHTML.length - 1];
        return x === '+' ? 1 : -1;
    };
    var sign = se === undefined ? 1 : getSign(se);
    for (var i = 0, delay = 0, counter = 0, cut = 0; i < locArray.length; i++, delay += drawingInterval, counter++) {
        if (cut < cutPoints.length) {
            if ((locArray[i][5] - cutPoints[cut]) > 0) {
                cut++;
                sign = getSign(document.getElementById('c' + cut));
            }
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
                            progressLabel.text(lan['Drawing: '] + 't = ' + locArray[i][5].toFixed(2) + ', ' + progress.toFixed(1) + '%');
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
    sum += f(b);
    sum *= 0.5 * step;
    return sum;
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
        return (this.reverse ^ this.rotCorrection) ? this.angle + this.dots[i].rotOffset : TwoPI - (this.angle + this.dots[i].rotOffset) % TwoPI
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
            var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].distance, this.calculateRotation(i));
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
                var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].distance, this.calculateRotation(i));
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
                var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].distance, this.calculateRotation(i));
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
 * @param {Number} distance
 * @param {Number} rotOffset
 * */
function Dot(size, color, distance, rotOffset) {
    this.size = size;
    this.color = color;
    this.distance = distance;
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