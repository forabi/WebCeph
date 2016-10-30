const analysesMap: { [id: string]: string } = {
  basic: 'Basic',
  common: 'Common',
  downs: 'Downs',
  dental: 'Dental',
  bjork: 'Bjork',
};

export const getNameForAnalysis = (id: string) => {
  return analysesMap[id] || id;
};