let cvs

// Grid 
const strokeWidth = 1
const blockSize = 50
const gridSize = 9
const floorHeight = 0

const bgColor = [210, 100, 50]

const gridFill = [0, 0, 100]
const gridStroke = [0]

const blockFill = [60, 100, 50]
const blockStroke = [0]

const player1Fill = [0, 0, 0]
const player1Stroke = [100]
const player2Fill = [0, 0, 90]
const player2Stroke = [0]

const targetColor = [210, 100, 50]
const targetStroke = [0]
const targetStrokeWidth = 1
const targetRadius = 1

// Shadows
const shadowFill = [30, 50, 0, 1]
const playerShadowFill = [30, 50, 0, 1]
const playerShadowLength = 1
const enablePlayerShadow = false

const sunRotateAngle = Math.PI / 2
const sunRotationDuration = 250

let sunRotation = 0
let targetSunRotation = 0
let sunRotationStartTime = 0
let isSunRotating = false

// User Settings
let useOrtho = true
let useStackedBlocks = true
let useCoordinates = false
const fontCoordinateSize = 10
const coordinateFill = [15, 100, 50]

const enableRotation = true
const rotateSpeed = 0.002

const sceneScaleScrollStep = 0.0002
const sceneScaleMin = 0.5
const sceneScaleMax = 2
let sceneScale = 1.5

// Runtime Variables
let centerOffset
let blocks = []

let player1Pos
let player2Pos
let nextPos

let targetPosition

let lastMouseX
let rotationDelta = 0
let cosAngleSun
let sinAngleSun

// Assets
let font
let hintSize = 16
let finishSFX
let errorSFX
let music
let musicIsPlayed = false

// Message
let message = ''
let messageDuration = 0
let messageColor = [0, 0, 100]
let messageSize = 20
let messagePosY = 375

function preload () {
    // should always use relative path for github pages
    font = loadFont('./assets/FiraCode-Regular.ttf')

    soundFormats('mp3')
    music = loadSound('./assets/music.mp3')
    finishSFX = loadSound('./assets/SFXfinish.mp3')
    errorSFX = loadSound('./assets/SFXmistake.mp3')
}

function setup () {
    // Only enable thisfor screenshot
    document.oncontextmenu = () => false

    // Audio
    music.setVolume(0.1)
    errorSFX.setVolume(1)
    finishSFX.setVolume(1)

    // Canvas
    cvs = createCanvas(windowWidth, windowHeight, WEBGL)
    // cvs.doubleClicked(() => fullscreen(!fullscreen()))

    colorMode(HSL)
    textFont(font)

    // Calculate
    centerOffset = floor(gridSize / 2)
    calculateSunAngle()

    // Spawn
    player1Pos = createVector(0, 0)
    player2Pos = createVector(-4, -4)

    blocks.push({ position: createVector(0, -3), height: 4 })
    blocks.push({ position: createVector(3, -1), height: 3 })
    blocks.push({ position: createVector(2, 4), height: 5 })

    targetPosition = createVector(4, 4)
}

function draw () {
    background(bgColor)

    if (isSunRotating) {
        let elapsedTime = millis() - sunRotationStartTime

        if (elapsedTime < sunRotationDuration) {
            let t = elapsedTime / sunRotationDuration
            sunRotation = lerp(sunRotation, targetSunRotation, t)
        } else {
            sunRotation = targetSunRotation
            isSunRotating = false
        }
        calculateSunAngle()
    }

    DrawMessage()

    translate(0, blockSize, 0) // Camera Offset

    if (useOrtho) { ortho() } else { perspective() }
    scale(sceneScale)

    rotateX(PI / 3)
    rotateZ(-PI / 4)
    if (enableRotation) { rotateZ(rotationDelta) }

    drawShadows()
    drawBlocks()
    drawPlayer(player1Pos, player1Fill, player1Stroke)
    drawPlayer(player2Pos, player2Fill, player2Stroke)
    drawGrid()
    drawHint()
    drawTarget(targetPosition.x, targetPosition.y)
}

function tryPlayAudio (audio) {
    if (!audio.isPlaying()) { audio.play() }
}

function levelFinish () {
    ResetMessage('Level Finished!', 10000)
    tryPlayAudio(finishSFX)
}

function windowResized () {
    resizeCanvas(windowWidth, windowHeight)
}

