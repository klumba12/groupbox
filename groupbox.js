(function (angular) {
   'use strict';

   angular.module('groupbox', [])
       .directive('groupbox', groupboxDirective)
       .directive('groupboxAll', groupboxAllDirective)
       .directive('groupboxItem', groupboxItemDirective)
       .directive('groupboxSelection', groupboxSelectionDirective);

   function groupboxDirective() {
      return {
         restrict: 'A'
      };
   };

   function groupboxAllDirective() {
      return {
         restrict: 'A',
         require: '^groupbox'
      };
   };

   function groupboxItemDirective() {
      return {
         restrict: 'A',
         require: '^groupbox'
      };
   };

   function groupboxSelectionDirective() {
      return {
         restrict: 'A',
         require: 'groupbox'
      };
   };
})
(angular);