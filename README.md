# Compile #

A helper class for Adobe ExtendScript to compile *.js and *.jsx files into *.jsxbin files.

### Prerequisites ###

The class requires either  [ExtendScript Toolkit](https://www.adobe.com/products/extendscript-toolkit.htmlESTK) application (that is EOLed on Mac), or [ExtendScript Debugger](https://marketplace.visualstudio.com/items?itemName=Adobe.extendscript-debug) extension for VSCode.

* `Compile.estk()` requirements: [ExtendScript Toolkit](https://www.adobe.com/products/extendscript-toolkit.htmlESTK) application.
* `Compile.vscode()` requirements:
  * [VSCode](https://code.visualstudio.com/Download) IDE,
  * [ExtendScript Debugger](https://marketplace.visualstudio.com/items?itemName=Adobe.extendscript-debug) extension for VSCode,
  * [Node](https://nodejs.org/en/download/) 10.11.0 or newer.

## Usage ##

```javascript
// Inlcude the class
#include 'Compile.js'



// Compile using ExtendScript Toolkit application:
Compile.estk(
  'test.js',      // Array of File or Folder objects to be compiled. Required.
  'test.jsxbin',  // A File or Folder object save compiled file to. Optional.

  // Optional object with user defined parameters:
  {
    extension: '.jsxbin',   // A custom extension. Optional. If not defined, uses .jsxbin.
    removeSource: false,    // An option to remove source files. Optional.

    // A path to ExtenScript Toolkit application. Optional. If not defined, uses:
    // Mac: /Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit
    // Win: C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe
    estk: '/Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit',
  }
);



// Compile using ExtendScript Debugger extension for VSCode:
Compile.vscode(
  'test.js',      // Array of File or Folder objects to be compiled. Required.
  'test.jsxbin',  // A File or Folder object save compiled file to. Optional.

  // Optional object with user defined parameters:
  {
    extension: '.jsxbin',   // A custom extension. Optional. If not defined, uses .jsxbin.
    removeSource: false,    // An option to remove source files. Optional.

    // A path to 'exportToJSX.js' file, residing in ExtendScript Debugger extension. Optional.
    exportToJSX: '~/.vscode/extensions/adobe.extendscript-debug-1.1.2/public-scripts/exportToJSX.js',

    // A path to node. Optional, if not defined, uses '/usr/local/bin/node'.
    node: '/usr/local/bin/node',
  }
);
```

---

**NOTE**

`Compile.estk()` cannot be executed from VSCode or any other IDE if VSCode application is running - ESTK will throw error ExtendScript Toolkit CC already running!

---

The following examples use `Compile.vscode()` method, which is identical if using `Compile.estk()` method.

### Case 1 ###

```javascript
// Compile 'test.js' file with default parameters.
// 
// Returns array with one File object 'test.jsxbin'.

Compile.vscode('test.js');

// is the same as
Compile.vscode('test.js', 'test.jsxbin');
```

### Case 2 ###

```javascript
// Compile the contents of Input folder into Output folder.
//
// NOTE:
//  - Input folder objects are processed recursivelly
//  - Output folder does not maintain folder hierarchy
//
// Returns array of compiled File objects

Compile.vscode('inputFolder', 'outputFolder');
```

### Case 3 ###
```javascript
// Compile contents of inputFolder with user parameters:
//  - Compile the contents on folder in place,
//  - Change extension to '*.jsx',
//  - Remove source file.
//
// Returns array of compiled File objects

Compile.vscode(
  'inputFolder',
  undefined, {
    extension: '.jsx',
    removeSource: true,
  }
);
```

## Using the UI ##
```javascript
// Inlcude both Compile and CompileUI classes
#include 'Compile.js'
#include 'CompileUI.js'

// Open the UI
CompileUI.show();
```
