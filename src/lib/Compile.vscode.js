(function(module) {
	var options, vscodeOptions;

	vscodeOptions = {
		exportToJSX: '~/.vscode/extensions/adobe.extendscript-debug-1.1.2/public-scripts/exportToJSX.js',
		extension: '.jsxbin',
		node: '/usr/local/bin/node',
		removeSource: false,
	};

	/**
	 * Compiles list of files|folders into JSXBIN using ExtendScript Debugger extension for VSCode.
	 * @param  {String[]|File[]}	scriptPaths - array of File or Folder objects to be compiled. Required.
	 * @param  {String}				[outputPath = source.jsxbin] - a File or Folder object save compiled file to. Optional.
	 * @param  {Object}				[userOptions] - object with user parameters.
	 * @param  {String}				[userOptions.exportToJSX = '~/.vscode/extensions/adobe.extendscript-debug-1.1.2/public-scripts/exportToJSX.js']	- a path to 'exportToJSX.js' file, residing in ExtendScript Debugger extension. Optional.
	 * @param  {String}				[userOptions.extension = '.jsxbin'] - a custom extension. Optional. If not defined, uses ".jsxbin".
	 * @param  {String}				[userOptions.node = '/usr/local/bin/node'] - a path to node. Optional, if not defined, uses '/usr/local/bin/node'.
	 * @param  {Boolean}			[userOptions.removeSource = false] - an option to remove source files. Optional.
	 */
	module.vscode = function(scriptPaths, outputPath, userOptions) {
		options = ObjectEx.assign({}, [vscodeOptions, userOptions]);
		options.outputPath = outputPath;

		var exportToJSX = FileEx.getFileObject(options.exportToJSX);
		if (!exportToJSX.exists) {
			throw 'Could not find "exportToJSX.js"\nFile does not exist at path ' + exportToJSX.fsName;
		}

		var node = FileEx.getFileObject(options.node);
		if (!node.exists) {
			throw 'Could not find node\nFile does not exist at path' + node.fsName;
		}

		scriptPaths = ArrayEx.castArray(scriptPaths);
		var outputPaths = ArrayEx.map(scriptPaths, function(scriptPath) {
			var cmd, res;

			cmd = getVSCODECommand(options.exportToJSX, scriptPath);
			res = system.callSystem(cmd);

			if (/Error/i.test(res)) {
				throw res;
			}

			return postProcessFile(scriptPath);
		});

		return ArrayEx.flat(outputPaths);
	};

	module.getExportToJSXPath = function() {
		return vscodeOptions.exportToJSX;
	};



	function changeFileAttributes(scriptPath) {
		var extension, compiledFile, customPath, outputFile;

		extension = options.extension || '.jsxbin';
		compiledFile = FileEx.changeExtension(scriptPath, '.jsxbin');
		outputFile = FileEx.changeExtension(scriptPath, extension);

		if (options.outputPath) {
			customPath = options.outputPath;
			if (isFolder(customPath)) {
				customPath = FolderEx.getFolderObject(customPath).fsName + '/' + FileEx.getBaseName(scriptPath) + extension;
			}

			outputFile = FileEx.getFileObject(customPath);
		}

		if (compiledFile.fsName !== outputFile.fsName) {
			FileEx.copy(compiledFile, outputFile);
			compiledFile.remove();
		}

		return outputFile;
	}

	function getVSCODECommand(exportToJSX, scriptFile) {
		exportToJSX = FileEx.getFileObject(exportToJSX);
		scriptFile = FileEx.getFileObject(scriptFile);

		return options.node + ' "' +
			exportToJSX.fsName + '" -f -n "' +
			scriptFile.fsName + '"';
	}

	function isFolder(file) {
		return FileEx.getFileObject(file).name.indexOf('.') === -1;
	}

	function postProcessFile(scriptPath) {
		var file, files;

		file = FileEx.getFileObject(scriptPath);
		files = [file];

		if (isFolder(file)) {
			files = FolderEx.getFiles(file, true, ['js', 'jsx']);
		}

		return ArrayEx.map(files, function(file) {
			if (options.removeSource) {
				file.remove();
			}

			file = changeFileAttributes(file);

			return file;
		});
	}
})(module);