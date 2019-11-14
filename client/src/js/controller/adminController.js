/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Controller containing administrative end-points and methods for manipulating datasets
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
import Controller from './controller';

const riot = require('riot');

/**
 * Class representing the admin controller
 * @extends Controller
 */
export default class extends Controller {
  /**
   * Create admin controller and set options
   * @param {Object} opts - Options object
   */
  constructor(opts) {
    super();
    riot.observable(this);
    // Get options from options object and set defaults
    this.view = opts.view;
    this.subview = opts.subview || 'content';
    this.datasetId = opts.datasetId;
    this.query = opts.query || {};
    this.url = opts.url;
    this.query = opts.query;
  }

  /**
   * Load dataset/s from back end
   * @param {Number} pageNum - Page number for pagination
   * @param {Number} numEntries - Number of entries to load
   * @param {String} sortOn - Key of the attribute to sort datasets on
   * @param {Boolean} sortAsc - If true, sort ascendingly, otherwise descendingly
   */
  loadData(pageNum, numEntries, sortOn, sortAsc) {
    let url;
    // If the controller has a dataset id (is in edit mode), load one dataset
    if (this.datasetId) {
      url = `/api/admin/dataset/${this.datasetId}`;
    // Otherwise get list of datasets according to arguments
    } else {
      url = `/api/admin/datasets?p=${pageNum}&lim=${numEntries}&sort=${sortOn}&asc=${sortAsc}`;
    }
    return this.getData(url);
  }

  // Get count of data sets from back end
  getDataCount() {
    return this.getData('/api/admin/datasets/c');
  }

  /**
   * Load user from server
   * @param {Number} id - User id
   */
  getUser(id) {
    const url = '/api/admin/user'.concat((id) ? `/${id}` : '');
    return this.getData(url);
  }

  /**
   * Update user details
   * @param {Object} data - User data
   */
  updateUser(data) {
    return this.ajax('PUT', '/api/admin/user', data, true);
  }
  /**
   * Upload a new dataset to server
   * @param {FormData} formData - Multipart/Formdata containing file and settings
   * @param {Object} onProgressHandler - Handler to which report progress back to
   */
  uploadData(formData, onProgressHandler) {
    return this.ajax('POST', '/api/admin/dataset/new', formData, undefined, onProgressHandler);
  }

  /**
   * Update dataset
   * @param {Object} data - Dataset meta data and attributes
   */
  updateData(data) {
    return this.ajax('PUT', `/api/admin/dataset/${this.datasetId}`, data, true);
  }

  /**
   * Delete dataset
   * @param {Number} id - Dataset id
   */
  deleteDataset(id) {
    const url = `/api/admin/dataset/${id}`;
    return this.ajax('DELETE', url);
  }

  /**
   * Set view
   * @param {String} view - current view
   */
  setView(view) {
    this.view = view;
  }

  /**
   * Set subview
   * @param {String} subview - current subview
   */
  setSubView(subview) {
    this.subview = subview;
  }

  /**
   * Update controller options
   * @param {Object} opts - Settings object
   */
  update(opts) {
    this.datasetId = opts.datasetId;
    this.setView(opts.view);
    this.query = opts.query;
    this.setSubView(opts.subview || 'content');
  }
}
