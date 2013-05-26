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
	// fuckThis : function() {
	// 	for(var thisY=0;thisY<this._matrix.length;thisY++) {
	// 		for(var thisX=0;thisX<this._matrix[thisY].length;thisX++) {
	// 			console.log(this._matrix[thisY][thisX].getId());
	// 		}
	// 	}
	// },
	getCell : function(x, y) {
		var cell = (this._matrix[y]!=undefined && this._matrix[y][x]!=undefined ? this._matrix[y][x] : null);
		if (cell != null) {
			cell.x = x;
			cell.y = y;
			cell.xPos = this.calcX(x);
			cell.yPos = this.calcY(y);
		}
		return cell;
	},
	setCell : function(x, y, cell) {
		if (this._matrix[y] == undefined) {
			this._matrix[y] = [];
		}
		this._matrix[y][x] = cell;
	},
	removeCell : function(x, y) {
		this._matrix[y][x].visible = false;
	},
	getRow : function(y) {
		return this._matrix[y];
	},
	getCol : function(x) {
		var col = [];
		for(var thisY=0;thisY<this._matrix.length;thisY++) {
			col.push(this._matrix[thisY][x]);
		}
		return col;
	},
	shiftRow : function(y, cell) {
		var row = this._matrix.getRow(rowNr);
		switch(direction) {
			// right-to-left
			case -1:
				row.shift();
				row.push(cell);
				break;
			// left-to-right
			case 1:
			default:
				row.pop();
				row.splice(0,1,cell);
				break;
		}
	},
	shiftCol : function(colNr, direction, newShape, colour) {
		var col = this._matrix.getRow(rowNr);
		switch(direction) {
			// right-to-left
			case -1:
				col.shift();
				col.push(cell);
				break;
			// left-to-right
			case 1:
			default:
				col.pop();
				col.splice(0,1,cell);
				break;
		}
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