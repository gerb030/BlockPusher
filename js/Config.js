var Config = {
	_tilePos : 0,
	_tileWidth : 72,
	_tileSpacing : 8,
	_offsetTop : 64,
	_offsetLeft : 82,
	animTimerFadeOut : 500, /* too high */
	animTimerAfterFadeOut : 250,
	animTimerBeforeStartFadeOut : 1000,
	animTimerFadeOutStep : 25,
	init : function() {
		this._tilePos = this._tileSpacing+this._tileWidth;
	},
}