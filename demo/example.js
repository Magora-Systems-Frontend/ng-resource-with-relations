(function () {

    'use strict';

    angular
        .module('myApp', ['mgr.ngResourceWithRelations'])
        .factory('CategoryModel', CategoryModel)
        .factory('NewsModel', NewsModel)
        .run(run);


    CategoryModel.$inject = ['$resourceWithRelations'];

    function CategoryModel($resourceWithRelations) {
        return $resourceWithRelations('category.json', {
            "news": {
                "modelName": "NewsModel",
                "collection": "news",
                "via": "category_id"
            }
        }, {id: '@id'})
    }

    NewsModel.$inject = ['$resourceWithRelations'];

    function NewsModel($resourceWithRelations) {
        return $resourceWithRelations('news.json', {
            "category_id": {
                "modelName": "CategoryModel"
            }
        }, {id: '@id'})
    }


    run.$inject = ['CategoryModel', 'NewsModel'];

    function run(CategoryModel, NewsModel) {
        CategoryModel.getWith('news', {}, function (items) {
            console.log('items', items)
        });

        CategoryModel.getWith([{
            model: 'news',
            params: {
                sort: 'id'
            }
        }], {}, function (items) {
            console.log('items', items)
        });

    }

})();