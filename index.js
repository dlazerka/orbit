
function Pane() {
	this.$el = $('.pane');
	this.zoomTable = [
		1/100, 1/75, 1/50, 1/40, 1/30, 1/20, 1/15, 1/10, 1/8, 1/5, 1/3, 1/2, 1/1.5, 1/1.25, 1, 1.1, 1.3
	];
	this.zoomIndex = 8;
	this.bodyUis = [];

	this.add = function(body) {
		var $el = $('<div>', {
			'class' : 'body ' + body.name
		});
		var bodyUi = new BodyUi(body, $el);

		$el.on('mousedown', $.proxy(this.move, bodyUi), this);

		this.$el.append($el);

		this.bodyUis.push(bodyUi);
	};

	this.move = function(event, bodyUi) {
	};

	this.redraw = function() {
		for (var i = 0; i < this.bodyUis.length; i++) {
			var bodyUi = this.bodyUis[i];
			var $el = bodyUi.$el;
			var body = bodyUi.body;

			var zoom = this.zoomTable[this.zoomIndex] / 1000;
			var size = Math.floor(body.r * zoom);
			$el.width(size);
			$el.height(size);

			const SCALE = 12000000 * 1.5;

			$el.css('left', (1 + body.x / SCALE) * this.$el.width() / 2 - size/2);
			$el.css('top', (1 - body.y / SCALE) * this.$el.height() / 2 - size/2);
		}
	};

	this.zoom = function(event) {
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}
		event.preventDefault();

		this.zoomIndex += event.originalEvent.wheelDelta / Math.abs(event.originalEvent.wheelDelta);
		this.zoomIndex = Math.max(this.zoomIndex, 0);
		this.zoomIndex = Math.min(this.zoomIndex, this.zoomTable.length - 1);

		console.log('zoomIndex=' + this.zoomIndex);

		this.redraw();
	};

	this.$el.on('mousewheel', $.proxy(this.zoom, this));
}

var kerbin = new Body('kerbin', 0, 0, 600000, 5.2915793e22);
var mun = new Body('mun', 12000000, 0, 200000, 9.7600236e20);

var pane = new Pane();
pane.add(kerbin);
pane.add(mun);
pane.redraw();
