angular
        .module('myApp', ['mgr.ngResourceWithRelations'])
        
        
Данный модуль позволяет связать несколько моделей.

Базируется модуль на ngResource.
Модуль добавляет два метода к $resource

getWith и queryWith

первым параметром передаем relations

relations может быть строкой или массивом

вложенность связанности не ограничена

relations = 'news.category......'

или

relations = [{
            model: 'news',
            params: {
                sort: 'id'
            },
            with: [{
                model: 'category'
            }]
        }]
        
  Для связанных моделей можно передать дополнительные параметры на сервер

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
