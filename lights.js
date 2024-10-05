function setup () {
    document.oncontextmenu = () => false
    cvs = createCanvas(windowWidth, windowHeight, WEBGL)
}

function draw () {
    background(50)

    orbitControl()

    ambientLight(128, 128, 128)
    directionalLight(128, 128, 128, 0, 0, -1)

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