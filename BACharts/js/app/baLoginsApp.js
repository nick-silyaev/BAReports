(function () {
  'use strict';

  // create the angular app
  angular.module('BALogins', [
    'BALogins.controllers',
    'BALogins.directives'
    ]);

  // setup dependency injection
  angular.module('d3', []);
  angular.module('BALogins.controllers', []);
  angular.module('BALogins.directives', ['d3']);

}());