(function () {
  'use strict';

  // create the angular app
  angular.module('Analytics', [
    'Analytics.controllers',
    'Analytics.directives',
  ]);


// setup dependency injection
  angular.module('d3', []);
  angular.module('tip', ['d3']);
  angular.module('Analytics.controllers', []);
  angular.module('Analytics.directives', ['d3', 'tip']);

}());