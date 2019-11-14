/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Custom error class
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
class CustomError extends Error {
  constructor(message, status) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;

    this.status = status || 500;
  }
}

module.exports.UnableToOpenDatasourceError = class UnableToOpenDatasourceError extends CustomError {
  constructor(message, filePaths) {
    super(message || 'Unable To Open Data Source with available drivers.');
    this.filePaths = filePaths || {};
  }
};

module.exports.WrongFileTypeError = class WrongFileTypeError extends CustomError {
  constructor(message, filePath) {
    super(message || 'Wrong file type and/or extension.');
    this.filePath = filePath || {};
  }
};

