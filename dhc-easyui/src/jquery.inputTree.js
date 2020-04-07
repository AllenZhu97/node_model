(function($){
    $.parser.plugins.push("inputtree");//注册扩展组件
    $.fn.inputtree = function (options, param) {//定义扩展组件
        //当options为字符串时，说明执行的是该插件的方法。
        if (typeof options == "string") { return $.fn.combotree.apply(this, arguments); }
        options = options || {
                iconWidth: 22,
                editable:false
            };
        //当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
        return this.each(function () {
            var jq = $(this);
            var opts = $.extend({}, $.fn.combotree.parseOptions(this), options);

            var url = "/system/common/action/searchTreeData";

            if(opts.disp_type=="3"){
                url = "/system/common/action/searchTreeData2";
            }
            if(opts.disp_type=="11"){
                url = "";
            }
            opts = $.extend({
                url: url,
                valueField: 'id',
                checkbox: false,
                multiple: false,
                editable: false,
                idField: "id",
                treeField:"name",
                parentField: "pid",
                textField: "name",
                panelWidth: 360,
                queryParams:{
                    tree_type:opts.tree_type,
                    isParentType:opts.isParentType,
                    isAsync:opts.isAsync
                }
            }, opts);
            // 覆盖jquery.element.js中的icons处理方法，解决inputtree清空控件值时，面板的选择值还存在问题
            opts.icons = [{
                    iconCls: 'icon-clear',
                    handler:function (e) {
                        if(e==undefined) return;
                        $(e.data.target).combotree('setValues', '');
                        $(e.data.target).combotree('clear');
                    }
                }];
            $.fn.combotree.call(jq, opts);
            
        });
    };
    $.extend($.fn.tree.methods,{
        getLevel:function(jq,target){
            var l = $(target).parentsUntil("ul.tree","ul");
            return l.length+1;
        }
    });
})(jQuery);

