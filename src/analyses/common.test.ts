import { interpretANB, interpretSNA, interpretSNB } from './common';
import { AnalysisResultType, AnalysisResultSeverity } from '../../constants';

for (let ANB = -10; ANB <= 10; ANB += 1) {
  const result = interpretANB(ANB);
  console.log('ANB = %d', ANB, result);
  console.log(AnalysisResultType[result.type], AnalysisResultSeverity[result.severity]);
}

for (let SNA = 70; SNA <= 90; SNA += 1) {
  const result = interpretSNA(SNA);
  console.log('SNA = %d', SNA, result);
  console.log(AnalysisResultType[result.type], AnalysisResultSeverity[result.severity]);
}

for (let SNB = 70; SNB <= 90; SNB += 1) {
  const result = interpretSNB(SNB);
  console.log('SNB = %d', SNB, result);
  console.log(AnalysisResultType[result.type], AnalysisResultSeverity[result.severity]);
}