/**
 * Model for a celestial body.
 * @param name {String}.
 * @param x {Number} in meters.
 * @param y {Number} in meters.
 * @param r {Number} equatorial radius, in meters.
 * @param mass {Number} in kg.
 * @constructor
 */
function Body(name, x, y, r, mass) {
	this.name = name;
	this.x = x;
	this.y = y;
	this.r = r;
	this.mass = mass;
}

function BodyUi(body, $el) {
	this.body = body;
	this.$el = $el;
}
