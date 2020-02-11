(function($){
    $.parser.plugins.push("accountperiod");
    $.fn.accountperiod = function (options, param) {//定义扩展组件
        //当options为字符串时，说明执行的是该插件的方法。
        if (typeof options == "string") {
            return $.fn.combobox.apply(this, arguments);
        }
        options = options || {};
        //当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
        return this.each(function () {
            var jq = $(this);

            var opts = $.extend({}, $.fn.combobox.parseOptions(this), options);
            opts.icons=[{
                iconCls:'icon-clear',
                handler: function(e){
                    if(e==undefined) return;
                    $(e.data.target).accountperiod('setValue', '');
                }
            }];
            var newopts = $.extend(true, $.fn.accountperiod.defaults, opts);
            $.fn.combobox.call(jq, newopts);
            var html ='<div id="rpt_dateStart_wrapper" class="field"> <span class="field-label">开始日期</span> <span > <input  class="easyui-wrapper"  name="rpt_dateStart"  id="rpt_dateStart" /> </span> <div id="rpt_dateStart_tips" class="tips"></div> </div>';
            html +='<div id="rpt_dateEnd_wrapper" class="field"> <span class="field-label">结束日期</span> <span > <input  class="easyui-wrapper"  name="rpt_dateEnd"  id="rpt_dateEnd" /> </span> <div id="rpt_dateEnd_tips" class="tips"></div> </div>';
            html +='<div id="acc_cyc_def_no_wrapper" class="field"> <span class="field-label">会计周期</span> <span > <input  class="easyui-wrapper"  name="acc_cyc_def_no"  id="acc_cyc_def_no"  /> </span> <div id="acc_cyc_def_no_tips" class="tips"></div> </div>';
            html +='<div id="acc_cyc_info_no_wrapper" class="field"> <span class="field-label">日期区间</span> <span > <input  class="easyui-wrapper"  name="acc_cyc_info_no"  id="acc_cyc_info_no"  /> </span> <div id="acc_cyc_info_no_tips" class="tips"></div> </div>';
            html +='<div id="tx_date_wrapper" class="field"> <span class="field-label">报表日期</span> <span > <input  class="easyui-wrapper"  name="tx_date"  id="tx_date"  /> </span> <div id="tx_date_tips" class="tips"></div> </div>';


            $("#"+opts._id+"_wrapper").parent().after(html);
            $("#rpt_dateStart").datebox({
                editable:false,
                required:true,
                icons:[{
                    iconCls:'icon-clear',
                    handler: function(e){
                        if(e==undefined) return;
                        $(e.data.target).datebox('setValue', '');
                    }
                }]
            });
            $("#rpt_dateEnd").datebox({
                editable:false,
                required:true,
                icons:[{
                    iconCls:'icon-clear',
                    handler: function(e){
                        if(e==undefined) return;
                        $(e.data.target).datebox('setValue', '');
                    }
                }]
            });

            $("#acc_cyc_info_no").combogrid({
                panelHeight:185,
                panelWidth:450,
                editable:false,
                cascadeCheck:false,
                idField: 'no',
                textField: 'item_name',
                visiable:true,
                required:true,
                icons:[{
                    iconCls:'icon-clear',
                    handler: function(e){
                        if(e==undefined) return;
                        $(e.data.target).combogrid('setValues', '');
                    }
                }],
                pagination:true,
                pageNumber:1,
                pageSize:10,
                pageList:[10,15,20],
                columns:[[
                    {field:'begin_date',width:225,title:'开始日期',align:'left'},
                    {field:'end_date',width:225,title:'结束日期',align:'left'},
                ]]
            });
            var search ="<div style='background-color: #D4D4D4'>年度：<input id='cs_searchbox' style='width:100px' type='text'></input> <input id ='buttons' type='button' value='查询' ></div>";

            var panel = $("#acc_cyc_info_no").combogrid("panel");
            panel.before(search);

            var myDate = new Date();
            $("#cs_searchbox").numberbox({
                min:1,
                max:9999,
                icons:[{
                    iconCls:'icon-clear',
                    handler: function(e){
                        if(e==undefined) return;
                        $(e.data.target).numberbox('setValue', '');
                    }
                }],

                value:myDate.getFullYear()
            });

            $("#acc_cyc_def_no").combobox({
                url: "/system/select/options/accCycDefNo",
                queryParams:{accountPeriod:1},
                textField:"item_name",
                valueField:"item_no",
                panelHeight:'auto',
                readonly:false,
                disabled:false,
                required:true,
                type:'select',
                autoWidthNo:"Y",
                icons:[{
                    iconCls:'icon-clear',
                    handler: function(e){
                        if(e==undefined) return;
                        $(e.data.target).combobox('setValue', '');
                    }
                }],
                onLoadSuccess:function (data) {
                    // 赋初始值
                    $("#acc_cyc_def_no").combobox("setValue",data[0].item_no);
                }
            });
            $("#tx_date").datebox({
                editable:true,
                required:true,
                icons:[{
                    iconCls:'icon-clear',
                    handler: function(e){
                        if(e==undefined) return;
                        $(e.data.target).datebox('setValue', '');
                    }
                }]
            });
            $.ajax({
                url:"/system/select/options/getSystembyLeg",
                dataType:'json',
                type:'post',
                success:function(data){
                    $("#tx_date").datebox("setValue",data.sys_date);
                }
            });

        });
    };
})(jQuery);

