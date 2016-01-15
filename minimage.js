var path = require('path');
var fs = require('fs');
var async = require('async');
var util = require('./lib/util.js');
var logFn = console.log;

var imageOptimizeHandlerConfig = {
	'jpg': optiJPEG,
	'jpeg': optiJPEG,
	'png': optiPNG,
	'gif': optiGIF
};

var globalConfig = {
	jpg: {
		progressive: false
	},
	png: {
		optimizeLevel: 7
	}
}

/**
 * 优化jpg图片
 */

	function optiJPEG(inputFile, outputFile, callback) {
		var execFile = require('child_process').execFile;
		var jpegtran = require('jpegtran-bin');

		var jpegtranOptions = ['-copy', 'none', '-optimize', '-outfile', outputFile, inputFile];
		if (globalConfig.jpg.progressive) {
			jpegtranOptions.unshift('-progressive');
		}

		execFile(jpegtran, jpegtranOptions, function(err) {
			if (err) {
				callback && callback(err);
			} else {
				logFn('image minified ' + outputFile);
				callback && callback(null, true);
			}
		});
	}

	/**
	 * 优化png图片
	 */

	function optiPNG(inputFile, outputFile, callback) {
		var execFile = require('child_process').execFile;
		var optipng = require('optipng-bin');
		var optipngOption = ['-clobber', '-force', '-o' + globalConfig.png.optimizeLevel, inputFile, '-out', outputFile]
		execFile(optipng, optipngOption, function(err, stdout, stderr) {
			if (err) {
				callback && callback(err);
			} else {
				logFn('image minified ' + outputFile);
				callback && callback(null, true);
			}
		});
	}

	/**
	 *  优化gif图片
	 */

	function optiGIF(inputFile, outputFile, callback) {
		var execFile = require('child_process').execFile;
		var gifsiclePath = require('gifsicle');

		execFile(gifsiclePath, ['-o', outputFile, inputFile], function(err, stdout, stderr) {
			if (err) {
				callback && callback(err);
			} else {
				logFn('image minified ' + outputFile);
				callback && callback(null, true);
			}
		});
	}

	/**
	 * 拷贝文件
	 */

	function copyFile(inputFile, outputFile, callback) {
		if (inputFile == outputFile) {
			callback && callback(null, true);
			return;
		}
		var exec = require('child_process').exec;
		exec('cp ' + inputFile + ' ' + outputFile, function(error, result) {
			if (error) {
				callback && console.error(error);
				return;
			} else {
				logFn('copying file ' + outputFile);
				callback && callback(null, true);
			}
		});
	}

	/**
	 *	文件处理(带拷贝)
	 */

	function _fileHandler(input, output, optCopy, callback) {
		var extname = path.extname(input).toLowerCase().substring(1),
			imageHandler = imageOptimizeHandlerConfig[extname];
		if (!imageHandler) {
			if (optCopy) {
				imageHandler = copyFile;
			} else {
				logFn('[Error] ' + input + ' is not a image file!');
				return;
			}
		}
		util.createDirectory(output);
		imageHandler(input, output, callback)

	}
	/**
	 *	文件处理
	 */

	function fileHandler(option) {
		if (option.log && typeof(option.log) === 'function') {
			logFn = option.log;
		}
		if (option.jpg) {
			if (option.jpg.progressive) {
				globalConfig.jpg.progressive = !! option.jpg.progressive;
			}
		}
		if (option.png) {
			var optimizeLevel = option.png.optimizeLevel;
			if ( !! optimizeLevel && typeof(optimizeLevel) == 'number' && optimizeLevel >= 0 && optimizeLevel <= 7) {
				globalConfig.png.optimizeLevel = optimizeLevel;
			}
		}
		_fileHandler(option.input, option.output, false, option.callback)
	}

	/*
	 *	目录处理
	 */

	function dirHandler(option) {
		if (option.log && typeof(option.log) === 'function') {
			logFn = option.log;
		}

		if (option.jpg) {
			if (option.jpg.progressive) {
				globalConfig.jpg.progressive = !! option.jpg.progressive;
			}
		}
		if (option.png) {
			var optimizeLevel = option.png.optimizeLevel;
			if ( !! optimizeLevel && typeof(optimizeLevel) == 'number' && optimizeLevel >= 0 && optimizeLevel <= 7) {
				globalConfig.png.optimizeLevel = optimizeLevel;
			}
		}

		function worker() {
			if (fs.existsSync(option.input)) {
				var files = util.traversalDirectory(option.input);
				if (files && files.length > 0) {
					async.eachLimit(files, 20, function(file, cb) {
						var outfile = file;
						if (option.input != option.output) {
							outfile = file.replace(option.input, option.output);
						}
						_fileHandler(file, outfile, true, cb);
					}, function(err) {
						option.callback(err)
					});
				}
			} else {
				logFn('[Error] ' + input + ' is not exist!');
			}
		}
		if (fs.existsSync(option.output) && option.input != option.output) {
			util.deleteDirectory(option.output, worker);
		} else {
			worker();
		}
	}

	/*
	 *	合并图片
	 */

	function sprite(fileMap, option, callback) {
		if(typeof option == 'function') {
			callback = option;
		}
		var sprite = require('redsprite');
		var path = require('path');
		var fs = require('fs');

		//合并图片
		sprite.create({
			filemap: fileMap,
			margin : option.margin || 0, //图片间隔，默认垂直排列
		}, function(res) {
			callback(resMap);
		});
	}

module.exports = {
	fileHandler: fileHandler,
	dirHandler: dirHandler,
	sprite: sprite
};