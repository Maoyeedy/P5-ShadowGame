// Click and drag the mouse to view the scene from different angles.

function setup () {

    document.oncontextmenu = () => false
    cvs = createCanvas(windowWidth, windowHeight, WEBGL)

    describe('A white box drawn against a gray background.')
}

function draw () {
    background(50)
    // Enable orbiting with the mouse.
    orbitControl()

    // Turn on the lights.
    ambientLight(128, 128, 128)
    directionalLight(128, 128, 128, 0, 0, -1)

    // Draw the box.
    box(50)

    //draw a plane under the box
    push()
    rotateX(HALF_PI)
    translate(0, 0, -25)
    plane(200, 200)
    // translate(0, 0, -50)
    // box(200, 200, 50)
    pop()

}