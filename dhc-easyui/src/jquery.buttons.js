window.btnType={};
(function($){
    $.parser.plugins.push('buttons');//注册扩展组件
    $.fn.buttons = function(options){
        if (typeof options == 'string') { return $.fn.buttons.apply(this, arguments); }
        options = options || {};
        return this.each(function () {
            var jq = $(this);
            var id=jq.attr('id');
            var opts = $.extend({
                height:24,plain:true
            },  $.parser.parseOptions(this), options);
            if(id!=undefined){
                window.btnType[id]=opts.type;	
            }            
            var component = opts.instance;
            switch(opts.type){
                case 'OpenWindow':{////打开新增页面
                    opts = $.extend({handler:component.openWindow,type:'iframe',opentype:'window',text:'新增',title:'标题',iconCls:'icon-add'},opts);
                    break;
                }
                case 'OpenExcelImportWindow':{//打开excel导入页面
                	window.beanID=opts.beanID;//定义全局变量beanID记录实现excel接口validate方法的bean
                    opts = $.extend({handler:component.openExcelImportWindow,type:'iframe',opentype:'window',text:'新增',title:'标题',iconCls:'icon-add'},opts);
                    break;
                }
                case 'AddRow' :{//表格新增一行
                    opts = $.extend({handler:component.addRow,text:'增加一行',iconCls:'icon-add'},opts);
                    break;
                }             
                case 'AjaxFileUpload' :{
                    opts = $.extend({handler:component.ajaxFileUpload,text:'上传',iconCls:'icon-save'},opts);
                    break;
                }
                case 'BackButton' :{//返回按钮
                    opts = $.extend({handler:component.returnBack,text:'返回',iconCls:'icon-undo'},opts);
                    break;
                }
                case 'CloseButton' :{//关闭按钮
                    opts = $.extend({handler:component.closed,text:'关闭',iconCls:'icon-back'},opts);
                    break;
                }
                case 'Delete' :{//删除按钮
                    opts = $.extend({handler:component.gridDelete,text:'删除',iconCls:'icon-remove'},opts);
                    break;
                }
                case 'DeleteRow' :{//删除一行
                    opts = $.extend({handler:component.deleteRow,text:'删除一行',iconCls:'icon-remove'},opts);
                    break;
                }
                case 'Empty' :{//清空
                    opts = $.extend({handler:component.empty,text:'清空',iconCls:'icon-man'},opts);
                    break;
                }
                case 'ExportExcel' :{//导出excel
                    opts = $.extend({handler:component.exportExcel,text:'导出excel',iconCls:'icon-man'},opts);
                    break;
                }
                case 'ExcelTemplateDownload' :{//导出excel
                    opts = $.extend({handler:component.ExcelTemplateDownload,text:'导出excel',iconCls:'icon-man'},opts);
                    break;
                }
                case 'ModifyWindow':{//打开修改按钮
                    opts = $.extend({handler:component.btn_openUpdateWindow,type:'iframe',text:'修改',title:'标题',iconCls:'icon-edit'},opts);
                    break;
                }
                case 'printButton' :{//打印按钮
                    opts = $.extend({handler:component.printLodop,text:'打印',iconCls:'icon-print',title:'默认标题'},opts);
                    break;
                }
                case 'printVocherButton' :{//单据打印
                    opts = $.extend({handler:component.printVocher,text:'打印',iconCls:'icon-print',title:'默认标题',printId:id},opts);
                    break;
                }
                case 'QueryButton' :{//查询按钮
                    opts = $.extend({handler:component.gridSearch,text:'查询',iconCls:'icon-search',hotKey:'space'},opts);
                    break;
                }
                case 'SubmitButton':{//保存按钮
                    opts = $.extend({handler:component.submitForm,text:'保存',iconCls:'icon-save',submitType:'1',formID:'form'},opts);
                    break;
                }
                case 'TempSaveButton':{//暂存按钮
                    opts = $.extend({handler:component.tempSaveForm,text:'暂存',iconCls:'icon-save',formID:'form'},opts);
                    break;
                } 
                case 'ClearTemp':{//清除暂存的数据
                    opts = $.extend({handler:component.clearTempSave,text:'清除暂存',iconCls:'icon-remove',formID:'form'},opts);
                    break;
                }
                case 'ToolItem':{//普通按钮
                    opts = $.extend({handler:function(){},text:'按鈕',iconCls:'undo'},opts);
                    break;
                }
                case 'FileUpload':{//文件上传按钮
                    opts = $.extend({handler:component.fileUpload,text:'文件上传',iconCls:'icon-man'},opts);
                    break;
                }
                case 'fileDownLoad':{//文件下载
                    opts = $.extend({handler:component.fileDownLoad,text:'文件下载',iconCls:'icon-man'},opts);
                    break;
                }
                case 'UndoButton':{//撤销按钮
                    opts = $.extend({handler:function(){},text:'撤销',iconCls:'undo'},opts);
                    break;
                }
            }

            opts.onClick = function(){
            	// 先执行规则校验
                // 针对查询按钮进行校验
                let isValidate = true;
                if(opts.text.indexOf('查询') > -1) {
                    const inputs = $('.panel.layout-panel.layout-panel-north.layout-split-north div:not(:hidden) .textbox-value', '#' + opts.instance.namespace);
                    inputs.each((index,element) => {
                        const vali = $('#' + element.name, '#' + opts.instance.namespace).textbox('isValid');
                        if(!vali) {
                            isValidate = false;
                            return false;
                        }
                    });
                   
                }
                if (!isValidate){
                    opts.instance.warn('查询条件校验未通过');
                } else {
                    //如果按钮设置不可重复点击则点击一次后将改按钮禁用掉
                    if(!opts.repeat_click){
                        jq.linkbutton('disable');
                    }
                    if(opts.type=='ToolItem'||opts.type=='UndoButton'){
                        opts.handler.call(this,opts);
                    }else{
                        if(opts.handler!=undefined){
                            var btnInstance = this.data('instance');
                            opts.handler.call(btnInstance,opts);    
                        }
                    
                    }
                }
            };
            // if(opts.hotKey!=null&&opts.hotKey!=undefined){
            //     jq.attr('title','快捷方式[ '+opts.hotKey+' ]');
            //     opts.text += '[' + opts.hotKey + ']';
            //     if(opts.hotKey=='enter'){
            //         opts.hotKey='return';
            //     }
            //     //jQuery(document).bind('keydown', opts.hotKey,function (evt){ opts.handler.call(window,opts); return false; });
            // }
            $(jq).trigger('focus');
            var obj = $.extend({},opts);
            obj.width = null;obj.height = null;
            $.fn.linkbutton.call(jq,obj);
        });
    };
})(jQuery);