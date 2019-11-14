import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

module.exports = (function () {
  const scales = {
    categorical: {},
    sequential: {},
  };

  ['Category10', 'Category20', 'Category20b', 'Category20c', 'Accent',
    'Dark2', 'Paired', 'Pastel1', 'Pastel2', 'Set1', 'Set2', 'Set3',
  ].forEach((key) => {
    const schemeName = 'scheme'.concat(key);
    scales.categorical[schemeName] = d3ScaleChromatic[schemeName]
      ? d3ScaleChromatic[schemeName]
      : d3Scale[schemeName];
  });

  ['Viridis', 'Inferno', 'Magma', 'Plasma', 'Warm', 'Cool', 'BrBG',
    'PRGn', 'PiYG', 'PuOr', 'RdBu', 'RdGy', 'RdYlBu', 'RdYlGn',
    'Spectral', 'Blues', 'Greens', 'Greys', 'Oranges', 'Purples',
    'Reds', 'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBuGn', 'PuBu', 'PuRd',
    'RdPu', 'YlGnBu', 'YlGn', 'YlOrBr', 'YlOrRd',
  ].forEach((key) => {
    const interpolatorName = 'interpolate'.concat(key);
    scales.sequential[interpolatorName] = d3ScaleChromatic[interpolatorName]
      ? d3ScaleChromatic[interpolatorName]
      : d3Scale[interpolatorName];
  });
  return scales;
}());
