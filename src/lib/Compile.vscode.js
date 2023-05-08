(function(module) {
	var options, vscodeOptions;

	vscodeOptions = {
		exportToJSXBin: '~/.vscode/extensions/adobe.extendscript-debug-2.0.3/public-scripts/exportToJSXBin.js',
		extension: '.jsxbin',
		node: '/usr/local/bin/node',
		removeSource: false,
	};

	/**
	 * Compiles list of files|folders into JSXBIN using ExtendScript Debugger extension for VSCode.
	 * @param  {String[]|File[]}	scriptPaths - array of File or Folder objects to be compiled. Required.
	 * @param  {String}				[outputPath = source.jsxbin] - a File or Folder object save compiled file to. Optional.
	 * @param  {Object}				[userOptions] - object with user parameters.
	 * @param  {String}				[userOptions.exportToJSXBin = '~/.vscode/extensions/adobe.extendscript-debug-2.0.3/public-scripts/exportToJSXBin.js']	- a path to 'exportToJSXBin.js' file, residing in ExtendScript Debugger extension. Optional.
	 * @param  {String}				[userOptions.extension = '.jsxbin'] - a custom extension. Optional. If not defined, uses ".jsxbin".
	 * @param  {String}				[userOptions.node = '/usr/local/bin/node'] - a path to node. Optional, if not defined, uses '/usr/local/bin/node'.
	 * @param  {Boolean}			[userOptions.removeSource = false] - an option to remove source files. Optional.
	 */
	module.vscode = function(scriptPaths, outputPath, userOptions) {
		options = ObjectEx.assign({}, [vscodeOptions, userOptions]);
		options.outputPath = outputPath;

		var exportToJSXBin = FileEx.getFileObject(options.exportToJSXBin);
		if (!exportToJSXBin.exists) {
			throw 'Could not find "exportToJSXBin.js"\nFile does not exist at path ' + exportToJSXBin.fsName;
		}

		var node = FileEx.getFileObject(options.node);
		if (!node.exists) {
			throw 'Could not find node\nFile does not exist at path' + node.fsName;
		}

		scriptPaths = ArrayEx.castArray(scriptPaths);
		var outputPaths = ArrayEx.map(scriptPaths, function(scriptPath) {
			var cmd, res;

			cmd = getVSCODECommand(options.exportToJSXBin, scriptPath);
			res = system.callSystem(cmd);

			if (/Error/i.test(res)) {
				throw res;
			}

			return postProcessFile(scriptPath);
		});

		return ArrayEx.flat(outputPaths);
	};

	module.getExportToJSXBinPath = function() {
		return vscodeOptions.exportToJSXBin;
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

	function getVSCODECommand(exportToJSXBin, scriptFile) {
		exportToJSXBin = FileEx.getFileObject(exportToJSXBin);
		scriptFile = FileEx.getFileObject(scriptFile);

		return options.node + ' "' +
			exportToJSXBin.fsName + '" -f -n "' +
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