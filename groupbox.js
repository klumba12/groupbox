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
                  var mState = data[model];
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

            var onChange = element.bind(attrs.groupboxAll, function () {
               groupbox.toggleAll(scope[attrs.ngModel]);
            });

            scope.$on('$destroy', function () {
               element.unbind(attrs.groupboxAll, onChange);
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

            var onChange = element.bind(attrs.groupboxItem, function () {
               groupbox.invalidate(attrs.ngModel);
            });

            scope.$on('$destroy', function () {
               element.unbind(attrs.groupboxItem, onChange);
            });
         }
      };
   }

   function groupboxSelectionDirective() {
      return {
         restrict: 'A',
         require: 'groupbox',
         link: function (scope, element, attrs, groupbox) {
            groupbox.changeEvent.on(function (model) {
               var data = groupbox.data,
                   selection = [];

               for(var i = 0, length = data.length; i < length; i++){
                  var item = data[i];
                  if(item[model]){
                     selection.push(item);
                  }
               }

               scope[attrs.groupboxSelection] = selection;
            });

            groupbox.toggleAllEvent.on(function (value) {
               scope[attrs.groupboxSelection] = value ? angular.copy(groupbox.data) : [];
            });
         }
      };
   }
})
(angular);