#安装指令
* npm install nej-minimage -g

#图片无损压缩指令
## 文件夹操作(非图片文件直接拷贝)
* nej-minimage ./test/directory/res/ -f
* nej-minimage -i=./test/directory/res/ -f
* nej-minimage -i=./test/directory/res/ -o=./test/directory/output/

## 文件操作 
* nej-minimage ./test/file/bd5.jpg -f
* nej-minimage -i=./test/file/bd5.jpg -f
* nej-minimage -i=./test/file/bd5.jpg -o=./test/file/bd5_1.jpg
