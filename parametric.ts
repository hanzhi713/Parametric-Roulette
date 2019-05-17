/// <reference path="node_modules/nerdamer/index.d.ts"/>
/// <reference path="node_modules/@types/file-saver/index.d.ts"/>

if (typeof Math.sign !== "function") {
    Math.sign = x => {
        return x === 0 ? 0 : x > 0 ? 1 : -1;
    };
}

const topCanvas = document.getElementById("canvas-top") as HTMLCanvasElement;
const bottomCanvas = document.getElementById("canvas-bottom") as HTMLCanvasElement;
const funcCanvas = document.getElementById("canvas-func") as HTMLCanvasElement;
const tempCanvas = document.getElementById("canvas-temp") as HTMLCanvasElement;
const xParam = document.getElementById("x=") as HTMLInputElement;
const yParam = document.getElementById("y=") as HTMLInputElement;
const t1Param = document.getElementById("t1") as HTMLInputElement;
const t2Param = document.getElementById("t2") as HTMLInputElement;
const dxParam = document.getElementById("dx") as HTMLInputElement;
const dyParam = document.getElementById("dy") as HTMLInputElement;
const scaleParam = document.getElementById("scale") as HTMLInputElement;
const circleParam = document.getElementById("circleRadius") as HTMLInputElement;
const clearBeforeDrawingCheck = document.getElementById("clearBeforeDrawing") as HTMLInputElement;
const drawingStepParam = document.getElementById("step") as HTMLInputElement;
const drawingDelayParam = document.getElementById("delay") as HTMLInputElement;
const skeletonCheck = document.getElementById("showSk") as HTMLInputElement;
const functionCheck = document.getElementById("showFunc") as HTMLInputElement;
const revolve = document.getElementById("revolve") as HTMLInputElement;

const radiusMultipleParam = document.getElementById("radiusMultiple") as HTMLInputElement;

const dotSizeMinParam = document.getElementById("dotSizeMin") as HTMLInputElement;
const dotSizeMaxParam = document.getElementById("dotSizeMax") as HTMLInputElement;
const dotRatioMinParam = document.getElementById("dotRatioMin") as HTMLInputElement;
const dotRatioMaxParam = document.getElementById("dotRatioMax") as HTMLInputElement;
const dotRotMinParam = document.getElementById("dotRotMin") as HTMLInputElement;
const dotRotMaxParam = document.getElementById("dotRotMax") as HTMLInputElement;

const mDotSize = document.getElementById("m-dotSize") as HTMLInputElement;
const mDotColor = document.getElementById("m-dotColor") as HTMLInputElement;
const mDotRatio = document.getElementById("m-dotRatio") as HTMLInputElement;
const mDotRot = document.getElementById("m-dotRot") as HTMLInputElement;
const mDotID = document.getElementById("m-dotID") as HTMLInputElement;

const gifSizeParam = document.getElementById("f-size") as HTMLInputElement;
const gifIntervalParam = document.getElementById("f-interval") as HTMLInputElement;
const gifCropCheck = document.getElementById("f-crop") as HTMLInputElement;
const gifTransparentCheck = document.getElementById("f-transparent") as HTMLInputElement;
const gifBgColorParam = document.getElementById("f-bgcolor") as HTMLInputElement;
const gifFrameDelayParam = document.getElementById("f-delay") as HTMLInputElement;
const gifQualityParam = document.getElementById("f-quality") as HTMLInputElement;
const gifLastFrameDelayParam = document.getElementById("f-lastdelay") as HTMLInputElement;

const pngWidthParam = document.getElementById("p-width") as HTMLInputElement;
const pngCropCheck = document.getElementById("p-crop") as HTMLInputElement;
const pngTransparentCheck = document.getElementById("p-transparent") as HTMLInputElement;
const pngBgColorParam = document.getElementById("p-bgcolor") as HTMLInputElement;

const drawButton = document.getElementById("draw") as HTMLButtonElement;

const flag = { stop: false };

let currentJobs: number[] = [];
let dots: { [x: string]: Dot } = {};
let locArray: number[][] = [];
let cutPoints: number[] = [];
let cuspPoints: number[] = [];

window.onload = ev => {
    parseConfigJSON(localStorage.getItem("cache"));

    window.onchange = e => {
        saveConfigToBrowser();
    };

    // parameters that determine the loci. Recalculation of loci is required if they're changed
    let effectors = [dxParam, dyParam, scaleParam, circleParam, drawingStepParam];
    for (const i in effectors) {
        const existingOnchangeHandler = effectors[i].onchange as any;
        effectors[i].onchange = e => {
            if (typeof existingOnchangeHandler === "function") existingOnchangeHandler(e);
            stopDrawing();
            disableDrawing();
            locArray = [];
        };
    }

    // changing these things also requires a reset of cut points
    effectors = [xParam, yParam, t1Param, t2Param];
    for (const i in effectors) {
        const existingOnchangeHandler = effectors[i].onchange as any;
        effectors[i].onchange = e => {
            if (typeof existingOnchangeHandler === "function") existingOnchangeHandler(e);
            stopDrawing();
            disableDrawing();
            locArray = [];
            cutPoints = [];
            cuspPoints = [];
            document.getElementById("sign-adjust").innerHTML = "";
            document.getElementById("rot-adjust").innerHTML = "";
        };
    }
    $('[data-toggle="tooltip"]').tooltip();
};

function disableDrawing() {
    drawButton.disabled = true;
    const m = document.getElementById("savepng"),
        n = document.getElementById("savegif");
    m.className = "dropdown-item disabled";
    n.className = "dropdown-item disabled";
    m.style.color = "#6c757d";
    n.style.color = "#6c757d";
    m.setAttribute("data-target", "#");
    n.setAttribute("data-target", "#");
}

function enableDrawing() {
    drawButton.disabled = false;
    const m = document.getElementById("savepng"),
        n = document.getElementById("savegif");
    m.className = "dropdown-item";
    n.className = "dropdown-item";
    m.style.color = "#000";
    n.style.color = "#000";
    m.setAttribute("data-target", "#PNGModalCenter");
    n.setAttribute("data-target", "#GIFModalCenter");
}

function removeDot(id: number) {
    delete dots[id];
    $("#" + id).hide(200, () => {
        $("#" + id).remove();
    });
    saveConfigToBrowser();
}

function removeAllDots() {
    for (const id in dots) {
        $("#" + id).remove();
    }
    dots = {};
}

