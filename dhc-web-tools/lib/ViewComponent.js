/**
 * 全局对象提供公共方法
 */
import { transfer } from './databind';
import gridMethod from './datagrid';
import windowMethod from './windows';
import formMethod from './easyform';
import message from './message';
import printUtil from './printutil';
class ViewComponent {
  constructor(props) {
    //为了兼容之前的代码，保留一段时间
    const { container, param } = props;
    this.container = container;
    this.param = param;
    this.data = {};

    this.props = props || {};

  }
  success (msg) {
    message.success(msg);
  }
  info (msg) {
    message.info(msg);
  }
  warn (msg) {
    message.warning(msg);
  }
  error (msg) {
    message.error(msg);
  }
  /**
   * 表格查询方法
   * @param {*} options 
   */
  gridSearch (options) {
    gridMethod.gridSearch(this, options);
  }
  /**
   * 列表删除
   * @param options
   * @returns
   */
  gridDelete (options) {
    gridMethod.gridDelete(this, options);
  }
  /**
 * 打开EXcel导入页面
 */
  openExcelImportWindow (opts) {
    windowMethod.openExcelImportWindow(this, opts);
  }
  /**
 * 表格工具栏中修改调用：打开修改页面，默认会将选择的行作为参数传给修改页面
 * 
 * @param gridid
 * @param url
 * @return
 */
  btn_openUpdateWindow (options) {
    windowMethod.btn_openUpdateWindow(this, options);
  }
  /**
 * 打开窗口
 * 
 * @param {*} opts
 */
  openWindow (opts) {
    windowMethod.openWindow(this, opts);
  }
  initForm (formObj) {
    formMethod.initForm(this, formObj);
  }
  submitForm (obj) {
    formMethod.submitForm(this, obj);
  }
  /**
 * 点击暂存按钮调用此方法
 * 
 * @param obj
 */
  tempSaveForm (obj) {
    formMethod.tempSaveForm(this, obj);
  }
  /**
 * 点击清除缓存调用此方法
 */
  clearTempSave () {
    formMethod.clearTempSave(this);
  }
  /**
 * 点击模板下载按钮调用此方法
 */
  ExcelTemplateDownload (options) {
    // this.initExcelForm();
    // document.getElementsByName('tab_name')[0].value = options.tab_name;
    // document.getElementsByName('file_name')[0].value = options.file_name;

    // var columns = this.getExcelColumn()[0];
    // var temp = [];
    // for (var i = 0; i < columns.length; i++) {
    //     temp.push({ tab_name: columns[i].tab_name, field: columns[i].field, title: columns[i].title });
    // }
    // document.getElementsByName('export_columns')[0].value = JSON.stringify(temp);
    // document.getElementById('exportExcelForm').action = '/zz' + options.url;
    // document.getElementById('exportExcelForm').method = 'post';
    // document.getElementById('exportExcelForm').submit();
    var exportExcel;
    if ($("#exportExcelForm").length != 0) {
      $("#exportExcelForm").remove();
    }
    exportExcel = $("<form id='exportExcelForm' action=''></form>").appendTo("body");

    if (options.before) {
      if (!options.before(options)) {
        return;
      }
    }
    for (var key in options.item) {
      exportExcel.append($("<input></input>").attr("type", "hidden")
        .attr("name", key).attr("value", options.item[key]));
    }

    var paramJSON = this.parseUrl(options.url);
    for (var key in paramJSON) {
      $("<input type='hidden' name='" + key + "' value='" + paramJSON[key] + "'/>").appendTo($("#exportExcelForm"));
    }
    var qsLoc = options.url.indexOf('?');
    var submitUrl;
    if (qsLoc > -1) {
      submitUrl = options.url.substring(0, qsLoc);
    }else{
      submitUrl = options.url;
    }
    document.getElementById('exportExcelForm').action = 'zz' + submitUrl;
    document.getElementById('exportExcelForm').method = "post";
    document.getElementById('exportExcelForm').submit();
    document.getElementById('exportExcelForm').innerHTML = '';

  }


