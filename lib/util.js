var fs = require('fs');
/*
 *	删除目录
 */

function deleteDirectory(directory, callback) {
	var exec = require('child_process').exec;
	exec('rm -rf ' + directory, function(error, result) {
		if (error) {
			console.error(error);
			return
		} else {
			callback(null, true);
		}
	});
}
/*
 *	创建不存在的目录
 */

function createDirectory(filename) {
	var parts = filename.split('/'),
		tmp_path;
	for (var i = 2; i < parts.length; i++) {
		tmp_path = parts.slice(0, i).join('/');
		if (!fs.existsSync(tmp_path)) {
			console.log('create directory:' + tmp_path);
			fs.mkdirSync(tmp_path, '0777')
		}
	}
}

/**
 * 遍历当前目录
 */

function traversalDirectory(currentPath) {
	var resultList = [];
	function traversal(currentPath) {
		var files = fs.readdirSync(currentPath),
			currentFile, stats, extname;
		for (var i in files) {
			currentFile = currentPath + '/' + files[i];
			stats = fs.statSync(currentFile);
			if (stats.isFile()) {
				resultList.push(currentFile);
			} else if (stats.isDirectory()) {
				arguments.callee(currentFile);
			}
		}
	}
	traversal(currentPath);
	return resultList;
};

module.exports = {
	deleteDirectory: deleteDirectory,
	createDirectory: createDirectory,
	traversalDirectory: traversalDirectory
}