function addDot() {
    const dotSize = +$("#dotSize").val();
    const dotColor = $("#dotColor").val() as string;
    const dotRatio = +$("#dotRatio").val();
    const dotRot = +$("#dotRotOffset").val();

    addDotHelper(new Date().valueOf().toString(), dotSize, dotColor, dotRatio, dotRot, true);
}

/**
 * return a random integer in [min, max]
 */
function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor() {
    const R = randInt(0, 255);
    const G = randInt(0, 255);
    const B = randInt(0, 255);
    return (
        "#" +
        (R < 16 ? "0" + R.toString(16) : R.toString(16)) +
        (G < 16 ? "0" + G.toString(16) : G.toString(16)) +
        (B < 16 ? "0" + B.toString(16) : B.toString(16))
    );
}

function randomDot() {
    const dotSize = randInt(+dotSizeMinParam.value, +dotSizeMaxParam.value);
    const dotColor = randomColor();
    const dotRatio = randInt(+dotRatioMinParam.value, +dotRatioMaxParam.value);
    const dotRot = randInt(+dotRotMinParam.value, +dotRotMaxParam.value);
    addDotHelper(new Date().valueOf().toString(), dotSize, dotColor, dotRatio, dotRot, true);
}

function addDotHelper(
    currentTime: string,
    dotSize: number,
    dotColor: string,
    dotRatio: number,
    dotRot: number,
    save: boolean
) {
    dots[currentTime] = new Dot(dotSize, dotColor, dotRatio, dotRot);
    $("#settings").append(
        '<tr id="' +
            currentTime +
            '">' +
            '<td onclick=\'preModify(this)\' data-toggle="modal" data-target="#DotModalCenter">Ratio: ' +
            dotRatio +
            "%&nbsp;&nbsp;Color:" +
            '<span style="width: 15px; height: 15px; background-color: ' +
            dotColor +
            ';display: inline-block"></span><br/>' +
            "                        Size: " +
            dotSize +
            "&nbsp;&nbsp;Rotation: " +
            dotRot +
            "°" +
            "                    </td>" +
            "<th width='50px'>" +
            '<button type="button" class="close" aria-label="Close" onclick="removeDot(\'' +
            currentTime +
            "')\">" +
            '                            <span aria-hidden="true">&times;</span>' +
            "                        </button>" +
            "                    </th>" +
            "                </tr>"
    );
    if (save) saveConfigToBrowser();
}

function preModify(td: HTMLTableCellElement) {
    const dot = dots[(td.parentNode as HTMLElement).id];
    mDotSize.value = dot.size.toString();
    mDotColor.value = dot.color;
    mDotRatio.value = dot.ratio.toString();
    mDotRot.value = Math.round((dot.rotOffset / Math.PI) * 180).toString();
    mDotID.value = (td.parentNode as HTMLElement).id;
}

function postModify() {
    const dot = dots[mDotID.value];
    const dotSize = +mDotSize.value;
    const dotColor = mDotColor.value;
    const dotRatio = +mDotRatio.value;
    const dotRot = +mDotRot.value;
    const tr = document.getElementById(mDotID.value) as HTMLTableRowElement;
    tr.cells[0].innerHTML =
        "Ratio: " +
        dotRatio +
        "%&nbsp;&nbsp;Color:" +
        '                        <span style="width: 15px; height: 15px; background-color: ' +
        dotColor +
        ';display: inline-block"></span><br/>' +
        "                        Size: " +
        dotSize +
        "&nbsp;&nbsp;Rotation: " +
        dotRot +
        "°";
    dot.size = dotSize;
    dot.color = dotColor;
    dot.ratio = dotRatio;
    dot.rotOffset = (dotRot / 180) * Math.PI;
    saveConfigToBrowser();
}

function stopDrawing() {
    flag.stop = true;
    for (let i = 0; i < currentJobs.length; i++) clearTimeout(currentJobs[i]);
    currentJobs = [];
}

function adjustDotRatioCap() {}

function saveConfigToBrowser() {
    localStorage.setItem("cache", getConfigJSON());
}

function getConfigJSON() {
    const isLocValid = locArray.length > 0 && locArray[0].length >= 6;
    const cutPointSigns = new Array(cutPoints.length),
        cuspPointSigns = new Array(cuspPoints.length);
    if (isLocValid) {
        for (let i = 0; i < cutPoints.length; i++) cutPointSigns[i] = getSign(document.getElementById("c" + i));

        for (let i = 0; i < cuspPoints.length; i++) cuspPointSigns[i] = getSign(document.getElementById("r" + i));
    }
    const config = {
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

        dots,

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

        locArray: isLocValid
            ? locArray.map(value => {
                  return [
                      value[0] === null ? NaN : +value[0].toFixed(2),
                      value[1] === null ? NaN : +value[1].toFixed(2),
                      value[2] === null ? NaN : +value[2].toFixed(2),
                      value[3] === null ? NaN : +value[3].toFixed(2),
                      +value[4].toFixed(3),
                      +value[5].toFixed(4),
                      +value[6].toFixed(2)
                  ];
              })
            : undefined,
        cutPoints,
        cutPointSigns: isLocValid ? cutPointSigns : undefined,
        cuspPoints,
        cuspPointSigns: isLocValid ? cuspPointSigns : undefined
    };
    return JSON.stringify(config);
}

