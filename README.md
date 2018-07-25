# group-box 1.1 + angularjs
Angular group box.

Group-box can offer "select all" logic when working with checkable collections.
It puts change tracking work on it's shoulders and tries to be in consistence state.

## Examples
http://klumba12.github.io/groupbox/

## Get Started

### Module
Don't forget to include group-box module!
```javascript
anuglar.module('some-module-name', ['groupbox',...])
```

### HTML markup
* `groupbox` directive should be put to the root grouping element, argument is array of checkable items.
* `groupbox-model` directive should be put to the root grouping element near `groupbox` directive, argument is checkable property of array element.
* `groupbox-selection` directive can be put to the root grouping element near `groupbox` directive, argument is assignable property name for selected items.
* `groupbox-selection-key` directive can be put to the root grouping element near `groupbox-selection` directive, argument is key name for building selectio.n
* `groupbox-all` directive should be put to the master(select all) input, usually check box.
* `groupbox-item` directive should be put to the child inputs that will be controlled by master, usually check box.
```html
   <ul groupbox="items"
       groupbox-model="isSelected"
       groupbox-selection="selectedItem"
       groupbox-selection-key="itemKey">
      <li>
         <label>
            <input groupbox-all type="checkbox" ng-model="selectAll" /> Select All
         </label>
      </li>
      <li ng-repeat="item in items">
         <label>
            <input groupbox-item type="checkbox" ng-model="item.isSelected"/>
            {{item}}
         </label>
      </li>
   </ul>
```

## Development
To setup development environment make sure that npm is installed on your machine, after that just execute npm command for the project.
`npm install`

## Testing
We use phantomjs and jasmine to ensure quality of the code.
The easiest way to run these asserts is to use npm command for the project.
`npm test`

## Licence
Code licensed under MIT license.
