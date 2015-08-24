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
		var sprite = require('css-sprite'),
			path = require('path'),
			fs = require('fs'),
			fileList = [],
			resMap = {},
			fileSrc;
		for(fileSrc in fileMap) {
			if(fileMap.hasOwnProperty(fileSrc)) {
				fileList.push(fileSrc);
			}
		}
		async.eachSeries(fileList, function(file, eachCb) {
			//获取输出路径信息
			var pathObj = path.parse(file);
			if (pathObj && fs.existsSync(pathObj.dir)) {
					var ext = pathObj.ext.substr(1).toLowerCase(),
					//可选生成类型
					typeMap = {
						'png':'png',
						'jpg':'jpg',
						'jpeg':'jpg',
						'gif':'gif'
					},
					type = typeMap[ext],
					infoSrc = pathObj.dir + '/' + pathObj.name + '.js';
				//合并图片
				sprite.create({
					src : fileMap[file] || [], //小图标所在目录
					out : pathObj.dir, //大图标所在目录
					name : pathObj.name, //大图标名称
					style : infoSrc, //输出信息文件
					processor : 'js',
					margin : option.margin || 10, //图片间隔，默认垂直排列
					format : type ? type : 'png', //输出格式，默认为png 
					template : 'template.js' //模板位置
				}, function () {
					console.log(file + ' done');
					var info = require(infoSrc);
					fs.unlink(infoSrc, function(){
						resMap[file] = info.output;
						option.compress = option.compress || false; //默认不压缩
						if(!!option.compress) {
							//对图片进行压缩
							fileHandler({
								input: file,
								output: file,
								// jpg: {'progressive': false},
								png: {'optimizeLevel': option.level || 7},
								callback: function(){
									eachCb(null);
								}
							});
						} else {
							//不压缩
							eachCb(null);
						}
					})
				});
			} else {
				var err = '生成sprite图的文件路径不正确';
				console.log(err);
				eachCb(err);
			}
		},function(err) {
			callback(resMap);
		});
	}

module.exports = {
	fileHandler: fileHandler,
	dirHandler: dirHandler,
	sprite: sprite
};