	/**
     * 有些功能从总账迁移减少代码
     * @param {*} imgTypeArray 
     * @param {*} handlerNameArray 
     * @param {*} args 
     * @param {*} grayYn Y代表需要置灰得按钮
     */
  formatOperColumn (imgTypeArray, handlerNameArray, args, gridid, grayYn) {
    var imgButtionStr = '';
    var title = '';
    var icon = '';
    let argsArr = '';
    // args为数组时也可以
    if(Array.isArray(args)) {
      args.forEach(element => {
        argsArr += `"${element}",`
      });
      argsArr = argsArr.substring(0, argsArr.length -1);
    } else if(typeof args == 'string' || typeof args == 'number'){
      argsArr = args;
    }
    var handlerName = '';
    for (var i = 0; i < imgTypeArray.length; i++) {
      handlerName = handlerNameArray[i];
      switch (imgTypeArray[i]) {
        case 'update':
          icon = 'icon-edit';
          title = '修改';
          break;
        case 'cancle':
          icon = 'icon-undo';
          title = '撤销';
          break;
        case 'search':
          icon = 'icon-search';
          title = '查看';
          break;
        case 'delete':
          icon = 'icon-clear';
          title = '删除';
          break;
        case 'remove':
          icon = 'icon-cancel';
          title = '移除';
          break;
        case 'copy':
          icon = 'am-icon-copy';
          title = '复制';
          break;
        case 'publish':
          icon = 'icon-ok';
          title = '发布';
          break;  
        case 'add':
          icon = 'icon-add';
          title = '新增';
          break;
        case 'recover':
          icon = 'icon-redo';
          title = '恢复';
          break;
        case 'check':
          icon = 'man.png';
          title = '复核';
          break;
        case 'import':
          icon = 'page_white_go.png';
          title = '导入';
          break;
        case 'searchReoprtStyle':
          icon = 'icon-search';
          title = '查看表样';
          break;
        case 'searchTable':
          icon = 'icon-search';
          title = '查看报表';
          break;
        case 'choose':
          icon = 'icon-add';
          title = '选择';
          break;
        case 'reChoose':
          icon = 'icon-add';
          title = '重选';
          break;  
        case 'searchReportAgjustFL':
          icon = 'icon-search';
          title = '查看分录';
          break;
        case 'openVoucherInfo':
          icon = 'icon-edit';
          title = '补充信息';
          break;
        case 'cancleAccount':
          icon = 'icon-edit';
          title = '销户';
          break;
        case 'nonUse':
          icon = 'icon-lock';
          title = '停用';
          break;  
        case 'print':
          icon = 'icon-search';
          title = '打印';
          break;
        case 'confirm':
          icon = 'icon-ok';
          title = '确定';
          break;
        case 'save':
          icon = 'icon-ok';
          title = '保存';
          break;
        case 'submit':
          icon = 'icon-ok';
          title = '提交';
          break;
        case 'searchInfo':
          icon = 'icon-search';
          title = '详情';
          break;
        case 'recoverInfo':
          icon = 'icon-ok';
          title = '恢复发送';
          break;
        case 'cancleInfo':
          icon = 'undo.png';
          title = '取消发送';
          break;
        case 'sendInfo':
          icon = 'icon-ok';
          title = '立即发送';
          break;
        case 'expand':
          icon = 'blank';
          title = '》》》';
          break;
        case 'collapse':
          icon = 'blank';
          title = '《《《';
          break;
        case 'exportExcel':
          icon = 'icon-man';
          title = '接口导出';
          break;
        case 'testInterface':
          icon = 'icon-man';
          title = '接口测试';
          break;
        case 'turnUp':
          icon = 'am-icon-up';
          title = '上移';
          break;
        case 'turnDown':
          icon = 'am-icon-down';
          title = '下移';
          break;
        case 'editor':
          icon = 'icon-edit';
          title = '编辑';
          break;
        case 'AMT':
          icon = 'icon-edit';
          title = '发生额';
          break;
        case 'BAL':
          icon = 'icon-edit';
          title = '余额';
          break;  
      }
      if(grayYn != undefined){
        if(grayYn[i] == 'Y' ) {
          imgButtionStr += '<a style="cursor:pointer id="btn_' + handlerName + '">' +
          '	<span class="l-btn-left l-btn-icon-left" onclick=\'(function(){var instance = $("#' + gridid + '").data("instance");' +
          'instance.' + handlerName + '(' + args + ')})()\'>' +
          ' <span class="l-btn-text" style="cursor:pointer">' +
          title + '</span> <span class="l-btn-icon ' + icon + ' gray_img"></span></span></a>';
        } else {
          imgButtionStr += '<a style="cursor:pointer id="btn_' + handlerName + '">' +
          '	<span class="l-btn-left l-btn-icon-left" onclick=\'(function(){var instance = $("#' + gridid + '").data("instance");' +
          'instance.' + handlerName + '(' + args + ')})()\'>' +
          ' <span class="l-btn-text" style="cursor:pointer">' +
          title + '</span> <span class="l-btn-icon ' + icon + '"></span></span></a>';
        }
      } else {
      imgButtionStr += '<a style="cursor:pointer id="btn_' + handlerName + '">' +
        '	<span class="l-btn-left l-btn-icon-left" onclick=\'(function(){var instance = $("#' + gridid + '").data("instance");' +
        'instance.' + handlerName + '(' + argsArr + ')})()\'>' +
        ' <span class="l-btn-text" style="cursor:pointer">' +
        title + '</span> <span class="l-btn-icon ' + icon + '"></span></span></a>';
      }
    }
    return imgButtionStr;
  }


