import { MP, components as commonComponents } from './common';
import { angleOfConvexity, angleOfYAxis, interpret as interpretDowns } from './downs';
import bjork from './bjork';
import dental from './dental';
import { point, line, angleBetweenLines, AnalysisResultSeverity, SkeletalBite } from './helpers';

const ANS = point('ANS', 'Anterior nasal spine', 'Anterior point on maxillary bone');
const PNS = point('PNS', 'Poseterior nasal spine', 'Posterior limit of bony palate or maxilla');
const SPP = line(PNS, ANS, undefined, 'SPP');
const MM = angleBetweenLines(SPP, MP, undefined, 'MM');

const angleMM: AnalysisComponent = {
  landmark: MM,
  norm: 26,
  stdDev: 4,
}

const interpretMM = (value: number, min = 22, max = 30): AnalysisResult => {
  let type = SkeletalBite.normal;
  let severity = AnalysisResultSeverity.NONE;
  if (value < min) {
    type = SkeletalBite.closed;
  } else if (value > max) {
    type = SkeletalBite.open;
  }
  return {
    type,
    severity,
    relevantComponents: [MM.symbol],
  };
} 

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
    if (values[MM.symbol] !== undefined) {
      results.push(interpretMM(values[MM.symbol] as number));
    }
    return results;
  }
}

export default analysis;