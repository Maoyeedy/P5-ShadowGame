// Grid 
let strokeWidth = 1
let blockSize = 50
let gridSize = 9
let floorHeight = 0

let gridFill = [0, 0, 100]
let gridStroke = [0]

let blockFill = [60, 100, 50]
let blockStroke = [0]

let playerFill = [0, 0, 0]
let playerStroke = [100]

let bgColor = [210, 100, 50]

// Shadows
let shadowFill = [30, 50, 0, 1]
let playerShadowFill = [30, 50, 0, 1]
let playerShadowLength = 1
let enablePlayerShadow = true

let sunRotateSpeed = Math.PI / 2 // 90 degrees in radians
let sunRotation = 0

// User Settings
let useCoordinates = false
let fontCoordinateSize = 10
let coordinateFill = [15, 100, 50]

let useOrtho = true
let useStackedBlocks = true

let useRotation = true
let rotateSpeed = 0.002

let sceneScale = 1
let sceneScaleScrollStep = 0.0002
let sceneScaleMin = 0.5
let sceneScaleMax = 2

// Runtime Variables
let centerOffset
let blocks = []
let playerPos
let lastMouseX
let rotationDelta = 0

// Assets
let font
let fontHintSize = 16
let music
let musicIsPlayed = false

function preload () {
    soundFormats('mp3')
    music = loadSound('/assets/music.mp3')
    font = loadFont('/assets/FiraCode-Regular.ttf')
}

function setup () {
    createCanvas(windowWidth, windowHeight, WEBGL)

    colorMode(HSL)

    textFont(font)

    centerOffset = floor(gridSize / 2)

    playerPos = createVector(0, 0)

    blocks.push({ position: createVector(1, 1), height: 1 })
    blocks.push({ position: createVector(2, 3), height: 2 })
    blocks.push({ position: createVector(-2, 0), height: 3 })
}

function draw () {
    background(bgColor)
    scale(sceneScale)

    if (useOrtho) { ortho() } else { perspective() }

    rotateX(PI / 3)
    rotateZ(-PI / 4)
    if (useRotation) { rotateZ(rotationDelta) }
    // orbitControl()

    drawShadows()
    drawBlocks()
    drawPlayer()
    drawGrid()
    drawHint()
}

function windowResized () {
    resizeCanvas(windowWidth, windowHeight)
}

function mousePressed () {
    lastMouseX = mouseX
    if (!music.isPlaying()) { music.play() }
}

function mouseDragged () {
    if (mouseIsPressed) {
        let deltaX = mouseX - lastMouseX
        rotationDelta -= deltaX * rotateSpeed

        rotationDelta = constrain(rotationDelta, -PI / 4 + 0.001, PI / 4 - 0.001)
        lastMouseX = mouseX
    }
}

function mouseReleased () {
    lastMouseX = mouseX
}

function mouseWheel (event) {
    sceneScale -= event.delta * sceneScaleScrollStep // 
    sceneScale = constrain(sceneScale, sceneScaleMin, sceneScaleMax)
    return false
}

function keyPressed () {
    if (key === 'Q' || key === 'q') {
        sunRotation -= sunRotateSpeed
    }
    if (key === 'E' || key === 'e') {
        sunRotation += sunRotateSpeed
    }

    // User Settings
    if (key === 'I' || key === 'i') {
        useStackedBlocks = !useStackedBlocks
    }
    if (key === 'O' || key === 'o') {
        useOrtho = !useOrtho
    }
    if (key === 'P' || key === 'p') {
        useCoordinates = !useCoordinates
    }

    // Movement
    let moveDir = createVector(0, 0)

    if (key === 'W' || key === 'w' || keyCode === UP_ARROW) {
        moveDir.y = -1
    } else if (key === 'S' || key === 's' || keyCode === DOWN_ARROW) {
        moveDir.y = 1
    } else if (key === 'A' || key === 'a' || keyCode === LEFT_ARROW) {
        moveDir.x = -1
    } else if (key === 'D' || key === 'd' || keyCode === RIGHT_ARROW) {
        moveDir.x = 1
    }

    if (moveDir.x !== 0 || moveDir.y !== 0) {
        movePlayer(moveDir)
    }
}

function movePlayer (direction) {
    let nextPos = playerPos.copy().add(direction)

    // Check if the move is within bounds
    if (nextPos.x >= -centerOffset && nextPos.x <= centerOffset &&
        nextPos.y >= -centerOffset && nextPos.y <= centerOffset) {

        let canMove = handleCollision(nextPos, direction)

        if (canMove) { playerPos = nextPos }
    }
}


function handleCollision (nextPos, pushDir) {
    let collidedBlockIndex = blocks.findIndex(block => block.position.equals(nextPos))

    if (collidedBlockIndex !== -1) { return pushBlock(collidedBlockIndex, pushDir) }

    return true
}

