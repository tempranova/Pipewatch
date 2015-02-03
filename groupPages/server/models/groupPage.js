'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * GroupPage Schema
 */
var GroupPageSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String, // Short summary for infowindow on the map
    required: false,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  privacy: {
    type: String,
    required: true,
    trim: true
  },
  parentGroupPageID: {
    type: String,
    required: false,
    trim: true
  },
  childrenGroupPageArrays: {
    type: Array,
    required: false,
    trim: true
  },
  imageAttachments: {
    type: Array,
    required: false,
    trim: false
  },
  allowedMembers: {
    type: Array,
    required: false,
    trim: true
  },
  // News pages (contains spills, upcoming projects, etc)
  // Updates details { newsDate: String, companies: Array, spillCause : String, spillAmountAndTypes : Array, legalOutcomes : Object
  customInformation: {
    type: Schema.Types.Mixed, // { newsDate: String, companies: Array, spillCause : String, spillAmountAndTypes : Array, legalOutcomes : Object
                  // environmentalEffects : Object, imageAttachments : Array, spillSources : Object }
    required: false,
    trim: true
  },
  coords: { // Not required, but can be added if desired
    type: Object,
    required: false,
    trim: false
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});
/**
 * Validations
 */
GroupPageSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

GroupPageSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

GroupPageSchema.path('category').validate(function(category) {
  return !!category;
}, 'Category cannot be blank');

GroupPageSchema.path('privacy').validate(function(privacy) {
  return !!privacy;
}, 'Privacy cannot be blank');

/**
 * Statics
 */
GroupPageSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};
mongoose.model('GroupPage', GroupPageSchema);
