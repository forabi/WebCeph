import { getStepsForAnalysis, getStepsForLandmark } from './helpers';
import downs from './downs';
import _ = require('lodash');


const m = downs[0].landmark;

console.time('t');
const steps = getStepsForLandmark(m);
console.timeEnd('t');

console.log(`Steps for ${m.name || m.symbol}:`, steps.map(s => s.name || s.symbol));

console.time('t2');
const stepsForDowns = getStepsForAnalysis(downs);
console.timeEnd('t2');

console.log(`Steps for Downs:`, stepsForDowns.map(s => s.name || s.symbol));