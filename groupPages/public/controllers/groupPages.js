// 'use strict';

angular.module('mean.groupPages',['uiGmapgoogle-maps','froala'])

// GROUP PAGES CONTROLLER
// This runs across the site and acts as a parent controller, with most common methods and data embedded in here.
.controller('GroupPagesController', ['$scope','$sce','$stateParams','$rootScope','$location', 'Global', 'GroupPages',
  function($scope,$sce,$stateParams, $rootScope,$location, Global, GroupPages) {
    $scope.global = Global;
    var vm = this;

    // SECURITY
    // Basic authentication to see if user admin or current page admin
    $scope.hasAuthorization = function(groupPage) {
      if (!groupPage || !groupPage.user) return false;
      return $scope.global.isAdmin || groupPage.user._id === $scope.global.user._id;
    };
    
    // Check is user is logged in
    $scope.loggedIn = function () {
        if(!$scope.global.user._id||$scope.global.user._id==='') { 
            $scope.loggedIn = false;
        } else {
            $scope.loggedIn = true;
        }
    }
    
    // Check various permission level according to page and user
    $scope.privacyCheck = function (groupPageObject) {
        var isItTrue;
        var groupPagePrivacy = groupPageObject.privacy;
        // If private, check userId of page against userID
        if(groupPagePrivacy==='Private') {
            if(groupPageObject.user._id === $scope.global.user._id) {
                isItTrue = true;
            } else {
                isItTrue = false;
            }
        }
        // If selected members, check userList of page against userID
        else if(groupPagePrivacy==='Selected Members Only') {
            if(groupPageObject.allowedMembers.indexOf($scope.global.user._id) > -1) {
                isItTrue = true;
            } else {
                isItTrue = false;
            }
        }
        // If logged in, check if user is authenticated
        else if(groupPagePrivacy==='Logged In Only') {
            if(!$scope.global.user._id||$scope.global.user._id==='') {
                isItTrue = false;
            } else {
                isItTrue = true;
            }
        }
        // If public, its true
        else if(groupPagePrivacy==='Public') {
            isItTrue = true;
        }
        if(isItTrue===true) {
            return true;
        } else {
            return false;
        }
    }
    
    // FORM HANDLING
    // default categorie
    $scope.categories = ['Protectors','Media'];
    $scope.category = $scope.categories[0];
      
    // default privacy settings
    $scope.privacies = ['Public','Logged In Only','Selected Members Only','Private'];
    $scope.privacy = $scope.privacies[0];
      
    // setting up WYSIWYG editor function
    // On local testing, icons do not appear
    $scope.initializeFroalaEditor = function(className) {
         $scope.froalaOptions = {
            buttons : ["bold", "italic", "underline", "sep", "align", "insertOrderedList", "insertUnorderedList"]
         }
    }
      
    // Remove current media or protector page
    $scope.remove = function(groupPage) {
      if (groupPage) {
        groupPage.$remove(function(response) {
          for (var i in $scope.groupPages) {
            if (vm.groupPages[i] === groupPage) {
              vm.groupPages.splice(i, 1);
            }
          }
          // $location.path('groupPages');
          console.log('removed!');
        });
      } else {
        $scope.groupPage.$remove(function(response) {
          // $location.path('groupPages');
          console.log('removed!');
        });
      }
    };

    // Find all groupPages
    $scope.find = function() {
      GroupPages.query(function(groupPages) {
        //$scope.groupPages = groupPages;
        vm.groupPages = groupPages;
      });
    };

    // Get one particular groupPage
    $scope.findOne = function() {
      GroupPages.get({
        groupPageId: $stateParams.groupPageId
      }, function(groupPage) {
        vm.groupPage = groupPage;
        $scope.sanitizedContent = $sce.trustAsHtml(vm.groupPage.content);
      });
    };
    
    // Functions for stuff across media and protector pages
    $scope.googleStorage = function() { 
        $scope.googleStorage.editingAllowed=true;
    }
    $scope.manageMembers = function() { 
        $scope.manageMembers.editingAllowed=true;
    }
    $scope.uploadFile = function() {
        // If button exists and is pressed, fields are shown
        $scope.uploadFile.editingAllowed=true;
    }
    $scope.uploadFileCallback2 = function(file) {
        console.log('1 File uploaded');
    }
    $scope.uploadFinished2 = function(files) {
        // Get parent page ID
        GroupPages.get({
            groupPageId: $stateParams.groupPageId
        }, function(groupPage) {
            files.forEach(function(element, index, array) {
                if(!groupPage.imageAttachments) {
                    groupPage.imageAttachments = [];
                }
                // Add to parent page
                groupPage.imageAttachments.push(element);
                $rootScope.imageAttachments.push(element);
                groupPage.$update();
            });
        });
   }
  }
])
// CREATE PAGE CONTROLLER
.controller('CreatePageController', ['$scope','$stateParams','$location','GroupPages',
  function($scope,$stateParams,$location,GroupPages) { 
    // Create media page or group page
    $scope.create = function(isValid) {
      if (isValid) {
        var allowedMembers = [];
        allowedMembers.push($scope.global.user._id);
        var groupPage = new GroupPages({
          title: this.title,
          content: this.content,
          category: $scope.category,
          privacy: $scope.privacy, // Should be modified to handle news and spills as well, depending on what is given
          allowedMembers : allowedMembers
        });
        groupPage.$save(function(response) {
            $location.path('groupPages/' + response._id);
        });

        this.title = '';
        this.content = '';
        
      } else {
        $scope.submitted = true;
      }
    };
}])
// EDIT PAGE CONTROLLER
.controller('EditPageController', ['$scope', '$stateParams','$location','GroupPages',
  function($scope,$stateParams,$location,GroupPages) { 
    // Update current media or protector page
    $scope.update = function(isValid) {
      if (isValid) {
        var groupPage = $scope.vm.groupPage;
        if (!groupPage.updated) {
          groupPage.updated = [];
        }
        groupPage.updated.push(new Date().getTime());

        groupPage.$update(function() {
            $location.path('groupPages/' + groupPage._id);
        });
      } else {
        $scope.submitted = true;
      }
    };
}])
// PROTECTOR PAGES CONTROLLERS
// These controllers run on protector pages.

    // Protector.html listing
    .controller('ProtectorListController',['$scope','$stateParams','$location','$sce','Global','GroupPages', 
      function($scope,$stateParams,$location,$sce,Global,GroupPages) {
        $scope.protectors = [];
        // Loop to get all protector pages and add to array
        GroupPages.query(function(groupPages) {
            groupPages.forEach(function(element,index,array) {
                if(element.category==='Protectors') {
                    var isItTrue = $scope.privacyCheck(element);
                    if(isItTrue) {
                        // Fix content for appearing in edit area
                        element.content = $sce.trustAsHtml(element.content);
                        $scope.protectors.push(element);
                    }
                }
            });
        });
        $scope.drop = function(page) {
            var index = $scope.protectors.indexOf(page);
            $scope.protectors.splice(index, 1);
        }
    }])

    // Protector page general controller
    .controller('ProtectorPageController', ['$scope', '$stateParams', '$rootScope', 'Global', 'GroupPages', 
      function($scope,$stateParams,$rootScope,Global,GroupPages) {
        GroupPages.get({
            groupPageId: $stateParams.groupPageId
          }, function(groupPage) {
             // Check and remove unneeded elements from page
            $scope.groupPageCategory = groupPage.category;
            // Set image attachments to be on the $scope
            $rootScope.imageAttachments = [];
            $rootScope.imageAttachments = groupPage.imageAttachments;

            // Collect and display child pages
            $scope.global = Global;
            if($scope.global.user._id) {
                // Check for user permissions and then adjust $scope.editingAllowed to true
                if($scope.global.user._id===groupPage.user._id) {
                    $scope.editingAllowed=true;
                    // Get childrenGroupPageIDs, get the multidimensional array, and give to $scope
                    groupPage.childrenGroupPageArrays.forEach(function(element, index, array) {
                        if(!$scope.childrenGroupPageArraysNow) {
                            $scope.childrenGroupPageArraysNow = [];
                        }
                        var isItTrue = privacyCheck(element);
                        if (isItTrue===true) {
                            $scope.childrenGroupPageArraysNow.push(element);
                        }
                    });
                } else {
                    $scope.editingAllowed=false;
                }
            }
            $scope.deleteImage = function(img) {
                var index = groupPage.imageAttachments.indexOf(img);
                $scope.imageAttachments.splice(index, 1);
                groupPage.imageAttachments.splice(index, 1);
                groupPage.$update();
            }
        });
       
          
        // Functions for various protector features
        $scope.addTextarea = function() {
            // If button exists and is pressed, fields are shown
            $scope.addTextarea.editingAllowed=true;
        }
        $scope.rearrangeTextareas = function() {
            // If button exists and is pressed, fields are shown
            $scope.rearrangeTextareas.editingAllowed=true;
        }
    }
])
    // Creating textareas (childpages)
    .controller('AddTextareaController',['$scope','$stateParams','$location','Global','GroupPages', 
      function($scope,$stateParams,$location,Global,GroupPages) {
        $scope.global = Global;
        var vm = this;
        var parentGroupPage;
        
        // Get parent page ID
        GroupPages.get({
            groupPageId: $stateParams.groupPageId
        }, function(groupPage) {
            parentGroupPage = groupPage;
        });
        
        $scope.create = function(isValid) {
          if (isValid) {
            // Create textarea
            var childTextarea = new GroupPages({
              title: this.title,
              content: this.content,
              category: 'groupPageTextarea',
              privacy: $scope.privacy,
              parentGroupPageID : parentGroupPage._id,
            });
            childTextarea.$save(function(response) {
                // Update Parent Page with time and children IDs
                // Initialize variables if they don't exist yet
                if (!parentGroupPage.updated) {
                  parentGroupPage.updated = [];
                }
                parentGroupPage.updated.push(new Date().getTime());
                if (!parentGroupPage.childrenGroupPageArrays) {
                    parentGroupPage.childrenGroupPageArrays = [];
                }
                if (!$scope.childrenGroupPageArraysNow) {
                    $scope.childrenGroupPageArraysNow = [];
                }
                $scope.childrenGroupPageArraysNow.push(response);
                parentGroupPage.childrenGroupPageArrays.push(response);
                parentGroupPage.$update();
            });

        this.title = '';
        this.content = '';

        } else {
            $scope.submitted = true;
        }
    }
}])
    // edit child area on protector page
    .controller('EditChildPageController', ['$scope', '$stateParams','$location','$sce','Global','GroupPages', 
      function($scope,$stateParams,$location,$sce,Global,GroupPages) {
        $scope.global = Global;
        $scope.thisChildGroupPage.thisChildGroupToken = false;
        $scope.thisChildGroupPage.showEditArea = false;
        var parentGroupPage = GroupPages.get({
            groupPageId: $stateParams.groupPageId
        });
        $scope.thisChildGroupPage.htmlSafe = $sce.trustAsHtml($scope.thisChildGroupPage.content);
        $scope.editChildPage = function() {
            $scope.thisChildGroupPage.thisChildGroupToken = true;
            $scope.thisChildGroupPage.showEditArea = true;
        };
        // Not saved as its own post - saved underneath the parent post
        $scope.saveChildPage = function(thisChildGroupPage) {
            var index = $scope.childrenGroupPageArraysNow.indexOf(thisChildGroupPage);
            $scope.childrenGroupPageArraysNow[index].htmlSafe = $sce.trustAsHtml($scope.childrenGroupPageArraysNow[index].content);
            parentGroupPage.childrenGroupPageArrays = $scope.childrenGroupPageArraysNow;
            if (!parentGroupPage.updated) {
                parentGroupPage.updated = [];
            }
            parentGroupPage.updated.push(new Date().getTime());
            parentGroupPage.$update(function() {
                $scope.thisChildGroupPage.thisChildGroupToken = false;
                $scope.thisChildGroupPage.showEditArea = false;
                // location.reload();
            });
        };
        $scope.deleteChildPage = function() {
            // And remove child page from parent element
            var index = $scope.childrenGroupPageArraysNow.indexOf($scope.thisChildGroupPage);
            $scope.childrenGroupPageArraysNow.splice(index, 1);
            parentGroupPage.childrenGroupPageArrays = $scope.childrenGroupPageArraysNow;
            if (!parentGroupPage.updated) {
                parentGroupPage.updated = [];
            }
            parentGroupPage.updated.push(new Date().getTime());
            parentGroupPage.$update();
        };
}])
    // rearrange textareas (childpages)
    .controller('RearrangeTextareasController',['$scope','$stateParams','GroupPages',
      function($scope,$stateParams,GroupPages) {
          // Just take the array created within the directive, and update the parent Post
          $scope.moveUp = function() {
              var index = $scope.childrenGroupPageArraysNow.indexOf($scope.thisChildGroupPage),     
              newPos = index - (1);
              if(index === -1) 
                throw new Error("Element not found in array");
              if(newPos < 0) 
                newPos = 0;
              $scope.childrenGroupPageArraysNow.splice(index,1);
              $scope.childrenGroupPageArraysNow.splice(newPos,0,$scope.thisChildGroupPage);
            };
          $scope.moveDown = function() {
              var index = $scope.childrenGroupPageArraysNow.indexOf($scope.thisChildGroupPage),     
                newPos = index + (1);
              if(index === -1) 
                throw new Error("Element not found in array");
              if(newPos >= this.length) 
                newPos = this.length;
              $scope.childrenGroupPageArraysNow.splice(index, 1);
              $scope.childrenGroupPageArraysNow.splice(newPos,0,$scope.thisChildGroupPage);
            };
          $scope.updateTextareaOrder = function() {
              GroupPages.get({
                groupPageId: $stateParams.groupPageId
              }, function(groupPage) {
                if (!groupPage.updated) {
                  groupPage.updated = [];
                }
                groupPage.updated.push(new Date().getTime());
                // Reset the array to remake it
                groupPage.childrenGroupPageArrays = [];
                $scope.childrenGroupPageArraysNow.forEach(function(element, index, array) {
                    groupPage.childrenGroupPageArrays.push(element);
                });

                groupPage.$update();
              });
          }
    }])

