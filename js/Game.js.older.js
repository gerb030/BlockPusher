var Config = {
	_tilePos : 0,
	_tileWidth : 72,
	_tileSpacing : 8,
	_offsetTop : 64,
	_offsetLeft : 82,
	init : function() {
		this._tilePos = this._tileSpacing+this._tileWidth;
	},
};
var Matrix = {
	_lengthY : 0,
	_lengthX : 0,
	_matrix : [],
	init : function(lengthX, lengthY) {
		Config.init();
		this._lengthX = lengthX;
		this._lengthY = lengthY;
		this._tilePos = this._tileSpacing+this._tileWidth;
	},
	getLengthX : function() {
		return this._lengthX;
	},
	getLengthY : function() {
		return this._lengthY;
	},
	getCell : function(x, y) {
		var data = (this._matrix[y]!=undefined && this._matrix[y][x]!=undefined ? this._matrix[y][x] : {colour : -1, shape : null, visible : false});
		data.x = x;
		data.y = y;
		data.xPos = this.calcX(x);
		data.yPos = this.calcY(y);
		return data;
	},
	setCell : function(x, y, data) {
		if (this._matrix[y] == undefined) {
			this._matrix[y] = [];
		}
		this._matrix[y][x] = data;
	},
	removeCell : function(x, y) {
		this._matrix[y][x].visible = false;
	},
	getRow : function(y) {
		var row = [];
		for(var thisX=0;thisX<this._matrix[y];thisX++) {
			row.push({shape : this._matrix[y][thisX].shape, colour : this._matrix[y][thisX].colour, visible : this._matrix[y][thisX].visible});
		}
		return row;
	},
	getCol : function(x) {
		var col = [];
		for(var thisY=0;thisY<this._matrix.length;thisY++) {
			col.push({shape : this._matrix[thisY][x].shape, colour : this._matrix[thisY][x].colour, visible : this._matrix[thisY][x].visible});
		}
		return col;
	},
	shiftRow : function(rowNr, direction, data) {
		var cell = {shape : data.shape, colour : data.colour, visible : true};
		var newRow = this.getRow(rowNr);
		switch(direction) {
			// right-to-left
			case -1:
				newRow.shift();
				newRow.push(cell);
				break;
			// left-to-right
			case 1:
			default:
				newRow.pop();
				newRow.splice(0,1,cell);
				break;
		}
//		for(var xx=0;xx<newRow.length;xx++) {
//			this.setCell(xx, rowNr, newRow[xx]);
//		}
	},
	shiftCol : function(colNr, direction, newShape, colour) {
		alert("you cannot shift cols yet");
	},
	debugRow : function(rowNr, direction) {
		console.log('length: '+this._matrix[rowNr].length);
		for (var i=0;i<this._matrix[rowNr].length;i++) {
			console.log('x:'+i+',y:'+rowNr+' -> '+this._matrix[rowNr][i].colour);
		}
	},
	calcX : function(x) {
		return x*Config._tilePos+Config._offsetLeft;
	},
	calcY : function(y) {
		return y*Config._tilePos+Config._tileSpacing+Config._offsetTop;
	},
};
var Gesture = {
	_startX : null,	
	_startY : null,	
	_endX : null,	
	_endY : null,
	_orientation : null,
	_element : null,
	_direction : null,
	start : function(startX, startY) {
		this._endX = null;
		this._endY = null;
		this._orientation = null;
		this._element = null;
		this._startX = startX,	
		this._startY = startY,	
		this._startX = this._startX - Config._offsetLeft;
		this._startY = this._startY - Config._offsetTop;
	},
	end : function(endX, endY) {
		this._endX = endX;
		this._endY = endY;
		this._endX = this._endX - Config._offsetLeft;
		this._endY = this._endY - Config._offsetTop;
		this.parse();
	},
	parse : function() {
		var startRow = Math.ceil(this._startY / Config._tileWidth)-1; 
		var endRow = Math.ceil(this._endY / Config._tileWidth)-1;
		var startCol = Math.floor(this._startX / Config._tileWidth); 
		var endCol = Math.floor(this._endX / Config._tileWidth);
		if (startRow == endRow) {
			this._orientation = 'horizontal';
			this._element = startRow;
			this._direction = (endCol >= startCol) ? 1 : -1;
		} else if (startCol == endCol) {
			this._orientation = 'vertical';
			this._element = startCol;
			this._direction = (endRow >= startRow) ? 1 : -1;
		}
	},
	getOrientation : function() {
		return this._orientation;
	},
	getElement : function() {
		return this._element;
	},
	getDirection : function() {
		return this._direction;
	}
};
var Game = {
	_matrixWidth : 8,
	_matrixHeight: 6,
	MAX_LENGTH_PATH : 40,
	MAX_TILES_IN_A_ROW : 5,
	_stage : null,
	_tracking : false,
	_interactable : false,
	_matrix : Matrix,
	_score : 0,
	_moves : 10,
	_gesture : Gesture,
	_tilePos : null,
	init : function(stage, canvas) {
		this._interactable = false;
		this._stage = stage;
		this._canvas = canvas;
		this._matrix.init(this._matrixWidth, this._matrixHeight);
		this._trackingPath = [];
	},
	handleMouseEvent : function(mouseEvent) {
		var x = mouseEvent.clientX-18;
		var y = mouseEvent.clientY-82;
		switch(mouseEvent.type) {
			case 'mousemove':
				if (this._tracking && this._interactable) {
					while(this._trackingPath.length > this.MAX_LENGTH_PATH) {
						// remove children
						this._stage.removeChild(this._trackingPath.shift());
					}
					var opacity = 0;
					var l = this._trackingPath.length;
					var opacityStep = 1/l;
					for(var p=0;p<l;p++) {
						opacity = opacity+opacityStep;
						this._trackingPath[p] = this._redrawCursor(this._trackingPath[p], opacity);
					}
					this._trackingPath.push(this._createCursorStep(1.0, x, y));
				}
				break;
			case 'mousedown':
				if (this._interactable) {
					while(this._trackingPath.length > 0) {
						this._stage.removeChild(this._trackingPath.shift());
					}
					this._trackingPath = [];
					this._tracking = true;	
					this._trackingPath.push(this._createCursorStep(1.0, x, y));
					this._gesture.start(x, y);
				}
				break;
			case 'mouseup':
				if (this._tracking && this._interactable) {
					this._tracking = false;
					while(this._trackingPath.length > this.MAX_LENGTH_PATH) {
						// remove children
						this._stage.removeChild(this._trackingPath.shift());
					}
					this._trackingPath.push(this._createCursorStep(1.0, x, y));
					var opacityStep = 1/this._trackingPath.length;
					setTimeout(function(){Game._fadeOutTrackingPath(0.9, opacityStep);}, 250);
					this._gesture.end(x, y);
					this._handleMove();
				}
				break;
		}
		this._stage.update();
	},
	_handleMove : function() {
		switch(this._gesture.getOrientation()) {
			case 'vertical':
				this._moveCol(0);
				break;
			case 'horizontal':
				this._moveRow(0);
				break;
			default:
				// no move - do nothing
				break;
		}
	},
	_fadeOutTrackingPath : function(sourceOpacity, opacityStep) {
		var l = this._trackingPath.length;
		var opacity = sourceOpacity;
		for(var p=l-1;p>0;p--) {
			opacity = opacity - opacityStep;
			this._trackingPath[p] = this._redrawCursor(this._trackingPath[p], opacity);
		}
		this._stage.update();
		sourceOpacity =  sourceOpacity-opacityStep;
		if (sourceOpacity >= 0.01) {
			// fade all children some more
			setTimeout(function(){Game._fadeOutTrackingPath(sourceOpacity, opacityStep);}, 20);
		} else {
			// remove all children
			while(this._trackingPath.length > 0) {
				this._stage.removeChild(this._trackingPath.shift());
			}
			this._stage.update();
		}
	},
	_redrawCursor : function(cursor, opacity) {
		var oldX = cursor.x;
		var oldY = cursor.y;
		cursor.graphics = new createjs.Graphics();
		cursor.graphics.beginFill(createjs.Graphics.getRGB(255,255, 255, opacity));
		cursor.graphics.drawCircle(0, 0, 24);
		cursor.x = oldX;
		cursor.y = oldY;
		return cursor;
	},
	_createCursorStep : function(opacity, x, y) {
		var cursor = new createjs.Shape();
		cursor.graphics.beginFill(createjs.Graphics.getRGB(255, 255, 255, opacity)).drawCircle(0, 0, 24);
		cursor.x = x;
		cursor.y = y;
		this._stage.addChild(cursor);
		return cursor;
	},
	startRound : function() {
		this._score = 0;
	    var score = document.getElementById("userScore");
		if (!score) {
		    var score = document.createElement("div");
		    score.id = "userScore";
		    document.body.appendChild(score);			
		}
		this._increaseScore(0);
	    var moves = document.getElementById("userMoves");
		if (!moves) {
		    var moves = document.createElement("div");
		    moves.id = "userMoves";
		    document.body.appendChild(moves);			
		}
		this._moves++;
		this._decreaseMoves();
		this._increaseScore(0);
		this._generateMatrix();
//		this._redrawField();
		this._checkTurn();
	},
	/* THIS METHOD NEED SOME SERIOUS REVISIONING */
//	_redrawField : function() {
//		var tilePos = this._tileSpacing+this._tileWidth;
//		//this._matrixShapes = [];
//		for(var y=0;y<this._matrix.getMaxY();y++) {
//			var yPos = y*tilePos+8+this._offsetTop;
//			for(var x=0;x<this._matrix.length;x++) {
//				var c = this._matrix[y][x];
//				sq = new createjs.Shape();
//				sq.graphics.beginFill(createjs.Graphics.getRGB(this._colours[c]['fill'][0], this._colours[c]['fill'][1], this._colours[c]['fill'][2])).drawRoundRect(x*tilePos+this._offsetLeft, yPos, 64, 64, 6);
//				this._stage.addChild(sq);
//				this._stage.update();
//				this._matrix[y][x]['shape'] = sq;
//			}
//			this._matrixShapes.push(sq);
//		}
//	},
	_checkTurn : function() {
		this._interactable = false;
		this._done = [];
		this._hits = [];
		for(var y=0;y<this._matrix.getLengthY();y++) {
			for(var x=0;x<this._matrix.getLengthX();x++) {
				var thisCell = this._matrix.getCell(x,y);
				if (thisCell.colour== -1) {
					continue;
				}
				// X-axis
				var row = [];
				var m=1;
				while(thisCell.colour == this._matrix.getCell(x+m, y).colour && m < this.MAX_TILES_IN_A_ROW) {
					if (m==1) {
						row.push(thisCell);
					}
					row.push(this._matrix.getCell(x+m, y));
					m++;
				}
				if (row.length > 2 && !this._areCoordinatesAlreadyMatched(row)) {
					this._hits.push(row);
				}
				// Y-axis
				row = [];
				m=1;
				while(thisCell.colour == this._matrix.getCell(x,y+m).colour && m < this.MAX_TILES_IN_A_ROW) {
					if (m==1) {
						row.push(thisCell);
					}
					row.push(this._matrix.getCell(x,y+m));
					m++;
				}
				if (row.length > 2 && !this._areCoordinatesAlreadyMatched(row)) {
					this._hits.push(row);
				}
				// diagonals
				row = [];
				m=1;
				while(thisCell.colour == this._matrix.getCell(x+m, y+m).colour && m < this.MAX_TILES_IN_A_ROW) {
					if (m==1) {
						row.push(thisCell);
					}
					row.push(this._matrix.getCell(x+m,y+m));
					m++;
				}
				if (row.length > 2 && !this._areCoordinatesAlreadyMatched(row)) {
					this._hits.push(row);
				}
			}
		}
		setTimeout(function(hit){Game._parseNextHit();}, 20);
	},
	/* every Hit - a full row of at least 3-in-a-row - will be shifted off and dropped */
	_parseNextHit : function() {
		if (this._hits.length > 0) {
			var hit = this._hits.shift();
			var startColour = Game._colours[hit[0].colour]['fill'];
			setTimeout(function(){Game._animateHitFrame(hit, startColour, 10);}, 100);
		} else {
			this._interactable = true;
		}
	},
	/* animate a single hit frame per row */
	_animateHitFrame: function(row, colour, alpha) {
		// TODO: for later revision
//		if (false || colour[0] < 255 || colour[1] < 255 || colour[2] < 255) {
//			for(var r=0;r<row.length;r++) {
//				//this._stage.removeChild(row[r]);
//				//row[r].graphics.beginFill("#FFFFFF").drawRoundRect(row[r].x*100+this._offsetLeft, row[r].y, 64, 64, 6);
//				//this._stage.addChildAt(row[r], row[r].id);
//				//row[r].set({filters:[new createjs.ColorFilter(frameNr, frameNr, frameNr, 1, 255, 0, 0, 0)]});
//				row[r].shape.set({red:255});
//			}
//			setTimeout(function(){Game._animateHitFrame(row, colour, alpha);}, 10*alpha);
//		} else 
		if (alpha >= 0) {
			for(var r=0;r<row.length;r++) {
				row[r].shape.set({alpha:alpha/10});
			}
			this._stage.update();
			alpha--;
			setTimeout(function(){Game._animateHitFrame(row, colour, alpha);}, 25);
		} else {
			for(var r=0;r<row.length;r++) {
				this._matrix.removeCell(row[r].x, row[r].y);
				this._stage.removeChild(row[r].shape);
			}
			this._increaseScore(row.length*10); 
			this._parseNextHit();
		}
		
	},
	_increaseScore : function(points) {
		this._score = this._score + points;
		document.getElementById('userScore').innerHTML = 'score: '+this._score;
	},
	_decreaseMoves : function() {
		this._moves--;
		document.getElementById('userMoves').innerHTML = 'moves left: '+this._moves;
	},
	/* animate a single hit frame per row */
	_removeHitFrame: function(row) {
		
	},
	_areCoordinatesAlreadyMatched : function(row) {
		for (var h in this._hits) {
			for (var h2 in this._hits[h]) {
				for (var n=0;n<row.length;n++) {
					if (row[n].shape == this._hits[h][h2].shape) {
						return true;
					}
				}
			}
		}
		return false;
	},
	_generateMatrix : function() {
		for(var y=0;y<this._matrixHeight;y++) {
			for(var x=0;x<this._matrixWidth;x++) {
				var data = this._generateRandomTile(x, y);
				this._matrix.setCell(x, y, {colour : data[1], shape : data[0], visible: true});
			}
		}
		this._stage.update();
	},
	_generateRandomTile : function(x, y) {
		var c = Math.floor(Math.random()*this._colours.length);
		sq = new createjs.Shape();
		sq.graphics.beginFill(createjs.Graphics.getRGB(this._colours[c]['fill'][0], this._colours[c]['fill'][1], this._colours[c]['fill'][2])).drawRoundRect(null, null, 64, 64, 6);
		sq.x = this._matrix.calcX(x);
		sq.y = this._matrix.calcY(y);
		this._stage.addChild(sq);
		return [sq,c];
	},
	
	// FROM here on out-- everything breaks
	_moveRow : function(index) {
		var rowNr = this._gesture.getElement();
		var direction = this._gesture.getDirection();
		var row = this._matrix.getRow(rowNr);
		if (row == undefined) return;
		var oldCell = null;
		switch(direction) {
			// right-to-left
			case -1:
				oldCell = row.shift();
				break;
			// left-to-right
			case 1:
			default:
				oldCell = row.pop();
				break;
		}
		switch(index) {
			case 0:
				if (oldCell != null && oldCell.shape != null) {
					setTimeout(function(){Game._fadeOutCell(oldCell.colour, oldCell.shape, 100, 5);}, 10);
					break;
				}
			default:
				if (oldCell == undefined) {
					// NO MORE MOVES, let's create a new cell and return control
					console.log("------------------>>");
					console.log(this._matrix.getRow(rowNr));
					var x = (direction == -1) ? this._matrixWidth-1 : 0; 
					var data = this._generateRandomTile(x, rowNr);
					this._matrix.shiftRow(rowNr, direction, data);
					this._matrix.debugRow(rowNr);
					console.log("NO MORE MOVES (index:"+index+"), let's create a new cell and return control");
//				} else if (oldCell.shape == null && row.length > 1) {
//					console.log('IEFIEGFJIWE');
//					switch(direction) {
//						// right-to-left
//						case -1:
//							oldCell = row.shift();
//							break;
//						// left-to-right
//						default:
//						case 1:
//							oldCell = row.pop();
//							break;
//					}
				} else if (oldCell.visible == false) {
					index++;
					this._moveRow(index);
					return;
				} else {
					var endPos = null;
					if (direction == -1) {
						endPos = oldCell.shape.x-Config._tileWidth-Config._tileSpacing;
					} else {
						endPos = oldCell.shape.x+Config._tileWidth+Config._tileSpacing;
					} 
					this._moveCell(index, oldCell.colour, oldCell.shape, endPos);
				}
				// TODO : deal with incoming changes
				break;
		}		
		// TODO: port the rest of this method
	},
/*
	_moveCol : function(index) {
		var colNr = this._gesture.getElement();
		var orientation = this._gesture.getOrientation();
		var direction = this._gesture.getDirection();
		// TODO: column moving
	},
*/	
	_moveCell : function(index, colour, shape, endPos) {
		var orientation = this._gesture.getOrientation();
		var direction = this._gesture.getDirection();
		switch (orientation) {
			case 'horizontal':
				if (direction == -1) {
					if (shape.x > endPos) {
						shape.x = shape.x-10; 
						this._stage.update();
						setTimeout(function(){Game._moveCell(index, colour, shape, endPos);}, 10);
					} else {
						shape.x = endPos; 
						this._stage.update();
						index++;
						setTimeout(function(){Game._moveRow(index);}, 10);
					}
				} else {
					if (shape.x < endPos) {
						shape.x = shape.x+10; 
						this._stage.update();
						setTimeout(function(){Game._moveCell(index, colour, shape, endPos);}, 10);
					} else {
						shape.x = endPos; 
						this._stage.update();
						index++;
						setTimeout(function(){Game._moveRow(index);}, 10);
					}
				}
				break;
			case 'vertical':
				// TODO: column handling
				break;
		}
	},
//		var yPos = rowNr*this._tilePos+8+this._offsetTop;
//		switch(direction) {
//			// right-to-left
//			case -1:
////				var x = row.length;
////				for (var r in row) {
////					row[r].x--;
////				}
////				var xPos = x*this._tilePos+this._offsetLeft;
////				var data = this._generateRandomTile(x, y);
////				row[0] = {'c' : data[1], 's' : data[0], 'y' : row, 'x' : x};
////				row[0].shape.set({x:xPos,y:yPos});
//				break;
//			// left-to-right
//			case 1:
//				var x = 0;
//				for (var r in row) {
//					row[r].y++;
//					console.log("doe het");
//					if (row[r].shape!=null) {
//						row[r].shape.set({y:(row[r].y+1)*this._tilePos+8+this._offsetTop});
//					};
//				}
//				this._stage.update();
//				var xPos = x*this._tilePos+this._offsetLeft;
//				row.pop();
//				var data = this._generateRandomTile(xPos, yPos);
//				row[row.length] = {'c' : data[1], 's' : data[0], 'y' : row, 'x' : x};
//				break;
//			default:
//				return;
//		}
	_fadeOutCell : function(colour, shape, currentOpacity, opacityStep) {
		if (currentOpacity >= 0.01) {
			var orientation = this._gesture.getOrientation(); 
			var direction = this._gesture.getDirection(); 
			// fade down opacity some more
			currentOpacity = currentOpacity - opacityStep;
			var oldX = shape.x+(orientation=='horizontal' ? direction : 0);
			var oldY = shape.y+(orientation=='vertical' ? direction : 0);
			shape.graphics = new createjs.Graphics();
			shape.graphics.beginFill(createjs.Graphics.getRGB(this._colours[colour]['fill'][0], this._colours[colour]['fill'][1], this._colours[colour]['fill'][2], currentOpacity/100)).drawRoundRect(0, 0, 64, 64, 6);
			shape.x = oldX;
			shape.y = oldY;
			this._stage.update();
			setTimeout(function(){Game._fadeOutCell(colour, shape, orientation, direction*1.10, currentOpacity, opacityStep);}, 10);
		} else {
			// remove all children
			this._stage.removeChild(shape);
			this._stage.update();
			this._moveRow(1);
		}
	},
//	_moveRowNext : function(row, direction, current, max) {
//		var row = this._matrix[rowNr];
//	},
//	_animRow : function(row, xPos, direction) {
//		var max = this._tileWidth+this._tile;
//		if (xPos < max) {
//			
//		} else {
//			switch(direction) {
//				case 1:
//					break;
//				case -1:
//					break;
//			}
//		}
//	},
	_colours : [
	    {
	    	'fill' : [255, 204, 51],
	    	'hl1' :  [255, 255, 255],
	    	'bk1' :  [102, 102, 102]
	    },
	    {
	    	'fill' : [255, 51, 204],
	    	'hl1' :  [255, 255, 255],
	    	'bk1' :  [102, 102, 102]
	    },
	    {
	    	'fill' : [204, 255, 51],
	    	'hl1' :  [255, 255, 255],
	    	'bk1' :  [102, 102, 102]
	    },
	    {
	    	'fill' : [51, 204, 255],
	    	'hl1' :  [255, 255, 255],
	    	'bk1' :  [102, 102, 102]
	    },
	    {
	    	'fill' : [51, 255, 204],
	    	'hl1' :  [255, 255, 255],
	    	'bk1' :  [102, 102, 102]
	    },
	    {
	    	'fill' : [204, 51, 255],
	    	'hl1' :  [255, 255, 255],
	    	'bk1' :  [102, 102, 102]
	    },
	]
};

