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
let cutPoints: readonly [number, number][] = [];
let cuspPoints: readonly [number, number][] = [];
let stopFlag = false;

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
            document.getElementById("sign-adjust")!.innerHTML = "";
            document.getElementById("rot-adjust")!.innerHTML = "";
        };
    }
    $('[data-toggle="tooltip"]').tooltip();
};

function disableDrawing() {
    drawButton.disabled = true;
    const m = document.getElementById("savepng")!,
        n = document.getElementById("savegif")!;
    m.className = "dropdown-item disabled";
    n.className = "dropdown-item disabled";
    m.style.color = "#6c757d";
    n.style.color = "#6c757d";
    m.setAttribute("data-target", "#");
    n.setAttribute("data-target", "#");
}

function enableDrawing() {
    drawButton.disabled = false;
    const m = document.getElementById("savepng")!,
        n = document.getElementById("savegif")!;
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
    const dotSize = +$("#dotSize").val()!;
    const dotColor = $("#dotColor").val()!;
    const dotRatio = +$("#dotRatio").val()!;
    const dotRot = +$("#dotRotOffset").val()!;

    addDotHelper(new Date().valueOf().toString(), dotSize, dotColor as string, dotRatio, dotRot, true);
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
    $("#settings").append(`
<tr id="${currentTime}">
    <td onclick="preModify(this)" data-toggle="modal" data-target="#DotModalCenter">
        Ratio: ${dotRatio}%&nbsp;&nbsp;Color: <span class="color-blk" style="background-color: ${dotColor}"></span>
        <br> 
        Size: ${dotSize}&nbsp;&nbsp;Rotation: ${dotRot}° 
    </td>
    <th width="50px">
        <button type="button" class="close" aria-label="Close" onclick="removeDot('${currentTime}')">×</button> 
    </th>
</tr>
    `);
    if (save) saveConfigToBrowser();
}

/**
 * before the the (dot editing) modal opens, assign the current value to modal fields
 */
function preModify(td: HTMLTableCellElement) {
    const dot = dots[(td.parentNode as HTMLElement).id];
    mDotSize.value = dot.size.toString();
    mDotColor.value = dot.color;
    mDotRatio.value = dot.ratio.toString();
    mDotRot.value = Math.round((dot.rotOffset / Math.PI) * 180).toString();
    mDotID.value = (td.parentNode as HTMLElement).id;
}

/**
 * after user clicks "save", save the new dot attributes and update HTML
 */
function postModify() {
    const dot = dots[mDotID.value];
    const dotSize = +mDotSize.value;
    const dotColor = mDotColor.value;
    const dotRatio = +mDotRatio.value;
    const dotRot = +mDotRot.value;
    const tr = document.getElementById(mDotID.value) as HTMLTableRowElement;

    tr.cells[0].innerHTML = `
<td onclick="preModify(this)" data-toggle="modal" data-target="#DotModalCenter">
    Ratio: ${dotRatio}%&nbsp;&nbsp;Color: <span class="color-blk" style="background-color: ${dotColor}"></span>
    <br> 
    Size: ${dotSize}&nbsp;&nbsp;Rotation: ${dotRot}° 
</td>`;

    dot.size = dotSize;
    dot.color = dotColor;
    dot.ratio = dotRatio;
    dot.rotOffset = (dotRot / 180) * Math.PI;
    saveConfigToBrowser();
}

function stopDrawing() {
    stopFlag = true;
}

function adjustDotRatioCap() { }

function saveConfigToBrowser() {
    localStorage.setItem("cache", getConfigJSON());
}

function getConfigJSON() {
    return JSON.stringify({
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

        cutPoints,
        cuspPoints
    });
}

function parseConfigJSON(json?: string | null) {
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

        cuspPoints = obj.cuspPoints || [];
        cutPoints = obj.cutPoints || [];

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
        console.error(e);
    }
}

/**
 * save config as a file
 */
function saveConfig() {
    saveAs(new Blob([getConfigJSON()], { type: "text/plain;charset=utf-8" }), "config.json");
}

/**
 * load config from a file
 */
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

/**
 * @returns [minX, maxX, minY, maxY] of the global locArray
 */
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
 * given [minX, maxX, minY, maxY] (two corners of a rectangle), returns the scaling and translation such that when applied,
 * the resulting rectangle is centered at (0, 0) and max(width, height) = `maxSize`
 */
