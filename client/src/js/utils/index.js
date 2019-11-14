/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Helper function to make an AJAX call via promises.
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 *
 * @param {string} method - HTTP Request Type (GET, POST, PUT,...).
 * @param {string} url - HTTP URL to fetch data from.
 * @param {object} data - Data to include in request.
 * @param {boolean} json - Indicate whether Content-Type should be json.
 * @return {Promise} Return promise which resolves if request was successful.
 *
 */
function ajax(method, url, data, json, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const uri = url;
    // Timeout request after 60 seconds.
    // request.timeout = 6000;
    request.onprogress = function (event) {
      if (event.lengthComputable && onProgress) {
        const percentComplete = event.loaded / event.total;
        onProgress(percentComplete);
      }
    };
    request.open(method, uri);
    // If data is not of prototype FormData, set request header correctly.
    if (!json && data && Object.getPrototypeOf(data) !== Object.getPrototypeOf(new FormData())) {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    if (json === true) {
      request.setRequestHeader('Content-Type', 'application/json');
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      request.send(data);
    } else {
      request.send();
    }
    request.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(this.response);
      } else {
        reject(new Error('Error loading the file'));
      }
    };
    request.onerror = function () {
      // reject({status: 'error", type: "timeout"});
    };
    request.ontimeout = function () {
      // console.log(this);
      // reject(this);
    };
  });
}

function parseJSON(json) {
  return new Promise((resolve, reject) => {
    try {
      resolve(JSON.parse(json));
    } catch (e) {
      reject(e);
    }
  });
}

export { ajax, parseJSON };
