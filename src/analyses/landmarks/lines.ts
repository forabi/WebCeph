import { line } from 'analyses/helpers';

import {
  N, S, Po, Or, Go, Me, ANS, PNS,
  U1_APEX, U1_INCISAL_EDGE,
  L1_APEX, L1_INCISAL_EDGE,
} from 'analyses/landmarks/points';

/**
 * Frankfort Horizontal Plane
 * Po-Or line projected to form a plane
 */
export const FH_PLANE = line(Po, Or, 'Frankfort Horizontal Plane', 'FH');

/** Mandiblular Plane (Go-Me) */
export const MP = line(Go, Me);

/**
 * A line connecting sella to nasion
 */
export const SELLA_NASION_LINE = line(S, N);

/**
 * A line connecting the incisal edge and root apex of the most prominent maxillary incisor
 */
export const U1_AXIS = line(U1_APEX, U1_INCISAL_EDGE, 'Upper Incisor Axis', 'U1');

/**
 * Axis of lower incisor.
 * A line connecting the apex of the lower incisor with its incisal edge
 */
export const L1_AXIS = line(L1_APEX, L1_INCISAL_EDGE, 'Lower Incisor Axis', 'L1');

/**
 * 
 */
export const SPP = line(PNS, ANS, undefined, 'SPP');
