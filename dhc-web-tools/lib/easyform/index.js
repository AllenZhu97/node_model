import message from '../message';
export default {
    initForm: function (instance, formObj) {
        const form = $('form', instance.container);
        var page_type = instance.param.page_type;
        var namespace = instance.namespace;
        if (page_type == '1') {// 非新增交易
        	formObj.url = '/automake/controller/system/cache/fetchtemp?page_type=' + page_type + '&page_name=' + namespace;
        	formObj.page_type = '1';
            form.form('load', formObj);
        } else if (page_type == '2') {
        	formObj.page_type = '2';
            form.form('load',formObj);
        }
        var buttons = form.parent().children('.datagrid-toolbar').find('.easyui-buttons');
        buttons.each(function (index, element) {
            for (var key in window.btnType) {
                if (key == element.id) {
                    var type = window.btnType[key];
                    if (type == 'printButton') {
                        $('#' + element.id).linkbutton('disable');
                        break;
                    }
                    if ((type == 'TempSaveButton' || type == 'ClearTemp') && page_type == 2) {
                        $('#' + element.id).linkbutton('disable');
                        break;
                    }
                }
            }

        });
    },
    submitForm: function(instance, obj) {
        var formid = obj.formID;
		// 账户管理系统(AMS)拓展处理 add by zhuxingpeng 2020-01-04
        if(instance && instance.sysType=='AMS'){
            $('#' + formid, obj.instance.container).form('submit', {
                iframe: false,
                instance: obj.instance,
                onSubmit: obj.beforeSubmit
            });
        } else {
            if (obj.beforeSubmit != undefined && obj.beforeSubmit != '') {
                if (obj.beforeSubmit.call(instance, obj) == false) return false;
            }
            if(obj.onSubmit != undefined && obj.onSubmit != '') {
                // $('#' + formid, obj.instance.container).form('submit', {
                //     iframe: false,
                //     instance: obj.instance,
                //     onSubmit: obj.onSubmit
                // });
                // $('#' + formid, obj.instance.container).submit();
                if(obj.onSubmit.call(instance, obj) == false) return false;
            }
            if (obj.ajaxSuccess != undefined && obj.ajaxSuccess != '') {
                if (obj.ajaxSuccess.call(instance, obj) == false) return false;
            }
        }  
    },
    /**
	 * 点击暂存按钮调用此方法
	 * 
	 * @param obj
	 */
    tempSaveForm: function(instance, obj) {
        var tempSaveData = {};
        const formMethod = this;
        var formid = obj.formID;
        var inputs = $('.textbox-value', $('#' + formid));
        var flag = false;
        inputs.each(function (index, element) {
            if (element.name != undefined && element.name != null) {
                if (element.value != '') {
                    tempSaveData[element.name] = element.value;
                    flag = true;
                }
            }
        });
        if (!flag) {
            message.error('请至少输入一个表单项', '错误提示');
            return;
        } else {
            $.ajax({
                url: '/automake/controller/system/cache/tempSave',
                data: {
                    page_type: this.param.page_type,
                    tempSave: JSON.stringify(tempSaveData),
                    page_name: this.namespace
                },
                type: 'post',
                async: false,
                success: function () {
                    message.success('暂存成功!');
                }
            });
        }
    },
    /**
	 * 点击清除缓存调用此方法
	 */
    clearTempSave: function(instance,options) {
        $.messager.confirm('清除提示', '您确定要清除缓存中的数据吗？', function (result) {
            if (result) {
                $.ajax({
                    url: '/automake/controller/system/cache/cleartemp',
                    data: { page_type: instance.param.page_type, page_name: instance.namespace },
                    type: 'post',
                    async: false,
                    success: function () {
                        instance.success('已清除暂存数据');
                        // 缓存清除之后删除前台页面中的数据
                        var inputs = $('.textbox-value', instance.container);
                        inputs.each(function (index, element) {
                            instance.executeMethod(element.name, 'setValue', '');
                            instance.executeMethod(element.name, 'setText', '');
                        });
                    }
                });
            }
        });
    }
}