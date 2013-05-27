function CellSet(set) {
	this._set = set;
	this.get = function(index) {
		if (this._set[index] != undefined) return this._set[index];
	};
	this.getLength = function() {
		return this._set.length;
	};
	this.fadeOutSet = function() {
		for(var t=0;t<this.getLength();t++) {
			var cell = this.get(t);
			cell.fadeOut(10, 0, 1, this);
		}		
	},
	this.onFinishFadeSet = function() {
		for(var t=0;t<this.getLength();t++) {
			var cell = this.get(t);
			Game.matrix.removeCell(cell.x, cell.y);
			var shapes = cell.getShapes();
			for (var s in shapes) {
 				Game.stage.removeChild(shapes[s]);
 			}
		}
		setTimeout(function(){Game._parseNextHit();}, Config.animTimerBeforeStartFadeOut);
	};
};