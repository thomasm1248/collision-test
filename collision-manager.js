/* Collision Manager for circle-based collisions

This package requires access to 2d-vecters.js

Todo:
- Eventually merge the contents of this package with game-util-functions.js

*/

/*
This method assumes that each input object is round, and has pos,
vel, and mass attributes.
*/
function calculateBounce(ball1, ball2) {
    // Get normal that collision will happen on
    normal = ball2.pos.subtract(ball1.pos).normalize();

    // Project velocities of both balls onto normal
    var v1 = ball1.vel.dot(normal);
    var v2 = ball2.vel.dot(normal);

    // Use formula to calculate final velocities
    var v1f = (v1 * (ball1.mass - ball2.mass) + 2 * ball2.mass * v2) / (ball1.mass + ball2.mass);
    var v2f = (v2 * (ball2.mass - ball1.mass) + 2 * ball1.mass * v1) / (ball2.mass + ball1.mass);

    // Apply changes to the velocities of each ball
    ball1.vel.accum(normal.scale(v1f - v1));
    ball2.vel.accum(normal.scale(v2f - v2));

    // Figure out how much they overlap
    var overlap = ball1.rad + ball2.rad - ball1.pos.dist(ball2.pos);

    // Calculate how much to shift each ball based on the overlap and their masses
    var totalMass = ball1.mass + ball2.mass;
    var ball1Shift = ball2.mass / totalMass * overlap;
    var ball2Shift = ball1.mass / totalMass * overlap;

    // Apply the calculated shift
    ball1.pos.accum(normal.scale(-ball1Shift));
    ball2.pos.accum(normal.scale(ball2Shift));
}



// Testing area

// Initialize canvas
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Make a list of balls with random positions, velocities, and masses
var balls = [];
for(var i = 0; i < 20; i++) {
    var ball = {
        pos: new V(Math.random() * canvas.width, Math.random() * canvas.height),
        vel: new V(Math.random() * 5 - 2.5, Math.random() * 5 - 2.5),
        mass: Math.random() * 10 + 5,
        rad: 0
    };
    ball.rad = ball.mass * 2;
    ball.box = new V(ball.rad, ball.rad);
    balls.push(ball);
}

// Setup stuff for ball that can be fired with mouse
var firing = false;
var newBall;

// Draw loop
function draw() {
    window.requestAnimationFrame(draw);

    // Collisions
    for(var i = 0; i < balls.length; i++) {
        var b1 = balls[i];
        for(var j = i + 1; j < balls.length; j++) {
            var b2 = balls[j];

            if(b1.pos.dist(b2.pos) <= b1.rad + b2.rad) {
                calculateBounce(b1, b2);
            }
        }
    }

    // Movement
    for(var i = 0; i < balls.length; i++) {
        // Bounce off walls
        if(balls[i].pos.x < balls[i].rad) balls[i].vel.x *= -1;
        if(balls[i].pos.y < balls[i].rad) balls[i].vel.y *= -1;
        if(balls[i].pos.x > canvas.width - balls[i].rad) balls[i].vel.x *= -1;
        if(balls[i].pos.y > canvas.height - balls[i].rad) balls[i].vel.y *= -1;
        bindObjectToCanvas(balls[i], canvas);

        // Remove if it goes to the right
        if(balls[i].pos.x > canvas.width / 2) {
            balls.splice(i, 1);
            i--;
            continue;
        }

        // Apply friction
        var norm = balls[i].vel.norm();
        var friction = 0.01;
        balls[i].vel = balls[i].vel.scale(norm <= friction ? 0 : (norm - friction) / norm);

        // Apply velocity to position
        balls[i].pos.accum(balls[i].vel);
    }

    // Draw everything
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "gray";
    for(var i = 0; i < balls.length; i++) {
        ctx.beginPath();
        ctx.arc(balls[i].pos.x, balls[i].pos.y, balls[i].rad, 0, 2 * Math.PI);
        ctx.stroke();
    }
    if(firing) {
        ctx.beginPath();
        ctx.arc(newBall.pos.x, newBall.pos.y, newBall.rad, 0, 2 * Math.PI);
        ctx.stroke();
    }
    // Draw cutoff line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}
draw();

window.onclick = function(e) {
    var mouse = new V(e.pageX, e.pageY);

    if(firing) {
        newBall.vel = mouse.subtract(newBall.pos).scale(0.05);
        balls.push(newBall);
        firing = false;
    } else {
        newBall = {
            pos: mouse,
            mass: Math.random() * 10 + 5,
            rad: 0
        };
        newBall.rad = newBall.mass * 2;
        newBall.box = new V(newBall.rad, newBall.rad);
        firing = true;
    }
}
