
var projectPath = "/Users/tianming/mycode/dhc-zz-web";//业务项目路径

var easyuiPath = __dirname + "/src/";
var exec = require('child_process').exec;

var chokidar = require('chokidar');
var fs = require('fs');
 
function copy(src) {
  var fileName = projectPath + "/node_modules/dhc-easyui/src/" + src.replace(easyuiPath,"");
  console.log("同步文件："+fileName);
  fs.writeFileSync(fileName, fs.readFileSync(src));
}

var watcher = null
  // 文件新增时
  function addFileListener(path_) {
    if (ready) {
      console.log('File', path_, 'has been added')
    }
  }
  function addDirecotryListener(path) {
    if (ready) {
      console.log('Directory', path, 'has been added')
    }
  }

  // 文件内容改变时
  function fileChangeListener(path_) {
      if(path_.indexOf(".js")>-1){
        copy(path_);
      }
  }

  // 删除文件时，需要把文件里所有的用例删掉
  function fileRemovedListener(path_) {
      console.log('File', path_, 'has been removed')
  }

  // 删除目录时
  function directoryRemovedListener(path) {
    log.info('Directory', path, 'has been removed')
  }

  if (!watcher) {
    console.log("listen on " + easyuiPath);
    watcher = chokidar.watch(easyuiPath)
  }
  watcher
        // .on('add', addFileListener)
        // .on('addDir', addDirecotryListener)
        .on('change', fileChangeListener)
        .on('ready', function () {
            console.info('Initial scan complete. Ready for changes.');
            ready = true
        })
 