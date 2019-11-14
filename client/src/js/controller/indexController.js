/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Controller handling all page index related requests (browsing datasets)
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
import * as riot from 'riot';
import Controller from './controller';

/**
 * Index Controller for index view
 * @extends Controller
 */
export default class extends Controller {
  /**
   * Initialize instance
   * @param {Object} opts - Options object
   */
  constructor(opts) {
    // Get request methods from Controller class
    super();
    riot.observable(this);
    // Get options from options object
    this.opts = opts;
    this.view = 'index';
    this.subview = opts.subview || 'welcome';
    this.url = opts.url;
    this.datasetList = {};
    this.wasLoaded = false;
    this.datasetCountUrl = '/api/datasets/c';
    this.query = opts.query || {};
  }

  /**
   * Update this parameters
   * @param {Object} opts - Settings object
   */
  update(opts) {
    this.subview = opts.subview || 'welcome';
  }

  /**
   * Load datasets' metadata from server
   * @param {Number} pageNum - Current page number (for pagination)
   * @param {Number} numEntries - Number of entries to load
   * @param {String} sortOn - Key to sort datasets on
   * @param {Boolean} sortAsc - If true, sort ascendingly - otherwise descendingly
   */
  loadData(pageNum, numEntries, sortOn, sortAsc) {
    return this.getData(`${this.url}?p=${pageNum}&lim=${numEntries}&sort=${sortOn}&asc=${sortAsc}`);
  }
  /**
   * Get count of browsable datasets
   */
  getDataCount() {
    this.dataCountPromise = this.dataCountPromise || this.getData(this.datasetCountUrl);
    return this.dataCountPromise;
  }
}
