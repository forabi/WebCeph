import { angleBetweenPoints, line, angleBetweenLines, Analysis } from './helpers';
import commonAnalysis, { FH_PLANE, N, Pog, A, B, Gn, S, Po } from './common';

export default <Analysis>[
  ...commonAnalysis,
  {
    landmark: angleBetweenLines(FH_PLANE, line(Pog, N), 'Facial Angle'),
    norm: 87.8,
    stdDev: 3.6,
  },
  {
    landmark: angleBetweenPoints(N, A, Pog, 'Angle of Convexity'),
    norm: 87.8,
    stdDev: 5.1,
  },
  {
    landmark: angleBetweenLines(line(Gn ,S), FH_PLANE, 'Y Axis'),
    norm: 59.4,
    stdDev: 3.8,
  },
  {
    landmark: angleBetweenLines(line(A, B), line(N, Po), 'A-B Plane Angle'),
    norm: -4.6,
    stdDev: 4.6,
  },
];