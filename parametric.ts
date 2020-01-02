import { saveAs } from 'file-saver';
import * as nerdamer from 'nerdamer'
import 'bootstrap';

declare global {
    const GIF: any;

    interface Window {
        GIF: any;
    }
}

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
const drawingSpeedParam = document.getElementById("delay") as HTMLInputElement;
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
const gifTransparentCheck = document.getElementById("f-transparent") as HTMLInputElement;
const gifBgColorParam = document.getElementById("f-bgcolor") as HTMLInputElement;
const gifFrameDelayParam = document.getElementById("f-delay") as HTMLInputElement;
const gifQualityParam = document.getElementById("f-quality") as HTMLInputElement;
const gifLastFrameDelayParam = document.getElementById("f-lastdelay") as HTMLInputElement;

const pngWidthParam = document.getElementById("p-width") as HTMLInputElement;
const pngTransparentCheck = document.getElementById("p-transparent") as HTMLInputElement;
const pngBgColorParam = document.getElementById("p-bgcolor") as HTMLInputElement;

const drawButton = document.getElementById("draw") as HTMLButtonElement;

let currentJobs: number[] = [];
let dots: { [x: string]: Dot } = {};
let locArray: number[][] = [];
let cutPoints: number[] = [];
let cuspPoints: number[] = [];

window.onload = () => {
    parseConfigJSON(localStorage.getItem("cache"));

    window.onchange = () => saveConfigToBrowser();

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
    for (let i = 0; i < currentJobs.length; i++) clearTimeout(currentJobs[i]);
    currentJobs = [];
}

function adjustDotRatioCap() { }

function saveConfigToBrowser() {
    localStorage.setItem("cache", getConfigJSON());
}

function getConfigJSON() {
    const isLocValid = locArray.length > 0 && locArray[0].length >= 6;
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
        drawingSpeed: +drawingSpeedParam.value,
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
        frameTransparent: gifTransparentCheck.checked,
        frameBgColor: gifBgColorParam.value,
        frameQuality: +gifQualityParam.value,
        frameInterval: +gifIntervalParam.value,
        lastFrameDelay: +gifLastFrameDelayParam.value,

        pngWidth: +pngWidthParam.value,
        pngTransparent: pngTransparentCheck.checked,
        pngBgColor: pngBgColorParam.value,
    };
    return JSON.stringify(config);
}

function parseConfigJSON(json: string) {
    if (!json) return;
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
        drawingSpeedParam.value = obj.drawingSpeed === undefined ? 2 : obj.drawingSpeed;
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
        gifTransparentCheck.checked = obj.frameTransparent === undefined ? false : obj.frameTransparent;
        gifBgColorParam.value = obj.frameBgColor === undefined ? "#FFFFFF" : obj.frameBgColor;

        if (gifTransparentCheck.checked) gifBgColorParam.disabled = true;

        gifQualityParam.value = obj.frameQuality === undefined ? 10 : obj.frameQuality;
        gifIntervalParam.value = obj.frameInterval === undefined ? 40 : obj.frameInterval;
        gifLastFrameDelayParam.value = obj.lastFrameDelay === undefined ? 1000 : obj.lastFrameDelay;

        pngWidthParam.value = obj.pngWidth === undefined ? 640 : obj.pngWidth;
        pngTransparentCheck.checked = obj.pngTransparent === undefined ? false : obj.pngTransparent;
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

        previewRuler();
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
        reader.onload = function () {
            parseConfigJSON(this.result as string);
        };
        reader.readAsText(file);
    }
}

