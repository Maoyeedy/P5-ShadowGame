function setup() {
	createCanvas(windowWidth, windowHeight);
	cursor('pointer');
}

function draw() {
	fill('lime');
	rect(20, 10, 100, 50);

	if (inFill(mouseX, mouseY)) {
		fill('blue');
		rect(20, 10, 100, 50);
	}
}

