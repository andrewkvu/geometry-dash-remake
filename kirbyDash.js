// Be sure to name any p5.js functions we use in the global so Glitch can recognize them.
// Add to this list as you consult the p5.js documentation for other functions.
/* global createCanvas, collideRectRect, colorMode, HSB, width, height, random, background, fill, color, random,
          rect, ellipse, stroke, image, loadImage, round, collideCircleCircle, collideRectCircle, collideLineCircle, text, loop, noLoop,
          mouseX, mouseY, strokeWeight, line, mouseIsPressed, windowWidth, windowHeight, noStroke, clear, textAlign, CENTER, LEFT,
          keyCode, UP_ARROW, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, textSize, frameRate, noFill, frameCount */

/*
ideas / to do list: 
DONE!
*/
let backgroundColor, score;
let p1;
let lineh;
let walls = [];
let platforms = [];
let hitWall, platformHit, hitUnderPlatform;
let z;
let gameIsOver;
let clouds, kirby, kirbyBG;
let wallFreq, platFreq;

function setup() {
    // Canvas & color settings
    createCanvas(800, 450);
    colorMode(HSB, 360, 100, 100);
    backgroundColor = 95;
    frameRate(60);
    score = 0;
    p1 = new Player();
    lineh = height / 1.5 - 15; // height of the imaginary line for p1 to land on
    gameIsOver = false;
    wallFreq = 75; // frequency of walls being spawned
    platFreq = 100; // frequency of platforms being spawned
    clouds = loadImage(
        "https://cdn.glitch.com/0e10ce17-1d9c-4741-92bd-cc160fc6efcf%2Fezgif.com-rotate.gif?v=1596053884521"
    ); // cloud gif
    kirby = loadImage(
        "https://cdn.glitch.com/0e10ce17-1d9c-4741-92bd-cc160fc6efcf%2FCandidClumsyGypsymoth-size_restricted.gif?v=1596054248626"
    ); // kirby gif
    kirbyBG = loadImage(
        "https://cdn.glitch.com/0e10ce17-1d9c-4741-92bd-cc160fc6efcf%2Fd9uiss7-4443838e-b723-48b6-b14d-865e98311d3f.png?v=1596072824278"
    ); // kirby background
}

function draw() {
    gameIsOver = false;
    background(kirbyBG); // loads background
    // fill("blue");
    // rect(0, height / 1.5, width, 2); // the line
    // displayScore();

    p1.show(); // shows the character
    p1.update(); // updates the movement of the character
    // console.log(p1.y);
    // console.log(p1.velocity);
    // console.log(p1.gravity);
    // console.log(p1.lift);
    // console.log(platformHit);
    console.log(wallFreq);
    console.log(platFreq);
    wallCreation();
    platformCreation();

    displayScore();
    image(clouds, 0, -50, width); // loads clouds
    // point collision with the side???????
}
class Player {
    constructor() {
        this.size = 30; // size of kirby
        this.x = 50; // where kirby stays for the entire game
        this.y = 50; // where kirby spawns (out of the sky)
        this.gravity = 1.1; // force that pushes kirby down
        this.lift = 40; // boost that pushes kirby up, has to be high enough so that velocity is offset and is negative so that
        // you will be pushed up instead of being pushed down by gravity
        this.velocity = 0; // base air velocity
    }

    show() {
        image(kirby, this.x, this.y, this.size, this.size); // loads in kirby
    }

    update() {
        this.velocity += this.gravity; // base velocity gets increased by gravity
        this.velocity *= 0.9; // makes sure there is a cap on the velocity
        this.y += this.velocity; // changes the y position by this velocity

        if (this.y > lineh - this.size / 2) {
            // this.size/2 is basically the radius of the kirby
            this.y = lineh - this.size / 2;
        }
    }

    up() {
        if (
            this.y == lineh - this.size / 2 || // if the y position is on the imaginary line OR
            this.y == platforms.y - this.size / 2 // if the y position is on a platform
        ) {
            this.velocity -= this.lift; // decrease the velocity to be negative so that the kirby will jump
        }
    }
}

class Wall {
    constructor() {
        this.height = 50; // height of the wall
        this.x = random(width, width * 1.5); // positions the wall from the end of the screen to even more off the screen
        this.y = lineh + 19 - this.height; // starts at the top left of the wall, so it has to be just high enough
        this.width = 20; // width of the wall
        this.speed = 4; // speed at which the wall moves past
    }
    show() {
        fill("red");
        rect(this.x, this.y, this.width, this.height); // red wall
    }

    update() {
        this.x -= this.speed; // changes x position of the wall to imitate movement
        if (score >= 0 && score < 50) {
            // speed changes based on score
            this.speed = 4;
        } else if (score >= 50 && score < 100) {
            this.speed = 5;
        } else if (score >= 100 && score < 200) {
            this.speed = 7;
        } else if (score >= 200) {
            this.speed = 8;
        }
    }

    offscreen() {
        return this.x < -this.width; // returns a value of true or false that shows whether something is offscreen or not
    }
}

