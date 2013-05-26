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
var Game = {
	_matrixWidth : 8,
	_matrixHeight: 6,
	MAX_LENGTH_PATH : 40,
	MAX_TILES_IN_A_ROW : 5,
	_stage : null,
	_tracking : false,
	_interactable : false,
	matrix : Matrix,
	_score : 0,
	_moves : 10,
	gesture : Gesture,
	_movement : Movement,
	_tilePos : null,
	init : function(stage, canvas) {
		this._interactable = false;
		this.stage = stage;
		this._canvas = canvas;
		this.matrix.init(this._matrixWidth, this._matrixHeight);
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
						this.stage.removeChild(this._trackingPath.shift());
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
						this.stage.removeChild(this._trackingPath.shift());
					}
					this._trackingPath = [];
					this._tracking = true;	
					this._trackingPath.push(this._createCursorStep(1.0, x, y));
					this.gesture.start(x, y);
				}
				break;
			case 'mouseup':
				if (this._tracking && this._interactable) {
					this._tracking = false;
					while(this._trackingPath.length > this.MAX_LENGTH_PATH) {
						// remove children
						this.stage.removeChild(this._trackingPath.shift());
					}
					this._trackingPath.push(this._createCursorStep(1.0, x, y));
					var opacityStep = 1/this._trackingPath.length;
					setTimeout(function(){Game._fadeOutTrackingPath(0.9, opacityStep);}, 250);
					this.gesture.end(x, y);
					this._handleMove();
				}
				break;
		}
		this.stage.update();
	},
	_handleMove : function() {
		switch(this.gesture.getOrientation()) {
			case 'vertical':
				this._movement.create().shiftCol();
				break;
			case 'horizontal':
				this._movement.create().shiftRow();
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
		this.stage.update();
		sourceOpacity =  sourceOpacity-opacityStep;
		if (sourceOpacity >= 0.01) {
			// fade all children some more
			setTimeout(function(){Game._fadeOutTrackingPath(sourceOpacity, opacityStep);}, 20);
		} else {
			// remove all children
			while(this._trackingPath.length > 0) {
				this.stage.removeChild(this._trackingPath.shift());
			}
			this.stage.update();
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
		this.stage.addChild(cursor);
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
		this._checkTurn();
	},
	_checkTurn : function() {
		this._interactable = false;
		this._done = [];
		this._hits = [];
		for(var y=0;y<this.matrix.getLengthY();y++) {
			for(var x=0;x<this.matrix.getLengthX();x++) {
				var thisCell = this.matrix.getCell(x,y);
				if (thisCell == null) {
					continue;
				}
				// X-axis
				var row = [];
				var m=1;
				while(this.matrix.getCell(x+m, y) != null && thisCell.colourIndex == this.matrix.getCell(x+m, y).colourIndex && m < this.MAX_TILES_IN_A_ROW) {
					if (m==1) {
						row.push(thisCell);
					}
					row.push(this.matrix.getCell(x+m, y));
					m++;
				}
				if (row.length > 2 && !this._areCoordinatesAlreadyMatched(row)) {
					this._hits.push(row);
				}
				// Y-axis
				row = [];
				m=1;
				while(this.matrix.getCell(x,y+m) != null && thisCell.colourIndex == this.matrix.getCell(x,y+m).colourIndex && m < this.MAX_TILES_IN_A_ROW) {
					if (m==1) {
						row.push(thisCell);
					}
					row.push(this.matrix.getCell(x,y+m));
					m++;
				}
				if (row.length > 2 && !this._areCoordinatesAlreadyMatched(row)) {
					this._hits.push(row);
				}
				// diagonals
				row = [];
				m=1;
				while(this.matrix.getCell(x+m, y+m) != null && thisCell.colourIndex == this.matrix.getCell(x+m, y+m).colourIndex && m < this.MAX_TILES_IN_A_ROW) {
					if (m==1) {
						row.push(thisCell);
					}
					row.push(this.matrix.getCell(x+m,y+m));
					m++;
				}
				if (row.length > 2 && !this._areCoordinatesAlreadyMatched(row)) {
					this._hits.push(row);
				}
			}
		}
		this._turnScore = 0;
		setTimeout(function(){Game._parseNextHit();}, 20);
	},
	/* every Hit - a full row of at least 3-in-a-row - will be shifted off and dropped */
	_parseNextHit : function() {
		if (this._hits.length > 0) {
			var hit = this._hits.shift();
			this._turnScore = this._turnScore+hit.length*10;
			setTimeout(function(){Game._fadeTileSet(hit);}, 20);
		} else {
			this._increaseScore(this._turnScore); 
			this._turnScore = 0;
			this._interactable = true;
		}
	},
	_fadeTileSet : function(tileSet) {
		for (var h=0;h<tileSet.length;h++) {
			tileSet[h].fadeOut(10, 10, 0, 1, Game.onFinishFadeTileSet(tileSet));
		}
	},	
	onFinishFadeTileSet : function(tileSet) {
		for(var t=0;t<tileSet.length;t++) {
			this.matrix.removeCell(tileSet[t].x, tileSet[t].y);
			this.stage.removeChild(tileSet[t].shape);
		}
		setTimeout(function(){Game._parseNextHit();}, 500);
	},

	/* animate a single hit frame per row */
//	_animateHitFrame: function(row, colour, alpha) {
		// TODO: for later revision
//		if (false || colour[0] < 255 || colour[1] < 255 || colour[2] < 255) {
//			for(var r=0;r<row.length;r++) {
//				//this.stage.removeChild(row[r]);
//				//row[r].graphics.beginFill("#FFFFFF").drawRoundRect(row[r].x*100+this._offsetLeft, row[r].y, 64, 64, 6);
//				//this.stage.addChildAt(row[r], row[r].id);
//				//row[r].set({filters:[new createjs.ColorFilter(frameNr, frameNr, frameNr, 1, 255, 0, 0, 0)]});
//				row[r].shape.set({red:255});
//			}
//			setTimeout(function(){Game._animateHitFrame(row, colour, alpha);}, 10*alpha);
//		} else 

		
	//},
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
					if (row[n].getId() == this._hits[h][h2].getId()) {
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
				var colourIndex = this._generateRandomColour();
				var cell = new Cell(x, y, colourIndex, true, 100).render();
				this.matrix.setCell(x, y, cell);
			}
		}
		this.stage.update();
	},
	_generateRandomColour : function(x, y) {
		return Math.floor(Math.random()*this.colours.length);
	},
	colours : [
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

