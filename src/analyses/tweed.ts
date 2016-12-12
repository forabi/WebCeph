import { FMIA, FMPA, IMPA } from 'analyses/landmarks/angles/skeletal';


const analysis: Analysis = {
  id: 'tweed',
  components: [
    {
      landmark: FMIA,
      norm: 66,
      stdDev: 4,
    },
    {
      landmark: FMPA,
      norm: 25,
      stdDev: 0,
    },
    {
      landmark: IMPA,
      norm: 87,
      stdDev: 0,
    },
  ],
  interpret(values) {
    const valueFMPA = values[FMPA.symbol];
    const valueFMIA = values[FMIA.symbol];
    const valueIMPA = values[IMPA.symbol];
    if (typeof valueFMPA === 'number') {
      if (valueFMPA < 20) {
        // IMPA should not exceed 92 degrees.
      } else if (valueFMPA > 30) {
        // FMIA should be 65 degrees.
      } else {
        // FMIA should be 68 degrees.
      }
    }

  },
};

export default analysis;