  /**
   * 將url?key1=value2&key2=value2&key3=value3...解析成{key1=value2，key2=value2...}
   */
  parseUrl (url) {
    var param = {};
    if (url.indexOf('?') > -1) {
      var qsLoc = url.indexOf('?');
      var queryStr = url.substring(qsLoc + 1);
      url = url.substring(0, qsLoc);
      var tempUrl = queryStr.split('&');
      for (var index = 0; index < tempUrl.length; index++) {
        var equal = tempUrl[index].indexOf('=');
        var key = tempUrl[index].substring(0, equal);
        var value = tempUrl[index].substring(equal + 1);
        param[key] = value;
      }

    }
    return param;
  }

  initExcelForm () {
    if ($('#exportExcelForm').length == 0) {
      $('body').append('<form id=\'exportExcelForm\' action=\'\'>' +
        '<input type="hidden" name="tab_name"/>' +
        '<input type="hidden" name="file_name"/>' +
        '<input type="hidden" name="sheet_name"/>' +
        '<input type="hidden" name="export_columns"/>' +
        '</form>');

    }
  }
  /**
 * 点击文件上传按钮调用此方法
 */
  fileUpload (options) {
    // var url=options.url;
    var fileIdsArr = [];
    var fileIds = options.fileIds;
    var uploadPath = options.uploadPath;
    if (fileIds.indexOf('@') == -1) {
      fileIdsArr.push(fileIds);
    } else {
      fileIdsArr = fileIds.split('@');
    }
    $.ajaxFileUpload({
      url: '/zz/im/dhc/sys/controller/system/upfile/fileUpload',
      secureuri: false, // 是否需要安全协议，一般设置为false
      fileElementId: fileIdsArr, // 存放上传文件的ID的数组
      dataType: 'json', // 返回值类型 一般设置为json
      type: 'post',
      data: { uploadPath: uploadPath },
      success (result)  // 服务器成功响应处理函数
      {
        $.messager.alert('文件上传提示', result.uploadMessage);
      },
      error: function (data, status, e)// 服务器响应失败处理函数
      {
        alert(e);
      }
    });
  }

