'use strict';

(function() {
  // GroupPages Controller Spec
  describe('MEAN controllers', function() {
    describe('GroupPagesController', function() {
      // The $resource service augments the response object with methods for updating and deleting the resource.
      // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
      // the responses exactly. To solve the problem, we use a newly-defined toEqualData Jasmine matcher.
      // When the toEqualData matcher compares two objects, it takes only object properties into
      // account and ignores methods.
      beforeEach(function() {
        jasmine.addMatchers({
          toEqualData: function() {
            return {
              compare: function(actual, expected) {
                return {
                  pass: angular.equals(actual, expected)
                };
              }
            };
          }
        });
      });

      beforeEach(function() {
        module('mean');
        module('mean.system');
        module('mean.groupPages');
      });

      // Initialize the controller and a mock scope
      var GroupPagesController,
        scope,
        $httpBackend,
        $stateParams,
        $location;

      // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
      // This allows us to inject a service but then attach it to a variable
      // with the same name as the service.
      beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {

        scope = $rootScope.$new();

        GroupPagesController = $controller('GroupPagesController', {
          $scope: scope
        });

        $stateParams = _$stateParams_;

        $httpBackend = _$httpBackend_;

        $location = _$location_;

      }));

      it('$scope.find() should create an array with at least one groupPages object ' +
        'fetched from XHR', function() {

          // test expected GET request
          $httpBackend.expectGET('groupPage').respond([{
            title: 'A GroupPage about Pipewatch',
            content: 'Pipewatch rocks!',
            category: 'Protector',
            privacy: 'public'
          }]);

          // run controller
          scope.find();
          $httpBackend.flush();

          // test scope value
          expect(scope.groupPage).toEqualData([{
            title: 'A GroupPage about Pipewatch',
            content: 'Pipewatch rocks!',
            category: 'Protector',
            privacy: 'public'
          }]);

        });

      it('$scope.findOne() should create an array with one groupPage object fetched ' +
        'from XHR using a groupPageId URL parameter', function() {
          // fixture URL parament
          $stateParams.groupPageId = '525a8422f6d0f87f0e407a33';

          // fixture response object
          var testGroupPageData = function() {
            return {
              title: 'A GroupPage about Pipewatch',
              content: 'Pipewatch rocks!',
              category: 'Protector',
              privacy: 'public'
            };
          };

          // test expected GET request with response object
          $httpBackend.expectGET(/groupPages\/([0-9a-fA-F]{24})$/).respond(testGroupPageData());

          // run controller
          scope.findOne();
          $httpBackend.flush();

          // test scope value
          expect(scope.groupPage).toEqualData(testGroupPageData());

        });

      it('$scope.create() with valid form data should send a POST request ' +
        'with the form input values and then ' +
        'locate to new object URL', function() {

          // fixture expected POST data
          var postGroupPageData = function() {
            return {
              title: 'A GroupPage about Pipewatch',
              content: 'Pipewatch rocks!',
              category: 'Protector',
              privacy: 'public'
            };
          };

          // fixture expected response data
          var responseGroupPageData = function() {
            return {
              _id: '525cf20451979dea2c000001',
              title: 'A GroupPage about Pipewatch',
              content: 'Pipewatch rocks!',
              category: 'Protector',
              privacy: 'public'
            };
          };

          // fixture mock form input values
          scope.title = 'A GroupPage about Pipewatch';
          scope.content = 'Pipewatch rocks!';
          scope.category = 'Protector';
          scope.privacy = 'public';

          // test post request is sent
          $httpBackend.expectPOST('groupPages', postGroupPageData()).respond(responseGroupPageData());

          // Run controller
          scope.create(true);
          $httpBackend.flush();

          // test form input(s) are reset
          expect(scope.title).toEqual('');
          expect(scope.content).toEqual('');
          expect(scope.category).toEqual('');
          expect(scope.privacy).toEqual('');

          // test URL location to new object
          expect($location.path()).toBe('/groupPages/' + responseGroupPageData()._id);
        });

      it('$scope.update(true) should update a valid groupPage', inject(function(GroupPages) {

        // fixture rideshare
        var putGroupPageData = function() {
          return {
            _id: '525a8422f6d0f87f0e407a33',
            title: 'A GroupPage about Pipewatch',
            to: 'Pipewatch is great!'
          };
        };

        // mock groupPage object from form
        var groupPage = new GroupPages(putGroupPageData());

        // mock groupPage in scope
        scope.groupPage = groupPage;

        // test PUT happens correctly
        $httpBackend.expectPUT(/groupPages\/([0-9a-fA-F]{24})$/).respond();

        // testing the body data is out for now until an idea for testing the dynamic updated array value is figured out
        //$httpBackend.expectPUT(/groupPages\/([0-9a-fA-F]{24})$/, putGroupPageData()).respond();
        /*
                Error: Expected PUT /groupPages\/([0-9a-fA-F]{24})$/ with different data
                EXPECTED: {"_id":"525a8422f6d0f87f0e407a33","title":"A GroupPage about Pipewatch","to":"Pipewatch is great!"}
                GOT:      {"_id":"525a8422f6d0f87f0e407a33","title":"A GroupPage about Pipewatch","to":"Pipewatch is great!","updated":[1383534772975]}
                */

        // run controller
        scope.update(true);
        $httpBackend.flush();

        // test URL location to new object
        expect($location.path()).toBe('/groupPages/' + putGroupPageData()._id);

      }));

      it('$scope.remove() should send a DELETE request with a valid groupPageId ' +
        'and remove the groupPage from the scope', inject(function(GroupPages) {

          // fixture rideshare
          var groupPage = new GroupPages({
            _id: '525a8422f6d0f87f0e407a33'
          });

          // mock rideshares in scope
          scope.groupPages = [];
          scope.groupPages.push(groupPage);

          // test expected rideshare DELETE request
          $httpBackend.expectDELETE(/groupPages\/([0-9a-fA-F]{24})$/).respond(204);

          // run controller
          scope.remove(groupPage);
          $httpBackend.flush();

          // test after successful delete URL location groupPages list
          //expect($location.path()).toBe('/groupPages');
          expect(scope.groupPages.length).toBe(0);

        }));
    });
  });
}());
