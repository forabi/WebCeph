import { FMIA, FMPA, IMPA } from 'analyses/landmarks/angles/skeletal';

const analysis: Analysis<'ceph_lateral'> = {
  id: 'tweed',
  components: [
    {
      landmark: FMIA,
      mean: 66,
      max: 70,
      min: 62,
    },
    {
      landmark: FMPA,
      mean: 25,
      max: 30,
      min: 20,
    },
    {
      landmark: IMPA,
      mean: 90,
      max: 93,
      min: 87,
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
