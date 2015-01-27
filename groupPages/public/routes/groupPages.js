'use strict';

//Setting up route
angular.module('mean.groupPages').config(['$stateProvider',
  function($stateProvider) {
    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };

    // states for my app
    $stateProvider
      .state('all groupPages', {
        url: '/groupPages',
        templateUrl: 'groupPages/views/admin.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('create groupPage', {
        url: '/groupPages/create',
        templateUrl: 'groupPages/views/create.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('edit groupPage', {
        url: '/groupPages/:groupPageId/edit',
        templateUrl: 'groupPages/views/edit.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('groupPage by id', {
        url: '/groupPages/:groupPageId',
        templateUrl: 'groupPages/views/view.html',
        resolve: {
          // loggedin: checkLoggedin
        }
      });
  }
]);
