// Grid 
let blockSize = 50
let gridSize = 9
let floorHeight = 0

// Colors
let bgColor = [210, 100, 50]

let gridFill = [0, 0, 100]
let gridStroke = [0]

let blockFill = [60, 100, 50]
let blockStroke = [0]

let playerFill = [0, 0, 0]
let playerStroke = [100]

// Shadows
let shadowFill = [30, 50, 0, 1]
let playerShadowFill = [30, 50, 0, 1]
let playerShadowLength = 1
let enablePlayerShadow = true

// User Settings
let useOrtho = true
let useStackedBlocks = true
let useRotation = true

let rotateSpeed = 0.01
let strokeWidth = 1
let sceneScale = 1
let sceneScaleScrollStep = 0.001
let sceneScaleMin = 0.5
let sceneScaleMax = 2

// Runtime Variables
let centerOffset
let blocks = []
let playerPos
let lastMouseX
let rotationY = 0

function setup () {
    createCanvas(windowWidth, windowHeight, WEBGL)
    colorMode(HSL)

    // noCursor()
    centerOffset = floor(gridSize / 2)

    playerPos = createVector(0, 0)

    blocks.push({ position: createVector(1, 1), height: 1 })
    blocks.push({ position: createVector(2, 2), height: 2 })
    blocks.push({ position: createVector(-2, 0), height: 3 })
}

function draw () {
    background(bgColor)
    scale(sceneScale)

    if (useOrtho) { ortho() } else { perspective() }

    rotateX(PI / 3)
    rotateZ(-PI / 4)
    if (useRotation) rotateZ(rotationY)

    drawShadows()
    drawBlocks()
    drawPlayer()
    drawGrid()
}

function windowResized () {
    resizeCanvas(windowWidth, windowHeight)
}

function mousePressed () {
    if (mouseButton === RIGHT) {
        lastMouseX = mouseX
    }
}

function mouseDragged () {
    if (mouseIsPressed && mouseButton === RIGHT) {
        let deltaX = mouseX - lastMouseX
        rotationY -= deltaX * rotateSpeed

        rotationY = constrain(rotationY, -PI / 4 + 0.01, PI / 4 - 0.01)
        lastMouseX = mouseX
    }
}

function mouseReleased () {
    if (mouseButton === RIGHT) {
        lastMouseX = mouseX
    }
}

function mouseWheel (event) {
    sceneScale -= event.delta * sceneScaleScrollStep // 
    sceneScale = constrain(sceneScale, sceneScaleMin, sceneScaleMax)
    return false
}

function keyPressed () {
    // User Settings
    if (key === 'T' || key === 't') {
        useStackedBlocks = !useStackedBlocks
    }
    if (key === 'O' || key === 'o') {
        useOrtho = !useOrtho
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

        if (canMove) {
            playerPos = nextPos
        }
    }
}


function handleCollision (nextPos, pushDir) {
    let collidedBlockIndex = blocks.findIndex(block => block.position.equals(nextPos))

    if (collidedBlockIndex !== -1) {
        return pushBlock(collidedBlockIndex, pushDir)
    }

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

    if (enablePlayerShadow) {
        let playerShadowEnd = constrain(playerPos.y + playerShadowLength, -centerOffset, centerOffset)
        let actualPlayerShadowLength = playerShadowEnd - playerPos.y

        if (actualPlayerShadowLength > 0) {
            push()
            fill(playerShadowFill)
            translate(
                playerPos.x * blockSize,
                (playerPos.y + actualPlayerShadowLength / 2 + 0.5) * blockSize,
                floorHeight * 0.5 + 0.01
            )
            box(blockSize, actualPlayerShadowLength * blockSize, 0)
            pop()
        }
    }

    for (let block of blocks) {
        let shadowEnd = constrain(block.position.y + block.height, -centerOffset, centerOffset)
        let actualShadowLength = shadowEnd - block.position.y

        if (actualShadowLength > 0) {
            push()
            fill(shadowFill)
            translate(
                block.position.x * blockSize,
                (block.position.y + actualShadowLength / 2 + 0.5) * blockSize,
                floorHeight * 0.5 + 0.02
            )
            box(blockSize, actualShadowLength * blockSize, 0)
            pop()
        }
    }
}