// RESOURCES CONTROLLER 
    // resources.html listing
    .controller('ResourcesController',['$scope','$stateParams','$location','Global','GroupPages', 
      function($scope,$stateParams,$location,Global,GroupPages) {
        $scope.news = []; 
        GroupPages.query(function(groupPages) {
            groupPages.forEach(function(element,index,array) {
                if(element.category==='News') {
                    $scope.news.push(element);
                }
            });
        });
        $scope.drop = function(page) {
            var index = $scope.news.indexOf(page);
            $scope.news.splice(index, 1);
        }
    }])

// NEWS CONTROLLER 
    // admin.html listing
    .controller('NewsController',['$scope','$stateParams','GroupPages',
      function($scope,$stateParams,GroupPages) {
          GroupPages.get({
            groupPageId: $stateParams.groupPageId
          }, function(groupPage) {
            if(groupPage.customInformation) {
                $scope.coords = groupPage.coords;
                $scope.newsCategory = groupPage.customInformation.newsCategory;
                if($scope.newsCategory==='Proposed project') {
                    $scope.news = groupPage.customInformation;
                    if(!$scope.news) {
                        $scope.news = {};
                    }
                    if(!$scope.news.sourceItems) {
                        $scope.news.sourceItems = [];
                    }
                    $scope.news.newSourceItems = [];
                } else if ($scope.newsCategory==='Spill') {
                    $scope.spill = groupPage.customInformation;
                    if(!$scope.spill) {
                        $scope.spill = {};
                    }
                    if(!$scope.spill.spillItems) {
                        $scope.spill.spillItems = [];
                    }
                    $scope.spill.newSpillItems = [];
                }
            }
            $scope.saveData = function () {
                if (!groupPage.updated) {
                  groupPage.updated = [];
                }
                groupPage.updated.push(new Date().getTime());
                
                if($scope.newsCategory==='Proposed project') {
                    groupPage.customInformation.newsCategory = 'Proposed project';
                    $scope.news.newSourceItems.forEach(function (element,index,array) {
                        groupPage.customInformation.sourceItems.push(element);
                    });
                } else if ($scope.newsCategory==='Spill') {
                    groupPage.customInformation.newsCategory = 'Spill';
                    groupPage.customInformation.type = $scope.spill.type;
                    groupPage.customInformation.cause = $scope.spill.cause;
                    var arrayArray = ['newSpillItems','newCompanyItems','newLegalItems','newEnvironmentalItems','newSourceItems'];
                    var arrayArray2 = ['spillItems','companyItems','legalItems','environmentalItems','sourceItems'];
                    arrayArray.forEach(function (element,index,array) {
                        $scope.spill[element].forEach(function (element2,index2,array2) {
                            var thisArraySlug = arrayArray2[index];
                            if(!groupPage.customInformation[thisArraySlug]) {
                                groupPage.customInformation[thisArraySlug] = [];
                            }
                            groupPage.customInformation[thisArraySlug].push(element2);
                        });
                        $scope.spill[element] = [];
                    });
                }
                
                groupPage.$update(function(response) {
                    if($scope.newsCategory==='Proposed project') {
                        $scope.news = response.customInformation;
                    } else if ($scope.newsCategory==='Spill') {
                        $scope.spill = response.customInformation;
                    }
                    location.reload();
                });
            };
            $scope.removeThis = function (thisArray,thisItem) {
                if($scope.newsCategory==='Proposed project') {
                    groupPage.customInformation.newsCategory = 'Proposed project';
                    var index = $scope.news[thisArray].indexOf(thisItem);
                    $scope.news[thisArray].splice(index, 1);
                    groupPage.customInformation[thisArray] = $scope.news[thisArray];
                    groupPage.$update();
                } else if ($scope.newsCategory==='Spill') {
                    groupPage.customInformation.newsCategory = 'Spill';
                    var index = $scope.spill[thisArray].indexOf(thisItem);
                    $scope.spill[thisArray].splice(index, 1);
                    groupPage.customInformation[thisArray] = $scope.spill[thisArray];
                    groupPage.$update();
                }
            }
            $scope.editDetails = function () {
                $scope.mapOptions = {};
                $scope.mapOptions.editDetails = true;
            }
          });
          
        $scope.createNews = function () {
              // Number of sources
              $scope.addSource = function () {
                  var thisSourceItem = {
                      name : '', // ocean, river, etc
                      link : '', // array
                      author : '', // array
                      date : '',
                      title: '',
                      summary : '' // true or false
                  }
                  $scope.news.newSourceItems.push(thisSourceItem);
              }
              $scope.removeSource = function (thisSource) {
                  var index = $scope.news.newSourceItems.indexOf(thisSource);
                  $scope.news.newSourceItems.splice(index, 1);
              }
          }
          // SPILL SETTINGS
          $scope.createSpill = function () {
              // Setting basic variables
              $scope.spill.types = ['Pipeline','Train','Automobile','Ship','Other'];
              $scope.spill.type = $scope.spill.types[0];

              $scope.spill.causes = ['Mechanical','Human Error','Maintenance','Unknown','Other'];
              $scope.spill.cause = $scope.spill.causes[0];

              // Add new spill amount
              $scope.addSpillAmount = function () {
                  var thisSpillItem = {
                      type : 'Gasoline', // Set label
                      amount : '',
                      amountsTypes : ['Gasoline','Oil','Diesel','Chemicals','Other']
                  }
                  $scope.spill.newSpillItems.push(thisSpillItem);
              }
              $scope.removeSpillAmount = function (thisSpillAmount) {
                  var index = $scope.spill.newSpillItems.indexOf(thisSpillAmount);
                  $scope.spill.newSpillItems.splice(index, 1);
              }

              // Number of legal items
              $scope.spill.newLegalItems = [];
              $scope.addLegal = function () {
                  var thisLegalItem = {
                      plaintiff : '',
                      defendant : '',
                      verdict : '',
                      fine : '',
                      punishment : '',
                      description : '' // cost, etc details can go here
                  }
                  $scope.spill.newLegalItems.push(thisLegalItem);
              }
              $scope.removeLegal = function (thisLegal) {
                  var index = $scope.spill.newLegalItems.indexOf(thisLegal);
                  $scope.spill.newLegalItems.splice(index, 1);
              }   

               // Number of environmental items
              $scope.spill.newEnvironmentalItems = [];
              $scope.addEnvironmental = function () {
                  var thisEnvironmentalItem = {
                      area : '', // ocean, river, etc
                      species : '', // array
                      chemicals : '', // array
                      fine : '',
                      cleanedUp : '', // true or false
                      description : '' // custom details
                  }
                  $scope.spill.newEnvironmentalItems.push(thisEnvironmentalItem);
              }
              $scope.removeEnvironmental = function (thisEnvironmental) {
                  var index = $scope.spill.newEnvironmentalItems.indexOf(thisEnvironmental);
                  $scope.spill.newEnvironmentalItems.splice(index, 1);
              }

              // Number of sources
              $scope.spill.newSourceItems = [];
              $scope.addSource = function () {
                  var thisSourceItem = {
                      name : '', // ocean, river, etc
                      link : '', // array
                      author : '', // array
                      date : '',
                      title: '',
                      summary : '' // true or false
                  }
                  $scope.spill.newSourceItems.push(thisSourceItem);
              }
              $scope.removeSource = function (thisSource) {
                  var index = $scope.spill.newSourceItems.indexOf(thisSource);
                  $scope.spill.newSourceItems.splice(index, 1);
              }

              // Number of companies
              $scope.spill.newCompanyItems = [];
              $scope.addCompany = function () {
                  var thisCompany = {
                      name : '', // ocean, river, etc
                      website : '', // array
                  }
                  $scope.spill.newCompanyItems.push(thisCompany);
              }
              $scope.removeCompany = function (thisCompany) {
                  var index = $scope.spill.newCompanyItems.indexOf(thisCompany);
                  $scope.spill.newCompanyItems.splice(index, 1);
              }
              $scope.spill.imageAttachments = []; // Autoattached if uploaded, could also be GCS pointers
          }
  }])
