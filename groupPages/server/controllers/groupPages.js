'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  GroupPage = mongoose.model('GroupPage'),
  _ = require('lodash');


/**
 * Find groupPage by id
 */
exports.groupPage = function(req, res, next, id) {
  GroupPage.load(id, function(err, groupPage) {
    if (err) return next(err);
    if (!groupPage) return next(new Error('Failed to load groupPage ' + id));
    req.groupPage = groupPage;
    next();
  });
};

/**
 * Create an groupPage
 */
exports.create = function(req, res) {
  var groupPage = new GroupPage(req.body);
  groupPage.user = req.user;

  groupPage.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot save the groupPage'
      });
    }
    res.json(groupPage);

  });
};

/**
 * Update an groupPage
 */
exports.update = function(req, res) {
  var groupPage = req.groupPage;

  groupPage = _.extend(groupPage, req.body);

  groupPage.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the groupPage'
      });
    }
    res.json(groupPage);

  });
};

/**
 * Delete an groupPage
 */
exports.destroy = function(req, res) {
  var groupPage = req.groupPage;

  groupPage.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the groupPage'
      });
    }
    res.json(groupPage);

  });
};

/**
 * Show an groupPage
 */
exports.show = function(req, res) {
  res.json(req.groupPage);
};

/**
 * List of GroupPages
 */
exports.all = function(req, res) {
  GroupPage.find().sort('-created').populate('user', 'name username').exec(function(err, groupPages) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the groupPages'
      });
    }
    res.json(groupPages);

  });
};
