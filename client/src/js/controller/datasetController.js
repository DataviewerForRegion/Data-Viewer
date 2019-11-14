/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Dataset controller handling loading and parsing of datasets
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
import * as riot from 'riot';
import * as d3Array from 'd3-array';
import * as topojson from 'topojson';

import colorSchemes from '../utils/colorschemes';
import Controller from './controller';
/*
 * Class representing the dataset controller.
 * @extends Controller
 *
 */
export default class extends Controller {
  /*
   * Create dataset controller and set options.
   * @param {object} opts - Options object.
   */
  constructor(opts) {
    super();
    // Make the controller observable
    riot.observable(this);
    this.datasetId = opts.id;
    // Save selection string for later use
    this.selectionString = opts.parameters ? opts.parameters.s : undefined;
    this.initializeGlobalState(opts.parameters);
    this.selection = new Set();
    riot.observable(this.selection);
    this.url = `/api/dataset/${this.datasetId}/meta`;
    this.view = 'viewDataset';
    this.subview = opts.subview || 'overview';
    this.dataset = {};
    if (opts.parameters && this.subview !== 'overview') {
      // If global parameters are defined, delete them before attaching state to subview
      this.state[this.subview] = opts.parameters;
      if (this.state[this.subview].cs) delete this.state[this.subview].cs;
      if (this.state[this.subview].s) delete this.state[this.subview].s;
    }
    this.on('colorscheme::change', (options) => {
      if (colorSchemes.categorical[options.key]) {
        this.state.global.cs = {
          key: options.key,
          colors: colorSchemes.categorical[options.key],
        };
        this.trigger('colorscheme::changed');
      }
    });
  }
  /*
   * Load Metadata from url and cache the promise for later use.
   * @return {Promise} Promise containing metadata.
   */
  loadMetadata() {
    // If dataset id matches is the same and promise exists, return existing promise
    if (this.metaDataPromise) {
      this.metaDataPromise = this.metaDataPromise;
    // Otherwise return new promise to get metadata.
    } else {
      this.metaDataPromise = this.getData(this.url).then((data) => {
        this.dataset = data;
        this.dataset.Attributes = {
          all: this.dataset.Attributes.filter(attribute => attribute.is_active),
          values: this.dataset.Attributes.filter(attribute =>
            !attribute.is_label && attribute.is_active),
          labels: this.dataset.Attributes.filter(attribute =>
            attribute.is_label && attribute.is_active),
        };
        // Replace non-existing names with JSON datafile keys.
        this.dataset.Attributes.all.forEach((attribute) => {
          const attrib = attribute;
          if (attrib.name === '') {
            attrib.name = attrib.key;
          }
        });
        return data;
      });
    }
    return this.metaDataPromise;
  }
  /*
   * Load Data from url and cache the promise for later use
   * @return {Promise} Promise containing JSON data
   */
  loadFile() {
    // If dataset id matches is the same and promise exists, return existing promise
    if (this.dataPromise) {
      this.dataPromise = this.dataPromise;
    // Otherwise return new promise to get JSON
    } else {
      let filetype;
      this.dataset.Files.forEach((file) => {
        if (file.type === 'topojson') {
          filetype = 'topojson';
        }
      });
      // If no filetype is defined, fall back to geojson
      if (!filetype) filetype = 'geojson';
      this.dataPromise = this.getData(`/api/dataset/${this.datasetId}/filetype/${filetype}`).then((data) => {
        // Get neighbor matrix of features
        const neighbors = topojson.neighbors(data.objects.collection.geometries);
        // If filetype is of type topojson, convert to GeoJSON
        if (filetype === 'topojson') {
          this.dataset.json = topojson.feature(data, data.objects.collection);
        } else {
          this.dataset.json = data;
        }
        // Add selection from URL parameter values
        if (this.selectionString) {
          this.selectionString.split(',').forEach((id) => {
            const feature = this.dataset.json.features[id];
            if (feature) {
              this.selection.add(feature);
            }
          });
        }
        // Get object keys of all attributes of type number
        const numberProps = this.dataset.Attributes.all
          .filter(attribute => attribute.type === 'number')
          .map(attribute => attribute.key);
        // Iterate over features
        this.dataset.json.features.forEach((feature, index, features) => {
          const props = feature.properties;
          const feat = feature;
          // Cast JSON attributes with type 'number' to type number
          numberProps.forEach((propKey) => {
            if (props[propKey] !== null) props[propKey] = Number(props[propKey]);
          });
          // Remove inactive properties
          Object.keys(props).forEach((propertyKey) => {
            const idx = this.dataset.Attributes.all
              .findIndex(attribute => attribute.key === propertyKey);
            if (idx < 0) {
              delete props[propertyKey];
            }
          });
          // Attach index in JSON file to feature for reference and push
          // the feature to the data array.
          feat.id = +index;
          // Greedily pick colorIds so that no neighboring features get same colorId
          // https://gist.github.com/mbostock/4180634
          /* eslint-disable no-bitwise */
          feat.colorId = d3Array.max(neighbors[index], n => features[n].colorId) + 1 | 0;
          /* eslint-enable no-bitwise */
        });
        // Attach selection object to dataset object
        this.dataset.selection = this.selection;
        return this.dataset;
      });
    }
    return this.dataPromise;
  }
  /*
   * Add a feature to the current selection or remove it, if it already is selected.
   * @param {Object} feature - Reference to the feature object.
   * @return {Boolean} True, if feature has been added to the selection, false otherwise
   */
  toggleSelection(feature) {
    let added = false;
    if (this.selection.has(feature)) {
      this.selection.delete(feature);
    } else {
      this.selection.add(feature);
      added = true;
    }
    this.trigger('selection::change');
    riot.route(`/v/${this.datasetId}/${this.subview}?${this.buildQueryString(this.getState(this.subview))}`);
    return added;
  }
  /**
   * Add an array of features to the selection.
   * @param {<Set>Object} selection - Array of features to add to selection.
   */
  addToSelection(selection) {
    [...selection].forEach((feature) => { this.selection.add(feature); });
    this.dataset.selection = this.selection;
    this.trigger('selection::change');
    riot.route(`/v/${this.datasetId}/${this.subview}?${this.buildQueryString(this.getState(this.subview))}`);
  }