  /**
 * 点击文件下载按钮调用此方法
 */
  fileDownLoad (options) {
    $('body').append('<form id=\'fileDownLoadForm\' action=\'\'>' +
      '<input type="hidden" name="file_name"/>' +
      '<input type="hidden" name="downloadPath"/>' +
      '</form>');
    document.getElementsByName('file_name')[0].value = options.file_name;
    document.getElementsByName('downloadPath')[0].value = options.downloadPath;
    document.getElementById('fileDownLoadForm').action = '/zz' + options.url;
    document.getElementById('fileDownLoadForm').method = 'post';
    document.getElementById('fileDownLoadForm').submit();
  }

  /**
 * 点击EXCEL导出按钮调用此方法
 */
  exportExcel (options) {
    // var queryCnd = $('.textbox-value', this.container);
    // var sheet = options.sheet_name;// sheet页的名称
    // var queryParam = '';// 导出时往后台传递的 查询的参数.
    // var namespace = this.namespace;
    // queryCnd.each(function (index, element) {
    //     var comp = '';
    //     for (var key in window[namespace].formelement_) {
    //         if (window[namespace].formelement_[key].name == element.name) {
    //             comp = window[namespace].formelement_[key].comp == undefined ? 'like' : window[namespace].formelement_[key].comp;
    //             break;
    //         }
    //     }
    //     if (element.value != '' && element.value != null && element.value != undefined) {
    //         if (index != queryCnd.length - 1) {
    //             queryParam += element.name + '=' + element.value + '@' + comp + '&';
    //         } else {
    //             queryParam += element.name + '=' + element.value + '@' + comp;
    //         }
    //     }
    // });
    // this.initExcelForm();

    // document.getElementsByName('tab_name')[0].value = options.tab_name;
    // document.getElementsByName('file_name')[0].value = options.file_name;
    // document.getElementsByName('sheet_name')[0].value = sheet;
    // var columns = this.getExcelColumn()[0];
    // var temp = [];
    // for (var i = 0; i < columns.length; i++) {
    //     temp.push({ tab_name: columns[i].tab_name, field: columns[i].field, title: columns[i].title });
    // }
    // document.getElementsByName('export_columns')[0].value = JSON.stringify(temp);
    // document.getElementById('exportExcelForm').action = '/zz' + options.url + '?' + queryParam;
    // document.getElementById('exportExcelForm').method = 'post';
    // document.getElementById('exportExcelForm').submit();
    var exportExcel;
    if ($("#exportExcelForm").length != 0) {
      $("#exportExcelForm").remove();
    }
    exportExcel = $("<form id='exportExcelForm' action=''></form>").appendTo("body");
    if (options.before) {
      if (!options.before(options)) {
        return;
      }
    }
    for (var key in options.item) {
      exportExcel.append($("<input></input>").attr("type", "hidden")
        .attr("name", key).attr("value", options.item[key]));
      //            $("<input type='hidden' name='" + key + "' value='" + options.item[key] + "'/>").
      //            		appendTo(exportExcel);
    }

    var submitUrl = options.url;
    var qsLoc = submitUrl.indexOf('?');
    if (qsLoc > -1) {
      // url中的参数放到form表单里，通过表单序列化对中文进行编码，解决传递过程中乱码问题   update by heyh 2018-09-28
      var paramJSON = parseUrl(options.url);
      for (var key in paramJSON) {
        exportExcel.append($("<input></input>").attr("type", "hidden")
          .attr("name", key).attr("value", paramJSON[key]));
        //            	$("<input type='hidden' name='" + key + "' value='" + paramJSON[key] + "'/>").appendTo($("#exportExcelForm"));
      }
      submitUrl = options.url.substring(0, qsLoc)
    }
    exportExcel.attr("action", 'zz' + submitUrl).attr("method", "post");
    //        document.getElementById('exportExcelForm').action = basePath +submitUrl;
    //        document.getElementById('exportExcelForm').method = "post";
    exportExcel.submit().remove();
  }
  /**
 * 点击关闭按钮调用
 * 
 * @param options
 */
  closed () {
    //获取当前window窗口id，并关闭窗口
    var wiodowId = this.param.windowID;
    $('#' + wiodowId).window('close');
  }
  /**
 * 点击打印按钮调用此方法
 */
  printLodop (opt) {
    printUtil.printLodop(this, opt);
  }

