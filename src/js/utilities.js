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

var toTorusMeshSize = function (planeMeshSize, arenaSize, tubeRadius, toreRadius) {
    "use strict";
    
    var torusWidth, torusLength;
    torusWidth = (planeMeshSize.width * 2 * Math.PI * tubeRadius) / arenaSize.width;
    torusLength = (planeMeshSize.length * 2 * Math.PI * toreRadius) / arenaSize.length;
    return new Size(torusWidth, torusLength);
};

var toTorusMatrixTransformation = function (position2D, radius, tubeRadius) {
    "use strict";
    
    var nextPositionOnTorus, batPositionOnTorus, rotateVector, transformationMatrix, torusMatrix;
    transformationMatrix = new THREE.Matrix4();
    torusMatrix = new THREE.Matrix4();
    nextPositionOnTorus = toTorusCoordinates(position2D.x, position2D.y + 0.01, radius, tubeRadius);
    batPositionOnTorus = toTorusCoordinates(position2D.x, position2D.y, radius, tubeRadius);
    rotateVector = new THREE.Vector3(nextPositionOnTorus.x - batPositionOnTorus.x,
                                 nextPositionOnTorus.y - batPositionOnTorus.y,
                                 nextPositionOnTorus.z - batPositionOnTorus.z);

    transformationMatrix.makeTranslation(batPositionOnTorus.x, batPositionOnTorus.y, batPositionOnTorus.z);
    torusMatrix.makeRotationAxis(rotateVector.normalize(), -((2 * position2D.x) + 1) * Math.PI + Math.PI / 2);
    transformationMatrix.multiply(torusMatrix);
    torusMatrix.makeRotationZ((position2D.y + 1) * Math.PI);
    transformationMatrix.multiply(torusMatrix);

    return transformationMatrix;
};



var toCylinderMatrixTransformation = function (position2D, tubeRadius, tubeLength) {
    "use strict";
    var position3D, angle, transformationMatrix, matrixHelper;
    angle = position2D.x * 2 * Math.PI;
    position3D = new THREE.Vector3(tubeRadius * Math.cos(angle),
                         -1, tubeRadius * Math.sin(angle));
    transformationMatrix = new THREE.Matrix4();
    matrixHelper = new THREE.Matrix4();
    transformationMatrix.makeRotationX(-Math.PI / 2);
    matrixHelper.makeRotationZ(angle);
    transformationMatrix.multiply(matrixHelper);
    matrixHelper.makeTranslation(0, 0, position2D.y);
    transformationMatrix.multiply(matrixHelper);
    return transformationMatrix;
};