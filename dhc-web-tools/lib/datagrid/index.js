import message from '../message';
export default {
    /**
	 * 表格查询，查询按钮默认调用此方法
	 */
    gridSearch: function (instance,options) {
        var gridid = '';
        if (typeof options == 'string') {
            gridid = options;
        } else {
            gridid = options.gridid;
        }
        var paramArray = this.getSearchParam(instance);
        var gridType = void 0;
        var gridArray = window.gridArray || {};  // 兼容账户系统没有定义gridArray的问题
        if(gridArray){
            gridType = gridArray[gridid];
        } else {
            gridType = options.gridType;
        }
        if (gridType == '1' || gridType == undefined) {
            options = instance.el[gridid].datagrid('options');
            var temp = $.extend(options.queryParams, paramArray);
            var flag = false;
            for (var index in paramArray) {
                if (paramArray[index] != null) {
                    flag = true;
                }
            }
            temp = $.extend(options.queryParams, paramArray);
            if (flag) {
                instance.el[gridid].datagrid('load', temp);
            } else {
                options.queryParams.sort = window.sort;
                options.queryParams.order = window.order;
                temp = $.extend(options.queryParams, paramArray);
                instance.el[gridid].datagrid('options').sortName = null;
                instance.el[gridid].datagrid('reload', temp);
                $('.datagrid-sort-asc').removeClass('datagrid-sort-asc');
                $('.datagrid-sort-desc').removeClass('datagrid-sort-desc');
            }
        } else {
            instance.el[gridid].treegrid('load', paramArray);
        }
    },
    /**
	 * 取得页面查询参数
	 * 
	 * @returns {___anonymous5064_5065}
	 */
    getSearchParam: function (instance) {
        var temp = {};
        var comps = '';
        var namespace = instance.namespace;
        var inputs = $('.textbox-value', '#' + namespace);// 如果不再使用这种选择器请通知我一声-TaoJinSong
        // @TianMing
        inputs.each(function (index, element) {
            if (temp[element.name] == undefined) {
                temp[element.name] = null;
            }

            if (element.value != '') {
                if (temp[element.name] != undefined
                    && temp[element.name] != null) {
                    temp[element.name] += ',' + element.value;
                } else {
                    temp[element.name] = element.value;
                }
                for (var key in window[namespace].formelement_) {
                    if (window[namespace].formelement_[key].name == element.name) {
                        comps += element.name + '@' + window[namespace].formelement_[key].comp
                            + ',';
                        break;
                    }
                }
                temp['comps'] = comps;
            }
        });
        return temp;
    },
    gridDelete: function(instance, options) {
        const gridMethod = this;
    	var gridid = options.gridid;
    	var url = options.url;
    	var row = instance.el[gridid].datagrid('getSelected');
    	if(row == null) {
    		message.error('提示','请选择要删除的记录');
    		return ;
    	}
    	url += "?";
    	for(var key in row){
    		url += key + "=" + row[key] + "&";
    	}
    	
    	$.ajax({
    		url: url,
    		dataType: 'json',
    		success: function(){
    		    gridMethod.gridSearch(instance, options.gridid);
    		}
    	})
    }
}