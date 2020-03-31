var Os = (function() {
	var module = {};

	module.isMac = function() {
		return !module.isWindows();
	};

	module.isWindows = function() {
		return $.os.indexOf('Windows') !== -1;
	};

	return module;
})();