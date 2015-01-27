'use strict';

var groupPages = require('../controllers/groupPages');

// GroupPage authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.groupPage.user.id !== req.user.id) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

module.exports = function(GroupPages, app, auth) {

  app.route('/groupPages')
    .get(groupPages.all)
    .post(auth.requiresLogin, groupPages.create);
  app.route('/groupPages/:groupPageId')
    .get(auth.isMongoId, groupPages.show)
    .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, groupPages.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, groupPages.destroy);

  // Finish with setting up the groupPageId param
  app.param('groupPageId', groupPages.groupPage);
};