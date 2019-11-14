/**
 * @file Scale SVG layer without reloading for a better user experience
 * Brought into ES6 module form by
 * @author Sebastian Altenhuber, Patrick Humme
 * Original author of L.D3SvgOverlay (https://github.com/teralytics/Leaflet.D3SvgOverlay)
 * @author Kirill Zhuravlev <kirill.zhuravlev@teralytics.ch>
 * Original copyright 2015 Teralytics AG
 *
 */

import { Layer, svg, LatLng, Point } from 'leaflet';
import * as d3Selection from 'd3-selection';
import * as d3Geo from 'd3-geo';

/**
 * Class implementing a Leaflet D3 overlay, transforming geometries on zoom without re-rendering
 * Extends Leaflet's Layer class
 * @extends Layer
 */
export default class extends Layer {
  constructor(drawCallback, options) {
    super();
    this.drawCallback = drawCallback;
    this.options = options || {};
  }
  setOptions(options) {
    if (options) this.options = options;
  }
  onAdd(map) {
    this.map = map;
    const layer = this;
    this.svg = svg();
    map.addLayer(this.svg);
    // Disable underscore dangle rule - leaflet uses this for the rootGroup
    /* eslint-disable no-underscore-dangle */
    this.rootGroup = d3Selection.select(this.svg._rootGroup)
      .classed('d3-overlay', true);
    /* eslint-enable no-underscore-dangle */
    this.rootGroup.classed('leaflet-zoom-hide', true);
    this.selection = this.rootGroup;
    this.pixelOrigin = map.getPixelOrigin();
    this.wgsOrigin = new LatLng(0, 0);
    this.wgsInitialShift = this.map.latLngToLayerPoint(this.wgsOrigin);
    this.zoom = this.map.getZoom();
    this.shift = new Point(0, 0);
    this.scale = 1;

    this.projection = {
      latLngToLayerPoint(latLng, zoom) {
        const newZoom = zoom || layer.zoom;
        const projectedPoint = layer.map.project(latLng, newZoom);
        return projectedPoint.subtract(layer.pixelOrigin);
      },
      layerPointToLatLng(point, zoom) {
        const newZoom = zoom || this.zoom;
        const projectedPoint = new Point(point[0], point[1]).add(layer.pixelOrigin);
        return this.map.unproject(projectedPoint, newZoom);
      },
      unitsPerMeter: (256 * (2 ** this.zoom)) / 40075017,
      map: layer.map,
      layer,
      scale: 1,
    };
    this.projection.projectPoint = function projectPoint(x, y) {
      const point = layer.projection.latLngToLayerPoint(new LatLng(y, x));
      this.stream.point(point.x, point.y);
    };
    this.projection.pathFromGeojson = d3Geo.geoPath()
      .projection(d3Geo.geoTransform({ point: this.projection.projectPoint }));

    this.projection.latLngToLayerFloatPoint = this.projection.latLngToLayerPoint;
    this.projection.getZoom = this.map.getZoom.bind(this.map);
    this.projection.getBounds = this.map.getBounds.bind(this.map);
    this.selection = this.rootGroup;

    map.on('viewreset', this.zoomChange, this);
    this.draw();
  }
  getEvents() {
    return {
      zoomend: this.zoomChange,
      viewreset: this.zoomChange,
    };
  }
  addTo(map) {
    map.addLayer(this);
    return this;
  }
  zoomChange(evt) {
    const newZoom = evt.zoom || this.map.getZoom();
    this.zoomDiff = newZoom - this.zoom;
    this.scale = 2 ** this.zoomDiff;
    this.projection.scale = this.scale;
    this.shift = this.map.latLngToLayerPoint(this.wgsOrigin)
      .subtract(this.wgsInitialShift.multiplyBy(this.scale));
    this.rootGroup.attr('transform', `translate(${this.shift.x}, ${this.shift.y}) scale(${this.scale}, ${this.scale})`);
    if (this.afterZoomChange) this.afterZoomChange();
  }
  draw() {
    this.drawCallback(this.selection, this.projection, this.map.getZoom());
  }
  onRemove() {
    this.svg.remove();
  }
}
