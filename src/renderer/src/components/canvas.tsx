import { Component, onMount } from "solid-js";
import { utilFoo, drawCircle, drawRedCircle, missile, testDrone } from "../utils/canvasUtils";

interface renderBuffObj {
    x: number;
    y: number;
    id: string;
}

const Canvas: Component = () => {
    let global_x = 0;
    let global_y = 0;
    let d1_x = 0;
    let d1_y = 0;
    let renderBuffer: renderBuffObj[] = [];
    
    function renderObjs(ctx) {
        // pop from buffer and draw
        while (renderBuffer.length > 0) {
            let obj = renderBuffer.shift()!;
            
            d1_x = obj.x;
            d1_y = obj.y;
            if (testDrone.alive == true) {
                drawCircle(ctx, 1, 0);
            }
            if (missile.alive == true) {
                drawRedCircle(ctx, 0, 0);
            }
            
            // drawRedCircle(ctx, 0, 0);
        }

    }

    function drawGrid(ctx, canvas) {
        ctx.beginPath();
        ctx.moveTo(canvas.width * (1/3), 0);
        ctx.lineTo(canvas.width * (1/3), canvas.height);
        ctx.moveTo(canvas.width * (2/3), 0);
        ctx.lineTo(canvas.width * (2/3), canvas.height);

        ctx.moveTo(0, canvas.height * (1/3));
        ctx.lineTo(canvas.width, canvas.height * (1/3));
        ctx.moveTo(0, canvas.height * (2/3));
        ctx.lineTo(canvas.width, canvas.height * (2/3));
        ctx.stroke();
    }
    
    function testIntervalFoo(ctx, canvas) {
        console.log("testIntervalFoo called");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas);
        let obj: renderBuffObj = {
            x: 50 + global_x,
            y: 50 + global_y,
            id: "test1"
        }
        renderBuffer.push(obj);

        requestAnimationFrame(() => renderObjs(ctx));

        global_x += 1;
        global_y += 1;
    }

    onMount(() => {
        console.log("Canvas component mounted");
        const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
        
        if (canvas) {
            // Set canvas size
            canvas.width = 600;
            canvas.height = 600;
            const ctx = canvas.getContext("2d");
            // requestAnimationFrame(testFrame);
            setInterval(() => testIntervalFoo(ctx, canvas), 1000 / 30);
        }
    });
    return (
        <div>
            <p>Canvas Component</p>
            <div id="grid">
                <canvas id="canvas"></canvas>
            </div>
        </div>
    );
};

export default Canvas;