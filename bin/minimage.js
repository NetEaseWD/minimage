#!/usr/bin/env node

var query = require('querystring');
var minimage = require('../minimage.js');
var fs = require('fs');

var args = process.argv.slice(2),
	option = {};

args.forEach(function(arg) {
	var tmps = arg.split('='),
		key = tmps[0],
		value = tmps[1];
	switch (key) {
		case '-h':
		case '--help':
			option.help = true;
			break;
		case '-i':
		case '--input':
			option.input = value;
			break;
		case '-o':
		case '--output':
			option.output = value;
			break;
		case '-f':
		case '--force':
			option.force = true;
			break;
		
		default:
			option.file = key;
	}
});

if (!option.input && !! option.file) {
	option.input = option.file;
}



//help
if (option.help) {
	console.log('usage: nej-minimage -i=<path> [-o=<path>] [-f]');
	console.log('option:')
	console.log('\t-i a input file or directory');
	console.log('\t-o a output file or directory');
	console.log('\t-f overwriting existing file');
	return;
}

if (!option.input) {
	console.error('[error] need a input file or directory!\nuse nej-minimage -h for more details');
	return;
}

stats = fs.statSync(option.input);
if (stats.isFile()) { //file
	if (!option.output) {
		if (option.force) {
			option.output = option.input;
		} else {
			console.error('[error] add a output file or use -f to overwrite existing file!\nuse nej-minimage -h for more details');
			return;
		}
	}
	minimage.fileHandler({
		input: option.input,
		output: option.output,
		log:function(log){
			console.log(log)
		},
		callback: function(err) {
			if (err) {
				console.log(JSON.stringify(err));
			} else {
				console.log('job finished!');
			}
		}
	});
} else if (stats.isDirectory()) { //directory
	if (option.input.lastIndexOf('/') == option.input.length - 1) {
		option.input = option.input.substring(0, option.input.length - 1);
	}
	if (!option.output) {
		if (option.force) {
			option.output = option.input;
		} else {
			console.error('[error] need a output directory!\nuse nej-minimage -h for more details');
			return;
		}
	} else if (option.output.lastIndexOf('/') == option.output.length - 1) {
		option.output = option.output.substring(0, option.output.length - 1);
	}
	minimage.dirHandler({
		input: option.input,
		output: option.output,
		log:function(log){
			console.log(log)
		},
		callback: function(err) {
			if (err) {
				console.log(JSON.stringify(err));
			} else {
				console.log('job finished!');
			}
		}
	});
} else {
	console.error('[error] not a file or directory!\nuse nej-minimage -h for more details');
	return;
}