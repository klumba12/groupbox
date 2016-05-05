(function (angular) {
   'use strict';

   angular.module('groupbox', [])
       .directive('groupbox', groupboxDirective)
       .directive('groupboxAll', groupboxAllDirective)
       .directive('groupboxItem', groupboxItemDirective)
       .directive('groupboxSelection', groupboxSelectionDirective);


   var Event = function () {
      var events = [];

      this.on = function (f) {
         events.push(f);
         return function () {
            var index = events.indexOf(f);
            if (index >= 0) {
               events.splice(index, 1);
            }
         }
      };

      this.emit = function (e) {
         var temp = angular.copy(events);
         for (var i = 0, length = temp.length; i < length; i++) {
            temp[i](e);
         }
      };
   };

   function groupboxCtrl() {
      var model = 'isSelected';

      this.data = [];
      this.changeEvent = new Event();
      this.toggleAllEvent = new Event();

      this.invalidate = function (prop) {
         model = prop;
         this.changeEvent.emit(model);
      };

      this.toggleAll = function (value) {
         var data = this.data;
         for (var i = 0, length = data.length; i < length; i++) {
            data[i][model] = value;
         }

         this.toggleAllEvent.emit(value);
      };
   };

   function groupboxDirective() {
      return {
         restrict: 'A',
         controller: groupboxCtrl,
         require: 'groupbox',
         link: function (scope, element, attrs, ctrl) {
            scope.$watch(attrs.groupbox, function (value) {
               ctrl.data = value || [];
            });

            scope.$on('$destroy', function () {
               ctrl.data = [];
            });
         }
      };
   }

   function groupboxAllDirective() {
      return {
         restrict: 'A',
         require: ['^groupbox', 'ngModel'],
         link: function (scope, element, attrs, ctrls) {
            var groupbox = ctrls[0];

            groupbox.changeEvent.on(function (model) {
               var state = null,
                   data = groupbox.data;

               for (var i = 0, length = data.length; i < length; i++) {
                  var mState = data[i][model];
                  if (state !== mState) {
                     if (state === null) {
                        state = mState;
                     }
                     else {
                        state = null;
                        break;
                     }
                  }
               }

               scope[attrs.ngModel] = state;
            });

            scope.$watch(attrs.ngModel, function(value){
               groupbox.toggleAll(value);
            });
         }
      };
   }

   function groupboxItemDirective() {
      return {
         restrict: 'A',
         require: ['^groupbox', 'ngModel'],
         link: function (scope, element, attrs, ctrls) {
            var groupbox = ctrls[0];

            scope.$watch(attrs.ngModel, function () {
               groupbox.invalidate(attrs.ngModel);
            });
         }
      };
   }

   function groupboxSelectionDirective() {
      return {
         restrict: 'A',
         require: ['groupbox', '?ngModel'],
         link: function (scope, element, attrs, ctrls) {
            var groupbox = ctrls[0];

            var selectorFactory = function () {
               var model = attrs.ngModel;
               if (model) {
                  return function (item) {
                     return item[model];
                  };
               }

               return angular.identity;
            };

            groupbox.changeEvent.on(function (model) {
               var data = groupbox.data,
                   selection = [],
                   select = selectorFactory();

               for (var i = 0, length = data.length; i < length; i++) {
                  var item = data[i];
                  if (item[model]) {
                     selection.push(select(item));
                  }
               }

               scope[attrs.groupboxSelection] = selection;
            });

            groupbox.toggleAllEvent.on(function (value) {
               var select = selectorFactory();
               scope[attrs.groupboxSelection] = value ? groupbox.data.map(select) : [];
            });
         }
      };
   }
})
(angular);