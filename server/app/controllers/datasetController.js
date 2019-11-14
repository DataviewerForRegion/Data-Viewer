/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Dataset controller
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const models = require('../models');
const path = require('path');
const Promise = require('bluebird');
const utils = require('../utils/utils');
const mv = Promise.promisify(require('mv'));

const tmpDir = process.env.TMP_DIR;
const storageDir = process.env.STORAGE_DIR;
const del = require('del');
/**
 * Create a new dataset by form upload
 * @returns {Promise} Promise that fulfills with the newly created database
 */
module.exports.createDataset = (req) => {
  let fields;
  let files;
  let destFilePath;
  let srcFilePath;
  let originalFileName;
  let baseFilePath;
  let id;
  let srcFileId;
  let attributeArray;
  const tmpFiles = [];
  // Get temporary file directory from settings
  // Parse form
  return utils.parseForm(req).then((formData) => {
    [fields, files] = formData;
    srcFilePath = path.parse(files.uploadedFile.path);
    baseFilePath = srcFilePath.name;
    originalFileName = files.uploadedFile.name;

    // Check file extension before doing anything else
    if (fields.format === 'shapefile') {
      return utils.checkFileType(srcFilePath, '.zip');
    }
    return utils.checkFileType(srcFilePath, '.geojson');

    // Move file to temporary directory
  }).then(() => {
    destFilePath = `${tmpDir}${srcFilePath.name}/${srcFilePath.base}`;
    return mv(path.format(srcFilePath), destFilePath, { mkdirp: true });
  })
  // If uploaded file is a shapefile, convert it to GeoJSON first - otherwise swap file paths
    .then(() => {
      srcFilePath = destFilePath;
      destFilePath = destFilePath.split('.').slice(0, -1).join('.');
      if (fields.format === 'shapefile') {
        // Add shape file zip to temporary file array
        tmpFiles.push({
          path: path.parse(srcFilePath).base,
          name: originalFileName,
          type: 'shapefile',
        });
        // destFilePath = srcFilePath.split('.').slice(0, -1).join('.');
        return utils.shapeFileToGeoJSON(srcFilePath, destFilePath.concat('.geojson'), fields.projection);
      }
      return undefined;
    })
    // Convert GeoJSON to TopoJSON file
    .then(() => {
    // Add GeoJSON file to temporary file array
      tmpFiles.push({
        path: baseFilePath.concat('.geojson'),
        name: originalFileName.split('.').slice(0, -1).join('.').concat('.geojson'),
        type: 'geojson',
      });
      return utils.geojsonToTopoJSON(destFilePath.concat('.geojson'), destFilePath.concat('.topojson'));
    // Create database entry for the dataset
    })
    .then((attribArray) => {
    // Save attribute array for response
      attributeArray = attribArray;
      // Add TopoJSON file to temporary file array
      tmpFiles.push({
        path: baseFilePath.concat('.topojson'),
        name: originalFileName.split('.').slice(0, -1).join('.').concat('.topojson'),
        type: 'topojson',
      });
      return models.Dataset.create({
        projection: fields.projection,
        is_active: false,
        userId: req.user.get('id'),
      });
    // Create attribute database entries
    })
    .then((dataset) => {
      ({ id } = dataset.get({ plain: true }));
      const promiseArray = [];
      attributeArray.forEach((attribute) => {
        promiseArray.push(models.Attribute.create({
          key: attribute.key,
          type: attribute.type,
          DatasetId: id,
        }));
      });
      return Promise.all(promiseArray);
    // Move temporary files to storage directory
    })
    .then(() => {
      const promiseArray = [];
      tmpFiles.forEach((file) => {
        promiseArray.push(mv(`${tmpDir}${baseFilePath}/${file.path}`, `${storageDir}${id}/${file.path}`, { mkdirp: true }));
      });
      return Promise.all(promiseArray);
    // Remove tmp directory
    })
    .then(() =>
      del([`${tmpDir}${baseFilePath}/**`]))
    // Create database entries for files
    .then(() => {
      const promiseArray = [];
      tmpFiles.forEach((file) => {
        promiseArray.push(models.File.create({
          name: file.name,
          path: file.path,
          type: file.type,
          DatasetId: id,
        }));
      });
      return Promise.all(promiseArray);
    // Get dataset from database
    })
    .then((fileEntities) => {
    // First file saved is the original file
      srcFileId = fileEntities[0].get({ plain: true }).id;
      return models.Dataset.findOne({
        where: {
          id,
        },
        include: [models.Attribute, models.File],
      });
    // Save id of original src file to according dataset field
    })
    .then(dataset =>
      dataset.update({
        srcFileId,
        filePath: `${storageDir}${id}`,
      }))
    // Return dataset and attributes
    .then(dataset => dataset.get({ plain: true }));
};
/**
 * Get one dataset by id
 * @returns {Promise} Promise that fulfills with the requested dataset
 */
