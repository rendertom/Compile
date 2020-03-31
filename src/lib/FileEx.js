var FileEx = (function() {
	var isWindows = $.os.indexOf('Windows') > -1;
	var module = {};

	module.changeExtension = function(file, newExtension) {
		file = module.getFileObject(file);
		return module.getFileObject(
			file.fsName.substring(
				0, file.fsName.lastIndexOf('.')
			) + newExtension
		);
	};

	module.copy = function(source, destination) {
		source = FileEx.getFileObject(source);
		destination = FileEx.getFileObject(destination);

		FolderEx.ensureFolderExists(destination.parent);

		var cmd = 'cp -a "' + source.fsName + '" "' + destination.fsName + '"';
		if (isWindows) {
			cmd = 'cmd.exe /c" copy "' + source.fsName + '" "' + destination.fsName + '" /Y"';
		}

		system.callSystem(cmd);
	};

	module.getBaseName = function(file) {
		var name, baseName;

		file = module.getFileObject(file);

		name = File.decode(file.name);
		baseName = name.split('.').slice(0, -1).join('.');

		return baseName;
	};
	
	module.getExtension = function(file) {
		file = module.getFileObject(file);
		return file.fsName.split('.').pop();
	};
	
	module.getFileObject = function(file) {
		return (file instanceof File) ? file : new File(file);
	};

	module.selectFiles = function(extensions, multiSelect, message) {
		extensions = ArrayEx.castArray(extensions);
		multiSelect = multiSelect || false;

		if (typeof message === 'undefined') {
			message = multiSelect ? 'Please select multiple files' : 'Please select file';
		}

		var files = File.openDialog(message, getFilterForFiles(extensions), multiSelect);

		return files;

		function getFilterForFiles(extensions) {
			extensions = ArrayEx.castArray(extensions);

			if (Os.isWindows()) {
				return '*.' + extensions.join(';*.');
			}

			var extensionListRe = '.(' + extensions.join('|') + ')$';
			var re = new RegExp(extensionListRe, 'i');

			return function(file) {
				return file.name.match(re) || file instanceof Folder;
			};
		}
	};

	module.write = function(file, contents, encoding, openMode) {
		file = module.getFileObject(file);
		FolderEx.ensureFolderExists(file.parent);

		encoding = encoding || 'UTF-8';
		openMode = openMode || 'w'; // 'a', 'e', 'r', 'w';

		file.encoding = encoding;
		file.open(openMode);
		var success = file.write(contents);
		file.close();

		if (!success) {
			throw new Error('Unable to write file ' + file.fsName);
		}

		return file;
	};

	return module;
})();