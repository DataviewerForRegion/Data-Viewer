/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file List of basemaps to choose from on map views
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 *
 */
const basemaps = [
  {
    name: 'Open Street Maps',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: 'Map data © <a href=\'https://openstreetmap.org\'>OpenStreetMap</a> contributors',
    key: 'osm',
  },
  {
    name: 'Stamen Terrain',
    url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.png',
    attribution: 'Map tiles by <a href=\'http://stamen.com\'>Stamen Design</a>, under <a href=\'http://creativecommons.org/licenses/by/3.0\'>CC BY 3.0</a>. Data by <a href=\'http://openstreetmap.org\'>OpenStreetMap</a>, under <a href=\'http://www.openstreetmap.org/copyright\'>ODbL</a>.',
    key: 'stament',
  },
  {
    name: 'ESRI World Topo Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Sources: Esri, HERE, DeLorme, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), swisstopo, MapmyIndia, © OpenStreetMap contributors, and the GIS User Community',
    key: 'esrtop',
  },
];

module.exports = basemaps;
