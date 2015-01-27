'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$rootScope', 'Global', 'Menus',
  function($scope, $rootScope, Global, Menus) {
    $scope.global = Global;
    $scope.menus = {};

    // Default hard coded menu items for main menu
    var defaultMainMenu = [{
        'title': 'Home',
        'link': 'home'
    },{
        'title': 'Pipewatch Map',
        'link': 'map'
    },{
        'title': 'Media',
        'link': 'media'
    },{
        'title': 'Protectors',
        'link': 'protectors'
    },{
        'title': 'Resources',
        'link': 'resources'
    },{
        'title': 'Get Involved',
        'link': 'get-involved'
    }];
      
    $scope.doNav = function() {
        if($scope.navCollapsed===false) {
            $scope.navCollapsed = true;
        } else if($scope.navCollapsed===true) {
            $scope.navCollapsed = false;
        }
    }

    // Query menus added by modules. Only returns menus that user is allowed to see.
    function queryMenu(name, defaultMenu) {

      Menus.query({
        name: name,
        defaultMenu: defaultMenu
      }, function(menu) {
        $scope.menus[name] = menu;
        // Removing Mean Upload menu item, gotta be a better way... (remake the whole module?)
        for (menu in $scope.menus) {
            $scope.menus[menu].forEach(function(element,index,array){
                if(element.name==="Mean upload help page") {
                    var i = $scope.menus[menu].indexOf(element);
                    if(i != -1) {
                        $scope.menus[menu].splice(i, 1);
                    }
                }
            });
        }
      });
    }

    // Query server for menus and check permissions
    queryMenu('main', defaultMainMenu);

    $scope.isCollapsed = false;

    $rootScope.$on('loggedin', function() {

      queryMenu('main', defaultMainMenu);

      $scope.global = {
        authenticated: !! $rootScope.user,
        user: $rootScope.user
      };
    });
  }
]);