  // 组件的反射方法调用
  executeMethod (id) {
    var element = $('#' + id, this.container);
    var namespace = this.namespace;
    var args = [];
    args.push(arguments[1]);
    if (arguments.length > 2) {
      args.push(arguments[2]);
    }
    for (var i = 0; i < window[namespace].formelement_.length; i++) {
      if (window[namespace].formelement_[i].name == id) {
        var type = window[namespace].formelement_[i].type;
        if (type == 'number') {
          return $.fn.numberbox.apply(element, args);
        } else if (type == 'date') {
          return $.fn.datebox.apply(element, args);
        } else if (type == 'lookup') {
          if (arguments[0] == 'setValue' && arguments[1] == '') {
            return $.fn.combogrid.apply(element, ['setText', '']);
          }
          return $.fn.combogrid.apply(element, args);
        } else if (type == 'text') {
          return $.fn.textbox.apply(element, args);
        } else if (type == 'inputtree') {
          return $.fn.textbox.apply(element, args);
        } else if (type == 'autcomplete') {
          return $.fn.combobox.apply(element, args);
        } else if (type == 'select' || type=='selectAttr') { // 账户系统管理端拓展
          return $.fn.combobox.apply(element, args);
        } else if (type == 'newselect') {
            return $.fn.combobox.apply(element, args);
        }else if (type == 'inputtreegrid') {
            return $.fn.combotreegrid.apply(element, args);
        }
        break;
      }
    }
  }
  /**
 * 功能描述：双向绑定表单项
 * 
 * @returns data(页面项数据集合)
 */
  bindValue () {
    const instance = this;
    // 初始化数据
    var data = '{';
    var namespace = this.namespace;
    var formelement = window[namespace].formelement_;
    var flag = false;
    for (var i in formelement) {
      var elment = formelement[i];
      // 过滤掉name为空的属性 add by heyh 2019-12-28
      if(elment.name){
        if (flag) {
          data += ',';
        }
        data += '\'' + elment.name + '\':\'' + elment.value + '\'';
        flag = true;
      }
    }
    return transfer(eval('(' + data + '}' + ')'), instance);
  }
  /**
   * 功能描述：用于下拉选择级联
   */
  cascadeValue () {
    const instance = this;
    var namespace = this.namespace;
    var formelement = window[namespace].formelement_;
    if (formelement != undefined) {
      for (var i = 0; i < formelement.length; i++) {
        var obj = formelement[i];
        if (obj.type == 'select') {
          var options = $("#" + obj.name, '#' + namespace).combobox("options");
          if (options.cascadeName != undefined) {
            var cas_opt = $("#" + options.cascadeName, '#' + namespace).combobox("options");
            cas_opt.notify = obj.name;
            $("#" + obj.name, '#' + namespace).combobox("clear");
            $('#' + options.cascadeName, '#' + namespace).combobox({
              onSelect: function (record) {
                var currentSelect = $.data(this, 'combobox').options;
                var value = record[currentSelect.valueField];
                var opt = $("#" + currentSelect.notify).combobox("options");
                $.ajax({
                  type: "POST",
                  url: "/automake/controller/system/CacadeListController",
                  data: { cascadeSqlKey: cascadeSqlKey, table_name: opt.tab_name, col_name: opt._id, up_item_no: value },
                  dataType: 'json',
                  success: function (list) {
                    $("#" + currentSelect.notify).combobox("clear");
                    $("#" + currentSelect.notify).combobox("loadData", list);
                    if (list.length > 0) {
                      $("#" + currentSelect.notify).combobox("select", list[0][opt.valueField]);
                    }
                  }
                })
              }
            });
          }
        }
      }
    }
  }

  /**
   * 文件上传方法
   */
  ajaxFileUpload (opts) {
    $.ajaxFileUpload({
      url: opts.url,
      secureuri: false,
      fileElementId: opts.fileElementId,
      dataType: 'json',
      success: opts.success,
      error: opts.error
    });
  }
}
export default ViewComponent;