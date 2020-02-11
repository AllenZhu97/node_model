var tree_manager = {};
(function($){
    $.parser.plugins.push('wrapper');//注册扩展组件

    $.fn.wrapper = function(options){
        if (typeof options == 'string') {
            if($.fn.wrapper.method[options]!=undefined){
                return $.fn.wrapper.method[options].apply(this,arguments);
            }
            //扩展wrapper，使得适应两个参数也使用三个参数，使得getValue，setValue都不报错
            if(arguments.length==1){
            	return this.data('instance').executeMethod(this[0].id,arguments[0]);
            }else {
            	return this.data('instance').executeMethod(this[0].id,arguments[0],arguments[1]);
            }
            //return $.fn.executeMethod.apply(this,arguments);
        }
        options = options || {};
        return this.each(function () {
            var jq = $(this);

            var instance = options.instance;//获取页面对象
            var namespace = instance.namespace;
            var option = {};
            if(typeof(instance.getConfiger) != 'undefined'){
                var configerations = instance.getConfiger();
                var page_type = instance.param.page_type;
                var a = (jq[0].dataset.options).split(',');
                var item = {};
                for(var index in a){
                    var k = a[index].split(':');
                    var m = k[0];
                    item[m]=k[1].replace(/\"/g, "");
                }
                for(var index in configerations){
                    if(configerations[index].page_type == page_type
                        && jq.attr('name') == configerations[index].name){
                        for(var key in configerations[index]){
                            if('name'!=key && 'page_type'!= key){
                                if(key == 'require'&&configerations[index][key]=='true'){
                                    if(typeof(item.validate)!= 'undefined'){
                                        if(item.validate.indexOf('required')<0){
                                            option.validate = item.validate+' required';
                                        }else{
                                            option.validate = item.validate;
                                        }
                                    }else{
                                        option.validate=" required";
                                    }
                                }else{
                                    option[key] = eval(configerations[index][key]);
                                }
                            }
                        }
                    }
                }
            }
            var opts = $.extend({}, $.parser.parseOptions(this), options, option);
            if(opts.type!='lookup'){
                opts.icons=[
                    {iconCls:'icon-clear',handler:function(){
                        if(opts.relName!=''){
                            //Easyui.clearValue(opts.relName);
                        }
                        var instance = options.instance;//获取页面对象
                        instance.executeMethod(opts._id,'clear');
                    }
                    }
                ];
            }
            var validType = initValidate(opts.validate,opts);
            opts._id = jq.attr('name');
            opts.validType=validType;
            opts.missingMessage = '必输项不能为空';
            var component = window[jq.data('compNamespace')];
            if(component!=undefined){
                var config = component.config;
                for(var index in config){
                    var id=config[index].id;
                    if(id==jq.attr('name')&&component.param.page_type==config[index].page_type){
                        opts = $.extend(opts,config[index]);
                        if(config[index].visiable!=null&&config[index].visiable==false){
                            var style = config[index].visiable?'block':'none';
                            $('#'+config[index].id+'_wrapper','#'+opts.namespace).css({display:style});
                        }
                    }
                }
            }

            var val = instance.param[opts._id];
            var inputInfo = {label:opts.label,name:opts._id,type:opts.type,value:val,comp:opts.comp};

            if(window[namespace].formelement_==undefined){
                window[namespace].formelement_ = [];
            }
            window[namespace].formelement_.push(inputInfo);
            if(opts.type==='tree'){
                if($('#kw').length<=0){
                    opts._id = jq.attr('id'); // 因为树面板没有name属性
                    //add by zongzhenyang 20160720 增加树的查询    // 增加z-index属性，保证下拉框在顶层 add by heyuhong 20180111
                    var divhtml = "<div style='position: relative'><input id='kw' class=\"f-search\" onkeyup='getContent(this,\"" + opts._id + "\");'/>" + "<div id='append_" + opts._id + "' class='combo-panel panel-body panel-body-noheader' style='position: absolute; background-color: #59AEA2;display:none;width:100%;height:198px;z-index:100;'></div></div>";
                    // add by wangshuaishuia 20170309 增加账套下拉框,可根据选中的账套编号动态查询该账号下的所有科目。
                    var comboboxHtml = "<div style='position: relative'>请选择账套：<input id='accountTao' class='easyui-combobox'/> </div>";
                    jq.before(divhtml);
                    var tree_type = opts.tree_type;
                    if (tree_type == "com_item") {
                        jq.before(comboboxHtml);
                        //修改成combotree xiongqi 20170725修改
                        $("#accountTao").combotree({
                            url: '/comitemsaveview/ComDepartSobTreeController',
                            idField: 'id',
                            parentField: 'pid',
                            textFiled: 'name',
                            required: true,
                            queryParams: {sts: '1', tx_br_no: '',opt_type:'modify'},
                            onLoadSuccess: function () {//设置默认值 add by yexinghai
                                var tree = $('#accountTao').combotree('tree');
                                var data = tree.tree('getRoots');
                                
                                var isHaveVal = 'Y';
                                var sob_no = '';
                                var stdd_no = '';
                                var breakFlag = false;
                                for (var i = 0; i < data.length; i++) {
                                    var childrens = tree.tree('getChildren', data[i].target);
                                    for (var j = 0; j < childrens.length; j++) {
                                        if (childrens[j].default_yn == 'Y' && childrens[j].id != childrens[j].pid) {
                                            $('#accountTao').combotree('setValue', childrens[j].id);
                                            var node = tree.tree('find', childrens[j].id);
                                            tree.tree('select', node.target);
                                            var stdd_no = childrens[j].pid.split("@")[0];
                                            $("#stdd_no").wrapper("setValue", stdd_no);
                                            breakFlag = true;
                                            isHaveVal = 'N';
                                            break;
                                        }
                                    }
                                    if('Y'==isHaveVal){
                                    	for (var j = 0; j < childrens.length; j++) {
                                            if(childrens[j].default_yn=='N'&&childrens[j].id!=childrens[j].pid){
                                                sob_no = childrens[j].id;
                                                $('#accountTao').combotree('setValue',sob_no);
                                                var node = tree.tree('find', childrens[j].id);
                                                tree.tree('select', node.target);
                                                stdd_no = childrens[j].pid.split("@")[0];
                                                breakFlag = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(breakFlag = true){
                                    	break;
                                    }
                                }
                            },
                            onBeforeSelect: function (node) {
                                //获取当前选择的会计准则
                                var t = $('#accountTao').combotree('tree');
                                var children = t.tree('getChildren', node.target);
                                if (children.length != 0) {
                                    console.log("请选择最底层账套信息");
                                    return false;
                                }
                                //增加对准则下没有账套，选择信息提示  by wangkunkun 20171209
                                if (node.id.indexOf("@") > -1) {
                                    console.log("请选择最底层账套信息");
                                    return false;
                                }
                            },
                            onSelect: function (node) {
                                var no = node.id.split("@")[0];
                                var stdd_no = node.pid.split("@")[0];
                                delete JSON[jq.attr("id")];
                                
                                opts = $.extend({
                                    url: "/system/common/action/searchTreeData",
                                    checkbox: false,
                                    dnd: false,
                                    isOpen: false,
                                    idField: 'id',
                                    parentField: 'pid',
                                    textField: 'name',
                                    isParentType: '&&',
                                    isAsync: false,
                                    //onSelect: doCheckSelect
                                }, opts);
                                if (opts.url != null && opts.url != '') {
                                    opts.url =  opts.url;
                                }
                                if (opts.url =="") {
                                    opts.url = "/system/common/action/searchTreeData";
                                }

                                opts.queryParams = {
                                    isParentType: opts.isParentType,
                                    isAsync: opts.isAsync,
                                    attribute: opts.attribute,
                                    whereSqlKey: opts.whereSqlKey,
                                    isParent: opts.isParent,
                                    tree_type: opts.tree_type,
                                    no: no,
                                    stddNo: stdd_no
                                };
                                opts.lines = true;
                                opts.lines = true;
                                $.fn.tree.call(jq, opts);
                            }
                        });
                        
                    }

                
            
                }
                var treeType=opts.tree_type;
                var isDefaultRel=opts.isDefaultRel;
                var selectHtml='<div style=\'position: relative\'><input id=\'tree_select\' class=\'easyui-combobox\' style=\'width:95%;\' /> <input type="hidden" id=\'select_tree_id\' value="'+opts._id+'">'+'<input type="hidden" id=\'select_tree_type\' value="'+opts.tree_type+'"></div>';
                if($('#tree_select').length<=0&&treeType=='departRight'&&isDefaultRel!=undefined&&isDefaultRel==false){
                    jq.before(selectHtml);
                }
                tree_manager[opts._id] = {target:jq,options:opts};
            }

            // opts.width = 170; 默认设置是170，如果界面设置宽度且小于170，用界面设置的宽度 modify by heyh 2020-01-08
            opts.width = (opts.width || 170) <170 ? opts.width : 170;
            switch(opts.type){
                case	'number':{
                    opts = $.extend({
                        capital:false,multiline:false,editable:true,disabled:false,readonly:false,numberType:'number',precision:2
                    },opts);
                    if(opts.numberType=='rate'){
                        opts.min=0 ;
                        opts.max=100;
                    }else if(opts.numberType=='money'){
                        opts.validType.push('isMoney');
                        opts.groupSeparator=',';
                    }else if(opts.numberType=='number'){
                        opts.precision='0';
                    }

                    if(opts.intervalType=='2'){
                        jq.wrap('<span></span>');
                        //var inputInfo2 = {label:opts.label,name:opts.endName,type:opts.type,value:opts.endValue};
                        //formelement_.push(inputInfo2);

                        jq.parent().after('-<span><input type=\'text\' id=\''+opts.endName+'\' name=\''+opts.endName+'\'/><span>');
                        opts.width = 102;
                        var endOpts = {width:102,icons:[{iconCls:'icon-clear',handler:function(){}}],validType:['numberbox','compareWith[\'>=@'+jq.attr('name')+'\']']};
                        var validTypeEnd = initValidate(opts.validateEnd,endOpts);
                        validTypeEnd.push('numberbox','compareWith[\'>=@'+jq.attr('name')+'\']');
                        endOpts.validType = validTypeEnd;
                        $('#'+opts.endName).numberbox(endOpts);
                    }
                    if(opts.dateType=='2'){//日期类型是区间值时
                        $('#'+opts.endName).numberbox('setValue',opts.endValue);
                    }
                    opts.type = '';
                    //$.fn.numberbox.call(jq,opts); //数字框右侧添加增减调整功能   update by heyuhong 20170328
                    $.fn.numberspinner.call(jq,opts);
                    if(opts.capital){
                        jq.next().find('.textbox-text').css({color:'red'});
                    }
                    break;
                }
                case	'label':{
                    $.fn.label.call(jq,opts);
                    break;
                }
                case	'lookup':{
                    opts = $.extend({
                        editable:false,panelWidth:600,panelHeight:300
                    },opts);
                    // 放大镜需要设置显示框长度 add by heyh 2020-02-07
                    jq.css('width',opts.width);
                    $.fn.lookup.call(jq,opts);
                    break;
                }
                // case "listtree":{   // 没有用到
                //     opts = $.extend({
                //         editable:false,panelWidth:600,
                //         panelHeight:300,
                //         striped : false
                //     },opts);
                //     $.fn.listtree.call(jq,opts);
                //     break;
                // }
                case	"inputtree": { //树组件
                    if(opts.componentType !== undefined && opts.componentType !==null){
                        switch(opts.componentType){
                            case "accountComponent":{  // 账套组件
                                opts = $.extend({
                                    url:'/im/dhc/zz/comDepartSobTreeController',
                                    
                                    onLoadSuccess: function (node) {//设置默认值
                                        
                                        var tree = $('#' + opts._id).combotree("tree");
                                        var data = tree.tree('getRoots');
                                        for (var i = 0; i < data.length; i++) {
                                            var childrens = tree.tree('getChildren', data[i].target);
                                            for (var j = 0; j < childrens.length; j++) {
                                                if (childrens[j].default_yn == 'Y' && childrens[j].id != childrens[j].pid) {
                                                    $('#' + opts._id).combotree('setValue', childrens[j].id);
                                                    var node = tree.tree('find', childrens[j].id);
                                                    tree.tree('select', node.target);
                                                    var stdd_no = childrens[j].pid.split("@")[0];
                                                    $("#stdd_no").textbox("setValue", stdd_no);
                                                    break;
                                                }
                                            }

                                        }
                                    },
                                    onSelect: function (node) {
                                        
                                        if (node != null) {
                                            if (node.id.indexOf("@") > -1) {
                                                alert("请选择最底层账套信息");
                                                
                                                $('#sob_no').combotree('setValue','');
                                                $('#acc_lvl').combobox('setValue','');
                                                $('#acc_no').combotree('loadData', '');
                                                return false;
                                            }
                                            $('#stdd_no').textbox('setValue',node.no);
                                            initComBoxSelectnewItem(node.id);
                                            loadAccTree(node.id, node.no);
                                        }

                                    }
                                },opts);
                                opts.queryParams = {
                                    sts: "1",
                                    tx_br_no: "",
                                    opt_type:'search'
                                };
                                break;
                            }
                            case 'comItemComponent':{  // 科目组件
                                var sobNo = $("#sob_no").val();
                                var stddNo = $("#stdd_no").val();
                                var searchDate = $("#searchDate").val();
                                opts = $.extend({
                                    url:'/im/dhc/zz/comItemTreeSearch',
                                },opts);
                                opts.queryParams = {
                                    sobNo:sobNo,
                                    stddNo:stddNo,
                                    searchDate:searchDate
                                };
                                opts.lines = true;
                                break;
                            }

                        }
                    } 
                    opts = $.extend({
                        disp_type: '1',
                        readonly: false,
                        tree_type: 'menu',
                        isAsync: false,
                        leafOnly: false
                    }, opts);
                    $.fn.inputtree.call(jq, opts);
                    
                    break;
                }
                case	'date':{
                    if(opts.useSysdate==true){
                        if(jq.val()==null||jq.val()==''||jq.val()=='0'){
                            const sessionDate = sessionStorage.getItem('golbal_tbsdy');
                            jq.val(sessionDate);
                            inputInfo.value = sessionDate;
                        }
                    }
                    opts.type='text';//Tao JinSong <input type='date'/>在h5在有默认实现，和easyui冲突，如：在49版chrome中即不可正常使用 20160330 12:32
                    validType.push('date');
                    if(opts.dateType=='2'){//日期类型是区间值时
                        // jq.wrap('<span></span>');
                        // if(opts.endValue==null||opts.endValue==''||opts.endValue=='0'){
                        //     opts.endValue = window.sys_date;
                        // }
                        // var inputInfo2 = {label:opts.label,name:opts.endName,type:opts.type,value:opts.endValue};
                        // formelement_.push(inputInfo2);

                        // jq.parent().after('-<span><input type=\'text\' id=\''+opts.endName+'\' name=\''+opts.endName+'\'/><span>');
                        // opts.width = 102;
                        // var endOpts = {width:102,icons:[{iconCls:'icon-clear',handler:function(){Easyui.clearValue(opts.endName);}}],validType:['date','compareWith[\'>=@'+jq.attr('name')+'\']']};
                        // var validTypeEnd = initValidate(opts.validateEnd,endOpts);
                        // validTypeEnd.push('date','compareWith[\'>=@'+jq.attr('name')+'\']');
                        // endOpts.validType = validTypeEnd;
                        // $('#'+opts.endName).datebox(endOpts);
                    }
                    $.fn.datebox.call(jq,opts);
                    if(opts.dateType=='2'){//日期类型是区间值时
                        $('#'+opts.endName).datebox('setValue',opts.endValue);
                    }

                    break;
                }
                case    "DateInterval": { //caolele 添加日期区间插件  20190321
                    var sysDate = JSON.parse(sessionStorage.getItem('golbal_tbsdy'));
                    if (opts.useSysdate == true) {
                        if (jq.val() == null || jq.val() == '' || jq.val() == '0') {
                            const sessionDate = sessionStorage.getItem('golbal_tbsdy');
                            jq.val(sessionDate);
                            inputInfo.value = sessionDate;
                        }
                    } else {
                        sysDate = window.lstDate;
                    }
                    opts.type = 'text';//Tao JinSong <input type='date'/>在h5在有默认实现，和easyui冲突，如：在49版chrome中即不可正常使用 20160330 12:32
                    validType.push("date");


                    if (opts.endValue == null || opts.endValue == '' || opts.endValue == '0') {
                        opts.endValue = sysDate;
                    }
                    var html = '<div id="' + opts.endName + '_wrapper" class="field">'
                    +'<span class="field-label">开始日期</span>'
                    +'<span>'
                    +'<input id="' + opts.endName + '" name="' + opts.endName + '" value="" style="width: 100%; display: none;" class="easyui-wrapper datebox-f combo-f textbox-f" />'
                    +'</span>'
                    +'<div id="' + opts.endName + '_tips" class="tips"></div>'
                    +'</div>';

                    $("#" + opts._id + "_wrapper").after(html);
                    $("#" + opts._id).datebox({
                        value: opts.endValue,
                        onChange: function (newValue, oldValue) {
                            var endDate = $("#" + opts.endName).datebox("getValue");
                            if (newValue > sysDate) {
                                return false;
                            }
                            if (newValue > endDate) {
                                $("#" + opts.endName).datebox("setValue", newValue);
                            }
                        }
                    })
                    $("#" + opts.endName).datebox({
                        editable: false,
                        required: true,
                        value: opts.endValue,
                        icons: [{
                            iconCls: 'icon-clear',
                            handler: function (e) {
                                if (e == undefined) return;
                                $(e.data.target).datebox('setValue', '');
                            }
                        }],
                        onChange: function (newValue, oldValue) {
                            var startDate = $("#" + opts._id).datebox("getValue");
                            if (newValue > sysDate) {
                                return false;
                            }
                            if (newValue < startDate) {
                                $("#" + opts._id).datebox("setValue", newValue);
                            }
                        }
                    });
                    var endOpts = {validType: ['date', "compareWith['<=@" + sysDate + "']"]};
                    var validTypeEnd = initValidate(opts.validateEnd, endOpts);
                    validTypeEnd.push('date', "compareWith['<=@" + sysDate + "']");
                    endOpts.validType = validTypeEnd;

                    $("#" + opts.endName).datebox(endOpts); //添加日期的校验
                    $.fn.datebox.call(jq, opts);
                    $("#" + opts._id).datebox(endOpts); //添加日期的校验

                    break;
                }
                case "departtree":{ //机构树组件
                    opts = $.extend({
                        editable:false,
                        panelWidth:540,
                        panelHeight:300,
                        striped : false,
                        parentField:'pid',
                        idField:'id',
                        valueField:'id',
                        textField:'name',
                        checkbox:true,
                        icons:[{
                            iconCls:'icon-clear',
                            handler: function(e){
                                if(e==undefined) return;
                                $(e.data.target).departtree('setValues', '');
                            }
                        }],
                        url:"/system/common/action/searchTreeData",
                        onShowPanel:function(){
                            $.ajax({
                                url:"/system/select/options/getSystembyLeg",
                                dataType:'json',
                                type:'post',
                                success:function(data){
                                    $("#rpt_dateDepartTree").datebox("setValue",data.lst_date);
                                }
                            });
                        }
                    },opts);
                    opts.queryParams = {
                        isParentType:opts.isParentType,
                        isAsync:opts.isAsync,
                        attribute:opts.attribute,
                        whereSqlKey:opts.whereSqlKey, // TODO
                        tree_type:opts.tree_type
                    };
                    $.fn.departtree.call(jq,opts);
                    break;
                }
                case "departtreepanel": {

                    opts = $.extend({
                        parentField: 'pid',
                        idField: 'id',
                        valueField: 'id',
                        textField: 'name',
                        url: "/im/dhc/sys/controller/system/department/ReportTreeDataController",
                        onBeforeLoad:function (node) {
                            var tree = $(this).tree('options');
                            if (node != null && node.checked && tree.isAsync) {
                                tree.url = "/im/dhc/sys/controller/system/department/ReportTreeDataController?checked="+true;
                            }
                        }

                    }, opts);
                    opts.queryParams = {
                        isParentType: opts.isParentType,
                        isAsync: opts.isAsync,
                        attribute: opts.attribute,
                        isParent: opts.isParent,
                        tree_type: opts.tree_type,
                        
                    };
                    $.fn.departtreepanel.call(jq, opts);
                    break;
                }
                case	"ajax_select":case	"select":{//下拉列表选择
                if(opts.componentType !== undefined  &&  opts.componentType !== null ){
                    switch (opts.componentType){
                        case "currencyFlag":{   // 币种展示
                            opts = $.extend({
                                url:"/system/select/options/currencyLoad",
                                queryParams:{correct:opts.correct},
                                disabled:false,
                                editable:false,
                                readonly:false,
                                multiple:false,
                                textField:"item_name",
                                valueField:"item_no",
                                panelHeight:'auto',
                                panelMaxHeight:300
                            },opts);
                            break;
                        }
                        // 账户系统管理端特殊处理  add by zhuxingpeng 2020-02-06
                        case 'departGatherComponent':{ //添加机构汇总关系类型
                            param = opts.instance.param;
                            opts = $.extend(opts, {
                                url: '/im/dhc/sys/controller/system/department/departRelManager/DepartGatherController/departGatherInfo',
                                method: 'POST'
                            })

                            var colName = jq.attr('name');
                            if (opts.col_name != undefined) {
                                colName = opts.col_name;
                            }
                            opts = $.extend({
                                url: '/system/select/options/load',
                                queryParams: $.extend(param, {
                                    tableName: opts.tab_name,
                                    colName: colName,
                                    sql: opts.sql
                                }),
                                disabled: false,
                                editable: false,
                                readonly: false,
                                multiple: false,
                                textField: 'item_name',
                                valueField: 'item_no',
                                panelHeight: 'auto',
                                panelMaxHeight: 300
                            }, opts);
                            //设置combobox下拉框的默认值
                            for (var index in opts.data) {
                                if (opts.data[index].is_default == 'Y') {
                                    opts.value = opts.data[index].item_no;
                                    break;
                                }
                            }
                            opts.editable = false;
                            opts.label = '';
                            $.fn.combobox.call(jq, opts);
                            break;
                        }
                        case "TradingSystem":{
                            //add by yexinghai 20190417
                            var triger = '#'+opts.depart_rel;
                            $(triger).combobox({
                                selectAfter:function(newValue,oldValue){
                                    var departNo = $("#"+opts.depart_rel).wrapper("getValue");
                                    var gatherNo = $("#"+opts.gather_rel).wrapper("getValue");
                                    var cascadeFlag = "Y";
                                    if(gatherNo!=null && gatherNo!=undefined && departNo !== null && departNo !== undefined){
                                        $.ajax({
                                            url:"/system/select/options/getSystemInfo",
                                            dataType:"json",
                                            type:"post",
                                            async:false,
                                            data:{gatherNo:gatherNo,departNo:departNo,cascadeFlag:cascadeFlag},
                                            success:function(data){
                                                $("#"+opts._id).wrapper("loadData",data);
                                                var flag=true;
                                                if(data.length==0){
                                                    $("#"+opts._id).wrapper("setValue","");
                                                }else{
                                                    for(var i = 0; i < data.length ; i++){
                                                        if("0"==data[i].item_no){
                                                            $("#"+opts._id).wrapper("setValue","0");
                                                            flag=false;
                                                            break;
                                                        }
                                                    }
                                                    if(flag){
                                                        $("#"+opts._id).wrapper("setValue",data[0].item_no);
                                                    }
                                                }
                                            }
                                        });
                                    }
                                }
                            })
                            
                            opts = $.extend({
                                onBeforeLoad:function(param){
                                    var gatherNo="";
                                    var departNo="";
                                    var cascadeFlag="";
                                    if(opts.depart_rel!=undefined&&opts.depart_rel!=null&&opts.gather_rel!=undefined&&opts.gather_rel!=null){
                                        gatherNo = $("#"+opts.gather_rel).val();
                                        departNo = $("#"+opts.depart_rel).val();
                                        cascadeFlag="Y";
                                    }
                                    $.ajax({
                                        url:"/system/select/options/getSystemInfo",
                                        dataType:"json",
                                        type:"post",
                                        async:false,
                                        data:{gatherNo:gatherNo, departNo:departNo, cascadeFlag:cascadeFlag},
                                        success:function(data){
                                            //var inputInfo2 = {label:opts.label,name:opts.endName,type:opts.type,value:opts.endValue};
                                            //formelement_.push(inputInfo2);
                                            $("#"+opts._id).wrapper("loadData",data);
                                            var flag=true;
                                            if(data.length==0){
                                                $("#"+opts._id).wrapper("setValue","");
                                            }else{
                                                for(var i = 0; i < data.length ; i++){
                                                    if("0"==data[i].item_no){
                                                        $("#"+opts._id).wrapper("setValue","0");
                                                        flag=false;
                                                        break;
                                                    }
                                                }
                                                if(flag){
                                                    $("#"+opts._id).wrapper("setValue",data[0].item_no);
                                                }
                                            }
                                        }
                                    });
                                },
                            },opts)
                            break;
                        }
                        case "courseComponent":{ // 科目级别展示
                            var sob_no = $('#sob_no').val();
                            sob_no = '1@';
                            if (sob_no != null && sob_no != "") {
                                opts = $.extend({
                                    url:"/system/common/action/serachAccLvl",
                                    queryParams:{sobNo:sob_no},
                                    disabled:false,
                                    editable:false,
                                    readonly:false,
                                    multiline:false,
                                    textField:"item_name",
                                    valueField:"item_no",
                                    panelHeight:300,
                                    panelMaxHeight:300
                                },opts);
                            }else {
                                console.log("所选账套为空,请先选择账套");
                            }
                            break;
                        }
                        case "periodicComponent": {//周期类型组件加载
                            var cycTypeField = opts.cycTypeField;
                            opts = $.extend({
                                url:"/system/select/options/periodicComponent?cycTypeField=" + cycTypeField,
                                textField:"item_name",
                                valueField:"item_no",
                                panelHeight:'auto',
                                panelMaxHeight:300,
                                onLoadSuccess: function () {//设置默认值
                                        var data = $("#" + opts._id).combobox("getData");
                                        for (var index in data) {
                                            if (data[index].is_default == 'Y') {
                                                $("#" + opts._id).combobox("setValue", data[index].item_no);
                                                break;
                                            }
                                        }
                                    }
                            },opts);
                            break;
                        }
                        case "upDownComponent" : {//上转类型加载
                            opts = $.extend({
                                url: "/system/select/options/upDownComponent",
                                textField:"item_name",
                                valueField:"item_no",
                                panelHeight:'auto',
                                panelMaxHeight:300,
								onLoadSuccess: function () {//设置默认值
									var data = $("#" + opts._id).combobox("getData");
									for (var index in data) {
										if (data[index].is_default == 'Y') {
											$("#" + opts._id).combobox("setValue", data[index].item_no);
											break;
										}
									}
								}
                            },opts);
                            break;
                        }
                        case "auxiliary":{ // 辅助核算
                            opts = $.extend({
                                url: "/system/select/options/auxiliary",
                                textField:"item_name",
                                valueField:"item_no",
                                panelHeight:'auto',
                                panelMaxHeight:300
                            },opts);
                            break;
                        }

                        case "dimension":{ // 维度
                            opts = $.extend({
                                url: "/system/select/options/dimension",
                                textField:"item_name",
                                valueField:"item_no",
                                panelHeight:'auto',
                                panelMaxHeight:300
                            },opts);
                            break;
                        }
                        case "relationInfoNo":{ // 机构汇总关系
                            opts = $.extend({
                                url: "/system/select/options/relationInfoNo",
                                textField:"item_name",
                                valueField:"item_no",
                                panelHeight:'auto',
                                panelMaxHeight:300
                            },opts);
                            break;
                        }

                    }
                } else {
                    opts = $.extend({
                        url:'/system/select/options/load',
                        queryParams:{tableName:opts.tab_name,colName:jq.attr('name'),sqlKey:opts.sqlKey},
                        disabled:false,editable:false,readonly:false,multiple:false,textField:'item_name',valueField:'item_no',
                        panelHeight:'auto',panelMaxHeight:300
                    },opts);
                    //设置combobox下拉框的默认值
                    // for(var index in opts.data){
                    //     if(opts.data[index].is_default=='Y'){
                    //         opts.value=opts.data[index].item_no;
                    //         break;
                    //     }
                    // }
                    opts.onLoadSuccess = function(data) {
                        if ($(this).combobox('getValue') == '') {
                            for(var index in data){
                                if(data[index].is_default=='Y'){
                                    $(this).combobox('setValue', data[index].item_no);
                                    break;
                                }
                            }
                        }
                        
                    }
                    opts.editable = false;
                    opts.label = '';
                }
                
                $.fn.combobox.call(jq,opts);
                break;
            }
            case 'selectAttr': { //下拉选择产品信息 --账户系统管理端拓展
                var param = {};
                var colName = jq.attr('name');
                if (opts.col_name != undefined) {
                    colName = opts.col_name;
                }
                opts = $.extend({
                    url: '/system/select/options/loadFromAttr',
                    queryParams: $.extend(param, {
                        tableName: opts.tab_name,
                        colName: colName,
                    }),
                    disabled: false,
                    editable: false,
                    readonly: false,
                    multiple: false,
                    textField: 'item_name',
                    valueField: 'item_no',
                    panelHeight: 'auto',
                    panelMaxHeight: 300
                }, opts);
                //设置combobox下拉框的默认值
                for (var index in opts.data) {
                    if (opts.data[index].is_default == 'Y') {
                        opts.value = opts.data[index].item_no;
                        break;
                    }
                }
                opts.editable = false;
                opts.label = '';
                $.fn.combobox.call(jq, opts);
                break;
            }

            case 'newselect': { //下拉选择（从js加载数据） --账户系统管理端拓展
                opts.editable = false;
                opts.label = '';
                $.fn.combobox.call(jq, opts);
                break;
            }
            case 'inputtreegrid': { //下拉树形表格  --账户系统管理端拓展
                $.fn.combotreegrid.call(jq, opts);
                break;
            }
                case "accountperiod":{
                    opts = $.extend({
                        url: "/system/select/options/accountPeriod",
                        textField:"item_name",
                        valueField:"item_no",
                        panelHeight:'auto',
                        panelMaxHeight:300,
                        onChange:function(newValue, oldValue){ // 当newValue = 1 和 3时 默认展示会计周期和报表日期 newValue = 2 时 默认展示开始时间和结束时间
                            var val = $("#acc_period").combobox('getValue');
                            if(newValue == '1'){
                                //请求会计周期
                                $("#acc_cyc_def_no").combobox({
                                    url: "/system/select/options/accCycDefNo",
                                    queryParams:{accountPeriod:val},
                                    onLoadSuccess:function (data) {
                                        // 赋初始值
                                        $("#acc_cyc_def_no").combobox("setValue",data[0].item_no);
                                    },
                                    onChange:function () {

                                    }
                                });


                                $("#acc_cyc_def_no_wrapper").show();
                                $("#tx_date_wrapper").show();
                                $("#acc_cyc_info_no_wrapper").hide();
                                $("#rpt_dateStart_wrapper").hide();
                                $("#rpt_dateEnd_wrapper").hide();

                            }else if(newValue == '2'){

                                $("#acc_cyc_def_no_wrapper").hide();
                                $("#tx_date_wrapper").hide();
                                $("#acc_cyc_info_no_wrapper").hide();
                                $("#rpt_dateStart_wrapper").show();
                                $("#rpt_dateEnd_wrapper").show();
                            }else if(newValue == '3'){
                                //请求会计周期
                                $("#acc_cyc_def_no").combobox({
                                    url: "/system/select/options/accCycDefNo",
                                    queryParams:{accountPeriod:val},
                                    onLoadSuccess:function (data) {
                                        // 赋初始值
                                        $("#acc_cyc_def_no").combobox("setValue",data[0].item_no);
                                    },
                                    onChange:function (cycDefValue) {
                                        var yearCnt = $('#cs_searchbox').val();
                                        var cyc_yn ="";
                                        var data = $("#acc_period").combobox("getData");
                                        for(var i=0;i<data.length;i++){
                                            if(val == data[i].item_no){
                                                cyc_yn = data[i].cyc_yn;
                                                break;
                                            }
                                        }
                                        // 请求日期区间
                                        $("#acc_cyc_info_no").combogrid({
                                            url: '/im/dhc/zz/automake/search/loadAccountPeriodController?acc_cyc_def_no='+cycDefValue+'&yearCnt='+yearCnt+'&cycYn='+cyc_yn,
                                            onLoadSuccess:function (cycresult) {
                                                console.log(cycresult);
                                            }
                                        });

                                        if('N' == cyc_yn){
                                            $("#cs_searchbox").numberbox({
                                                disabled:true
                                            });
                                            $("#buttons").hide();
                                        }else{
                                            $("#cs_searchbox").numberbox({
                                                disabled:false
                                            });
                                            $("#buttons").show();
                                        }
                                    }
                                });

                                $("#acc_cyc_def_no_wrapper").show();
                                $("#tx_date_wrapper").hide();
                                $("#acc_cyc_info_no_wrapper").show();
                                $("#rpt_dateStart_wrapper").hide();
                                $("#rpt_dateEnd_wrapper").hide();


                            }

                        },
                        onLoadSuccess:function (data) {
                            var periodType = ""; // 默认期间类型
                            var period_no = "";  // 默认的会计期间值
                            for (i = 0; i < data.length; i++) {
                                if (data[i].defaut_yn == "Y"){
                                    period_no = data[i].item_no;
                                    periodType = data[i].period_type;
                                    break;
                                }
                            }
                            // 赋值默认会计期间值
                            $("#acc_period").combobox("setValue",period_no);

                            $("#acc_cyc_def_no_wrapper").show();
                            $("#tx_date_wrapper").show();
                            $("#acc_cyc_info_no_wrapper").hide();
                            $("#rpt_dateStart_wrapper").hide();
                            $("#rpt_dateEnd_wrapper").hide();

                        }
                    },opts);
                    $.fn.accountperiod.call(jq,opts);
                    break;
                }
                case	'autcomplete':{
                    opts = $.extend({
                        readonly:false,disabled:false,editable:true
                    },opts);
                    $.fn.autcomplete.call(jq,opts);
                    break;
                }
                case	'tips':{
                    return '<label id='+opts.id+'>'+opts.label+'</label>';
                }
                case	'tree':{
                    opts = $.extend({
                        url:'/system/common/action/searchTreeData',
                        checkbox:false,
                        dnd:false,
                        isOpen:false,
                        idField:'id',
                        parentField:'pid',
                        textField:'name',
                        isParentType:'&&',
                        isAsync:false
                        //onSelect:doCheckSelect
                    },opts);

                    opts.queryParams = {
                        isParentType:opts.isParentType,
                        isAsync:opts.isAsync,
                        attribute:opts.attribute,
                        whereSqlKey:opts.whereSqlKey,
                        isParent:opts.isParent,
                        tree_type:opts.tree_type
                        //page_code:page_code
                    };
                    opts.lines = true;
                    $.fn.tree.call(jq,opts);
                    break;
                }
                case 'split':{break;}
                case 'filebox':{
                    //jq.attr("type","text");
                    $.fn.filebox.call(jq,{
                        buttonText: '选择文件',
                        width:229,
                        buttonAlign: 'right'
                    });
                    break;
                }
                case "text": {
                    switch (opts.componentType) {
                        case "autoBuildComponent": {
                            var page_type = instance.param.page_type;
                            ///通过自定义组件 【自动生成编号】组件 根据 指定的规则生成指定的编号【只对查询和插入 的页面起作用】
                            if (page_type === "1" || page_type === "2") {
                                //1-->插入页面的文本框 2--->更新页面文本框 
                                $.ajax({
                                    url: "/system/select/options/getTabKeyRule",
                                    dataType: "json",
                                    type: "post",
//							         async:false,
                                    data: {tabName: opts.tab_name},
                                    success: function (data) {
                                        if (data.readonly != undefined && data.readonly != null) {
                                            opts = $.extend(opts, {readonly: true});
                                        }
                                        if (data.message != undefined && data.message != null) {
                                            // 提示信息
                                            opts = $.extend(opts, {invalidMessage: data.message});
                                        }
                                        if (page_type === "1" && data.value != undefined && data.value != null) {
                                            opts = $.extend(opts, {value: data.value});
                                        }
                                        if (data.validate != undefined && data.validate != null) {
                                            //var value = opts.validate +' '+ data.validate;
                                            var value = data.validate;
                                            var validateVal = opts.validate;
                                            if (validateVal == null || validateVal === undefined) {
                                                validateVal = "";
                                            }
                                            var array1 = validateVal.split(" "); //这是ui中设置的校验
                                            // @Modify chenxiaodong
                                            if (value.indexOf("@key=?@key") >= 0 && value.indexOf("@Y") < 0) {
                                                var firstVal = value.substring(0, value.indexOf("validateRecord") - 1);
                                                var lastVal = value.substring(value.indexOf('@key=?@key') + 10, value.length).trim();
                                                var valiKey = value.substring(value.indexOf("validateRecord"), value.indexOf('@key=?@key') + 10);
                                                if (lastVal !== null && lastVal !== '') {
                                                    value = firstVal + ' ' + lastVal;
                                                } else {
                                                    value = firstVal;
                                                }
                                                value = value + ' ' + valiKey + '@Y';
                                                firstVal = null;
                                                lastVal = null;
                                            }
                                            // 校验规则是后台校验加上前台ui设置的校验   add by yexinghai
                                            for (var i = 0; i < array1.length; i++) {
                                                if (value.indexOf(array1[i]) == -1) {
                                                    value = value + ' ' + array1[i];
                                                }
                                            }
							        	   if(page_type === "2" && value.indexOf("@key=?@key") >= 0){
							        		   value = value.replace("@key=?@key","@key=?@key@Y");
							        	   }							        	   
                                            opts = $.extend(opts, {validate: value});
                                        }

                                        var validType = initValidate(opts.validate, opts);
                                        opts._id = jq.attr("id");
                                        opts.validType = validType;

                                        opts = $.extend({
                                            multiline: false,
                                            editable: true,
                                            disabled: false,
                                            readonly: false
                                        }, opts);
                                        $.fn.textbox.call(jq, opts);
                                        // @modify chenxiaodong 20190711
                                        //新增页面自动生成的key 使用已经存在的值不验证,解决不了key 自动生成的之前数据库中已经有的问题,在数据库中添加索引
                                        if($("#" + opts._id).wrapper("getInitValue", namespace) == undefined ||
                                        		$("#" + opts._id).wrapper("getInitValue", namespace) == ""){
                                        	$("#" + opts._id).wrapper("setInitValue",opts.value, namespace);
                                        }                                    
                                   }
                                });
                            } else {//处理查询
                                opts = $.extend({
                                    multiline: false,
                                    editable: true,
                                    disabled: false,
                                    readonly: false
                                }, opts);
                                $.fn.textbox.call(jq, opts);
                            }
                        }
                        default : {
                            opts = $.extend({
                                multiline: false,
                                editable: true,
                                disabled: false,
                                readonly: false
                            }, opts);
                            $.fn.textbox.call(jq, opts);
                        }
                    }
                }
                default :{
                    opts = $.extend({
                        multiline:false,
                        editable:true,
                        disabled:false,
                        readonly:false
                    },opts);
                    $.fn.textbox.call(jq,opts);
                }
            }
        });
    };


    $.fn.wrapper.method = {
        /**
         * 取得表单初始化的值
         * @returns
         */
        getInitCapit:function(methodName, namespace){
            var id = this.attr('id');
            var formelement_ = window[namespace].formelement_ ;
            for(var i = 0;i<formelement_.length;i++){
                if(formelement_[i].name==id){
                    return true;
                }
            }
        },
        getInitValue:function(methodName, namespace){
            var id = this.attr('id');
            var formelement_ = window[namespace].formelement_ ;
            for(var i = 0;i<formelement_.length;i++){
                if(formelement_[i].name==id){
                    return formelement_[i].value;
                }
            }
            return null;
        },
        setInitValue: function (jq, value_, namespace) {
            var id = $(this).attr('id');
            var formelement_ = window[namespace].formelement_ ;
            for (var i = 0; i < formelement_.length; i++) {
                if (formelement_[i].name == id) {
                    formelement_[i].value = value_;
                }
            }

            $("#" + id).val(value_);
        }
    };
})(jQuery);

function initValidate(validate,opts){

    if((validate!=undefined&&validate!=null&&validate.indexOf('required')>-1)){//
        opts.required=true;
    }
    var validType = [];
    //绑定校验项
    if(validate!=undefined&&validate!=null&&validate!=''){
        var array = validate.split(' ');
        for(var i = 0;i<array.length;i++){
            var validateInfo = array[i].split(';');
            if(validateInfo.length>0){
                if('required'!=validateInfo[0]){//非必输项校验
                    validType.push(validateInfo[0]+(validateInfo.length>1?'[\''+validateInfo[1]+'\']':''));
                }
            }
        }
    }
    return validType;
}

//获取科目级别
function initComBoxSelectnewItem(sob_no) {  //初始化科目级别
    if (sob_no != null && sob_no != "") {
        if($("#acc_lvl").length == 0){
            return false;
        }
    	  var accLvlOpts = $("#acc_lvl").combobox("options");
			  accLvlOpts.queryParams = {
				  sob_no: sob_no,
          addEndFlag:accLvlOpts.itemBottom
			  };
        accLvlOpts.onLoadSuccess = function(data) {
          $("#acc_lvl").combobox("setValue", data[data.length - 1].item_no);
        };
			  $.fn.combobox.call($("#acc_lvl"), accLvlOpts);
    } else {
        console.log("所选账套为空,请先选择账套");
    }
} 

function loadAccTree(sob_no,stdd_no){
  var params = stdd_no + "," + sob_no;
  var whereSql = " WHERE STDD_NO = ? AND SOB_NO = ? AND USE_YN='Y' ";
  $.ajax({
	  url: "/persysprdtinfosaveview/ComModItemInfoQueryController",
	  dataType: "json",
	  type: "post",
	  data: {"whereSql": whereSql, "params": params, "type": "sobItemTree"},
	  success: function (data) {
		  $('#acc_no').combotree('loadData', data);
	  }
  });
}