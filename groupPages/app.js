'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;
var GroupPages = new Module('groupPages');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
GroupPages.register(function(app, auth, database, upload, users) {

  //We enable routing. By default the Package Object is passed to the routes
  GroupPages.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  GroupPages.menus.add({
    'roles': ['authenticated'],
    'title': 'Admin',
    'link': 'all groupPages'
  });
  /* GroupPages.menus.add({
    'roles': ['authenticated'],
    'title': 'Create New Group Page',
    'link': 'create groupPage'
  }); */

  //GroupPages.aggregateAsset('js','/packages/system/public/services/menus.js', {group:'footer', absolute:true, weight:-9999});
    
    GroupPages.aggregateAsset('js', '../js/blueimp-gallery.min.js', {group: 'footer', weight: -1});
    GroupPages.aggregateAsset('js', '../js/bootstrap-image-gallery.js', {group: 'footer', weight: 5});
    GroupPages.aggregateAsset('js', '../js/googlemaps.js', {group: 'footer', weight: 5});
    GroupPages.aggregateAsset('js', '../js/angulargm.js', {group: 'footer', weight: 5});
    GroupPages.aggregateAsset('js', '../js/lodash.js', {group: 'footer', weight: 5});
    GroupPages.aggregateAsset('js', '../js/froala_editor.min.js', {group: 'footer', weight: 5});
    GroupPages.aggregateAsset('js', '../js/angular-froala.js', {group: 'footer', weight: 5});
    GroupPages.aggregateAsset('js', '../js/froala-sanitize.js', {group: 'footer', weight: 5});
    
    // Probably put this into a factory?"
    GroupPages.aggregateAsset('js', '../js/client.js', {group: 'footer', weight: 5 });
    GroupPages.aggregateAsset('js', '../js/bootstrap-image-gallery.js', {group: 'footer', weight: 5});
    
    GroupPages.aggregateAsset('css', '../css/blueimp-gallery.min.css', {
            absolute: false
        });
    GroupPages.aggregateAsset('css', '../css/bootstrap-image-gallery.css', {
            absolute: false
        });
    GroupPages.aggregateAsset('css', '../css/font-awesome.min.css', {
            absolute: false
        });
    GroupPages.aggregateAsset('css', '../css/froala_editor.min.css', {
            absolute: false
        });
    GroupPages.aggregateAsset('css', '../css/froala_style.min.css', {
            absolute: false
        });
  /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    GroupPages.settings({'someSetting':'some value'},function (err, settings) {
      //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    GroupPages.settings({'anotherSettings':'some value'});

    // Get settings. Retrieves latest saved settings
    GroupPages.settings(function (err, settings) {
      //you now have the settings object
    });
    */
  GroupPages.aggregateAsset('css', 'groupPages.css');

  return GroupPages;
});