// ADMIN PAGE CONTROLLER 
    // admin.html listing
    .controller('AdminPageController',['$scope', 
      function($scope) {
        // 'groupPageTextarea' optional
        $scope.adminCategories = ['News','Protectors','Media'];
    }])
// MEDIA PAGES CONTROLLER
    // media.html listing
    .controller('MediaPageListController',['$scope','$stateParams','$location','Global','GroupPages', 
      function($scope,$stateParams,$location,Global,GroupPages) {
        $scope.media = []; 
        GroupPages.query(function(groupPages) {
            groupPages.forEach(function(element,index,array) {
                if(element.category==='Media') {
                    $scope.media.push(element);
                }
            });
        });
        $scope.drop = function(page) {
            var index = $scope.media.indexOf(page);
            $scope.media.splice(index, 1);
        }
        $scope.getMediaPost = function() {
            GroupPages.get({
                groupPageId: '54c87d0e75f1415f1da57e74'
              }, function(groupPage) {
                $scope.imageAttachments = [];
                $scope.imageAttachments = groupPage.imageAttachments;
                $scope.isAdminOfMedia = function() {
                  if (!groupPage || !groupPage.user) return false;
                  return $scope.global.isAdmin || groupPage.user._id === $scope.global.user._id;
                };
            });
        }
        $scope.uploadFinished3 = function(files) {
            GroupPages.get({
                groupPageId: '54c87d0e75f1415f1da57e74'
            }, function(groupPage) {
                files.forEach(function(element, index, array) {
                    if(!groupPage.imageAttachments) {
                        groupPage.imageAttachments = [];
                    }
                    // Add to parent page
                    groupPage.imageAttachments.push(element);
                    if(!$scope.newImageAttachments) {
                        $scope.newImageAttachments = [];
                    }
                    // Add to current $scope
                    if(!$scope.imageAttachments) {
                        $scope.imageAttachments = [];
                    }
                    $scope.imageAttachments.push(element);
                    groupPage.$update();
                });
            });
       }
       $scope.deleteImageThisPage = function(img) {
            GroupPages.get({
                groupPageId: '54c87d0e75f1415f1da57e74'
            }, function(groupPage) {
                // Remove from parent page
                var index = groupPage.imageAttachments.indexOf(img);
                $scope.imageAttachments.splice(index, 1);
                groupPage.imageAttachments.splice(index, 1);
                groupPage.$update();
           });
       }
    }])
    // Functions common to media and protector
    .controller('ManageMembersController', ['$scope','$stateParams','Global','Users','GroupPages', function($scope,$stateParams,Global,Users,GroupPages) {
        $scope.user = {};

        Users.query({}, function(users) {
            $scope.users = users;
        });
        $scope.addUser = function() {
            // Get parent page ID
            GroupPages.get({
                groupPageId: $stateParams.groupPageId
            }, function(groupPage) {
                if(!groupPage.allowedMembers) {
                    groupPage.allowedMembers = [];
                }
                // Add to parent page
                groupPage.allowedMembers.push($scope.addNewUser);
                groupPage.$update();
            });
        }
}])
    .controller('GoogleStorageController', ['$scope', function($scope) {
            var PROJECT = 'pw9201284';
            var clientId = '23650138297-mnq2q9cn8vibp4p9373gs0ve5go4pfrr.apps.googleusercontent.com';
            var apiKey = 'AIzaSyDehaf7vOoCTUBMv0nun_VDZMQgHx5UUZw';
            var scopes = 'https://www.googleapis.com/auth/devstorage.full_control';
            var API_VERSION = 'v1';
            var BUCKET = 'maindir';
            var object = "";
            var GROUP = 'group-00b4903a97821a9c0a025588929fc357427a1fc7ba4494be6ac315e346ddc5b0';
            var ENTITY = 'allUsers';
            var ROLE = 'READER';
            var ROLE_OBJECT = 'READER';
            function executeRequest(request, apiRequestName) {
                request.execute(function(resp) {
                    console.log(resp);
                });
            }
            function handleClientLoad() {
              gapi.client.setApiKey(apiKey);
              window.setTimeout(checkAuth, 1);
            }
            function checkAuth() {
              if(gapi.auth) {
                  gapi.auth.authorize({
                    client_id: clientId,
                    scope: scopes,
                    immediate: true
                  }, handleAuthResult);
              }
            }
            function handleAuthResult(authResult) {
              var authorizeButton = document.getElementById('authorize-button');
              if (authResult && !authResult.error) {
                authorizeButton.style.visibility = 'hidden';
                initializeApi();
              } else {
                authorizeButton.style.visibility = '';
                authorizeButton.onclick = handleAuthClick;
              }
            }
            function handleAuthClick(event) {
              gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: false
              }, handleAuthResult);
              return false;
            }
            function initializeApi() {
              gapi.client.load('storage', API_VERSION);
            }
            function insertBucket() {
              resource = {
                'name': BUCKET
              };

              var request = gapi.client.storage.buckets.insert({
                  'project': PROJECT,
                  'resource': resource
              });
              executeRequest(request, 'insertBucket');
            }
            
            // upload file to gcs
        
            function deleteObject() {
              var request = gapi.client.storage.objects.delete({
                  'bucket': BUCKET,
                  'object': object
              });
              executeRequest(request, 'deleteObject');
            }
        
            $scope.insertObject = function () {
              try{
                var fileData = $("#filePicker")[0].files[0];
                console.log(fileData);
              } 
              catch(e) {
                //'Insert Object' selected from the API Commands select list
                //Display insert object button and then exit function
                filePicker.style.display = 'block';
                return;
              }
              const boundary = '-------314159265358979323846';
              const delimiter = "\r\n--" + boundary + "\r\n";
              const close_delim = "\r\n--" + boundary + "--";

              var reader = new FileReader();
              reader.readAsBinaryString(fileData);
              reader.onload = function(e) {
                var contentType = fileData.type || 'application/octet-stream';
                var metadata = {
                  'name': fileData.name,
                  'mimeType': contentType
                };

                var base64Data = btoa(reader.result);
                var multipartRequestBody =
                  delimiter +
                  'Content-Type: application/json\r\n\r\n' +
                  JSON.stringify(metadata) +
                  delimiter +
                  'Content-Type: ' + contentType + '\r\n' +
                  'Content-Transfer-Encoding: base64\r\n' +
                  '\r\n' +
                  base64Data +
                  close_delim;

                //Note: gapi.client.storage.objects.insert() can only insert
                //small objects (under 64k) so to support larger file sizes
                //we're using the generic HTTP request method gapi.client.request()
                var request = gapi.client.request({
                  'path': '/upload/storage/' + API_VERSION + '/b/' + BUCKET + '/o',
                  'method': 'POST',
                  'params': {'uploadType': 'multipart'},
                  'headers': {
                    'x-goog-acl'  : 'public-read',
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                  },
                  'body': multipartRequestBody});
                  //Remove the current API result entry in the main-content div
                try{
                  //Execute the insert object request
                  executeRequest(request, 'insertObject');
                  //Store the name of the inserted object 
                  object = fileData.name;         
                }
                catch(e) {
                  alert('An error has occurred: ' + e.message);
                }
              }
            }
            
            $scope.connectGoogleStorage = function() {
                if(gapi.client.storage) {
                    $scope.connectedToGoogleStorage = true;
                } else {
                    $scope.connectedToGoogleStorage = false;
                }
                checkAuth();
                // Actually do a request of some kind in here
                var request = gapi.client.storage.buckets.list({
                    'project': 'pw9201284'
                });
                executeRequest(request, 'listBuckets');
            }
          $scope.getBucketFiles = function() {
              var request = gapi.client.storage.objects.list({
                'bucket': BUCKET
              });
              request.execute(function(resp) {
                  console.log(resp);
                // Add to file attachments
                $scope.googleFileAttachments = resp.items;
                $scope.$apply();
              });
          }
    }])
