const analysesMap: { [id: string]: string } = {
  basic: 'Basic',
  common: 'Common',
  downs: 'Downs',
  dental: 'Dental',
  bjork: 'Björk',
};

export const getNameForAnalysis = (id: string) => {
  return analysesMap[id] || id;
};
