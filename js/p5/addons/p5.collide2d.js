p5.prototype.collidePointCircle = function(x, y, cx, cy, d) {
    return this.dist(x, y, cx, cy) <= d / 2;
};

p5.prototype.collidePointRect = function(pointX, pointY, x, y, xW, yW) {
    return pointX >= x && pointX <= x + xW && pointY >= y && pointY <= y + yW;
};