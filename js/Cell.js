function Cell(x, y, colourIndex, visible, alphaPercentage) {
	this.x = x;
	this.y = y;
	this.colourIndex = colourIndex;
	this.visible = visible;
	this._alphaPercentage = (alphaPercentage == undefined) ? 100 : alphaPercentage;
	this._shapes = {},
	this._name = '',
	this.getId = function() {
		return this.x+'.'+this.y;
	};
	this.render = function() {
		this._shapes['outer'] = new createjs.Shape();
		this._shapes['outer'].graphics.beginFill(createjs.Graphics.getRGB(
			Game.colours[this.colourIndex]['fill'][0], 
			Game.colours[this.colourIndex]['fill'][1], 
			Game.colours[this.colourIndex]['fill'][2])).drawRoundRect(null, null, 64, 64, 6);
		this._shapes['outer'].x = Game.matrix.calcX(this.x);
		this._shapes['outer'].y = Game.matrix.calcY(this.y);
		this._shapes['txt'] = new createjs.Text(this.generateName(), "14px Helvetica", "black");
		this._shapes['txt'].x = Game.matrix.calcX(this.x)+10;
		this._shapes['txt'].y = Game.matrix.calcY(this.y)+40;
		this._shapes['txt'].textBaseline = "alphabetic";
		for (var s in this._shapes) {
			Game.stage.addChild(this._shapes[s]);
		}
		return this;
	};
	this.setPosition = function(xPos, yPos) {
		this._shapes['outer'].x = xPos;
		this._shapes['outer'].y = yPos;
		this._shapes['txt'].x = xPos;
		this._shapes['txt'].y = yPos;
		return this;
	};
	this.setCoords = function(x, y) {
		this.x = x;
		this.y = y;
		return this;
	};
	this.generateName = function() {
		var length = Math.floor(Math.random()*3)+3;
		var name = [];
		for(var l=0;l<length;l++) {
			switch (l % 2 == 0) {
				case true:
					name.push(this.letters.consonants[Math.ceil(Math.random()*this.letters.consonants.length)]);
					break;
				case false:
					name.push(this.letters.vowels[Math.ceil(Math.random()*this.letters.vowels.length)]);
					break;
			}
		}
		this._name = name.join('');
		return name.join('');
	};
	this.letters = {
		consonants : ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','y','z'],
		vowels : ['a','e','i','o','u']
	};
	this.fadeOut = function(timer, opacityStep, deltaX, deltaY, callback) {
		deltaX  = (deltaX == undefined) ? 0 : deltaX;
		deltaY  = (deltaY == undefined) ? 0 : deltaY;
		if (this._alphaPercentage >= 0) {
			for (var s in this._shapes) {
				var shape = this._shapes[s];//.set({alpha:this._alphaPercentage/100});
				var oldX = shape.x+deltaX;
				var oldY = shape.y+deltaY;
				shape.graphics = new createjs.Graphics();
				switch(s) {
					case 'txt':
						break;
					case 'outer':
						shape.graphics.beginFill(createjs.Graphics.getRGB(
							Game.colours[this.colourIndex]['fill'][0], 
							Game.colours[this.colourIndex]['fill'][1], 
							Game.colours[this.colourIndex]['fill'][2], 
							this._alphaPercentage/100)).drawRoundRect(0, 0, 64, 64, 6);
						break;
				}
				shape.x = oldX;
				shape.y = oldY;
			}
			Game.stage.update();
			this._alphaPercentage = this._alphaPercentage-opacityStep;
			var myX = this.x;
			var myY = this.y;
			setTimeout(function(){Game.matrix.getCell(myX, myY).fadeOut(timer, opacityStep, deltaX, deltaY, callback);}, timer);
		} else {
			Game.matrix.removeCell(this.x, this.y);
			for (var s in this._shapes) {
				Game.stage.removeChild(this._shapes[s]);
			}
			setTimeout(function(){callback}, 50);
		}
		return this;

		// if (this._alphaPercentage >= 1) {
		// 	// fade down opacity some more
		// 	this._aplha = currentOpacity - opacityStep;
		// 	Game.stage.update();
		// 	setTimeout(function(){Game._fadeOutCell(colour, shape, orientation, direction*1.10, currentOpacity, opacityStep);}, 10);
		// 	// remove all children
		// 	// this.stage.removeChild(shape);
		// 	// this.stage.update();
		// 	// this.moveRow(1);
		// }
	};
};