function mousePressed () {
    lastMouseX = mouseX
    tryPlayAudio(music)
}
function mouseDragged () {
    if (mouseIsPressed) {
        let deltaX = mouseX - lastMouseX
        rotationDelta -= deltaX * rotateSpeed

        // rotationDelta = constrain(rotationDelta, -PI / 4 + 0.001, PI / 4 - 0.001)
        rotationDelta = constrain(rotationDelta, 0, PI / 2)
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
    if (!isSunRotating) {
        if (key === 'Q' || key === 'q') {
            rotateSun(-1)
        }
        if (key === 'E' || key === 'e') {
            rotateSun(1)
        }
    }

    if (key === 'R' || key === 'r') {
        location.reload()
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

    // Movement for player1 (WASD)
    let moveDir1 = createVector(0, 0)
    if (key === 'W' || key === 'w') {
        moveDir1.y = -1
    } else if (key === 'S' || key === 's') {
        moveDir1.y = 1
    } else if (key === 'A' || key === 'a') {
        moveDir1.x = -1
    } else if (key === 'D' || key === 'd') {
        moveDir1.x = 1
    }

    if (moveDir1.x !== 0 || moveDir1.y !== 0) {
        movePlayer(player1Pos, moveDir1, true)
    }

    // Movement for player2 (Arrow keys)
    let moveDir2 = createVector(0, 0)
    if (keyCode === UP_ARROW) {
        moveDir2.y = -1
    } else if (keyCode === DOWN_ARROW) {
        moveDir2.y = 1
    } else if (keyCode === LEFT_ARROW) {
        moveDir2.x = -1
    } else if (keyCode === RIGHT_ARROW) {
        moveDir2.x = 1
    }

    if (moveDir2.x !== 0 || moveDir2.y !== 0) {
        movePlayer(player2Pos, moveDir2, false)
    }
}

function calculateSunAngle () {
    cosAngleSun = cos(sunRotation)
    sinAngleSun = sin(sunRotation)
}

function rotateSun (direction) {
    targetSunRotation = sunRotation + direction * sunRotateAngle
    sunRotationStartTime = millis()
    isSunRotating = true
}
// function rotateSun (direction) {
//     sunRotation += direction * sunRotateAngle
//     calculateSunAngle()

//     // if (!isInShadow(player1Pos)) {
//     //     sunRotation -= direction * sunRotateAngle
//     //     calculateSunAngle()
//     //     ResetMessage('This rotation will make player outside shadow.', 2000)
//     // }
// }

function isInShadow (position) {
    for (let block of blocks) {
        // Check if the position is at the bottom of this block
        if (position.x === block.position.x && position.y === block.position.y) {
            continue // Skip shadow check for this block if we're at its bottom
        }

        let shadowEnd = createVector(
            block.position.x + (block.height + 0.5) * sinAngleSun,
            block.position.y + (block.height + 0.5) * cosAngleSun
        )

        // Calculate the boundaries of the shadow
        let minX = min(block.position.x, shadowEnd.x)
        let maxX = max(block.position.x, shadowEnd.x)
        let minY = min(block.position.y, shadowEnd.y)
        let maxY = max(block.position.y, shadowEnd.y)

        // Check if the position is within the shadow boundaries
        if (position.x >= minX && position.x <= maxX &&
            position.y >= minY && position.y <= maxY) {

            // Additional check to exclude the bottom edge of the block
            if (!(position.x === block.position.x && position.y === block.position.y)) {
                return true
            }
        }
    }

    return false
}

function movePlayer (playerPos, direction, isPlayer1) {
    let nextPos = playerPos.copy().add(direction)

    if (isOutOfBounds(nextPos)) {
        return
    }

    let isNextPosInShadow = isInShadow(nextPos)
    let otherPlayerPos = isPlayer1 ? player2Pos : player1Pos

    if (isIllegalMove(isPlayer1, isNextPosInShadow) || isOverlap(nextPos, otherPlayerPos)) {
        return
    }

    if (handleCollision(nextPos, direction)) {
        updatePlayerPosition(playerPos, nextPos, isPlayer1)
    }
}

function isOutOfBounds (pos) {
    return pos.x < -centerOffset || pos.x > centerOffset ||
        pos.y < -centerOffset || pos.y > centerOffset
}

function isIllegalMove (isPlayer1, isNextPosInShadow) {
    if ((isPlayer1 && !isNextPosInShadow) || (!isPlayer1 && isNextPosInShadow)) {
        let message = isPlayer1 ? 'Player 1 shall not move OUTSIDE shadow.' : 'Player 2 shall not move INSIDE shadow.'
        ResetMessage(message, 2000)
        errorSFX.play()
        return true
    }
    return false
}

function isOverlap (nextPos, otherPlayerPos) {
    if (nextPos.equals(otherPlayerPos)) {
        ResetMessage('Players shall not overlap.', 2000)
        errorSFX.play()
        return true
    }
    return false
}

function updatePlayerPosition (currentPos, nextPos, isPlayer1) {
    if (isPlayer1) {
        player1Pos = nextPos
        if (player1Pos.equals(targetPosition)) {
            levelFinish()
        }
    } else {
        player2Pos = nextPos
        if (player2Pos.equals(targetPosition)) {
            // levelFinish()
            ResetMessage('No, you should help Player 1 get here.', 2000)
            errorSFX.play()
        }
    }
}

// https://poe.com/chat/3lttxnlbs7wkmiybel1 to make collision work on the other player
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
function drawPlayer (pos, fillColor, strokeColor) {
    push()
    translate(pos.x * blockSize, pos.y * blockSize, blockSize / 2 + 0.001)
    fill(fillColor)
    stroke(strokeColor)
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
        let newX = x + length * sinAngleSun
        let newY = y + length * cosAngleSun

        // Constrain shadow within bounds
        newX = constrain(newX, -centerOffset - 0.5, centerOffset + 0.5)
        newY = constrain(newY, -centerOffset - 0.5, centerOffset + 0.5)

        return { x: newX, y: newY }
    }

    if (enablePlayerShadow) {
        let playerShadowEnd = rotateShadow(player1Pos.x, player1Pos.y, playerShadowLength + 0.5)
        let actualPlayerShadowLength = dist(player1Pos.x, player1Pos.y, playerShadowEnd.x, playerShadowEnd.y)

        if (actualPlayerShadowLength > 0) {
            push()
            fill(playerShadowFill)
            translate(
                (player1Pos.x + playerShadowEnd.x) / 2 * blockSize,
                (player1Pos.y + playerShadowEnd.y) / 2 * blockSize,
                floorHeight * 0.5 + 0.01
            )
            rotateZ(atan2(playerShadowEnd.y - player1Pos.y, playerShadowEnd.x - player1Pos.x))
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
    textSize(hintSize)
    fill(100)
    translate(0, 0, hintSize / 2)

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
    strokeWeight(strokeWidth)
    ellipse(0, 0, targetRadius * blockSize)
    pop()
}

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
    text(message, 0, messagePosY)
    pop()
}