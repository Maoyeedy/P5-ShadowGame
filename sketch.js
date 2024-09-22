// Grid 
let strokeWidth = 1
let blockSize = 50
let gridSize = 9
let floorHeight = 0

let bgColor = [210, 100, 50]

let gridFill = [0, 0, 100]
let gridStroke = [0]

let blockFill = [60, 100, 50]
let blockStroke = [0]

let playerFill = [0, 0, 0]
let playerStroke = [100]

let targetColor = [210, 100, 50]
let targetStroke = [0]
let targetStrokeWidth = 1
let targetPosition
let targetRadius = 1

// Shadows
let shadowFill = [30, 50, 0, 1]
let playerShadowFill = [30, 50, 0, 1]
let playerShadowLength = 1
let enablePlayerShadow = false

let sunRotateSpeed = Math.PI / 2 // 90 degrees in radians
let sunRotation = 0

// User Settings
let enableMusic = true

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
let nextPos
let lastMouseX
let rotationDelta = 0
let cosAngle
let sinAngle

// Assets
let font
let fontHintSize = 16
let music
let musicIsPlayed = false
let finishSFX

// Message
let message = ''
let messageDuration = 0
let messageColor = [0, 0, 100]
let messageSize = 24

function ResetMessage (newMessage, duration) {
    message = newMessage
    messageDuration = duration
}

function DrawMessage () {
    if (messageDuration > 0) {
        messageDuration -= deltaTime
    } else {
        message = ''
    }

    push()
    textSize(messageSize)
    textAlign(CENTER, CENTER)
    fill(messageColor)
    text(message, 0, 300)
    pop()
}

function preload () {
    // should always use relative path for github pages
    font = loadFont('./assets/FiraCode-Regular.ttf')
    if (enableMusic) {
        soundFormats('mp3')
        music = loadSound('./assets/music.mp3')
        finishSFX = loadSound('./assets/SFXfinish.mp3')
    }
}

function tryPlayMusic () {
    if (enableMusic) {
        if (!music.isPlaying()) { music.play() }
    }
}

function setup () {
    createCanvas(windowWidth, windowHeight, WEBGL)

    colorMode(HSL)

    textFont(font)

    centerOffset = floor(gridSize / 2)

    calculateSunAngle()

    playerPos = createVector(0, 0)

    blocks.push({ position: createVector(0, -3), height: 4 })
    blocks.push({ position: createVector(3, -2), height: 3 })
    blocks.push({ position: createVector(2, 3), height: 5 })
    // blocks.push({ position: createVector(-2, 0), height: 3 })
    targetPosition = createVector(2, 2)

    music.setVolume(0.1)
    finishSFX.setVolume(1)
}

function levelComplete () {
    ResetMessage('Level Finished!', 10000)
    if (enableMusic && !finishSFX.isPlaying()) {
        finishSFX.play()
    }
}

function draw () {
    background(bgColor)
    scale(sceneScale)

    if (useOrtho) { ortho() } else { perspective() }

    DrawMessage()

    rotateX(PI / 3)
    rotateZ(-PI / 4)
    if (useRotation) { rotateZ(rotationDelta) }
    // orbitControl()

    drawShadows()
    drawBlocks()
    drawPlayer()
    drawGrid()
    drawHint()
    drawTarget(targetPosition.x, targetPosition.y)
}

function windowResized () {
    resizeCanvas(windowWidth, windowHeight)
}

function mousePressed () {
    lastMouseX = mouseX
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
    tryPlayMusic()

    if (key === 'Q' || key === 'q') {
        rotateSun(-1)
    }
    if (key === 'E' || key === 'e') {
        rotateSun(1)
    }

    if (key === 'R' || key === 'r') {
        location.reload() // Reload the page when 'R' is pressed
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

function calculateSunAngle () {
    cosAngle = cos(sunRotation)
    sinAngle = sin(sunRotation)
}

function rotateSun (direction) {
    sunRotation += direction * sunRotateSpeed
    calculateSunAngle()

    if (!isInShadow(playerPos)) {
        sunRotation -= direction * sunRotateSpeed
        calculateSunAngle()
        ResetMessage('This rotation will make player outside shadow.', 2000)
    }
}

function isInShadow (position) {


    for (let block of blocks) {
        let shadowEnd = createVector(
            block.position.x + (block.height + 0.5) * sinAngle,
            block.position.y + (block.height + 0.5) * cosAngle
        )

        if (position.x >= min(block.position.x, shadowEnd.x) &&
            position.x <= max(block.position.x, shadowEnd.x) &&
            position.y >= min(block.position.y, shadowEnd.y) &&
            position.y <= max(block.position.y, shadowEnd.y)) {
            return true
        }
    }

    return false
}

function movePlayer (direction) {
    nextPos = playerPos.copy().add(direction)
    if (nextPos.x >= -centerOffset && nextPos.x <= centerOffset &&
        nextPos.y >= -centerOffset && nextPos.y <= centerOffset) {

        let inShadow = isInShadow(nextPos)
        let canMove = handleCollision(nextPos, direction)

        if (!canMove) { ResetMessage('Cannot move out of bounds.', 2000) }
        if (!inShadow) { ResetMessage('Cannot move outside shadow.', 2000) }

        if (canMove && inShadow) {
            playerPos = nextPos
            if (playerPos.equals(targetPosition)) {
                levelComplete()
            }
        }
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

    // Check if the new position is within bounds
    if (newPos.x < -centerOffset || newPos.x > centerOffset || newPos.y < -centerOffset || newPos.y > centerOffset) {
        return false
    }

    // Check if there's block at new position
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

    function rotateShadow (x, y, length) {
        let newX = x + length * sinAngle
        let newY = y + length * cosAngle

        // Constrain shadow within bounds
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
    push()

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

    pop()
}

function drawTarget (x, y) {
    push()
    translate(x * blockSize, y * blockSize, floorHeight + 0.2)
    fill(targetColor)
    stroke(targetStroke)
    strokeWeight(targetStrokeWidth)
    ellipse(0, 0, targetRadius * blockSize)
    pop()
}