  // Clear the current selection
  clearSelection() {
    this.selection = new Set();
    this.trigger('selection::change');
  }

  // Merge state options to query string
  buildQueryString(state) {
    const paramArray = [];
    if (state) {
      // Add all key value pairs from state to array
      Object.keys(state).forEach((key) => {
        paramArray.push(`${key}=${state[key]}`);
      });
    }
    // If a selection exists, add to array
    if (this.selection.size > 0) paramArray.push(`s=${[...this.selection].map(elem => elem.id).join(',')}`);
    // If a global color scheme is defined, add to array
    if (this.state.global.cs) paramArray.push(`cs=${this.state.global.cs.key}`);
    // Join array and return it
    return paramArray.join('&');
  }

  getState(subview) {
    return this.state[subview];
  }

  removeState(subview, param) {
    const state = this.state[subview];
    if (!state || !subview || !param) return;
    delete state[param];

    riot.route(`/v/${this.datasetId}/${this.subview}?${this.buildQueryString(this.state[subview])}`);
  }

  setState(subview, param, value) {
    // Create new state for subview if it does not already exist.
    if (!this.state[subview]) this.state[subview] = {};

    this.state[subview][param] = value;

    riot.route(`/v/${this.datasetId}/${this.subview}?${this.buildQueryString(this.state[this.subview])}`);
    this.trigger('state::change');
  }

  /**
   * Initialize global state object
   * @param {Object} params - Object containing URL query parameters
   */
  initializeGlobalState(params) {
    let cs;
    // Get color scheme key form parameters
    if (params) {
      ({ cs } = params);
    }
    // Get categorical schemes to select from
    const { categorical } = colorSchemes;
    // Set default scheme key
    const defaultSchemeKey = 'schemeCategory20';
    this.state = {
      global: {},
    };
    // If parameters contain color scheme key
    if (cs) {
      // Get color scheme array by color scheme key and set color object
      if (categorical[cs]) {
        this.state.global.cs = {
          key: cs,
          colors: categorical[cs],
        };
      }
    } else {
      // Otherwise fall back to default color scheme object
      this.state.global.cs = {
        key: defaultSchemeKey,
        colors: categorical[defaultSchemeKey],
      };
    }
  }
  /*
   * Update current options.
   * @param {object} opts - Options object.
   *
   */
  update(opts) {
    // If dataset id changed, change urls, state and load new dataset
    if (this.datasetId !== opts.id) {
      this.datasetId = opts.id;
      this.state = {};
      this.url = `/api/dataset/${this.datasetId}/meta`;
      delete this.metaDataPromise;
      delete this.dataPromise;
      this.loadMetadata().then(() => {
        this.loadFile().then((dataset) => {
          this.trigger('dataset::loaded', { dataset });
        });
      });
    }
    // if (opts.parameters) this._selectionString = opts.parameters.s;
    this.subview = opts.subview || 'overview';
  }
}
