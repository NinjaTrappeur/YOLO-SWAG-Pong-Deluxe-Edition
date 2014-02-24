/*global THREE */

//Position class
//=============================

var Position = function (x, y, z) {
    "use strict";
    if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
        this.x = x;
        this.y = y;
        this.z = z;
    } else {
        throw ("You need to specify x,y and z numbers to create a Position object.");
    }
};

Position.prototype.getX = function () {
    "use strict";
    return this.x;
};

Position.prototype.getY = function () {
    "use strict";
    return this.y;
};

Position.prototype.getZ = function () {
    "use strict";
    return this.z;
};

Position.prototype.setX = function (x) {
    "use strict";
    this.x = x;
};

Position.prototype.setY = function (y) {
    "use strict";
    this.y = y;
};

Position.prototype.setZ = function (z) {
    "use strict";
    this.z = z;
};




//Size class
//===================================

var Size = function (width, length) {
    "use strict";
    if (typeof width === "number" && typeof length === "number") {
        this.width = width;
        this.length = length;
    } else {
        throw ("You need to specify width and length values to create a Size object: width = " + width + " lenght = " + length);
    }
};

Size.prototype.getWidth = function () {
    "use strict";
    return this.width;
};

Size.prototype.getLength = function () {
    "use strict";
    return this.length;
};

Size.prototype.setWidth = function (width) {
    "use strict";
    this.width = width;
};

Size.prototype.setLength = function (length) {
    "use strict";
    this.length = length;
};


//Utility for Inheritance
//=========================================

var extendClass = function (child, parent) {
    "use strict";
    var Surrogate = function () {};
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();
};

var toTorusCoordinates = function (x, y, radius, tubeRadius) {
    "use strict";
    //Please refer to report for futher explanations.
    var teta, omega, x2, y2, z2, vector;
    
    teta = (y + 1) * Math.PI;
    omega = ((x * 2) + 1) * Math.PI;
    
    x2 = (radius + tubeRadius * Math.cos(omega)) * Math.cos(teta);
    y2 = (radius + tubeRadius * Math.cos(omega)) * Math.sin(teta);
    z2 = tubeRadius * Math.sin(omega);
    
    vector = new THREE.Vector3(x2, y2, z2);
    return vector;
};