/* 2D Vectors

It is assumed that every method returns a new vector that isn't connected with
the input vectors in any way. The only exception to this rule is the accum
method, which adds the input vector to itself. It's also assumed that only
radians are being used.

All the methods use this as part of the equation except the following:

* trig
* average

*/
function V(a, b) {
	if(a === undefined) {
		this.x = 0;
		this.y = 0;
	} else if(b === undefined) {
		if(a.x === undefined) {
			this.x = a.width;
			this.y = a.height;
		} else {
			this.x = a.x;
			this.y = a.y;
		}
	} else {
		this.x = a;
		this.y = b;
	}
}

// Basic math

V.prototype.accum = function() {
	for(var i = 0; i < arguments.length; i++) {
		this.x += arguments[i].x;
		this.y += arguments[i].y;
	}
};

V.prototype.add = function() {
	var newV = new V();
	for(var i = 0; i < arguments.length; i++) {
		newV.x += arguments[i].x;
		newV.y += arguments[i].y;
	}
	return newV;
};

V.prototype.subtract = function(vector) {
	return new V(this.x - vector.x, this.y - vector.y);
};

V.prototype.scale = function(scalar) {
	return new V(this.x * scalar, this.y * scalar);
};

// Linear algebra stuff

V.prototype.normSquared = function() {
	return this.x * this.x + this.y * this.y;
};

V.prototype.norm = function() {
	return Math.sqrt(this.normSquared());
};

V.prototype.normalize = function() {
	var norm = this.norm();
	if(norm === 0) {
		console.log("Normalize failed. Norm is equal to zero.");
		console.trace();
		return null;
	}
	return this.scale(1 / norm);
};

V.prototype.dist = function(vector) {
	return this.subtract(vector).norm();
};

V.prototype.dot = function(vector) {
	return this.x * vector.x + this.y * vector.y;
};

V.prototype.projectOnNormal = function(normal) {
	return normal.scale(this.dot(normal));
};

V.prototype.projectOn = function(vector) {
	return this.projectOnNormal(vector.normalize());
};

// Trig stuff

V.prototype.dir = function() {
	return Math.atan2(this.y, this.x);
};

V.prototype.trig = function(dir, length) {
	return new V(Math.cos(dir) * length, Math.sin(dir) * length);
};

// Algorithmic stuff

V.prototype.average = function(vectors) {
	var sum = new V();
	for(var i = 0; i < vectors.length; i++) {
		sum.accum(vectors[i]);
	}
	return sum.scale(1 / vectors.length);
};