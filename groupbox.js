(function (angular) {
   'use strict';

   groupboxModelDirective.$inject = ['$parse'];
   groupboxAllDirective.$inject = ['$parse'];
   groupboxSelectionDirective.$inject = ['$parse'];


   angular.module('groupbox', [])
       .directive('groupbox', groupboxDirective)
       .directive('groupboxModel', groupboxModelDirective)
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
      var self = this;

      this.data = [];
      this.changeEvent = new Event();
      this.toggleAllEvent = new Event();

      this.assign = angular.noop;
      this.test = function () {
         return false;
      };

      this.invalidate = function () {
         self.changeEvent.emit();
      };

      this.toggleAll = function (value) {
         var data = self.data;
         for (var i = 0, length = data.length; i < length; i++) {
            self.assign(data[i], value);
         }

         self.toggleAllEvent.emit(value);
      };
   };

   function groupboxDirective() {
      return {
         restrict: 'A',
         controller: groupboxCtrl,
         require: 'groupbox',
         link: function (scope, element, attrs, ctrl) {
            var groupbox = ctrl;

            scope.$watch(attrs.groupbox, function (value) {
               groupbox.data = value || [];
            });

            scope.$on('$destroy', function () {
               groupbox.data = [];
            });
         }
      };
   }

   function groupboxModelDirective($parse) {
      return {
         restrict: 'A',
         require: 'groupbox',
         link: function (scope, element, attrs, ctrl) {
            var groupbox = ctrl;

            attrs.$observe('groupboxModel', function (value) {
               if (value) {
                  var getter = $parse(value);
                  groupbox.test = getter;
                  groupbox.assign = getter.assign;
               }
               else {
                  groupbox.assign = angular.noop;
                  groupbox.test = function () {
                     return false;
                  };
               }
            });
         }
      };
   }

   function groupboxAllDirective($parse) {
      return {
         restrict: 'A',
         require: ['^groupbox', 'ngModel'],
         link: function (scope, element, attrs, ctrls) {
            var groupbox = ctrls[0],
                getState = $parse(attrs.ngModel),
                setState = getState.assign,
                freeze = false;

            groupbox.changeEvent.on(function () {
               var state = null,
                   data = groupbox.data,
                   test = groupbox.test;

               for (var i = 0, length = data.length; i < length; i++) {
                  var mState = test(data[i]);
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

               if (getState(scope) !== state) {
                  freeze = true;
                  setState(scope, state);
                  element.prop('indeterminate', state === null);
               }
            });

            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
               if (freeze) {
                  freeze = false;
                  return;
               }

               if (newValue !== oldValue) {
                  groupbox.toggleAll(newValue);
               }
            });
         }
      };
   }

   function groupboxItemDirective() {
      return {
         restrict: 'A',
         require: '^groupbox',
         link: function (scope, element, attrs, ctrl) {
            var groupbox = ctrl;

            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
               if (newValue !== oldValue) {
                  groupbox.invalidate();
               }
            });
         }
      };
   }

   function groupboxSelectionDirective($parse) {
      return {
         restrict: 'A',
         require: 'groupbox',
         link: function (scope, element, attrs, ctrl) {
            var groupbox = ctrl,
                key = attrs.groupboxSelectionKey,
                selection = attrs.groupboxSelection,
                keySelector = key ? $parse(key) : angular.identity,
                setSelection = $parse(selection).assign;

            groupbox.changeEvent.on(function (model) {
               var data = groupbox.data,
                   selection = [],
                   test = ctrl.test;

               for (var i = 0, length = data.length; i < length; i++) {
                  var item = data[i];
                  if (test(item)) {
                     selection.push(keySelector(item));
                  }
               }

               setSelection(scope, selection);
            });

            groupbox.toggleAllEvent.on(function (value) {
               setSelection(scope, value ? groupbox.data.map(function (item) {
                  return keySelector(item);
               }) : []);
            });
         }
      };
   }
})
(angular);