// MAP CONTROLLER 
    // map.html
.controller('MapController', ['$rootScope','$scope','$stateParams','Global','GroupPages','mapOverlays','$modal',
      function($rootScope,$scope,$stateParams,Global,GroupPages,mapOverlays,$modal) {
        $scope.global = Global;
        // Offcanvas stuff
        $('[data-toggle="offcanvas"]').click(function () {
            $('.row-offcanvas').toggleClass('active')
        });
        // All updates displayed by default
        $scope.spillsAll = true;
        $scope.proposedAll = true;
        $scope.updatesAll = true;
        $scope.toggleMarkers = function (buttonVar) {
            $scope[buttonVar] = false;
        }
        
        // Auth check
        $scope.hasAuthorization = function(groupPage) {
          if (!groupPage || !groupPage.user) return false;
          return $scope.global.isAdmin || groupPage.user._id === $scope.global.user._id;
        };
          
        $scope.map = { 
            control : {},
            center: { latitude: 49.289306, longitude: -122.955208 }, 
            zoom: 5
            
        };
        // Fix height
        $scope.map.height = $(window).height(); // or any other calculated value
        $("#my-map .angular-google-map-container").height($scope.map.height);
        $(".map-height").height($scope.map.height);
        // Settings options for the infowindows
        $scope.windowOptions = {
            visible: false
        };
    // Putting markers on the map
        $rootScope.markers = {
            spillsAll      : {},
            updatesAll     : {},
            proposedAll    : {},
        };
        GroupPages.query(function(groupPages) {
            groupPages.forEach(function(element,index,array) {
                if(element.category==='News') {
                    // Icon key (plain updates vs spill icons vs types of facilities)
                    if(!element.customInformation.newsCategory) {
                        var thisIcon = '/packages/contrib/groupPages/public/assets/img/marker-icons/information.png';
                        // Create new marker
                        $rootScope.markers.updatesAll[element._id] = {
                            id : element._id,
                            coords : element.coords,
                            icon : thisIcon,
                            title : element.title,
                            content : element.content,
                            options : {animation: google.maps.Animation.DROP }
                        }
                    }
                    if(element.customInformation.newsCategory==='Proposed project') {
                        var thisIcon = '/packages/contrib/groupPages/public/assets/img/marker-icons/museum_industry.png';
                        // Create new marker
                        $rootScope.markers.proposedAll[element._id] = {
                            id : element._id,
                            coords : element.coords,
                            icon : thisIcon,
                            title : element.title,
                            content : element.content,
                            options : {animation: google.maps.Animation.DROP }
                        }
                    }
                    if(element.customInformation.newsCategory==='Spill') {
                        if(element.customInformation.type==='Pipeline') {
                            var thisIcon = '/packages/contrib/groupPages/public/assets/img/marker-icons/blast.png';
                        }
                        if(element.customInformation.type==='Train') {
                            var thisIcon = '/packages/contrib/groupPages/public/assets/img/marker-icons/train.png';
                        }
                        if(element.customInformation.type==='Automobile') {
                            var thisIcon = '/packages/contrib/groupPages/public/assets/img/marker-icons/caraccident.png';
                        }
                        if(element.customInformation.type==='Ship') {
                            var thisIcon = '/packages/contrib/groupPages/public/assets/img/marker-icons/shipwreck.png';
                        }
                        // Create new spill marker
                        $rootScope.markers.spillsAll[element._id] = {
                            id : element._id,
                            coords : element.coords,
                            icon : thisIcon,
                            title : element.title,
                            content : element.content,
                            options : {animation: google.maps.Animation.DROP }
                        }
                    }
                }
            });
        });
    //  Security check for drawing markers
    if(!$scope.global.user._id||$scope.global.user._id==='') { 
        $scope.loggedIn = false;
    } else {
        $scope.loggedIn = true;
    }
    // Drawing markers on the map
        $scope.map.control = {};
        $scope.drawingManagerOn = function() {
            $scope.cancelUpdates = function() {
                $rootScope.createUpdate = false;
                drawingManager.setMap(null);
            }
            $rootScope.createUpdate = true;
            var drawingManager = new google.maps.drawing.DrawingManager({
                    drawingMode: google.maps.drawing.OverlayType.MARKER,
                    drawingControl: true,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_CENTER,
                        drawingModes: [
                            google.maps.drawing.OverlayType.MARKER
                        ]
                    }
            });
            drawingManager.setMap($scope.map.control.getGMap());
            
            google.maps.event.addListener(drawingManager, 'overlaycomplete', function(marker) {
              $scope.map.placedMarkerCoords = { latitude : marker.overlay.position.k, longitude : marker.overlay.position.D };
              drawingManager.setDrawingMode(null);
              drawingManager.setMap(null);
              var modalInstance = $modal.open({
                  templateUrl: '/packages/contrib/groupPages/public/views/updateForm.html',
                  controller : 'ModalInstanceCtrl',
                  scope      : $scope,
                  resolve : {
                      coords: function() {
                          return $scope.map.placedMarkerCoords;
                      }
                  }
              });
            });
      // $scope.drawingManagerArray = [];
      // $scope.createUpdate = false;
      }
    // Kinder Morgan Transmountain Pipeline
        $scope.map.transmountainPipeline = mapOverlays.transmountainCoordinates;
          
    // First Nations polygons
        $scope.map.firstNationsPolygons = mapOverlays.firstNations;
          
        $scope.makePolygons = function(firstNationsAll) {
            $scope.map.currentFirstNationsPolygons = [];
            if(firstNationsAll==true) {
                for(var obj in $scope.map.firstNationsPolygons) {
                    var randomColor = getRandomColor();
                    $scope.map.firstNationsPolygons[obj].path = $scope.map.firstNationsPolygons[obj][1];
                    $scope.map.firstNationsPolygons[obj].label = $scope.map.firstNationsPolygons[obj][0];
                    $scope.map.firstNationsPolygons[obj].stroke = { weight : 10, color : randomColor, opacity : 0.2 };
                    $scope.map.firstNationsPolygons[obj].fill = { color : randomColor, opacity: 0.4 };
                    $scope.map.currentFirstNationsPolygons.push($scope.map.firstNationsPolygons[obj]);
                    $scope.map.currentFirstNationsPolygons.forEach(function(element,index,array) {
                        $scope.map.currentFirstNationsPolygons[index].events = { 
                            mouseover : function(polygon) {
                                $scope.currentInformation = $scope.map.currentFirstNationsPolygons[index].label;
                                $scope.$apply();
                                }
                        }
                    });
                }
            } else {
                $scope.map.currentFirstNationsPolygons = [];
            }
        }
    // GeoJSON
        $scope.makeGeoJSON = function(firstNationsAllLanguages) {
            var map = $scope.map.control.getGMap();
            if(firstNationsAllLanguages==true) {
                map.data.loadGeoJson('/packages/contrib/groupPages/public/assets/coords/fphlcc.json');
                map.data.setStyle(function(feature) {
                    var randomColor = getRandomColor();
                    return {
                      fillColor: randomColor,
                      fillOpacity :0.4,
                      strokeWeight: 10,
                      strokeOpacity: 0.2,
                      strokeColor:randomColor
                    };
                });
                map.data.addListener('mouseover', function(event) {
                    $scope.currentInformation = event.feature.k.Name;
                    $scope.$apply();
                });
            } else {
                map.data.setStyle({visible: false});
            }
        }
        
    // Overlays should appear when a function is fired
        $scope.map.allOverlays = mapOverlays.overlayObjects;
        $scope.selectedOverlay = 'Click to select a local map';
        $scope.currentOverlays = {};
        // Interaction with overlays in menu
        $scope.changeOverlays = function(overlaySlug) {
            $scope.currentOverlays = {};
            if($scope.currentOverlayArray) {
                $scope.currentOverlayArray.forEach(function(element,index,array){
                    element.setMap(null);
                });
            }
            if (overlaySlug==='all') {
                for(var overlaySlug in $scope.map.allOverlays) {
                    $scope.currentOverlays[overlaySlug] = $scope.map.allOverlays[overlaySlug];
                    $scope.currentOverlays[overlaySlug].type = 'GroundOverlay';
                    $scope.currentOverlays[overlaySlug].options = {
                        url : '/packages/contrib/groupPages/public/assets/img/overlays/transmountain/'+$scope.currentOverlays[overlaySlug].url, 
                        bounds : new google.maps.LatLngBounds($scope.currentOverlays[overlaySlug].gpsSW, $scope.currentOverlays[overlaySlug].gpsNE)
                    }
                }
                $scope.currentOverlayArray = $scope.makeOverlays($scope.currentOverlays);
            } else if(overlaySlug!=='none') {
                var thisOverlay = $scope.map.allOverlays[overlaySlug];
                $scope.currentOverlays= {};
                $scope.currentOverlays[overlaySlug] = thisOverlay;
                $scope.currentOverlays[overlaySlug].type = 'GroundOverlay';
                $scope.currentOverlays[overlaySlug].options = {
                    url : '/packages/contrib/groupPages/public/assets/img/overlays/transmountain/'+thisOverlay.url, 
                    bounds : new google.maps.LatLngBounds(thisOverlay.gpsSW, thisOverlay.gpsNE)
                }
                $scope.map.center = { latitude: thisOverlay.gpsSW.k, longitude: thisOverlay.gpsSW.D };
                $scope.map.zoom = 10;
                $scope.currentOverlayArray = $scope.makeOverlays($scope.currentOverlays);
            }
        }
        // Function for making overlays on map
        $scope.makeOverlays = function(currentOverlays) {
            var overlayArray = [];
            var map = $scope.map.control.getGMap();
            for(var overlay in currentOverlays) {
              WatchOverlay.prototype = new google.maps.OverlayView();
              var swBound = $scope.currentOverlays[overlay].gpsSW;
              var neBound = $scope.currentOverlays[overlay].gpsNE;
              var bounds = new google.maps.LatLngBounds(swBound, neBound);

              var srcImage = '/packages/contrib/groupPages/public/assets/img/overlays/transmountain/'+$scope.currentOverlays[overlay].url;

              var overlay = new WatchOverlay(bounds, srcImage, map);
            
              overlayArray.push(overlay);

              WatchOverlay.prototype.onAdd = function() {

                  var div = document.createElement('div');
                  div.style.borderStyle = 'none';
                  div.style.borderWidth = '0px';
                  div.style.position = 'absolute';

                  // Create the img element and attach it to the div.
                  var img = document.createElement('img');
                  img.src = this.image_;
                  img.style.width = '100%';
                  img.style.height = '100%';
                  img.style.position = 'absolute';
                  img.style.opacity = '0.7';
                  div.appendChild(img);

                  this.div_ = div;

                  // Add the element to the "overlayLayer" pane.
                  var panes = this.getPanes();
                  panes.overlayLayer.appendChild(div);
                };
            WatchOverlay.prototype.draw = function() {

                var overlayProjection = this.getProjection();
                var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
                var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
                var div = this.div_;
                div.style.left = sw.x + 'px';
                div.style.top = ne.y + 'px';
                div.style.width = (ne.x - sw.x) + 'px';
                div.style.height = (sw.y - ne.y) + 'px';
            };
            WatchOverlay.prototype.onRemove = function() {
                this.div_.parentNode.removeChild(this.div_);
                this.div_ = null;
            };
          }
        return overlayArray;
        }
}])
    // Map submission addition
    .controller('ModalInstanceCtrl', ['$rootScope','$scope','$modalInstance','$location','$modal','GroupPages','coords',
        function ($rootScope,$scope,$modalInstance,$location,$modal,GroupPages,coords) {
      // groupPage categories (can be a factory)
      $scope.categories = ['Map update','Spill','Proposed project'];
      $scope.category = $scope.categories[0];

      // groupPage privacy settings (can be a factory)
      $scope.privacies = ['Public','Logged In Only','Selected Members Only','Private'];
      $scope.privacy = $scope.privacies[0];
      $scope.createProposedProject = function () {
          $scope.category = 'Proposed project';
      }
      $scope.createSpill = function () {
          $scope.category = 'Spill';
      }
      $scope.create = function(isValid) {
          if (isValid) {
            // Create new post
            var newUpdate = new GroupPages({
              title: this.title,
              content: this.content,
              category: 'News',
              privacy: $scope.privacy,
              coords: coords,
              customInformation: {
                  newsCategory  : $scope.category
              }
            });
            newUpdate.$save(function(response) {
                $rootScope.markers.news[response._id] = response;
                $modalInstance.dismiss('cancel');
                $rootScope.createUpdate = false;
                if(response.customInformation.newsCategory==='Proposed project'||response.customInformation.newsCategory==='Spill') {
                    $location.path('groupPages/' + response._id);
                }
            });

            this.title = '';
            this.content = '';

        }
     }  

  $scope.cancel = function () {
    $rootScope.createUpdate = false;
    $modalInstance.dismiss('cancel');
  };
}])

