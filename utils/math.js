"use strict";
;
function radiansToDegrees(value) {
    return value * (180 / Math.PI);
}
exports.radiansToDegrees = radiansToDegrees;
function degreesToRadians(value) {
    return value * Math.PI / 180;
}
exports.degreesToRadians = degreesToRadians;
/**
 * Calculates an angle between three points
 * @return {number} angle in radians
 * @see https://en.wikipedia.org/wiki/Pythagorean_theorem
 * @see https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
 * @see https://en.wikipedia.org/wiki/Law_of_cosines
 */
function calculateAngleBetweenPoints(A, B, C) {
    // Calculate length of each line in the triangle formed by A, B, C.
    var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
    var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
    // Arccosine is the inverse function of a cosine, i.e. given a cosine,
    // it calculates the corresponding angle.
    return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}
exports.calculateAngleBetweenPoints = calculateAngleBetweenPoints;
;
/**
 * Calculates an angle between two lines
 * @return {number} angle in radians
 * @see https://www.youtube.com/watch?v=-OMbXkhHFBQ
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
 * @see https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
 */
function calculateAngleBetweenLines(line1, line2) {
    var angle1 = Math.atan2(line1.y1 - line1.y2, line1.x1 - line1.x2);
    var angle2 = Math.atan2(line2.y1 - line2.y2, line2.x1 - line2.x2);
    return angle1 - angle2;
}
exports.calculateAngleBetweenLines = calculateAngleBetweenLines;