function pushBlock (blockIndex, pushDir) {
    let block = blocks[blockIndex]
    let newPos = block.position.copy().add(pushDir)

    // Check if the new position is within the grid
    if (newPos.x < -centerOffset || newPos.x > centerOffset || newPos.y < -centerOffset || newPos.y > centerOffset) {
        return false
    }

    // Check if there's another block at the new position
    let nextBlockIndex = blocks.findIndex(b => b.position.equals(newPos))
    if (nextBlockIndex !== -1) {
        // Try to push the next block
        if (!pushBlock(nextBlockIndex, pushDir)) {
            return false
        }
    }

    block.position = newPos
    return true
}

function drawGrid () {
    for (let x = -centerOffset; x <= centerOffset; x++) {
        for (let y = -centerOffset; y <= centerOffset; y++) {
            push()
            translate(x * blockSize, y * blockSize, 0)
            fill(gridFill)
            stroke(gridStroke)
            strokeWeight(strokeWidth)
            box(blockSize, blockSize, floorHeight)

            if (useCoordinates) {
                fill(coordinateFill)
                textAlign(CENTER, CENTER)
                textSize(fontCoordinateSize)
                noStroke()
                translate(0, 0, floorHeight + 0.1)
                text(`[${x},${y}]`, 0, 0)
                // text(`${x},${y}`, 0, 0)
            }
            pop()
        }
    }
}


function drawPlayer () {
    push()
    translate(playerPos.x * blockSize, playerPos.y * blockSize, blockSize / 2)
    fill(playerFill)
    stroke(playerStroke)
    strokeWeight(strokeWidth)
    box(blockSize, blockSize, blockSize)
    pop()
}

function drawBlocks () {
    fill(blockFill)
    stroke(blockStroke)
    strokeWeight(strokeWidth)

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i]

        if (useStackedBlocks) {
            for (let h = 0; h < block.height; h++) {
                push()
                translate(block.position.x * blockSize, block.position.y * blockSize, (h + 0.5) * blockSize)
                box(blockSize, blockSize, blockSize)
                pop()
            }
        } else {
            push()
            translate(block.position.x * blockSize, block.position.y * blockSize, (block.height * blockSize) / 2)
            box(blockSize, blockSize, block.height * blockSize)
            pop()
        }
    }
}


function drawShadows () {
    noStroke()

    // Calculate rotation matrix
    let cosAngle = cos(sunRotation)
    let sinAngle = sin(sunRotation)

    function rotateShadow (x, y, length) {
        let newX = x + length * sinAngle
        let newY = y + length * cosAngle

        // Constrain within bounds
        newX = constrain(newX, -centerOffset - 0.5, centerOffset + 0.5)
        newY = constrain(newY, -centerOffset - 0.5, centerOffset + 0.5)

        return { x: newX, y: newY }
    }

    if (enablePlayerShadow) {
        let playerShadowEnd = rotateShadow(playerPos.x, playerPos.y, playerShadowLength + 0.5)
        let actualPlayerShadowLength = dist(playerPos.x, playerPos.y, playerShadowEnd.x, playerShadowEnd.y)

        if (actualPlayerShadowLength > 0) {
            push()
            fill(playerShadowFill)
            translate(
                (playerPos.x + playerShadowEnd.x) / 2 * blockSize,
                (playerPos.y + playerShadowEnd.y) / 2 * blockSize,
                floorHeight * 0.5 + 0.01
            )
            rotateZ(atan2(playerShadowEnd.y - playerPos.y, playerShadowEnd.x - playerPos.x))
            box(actualPlayerShadowLength * blockSize, blockSize, 0)
            pop()
        }
    }

    for (let block of blocks) {
        let shadowEnd = rotateShadow(block.position.x, block.position.y, block.height + 0.5)
        let actualShadowLength = dist(block.position.x, block.position.y, shadowEnd.x, shadowEnd.y)

        if (actualShadowLength > 0) {
            push()
            fill(shadowFill)
            translate(
                (block.position.x + shadowEnd.x) / 2 * blockSize,
                (block.position.y + shadowEnd.y) / 2 * blockSize,
                floorHeight * 0.5 + 0.02
            )
            rotateZ(atan2(shadowEnd.y - block.position.y, shadowEnd.x - block.position.x))
            box(actualShadowLength * blockSize, blockSize, 0)
            pop()
        }
    }
}

function drawHint () {
    textAlign(CENTER, CENTER)
    textSize(fontHintSize)
    fill(100)
    translate(0, 0, fontHintSize / 2)

    push()
    translate(0, -250, 0)
    rotateX(-PI / 4)
    text('Use WASD or Arrow Keys to move', 0, 0)
    pop()

    push()
    translate(250, 0, 0)
    rotateY(-PI / 4)
    rotateZ(PI / 2)
    text('Use Q and E to rotate the sun', 0, 0)
    pop()
}