// DIRECTIVES AND VALUES

    // Directive to rearrange textareas (if it's true, add it)
    .directive('rearrangeTextareas', function() {
        return {
          restrict: 'AE',
          replace: 'false',
          template: '<div ng-repeat="thisChildGroupPage in childrenGroupPageArraysNow"><b ng-click="moveUp()" class="go-up glyphicon glyphicon-arrow-up"></b><b ng-click="moveDown()" class="go-down glyphicon glyphicon-arrow-down"></b> <button class="btn-success" ng-click="updateTextareaOrder()">Save</button> <h5 style="display:inline;">{{thisChildGroupPage.title}}</h5></div>'
        };
    })

    // Directive to add spills and news areas
    .directive('addSpillsAndNewsInfo', function() {
        return {
          restrict: 'AE',
          replace: 'false',
          templateUrl: '/packages/contrib/groupPages/public/views/spillandnewsForms.html'
        };
    });;

// FUNCTIONS
//  @constructor
function WatchOverlay(bounds, image, map) {

  // Initialize all properties.
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;

  // Define a property to hold the image's div. We'll
  // actually create this div upon receipt of the onAdd()
  // method so we'll leave it null for now.
  this.div_ = null;

  // Explicitly call setMap on this overlay.
  this.setMap(map);
}
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}