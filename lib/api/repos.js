
var async = require('async');
var utils = require('lodash');
var Promise = require('promise');

module.exports = function (client) {

    var projects = require('./projects')(client);

    return {
        get: function(projectKey, options) {
            return client.getCollection('projects/' + projectKey + '/repos', options);
        },

        create: function(projectKey, repo, options) {
            options = options || {};
            options.name = repo;
            return client.post('projects/' + projectKey + '/repos', options);
        },

        getRepo: function(projectKey, repo, options) {
            return client.get('projects/' + projectKey + '/repos/' + repo, options);
        },

        browse: function(projectKey, repo, options) {
            options = options || {};

            var uriPath = 'projects/' + projectKey + '/repos/' + repo + '/browse';
            if (options.path) {
                uriPath += '/' + options.path;
            }

            return client.getCollection(uriPath, options);
        },

        getCombined: function(projectKey, options) {
            if (projectKey) {
                return this.get(projectKey, options);
            }
            else {
                // For each project, get all repos.
                var reposCombined = [];

                var API = this;

                return new Promise(function(resolve, reject) {
                    // Get all projects.
                    projects.get().then(function(projectsResponse) {
                        // Async, for each project.
                        async.forEachOf(projectsResponse.values, function(project, index, callback) {
                            // Get project repos.
                            API.get(project.key).then(function(repoResponse) {
                                // Merge to result.
                                reposCombined = utils(reposCombined).concat(repoResponse.values).value();
                                callback();
                            }).catch(function(err) {
                                callback(err);
                            });
                        }, function(err) { // all repos resolved.
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve({values:reposCombined});
                            }
                        });
                    }).catch(function(err) {
                        reject(err);
                    });
                });
            };
        }
    };
};

