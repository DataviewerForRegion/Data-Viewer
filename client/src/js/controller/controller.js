/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Controller base class, supplying data loading methods
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
import { ajax, parseJSON } from '../utils/index';
/*
 * Controller class definition.
 */
export default class {
  /*
   * Load data from url.
   * @param {string} url - URL to fetch data from.
   * @param {controller} controller - Controller initiating the request.
   * @return {json} - Parsed json object
   */
  /* eslint-disable class-methods-use-this */
  /**
   * Get data via GET request
   * @param {String} url - URL to load data from
   */
  getData(url) {
    return ajax('GET', url, null, null)
      .then(parseJSON);
  }
  /**
   * Get/Post data via general AJAX request
   * @param method {String} method - HTTP request method (GET, POST, PUT, DELETE, PATCH, etc.)
   * @param url {String} url - Url to send request to
   * @param jsonContent {Object} jsonContent - Eventual jsonContent to upload
   * @param onProgress {Function} onProgress - Function to call with request progress
   */
  ajax(method, url, requestData, jsonContent, onProgress) {
    return ajax(method, url, requestData, jsonContent, onProgress)
      .then(parseJSON);
  }
  /* eslint-enable class-methods-use-this */
}
