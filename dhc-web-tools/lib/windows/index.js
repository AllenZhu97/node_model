import router from '../router';
import {PAGE_TYPE,YN} from '../Constants';
import CommonExcelImport from './CommonExcelImport';
import message from '../message';
import gridMethod from '../datagrid';
export default {
    /**
     * 打开excel
     */
    openExcelImportWindow: function(instance, opts) {
        var parentCompent = instance;
        var title = opts.title;
        var width = opts.width;
        var height = opts.height;
        var gridid = opts.gridid;
        var patt = new RegExp(/^\d+%$/);

        // 默认和当前页面宽度高度相同
        if (width == undefined || width == null || width == '') {
            width = $(window).width() * 0.8;
            height = $(window).height() * 0.8;
        }
        // 如果设置了百分比
        if (patt.test(width) && patt.test(height)) {
            width = width.replace('%', '');
            height = height.replace('%', '');
            width = parseFloat(width) / 100;
            height = parseFloat(height) / 100;
            width = $(window).width() * width;
            height = $(window).height() * height;
        }
        if(opts.url) {
            // 走自己定义的页面
            router.getRouter(opts.url)( (ViewModel) => {
                var instanceName = ViewModel.default.name;
                var container = $('<div id="' + instanceName + '" class="open-win" style="width:100%;height:100%"/>');
                // 参数传递
                var data = $.extend({}, opts.params);
                //新打开的页面组件
                var modInstance = new ViewModel.default({ container, param: data });
                modInstance.namespace = instanceName;
                if (opts.beforeOpen) {
                    if (!opts.beforeOpen.apply(instance, opts)) {
                        return;
                    }
                }
                
                modInstance.parent = parentCompent;
                //设置不同的窗口id，防止因窗口名重复导致窗口覆盖
                var wiodowId = 'WindowModel'+instanceName;
                modInstance.param.windowID = wiodowId;
                $('body').append('<div id="'+wiodowId+'"></div>');
                var viewHtml = modInstance.getTemplate();
                var config = {
                    width: width,
                    height: height,
                    minimizable: false,
                    namespace: instanceName,
                    instance: modInstance,
                    inline: true,
                    content: container.append(viewHtml),
                    title: title,
                    onClose: function () {
                        $('#'+wiodowId).window('destroy');
                        //关闭后是否刷新父表格
                        var flag = opts.close_refresh;
                        if(flag || flag == undefined){
                            if (gridid != '' && gridid != null) {
                                gridMethod.gridSearch(parentCompent,{
                                    gridid: gridid,
                                    gridType:opts.gridType
                                });
                            }
                        }
                    },
                    modal: true
                };
                $('#'+wiodowId).window(config);
                modInstance.init();
            });
        } else {
            // 走公共的页面
            $('body').append('<div id=\'win999\' ></div>');
            // 参数传递
            var columnData = instance.getExcelColumn();
            var page = new CommonExcelImport({ params: { columns: columnData }});
            var config = {
                width: width,
                height: height,
                minimizable: false,
                namespace: 'CommonExcelImport',
                instance: page,
                content: page.getTemplate(),
                inline: false,
                title: title,
                onClose: function () {
                    if (gridid != '' && gridid != null) {
                        gridMethod.gridSearch(parentCompent,{
                            gridid: gridid
                        });
                    }
                    $('#win999').window('destroy');
                },
                modal: true
            };
            $('#win999').window(config);
            page.init();
        }
        
    },

    /**
	 * 表格工具栏中修改调用：打开修改页面，默认会将选择的行作为参数传给修改页面
	 * @param gridid
	 * @param url
	 * @return
	 */ 
    btn_openUpdateWindow: function(instance, options) {
        var obj = $.extend({}, options);
        var gridid = obj.gridid;
        var grid = instance.el[gridid];
        var row = null;
        var gridType = options.gridType;
        if (gridType == '1' || gridType == undefined) {//数据表格datagrid
            grid.datagrid('selectRow', options.rowindex);
            row = grid.datagrid('getSelected');
        } else {// type=2 树表格 
            grid.treegrid('select',options.rowindex);
            row = grid.treegrid('getSelections');
        }
        if (row == null) {
            message.error('请选择一条记录');
            return;
        }
        if (obj.before != undefined) {
            if (!obj.before(row, obj)) {
                return;
            }
        }
        obj.rowdata = row;
        this.openWindow(instance,obj);
    },
    /**
	 * 打开窗口
	 * 
	 * @param {*}
	 *            opts
	 */
    openWindow(instance,opts) {
        router.getRouter(opts.url)( (ViewModel) => {
            var instanceName = ViewModel.default.name;
            // 账户系统管理端特殊处理  add by zhuxingpeng 2020-02-06
            if (instance.sysType == 'AMS' && opts.notPage == 'Y') {
                var container = $('<div id="' + instanceName + '" style="width:100%;height:100%"/>');
            } else {
                var container = $('<div id="' + instanceName + '" class="open-win" style="width:100%;height:100%"/>');
            }
            // 参数传递
            var data = $.extend({
                page_type: opts.page_type,
                rowindex: opts.rowindex,
            }, opts.rowdata);

            // 数据表格操作列中有新增按钮时，希望把新增这一行的数据传到新增页面中
            if (opts.page_type == '1') {
                if(opts.rowindex !== undefined && opts.rowindex !== null && opts.rowindex !== '') {
                    var grid = instance.el[opts.gridid];
                    var row = null;
                    var gridType = opts.gridType;
                    if (gridType == '1' || gridType == undefined) {//数据表格datagrid
                        grid.datagrid('selectRow', opts.rowindex);
                        row = grid.datagrid('getSelected');
                    } else {// type=2 树表格 
                        grid.treegrid('select',opts.rowindex);
                        row = grid.treegrid('getSelections');
                    }
                    if (row == undefined) {
                        message.error('请选中一条记录');
                        return;
                    } else {
                        data = $.extend(row, data);
                    }
                }
            } else {
                //  打开窗口时页面类型为非新增页时,并从常量类中获取
                 //增加选中当前行
                 if (opts.rowindex != undefined) {
                	instance.el[opts.gridid].datagrid('selectRow', opts.rowindex);
                } 
                let row = instance.el[opts.gridid].datagrid('getSelected');
                if (row == undefined) {
                    message.error('请选中一条记录');
                    return;
                } else {
                    data = $.extend(row, data);
                }
            }

            var modInstance = null;
            //新打开的页面组件
            if(instance.sysType = 'AMS'){
                // 如果要账户系统管理端 传递两个参数， add by heyh 2019-12-24
                modInstance = new ViewModel.default(container, data);
            }else{
                modInstance = new ViewModel.default({ container, param: data });
            }
            modInstance.namespace = instanceName;
            if (opts.beforeOpen) {
                if (!opts.beforeOpen.apply(instance, opts)) {
                    return;
                }
            }
            var parentCompent = instance;
            modInstance.parent = parentCompent;
            var title = opts.title;
            var width = opts.width;
            var height = opts.height;
            var gridid = opts.gridid;
            var patt = new RegExp(/^\d+%$/);
            
            //设置不同的窗口id，防止因窗口名重复导致窗口覆盖
            var wiodowId = 'WindowModel'+instanceName;
            if(modInstance.param == undefined){// 处理modInstance.param==undefined 报错问题， add by chengmeng 2020-01-21
                modInstance.param = {};
            }
            modInstance.param.windowID = wiodowId;
            $('body').append('<div id="'+wiodowId+'"></div>');
            // 默认和当前页面宽度高度相同
            if (width == undefined || width == null || width == '') {
                width = $(window).width() * 0.8;
                height = $(window).height() * 0.8;
            }
            // 如果设置了百分比
            if (patt.test(width) && patt.test(height)) {
                width = width.replace('%', '');
                height = height.replace('%', '');
                width = parseFloat(width) / 100;
                height = parseFloat(height) / 100;
                width = $(window).width() * width;
                height = $(window).height() * height;
            }
            var viewHtml = modInstance.getTemplate();
            var config = {
                width: width,
                height: height,
                minimizable: false,
                namespace: instanceName,
                instance: modInstance,
                inline: true,
                content: container.append(viewHtml),
                title: title,
                onClose: function () {
                    $('#'+wiodowId).window('destroy');
                    //关闭后是否刷新父表格
                	var flag = opts.close_refresh;
                	if(flag || flag == undefined){
                		if (gridid != '' && gridid != null) {
                			gridMethod.gridSearch(parentCompent,{
                                gridid: gridid,
                                gridType:opts.gridType
                			});
                		}
                	}
                },
                modal: true
            };
            $('#'+wiodowId).window(config);
            var formObj = {};
            //调用双向绑定方法，初始化个性化页面data
            modInstance.data = modInstance.bindValue();     
            formObj.data = modInstance.data;
            
            //调用级联下拉框处理
            modInstance.cascadeValue();
            
            modInstance.init(formObj);
            modInstance.initForm(formObj);
        });
    }
}