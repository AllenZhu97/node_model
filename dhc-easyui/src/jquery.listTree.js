$.parser.plugins.push("listtree");
$.fn.listtree = function (options, param) {//定义扩展组件
    //当options为字符串时，说明执行的是该插件的方法。
    if (typeof options == "string") { return $.fn.textbox.apply(this, arguments); }
    //当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
    options = $({
    	fit : true,pagination : true,border : true,fitColumns : true,delayLoad:false, showFooter:true,sendServerMeta:true, remoteSort:true,multiple:true           
    },options);
    return this.each(function () {
        var jq = $(this);
        var opts = $.extend({panelWidth:600,panelHeight:300}, $.fn.combotreegrid.parseOptions(this), options);
        if(opts.bindSqlByJs!=undefined&&opts.bindSqlByJs!=null){
        	opts.sql = opts.bindSqlByJs();
        }
        var id = jq.attr("id");
        var validType = initValidate(opts.validate,opts);
        opts.validType=validType;
        
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
		}
		searchbox += "</div>";
		$("body").append("<div id='"+id+"_toolbar'/>");   
        $.fn.combotreegrid.call(jq,{
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
            				$("#"+form_name).wrapper("clear");
            			}
            		}
                	$('#'+id).wrapper('clear');
                }
            }],
            url:basePath + "/im/dhc/sys/automake/system/ListTreeSearch",
            toolbar:"#"+id+"_toolbar",
            delayLoad:true,
            editable:false,
            onShowPanel:function(){
            	searchBox1(jq,opts);
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
            queryParams:{sql:opts.sql,tableName:opts.tableName},fitColumns:true,singleSelect:true,
			columns:[columns],fit:true,border:false,pagination:true
        });
        if(countMenu>0){
	        $("#"+id+"_toolbar").append(searchbox);
	        $("#"+id+"_searchbox").searchbox({
	        	searcher:function(value,name){
	        		searchBox1(jq,opts,value,name);
	        	},
	        	menu:"#"+id+"_panel", 
	        	prompt:'请输入值' 
	        });
        }
        $(".textbox").css({height:20});
    });
};

function searchBox1(jq,opts,value,name){
	//
	var grid = jq.combotreegrid('grid');;
	if(opts.bindSqlByJs!=undefined&&opts.bindSqlByJs!=null){
		opts.sql = opts.bindSqlByJs();
	}
	var sql = opts.sql;
	
	if(sql==null||sql==""){//如果为空，则不执行查询
		return;
	}
	
	if(value!=undefined&&value!=""){
		if(sql.indexOf("order")==-1){
			sql += " and " + name + " like '%" + value + "%' ";
		}else{
			sql = sql.split("order")[0]+" and " + name + " like '%" + value + "%' order "+sql.split("order")[1];
		}
	}
	
	grid.treegrid("load",{
		sql:sql,tableName:opts.tableName
	});
}