$.parser.plugins.push("lookup");//注册扩展组件
$.fn.lookup = function (options, param) {//定义扩展组件
    //当options为字符串时，说明执行的是该插件的方法。
    if (typeof options == "string") { return $.fn.textbox.apply(this, arguments); }
    //当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
    return this.each(function () {
        var jq = $(this);
        var opts = $.extend({panelWidth:600,panelHeight:300}, $.fn.combobox.parseOptions(this), options);
        var id = jq.attr("id");
        
        var columns = new Array();
        var searchbox = "<input id='"+id+"_searchbox' style='width:300px' type='text'></input>" +
						"<div id='"+id+"_panel' style='width:120px'>";
        var countMenu = 0;
		for(var i = 0;i<opts.columns.length;i++){
			var row = opts.columns[i];
			row.halign = "center";
			if(row.disp_yn!='N'){
				columns.push(row);
			}
			if(row.query=='Y'){
				var muit = "<div name='"+ opts.columns[i].field +"'>"+ opts.columns[i].title +"</div>";
			    searchbox += muit;
			    countMenu++;
			}
			
			if(row.query_type=='money'){
				var precision = 2;
				row.align = "right";
				if(row.precision!=undefined&&row.precision!=""){
					precision = row.precision;
				}
				row.formatter = function(value,rowdata,index){
					return value = formatNumber(value,precision,1);
				}
			}else if(row.query_type=='rate'){
				var precision_rate = 6;
				if(row.precision!=undefined&&row.precision!=""){
					precision_rate = row.precision;
				}
				row.formatter = function(value,rowdata,index){
					return value = formatNumber(value,precision_rate,0);
				}
			}
		}
		searchbox += "</div>";
		
        $("body").append("<div id='"+id+"_toolbar'/>");
        $.fn.combogrid.call(jq,{
            panelWidth:opts.panelWidth,
            panelHeight:opts.panelHeight,
            validType:opts.validType,
            required:opts.required,
            icons: [{
                iconCls:'icon-clear',
                handler: function(e){
                	for(var i = 0;i<opts.columns.length;i++){
            			if(opts.columns[i].form_name!=null&&opts.columns[i].form_name.length>0){
            				var form_name = opts.columns[i].form_name;
            				console.log(form_name);
            				$("#"+form_name).wrapper("clear");
            			}
            		}
                }
            }],
            url:"/automake/controller/system/LookupSearchAction",
            toolbar:"#"+id+"_toolbar",
            delayLoad:true,
						height: 22,
						width: 170,
            editable:false,
            onShowPanel:function(){
            	searchBox(jq,opts);
            },
            onSelect:function(rowIndex, rowData){
            	//绑定值到输入项上
        		for(var i = 0;i<opts.columns.length;i++){
        			if(opts.columns[i].form_name!=null&&opts.columns[i].form_name.length>0){
        				var form_name = opts.columns[i].form_name;
        				$("#"+form_name).wrapper("setValue",rowData[opts.columns[i].field]);
        			}
        		}
        		//选择值后的回调方法
        		if(opts.selectAfter!=null&&opts.selectAfter!=undefined){
        			opts.selectAfter(rowData);
        		}
            },
            queryParams:{sqlKey:opts.sqlKey,tableName:opts.tableName},fitColumns:true,singleSelect:true,
			columns:[columns],border:false,pagination:true
        });
        if(countMenu>0){
	        $("#"+id+"_toolbar").append(searchbox);
	        $("#"+id+"_searchbox").searchbox({
	        	searcher:function(value,name){
	        		searchBox(jq,opts,value,name);
	        	},
	        	menu:"#"+id+"_panel", 
	        	prompt:'请输入值' 
	        });
        }
        // 解决放大镜导致得错位问题
        //$(".textbox").css({height:20});
    });
};

function searchBox(jq,opts,value,name){
	var grid = jq.combogrid('grid');
	var gridOpts = jq.combogrid('options');
	var sqlKey = '';
	
	//如果为空，则不执行查询
	if (sqlKey!=null&&sqlKey!="") {
		sqlKey = opts.sqlKey;
	} else if (gridOpts.queryParams.sqlKey!="" && gridOpts.queryParams.sqlKey!=null) {
		sqlKey = gridOpts.queryParams.sqlKey;
	} else {
		return;
	}
	
	grid.datagrid("load",{
		sqlKey:sqlKey,tableName:opts.tableName,name:name,value:value,params:gridOpts.queryParams.params
	});
}