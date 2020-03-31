var ESTKTemplate = function() {
	try {

		var scriptPaths = '{{SCRIPT_FILES}}';
		var outputPaths = '{{OUTPUT_FILES}}';
		var removeSource = '{{REMOVE_SOURCE}}';

		for (var i = 0, il = scriptPaths.length; i < il; i++) {
			exportJSXBIN(scriptPaths[i], outputPaths[i]);
			if (removeSource) {
				File(scriptPaths[i]).remove();
			}
		}

	} catch (error) {
		alert(error);
	}

	function castFileObject(file) {
		return (file instanceof File) ? file : new File(file);
	}

	function exportJSXBIN(file, outputFile) {
		var compiledString, content, includePath;

		file = castFileObject(file);
		content = readFile(file);
		includePath = file.parent ? file.parent.absoluteURI : '/';

		try {
			compiledString = app.compile(content, file.absoluteURI, includePath);
		} catch (error) {
			throw 'Unable to compile file ' + File.decode(file.name) + '\nFile path: ' + file.fsName + '\n' + e.toString() + '\nLine: ' + e.line.toString();
		}

		return writeFile(outputFile, compiledString);
	}

	function readFile(file) {
		file = castFileObject(file);

		file.encoding = 'UTF-8';
		file.open('r');
		var content = file.read();
		file.close();

		return content;
	}

	function writeFile(file, content) {
		file = castFileObject(file);

		var folder = file.parent;
		if (!folder.exists && !folder.create()) {
			throw new Error('Could not create folder ' + folder.fsName);
		}

		file.encoding = 'UTF-8';
		file.open('w');
		var success = file.write(content);
		file.close();

		if (!success) {
			throw new Error('Unable to write file ' + file.fsName);
		}

		return file;
	}
};