function getRealBounds() {
    let maxDotRatio = 0;
    for (const key in dots) {
        const dotRatio = Math.abs(dots[key].ratio);
        if (dotRatio > maxDotRatio) {
            maxDotRatio = dotRatio;
        }
    }
    const radius = +circleParam.value * +scaleParam.value;
    maxDotRatio = Math.max(radius, maxDotRatio / 100 * radius + 1) * 2;

    let minX = Infinity,
        maxX = -Infinity;
    let minY = Infinity,
        maxY = -Infinity;
    for (let i = 0; i < locArray.length; i++) {
        const [x, y] = locArray[i];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    minX = minX - maxDotRatio
    maxX = maxX + maxDotRatio
    minY = minY - maxDotRatio
    maxY = maxY + maxDotRatio
    return [minX, maxX, minY, maxY] as const;
}

/**
 * 
 */
function getScalingAndTranslation(realBounds: ReturnType<typeof getRealBounds>, maxSize = 640) {
    const [minX, maxX, minY, maxY] = realBounds;

    const width = maxX - minX;
    const height = maxY - minY;
    const scaling = Math.min(maxSize / width, maxSize / height);

    return [scaling, (-width / 2 - minX) * scaling, (-height / 2 - minY) * scaling, scaling * width, scaling * height] as const;
}

function autoAdjustScalingAndTranslation() {
    if (locArray.length > 0 && locArray[0].length >= 6) {
        const result = getScalingAndTranslation(getRealBounds(), 640);
        scaleParam.value = (+scaleParam.value * result[0]).toString();
        dxParam.value = result[1].toString();
        dyParam.value = result[2].toString();
        previewRuler();
    } else {
        previewRuler();
        autoAdjustScalingAndTranslation();
    }
}

function saveToPNG() {
    stopDrawing();

    draw(() => {
        const tempCxt = tempCanvas.getContext("2d");
        const [, , , width, height] = getScalingAndTranslation(getRealBounds(), +pngWidthParam.value);
        tempCanvas.width = width;
        tempCanvas.height = height;

        if (!pngTransparentCheck.checked) {
            tempCxt.fillStyle = pngBgColorParam.value;
            tempCxt.fillRect(0, 0, width, height);
        }

        tempCxt.drawImage(funcCanvas, 0, 0, width, height);
        tempCxt.drawImage(bottomCanvas, 0, 0, width, height);
        tempCxt.drawImage(topCanvas, 0, 0, width, height);

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
    stopDrawing();

    const frameSize = +gifSizeParam.value;
    const transparent = gifTransparentCheck.checked;
    const frameDelay = +gifFrameDelayParam.value;
    const tempCxt = tempCanvas.getContext("2d");

    const [, , , width, height] = getScalingAndTranslation(getRealBounds(), frameSize);
    tempCanvas.width = width;
    tempCanvas.height = height;

    const gif = new GIF({
        workers: 4,
        quality: +gifQualityParam.value,
        workerScript: "./gif.worker.min.js",
        width,
        height
    });

    if (!transparent) {
        tempCxt.fillStyle = gifBgColorParam.value;
        tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    const progressLabel = $("#progressLabel");
    const progressbar = $("#progressbar");
    progressbar.width("0%");

    draw(() => {
        if (transparent) tempCxt.clearRect(0, 0, width, height);
        else tempCxt.fillRect(0, 0, width, height);

        tempCxt.drawImage(funcCanvas, 0, 0, width, height);
        tempCxt.drawImage(bottomCanvas, 0, 0, width, height);
        tempCxt.drawImage(topCanvas, 0, 0, width, height);

        gif.addFrame(tempCxt, {
            copy: true,
            delay: +gifLastFrameDelayParam.value
        });

        progressbar.width("0%");

        // start render after drawing is completed
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

    }, +gifIntervalParam.value, () => {
        if (transparent) tempCxt.clearRect(0, 0, width, height);
        else tempCxt.fillRect(0, 0, width, height);

        tempCxt.drawImage(funcCanvas, 0, 0, width, height);
        tempCxt.drawImage(bottomCanvas, 0, 0, width, height);
        tempCxt.drawImage(topCanvas, 0, 0, width, height);

        gif.addFrame(tempCxt, {
            copy: true,
            delay: frameDelay
        });
    });
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

function drawPreview() {
    if (clearBeforeDrawingCheck.checked) clear();

    const topCxt = topCanvas.getContext("2d");
    const bottomCxt = bottomCanvas.getContext("2d");
    const funcCxt = funcCanvas.getContext("2d");
    setTransform([topCxt, bottomCxt, funcCxt]);

    funcCxt.beginPath();
    funcCxt.strokeStyle = "#000000";
    funcCxt.moveTo(locArray[0][0], locArray[0][1]);
    
    for (let i = 1; i < locArray.length; i++) if (!isNaN(locArray[i][0])) funcCxt.lineTo(locArray[i][0], locArray[i][1]);
    funcCxt.stroke();

    let i = 0, j = 0;
    while (isNaN(locArray[i][0])) {
        i++;
    }
    while (locArray[i][0] > cutPoints[j]) {
        j++;
    }
    const initialSigns = getSign(document.getElementById("c" + j));
    const ruler = new Ruler(
        new Circle(
            initialSigns * locArray[i][2] + locArray[i][0],
            initialSigns * locArray[i][3] + locArray[i][1],
            +circleParam.value * +scaleParam.value
        ),
        getDotArray()
    );
    ruler.showSkeleton = true;
    ruler.draw(topCxt, bottomCxt);
    enableDrawing();
}

function previewRuler() {
    stopDrawing();
    calculateLocations();
    drawPreview();
    saveConfigToBrowser();
}

function clear() {
    clearCxt(topCanvas.getContext('2d'));
    clearCxt(bottomCanvas.getContext('2d'));
    clearCxt(funcCanvas.getContext('2d'));
}

function clearCxt(cxt: CanvasRenderingContext2D) {
    cxt.save();
    cxt.resetTransform();
    cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height)
    cxt.restore();
}

function buildNecessaryExpressions(xExp: nerdamer.Expression, yExp: nerdamer.Expression) {
    const dx = nerdamer.diff(xExp, "t");
    const dy = nerdamer.diff(yExp, "t");

    const dx_2 = nerdamer.diff(dx, "t");
    const dy_2 = nerdamer.diff(dy, "t");

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

    const arcLengthExp = nerdamer("sqrt((" + dx.text() + ")^2 + (" + dy.text() + ")^2)");
    return [
        xExp.buildFunction(["t"]),
        yExp.buildFunction(["t"]),
        dx.buildFunction(["t"]),
        dy.buildFunction(["t"]),
        arcLengthExp.buildFunction(["t"]),
        curvatureExp.buildFunction(["t"]),
    ] as const;
}

function calculateLocations() {
    const [xFunc, yFunc, dx, dy, arcLengthExp, curvature] = buildNecessaryExpressions(nerdamer(xParam.value), nerdamer(yParam.value));

    const t1 = +t1Param.value,
        t2 = +t2Param.value;

    let previousArcLength = 0;
    let previousLower = t1;
    let sign = 1, lastNormal = 0, lastCuspIdx = 1;

    const newCuspPoints: [number, number, number][] = [[t1, 0, 0]];
    const newCutPoints: [number, number][] = [[t1, sign]];

    const step = +drawingStepParam.value,
        radius = +circleParam.value,
        scale = +scaleParam.value;
    const locations: number[][] = [];
    for (let t = t1, idx = 0; t < t2; t += step) {
        const normal = -dx(t) / dy(t);
        if (Math.sign(normal * lastNormal) === -1) { // normal changes sign
            // for stationary points only
            if (Math.abs(normal - lastNormal) > 1)
                newCutPoints.push([t, sign = -sign]);
        }

        const cv = Math.abs(curvature(t))
        if (cv > 50) {        // large curvature -> cusp
            const lastCusp = newCuspPoints[lastCuspIdx];
            if (!lastCusp) {
                newCuspPoints.push([t, cv, 0]);
            } else {
                // update the previous cusp's curvature if the current curvature is larger
                if (cv > lastCusp[1]) {
                    lastCusp[0] = t;
                    lastCusp[1] = cv;
                } else { // curvature stop increasing: curvature is the maximum
                    if (revolve.checked && !lastCusp[2]) {
                        lastCusp[2] = 1; // set flag to stop re-revolving around cusps

                        const r1 = Math.atan(-dx(t - 2 * step) / dy(t - 2 * step));
                        const r2 = Math.atan(normal);

                        // change sign? vertical or horizontal cusp
                        const temp = Math.abs(r2 - r1);

                        const radians = temp < Math.PI / 2 ? Math.PI - temp : temp;


                        // find the last non NaN value
                        let i = -1;
                        let [cuspX, cuspY, , , rotAngle] = locations[idx + i];
                        while (isNaN(cuspX)) {
                            [cuspX, cuspY, , , rotAngle] = locations[idx + --i];
                        }

                        // console.log(cuspX, t);
                        for (i = 0; i < radians; i += step * 4) {
                            locations[idx++] = [
                                cuspX,
                                cuspY,
                                radius * Math.cos(r1 + i) * scale,
                                radius * Math.sin(r1 + i) * scale,
                                rotAngle + i,
                                t - step
                            ];
                        }
                        locations[idx++] = [
                            cuspX,
                            cuspY,
                            radius * Math.cos(r1 + radians) * scale,
                            radius * Math.sin(r1 + radians) * scale,
                            rotAngle + radians,
                            t - step
                        ];

                        previousArcLength += radius * radians; // 

                        const lastCut = newCutPoints[newCutPoints.length - 1]
                        if (!lastCut || Math.abs(lastCut[0] - t) >= 2 * step) // if the t-value of the lastCut is not the same as this cusp
                            newCutPoints.push([t, sign = -sign]); // add a new cut corresponding to this cusp
                        else {
                            lastCut[1] = sign = -sign; // otherwise, update the sign of the previous cusp
                        }
                    }
                }
            }
        } else { // curvature falls below threshold: set last cusp to undefined
            lastCuspIdx = newCuspPoints.length;
        }

        // update arc length
        const sliceIdx = idx % 256;
        const arcLength = previousArcLength + integrate(arcLengthExp, previousLower, t, sliceIdx * 2);
        if (sliceIdx === 255) {
            previousLower = t;
            previousArcLength = arcLength;
        }

        const rotAngle = arcLength / radius;
        const delX = radius / Math.sqrt(normal * normal + 1);
        const delY = delX * normal;
        if (Math.abs(normal) > 10e100) { // special case to handle: normal is +/- infinity
            locations[idx++] = [xFunc(t) * scale, yFunc(t) * scale, radius * scale, 0, rotAngle, t];
        } else {
            if (isFinite(rotAngle) && isFinite(normal))
                locations[idx++] = [xFunc(t) * scale, yFunc(t) * scale, delX * scale, delY * scale, rotAngle, t];
            else {
                locations[idx++] = [NaN, NaN, NaN, NaN, NaN, NaN];
            }
        }

        lastNormal = normal;
    }

    const signRow = document.getElementById("sign-adjust");
    signRow.innerHTML = "";
    for (let i = 0; i < newCutPoints.length; i++) signRow.appendChild(createSignElement(
        i,
        newCutPoints[i][1] === 1 ? "+" : "-",
        newCutPoints[i][0],
        (newCutPoints[i + 1] || [t2])[0]
    ));

    const rotRow = document.getElementById("rot-adjust");
    rotRow.innerHTML = "";
    for (let i = 0; i < newCuspPoints.length; i++) rotRow.appendChild(createRotElement(
        i,
        i % 2 === 0 && !revolve.checked ? "+" : "-",
        newCuspPoints[i][0],
        (newCuspPoints[i + 1] || [t2])[0]
    ));

    cutPoints = newCutPoints.map(x => x[0]);
    cuspPoints = newCuspPoints.map(x => x[0]);
    $('[data-toggle="tooltip"]').tooltip();

    locArray = locations;
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
    e.onclick = ev => reverseSign([ev.target as HTMLElement]);
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
    saveConfigToBrowser();
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
    e.onclick = ev => reverseSign([ev.target as HTMLElement]);
    return e;
}

function generateRadius() {
    stopDrawing();
    const exps = buildNecessaryExpressions(nerdamer(xParam.value), nerdamer(yParam.value));
    const t1 = +t1Param.value,
        t2 = +t2Param.value;
    const arcLength = integrate(exps[4], t1, t2, Math.round((t2 - t1) / +drawingStepParam.value) + 10);
    circleParam.value = (arcLength / (+radiusMultipleParam.value * 2 * Math.PI)).toString();
    previewRuler();
}

function draw(doneCallback = () => { }, stepInterval = 16, stepAction = () => { }) {
    // storing the reference to global locArray for efficiency
    const _locArray = locArray;
    const _cuspPoints = cuspPoints;
    const _cutPoints = cutPoints;

    if (_locArray.length < 1) return alert("You must first click 'preview' to calculate drawing path");

    const topCxt = topCanvas.getContext("2d");
    const bottomCxt = bottomCanvas.getContext("2d");
    const funcCxt = funcCanvas.getContext("2d");

    const ruler = new Ruler(new Circle(320, 320, +scaleParam.value * +circleParam.value), getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    if (clearBeforeDrawingCheck.checked || !ruler.showSkeleton) {
        clearCxt(bottomCxt);
        clearCxt(topCxt);
    }
    if (!functionCheck.checked) clearCxt(funcCxt);

    setTransform([topCxt, bottomCxt, funcCxt]);

    const progressLabel = $("#progressLabel");
    const progressbar = $("#progressbar");
    progressbar.width("0%");

    const tasks: (() => void)[] = [];
    for (
        let i = 0,
        cut = 0,
        cusp = 0,
        sign = getSign(document.getElementById("c0")),
        rot = getSign(document.getElementById("r0"));
        i < _locArray.length;
        i++
    ) {
        if (cut < _cutPoints.length && _locArray[i][5] >= _cutPoints[cut])
            sign = getSign(document.getElementById("c" + cut++));

        let changeRot = false;
        if (cusp < _cuspPoints.length && _locArray[i][5] >= _cuspPoints[cusp]) {
            rot = getSign(document.getElementById("r" + cusp++));
            changeRot = true;
        }

        tasks.push(() => {
            if (isNaN(locArray[i][0])) return;

            // erase
            ruler.erase(bottomCxt);

            // update parameters
            ruler.moveTo(
                _locArray[i][0] + sign * _locArray[i][2],
                _locArray[i][1] + sign * _locArray[i][3]
            );
            ruler.angle = _locArray[i][4];
            if (changeRot) ruler.changeDirection(rot);

            // draw
            ruler.draw(topCxt, bottomCxt);

            if (i % stepInterval === 0) {
                stepAction();

                const progress = (i / _locArray.length) * 100;
                progressbar.width(progress + "%");
                progressLabel.text(
                    "Drawing: t = " + _locArray[i][5].toFixed(3) + ", " + progress.toFixed(1) + "%"
                );
            }
        })

    }
    tasks.push(() => {
        progressbar.width("100%");
        progressLabel.text("Drawing: Finished");
        doneCallback();
    })
    const speed = +drawingSpeedParam.value
    for (let i = 0; i < tasks.length; i += speed) {
        currentJobs.push(setTimeout(() => {
            const bound = Math.min(tasks.length, i + speed)
            for (let j = i; j < bound; j++) {
                tasks[j]();
            }
        }))
    }
}

/**
 * Numerically integrate function f over [a, b] using the trapezoidal rule
 */
function integrate(f: (x: number) => number, a: number, b: number, n: number) {
    if (Math.abs(b - a) < 1e-8) return 0;
    const step = (b - a) / n;
    let sum = f(a);
    for (let i = 1; i < n - 1; i++) sum += 2 * f(a + i * step);
    return (sum + f(b)) * 0.5 * step;
}

function rad2cor(x: number, y: number, radius: number, rad: number) {
    return [x + radius * Math.cos(rad), y + radius * Math.sin(rad)];
}

class Ruler {
    showSkeleton: boolean;
    angle: number;
    circle: Circle;
    dots: Dot[];
    offset: number;
    rotSign: number;
    constructor(circle: Circle, dots: Dot[]) {
        this.angle = 0;
        this.offset = 0;
        this.rotSign = 1;
        this.showSkeleton = true;

        this.circle = circle;
        this.dots = dots;
    }

    calculateRotation(i: number) {
        return this.rotSign * this.angle - this.dots[i].rotOffset + this.offset;
    }

    changeDirection(sign: number) {
        // const a = this.calculateRotation(0);
        if (this.rotSign !== sign) // cancel out previous rotation offset
            this.offset += -sign * 2 * this.angle;
        this.rotSign = sign;
        // console.log((this.calculateRotation(0) - a) % (2*Math.PI), this.angle % (Math.PI * 2));
    }

    draw(topCxt: CanvasRenderingContext2D, bottomCxt: CanvasRenderingContext2D) {
        bottomCxt.beginPath();
        this.drawCircle(bottomCxt);
        this.drawSkeleton(bottomCxt);
        bottomCxt.closePath();
        bottomCxt.stroke(); // do the above operations in the save batch, improving performance

        this.drawDots(topCxt);
    }

    erase(bottomCxt: CanvasRenderingContext2D) {
        bottomCxt.save();
        bottomCxt.resetTransform();
        bottomCxt.clearRect(0, 0, bottomCxt.canvas.width, bottomCxt.canvas.height);
        bottomCxt.restore();
    }

    drawCircle(bottomCxt: CanvasRenderingContext2D) {
        if (this.showSkeleton) this.circle.draw(bottomCxt);
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
            topCxt.beginPath();
            topCxt.fillStyle = this.dots[i].color;
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
        cxt.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    }
    moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
