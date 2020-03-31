var FolderEx = (function() {
	var module = {};

	module.ensureFolderExists = function(folder) {
		folder = module.getFolderObject(folder);

		if (!folder.exists) {
			if (!folder.create()) {
				throw new Error('Could not create folder ' + folder.fsName);
			}
		}

		return folder;
	};

	module.getFiles = function(folder, recursion, extensions, files) {
		var exetensionRegex, folderItems;

		files = files || [];
		folder = module.getFolderObject(folder);

		extensions = extensions || [];
		extensions = ArrayEx.castArray(extensions);
		exetensionRegex = new RegExp('.(' + extensions.join('|') + ')$', 'i');

		folderItems = folder.getFiles();
		ArrayEx.forEach(folderItems, function(file) {
			if (recursion && file instanceof Folder) {
				module.getFiles(file, recursion, extensions, files);
			} else {
				if (file.name.match(exetensionRegex)) {
					files.push(file);
				}
			}
		});

		return files;
	};

	module.getFolderObject = function(folder) {
		return (folder instanceof Folder) ? folder : new Folder(folder);
	};

	return module;
})();