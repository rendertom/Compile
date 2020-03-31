(function(module) {
	var estkOptions, estkPathMac, estkPathWin, options;

	estkPathMac = '/Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit';
	estkPathWin = 'C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe';

	estkOptions = {
		estk: Os.isWindows() ? estkPathWin : estkPathMac,
		extension: '.jsxbin',
		removeSource: false,
	};

	/**
	 * Compiles list of files|folders into JSXBIN using ExtensScript Toolkit application.
	 * @param  {String[]|File[]}	scriptPaths - array of File or Folder objects to be compiled. Required.
	 * @param  {String}				[outputPath = source.jsxbin] - a File or Folder object save compiled file to. Optional.
	 * @param  {Object}				[userOptions] - object with user parameters.
	 * @param  {String}				[userOptions.estk = estkPathMac/estkPathWin] - path to ExtenScript Toolkit application.
	 * @param  {String}				[userOptions.extension = '.jsxbin'] - a custom extension. Optional. If not defined, uses ".jsxbin".
	 * @param  {Boolean}			[userOptions.removeSource = false] - an option to remove source files. Optional.
	 */
	module.estk = function(scriptPaths, outputPath, userOptions) {
		var cmd, ESTKApp, ESTKCompilerFile, outputPaths;

		options = ObjectEx.assign({}, [estkOptions, userOptions]);
		options.outputPath = outputPath;

		ESTKApp = FileEx.getFileObject(options.estk);
		if (!ESTKApp.exists) {
			throw 'Could not get ExtendScript Toolkit\nApplication does not exist at path ' + ESTKApp.fsName;
		}

		scriptPaths = getScriptPathsFromFolders(scriptPaths);
		outputPaths = getOutputPaths(scriptPaths);
		ESTKCompilerFile = buildESTKCompilerFile(scriptPaths, outputPaths);

		killESTK();

		cmd = getESTKCommand(options.estk, ESTKCompilerFile);
		system.callSystem(cmd);

		ESTKCompilerFile.remove();

		return ArrayEx.map(outputPaths, function(outputPath) {
			return FileEx.getFileObject(outputPath);
		});
	};

	module.getESTKPath = function() {
		return estkOptions.estk;
	};



	function buildESTKCompilerFile(scriptPaths, outputPaths) {
		var ESTKCompilerFile, template;

		template = ESTKTemplate.toString();

		template = template.replace(/'{{SCRIPT_FILES}}'/, scriptPaths.toSource());
		template = template.replace(/'{{OUTPUT_FILES}}'/, outputPaths.toSource());
		template = template.replace(/'{{REMOVE_SOURCE}}'/, options.removeSource);
		template = '//@target estoolkit#dbg\n(' + template + ')();';

		ESTKCompilerFile = FileEx.write(
			FileEx.getFileObject(scriptPaths[0]).parent.fsName + '/ESTK Compiler File.js',
			template
		);

		return ESTKCompilerFile;
	}

	function getOutputPaths(scriptPaths) {
		scriptPaths = ArrayEx.castArray(scriptPaths);
		return ArrayEx.map(scriptPaths, function(scriptPath) {
			return getOutputPath(scriptPath);
		});

		function getOutputPath(scriptPath) {
			var extension, customPath, outputFile;

			extension = options.extension || '.jsxbin';
			outputFile = FileEx.changeExtension(scriptPath, extension);

			if (options.outputPath) {
				customPath = options.outputPath;
				if (isFolder(customPath)) {
					customPath = FolderEx.getFolderObject(customPath).fsName + '/' + FileEx.getBaseName(scriptPath) + extension;
				}

				outputFile = FileEx.getFileObject(customPath);
			}

			return outputFile.fsName;
		}
	}

	function getESTKCommand(ESTKApp, ESTKCompilerFile) {
		var changeDirectory, cmd;

		ESTKApp = FileEx.getFileObject(ESTKApp);
		ESTKCompilerFile = FileEx.getFileObject(ESTKCompilerFile);

		changeDirectory = 'cd "' + ESTKCompilerFile.parent.fsName + '"';
		cmd = changeDirectory + '; "' + ESTKApp.fsName + '" -cmd "' + ESTKCompilerFile.name + '"';

		if (Os.isWindows()) {
			cmd = 'cmd /c ' + changeDirectory + ' && "' + ESTKApp.fsName + '" -cmd "' + ESTKCompilerFile.displayName + '"';
		}

		return cmd;
	}

	function getScriptPathsFromFolders(scriptPaths, array) {
		array = array || [];
		scriptPaths = ArrayEx.castArray(scriptPaths);

		ArrayEx.forEach(scriptPaths, function(scriptPath) {
			var files, scriptFile;

			scriptFile = File(scriptPath);
			if (scriptFile instanceof File) {
				if (/(js|jsx|jsinc)$/i.test(FileEx.getExtension(scriptFile))) {
					array.push(scriptFile.fsName);
				}
			} else {
				files = scriptFile.getFiles();
				return getScriptPathsFromFolders(files, array);
			}
		});

		return array;
	}

	function isFolder(file) {
		return FileEx.getFileObject(file).name.indexOf('.') === -1;
	}

	function killESTK() {
		var cmd = 'osascript -e \'quit app "ExtendScript Toolkit"\'';
		if (Os.isWindows()) {
			cmd = 'START /wait taskkill /f /im "ExtendScript Toolkit.exe"';
		}

		system.callSystem(cmd);
	}
})(module);