module.exports.getDataset = datasetId => models.Dataset.findOne({
  where: {
    id: datasetId,
  },
  include: [models.Attribute, models.File],
  order: [[models.Attribute, 'id', 'ASC'], [models.File, 'id', 'ASC']],
  rejectOnEmpty: true,
});
/**
 * Get all active datasets.
 * @returns {Promise} Promise that fulfills with an array of datasets
 */
module.exports.getActiveDatasets = (req) => {
  const offset = (req.query.p - 1) * req.query.lim;
  const limit = req.query.lim;
  const sortOn = req.query.sort;
  const sortOrder = (+req.query.asc === 1) ? 'ASC' : 'DESC';
  return models.Dataset.findAll({
    where: {
      is_active: true,
    },
    attributes: ['id', 'name', 'description', 'projection', 'url', 'createdAt', 'updatedAt'],
    limit,
    offset,
    order: [[sortOn, sortOrder]],
  });
};

/**
 * Get all datasets.
 * @returns {Promise} Promise that fulfills with an array of datasets
 */
module.exports.getDatasets = (req) => {
  const offset = (req.query.p - 1) * req.query.lim;
  const limit = req.query.lim;
  const sortOn = req.query.sort;
  const sortOrder = (+req.query.asc === 1) ? 'ASC' : 'DESC';
  return models.Dataset.findAll({
    limit,
    offset,
    order: [[sortOn, sortOrder]],
  });
};

module.exports.getDatasetCount = () => models.Dataset.count({
  where: {
    is_active: true,
  },
});

/**
 * Update a dataset's metadata and attributes
 * @returns {Promise} Promise that fulfills when all attributes have been saved
 */
module.exports.updateDataset = (req) => {
  const ds = req.body.dataset;
  const datasetAttributes = Object.keys(ds).filter(key => key !== 'attributes');
  return models.Dataset.findOne({
    where: {
      id: +req.params.dataset_id,
    },
    include: [models.Attribute],
    order: [[models.Attribute, 'id', 'ASC']],
  }).then(dataset =>
    // console.log(dataset);
    dataset.update({
      name: ds.name,
      description: ds.description,
      url: ds.url,
      is_active: ds.is_active,
    }, {
      fields: datasetAttributes,
    })).then((dataset) => {
    const dsAttributes = dataset.Attributes.map(attribute => attribute.dataValues.id);
    const promises = [];
    req.body.dataset.attributes.forEach((attribute) => {
      const attributes = Object.keys(attribute).filter(key => key !== 'id');
      const index = dsAttributes.indexOf(+attribute.id);
      if (index > -1) {
        promises.push(dataset.Attributes[index].update({
          name: attribute.name,
          description: attribute.description,
          type: attribute.type,
          is_label: attribute.is_label,
          is_active: attribute.is_active,
        }, {
          fields: attributes,
        }));
      }
    });
    return Promise.all(promises);
  });
};
/**
 * Get metadata for a specific dataset
 * @param {Number} datasetId - Id of the dataset to get metadata for
 *
 */
module.exports.getMetadata = datasetId => models.Dataset.findOne({
  where: {
    id: datasetId,
  },
  include: [models.Attribute, models.File],
  order: [[models.Attribute, 'id', 'ASC'], [models.File, 'id', 'ASC']],
  rejectOnEmpty: true,
});
/**
 * Get a file by datasetId and filetype.
 * @param {Number} datasetId - Id of the dataset to which the file belongs
 * @param {Number} filetype - Requested file type
 * @returns {String} filePath - File path of the requested file
 */
module.exports.getFile = (datasetId, filetype) => models.File.findOne({
  where: {
    DatasetId: datasetId,
    type: filetype,
  },
  rejectOnEmpty: true,

}).then((file) => {
  const fileData = file.get({ plain: true });
  const filePath = path.resolve(`${storageDir}${datasetId}/${fileData.path}`);
  return filePath;
});
/**
 * Delete a dataset by id
 * @param {Number} id - Id of the dataset to delete
 * @returns {Object} Dataset that was deleted
 */
module.exports.deleteDataset = (id) => {
  let ds;
  // Find the dataset to be deleted
  return models.Dataset.findOne({
    where: {
      id,
    },
    include: [models.Attribute, models.File],
    rejectOnEmpty: true,
  })
  // Delete associated files
    .then((dataset) => {
      ds = dataset;
      return del([`${ds.get({ plain: true }).filePath}/**`]);
    // Delete files and attributes from database
    }).then(() => {
      const promiseArray = [];
      ds.Files.forEach((file) => {
        promiseArray.push(file.destroy());
      });
      ds.Attributes.forEach((attribute) => {
        promiseArray.push(attribute.destroy());
      });
      return Promise.all(promiseArray);
    }).then(() => ds.destroy())
    // Return deleted dataset
    .then(() => ds);
};
