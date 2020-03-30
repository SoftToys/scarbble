$(function () {
	var width = 23;
	var height = 16;
	var blocksAmount = width * height;
	var blockSize = 15;
	var containerWidth = blockSize * width;

	var container = $(".snake");
	container.css("width", containerWidth);

	for (var i = 1; i <= blocksAmount; i++) {
		container.append('<div class="block">');
	}
	var blocks = $(".block");
	var direction;
	var difficulty;
	var snakeSize;
	var snakeBody = new Array({
		x: 2,
		y: 5
	});
	var commands = [];
	var apple;
	var runInterval;

	var points = 0;
	var start_again = false;

	// initialize
	addUIEventHandlers();

	// run first game
	startNewGame();

	function initStartingVars() {
		direction = 1;
		difficulty = 140;
		snakeSize = 4;
		snakeBody = new Array({
			x: 2,
			y: 5
		});
		commands = [];
		placeApple();
		points = 0;
	}

	function startNewGame() {
		clearInterval(runInterval);
		setTimeout(function () {
			alert(" אתגר לפניך!  \nהשג לפחות 6 תפוחים !\n השתמש בכפתורים 2,8,4,6  ");
			start_again = false;
			$(".block").each(function () {
				$(this).removeClass();
				$(this).addClass('block');
			});
			initStartingVars();
			$(".points").hide();
			$(".snake").show();
			$(".points .text").text("");
			runInterval = setInterval(run, difficulty);
		}, 1500);
	}
	function increaseLevel() {
		difficulty = Math.max(60, difficulty - 15);
		clearInterval(runInterval);
		runInterval = setInterval(run, difficulty);
	}

	function run() {
		doDirectionCommand();
		if (start_again) return;
		var headPos = snakeBody[snakeBody.length - 1];
		var nextHeadPos = getNextPosition(headPos);

		if (isCollision(nextHeadPos)) {
			if (points >= 6) {
				document.dispatchEvent(new Event('game-won'));
			}
			start_again = true;
			setTimeout(function () {
				commands = [];
				$(".snake").hide();
				$(".points .text").text(points);
				$(".points").show();
			}, 700);
			return;
		}


		if (nextHeadPos.x == apple.x && nextHeadPos.y == apple.y) {
			snakeSize++;
			getBlock(apple).removeClass("apple");
			placeApple();
			points += 1;
			increaseLevel();
		}
		getBlock(nextHeadPos).addClass("snake-body");

		snakeBody.push(nextHeadPos);
		//console.log(snakeBody.length);
		if (snakeBody.length > snakeSize) {
			var tail = snakeBody.shift();
			if (tail.x != nextHeadPos.x || tail.y != nextHeadPos.y) getBlock(tail).removeClass("snake-body");
			//getBlock(tail).css("background-color", "red");
			//console.log(tail, nextHeadPos);
		}
	}

	function placeApple() {
		while (true) {
			var pos = {
				x: Math.floor(Math.random() * (width)),
				y: Math.floor(Math.random() * (height))
			};
			var collision = false;
			for (var i in snakeBody) {
				if (i === 0) continue;
				var bodyPos = snakeBody[i];
				if (bodyPos.x == pos.x && bodyPos.y == pos.y) {
					collision = true;
					break;
				}
			}

			if (collision) continue;

			apple = pos;
			getBlock(pos).addClass("apple");
			return;
		}
	}


	function getBlock(pos) {
		var fullLines = pos.y - 1;
		return blocks.eq((pos.y * width) + pos.x);
	}

	function getNextPosition(pos) {
		pos = {
			x: pos.x,
			y: pos.y
		};

		switch (direction) {
			case 0:
				pos.y--;
				break;
			case 1:
				pos.x++;
				break;
			case 2:
				pos.y++;
				break;
			case 3:
				pos.x--;
				break;
		}

		/*if (pos.x >= width) pos.x = 0;
			if (pos.x < 0) pos.x = width - 1;
			if (pos.y >= height) pos.y = 0;
			if (pos.y < 0) pos.y = height - 1;
			*/
		return pos;
	}

	function isCollision(pos) {
		for (var i in snakeBody) {
			if (i === 0) continue;
			var bodyPos = snakeBody[i];
			if (bodyPos.x == pos.x && bodyPos.y == pos.y) {
				return true;
			}
		}

		if (pos.x >= width || pos.x < 0 || pos.y >= height || pos.y < 0) return true;

		return false;
	}

	function pushCommand(direction) {
		commands.push(direction);
	}

	function bindKeys() {
		$(document).keydown(function (e) {
			switch (e.which) {
				case 37:
					pushCommand(3);
					break; //left
				case 38:
					pushCommand(0);
					break;  // up
				case 39:
					pushCommand(1);
					break;  // right
				case 40:
					pushCommand(2);
					break;  // down

				default:
					return; // exit this handler for other keys
			}
			// console.log(e.which);
			e.preventDefault(); // prevent the default action (scroll / move caret)
		});
	}

	function buildUIHooks() {
		$('.buttons .col').each(function (colNum, col) {
			$(col).find('.button').each(function (i, button) {
				var digit = ((i * 3) + 1) + colNum;  // start at 1 and multiply by column number
				if (digit > 0) {
					switch (digit) {
						case 10:
							digit = "*";
							break;
						case 11:
							digit = 0;
							break;
						case 12:
							digit = "#";
							break;
					}
				}
				$(button).attr('data-button', digit.toString());
			});
		});
	}

	var digitDirectionMapping = {
		"4": 3,
		"2": 0,
		"6": 1,
		"8": 2
	};

	function bindClickTouch() {
		buildUIHooks();
		$('.buttons').on("touchstart click", '.button', function () {
			var digitPushed = $(this).attr('data-button');
			var cmd = digitDirectionMapping[digitPushed];
			if (cmd === undefined) return;  // ignore unmapped buttons
			pushCommand(cmd);
		});
	}

	function addUIEventHandlers() {
		bindKeys();
		bindClickTouch();
	}

	function doDirectionCommand() {
		if (commands.length === 0) return;

		// handle pressing `anykey` when game done
		if (start_again) return startNewGame();

		var dirCommand = commands.shift();
		if (dirCommand == direction) return;


		if (dirCommand === 0 && direction === 2) return;
		if (dirCommand === 2 && direction === 0) return;
		if (dirCommand === 3 && direction === 1) return;
		if (dirCommand === 1 && direction === 3) return;

		direction = dirCommand;
	}
});