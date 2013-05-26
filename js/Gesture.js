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