function parseConfigJSON(json: string) {
    if (json === "" || json === null) return;
    try {
        const obj = JSON.parse(json);
        circleParam.value = obj.circleRadius === undefined ? 120 : obj.circleRadius;
        xParam.value = obj.xParam === undefined ? "" : obj.xParam;
        yParam.value = obj.yParam === undefined ? "" : obj.yParam;
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
        gifBgColorParam.value = obj.frameBgColor === undefined ? "#FFFFFF" : obj.frameBgColor;

        if (gifTransparentCheck.checked) gifBgColorParam.disabled = true;

        gifQualityParam.value = obj.frameQuality === undefined ? 10 : obj.frameQuality;
        gifIntervalParam.value = obj.frameInterval === undefined ? 40 : obj.frameInterval;
        gifLastFrameDelayParam.value = obj.lastFrameDelay === undefined ? 1000 : obj.lastFrameDelay;

        pngWidthParam.value = obj.pngWidth === undefined ? 640 : obj.pngWidth;
        pngTransparentCheck.checked = obj.pngTransparent === undefined ? false : obj.pngTransparent;
        pngCropCheck.checked = obj.pngCrop === undefined ? false : obj.pngCrop;
        pngBgColorParam.value = obj.pngBgColor === undefined ? "#FFFFFF" : obj.pngBgColor;

        if (pngTransparentCheck.checked) pngBgColorParam.disabled = true;

        removeAllDots();
        dots = obj.dots;

        for (const key in dots) {
            addDotHelper(
                key,
                dots[key].size,
                dots[key].color,
                dots[key].ratio,
                Math.round((180 * dots[key].rotOffset) / Math.PI),
                false
            );
        }

        if (obj.locArray !== undefined) {
            locArray = obj.locArray;
            cutPoints = obj.cutPoints === undefined ? [] : obj.cutPoints;
            cuspPoints = obj.cuspPoints === undefined ? [] : obj.cuspPoints;

            const signRow = document.getElementById("sign-adjust");
            signRow.innerHTML = "";
            for (let i = 0; i < cutPoints.length; i++)
                signRow.appendChild(
                    createSignElement(
                        i,
                        obj.cutPointSigns[i] === 1 ? "+" : "-",
                        i - 1 < 0 ? +t1Param.value : cutPoints[i - 1],
                        cutPoints[i]
                    )
                );

            const rotRow = document.getElementById("rot-adjust");
            rotRow.innerHTML = "";
            for (let i = 0; i < cuspPoints.length; i++)
                rotRow.appendChild(
                    createRotElement(
                        i,
                        obj.cuspPointSigns[i] === 1 ? "+" : "-",
                        i - 1 < 0 ? +t1Param.value : cuspPoints[i - 1],
                        cuspPoints[i]
                    )
                );

            drawPreview(+circleParam.value, +scaleParam.value);
        }
    } catch (e) {
        alert(e);
    }
}

function saveConfig() {
    saveAs(new Blob([getConfigJSON()], { type: "text/plain;charset=utf-8" }), "config.json");
}

function loadConfig(files: Blob[]) {
    if (files.length) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = function() {
            parseConfigJSON(this.result as string);
        };
        reader.readAsText(file);
    }
}

function getRealBounds(canvasBounded: boolean) {
    let maxDotRatio = 0;
    let maxDot = null;
    for (const key in dots) {
        const dotRatio = Math.abs(dots[key].ratio);
        if (dotRatio > maxDotRatio) {
            maxDot = dots[key];
            maxDotRatio = dotRatio;
        }
    }
    const radius = +circleParam.value * +scaleParam.value;
    maxDotRatio = (maxDotRatio / 100) * radius + radius;
    if (maxDotRatio < radius * 2) maxDotRatio = radius * 2;

    let minX = Infinity,
        maxX = -Infinity;
    let minY = Infinity,
        maxY = -Infinity;
    for (let i = 0; i < locArray.length; i++) {
        if (locArray[i][0] < minX) minX = locArray[i][0];
        if (locArray[i][0] > maxX) maxX = locArray[i][0];
        if (locArray[i][1] < minY) minY = locArray[i][1];
        if (locArray[i][1] > maxY) maxY = locArray[i][1];
    }
    minX = minX - maxDotRatio * 2 + +dxParam.value;
    maxX = maxX + maxDotRatio * 2 + +dxParam.value;
    minY = minY - maxDotRatio * 2 + +dyParam.value;
    maxY = maxY + maxDotRatio * 2 + +dyParam.value;
    if (canvasBounded) return [Math.max(-320, minX), Math.min(320, maxX), Math.max(-320, minY), Math.min(320, maxY)];
    else return [minX, maxX, minY, maxY];
}

/**
 * @param {number[]} realBounds
 * @param {number} width
 * @param {boolean} convention Whether follow the CV coordinate system or the conventional Cartesian system
 * @return Array
 */
function getScalingAndTranslation(realBounds: number[], width: number, convention: boolean) {
    const realWidth = realBounds[1] - realBounds[0];
    const realHeight = realBounds[3] - realBounds[2];

    const scaling = convention
        ? Math.min(width / realWidth, width / realHeight)
        : realWidth > realHeight
        ? width / realWidth
        : width / realHeight;
    let height;
    if (realWidth > realHeight) height = (width * realHeight) / realWidth;
    else {
        height = width;
        width = (width * realWidth) / realHeight;
    }

    let wTranslation, hTranslation;
    if (convention) {
        wTranslation = -320 + (640 - realWidth * scaling) / 2 - realBounds[0] * scaling;
        hTranslation = 320 - (640 - realHeight * scaling) / 2 - realBounds[3] * scaling;
        // wTranslation = Math.abs(realBounds[0] * scaling - (640 - realWidth * 2 * scaling));
        // hTranslation = Math.abs(realBounds[3] * scaling - (640 - realHeight * 2 * scaling));
    } else {
        wTranslation = -(realBounds[0] + 320);
        hTranslation = -(320 - realBounds[3]);
    }
    return [height, scaling, wTranslation, hTranslation, width];
}

function autoAdjustScalingAndTranslation() {
    if (locArray.length > 0 && locArray[0].length >= 6) {
        const result = getScalingAndTranslation(getRealBounds(false), 640, true);
        scaleParam.value = (+scaleParam.value * result[1]).toFixed(1);
        dxParam.value = (+dxParam.value + result[2]).toFixed(1);
        dyParam.value = (+dyParam.value + result[3]).toFixed(1);
        previewRuler();
    } else {
        previewRuler();
        autoAdjustScalingAndTranslation();
    }
}

