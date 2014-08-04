#!/usr/bin/env node

var query = require('querystring');
var minimage = require('../minimage.js');
var fs = require('fs');

/*
 * 取命令行参数
 * @return {Object} 命令行参数
 */
var _getArgs = (function() {
	var _args;
	return function() {
		if (!_args) {
			var _arr = process.argv.slice(2);
			_args = query.parse(_arr.join('&'));
		}
		return _args;
	};
})();



var args = process.argv.slice(2),
	options = {};

args.forEach(function(arg) {
	var tmps = arg.split('='),
		key = tmps[0],
		value = tmps[1];
	switch (key) {
		case '-h':
		case '--help':
			options.help = true;
			break;
		case '-i':
		case '--input':
			options.input = value;
			break;
		case '-o':
		case '--output':
			options.output = value;
			break;
		case '-f':
		case '--force':
			options.force = true;
			break;
		default:
			options.file = key;
	}
});

if (!options.input && !! options.file) {
	options.input = options.file;
}



//help
if (options.help) {
	console.log('usage: nej-minimage -i=<path> [-o=<path>] [-f]');
	console.log('options:')
	console.log('\t-i a input file or directory');
	console.log('\t-o a output file or directory');
	console.log('\t-f overwriting existing file');
	return;
}

if (!options.input) {
	console.error('[error] need a input file or directory!\nuse nej-minimage -h for more details');
	return;
}

stats = fs.statSync(options.input);
if (stats.isFile()) { //file
	if (!options.output) {
		if (options.force) {
			options.output = options.input;
		} else {
			console.error('[error] add a output file or use -f to overwrite existing file!\nuse nej-minimage -h for more details');
			return;
		}
	}
	minimage.fileHandler(options.input, options.output, function(err) {
		if (err) {
			console.log(JSON.stringify(err));
		} else {
			console.log('job finished!');
		}
	});
} else if (stats.isDirectory()) { //directory
	if (options.input.lastIndexOf('/') == options.input.length - 1) {
		options.input = options.input.substring(0, options.input.length - 1);
	}
	if (!options.output) {
		if (options.force) {
			options.output = options.input;
		} else {
			console.error('[error] need a output directory!\nuse nej-minimage -h for more details');
			return;
		}
	} else if (options.output.lastIndexOf('/') == options.output.length - 1) {
		options.output = options.output.substring(0, options.output.length - 1);
	}
	minimage.dirHandler(options.input, options.output, function(err) {
		if (err) {
			console.log(JSON.stringify(err));
		} else {
			console.log('job finished!');
		}
	});
} else {
	console.error('[error] not a file or directory!\nuse nej-minimage -h for more details');
	return;
}