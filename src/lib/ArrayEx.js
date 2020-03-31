var ArrayEx = (function() {
	var module = {};

	module.castArray = function(array) {
		if (!module.isArray(array)) {
			array = [array];
		}

		return array;
	};

	module.filter = function(array, callback) {
		var filteredArray, index;

		filteredArray = [];
		index = 0;

		module.forEach(array, function(element, index, array) {
			if (callback(element, index, array)) {
				filteredArray[index++] = element;
			}
		});

		return filteredArray;
	};
		
	module.flat = function(array) {
		return Array.prototype.concat.apply([], array);
	};

	module.forEach = function(array, callback) {
		for (var i = 0, il = array.length; i < il; i++) {
			callback(array[i], i, array);
		}
	};

	module.isArray = function(array) {
		return Object.prototype.toString.call(array) === '[object Array]';
	};

	module.map = function(array, callback) {
		var mappedArray = [];
		module.forEach(array, function(item, i, array) {
			mappedArray[i] = callback(item, i, array);
		});

		return mappedArray;
	};
	
	return module;
})();