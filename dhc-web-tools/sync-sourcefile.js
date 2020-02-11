
var projectPath = "/Users/tianming/mycode/dhc-zz-web";//业务项目路径
var modulesPath = "/node_modules/dhc-web-tools/lib/";
var easyuiPath = __dirname + "/lib/";//源文件目录


var exec = require('child_process').exec;
var chokidar = require('chokidar');
var fs = require('fs');
var path = require('path');

function copy(src) {
  var fileName = projectPath + modulesPath + src.replace(easyuiPath,"");
  console.log("同步文件："+fileName);
  fs.writeFileSync(fileName, fs.readFileSync(src));
}

function mkdir(dirpath,dirname){
      //判断是否是第一次调用  
      if(typeof dirname === "undefined"){   
        if(fs.existsSync(dirpath)){  
            return;  
        }else{  
            mkdir(dirpath,path.dirname(dirpath));  
        }
      }else{  
          //判断第二个参数是否正常，避免调用时传入错误参数  
          if(dirname !== path.dirname(dirpath)){   
              mkdir(dirpath);  
              return;  
          }  
          if(fs.existsSync(dirname)){  
              fs.mkdirSync(dirpath)  
          }else{  
              mkdir(dirname,path.dirname(dirname));  
              fs.mkdirSync(dirpath);  
          }  
      }  
}

var watcher = null
  // 文件新增时
  function addFileListener(path_) {
    if(path_.indexOf(".js")>-1){
      copy(path_);
    }
  }
  function addDirecotryListener(path) {

      path = projectPath + modulesPath + path.replace(easyuiPath,"");
      console.log('Directory', path, 'has been added')
      mkdir(path);
    
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
        .on('add', addFileListener)
        .on('addDir', addDirecotryListener)
        .on('change', fileChangeListener)
        .on('ready', function () {
            console.info('Initial scan complete. Ready for changes.');
            ready = true
        })
 