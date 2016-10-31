import bjork from './bjork';
import { MP, components as commonComponents } from './common';
import dental from './dental';
import { angleOfConvexity, angleOfYAxis, interpret as interpretDowns } from './downs';
import { ProblemSeverity, SkeletalBite, angleBetweenLines, line, point } from './helpers';

/**
 * Anterior point on maxillary bone
 */
const ANS = point('ANS', 'Anterior nasal spine', 'Anterior point on maxillary bone');

/**
 * Posterior limit of bony palate or maxilla
 */
const PNS = point('PNS', 'Poseterior nasal spine', 'Posterior limit of bony palate or maxilla');

/**
 * 
 */
const SPP = line(PNS, ANS, undefined, 'SPP');

/**
 * 
 */
const MM = angleBetweenLines(SPP, MP, undefined, 'MM');

const angleMM: AnalysisComponent = {
  landmark: MM,
  norm: 26,
  stdDev: 4,
};

const interpretMM = (value: number, min = 22, max = 30): AnalysisInterpretation => {
  let indication = SkeletalBite.normal;
  let severity = ProblemSeverity.NONE;
  if (value < min) {
    indication = SkeletalBite.closed;
  } else if (value > max) {
    indication = SkeletalBite.open;
  }
  return {
    indication,
    severity,
    relevantComponents: [MM.symbol],
  };
};

const analysis: Analysis = {
  id: 'basic',
  components: [
    ...commonComponents,
    angleOfConvexity,
    angleOfYAxis,
    angleMM,
    ...bjork.components,
    ...dental.components,
  ],
  interpret(values) {
    const results = [
      ...interpretDowns(values),
      ...bjork.interpret(values),
      ...dental.interpret(values),
    ];
    const valueOfMM = values[MM.symbol];
    if (typeof valueOfMM === 'number') {
      results.push(interpretMM(valueOfMM));
    }
    return results;
  },
};

export default analysis;