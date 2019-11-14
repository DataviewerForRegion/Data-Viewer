/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Utility functions
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const Promise = require('bluebird');
const formidable = require('formidable');
const config = require('config');
const fs = require('fs');
const topojson = require('topojson');
const streamToPromise = require('stream-to-promise');
const ogr2ogr = require('ogr2ogr');
const CustomErrors = require('./errors');

const jsonParseAsync = Promise.method(JSON.parse);

module.exports.parseForm = (req) => {
  const formOptions = {
    uploadDir: process.env.TMP_DIR,
    keepExtensions: true,
  };
  const uploadedForm = new formidable.IncomingForm(formOptions);

  const options = { multiArgs: true, context: uploadedForm };
  const parseForm = Promise.promisify(uploadedForm.parse, options);
  return parseForm(req);
};
/**
 * Convert Shapefile in zipped format (.zip) to GeoJSON (.geojson)
 * @param {String} srcFilePath - Path to zipped Shapefile.
 * @param {String} srcProjection - Source shapefile projection in epsg format (e.g. 'EPSG:4258').
 * @param {String} destFilePath - Destination path for geojson.
 * @return {Promise} Promise that gets rejected on error stream error
 */
module.exports.shapeFileToGeoJSON = (srcFilePath, destFilePath, srcProjection) => {
  const writeStream = fs.createWriteStream(destFilePath);
  const streamPromise = streamToPromise(writeStream);
  ogr2ogr(srcFilePath)
    .format('GeoJSON')
    .project('EPSG:4326', srcProjection)
    .stream()
    .on('error', () => {
      writeStream.emit('error', new CustomErrors.UnableToOpenDatasourceError(undefined, { src: srcFilePath, dest: destFilePath }));
    })
    .pipe(writeStream);
  return streamPromise;
};

module.exports.checkFileType = (srcFilePathObject, extension) => new Promise((resolve, reject) => {
  if (srcFilePathObject.ext === extension) {
    resolve(true);
  } else {
    reject(new CustomErrors.WrongFileTypeError(undefined, srcFilePathObject));
  }
});

/**
 * Convert GeoJSON to TopoJSON.
 * @param {String} geojsonPath - Path to GeoJSON file.
 * @param {String} topojsonPath - Path to TopoJSON file.
 * @return {Promise} Promise which fulfills with an array of attribute keys of the GeoJSON file.
 */
module.exports.geojsonToTopoJSON = (geojsonPath, topojsonPath) => {
  const properties = {};
  const attributeArray = [];

  return Promise.promisify(fs.readFile)(geojsonPath)
    .then(data => jsonParseAsync(data))
    .then((json) => {
      json.features.forEach((feature) => {
        Object.keys(feature.properties).forEach((key) => {
          if (!properties[key]) properties[key] = [];
          properties[key].push(feature.properties[key]);
        });
      });
      Object.keys(properties).forEach((key) => {
        attributeArray.push({
          key,
          type: checkType(properties[key], 0.8),
        });
      });
      const topology = topojson.topology({ collection: json }, {
        'property-transform': propertyTransform,
        verbose: true
      });
      return Promise.promisify(fs.writeFile)(topojsonPath, JSON.stringify(topology));
    })
    .then(() => attributeArray);
};
/**
 * Check type of an array of values to make a suggestion.
 * @param {<Array>Number} values - Array of numbers to do the type check on.
 * @param {Number} threshold - Percentage of values to still be considered of one type.
 * @return {String} Depending on type of values in the array either string, boolean or number.
 */
function checkType(values, threshold) {
  const countValues = values.length;
  let countNumbers = 0;
  let countBooleans = 0;
  let type;
  values.forEach((value) => {
    if (Number.isNaN(value)) {
      if (value === true || value === false) {
        countBooleans += 1;
      }
    } else {
      countNumbers += 1;
    }
  });
  if (countNumbers / countValues > threshold) {
    type = 'number';
  } else if (countBooleans / countValues > threshold) {
    type = 'boolean';
  } else {
    type = 'string';
  }
  return type;
}
function propertyTransform(feature) {
  return feature.properties;
}