function saveToPNG() {
    const circleRadius = +circleParam.value;

    const ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(ruler, +drawingDelayParam.value, () => {
        const pngWidth = +pngWidthParam.value;
        const transparent = pngTransparentCheck.checked;
        const bgColor = pngBgColorParam.value;

        tempCanvas.width = pngWidth;
        const tempCxt = tempCanvas.getContext("2d");

        if (pngCropCheck.checked) {
            const parameters = getScalingAndTranslation(getRealBounds(true), tempCanvas.width, false);
            tempCanvas.width = parameters[4];
            tempCanvas.height = parameters[0];
            if (!transparent) {
                tempCxt.fillStyle = bgColor;
                tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            tempCxt.scale(parameters[1], parameters[1]);
            tempCxt.translate(parameters[2], parameters[3]);
        } else {
            // noinspection JSSuspiciousNameCombination
            tempCanvas.height = pngWidth;
            if (!transparent) {
                tempCxt.fillStyle = bgColor;
                tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            tempCxt.scale(pngWidth / topCanvas.width, pngWidth / topCanvas.height);
        }

        tempCxt.drawImage(funcCanvas, 0, 0);
        tempCxt.drawImage(bottomCanvas, 0, 0);
        tempCxt.drawImage(topCanvas, 0, 0);

        tempCanvas.toBlob(blob => {
            saveAs(blob, "parametric-roulette.png");
        });
    });
}

/**
 * @param {HTMLElement} element
 */
function getSign(element: HTMLElement) {
    if (element === null || element === undefined) return 1;
    const x = element.innerHTML[element.innerHTML.length - 1];
    return x === "+" ? 1 : -1;
}

function saveToGIF() {
    const _locArray = locArray;
    const _cuspPoints = cuspPoints;
    const _cutPoints = cutPoints;

    const frameSize = +gifSizeParam.value;
    const transparent = gifTransparentCheck.checked;
    const frameInterval = +gifIntervalParam.value;
    const frameDelay = +gifFrameDelayParam.value;
    const drawingInterval = +drawingDelayParam.value;

    const circleRadius = +circleParam.value;

    const ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    stopDrawing();
    flag.stop = false;

    const topCxt = topCanvas.getContext("2d");
    const bottomCxt = bottomCanvas.getContext("2d");
    const funcCxt = funcCanvas.getContext("2d");
    const tempCxt = tempCanvas.getContext("2d");

    tempCanvas.width = frameSize;

    let gif: any;

    if (gifCropCheck.checked) {
        const parameters = getScalingAndTranslation(getRealBounds(true), tempCanvas.width, false);
        tempCanvas.width = parameters[4];
        tempCanvas.height = parameters[0];
        if (!transparent) {
            tempCxt.fillStyle = gifBgColorParam.value;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        tempCxt.scale(parameters[1], parameters[1]);
        tempCxt.translate(parameters[2], parameters[3]);

        gif = new GIF({
            workers: 4,
            quality: +gifQualityParam.value,
            workerScript: "./gif.worker.js",
            width: parameters[4],
            height: parameters[0]
        });
    } else {
        tempCanvas.height = frameSize;
        if (!transparent) {
            tempCxt.fillStyle = gifBgColorParam.value;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        tempCxt.scale(frameSize / topCanvas.width, frameSize / topCanvas.height);
        gif = new GIF({
            workers: 4,
            quality: +gifQualityParam.value,
            workerScript: "./gif.worker.js",
            width: frameSize,
            height: frameSize
        });
    }

    ruler.showSkeleton = skeletonCheck.checked;

    if (clearBeforeDrawingCheck.checked || !ruler.showSkeleton) {
        clearBottom();
        clearTop();
    }

    if (!functionCheck.checked) clearFunc();

    setTransform([topCxt, bottomCxt, funcCxt]);

    const progressLabel = $("#progressLabel");
    const progressbar = $("#progressbar");
    const epsilon = 0.0001;
    progressbar.width("0%");

    let delay = 0;
    for (
        let i = 0,
            counter = 0,
            cut = 0,
            cusp = 0,
            sign = getSign(document.getElementById("c0")),
            rot = getSign(document.getElementById("r0"));
        i < _locArray.length;
        i++, delay += drawingInterval, counter++
    ) {
        let changeRot = i === 0;
        if (cut < _cutPoints.length) {
            if (_locArray[i][5] - _cutPoints[cut] > epsilon) sign = getSign(document.getElementById("c" + ++cut));
        }
        if (cusp < _cuspPoints.length) {
            if (_locArray[i][5] - _cuspPoints[cusp] > epsilon) {
                rot = getSign(document.getElementById("r" + ++cusp));
                changeRot = true;
            }
        }
        currentJobs.push(
            setTimeout(() => {
                if (!flag.stop) {
                    ruler.erase(bottomCxt);
                    if (_locArray[i][6] === 1)
                        ruler.moveTo(_locArray[i][0] + _locArray[i][2], _locArray[i][1] + _locArray[i][3]);
                    else if (_locArray[i][6] !== 2)
                        ruler.moveTo(
                            _locArray[i][0] + sign * _locArray[i][2],
                            _locArray[i][1] + sign * _locArray[i][3]
                        );
                    ruler.angle = _locArray[i][4];
                    if (changeRot) ruler.changeDirection(rot);

                    ruler.draw(topCxt, bottomCxt);

                    if (counter % frameInterval === 0) {
                        if (transparent) tempCxt.clearRect(0, 0, topCanvas.width, topCanvas.height);
                        else tempCxt.fillRect(0, 0, topCanvas.width, topCanvas.height);

                        tempCxt.drawImage(funcCanvas, 0, 0);
                        tempCxt.drawImage(bottomCanvas, 0, 0);
                        tempCxt.drawImage(topCanvas, 0, 0);

                        gif.addFrame(tempCxt, {
                            copy: true,
                            delay: frameDelay
                        });

                        const progress = (i / _locArray.length) * 100;
                        progressbar.width(progress + "%");
                        progressLabel.text(
                            "Drawing: t = " + _locArray[i][5].toFixed(3) + ", " + progress.toFixed(1) + "%"
                        );
                    }
                }
            }, delay)
        );
    }
    currentJobs.push(
        setTimeout(() => {
            if (!flag.stop) {
                if (transparent) tempCxt.clearRect(0, 0, topCanvas.width, topCanvas.height);
                else tempCxt.fillRect(0, 0, topCanvas.width, topCanvas.height);

                tempCxt.drawImage(funcCanvas, 0, 0);
                tempCxt.drawImage(bottomCanvas, 0, 0);
                tempCxt.drawImage(topCanvas, 0, 0);
                gif.addFrame(tempCxt, {
                    copy: true,
                    delay: +gifLastFrameDelayParam.value
                });

                progressbar.width("0%");

                gif.on("progress", (p: number) => {
                    if (Math.abs(1 - p) < 0.0001) {
                        progressbar.width("100%");
                        progressLabel.text("Save as GIF: Finished");
                    } else {
                        p = p * 100;
                        progressbar.width(p + "%");
                        progressLabel.text("Save as GIF: " + p.toFixed(1) + "%");
                    }
                });

                gif.on("finished", (blob: Blob) => {
                    saveAs(blob, "parametric-roulette.gif");
                });

                gif.render();
            }
        }, delay)
    );
}

function getDotArray() {
    const dotArray = [];
    for (const key in dots) dotArray.push(dots[key]);
    return dotArray;
}

function setTransform(cxts: CanvasRenderingContext2D[]) {
    const sx = +dxParam.value;
    const sy = +dyParam.value;
    for (let i = 0; i < cxts.length; i++) cxts[i].setTransform(1, 0, 0, -1, sx + 320, 320 - sy);
}

function drawPreview(radius: number, scale: number) {
    if (clearBeforeDrawingCheck.checked) clear();

    const topCxt = topCanvas.getContext("2d");
    const bottomCxt = bottomCanvas.getContext("2d");
    const funcCxt = funcCanvas.getContext("2d");
    setTransform([topCxt, bottomCxt, funcCxt]);

    funcCxt.strokeStyle = "#000000";
    funcCxt.moveTo(locArray[0][0], locArray[0][1]);
    for (let i = 1; i < locArray.length; i++) if (!locArray[i][6]) funcCxt.lineTo(locArray[i][0], locArray[i][1]);
    funcCxt.stroke();

    const initialSigns = getSign(document.getElementById("c0"));
    const ruler = new Ruler(
        new Circle(
            initialSigns * locArray[0][2] + locArray[0][0],
            initialSigns * locArray[0][3] + locArray[0][1],
            radius * scale
        ),
        getDotArray()
    );
    ruler.showSkeleton = true;
    ruler.draw(topCxt, bottomCxt);
    enableDrawing();
}

function previewRuler() {
    stopDrawing();
    const radius = +circleParam.value;
    const scale = +scaleParam.value;
    locArray = calculateLocations(
        +t1Param.value,
        +t2Param.value,
        nerdamer(xParam.value),
        nerdamer(yParam.value),
        +drawingStepParam.value,
        radius,
        scale
    );
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

function caller() {
    const circleRadius = +circleParam.value;

    const ruler = new Ruler(new Circle(320, 320, +scaleParam.value * circleRadius), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(ruler, +drawingDelayParam.value, undefined);
}

function buildNecessaryExpressions(xExp: nerdamer.Expression, yExp: nerdamer.Expression) {
    const dx = nerdamer.diff(xExp, "t");
    const dy = nerdamer.diff(yExp, "t");
    // console.log(dx.text());
    // console.log(dy.text());

    const dx_2 = nerdamer.diff(dx, "t");
    const dy_2 = nerdamer.diff(dy, "t");
    // console.log(dy_2.text());
    // console.log(dx_2.text());

    const curvatureString =
        "((" +
        dx.text() +
        ") * (" +
        dy_2.text() +
        ") - (" +
        dx_2.text() +
        ") * (" +
        dy.text() +
        "))/((" +
        dx.text() +
        ")^2 + (" +
        dy.text() +
        ")^2)^1.5";
    const curvatureExp = nerdamer(curvatureString);
    // console.log(curvatureExp.text());
    // console.log(curvatureString);

    const arcLengthExp = nerdamer("sqrt((" + dx.text() + ")^2 + (" + dy.text() + ")^2)");
    return [
        dx.buildFunction(["t"]),
        dy.buildFunction(["t"]),
        arcLengthExp.buildFunction(["t"]),
        curvatureExp.buildFunction(["t"]),
        dx_2.buildFunction(["t"]),
        dy_2.buildFunction(["t"])
    ];
}

function calculateLocations(
    t1: number,
    t2: number,
    xExp: nerdamer.Expression,
    yExp: nerdamer.Expression,
    step: number,
    radius: number,
    scale: number
): number[][] {
    let callAgain = false;
    const prevxExp = xExp,
        prevyExp = yExp;
    let cStep = step;
    let num = 1;
    while (cStep < 1) {
        cStep *= 10;
        num++;
    }

    const newCuspPoints: number[] = [];
    let c_newCuspPoints: number[] = [];
    const firstRotEle = document.getElementById("r0"),
        firstSignEle = document.getElementById("c0");
    const rotDirection = getSign(firstRotEle);
    let sign = getSign(firstSignEle);

    if (firstRotEle === null || firstSignEle === null)
        // require regeneration of sign-elements (a temporary solution)
        callAgain = true;

    const initialRotIncrementDirection = rotDirection * sign;

    // const totalSteps = Math.round((t2 - t1) / step);
    // const arcLengthInt = nerdamer('defint(sqrt((' + dx.text() + ')^2 + (' + dy.text() + ')^2), ' + t1 + ', t2, t)');
    const exps = buildNecessaryExpressions(xExp, yExp);
    const dx = exps[0],
        dy = exps[1];
    const arcLengthExp = exps[2];
    const curvature = exps[3];

    const locations: number[][] = [];
    const newCutPoints: number[] = [];
    const defaultCutPointSigns = [-1];

    const xFunc = xExp.buildFunction(["t"]);
    const yFunc = yExp.buildFunction(["t"]);

    let lastNormal = 0;
    let arcLength = 0;
    let previousArcLength = arcLength;
    let previousLower = t1;

    // longer slice length will result in better accuracy of numerical integration
    const sliceLength = 256;
    const sliceUpper = sliceLength - 1;

    // cusp detection threshold
    const cuspThreshold = 0.1;

    // don't know which value is appropriate here
    const epsilon = 1e-9;
    const maxError = 1e-6;
    for (let t = t1, counter = 0, cut = 0, idx = 0; t < t2; t += step, counter++, idx++) {
        t = +t.toFixed(num);
        const x = xFunc(t),
            y = yFunc(t);
        const dyE = dy(t),
            dxE = dx(t);
        const normal = -dxE / dyE;

        let delX: number, delY: number;
        if (normal === 0) {
            delX = Math.sign(lastNormal) * radius;
            delY = 0;
        } else {
            delX = (radius * Math.sign(normal)) / Math.sqrt(normal * normal + 1);
            delY = delX * normal;
        }

        const sliceIdx = counter % sliceLength;
        arcLength = previousArcLength + integrate(arcLengthExp, previousLower, t, sliceIdx * 2 + 5);
        if (sliceIdx === sliceUpper) {
            previousLower = t;
            previousArcLength = arcLength;
        }
        const rotAngle = arcLength / radius;
        const lastSign = defaultCutPointSigns[defaultCutPointSigns.length - 1];

        let z1, z2;

        if (Math.abs(dxE) < cuspThreshold) {
            // may be a cusp
            if (Math.abs(dyE) < cuspThreshold) {
                let cuspSteps = 0;
                let currentCusp = newCuspPoints.length === 0 ? undefined : newCuspPoints[newCuspPoints.length - 1];
                if (currentCusp === undefined || Math.abs(currentCusp - t) > 10 * step) {
                    // no need to recalculate
                    if (z1 === undefined) z1 = findZero(dx, exps[4], t, maxError);
                    if (z2 === undefined) z2 = findZero(dy, exps[5], t, maxError);

                    // both dy/dt and dx/dt approaches the same value
                    if (!isNaN(z1) && !isNaN(z2) && Math.abs(z1 - z2) < maxError * 2) {
                        if (
                            t < z1 &&
                            z1 < t2 &&
                            (newCuspPoints.length === 0 ||
                                Math.abs(z1 - newCuspPoints[newCuspPoints.length - 1]) > maxError * 10)
                        ) {
                            newCuspPoints.push(z1);
                            newCutPoints.push(z1);
                            c_newCuspPoints = newCuspPoints.concat();
                            if (Math.abs(normal - lastNormal) < 0.5) {
                                // vertical cusp does not require sign-adjustment when we want the circle to consistently inside or outside the parametric curve
                                if (revolve.checked) defaultCutPointSigns.push(lastSign);
                                else defaultCutPointSigns.push(-lastSign);
                            } else {
                                // horizontal cusp requires sign-adjustment when we want the circle to consistently inside or outside the parametric curve
                                if (revolve.checked) defaultCutPointSigns.push(-lastSign);
                                // stationary point does not need sign-adjustment
                                else defaultCutPointSigns.push(lastSign);
                            }
                        }
                    }
                }
                currentCusp = c_newCuspPoints.length === 0 ? undefined : c_newCuspPoints[c_newCuspPoints.length - 1];
                if (currentCusp !== undefined && revolve.checked) {
                    const nextNormal = -dx(t + step + epsilon) / dy(t + step + epsilon);
                    let cNormal = normal;

                    // switch to last normal if t is too close
                    if (Math.abs(t - currentCusp) < maxError) cNormal = lastNormal;
                    if (
                        Math.sign(cNormal) * Math.sign(nextNormal) === -1 &&
                        t + step <= t2 &&
                        Math.abs(t - currentCusp) <= step
                    ) {
                        c_newCuspPoints.splice(c_newCuspPoints.length - 1, 1);
                        const cuspX = xFunc(currentCusp),
                            cuspY = yFunc(currentCusp);

                        // console.log(t + '||' + currentCusp + '||' + (t + step));
                        let r1 = Math.atan(cNormal);
                        const r2 = Math.atan(nextNormal);
                        let radians: number;

                        if (Math.abs(cNormal - nextNormal) < 0.5) {
                            radians = Math.PI - Math.abs(r1) - Math.abs(r2);
                            if (dyE < 0) {
                                r1 -= Math.PI;
                            }
                        } else {
                            radians = Math.abs(r1) + Math.abs(r2);
                            if (dxE < 0) {
                                r1 -= Math.PI;
                            }
                        }

                        // sign-changing still not guaranteed to work for ALL CASES.
                        // TODO: add manual sign-changing buttons instead
                        for (let i = 0; i < newCutPoints.length; i++) {
                            if (t >= +newCutPoints[i].toFixed(num)) {
                                const ele = document.getElementById("c" + i);
                                sign = ele === undefined ? defaultCutPointSigns[i] : getSign(ele);
                                console.log(t + "||" + sign);
                                break;
                            }
                        }

                        if (Math.abs(lastNormal - nextNormal) > 0.5 && initialRotIncrementDirection === 1) {
                            sign = -sign;
                        } else {
                            sign = initialRotIncrementDirection * sign;
                        }

                        const tempSign = 1;

                        idx++;
                        for (let i = 0; i < radians; i += step * 4, idx++, cuspSteps++) {
                            locations[idx] = [
                                cuspX * scale,
                                cuspY * scale,
                                tempSign * sign * radius * Math.cos(r1 + rotDirection * i) * scale,
                                tempSign * sign * radius * Math.sin(r1 + rotDirection * i) * scale,
                                rotAngle + i,
                                currentCusp,
                                1
                            ];
                        }
                        cuspSteps++;
                        locations[idx++] = [
                            cuspX * scale,
                            cuspY * scale,
                            tempSign * sign * radius * Math.cos(r1 + rotDirection * radians) * scale,
                            tempSign * sign * radius * Math.sin(r1 + rotDirection * radians) * scale,
                            rotAngle + radians,
                            currentCusp,
                            1
                        ];
                        idx--;
                        previousArcLength += radius * radians;
                    }
                }

                // only matters when it's EXACTLY zero. Set [6] to 2 to disable drawing at this point
                if (dyE === 0) {
                    locations[idx - cuspSteps] = [NaN, NaN, NaN, NaN, rotAngle, t, 2];
                } else {
                    locations[idx - cuspSteps] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 0];
                }
            } else {
                if (Math.sign(normal) * Math.sign(lastNormal) === -1 || Math.sign(normal) === 0) {
                    z1 = findZero(dx, exps[4], t, maxError);

                    // a vertical tangent or horizontal tangent (stationary point)
                    if (!isNaN(z1) && Math.abs(z1 - t) <= step) {
                        newCutPoints.push(z1);
                        if (Math.abs(normal - lastNormal) < 0.5) {
                            defaultCutPointSigns.push(-lastSign);
                        } else {
                            defaultCutPointSigns.push(lastSign);
                        }
                    }
                }
                locations[idx] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 0];
            }
        } else if (dyE === 0) {
            locations[idx] = [x * scale, y * scale, 0, radius * scale, rotAngle, t, 0];
        } else {
            locations[idx] = [x * scale, y * scale, delX * scale, delY * scale, rotAngle, t, 0];
        }
        lastNormal = normal;
    }

    newCutPoints.push(t2);
    newCuspPoints.push(t2);

    const signRow = document.getElementById("sign-adjust");
    const signElements = new Array(newCutPoints.length);
    if (newCutPoints.length === cutPoints.length) {
        for (let i = 0; i < newCutPoints.length; i++) {
            const oldElement = document.getElementById("c" + i);
            signElements[i] = createSignElement(
                i,
                oldElement.innerHTML[oldElement.innerHTML.length - 1],
                i - 1 < 0 ? t1 : newCutPoints[i - 1],
                newCutPoints[i]
            );
        }
    } else {
        for (let i = 0; i < newCutPoints.length; i++)
            signElements[i] = createSignElement(
                i,
                defaultCutPointSigns[i] === 1 ? "+" : "-",
                i - 1 < 0 ? t1 : newCutPoints[i - 1],
                newCutPoints[i]
            );
    }
    signRow.innerHTML = "";
    for (let i = 0; i < newCutPoints.length; i++) signRow.appendChild(signElements[i]);

    const rotRow = document.getElementById("rot-adjust");
    const rotElements = new Array(newCuspPoints.length);
    if (newCuspPoints.length === cuspPoints.length) {
        for (let i = 0; i < newCuspPoints.length; i++) {
            const oldElement = document.getElementById("r" + i);
            rotElements[i] = createRotElement(
                i,
                oldElement.innerHTML[oldElement.innerHTML.length - 1],
                i - 1 < 0 ? t1 : newCuspPoints[i - 1],
                newCuspPoints[i]
            );
        }
    } else if (revolve.checked)
        for (let i = 0; i < newCuspPoints.length; i++)
            rotElements[i] = createRotElement(i, "+", i - 1 < 0 ? t1 : newCuspPoints[i - 1], newCuspPoints[i]);
    else
        for (let i = 0; i < newCuspPoints.length; i++)
            rotElements[i] = createRotElement(
                i,
                i % 2 === 0 ? "-" : "+",
                i - 1 < 0 ? t1 : newCuspPoints[i - 1],
                newCuspPoints[i]
            );
    rotRow.innerHTML = "";
    for (let i = 0; i < newCuspPoints.length; i++) rotRow.appendChild(rotElements[i]);

    cutPoints = newCutPoints;
    cuspPoints = newCuspPoints;
    $('[data-toggle="tooltip"]').tooltip();

    if (callAgain) return calculateLocations(t1, t2, prevxExp, prevyExp, step, radius, scale);
    return locations;
}

/**
 * find a zero by Newton's method
 * @param f the function to find zero
 * @param fp function's first derivative
 * @param x0 initial guess
 * @param err the error bound
 */
function findZero(f: (x: number) => number, fp: (x: number) => number, x0: number, err: number) {
    let x_n = x0,
        x_n1: number;
    err /= 2;
    for (let i = 0; i < 16; i++) {
        x_n1 = x_n - f(x_n) / fp(x_n);
        if (Math.abs(x_n1 - x_n) < err) return x_n1;
        x_n = x_n1;
    }
    return NaN;
}

/**
 * a template for sign element (the button for changing the sign)
 */
function createSignElement(index: number, sign: string, lower: number, upper: number) {
    const e = document.createElement("button");
    e.id = "c" + index;
    e.type = "button";
    e.className = "btn btn-secondary btn-sm sign-ele";
    e.innerHTML = upper.toFixed(2) + sign;
    e.setAttribute("data-toggle", "tooltip");
    e.title = "Change the sign for t between " + lower.toFixed(3) + " and " + upper.toFixed(3);
    e.disabled = revolve.checked;
    if (!revolve.checked)
        e.onclick = ev => {
            reverseSign([ev.target as HTMLElement]);
        };
    return e;
}

function reverseSign(targets: HTMLElement[]) {
    for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        const ih = t.innerHTML;
        const sign = ih[ih.length - 1];
        if (sign === "+") t.innerHTML = ih.substring(0, ih.length - 1) + "-";
        else t.innerHTML = ih.substring(0, ih.length - 1) + "+";
    }
    if (revolve.checked) previewRuler();
    else saveConfigToBrowser();
}

/**
 * a template for rot (rotation) element (the button for changing the direction of rotation)
 */
function createRotElement(index: number, sign: string, lower: number, upper: number) {
    const e = document.createElement("button");
    e.id = "r" + index;
    e.type = "button";
    e.className = "btn btn-outline-dark btn-sm rot-ele";
    e.innerHTML = upper.toFixed(2) + sign;
    e.setAttribute("data-toggle", "tooltip");
    e.title = "Change the direction of rotation for t between " + lower.toFixed(3) + " and " + upper.toFixed(3);
    e.disabled = revolve.checked;
    if (!revolve.checked)
        e.onclick = ev => {
            reverseSign([ev.target as HTMLElement]);
        };
    return e;
}

function generateRadius() {
    const multiple = +radiusMultipleParam.value;
    const exps = buildNecessaryExpressions(nerdamer(xParam.value), nerdamer(yParam.value));
    const t1 = +t1Param.value,
        t2 = +t2Param.value;
    const arcLength = integrate(exps[2], t1, t2, Math.round((t2 - t1) / +drawingStepParam.value) + 10);
    circleParam.value = (arcLength / multiple / (2 * Math.PI)).toString();
    previewRuler();
}

function draw(ruler: Ruler, drawingInterval: number, callback: Function) {
    // storing the reference to global locArray for efficiency
    const _locArray = locArray;
    const _cuspPoints = cuspPoints;
    const _cutPoints = cutPoints;

    if (_locArray.length < 1) return alert("You must first click 'preview' to calculate drawing path");

    const topCxt = topCanvas.getContext("2d");
    const bottomCxt = bottomCanvas.getContext("2d");
    const funcCxt = funcCanvas.getContext("2d");

    ruler.showSkeleton = skeletonCheck.checked;

    if (clearBeforeDrawingCheck.checked || !ruler.showSkeleton) {
        clearBottom();
        clearTop();
    }

    if (!functionCheck.checked) clearFunc();

    setTransform([topCxt, bottomCxt, funcCxt]);

    const progressLabel = $("#progressLabel");
    const progressbar = $("#progressbar");
    const epsilon = 1e-12;
    progressbar.width("0%");

    let delay = 0;
    for (
        let i = 0,
            counter = 0,
            cut = 0,
            cusp = 0,
            sign = getSign(document.getElementById("c0")),
            rot = getSign(document.getElementById("r0"));
        i < _locArray.length;
        i++, delay += drawingInterval, counter++
    ) {
        let changeRot = i === 0;
        if (cut < _cutPoints.length) {
            if (_locArray[i][5] - _cutPoints[cut] > epsilon) sign = getSign(document.getElementById("c" + ++cut));
        }
        if (cusp < _cuspPoints.length) {
            if (_locArray[i][5] - _cuspPoints[cusp] > epsilon) {
                rot = getSign(document.getElementById("r" + ++cusp));
                changeRot = true;
            }
        }

        currentJobs.push(
            setTimeout(() => {
                if (!flag.stop) {
                    ruler.erase(bottomCxt);
                    if (_locArray[i][6] === 1)
                        ruler.moveTo(_locArray[i][0] + _locArray[i][2], _locArray[i][1] + _locArray[i][3]);
                    else if (_locArray[i][6] !== 2)
                        ruler.moveTo(
                            _locArray[i][0] + sign * _locArray[i][2],
                            _locArray[i][1] + sign * _locArray[i][3]
                        );
                    ruler.angle = _locArray[i][4];

                    if (changeRot) ruler.changeDirection(rot);

                    ruler.draw(topCxt, bottomCxt);

                    if (counter % 10 === 0) {
                        const progress = (i / _locArray.length) * 100;
                        progressbar.width(progress + "%");
                        progressLabel.text(
                            "Drawing: t = " + _locArray[i][5].toFixed(3) + ", " + progress.toFixed(1) + "%"
                        );
                    }
                }
            }, delay)
        );
    }
    currentJobs.push(
        setTimeout(() => {
            progressbar.width("100%");
            progressLabel.text("Drawing: Finished");
            if (callback !== undefined) callback();
        }, delay)
    );
}

/**
 * Numerically integrate function f over [a, b] using the trapezoidal rule
 */
function integrate(f: (x: number) => number, a: number, b: number, n: number) {
    const step = (b - a) / n;
    let sum = f(a);
    for (let i = 1; i < n - 1; i++) sum += 2 * f(a + i * step);
    return (sum + f(b)) * 0.5 * step;
}

function lcm(x: number, y: number) {
    let a = x,
        b = y;
    while (a % b !== 0) {
        const c = a % b;
        a = b;
        b = c;
    }
    return (x * y) / b;
}

function rad2cor(x: number, y: number, radius: number, rad: number) {
    return [x + radius * Math.cos(rad), y + radius * Math.sin(rad)];
}

class Ruler {
    showSkeleton: boolean;
    angle: number;
    circle: Circle;
    dots: Dot[];
    previousRotation: number;
    rotSign: number;
    constructor(circle: Circle, dots: Dot[]) {
        this.circle = circle;

        this.dots = dots;
        this.angle = 0;
        this.showSkeleton = true;

        this.previousRotation = 0;
        this.rotSign = 1;
    }

    calculateRotation(i: number) {
        return this.rotSign * this.angle - this.dots[i].rotOffset + 2 * this.previousRotation;
    }

    changeDirection(sign: number) {
        this.previousRotation = sign === -1 ? this.angle : 0;
        this.rotSign = sign;
    }

    draw(topCxt: CanvasRenderingContext2D, bottomCxt: CanvasRenderingContext2D) {
        this.drawCircle(bottomCxt);
        this.drawDots(topCxt);
        this.drawSkeleton(bottomCxt);
    }

    erase(bottomCxt: CanvasRenderingContext2D) {
        if (this.showSkeleton) {
            const previousLineWidth = bottomCxt.lineWidth;
            bottomCxt.lineWidth = previousLineWidth + 2;
            bottomCxt.globalCompositeOperation = "destination-out";
            this.eraseCircle(bottomCxt);
            this.eraseSkeleton(bottomCxt);
            bottomCxt.globalCompositeOperation = "source-over";
            bottomCxt.lineWidth = previousLineWidth;
        }
    }

    drawCircle(bottomCxt: CanvasRenderingContext2D) {
        if (this.showSkeleton) this.circle.draw(bottomCxt);
    }

    eraseCircle(bottomCxt: CanvasRenderingContext2D) {
        this.circle.draw(bottomCxt);
    }

    drawDots(topCxt: CanvasRenderingContext2D) {
        // const previousStyle = topCxt.fillStyle;
        for (let i = 0; i < this.dots.length; i++) {
            const dotPos = rad2cor(
                this.circle.x,
                this.circle.y,
                (this.dots[i].ratio / 100) * this.circle.radius,
                this.calculateRotation(i)
            );
            topCxt.fillStyle = this.dots[i].color;
            topCxt.beginPath();
            topCxt.arc(dotPos[0], dotPos[1], this.dots[i].size, 0, 2 * Math.PI);
            topCxt.closePath();
            topCxt.fill();
        }
        // topCxt.fillStyle = previousStyle;
    }

    drawSkeleton(bottomCxt: CanvasRenderingContext2D) {
        if (this.showSkeleton) {
            for (let i = 0; i < this.dots.length; i++) {
                const dotPos = rad2cor(
                    this.circle.x,
                    this.circle.y,
                    (this.dots[i].ratio / 100) * this.circle.radius,
                    this.calculateRotation(i)
                );
                bottomCxt.moveTo(this.circle.x, this.circle.y);
                bottomCxt.lineTo(dotPos[0], dotPos[1]);
            }
            bottomCxt.stroke();
        }
    }
    eraseSkeleton(bottomCxt: CanvasRenderingContext2D) {
        if (this.showSkeleton) {
            bottomCxt.beginPath();
            for (let i = 0; i < this.dots.length; i++) {
                const dotPos = rad2cor(
                    this.circle.x,
                    this.circle.y,
                    (this.dots[i].ratio / 100) * this.circle.radius,
                    this.calculateRotation(i)
                );
                bottomCxt.moveTo(this.circle.x, this.circle.y);
                bottomCxt.lineTo(dotPos[0], dotPos[1]);
                bottomCxt.arc(this.circle.x, this.circle.y, 2, 0, 2 * Math.PI);
            }
            bottomCxt.closePath();
            bottomCxt.stroke();
            bottomCxt.fill();
        }
    }

    moveTo(x: number, y: number) {
        this.circle.moveTo(x, y);
    }
}

class Dot {
    size: number;
    color: string;
    ratio: number;
    rotOffset: number;

    constructor(size: number, color: string, ratio: number, rotOffset: number) {
        this.size = size;
        this.color = color;
        this.ratio = ratio;
        this.rotOffset = (rotOffset / 180) * Math.PI;
    }
}

class Circle {
    public x: number;
    public y: number;
    public radius: number;
    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw(cxt: CanvasRenderingContext2D) {
        cxt.beginPath();
        cxt.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        cxt.closePath();
        cxt.stroke();
    }
    erase(cxt: CanvasRenderingContext2D) {
        cxt.globalCompositeOperation = "destination-out";
        const previousLineWidth = cxt.lineWidth;
        cxt.lineWidth = previousLineWidth + 2;
        this.draw(cxt);
        cxt.lineWidth = previousLineWidth;
    }
    moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
