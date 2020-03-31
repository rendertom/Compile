var ObjectEx = (function() {
	var module = {};

	module.assign = function(target, sources) {
		if (typeof sources === 'undefined') {
			return target;
		}

		sources = ArrayEx.castArray(sources);

		ArrayEx.forEach(sources, function(source) {
			if (!module.isObject(source)) return;

			module.forOwn(source, function(value, key, object) {
				target[key] = value;
			});
		});

		return target;
	};

	module.forOwn = function(object, callback) {
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				callback(object[key], key, object);
			}
		}
	};

	module.isObject = function(object) {
		return (typeof object === 'object') && object !== null;
	};

	return module;
})();