class Platform {
    constructor() {
        this.height = 20;
        this.x = random(width, width * 1.5); // change this to be random if i want to
        this.y = height / 2; // middle of the screen
        this.width = 100; // length of the platform
        this.speed = 4; // speed at which it passes by
        this.highlight = false; // default white color
    }

    show() {
        fill("white");
        if (this.highlight == true) {
            // part of the collision detection
            fill("cyan");
        }
        rect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed; // same as the wall
        if (score >= 0 && score < 50) {
            this.speed = 4;
        } else if (score >= 50 && score < 100) {
            this.speed = 5;
        } else if (score >= 100 && score < 200) {
            this.speed = 7;
        } else if (score >= 200) {
            this.speed = 8;
        }
    }
    offscreen() {
        return this.x < -this.width;
    }
}

function displayScore() {
    if (frameCount % 10 == 0) {
        score++; // adds a point to your score every 10 frames
    }
    fill(0);
    textSize(15);
    textAlign(LEFT);
    text(`Score: ${score}`, 20, 20);
    if (score < 50 && gameIsOver == false) {
        text('Press "w" to jump', 20, 80);
    }
    if (score >= 0 && score < 50) {
        text("Speed: Easy", 20, 50);
    } else if (score >= 50 && score < 100) {
        text("Speed: Normal", 20, 50);
    } else if (score >= 100 && score < 200) {
        text("Speed: Hard", 20, 50);
    } else if (score >= 200) {
        text("Speed: Impossible", 20, 50);
    }
}

function keyPressed() {
    if (keyCode === 82) {
        // click 'r' to restart
        restartGame();
    } else if (keyCode === 87 || keyCode === 32 || keyCode === 38) {
        // click 'w' to jump, can also use space and up arrow
        p1.up();
        if (platformHit) {
            p1.velocity -= p1.lift; // can jump immediately off of a platform
        }
    }
}

function restartGame() {
    score = 0; // resets the score
    p1 = new Player(); // creates the new player
    platFreq = 100;
    wallFreq = 75;
    walls.length = 0; // resets the length of the walls array to remove them off the screen
    platforms.length = 0; // resets the length of the platforms array to remove them off the screen
    loop();
}

function wallCreation() {
    if (score > 200) {
        // if on impossible mode
        wallFreq = 50; // wall frequency is faster
    }
    if (frameCount % wallFreq == 0) {
        walls.push(new Wall()); // push a new obstacle every 'wallFreq' number of frames
    }

    for (let i = walls.length - 1; i >= 0; i--) {
        walls[i].show(); // show walls
        walls[i].update(); // update movement of walls
        // console.log(walls.length);
        if (walls[i].offscreen() == true) {
            // if the walls are offscreen
            walls.splice(i, 1); // remove them from the array
            // console.log(walls.length); // the walls on screen are the only ones that are in the array, saves memory
        }
        hitWall = collideRectCircle(
            // collision detection between player and wall
            walls[i].x - 5,
            walls[i].y - 5,
            walls[i].width,
            walls[i].height,
            p1.x,
            p1.y,
            p1.size
        );

        if (hitWall) {
            // if you hit the wall
            gameIsOver = true;
            gameOver(); // end game
        }
    }
}

function platformCreation() {
    // similar to wallCreation but for the Platform Class

    if (score > 200) {
        platFreq = 75;
    }
    if (frameCount % platFreq == 0) {
        platforms.push(new Platform());
    }

    for (let i = platforms.length - 1; i >= 0; i--) {
        platforms[i].show();
        platforms[i].update();
        // console.log(platforms.length);
        if (platforms[i].offscreen() == true) {
            platforms.splice(i, 1);
            // console.log(platforms.length);
        }
        platformHit = collideLineCircle(
            platforms[i].x,
            platforms[i].y - p1.size / 2,
            platforms[i].x + platforms[i].width,
            platforms[i].y - p1.size / 2,
            p1.x,
            p1.y,
            p1.size
        );
        if (platformHit) {
            // if the platform is hit on the top
            // console.log('wassup');
            p1.y = platforms[i].y - p1.size; // lock the position at the height of the platform
            platforms[i].highlight = true; // set the highlight to true for the color change
        } else {
            platforms[i].highlight = false; // by default, no highlight
        }
        hitUnderPlatform = collideLineCircle(
            platforms[i].x - 10, // x1
            platforms[i].y + platforms[i].height, // y1
            platforms[i].x + platforms[i].width - 10, // x2
            platforms[i].y + platforms[i].height, // y2
            p1.x,
            p1.y,
            p1.size
        );
        if (hitUnderPlatform) {
            // console.log("its ya boi");
            p1.velocity = 0;
            p1.gravity = 5; // make the kirby fall really fast
        } else {
            p1.gravity = 1.1; // by default, keep kirby at normal gravity
        }
    }
}

function gameOver() {
    // game over screen
    fill("red");
    textSize(100);
    textAlign(CENTER);
    text("GAME OVER", width / 2, height / 2 - 60);
    textSize(30);
    textAlign(CENTER);
    text('Click "r" to restart', width / 2, height / 2 - 20);
    noLoop();
}