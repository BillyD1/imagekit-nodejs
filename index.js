/*
    Helper Modules
*/
var _ = require('lodash');

/*
    Implementations
*/
var url = require('./libs/url');
var upload = require('./libs/upload');
var manage = require('./libs/manage');
var signature = require('./libs/signature');

/*
    Utils
*/
var pHashUtils = require('./utils/phash');
var transformationUtils = require('./utils/transformation');
var errorMessages = require("./constants/errorMessages");

var ImageKit = function(opts) {
    opts = opts || {};
    this.options = {
        publicKey : "",
        privateKey : "",
        urlEndpoint : "",
        transformationPosition : transformationUtils.getDefault()
    };

    this.options = _.extend(this.options, opts);
    if(!this.options.publicKey) {
        throw new Error(errorMessages.MANDATORY_PUBLIC_KEY_MISSING.message);
    }
    if(!this.options.privateKey) {
        throw new Error(errorMessages.MANDATORY_PRIVATE_KEY_MISSING.message);
    }
    if(!this.options.urlEndpoint) {
        throw new Error(errorMessages.MANDATORY_URL_ENDPOINT_KEY_MISSING.message);
    }

    const promisify = function(f) {
        return function(...args) {
            const self = this;            
            if (args.length === f.length) {
                if (typeof args[args.length-1] !== 'function') {
                    throw new Error('Callback must be a function.')
                }
                f.call(self, ...args)
            } else {
                return new Promise((resolve, reject) => {
                    const callback = function(err, ...results) {
                        if (err) {
                            return reject(err);
                        } else {
                            resolve(results.length > 1 ? results : results[0])
                        }
                    }
                    args.push(callback);
                    f.call(self, ...args);
                });
            }
        }
    }

    /*
        URL Builder
    */
    this.url = function(urlOptions) {
        return url(urlOptions, this.options);
    };

    /*
        Upload API
    */
    this.upload = promisify(function(uploadOptions, callback) {
        return upload(uploadOptions, this.options, callback);
    });

    /*
        Image Management APIs
    */

    // List and Search Files API
    this.listFiles = promisify(function(listOptions, callback) {
        return manage.listFiles(listOptions, this.options, callback);
    });

    // Get File Details API
    this.getFileDetails = promisify(function(fileId, callback) {
        return manage.getFileDetails(fileId, this.options, callback);
    });

    // Get File Metadata API
    this.getFileMetadata = promisify(function(fileId, callback) {
        return manage.getFileMetadata(fileId, this.options, callback);
    });

    // Update File Details API
    this.updateFileDetails = promisify(function(fileId, updateData, callback) {
        return manage.updateFileDetails(fileId, updateData, this.options, callback);
    });

    // Add bulk tags
    this.bulkAddTags = promisify(function(fileIdArray, tags, callback) {
        return manage.bulkAddTags(fileIdArray, tags, this.options, callback);
    });

    // Remove bulk tags
    this.bulkRemoveTags = promisify(function(fileIds, tags, callback) {
        return manage.bulkRemoveTags(fileIds, tags, this.options, callback);
    });

    // Delete File API
    this.deleteFile = promisify(function(fileId, callback) {
        return manage.deleteFile(fileId, this.options, callback);
    });

    // Purge Cache API
    this.purgeCache = promisify(function(url, callback) {
        return manage.purgeCache(url, this.options, callback);
    });

    // Purge Cache Status API
    this.getPurgeCacheStatus = promisify(function(requestId, callback) {
        return manage.getPurgeCacheStatus(requestId, this.options, callback);
    });

    this.bulkDeleteFiles = promisify(function(fileIdArray, callback) {
        return manage.bulkDeleteFiles(fileIdArray, this.options, callback);
    });

    // Copy files API
    this.copyFile = promisify(function(sourceFilePath, destinationPath, callback) {
        return manage.copyFile(sourceFilePath, destinationPath, this.options, callback);
    });

    // Move files API
    this.moveFile = promisify(function(sourceFilePath, destinationPath, callback) {
        return manage.moveFile(sourceFilePath, destinationPath, this.options, callback);
    });

    // Create folder API
    this.createFolder = promisify(function(folderName, parentFolderPath, callback) {
        return manage.createFolder(folderName, parentFolderPath, this.options, callback);
    });

    // Delete folder API
    this.deleteFolder = promisify(function(folderPath, callback) {
        return manage.deleteFolder(folderPath, this.options, callback);
    });

    // Copy folder API
    this.copyFolder = promisify(function(sourceFolderPath, destinationPath, callback) {
        return manage.copyFolder(sourceFolderPath, destinationPath, this.options, callback);
    });

    // Move folder API
    this.moveFolder = promisify(function(sourceFolderPath, destinationPath, callback) {
        return manage.moveFolder(sourceFolderPath, destinationPath, this.options, callback);
    });

    // To generate Signature for upload request
    this.getAuthenticationParameters = function(token, timestamp) {
        return signature.getAuthenticationParameters(token, timestamp, this.options);   
    };

    // Get bulk job status API
    this.getBulkJobStatus = promisify(function(jobId, callback) {
        return manage.getBulkJobStatus(jobId, this.options, callback);
    });

    // To calculate distance between two pHash strings
    this.pHashDistance = function(firstPHash, secondPHash) {
        return pHashUtils.pHashDistance(firstPHash, secondPHash);
    }
};

module.exports = ImageKit;