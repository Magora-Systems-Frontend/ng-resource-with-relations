(function () {

    'use strict';

    angular
        .module('ngResourceWithRelations', ['ngResource'])
        .provider('$resourceWithRelations', $resourceWithRelationsProvider);

    function $resourceWithRelationsProvider() {


        this.$get = ['$resource', '$q', '$injector', function ($resource, $q, $injector) {

            return function (url, relations, paramDefaults, actions, options) {

                if (relations === undefined) {
                    relations = {};
                }

                var modelResource = $resource(url, paramDefaults, actions, options);

                modelResource._with = function (method, relations, params, cb) {
                    if (relations === undefined) {
                        relations = [];
                    }
                    if (params === undefined) {
                        params = {};
                    }

                    return (function (relations, params, cb) {
                        return modelResource[method](params, function (response) {
                            var promises = [];

                            if (response instanceof Array) {
                                for (var i = 0; i < response.length; i++) {
                                    promises.push(response[i].$getRelations(relations))
                                }
                            } else {
                                promises.push(response.$getRelations(relations))
                            }

                            return $q.all(promises).then(function () {
                                cb && cb(response);
                            })
                        })

                    })(relations, params, cb);
                };

                modelResource.queryWith = function (relations, params, cb) {
                    return this._with('query', relations, params, cb);
                };

                modelResource.getWith = function (relations, params, cb) {
                    return this._with('get', relations, params, cb);
                };

                angular.extend(modelResource.prototype, {
                    relations: relations,
                    $getRelations: function (relations) {
                        var model = this;
                        if (relations === undefined) {
                            relations = [];
                        } else if (typeof relations === 'string') {
                            relations = [relations];
                        }

                        var deferred = $q.defer();
                        var promises = [];


                        for (var i = 0; i < relations.length; i++) {
                            var relation = relations[i];

                            if (typeof relation === 'string') {
                                var r = relation.split('.');
                                relation = {
                                    model: r[0],
                                    params: {},
                                    with: []
                                };

                                if (r[1] != undefined) {
                                    relation.with.push(r[1]);
                                }
                            }

                            relation = angular.extend({
                                model: null,
                                params: {},
                                with: []
                            }, relation);

                            if (this.relations[relation.model] !== undefined) {
                                var params = this.relations[relation.model];

                                var relationModel = $injector.get(params.modelName);

                                var method = 'get';
                                if (params.collection !== undefined) {
                                    model[relation.model] = [];
                                    method = 'query';

                                    relation.params[params['via']] = this.id;
                                } else {
                                    relation.params['id'] = this[params.model];
                                }

                                (function (relation, promises, model) {
                                    if (!relation.with.length) {
                                        promises.push(relationModel[method](relation.params, function (data) {
                                            model[relation.model] = data;
                                        }));
                                    } else {
                                        promises.push(relationModel[method + 'With'](relation.with, relation.params, function (data) {
                                            model[relation.model] = data;
                                        }));
                                    }
                                })(relation, promises, model);
                            }

                            $q.all(promises).then(function () {
                                deferred.resolve(model);
                            });
                        }
                        return deferred.promise


                    }
                });

                return modelResource
            };
        }]
    }

})();