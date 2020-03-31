(function(thisObj) {
	try {

		// @include '../src/Compile.js'
		// @include '../src/CompileUI.js'



		// Case 1:
		// Compile 'test.js' file with default parameters.
		// 
		// Returns array with one File object 'test.jsxbin'.

		Compile.vscode('test.js');

		// is the same as
		Compile.vscode('test.js', 'test.jsxbin');



		// Case 2:
		// Compile the contents of Input folder into Output folder.
		// NOTE:
		//     - Input folder objects are processed recursivelly
		//     - Output folder does not maintain folder hierarchy
		// 
		// Returns array of compiled File objects

		Compile.vscode('inputFolder', 'outputFolder');



		// Case 3:
		//     - Compile the contents on Input folder in place,
		//     - Change extension to '*.jsx',
		//     - Remove source file.
		//     
		// Returns array of compiled File objects

		Compile.vscode(
			'inputFolder',
			undefined, {
				extension: '.jsx',
				removeSource: true,
			}
		);



		// Using UI
		CompileUI.show();



	} catch (error) {
		var message = error.toString();
		if (error instanceof Error) {
			message += '\nScript File: ' + File(error.fileName).displayName +
				'\nFunction: ' + arguments.callee.name +
				'\nError on Line: ' + error.line.toString();
		}
		alert(message);
	}
})(this);