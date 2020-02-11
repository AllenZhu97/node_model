import celleditor from './celleditor'
(function ($) {
    $.parser.plugins.push('datagridex');//注册扩展组件
    $.fn.datagridex = function (options, param) {
        if (typeof options == 'string') {
            var method = $.fn.datagridex.methods[options];
            if (method) {
                return method(this, param);
            }
            return $.fn.executeMethod.apply(this, param);
        }
        options = options || {};
        return this.each(function () {
            var jq = $(this);
            var state = $.data(this, 'datagridex');
            if(state) {
                $.extend(state.options, options);
            } else {
                $.data(this, 'datagridex', {
                    options: $.extend({}, $.fn.datagridex.defaults, $.fn.datagridex.parseOptions(this), options)
                });
            }
            var opts = $.extend({
                disabled: false, editable: true, readonly: false, disp_type: 1,
                height: 22
            }, $.parser.parseOptions(this), options);
            const pageInstance = jq.data('instance');
            initGrid(jq, opts, pageInstance);
        });
    };

    $.fn.datagridex.parseOptions = function(target){
        return $.extend({});
    };

    $.fn.datagridex.defaults = {};

    var gridArray = {};
    function initGrid(jq, attr,pageInstance) {
        var namespace = pageInstance.namespace;
        attr = $.extend({
            gridType: '1',
            pageSize: 10,
            width: '100%',
            height: '300',
            autoRowHeight: false,
            check: false,
            delayLoad: false,
            striped: false,
            fit: true,
            pagination: false,
            border: true,
            singleSelect: false,
            fitColumns: true
        }, attr);

        if(attr.columns==undefined){
            // html定义grid列时，获取相关列信息 add by heyh 20191206
            attr.columns = getColumns(jq);
        }

        var sortColumns = [];
        window.sort = '';
        window.order = '';
        var edit = false;
        var id = jq.attr('id');
        if (attr.columns != null) {// 列信息
            var cols = attr.columns[0];
            for (var i = 0; i < cols.length; i++) {
                var param = {
                    column: cols[i],
                    gridid: id,
                    gridType: attr.gridType
                };

                var temp = initGridColumn(pageInstance,param,namespace);
                if (!edit) {
                    edit = temp;
                }
                cols[i] = param.column;
                if (cols[i].sortable == true && cols[i].default_sort == true) {
                    sortColumns.push(cols[i]);
                }
            }
            if (attr.check) {
                cols.splice(0, 0, {
                    field: 'ck',
                    checkbox: true
                });
            }

        }
        // 将需要order by字段进行排序
        for (var i = 0; i < sortColumns.length - 1; i++) {
            for (var j = 0; j < sortColumns.length - 1 - i; j++) {
                if (sortColumns[j].order_seq > sortColumns[j + 1].order_seq) {
                    var tmp = sortColumns[j];
                    sortColumns[j] = sortColumns[j + 1];
                    sortColumns[j + 1] = tmp;
                }
            }
        }
        for (var i = 0; i < sortColumns.length; i++) {
            if (i == sortColumns.length - 1) {
                window.sort += sortColumns[i].field;
                window.order += sortColumns[i].order;
            } else {
                window.sort += sortColumns[i].field + ',';
                window.order += sortColumns[i].order + ',';
            }
        }
        gridArray[id] = attr.gridType;
        window.gridArray = gridArray;
        // var inputInfo = {
        //     name : jq.attr('id'),
        //     type : attr.gridType
        // };
        // if (attr.gridType == '1') {
        //     window.formelement_.push(inputInfo);
        // }
        if ((attr.height + '').indexOf('%') == -1) {
            attr.height = parseInt(attr.height);
        }
        if ((attr.width + '').indexOf('%') == -1) {
            attr.width = parseInt(attr.width);
        }
        if (attr.url != null && attr.url != '' && attr.url != undefined) {
            attr.url = '/' + attr.url;
        }
        var queryParams = {};
        queryParams.sort = window.sort;
        queryParams.order = window.order;
        // for (var i = 0; i < window.formelement_.length; i++) {
        //     var element = document.getElementById(window.formelement_[i].name);
        //     if (element != null) {
        //         queryParams[window.formelement_[i].name] = element.value;
        //     }
        // }
        attr.queryParams = queryParams;


        if (attr.gridType == '1' || attr.gridType == undefined) {
            $('#' + id,"#"+namespace).datagrid(attr);
        } else if (attr.gridType == '2') {
            attr.treeField = attr.textField;
            $('#' + id,"#"+namespace).treegrid(attr);
        }
        if (edit) {
            $('#' + id,"#"+namespace).datagrid('enableCellEditing');
            //celleditor.enableCellEditing($('#' + id));
        }

        // ---------add by zongzhenyang 20161228 解决可编辑表格失去焦点结束编辑问题
        $('body').on('blur', '.datagrid-editable-input', function () {
            var info=$("#"+id, "#"+namespace).datagrid("cell");
            if(info){
                $("#"+id, "#"+namespace).datagrid("endEdit",info.index);
            }
        });
    }
    function initGridColumn(target,param,namespace) {
        // 默认值
        var config = param.column;
        if (config.field.indexOf('optCol')>=0) {
            config.title = '操作';
            if(param.column.field_name!=''){
                config.title = param.column.field_name;
            }
            config.align = 'center';
            config.formatter = function (value, row, index) {
                var buttons = this.buttons;
                var html = '';
                var onBeforeDisplay = this.onBeforeDisplay;
                var flag = true;
                //若无该方法则跳过
                if( onBeforeDisplay != undefined && target[onBeforeDisplay] != ""  ){
                    flag = target[onBeforeDisplay].call(this,row);
                }
                //不显示操作列
                if(!flag){
                    html += '<span>-----</span>'
                } else {
                    for (var i = 0; i < buttons.length; i++) {
                        var button = buttons[i];
                        var type = button.type;
                        var str = '';
                        var show = '';
                        var style = '';
                        var functionName = 'openWindow';
                        if(param.gridType=='2'){
                            var opts = $('#' + param.gridid,"#"+namespace).treegrid('options');
                            var idField = opts['idField'];
                            index = row[idField];
                        }
                        if(type=='OpenWindow'){//打开窗口
                            // 如果状态为删除则打开窗口不显示
                            if(row.sts_val == '*'){
                                show += ';display:none';
                            }
                            if (button.page_type != '1') {
                                functionName = 'btn_openUpdateWindow';
                            }
                            if (!button.text) {
                                button.text = '&nbsp;';
                            }
                            str +='instance.' + functionName + '('
                                + '{rowindex:"' + index + '"'
                                +',page_type:"' + button.page_type
                                +'",gridid:"' + param.gridid
                                // notPage,支持不分页表格因布局而出现的数据展示不完全问题
                                +'",notPage:"' + button.notPage // 账户系统管理端特殊处理  add by zhuxingpeng 2020-02-06
                                +'",gridType:"' + param.gridType
                                +'",url:"' + button.url
                                +'",title:"' + button.title
                                +'",close_refresh:' + button.close_refresh
                                +',beforeOpen:' + (button.beforeOpen != undefined ? 'instance.'+button.beforeOpen : null)
                                +'})';
                        }else if(type=='ToolItem'){//按钮类型为ToolItem
                            //由于生成列表查询翻译方式默认采用1，则这里的字段值放在 '字段名_val'中，若翻译方式改变，请修改以下获取方式
                            if(button.us_yn != (row[button.name+'_val'] || row[button.name])){
                                show += ';display:none';
                            }
                            if(button.us_yn == 'N'){
                                style += 'style="background:#aaaaaa;color:#FFFFFF;box-shadow:#999 3px 2px 3px"';
                            }else if(button.us_yn == 'Y'){
                                style += 'style="background:#00b8ec;color:#FFFFFF;box-shadow:#999 3px 2px 3px"';
                            }else if(button.us_yn == 'I'){
                                style += 'style="background:#00ff3b;color:#FFFFFF;box-shadow:#999 3px 2px 3px"';
                            }else if(button.us_yn == 'E'){
                                style += 'style="background:#ff5400;color:#FFFFFF;box-shadow:#999 3px 2px 3px"';
                            }else if(button.us_yn == 'W'){
                                style += 'style="background:#ff9d00;color:#FFFFFF;box-shadow:#999 3px 2px 3px"';
                            }else if(button.us_yn == 'O'){
                                style += 'style="background:#ffff00;color:#FFFFFF;box-shadow:#999 3px 2px 3px"';
                            }

                            // 状态为正常，且按钮类型包括‘恢复’则不显示
                            if(row.sts_val == '1' && button.text.indexOf('恢复') > -1){
                                show += ';display:none';
                            }
                            functionName = button.handler;
                            if(button.handler!='' && button.handler!= undefined){
                                str +='instance.' + functionName + '('
                                + '{rowindex:"' + index + '"'
                                +',id:"'+button.id
                                +'",name:"'+button.name
                                +'",us_yn:"'+button.us_yn+'"'
                                +'})';
                            }
                            
                        }else if(type=='DeleteRow'){//删除行按钮
                            // 如果状态为删除则删除按钮不显示
                            if(row.sts_val == '*'){
                                show += ';display:none';
                            }
                            if(button.handler!='' && button.handler!= undefined){
                                functionName = button.handler;
                                str +='instance.' + functionName + '('
                                    + '{rowindex:"' + index + '"'
                                    +',id:"'+button.id
                                    +'",gridid:"'+button.gridid+'"'
                                    +'})';
                            }
                        }
                        //修改按钮置于文字span内，解决触发图标方法不触发问题
                        html += '<a style="cursor:pointer'+show+'"  id="' + button.id + '">'
                            + '	<span class="l-btn-left l-btn-icon-left" '+style+'> '
                            + '		<span class="l-btn-text" onclick=\'(function(){ var instance = $("#' + param.gridid + '","#'+namespace+'").data("instance");'
                            + str
                            + '})()\'>'
                            + button.text+ '&nbsp;&nbsp;'
                            + '&nbsp;&nbsp;'
                            + '<span class="l-btn-icon ' + button.iconCls + '">&nbsp;</span>'
                            +'</span></span></a>';
                    }
                }
                return html;
            };
            return false;
        }

        config = $.extend({
            width: 100,
            align: 'left',
            enabledEdit: false,
            edit_type: 'string',
            title: '中文列名'
        }, config);
        var flag = false;
        var width = config.width;
        config.halign = 'center';
        if ((typeof width == 'string') && width.indexOf('%') == -1) {
            config.width = parseInt(width);
        }
        if (config.formatter == undefined) {
            config.formatter = function (value, row) {
                var colname = config.field;

                if (row.isFooter) {
                    if (this.sum || value == '<b>合计:</b>') {
                        return value;
                    } else {
                        return '';
                    }
                }

                if (row[colname + '_zh'] == undefined) {
                    if (config.edit_type == 'money') {
                        var precision = 2;
                        if (config.precision != undefined) {
                            precision = config.precision;
                        }
                        value = formatNumber(value, precision, 1);
                    } else if (config.edit_type == 'rate') {
                        var precision = 6;
                        if (config.precision != undefined) {
                            precision = config.precision;
                        }
                        value = formatNumber(value, precision, 0);
                    } else if (config.edit_type == 'date' && value == '0') {
                        value = '---';
                    }
                    return value;
                } else {
                    return row[colname + '_zh'];
                }
            };
        }
        if (config.enabledEdit) {
            flag = true;
            var edit_type = config.edit_type;
            config.styler = function () {
                return 'background-color:#E6E6FA;';
            };
            if ('string' == edit_type) {
                config.editor = {
                    type: 'text'
                };
            } else if ('money' == edit_type) {// 金额
                config.type = 'float';
                var precision = 2;
                if (config.precision != undefined) {
                    precision = config.precision;
                }
                config.editor = {
                    type: 'numberbox',
                    options: {
                        precision: precision
                    }
                };
            } else if ('rate' == edit_type) {// 利率
                config.type = 'float';
                var precision = 6;
                if (config.precision != undefined) {
                    precision = config.precision;
                }
                config.editor = {
                    type: 'numberbox',
                    options: {
                        precision: precision
                    }
                };
            } else if ('number' == edit_type) {// 数字
                config.type = 'float';
                config.editor = {
                    type: 'numberbox'
                };
            } else if ('date' == edit_type) {// 日期
                config.format = 'yyyyMMdd';
                config.type = 'date';
                config.editor = {
                    type: 'datebox'
                };
            } else if ('lookup' == edit_type) {// 放大镜
                config.type = 'lookup';
                config.editor = {
                    type: 'lookup'
                };
            } else if ('checkbox' == edit_type) {// 复选框
                config.type = 'checkbox';
                config.editor = {
                    type: 'checkbox',
                    options: {
                        on: 'Y',
                        off: 'N'
                    }
                };
            } else if ('select' == edit_type) {// 下拉选择
                // 到后台请求tbl表的缓存
                var data = getCacheData(config.tab_name, config.field, config.sqlKey);
                if (data == undefined || data == null) {
                    data = new Array();
                }
                config.editor = { type: 'combobox', options: { data: data, valueField: 'item_no', textField: 'item_name', editable: false } };
                config.formatter = function (value, rowdata, index) {
                    var column = this;
                    var options = data;
                    if (config.getSelectDataByJs != undefined) {
                        options = config.getSelectDataByJs(index);
                    }
                    for (var i = 0; i < options.length; i++) {
                        var opt = options[i];
                        if (opt.item_no == value) {
                            return opt.item_name;
                        }
                    }
                }

            }
        }
        param.column = config;
        return flag;
    }

    /**
    * 获取tbl表中的数据
     */
    function getCacheData(tableName, colName, sqlKey) {
        let cacheData = null;
        $.ajax({
            url:'/system/select/options/load',
            type: 'post',
            data: {tableName: tableName, colName: colName, sqlKey: sqlKey},
            dataType: 'json',
            async: false,
            success: function(data) {
                cacheData = data;
            },
            error: function(e) {
                console.log(e);
            }
        });
        return cacheData;
    }


    /**
    * 取得表格列
    * @param {*} jq
    */
    function getColumns(jq) {
        var frozenColumns = [];
        var columns = [];
        jq.children('thead').each(function () {
            var opt = $.parser.parseOptions(this, [{ frozen: 'boolean' }]);
            $(this).find('tr').each(function () {
                var cols = [];
                $(this).find('th').each(function () {
                    var th = $(this);
                    var instance = jq.data("instance");
                    this.instance = instance;//给datagrid设置instance
                    var col = $.extend({}, $.parser.parseOptions(this, [
                        'id', 'field', 'align', 'halign', 'order', 'width',
                        { sortable: 'boolean', checkbox: 'boolean', resizable: 'boolean', fixed: 'boolean' },
                        { rowspan: 'number', colspan: 'number' }
                    ]), {
                        title: (th.html() || undefined),
                        hidden: (th.attr('hidden') ? true : undefined),
                        formatter: (th.attr('formatter') ? eval(th.attr('formatter')) : undefined),
                        styler: (th.attr('styler') ? eval(th.attr('styler')) : undefined),
                        sorter: (th.attr('sorter') ? eval(th.attr('sorter')) : undefined)
                    });
                    if (col.width && String(col.width).indexOf('%') == -1) {
                        col.width = parseInt(col.width);
                    }

                    if (th.attr('editor')) {
                        var s = $.trim(th.attr('editor'));
                        if (s.substr(0, 1) == '{') {
                            col.editor = eval('(' + s + ')');
                        } else {
                            col.editor = s;
                        }
                    }

                    cols.push(col);
                });

                opt.frozen ? frozenColumns.push(cols) : columns.push(cols);
            });
        });
        // return [frozenColumns, columns];
        return columns;
    }
    /*
    将数值四舍五入后格式化.
    @param num 数值(Number或者String)
    @param cent 要保留的小数位(Number)
    @param isThousand 是否需要千分位 0:不需要,1:需要(数值类型);
    @return 格式的字符串,如'1,234,567.45'
    @type String
    */
    function formatNumber(num, cent, isThousand) {
        if (num == '' || num == undefined || num == null) {//检查传入数值为空、undefined或者null.
            num = '0';
        }
        num = num.toString();
        if (isNaN(num)) {//检查传入数值为数值类型.
            num = '0';
        }
        if (isNaN(cent)) {//确保传入小数位为数值型数值.
            cent = 0;
        }
        cent = parseInt(cent);
        cent = Math.abs(cent);//求出小数位数,确保为正整数.
        if (isNaN(isThousand)) {//确保传入是否需要千分位为数值类型.
            isThousand = 0;
        }
        isThousand = parseInt(isThousand);
        if (isThousand < 0) {
            isThousand = 0;
        }
        if (isThousand >= 1) {//确保传入的数值只为0或1
            isThousand = 1;
        }
        var sign = (num == (num = Math.abs(num)));//获取符号(正/负数)
        //Math.floor:返回小于等于其数值参数的最大整数
        num = Math.floor(num * Math.pow(10, cent) + 0.50000000001);//把指定的小数位先转换成整数.多余的小数位四舍五入.
        var cents = num % Math.pow(10, cent); //求出小数位数值.
        num = Math.floor(num / Math.pow(10, cent)).toString();//求出整数位数值.
        cents = cents.toString();//把小数位转换成字符串,以便求小数位长度.
        while (cents.length < cent) {//补足小数位到指定的位数.
            cents = '0' + cents;
        }
        if (isThousand == 0) {//不需要千分位符.
            return (((sign) ? '' : '-') + num + '.' + cents);
        }
        //对整数部分进行千分位格式化.
        for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
            num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
        }
        return (((sign) ? '' : '-') + num + '.' + cents);
    }


$.fn.datagridex.methods = {
    initGrid: function(jq, attr) {
        const pageInstance = jq.data('instance');
        return initGrid(jq, attr, pageInstance);
    }

}

})(jQuery);