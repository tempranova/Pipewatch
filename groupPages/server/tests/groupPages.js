/* jshint -W079 */ 
/* Related to https://github.com/linnovate/mean/issues/898 */
'use strict';

/**
 * Module dependencies.
 */
var expect = require('expect.js'),
	mongoose = require('mongoose'),
  User = mongoose.model('User'),
  GroupPage = mongoose.model('GroupPage');

/**
 * Globals
 */
var user;
var groupPage;

/**
 * Test Suites
 */
describe('<Unit Test>', function() {
  describe('Model GroupPage:', function() {
    beforeEach(function(done) {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      user.save(function() {
        groupPage = new GroupPage({
          title: 'GroupPage Title',
          content: 'GroupPage Content',
          category: 'GroupPage Category',
          privacy: 'GroupPage Privacy',
          user: user
        });

        done();
      });
    });

    describe('Method Save', function() {
      it('should be able to save without problems', function(done) {
        return groupPage.save(function(err) {
          expect(err).to.be(null);
          expect(groupPage.title).to.equal('GroupPage Title');
          expect(groupPage.content).to.equal('GroupPage Content');
          expect(groupPage.category).to.equal('GroupPage Category');
          expect(groupPage.privacy).to.equal('GroupPage Privacy');
          expect(groupPage.user.length).to.not.equal(0);
          expect(groupPage.created.length).to.not.equal(0);
          done();
        });
      });

      it('should be able to show an error when try to save without title', function(done) {
        groupPage.title = '';

        return groupPage.save(function(err) {
          expect(err).to.not.be(undefined);
          done();
        });
      });

      it('should be able to show an error when try to save without content', function(done) {
        groupPage.content = '';

        return groupPage.save(function(err) {
          expect(err).to.not.be(undefined);
          done();
        });
      });

      it('should be able to show an error when try to save without category', function(done) {
        groupPage.category = '';

        return groupPage.save(function(err) {
          expect(err).to.not.be(undefined);
          done();
        });
      });

      it('should be able to show an error when try to save without privacy', function(done) {
        groupPage.privacy = '';

        return groupPage.save(function(err) {
          expect(err).to.not.be(undefined);
          done();
        });
      });
        
      it('should be able to show an error when try to save without user', function(done) {
        groupPage.user = {};

        return groupPage.save(function(err) {
          expect(err).to.not.be(undefined);
          done();
        });
      });

    });

    afterEach(function(done) {
      groupPage.remove(function () {
        user.remove(done);
      });
    });
  });
});
