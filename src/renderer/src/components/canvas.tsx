import { Component, onMount } from "solid-js";
import { utilFoo, renderCircle, 
        renderText, renderRedCircle,
        missile, testDrone 
} from "../utils/canvasUtils";

interface renderBuffObj {
    x: number;
    y: number;
    id: string;
}

const Canvas: Component = () => {
    let global_x = 0;
    let global_y = 0;
    let renderBuffer: renderBuffObj[] = [];
    
    // All rendering should happen in this function.
    function renderObjs(ctx) {
        // pop from buffer and draw
        while (renderBuffer.length > 0) {
            let obj = renderBuffer.shift()!;
            
            if (testDrone.alive == true) {
                testDrone.findNextPoint();
                renderCircle(ctx, testDrone.x, testDrone.y);
                renderText(ctx, testDrone.z.toString(), testDrone.x + 10, testDrone.y + 5);
            }
            if (missile.alive == true) {
                missile.findNextPoint();
                renderRedCircle(ctx, missile.x, missile.y);
                renderText(ctx, missile.z.toString(), missile.x + 10, missile.y + 5);
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
        // console.log("testIntervalFoo called");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas);
        let obj: renderBuffObj = {
            x: 50 + global_x,
            y: 50 + global_y,
            id: "test1"
        }
        renderBuffer.push(obj);
        secTriggerCheck();
        requestAnimationFrame(() => renderObjs(ctx));

        global_x += 1;
        global_y += 1;
    }

    
    let frameCount = 0
    function secTriggerCheck() {
        frameCount += 1;
        if (frameCount >= 30) {
            console.log("Second triggered");
            frameCount = 0;
        }
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