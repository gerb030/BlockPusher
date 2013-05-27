var Movement = {
	_currentCell : null,
	create : function() {
		this._currentCell = null;
		this._state = 0; 
		/*
		0 : first cell is being removed
		1 : we're animating the remainder of the row/col
		2 : we're add the new cell
		3 : we're delegating control back to the Game object
		*/
		return this;
	},
	shiftRow : function() {
		var row = Game.matrix.getRow(Game.gesture.getElement());
		switch(Game.gesture.getDirection()) {
			case -1:
				currentCell = 0;
				break;
			case 1:
			default:
				currentCell = row.length;
				break;
		}
	},
	shiftCol : function() {
		alert('no shiftCol yet');
	},
	handleNextStep : function() {
		switch(this._state) {
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:

				break;
		}
	}
}