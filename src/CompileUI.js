var CompileUI = (function(thisObj) {
	// @include 'lib/ArrayEx.js'
	// @include 'lib/FileEx.js'
	// @include 'lib/Os.js'
	
	var script = {
		name: 'Compile',
		developer: 'Tomas Šinkūnas',
		developerURL: 'www.rendertom.com',
	};

	var win;
	var minSpace = 2;

	var module = {};
	module.build = function() {
		win = (thisObj instanceof Panel) ? thisObj : new Window('palette', script.name, undefined, {
			resizeable: true
		});
		win.alignChildren = ['fill', 'top'];
		win.spacing = minSpace;
		win.onResizing = win.onResize = function() {
			this.layout.resize();
		};

		win.onShow = function() {
			vscode.radio.onClick();
			radioCompileFiles.value = true;
		};



		var grpCompiler = addPanel(win, 'Compiler');

		var estk = buildCompilerSelector(grpCompiler, 'ExtendScript Toolkit');
		estk.radio.helpTip = 'Compile using ExtendScript Toolkit';
		estk.etPath.helpTip = 'Path to ExtendScript Tool application';
		estk.etPath.text = Compile.getESTKPath();
		estk.btnSearch.onClick = function() {
			var extension, file;

			extension = Os.isMac() ? 'app' : 'exe';
			file = FileEx.selectFiles(extension, false, 'Please select ESTK.' + extension);
			if (file) {
				estk.etPath.text = file.fsName;
			}
		};
		estk.radio.onClick = function() {
			estk.setSelected(true);

			vscode.setSelected(false);
			grpNodePath.enabled = false;
		};



		var vscode = buildCompilerSelector(grpCompiler, 'VSCode');
		vscode.radio.helpTip = 'Compile using VSCode and extension "ExtendScript Debugger"';
		vscode.etPath.helpTip = 'Path to "exportToJSXBin.js" file\rin VSCode\'s extension "ExtendScript Debugger"';
		vscode.etPath.text = Compile.getExportToJSXBinPath();
		vscode.btnSearch.onClick = function() {
			var file = FileEx.selectFiles('js', false, 'Please select exportToJSXBin.js file');
			if (file) {
				vscode.etPath.text = file.fsName;
			}
		};
		vscode.radio.onClick = function() {
			vscode.setSelected(true);
			grpNodePath.enabled = true;

			estk.setSelected(false);
		};
		var grpNodePath = addGroup(vscode.grpContainer);
		vscode.cbNodePath = grpNodePath.add('checkbox', undefined, 'Custom Node path');
		vscode.cbNodePath.alignment = ['left', 'center'];
		vscode.cbNodePath.onClick = function() {
			vscode.etNodePath.enabled = this.value;
		};
		vscode.etNodePath = grpNodePath.add('edittext');
		vscode.etNodePath.helpTip = 'Node path. If not defined, uses "/usr/local/bin/node"';
		vscode.etNodePath.enabled = vscode.cbNodePath.value;



		var grpSelection = addPanel(win, 'Selection');
		var radioCompileFiles = grpSelection.add('radiobutton', undefined, 'Compile individual files');
		var radioCompileFolder = grpSelection.add('radiobutton', undefined, 'Compile folder with files');



		var grpOptions = addPanel(win, 'Options');
		var grpExtension = addGroup(grpOptions);
		var cbExtension = grpExtension.add('checkbox', undefined, 'Custom extension');
		cbExtension.alignment = ['left', 'center'];
		cbExtension.onClick = function() {
			etExtension.enabled = this.value;
		};

		var etExtension = grpExtension.add('edittext', undefined, '.jsxbin');
		etExtension.enabled = cbExtension.value;
		etExtension.preferredSize.width = 100;



		var grpOutputFolder = addGroup(grpOptions);

		var cbOutputFolder = grpOutputFolder.add('checkbox', undefined, 'Output Folder');
		cbOutputFolder.alignment = ['left', 'center'];
		cbOutputFolder.onClick = function() {
			etOutputFolder.enabled = this.value;
			btnOutputFolder.enabled = this.value;
		};

		var etOutputFolder = grpOutputFolder.add('edittext');
		etOutputFolder.enabled = cbOutputFolder.value;
		etOutputFolder.preferredSize.width = 100;

		var btnOutputFolder = grpOutputFolder.add('button', undefined, '...');
		btnOutputFolder.alignment = ['right', 'center'];
		btnOutputFolder.enabled = cbOutputFolder.value;
		btnOutputFolder.preferredSize = [24, 24];
		btnOutputFolder.onClick = function() {
			var outputFolder = Folder.selectDialog('Select output folder');
			if (outputFolder) {
				etOutputFolder.text = outputFolder.fsName;
			}
		};



		var checkRemoveSource = grpOptions.add('checkbox', undefined, 'Remove source files');



		var grpFooter = win.add('group');
		grpFooter.alignChildren = ['fill', 'top'];
		grpFooter.margins.top = 5;
		grpFooter.spacing = minSpace;

		var btnRequirements = grpFooter.add('button', undefined, '?');
		btnRequirements.alignment = ['left', 'top'];
		btnRequirements.onClick = showRequirements;
		btnRequirements.preferredSize.width = 28;

		var btnClose = grpFooter.add('button', undefined, 'Close');
		btnClose.alignment = ['right', 'top'];
		btnClose.onClick = function() {
			win.close();
		};

		var btnOK = grpFooter.add('button', undefined, 'OK');
		btnOK.alignment = ['right', 'top'];
		btnOK.onClick = function() {
			var compiler, files, options, outputFolder, selection;

			options = buildOptions();

			try {
				if (estk.isSelected()) {
					compiler = Compile.estk;
					options.estk = validateESTKPath(estk);
				} else {
					compiler = Compile.vscode;
					options.exportToJSXBin = validateVSCodePath(vscode);
					if (vscode.cbNodePath.value) {
						options.node = vscode.etNodePath.text;
					}
				}

				selection = getSelection();
				if (selection) {
					if (cbOutputFolder.value) {
						outputFolder = etOutputFolder.text;
					}

					files = compiler(selection, outputFolder, options);
					files = ArrayEx.filter(files, function(file) {
						return FileEx.getFileObject(file).exists;
					});

					alert('Compiled ' + files.length + ' files');
				}

			} catch (error) {
				handleError(error);
			}

			function buildOptions() {
				var options = {};

				switch (true) {
					case cbExtension.value:
						options.extension = etExtension.text;
						break;
					case checkRemoveSource.value:
						options.removeSource = checkRemoveSource.value;
						break;
				}

				return options;
			}

			function getSelection() {
				if (radioCompileFiles.value) {
					return FileEx.selectFiles(['js', 'jsx'], true, 'Please select "*.js" or "*.jsx" files');
				} else {
					return Folder.selectDialog('Select folder containing files to compile');
				}
			}
		};
	};

	module.show = function() {
		if (!win || !isValid(win)) {
			module.build();
		}

		if (win instanceof Window) {
			win.center();
			win.show();
			win.size.width = 300;
		} else {
			win.layout.layout(true);
			win.layout.resize();
		}
	};

	return module;

	function addGroup(parentGroup) {
		var group = parentGroup.add('group');
		group.alignChildren = ['fill', 'center'];
		group.spacing = minSpace;

		return group;
	}

	function addPanel(parentGroup, name) {
		var panel = win.add('panel', undefined, name);
		panel.alignChildren = ['fill', 'top'];
		panel.spacing = minSpace;

		return panel;
	}

	function buildCompilerSelector(parentGroup, name) {
		var grpContainer = parentGroup.add('group');
		grpContainer.alignChildren = ['fill', 'top'];
		grpContainer.margins.bottom = 5;
		grpContainer.orientation = 'column';
		grpContainer.spacing = 0;

		var radio = grpContainer.add('radiobutton', undefined, name);

		var grpSearch = addGroup(grpContainer);

		var etPath = grpSearch.add('edittext');
		var btnSearch = grpSearch.add('button', undefined, '...');
		btnSearch.alignment = ['right', 'center'];
		btnSearch.preferredSize = [24, 24];

		return {
			btnSearch: btnSearch,
			etPath: etPath,
			grpContainer: grpContainer,
			radio: radio,
			isSelected: function() {
				return radio.value;
			},
			setSelected: function(value) {
				grpSearch.enabled = value;
				radio.value = value;
			}
		};
	}

	function handleError(error) {
		var message = error.toString();
		if (error instanceof Error) {
			message += '\nScript File: ' + File(error.fileName).displayName +
				'\nFunction: ' + arguments.callee.name +
				'\nError on Line: ' + error.line.toString();
		}
		alert(message);
	}

	function showRequirements() {
		var win = new Window('dialog', 'Requirements', undefined, {
			resizeable: true,
		});
		win.alignChildren = ['fill', 'fill'];
		win.onResizing = win.onResize = function() {
			this.layout.resize();
		};

		var text = '' +
			'ExtendScript Toolkit requirements:\n' +
			'	- ExtendScript Toolkit application\n' +
			'\n' +
			'Once installed, select ExtendScript Toolkit app file in the UI:\n' +
			'Mac: /Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app\n' +
			'Win: C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe\n' +
			'\n' +
			'-------------------------\n' +
			'\n' +
			'VScode requirements:\n' +
			'	1. VSCode:\n' +
			'	https://code.visualstudio.com/Download\n\n' +
			'	2. ExtendScript Debugger extension for VSCode:\n' +
			'	https://marketplace.visualstudio.com/items?itemName=Adobe.extendscript-debug\n\n' +
			'	3. Node 10.11.0 or newer:\n' +
			'	https://nodejs.org/en/download/\n' +
			'\n' +
			'Once all installed, select "exportToJSXBin.js" file in the UI for VSCode: ' +
			'~/.vscode/extensions/adobe.extendscript-debug-2.0.3/public-scripts/exportToJSXBin.js\n\n' +
			'If Node is installed in custom path, then define it in "Custom Node path", otherwise it defaults to "/usr/local/bin/node"\n' +
			'\n' +
			'-------------------------\n' +
			'Developed by ' + script.developer + ', ' + script.developerURL;

		var et = win.add('edittext', undefined, text, {
			multiline: true,
			editable: true,
		});
		et.preferredSize = [500, 300];

		win.show();
	}

	function validateESTKPath(estk) {
		var file, macPathSuffix, path;

		path = estk.etPath.text;
		macPathSuffix = '/Contents/MacOS/ExtendScript Toolkit';
		if (Os.isMac() && !path.match(macPathSuffix)) {
			path += macPathSuffix;
		}

		file = FileEx.getFileObject(path);

		if (!file.exists) {
			estk.etPath.active = true;
			throw 'Not a valid ESTK path';
		}

		return path;
	}

	function validateVSCodePath(vscode) {
		var file, fileName, path;

		path = vscode.etPath.text;

		file = FileEx.getFileObject(path);
		if (!file.exists) {
			vscode.etPath.active = true;
			throw 'File does not exist at path ' + file.fsName;
		}

		fileName = FileEx.getBaseName(path);
		if (!fileName.match(/exportToJSXBin/i)) {
			vscode.etPath.active = true;
			throw 'Not a valid VSCode path. Please select "exportToJSXBin.js" file';
		}

		return path;
	}
})(this);