function getScalingAndTranslation(realBounds: ReturnType<typeof getRealBounds>, maxSize = 640) {
    const [minX, maxX, minY, maxY] = realBounds;

    const width = maxX - minX;
    const height = maxY - minY;
    const scaling = Math.min(maxSize / width, maxSize / height);

    return [scaling, (-width / 2 - minX) * scaling, (-height / 2 - minY) * scaling, scaling * width, scaling * height] as const;
}

/**
 * adjust the scaling and translation of the canvas such that the parametric curve fits within the viewport
 */
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
        const tempCxt = tempCanvas.getContext("2d")!;
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
            saveAs(blob!, "parametric-roulette.png");
        });
    });
}


function saveToGIF() {
    stopDrawing();

    const frameSize = +gifSizeParam.value;
    const transparent = gifTransparentCheck.checked;
    const frameDelay = +gifFrameDelayParam.value;
    const tempCxt = tempCanvas.getContext("2d")!;

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

    const progressLabel = document.getElementById('progressLabel')!;
    const progressbar = document.getElementById('progressbar')!;
    progressbar.style.width = "0%";

    draw(() => { // start render after drawing is completed
        if (transparent) tempCxt.clearRect(0, 0, width, height);
        else tempCxt.fillRect(0, 0, width, height);

        tempCxt.drawImage(funcCanvas, 0, 0, width, height);
        tempCxt.drawImage(bottomCanvas, 0, 0, width, height);
        tempCxt.drawImage(topCanvas, 0, 0, width, height);

        gif.addFrame(tempCxt, {
            copy: true,
            delay: +gifLastFrameDelayParam.value
        });

        progressbar.style.width = "0%";

        gif.on("progress", (p: number) => {
            if (Math.abs(1 - p) < 0.001) {
                progressbar.style.width = "100%";
                progressLabel.innerHTML = "Save as GIF: Finished";
            } else {
                p = p * 100;
                progressbar.style.width = p + "%";
                progressLabel.innerHTML = `Save as GIF: ${p.toFixed(1)}%`;
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

/**
 * set the transformation matrix of the given canvas contexts. 
 * Note that scaling is not set here because it may not provide a high-res image. Instead, it is applied in the `calculateLocations` function. 
 */
function setTransform(cxts: CanvasRenderingContext2D[]) {
    const sx = +dxParam.value;
    const sy = +dyParam.value;
    for (let i = 0; i < cxts.length; i++) cxts[i].setTransform(1, 0, 0, -1, sx + 320, 320 - sy);
}

function drawPreview() {
    if (clearBeforeDrawingCheck.checked) clear();

    const topCxt = topCanvas.getContext("2d")!;
    const bottomCxt = bottomCanvas.getContext("2d")!;
    const funcCxt = funcCanvas.getContext("2d")!;
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
    while (locArray[i][5] > cutPoints[j][0]) {
        j++;
    }
    const initialSigns = cutPoints[j][1];
    const ruler = new Ruler(
        initialSigns * locArray[i][2] + locArray[i][0],
        initialSigns * locArray[i][3] + locArray[i][1],
        +circleParam.value * +scaleParam.value,
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
    clearCxt(topCanvas.getContext('2d')!);
    clearCxt(bottomCanvas.getContext('2d')!);
    clearCxt(funcCanvas.getContext('2d')!);
}

function clearCxt(cxt: CanvasRenderingContext2D) {
    cxt.save();
    cxt.resetTransform();
    cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height)
    cxt.restore();
}
/**
 * computes the parametric functions'
 * [x(t), y(t), x'(t), y'(t), arcLenth(t), curvature(t)]
 * all as JavaScript function of one variable
 */
function buildNecessaryExpressions(xExp: nerdamer.Expression, yExp: nerdamer.Expression) {
    const dx = nerdamer.diff(xExp, "t");
    const dy = nerdamer.diff(yExp, "t");

    const dx_2 = nerdamer.diff(dx, "t");
    const dy_2 = nerdamer.diff(dy, "t");

    const curvatureExp = nerdamer( `((${dx.text()}) * (${dy_2.text()}) - (${dx_2.text()}) * (${dy.text()}))/((${dx.text()})^2 + (${dy.text()})^2)^1.5`);
    const arcLengthExp = nerdamer(`sqrt((${dx.text()})^2 + (${dy.text()})^2)`);
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
    console.time("calc loc");
    const [xFunc, yFunc, dx, dy, arcLengthExp, curvature] = buildNecessaryExpressions(nerdamer(xParam.value), nerdamer(yParam.value));

    const t1 = +t1Param.value,
        t2 = +t2Param.value;

    let sign = 1;
    const rotDirec = cuspPoints[0]?.[1] || (revolve.checked ? -1 : 1);
    const newCuspPoints: [number, number, number, number][] = [[t1, 0, 0, 1]];
    const newCutPoints: [number, number][] = [[t1, 1]];

    const step = +drawingStepParam.value,
        radius = +circleParam.value,
        scale = +scaleParam.value;
    const locations: number[][] = [];

    // pre-compute the arcLength for every t
    const arcLengths = new Float64Array(Math.ceil((t2 - t1) / step));
    // trapezoidal rule numerical integration
    // lastV = f(x_{k-1})
    for (let i = 1, sum = arcLengthExp(t1) * 0.5, lastV = 0; i < arcLengths.length; i++) {
        sum += lastV;
        lastV = arcLengthExp(t1 + i * step);
        arcLengths[i] = (sum + lastV * 0.5) * step;
    }
    outer: for (let t = t1, i = 0, idx = 0, lastNormal = 0, lastCuspIdx = 1, offset = 0; t < t2; t += step, i++) {
        const normal = -dx(t) / dy(t);
        if (Math.sign(normal * lastNormal) === -1) { // normal changes sign
            // for stationary points only
            if (Math.abs(normal - lastNormal) > 1)
                newCutPoints.push([t, sign = -sign]);
        }

        const cv = Math.abs(curvature(t))
        if (cv > 50) {        // infinite curvature -> cusp
            const lastCusp = newCuspPoints[lastCuspIdx];
            const currentCusp = lastCusp || [t, cv, 0, 1];

            let flag = false;
            if (!lastCusp) {
                newCuspPoints.push(currentCusp);
            } else {
                // update the previous cusp's curvature if the current curvature is larger
                if (cv > lastCusp[1]) {
                    lastCusp[0] = t;
                    lastCusp[1] = cv;
                    lastCusp[2] |= 1; // mark increasing trend
                } else { // curvature stop increasing: curvature is the maximum
                    flag = revolve.checked && lastCusp[2] === 1; // cusp is available and has an increasing trend
                }
            }
            if (flag) {
                let cuspX, cuspY, rotAngle, cuspT, r1, r2;

                // this branch is problematic. abort.
                if (false && cv > 100000) { // extremely large curvature: cusp at the current t
                    cuspX = xFunc(t);
                    cuspY = yFunc(t);
                    // rotAngle = arcLength / radius;
                    cuspT = t;
                    r1 = lastNormal;
                    r2 = Math.atan(-dx(t + step) / dy(t + step));;
                } else { // otherwise cusp at the previous t
                    idx--; // decrement idx to override the value (last value) at the cusp
                    let i = -1;
                    // find the last non NaN value
                    do {
                        if (idx + i < 0) continue outer;
                        [cuspX, cuspY, , , rotAngle] = locations[idx + i--];
                    } while (isNaN(cuspX));
                    cuspT = t - step;
                    r1 = Math.atan(-dx(t - 2 * step) / dy(t - 2 * step));
                    r2 = Math.atan(normal);
                }

                currentCusp[2] |= 2; // set flag to false: this cusp is no longer available

                // change sign? vertical or horizontal cusp
                const temp = Math.abs(r2 - r1);
                const radians = temp < Math.PI / 2 ? Math.PI - temp : temp;
                for (let i = 0; i < radians; i += step * 4) {
                    locations[idx++] = [
                        cuspX,
                        cuspY,
                        radius * Math.cos(r1 + rotDirec * i) * scale,
                        radius * Math.sin(r1 + rotDirec * i) * scale,
                        rotAngle + i,
                        cuspT
                    ];
                }
                locations[idx++] = [
                    cuspX,
                    cuspY,
                    radius * Math.cos(r1 + rotDirec * radians) * scale,
                    radius * Math.sin(r1 + rotDirec * radians) * scale,
                    rotAngle + radians,
                    cuspT
                ];

                offset += radius * radians; // 

                const lastCut = newCutPoints[newCutPoints.length - 1]
                if (!lastCut || Math.abs(lastCut[0] - t) >= 2 * step) // if the t-value of the lastCut is not the same as this cusp
                    newCutPoints.push([cuspT + step, sign = -sign]); // add a new cut corresponding to this cusp
                else {
                    lastCut[1] = sign = -sign; // otherwise, update the sign of the previous cusp
                }
            }
        } else { // curvature falls below threshold: set last cusp to undefined
            lastCuspIdx = newCuspPoints.length;
        }

        const rotAngle = (arcLengths[i] + offset) / radius;
        const delX = radius / Math.sqrt(normal * normal + 1);
        const delY = delX * normal;
        if (Math.abs(normal) > 10e100) { // special case to handle: normal is +/- infinity
            locations[idx++] = [xFunc(t) * scale, yFunc(t) * scale, radius * scale, 0, rotAngle, t];
        } else {
            if (isFinite(normal) && isFinite(rotAngle)) {
                locations[idx++] = [xFunc(t) * scale, yFunc(t) * scale, delX * scale, delY * scale, rotAngle, t];
            } else {
                locations[idx++] = [NaN, NaN, NaN, NaN, NaN, NaN];
            }
        }
        lastNormal = normal;
    }
    // do not reuse old sign if inconsistent
    // if (newCutPoints.length !== cutPoints.length) {
    //     cutPoints = [];
    // }
    // if (newCuspPoints.length !== cuspPoints.length) {
    //     cuspPoints = [];
    // }

    const signRow = document.getElementById("sign-adjust")!;
    signRow.innerHTML = "";
    for (let i = 0; i < newCutPoints.length; i++)
        signRow.appendChild(createSignElement(
            i,
            (newCutPoints[i][1] = cutPoints[i]?.[1] || newCutPoints[i][1]) === 1 ? "+" : "-", // reuse existing sign if possible
            newCutPoints[i][0],
            (newCutPoints[i + 1] || [t2])[0] // use last t at the end
        ));

    const rotRow = document.getElementById("rot-adjust")!;
    rotRow.innerHTML = "";
    for (let i = 0; i < newCuspPoints.length; i++) {
        let sign;
        if (cuspPoints[i] && cuspPoints[i][1] !== 0) {
            sign = cuspPoints[i][1]
        } else if (revolve.checked) {
            sign = -1;
        } else {
            sign = i % 2 === 0 ? -1 : 1;
        }
        newCuspPoints[i][3] = sign;
        rotRow.appendChild(createRotElement(
            i,
            sign === -1 ? "-" : "+", // reuse existing sign if possible
            newCuspPoints[i][0],
            (newCuspPoints[i + 1] || [t2])[0] // use last t at the end
        ));
    }

    console.log(newCuspPoints);
    console.log(newCutPoints);

    cutPoints = newCutPoints;
    cuspPoints = newCuspPoints.map(x => [x[0], x[3]]);

    $('[data-toggle="tooltip"]').tooltip();
    locArray = locations;
    console.timeEnd("calc loc");
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
    e.onclick = ev => {
        cutPoints[index][1] = -cutPoints[index][1];
        reverseSign([ev.target as HTMLElement])
    }
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

function reverseAllCutSigns() {
    cutPoints.forEach(p => p[1] = -p[1])
    reverseSign(document.getElementById('sign-adjust')!.children as any)
}

function reverseAllCuspSigns() {
    cuspPoints.forEach(p => p[1] = -p[1])
    reverseSign(document.getElementById('rot-adjust')!.children as any)
    if (revolve.checked) { // revolve direction depends on the initial direction
        previewRuler();
    }
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
    e.title = `Change the direction of rotation for t between ${lower.toFixed(3)} and ${upper.toFixed(3)}`;
    e.disabled = revolve.checked;
    e.onclick = ev => {
        cuspPoints[index][1] = -cuspPoints[index][1];
        reverseSign([ev.target as HTMLElement]);
        if (revolve.checked) {
            previewRuler();
        }
    }
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

/**
 * @param doneCallback function to call after drawing is done
 * @param stepInterval interval to update the progressbar and execute stepAction
 * @param stepAction function to call when drawingStep % stepInterval === 0
 */
function draw(doneCallback = () => { }, stepInterval = 64, stepAction = () => { }) {
    stopFlag = false;
    // storing the reference to global locArray for efficiency
    const _locArray = locArray;
    const _cuspPoints = cuspPoints;
    const _cutPoints = cutPoints;

    if (_locArray.length < 1) return alert("You must first click 'preview' to calculate drawing path");

    const topCxt = topCanvas.getContext("2d")!;
    const bottomCxt = bottomCanvas.getContext("2d")!;
    const funcCxt = funcCanvas.getContext("2d")!;

    const ruler = new Ruler(320, 320, +scaleParam.value * +circleParam.value, getDotArray());
    ruler.showSkeleton = skeletonCheck.checked;

    if (clearBeforeDrawingCheck.checked || !ruler.showSkeleton) {
        clearCxt(bottomCxt);
        clearCxt(topCxt);
    }
    if (!functionCheck.checked) clearCxt(funcCxt);

    setTransform([topCxt, bottomCxt, funcCxt]);

    const progressLabel = document.getElementById('progressLabel')!;
    const progressbar = document.getElementById('progressbar')!;
    progressbar.style.width = "0%";

    console.time("creating tasks");
    const tasks: (() => void)[] = [];
    for (
        let i = 0,
        cut = 0,
        cusp = 0,
        sign = _cutPoints[0][0],
        rot = _cuspPoints[0][0];
        i < _locArray.length;
        i++
    ) {
        if (cut < _cutPoints.length && _locArray[i][5] >= _cutPoints[cut][0])
            sign = _cutPoints[cut++][1];

        let changeRot = false;
        if (cusp < _cuspPoints.length && _locArray[i][5] >= _cuspPoints[cusp][0]) {
            rot = _cuspPoints[cusp++][1];
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

                const progress = ((i / _locArray.length) * 100).toFixed(1);

                // note: this is actually the slowest line because it causes reflow
                progressbar.style.width = progress + "%"; 
                progressLabel.innerHTML = `Drawing: t = ${_locArray[i][5].toFixed(3)}, ${progress}%`;
            }
        })

    }
    tasks.push(() => {
        progressbar.style.width = "100%";
        progressLabel.innerHTML = "Drawing: Finished";
        doneCallback();
    });
    console.timeEnd("creating tasks");

    const speed = Math.ceil(+drawingSpeedParam.value);
    let i = 0;
    window.requestAnimationFrame(animate);
    function animate() {
        if (i < tasks.length && !stopFlag) {
            const bound = Math.min(tasks.length, i + speed)
            for (let j = i; j < bound; j++)
                tasks[j]();
            i += speed;
            window.requestAnimationFrame(animate);
        }
    }
}

/**
 * Numerically integrate function f over [a, b] using the trapezoidal rule
 */
function integrate(f: (x: number) => number, a: number, b: number, n: number) {
    if (Math.abs(b - a) < 1e-8) return 0;
    const step = (b - a) / n;
    let sum = (f(a) + f(b)) * 0.5;
    for (let i = 1; i < n - 1; i++) sum += f(a + i * step);
    return sum * step;
}

class Ruler {
    angle: number;
    offset: number;
    rotSign: number;
    showSkeleton: boolean;

    constructor(public x: number, public y: number, public radius: number, public dots: Dot[]) {
        this.angle = 0;
        this.offset = 0;
        this.rotSign = 1;
        this.showSkeleton = true;
    }

    changeDirection(sign: number) {
        // const a = this.calculateRotation(0);
        if (this.rotSign !== sign) // cancel out previous rotation offset
            this.offset += -sign * 2 * this.angle;
        this.rotSign = sign;
        // console.log((this.calculateRotation(0) - a) % (2*Math.PI), this.angle % (Math.PI * 2));
    }

    erase(bottomCxt: CanvasRenderingContext2D) {
        bottomCxt.save();
        bottomCxt.resetTransform();
        bottomCxt.clearRect(0, 0, bottomCxt.canvas.width, bottomCxt.canvas.height);
        bottomCxt.restore();
    }

    draw(topCxt: CanvasRenderingContext2D, bottomCxt: CanvasRenderingContext2D) {
        bottomCxt.beginPath();
        if (this.showSkeleton) bottomCxt.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);

        topCxt.beginPath();
        for (const dot of this.dots) {
            const radius = (dot.ratio / 100) * this.radius;
            const rad = this.rotSign * this.angle - dot.rotOffset + this.offset;
            const x = this.x + radius * Math.cos(rad);
            const y = this.y + radius * Math.sin(rad);

            topCxt.fillStyle = dot.color;
            topCxt.arc(x, y, dot.size, 0, 2 * Math.PI);
            topCxt.fill();

            if (this.showSkeleton) {
                bottomCxt.moveTo(this.x, this.y);
                bottomCxt.lineTo(x, y);
            }
        }
        bottomCxt.stroke(); // do the bottomCxt operations in the save batch, improving performance
    }

    moveTo(x: number, y: number) {
        this.x = x;
        this.y = y;
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