//@chengruohong  2018/10/28 添加机构树组件
(function($){
	$.parser.plugins.push("departtree");
	function create(target){
		var state = $.data(target, 'departtree');
		var opts = state.options;
		opts.lines = true;
		var tree = state.tree;
		$(target).combo(opts);
		var panel = $(target).combo('panel');
		if(opts._id!=undefined&&opts._id!=null&&opts._id!=""){
			var comdition = "<div style = 'width:540px;margin-top: 5px;height:24px;background-color: #D4D4D4'>"
						+"<ul style='margin:0;padding:0;'>"
							+"<li style = 'list-style:none;float:left;margin:0;padding:0;'>"
								+"<span class='field-label' style='width: auto'>汇总关系:&nbsp;</span>"
								+"<input  name='relation_info_noDepartTree'  id = 'relation_info_noDepartTree' style='height: 18px; line-height: 18px;width: 130px;margin-right:3px' class='combotree-f combo-f textbox-f'/>"
							+"</li>"
							+"<li style = 'list-style:none;float:left;margin:0;padding:0;'>"
								+"<span class='field-label' style='width: auto;margin-left:10px'>树类型:&nbsp;</span>"
								+"<input id='br_no_typeDepartTree' name='br_no_typeDepartTree' class='combotree-f combo-f textbox-f' style='height: 18px; line-height: 18px;width: 124px;margin-right:3px'/>"
							+"</li>"
							+"<li style = 'list-style:none;float:left;margin:0;padding:0;'>"
								+"<span class='field-label' style='width: auto;margin-left:10px'>日期:&nbsp;</span>"
								+"<input id='rpt_dateDepartTree'  name='rpt_dateDepartTree' class='combotree-f combo-f textbox-f' style='height: 18px; line-height: 18px;width: 124px;'/>"
							+"</li>"
						+"</ul>"
					+"</div>";
			var inputComboTree = $("<input type='text' style='width:98%;' placeholder='搜索' id=input_"+opts._id+" class='f-search' onkeyup='getDeparttreeContent(this,\"" +opts._id+"\");' />");
			var appendDiv=$("<div id='append_"+opts._id+"'  class='combo-panel panel-body panel-body-noheader' style='position: absolute; background-color: white;display:none'></div>");
			inputComboTree.wrap("<div  style='background-color:#fff;'></div>");
			if($("#input_"+opts._id).length<=1){
				panel.before(comdition);
				panel.before(inputComboTree);
				panel.before(appendDiv);
				var url = location.search; //获取url中"?"符后的字串   
					var theRequest;   
					if (url.indexOf("?") != -1) {   
						var str = url.substr(1);   
						strs = str.split("&");   
						for(var i = 0; i < strs.length; i ++) {  
							if(strs[i].split("=")[0] === 'pageInterfaceNo'){
								theRequest = unescape(strs[i].split("=")[1]); 
							}
						}   
					}
					//汇总关系
				$("#relation_info_noDepartTree").combobox({
					url:"/system/select/options/relationInfoNo",
					queryParams:{pageInterfaceNo:theRequest},
					panelClose:'Y',
					icons:[{
						iconCls:"icon-clear",
						handler:function(){
							$("#relation_info_noDepartTree").combobox("setValue","");
						}
					}],
					panelMinWidth:120,
					panelMaxWidth:320,
					valueField:'item_no',    
						textField:'item_name',
						gatherFlag:'Y',
						type:"select",
									componentType:"relationInfoNo",
						onLoadSuccess:function(){//设置默认值
						if(opts.value  !== "" && opts.value !== null ){
							for(var index in opts.data){
									if(opts.data[index].is_default=='Y'){
										$("#relation_info_noDepartTree").combobox("setValue",data[index].item_no);
										break;
									}
								}
						}else{
							var data = $("#relation_info_noDepartTree").combobox("getData");
							if(data.length > 0){
								$("#relation_info_noDepartTree").combobox("setValue",data[0].item_no);
							}
						}
						},
						onChange:function(newValue,oldValue){//添加汇总关系事件
							if(tree){
								tree.tree("reload");
							}
						}
				});
				//树类型
				$("#br_no_typeDepartTree").combobox({
					panelClose:'Y',
					icons:[{
						iconCls:"icon-clear",
						handler:function(){
							$("#br_no_typeDepartTree").combobox("setValue","");
						}
					}],
					valueField:'item_no',    
						textField:'item_name',
						panelHeight:100,
						onChange:function(newValue,oldValue){
							if(tree){
								tree.tree("reload");
							}
						}
				});
				//日期
				$("#rpt_dateDepartTree").datebox({
					panelClose:'Y',
					required:true,
					icons:[{
						iconCls:"icon-clear",
						handler:function(){
							$("#rpt_dateDepartTree").datebox("setValue","");
						}
					}],
						onChange:function(newValue,oldValue){
							if(tree){
								tree.tree("reload");
							}
						}
				});
				//【树类型】
				var data = [ {
									item_no : '1',
									item_name : '实时机构树'
							}, {
									item_no : '2',
									item_name : '历史机构树'
							}];
							$("#br_no_typeDepartTree").combobox('loadData', data);
							$("#br_no_typeDepartTree").combobox("setValue", '1');
							
							//设置默认时间
						
			}
		}
		if (!tree){
			panel.css({backgroundColor:'#59AEA2'});
			tree = $('<ul></ul>').appendTo(panel);
			$.data(target, 'departtree').tree = tree;
		}
		
		tree.tree($.extend({}, opts, {
			onBeforeLoad:function(node, param){
				const sessionDate = sessionStorage.getItem('golbal_tbsdy');
				var qryDate = $("#rpt_dateDepartTree").datebox("getValue");
					var relInfo = $("#relation_info_noDepartTree").combobox("getValue");
					var br_no_type = $("#br_no_typeDepartTree").combobox("getValue");
					if (qryDate == "" || br_no_type == "1") {
							qryDate = sessionDate;
					}
					if (relInfo == "") {
							relInfo = "AAAAAA";
					}
					
					opts.queryParams.relInfo = relInfo;
					opts.queryParams.br_no_type = br_no_type;
			},
			checkbox: opts.multiple,
			onLoadSuccess: function(node, data){
				var values = $(target).departtree('getValues');
				if (opts.multiple){
					var nodes = tree.tree('getChecked');
					for(var i=0; i<nodes.length; i++){
						var id = nodes[i].id;
						(function(){
							for(var i=0; i<values.length; i++){
								if (id == values[i]) return;
							}
							values.push(id);
						})();
					}
				}
				$(target).departtree('setValues', values);
				//opts.onLoadSuccess.call(this, node, data);
			},
			onClick: function(node){
				if (opts.multiple){
					$(this).tree(node.checked ? 'uncheck' : 'check', node.target);
				} else {
					$(target).combo('hidePanel');
				}
				retrieveValues(target);
				//opts.onClick.call(this, node);
			},
			onCheck: function(node, checked){
				retrieveValues(target);
				//opts.onCheck.call(this, node, checked);
			}
		}));
	}

	function retrieveValues(target){
		var state = $.data(target, 'departtree');
		var opts = state.options;
		var tree = state.tree;
		var vv = [], ss = [];
		if (opts.multiple){
			var nodes = tree.tree('getChecked');
			for(var i=0; i<nodes.length; i++){
				vv.push(nodes[i].id);
				ss.push(nodes[i].text);
			}
		} else {
			var node = tree.tree('getSelected');
			if (node){
				vv.push(node.id);
				ss.push(node.text);
			}
		}
		$(target).combo('setText', ss.join(opts.separator)).combo('setValues', opts.multiple?vv:(vv.length?vv:['']));
	}

	function setValues(target, values){
		var state = $.data(target, 'departtree');
		var opts = state.options;
		var tree = state.tree;
		var topts = tree.tree('options');
		var onCheck = topts.onCheck;
		var onSelect = topts.onSelect;
		topts.onCheck = topts.onSelect = function(){};

		tree.find('span.tree-checkbox').addClass('tree-checkbox0').removeClass('tree-checkbox1 tree-checkbox2');
		if (!$.isArray(values)){values = values.split(opts.separator)}
		var vv = $.map(values, function(value){return String(value)});
		var ss = [];
		$.map(vv, function(v){
			var node = tree.tree('find', v);
			if (node){
				tree.tree('check', node.target).tree('select', node.target);
				ss.push(node.text);
			} else {
				ss.push(v);
			}
		});
		if (opts.multiple){
			var nodes = tree.tree('getChecked');
			$.map(nodes, function(node){
				var id = String(node.id);
				if ($.inArray(id, vv) == -1){
					vv.push(id);
					ss.push(node.text);
				}
			});
		}
		topts.onCheck = onCheck;
		topts.onSelect = onSelect;
	//		retrieveValues(target);
		$(target).combo('setText', ss.join(opts.separator)).combo('setValues', opts.multiple?vv:(vv.length?vv:['']));
	}
	$.fn.departtree=function (options, param){
	//	if (typeof options == "string") {
	//		return $.fn.combotree(this,param);
	//	}
		if (typeof options == 'string'){
			var method = $.fn.departtree.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.combotree(options, param);
			}
		}
		
			options = options || {
					iconWidth: 22,
					editable:false
			};
			return this.each(function(){//展示具体的功能 ,出现多次情况下使用each 来比遍历
				var state = $.data(this, 'departtree');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'departtree', {
					options: $.extend({}, $.fn.departtree.defaults, $.fn.departtree.parseOptions(this), options)
				});
			}
			create(this);
			});
	};
	$.fn.departtree.methods = {
		options: function(jq){
			var copts = jq.combo('options');
			return $.extend($.data(jq[0], 'departtree').options, {
				width: copts.width,
				height: copts.height,
				originalValue: copts.originalValue,
				disabled: copts.disabled,
				readonly: copts.readonly
			});
		},
		clone: function(jq, container){
			var t = jq.combo('clone', container);
			t.data('departtree', {
				options: $.extend(true, {}, jq.departtree('options')),
				tree: jq.departtree('tree')
			});
			return t;
		},
		tree: function(jq){
			return $.data(jq[0], 'departtree').tree;
		},
		loadData: function(jq, data){
			return jq.each(function(){
				var opts = $.data(this, 'departtree').options;
				opts.data = data;
				var tree = $.data(this, 'departtree').tree;
				tree.tree('loadData', data);
			});
		},
		reload: function(jq, url){
			return jq.each(function(){
				var opts = $.data(this, 'departtree').options;
				var tree = $.data(this, 'departtree').tree;
				if (url) opts.url = url;
				tree.tree({url:opts.url});
			});
		},
		setValues: function(jq, values){
			return jq.each(function(){
				setValues(this, values);
			});
		},
		setValue: function(jq, value){
			return jq.each(function(){
				setValues(this, [value]);
			});
		},
		clear: function(jq){
			return jq.each(function(){
				var tree = $.data(this, 'departtree').tree;
				tree.find('div.tree-node-selected').removeClass('tree-node-selected');
				var cc = tree.tree('getChecked');
				for(var i=0; i<cc.length; i++){
					tree.tree('uncheck', cc[i].target);
				}
				$(this).combo('clear');
			});
		},
		reset: function(jq){
			return jq.each(function(){
				var opts = $(this).departtree('options');
				if (opts.multiple){
					$(this).departtree('setValues', opts.originalValue);
				} else {
					$(this).departtree('setValue', opts.originalValue);
				}
			});
		}
	};
	$.fn.departtree.parseOptions = function(target){
		return $.extend({}, $.fn.combo.parseOptions(target), $.fn.tree.parseOptions(target));
	};

	// var nodeIndex = 1;
	// var defaultView = {
	// 	render: function(target, ul, data) {
	// 		var state = $.data(target, 'tree');
	// 		var opts = state.options;
	// 		var pnode = $(ul).prev('.tree-node');
	// 		var pdata = pnode.length ? $(target).tree('getNode', pnode[0]) : null;
	// 		var depth = pnode.find('span.tree-indent, span.tree-hit').length;
	// 		var cc = getTreeData.call(this, depth, data);
	// 		$(ul).append(cc.join(''));
	//
	// 		function getTreeData(depth, children){
	// 			var cc = [];
	// 			for(var i=0; i<children.length; i++){
	// 				var item = children[i];
	// 				if (item.state != 'open' && item.state != 'closed'){
	// 					item.state = 'open';
	// 				}
	// 				item.domId = '_easyui_tree_' + nodeIndex++;
	// 				cc.push('<li>');
	// 				cc.push('<div id="' + item.domId + '" class="tree-node">');
	// 				for(var j=0; j<depth; j++){
	// 					cc.push('<span class="tree-indent"></span>');
	// 				}
	// 				if (item.state == 'closed'){
	// 					cc.push('<span class="tree-hit tree-collapsed"></span>');
	// 					cc.push('<span class="tree-icon tree-folder ' + (item.iconCls?item.iconCls:'') + '"></span>');
	// 				} else {
	// 					if (item.children && item.children.length){
	// 						cc.push('<span class="tree-hit tree-expanded"></span>');
	// 						cc.push('<span class="tree-icon tree-folder tree-folder-open ' + (item.iconCls?item.iconCls:'') + '"></span>');
	// 					} else {
	// 						cc.push('<span class="tree-indent"></span>');
	// 						cc.push('<span class="tree-icon tree-file ' + (item.iconCls?item.iconCls:'') + '"></span>');
	// 					}
	// 				}
	// 				if (this.hasCheckbox(target, item)){
	// 					var flag = 0;
	// 					var selectScope = this.getSelectScope(target);
	// 					if(selectScope ==='1' ||(selectScope === '2' && item.is_gather === "Y")
	// 							||(selectScope === '3' && (item.children == undefined || (item.children !== undefined && item.children.length === 0)))){
	// 						if (pdata && pdata.checkState=='checked' && opts.cascadeCheck){
	// 							flag = 1;
	// 							item.checked = true;
	// 						} else if (item.checked){
	// 							$.easyui.addArrayItem(state.tmpIds, item.domId);
	// 						}
	// 						item.checkState = flag ? 'checked' : 'unchecked';
	// 						cc.push('<span class="tree-checkbox tree-checkbox' + flag + '"></span>');
	// 					}
	// 				} else {
	// 					item.checkState = undefined;
	// 					item.checked = undefined;
	// 				}
	// 				cc.push('<span class="tree-title">' + opts.formatter.call(target, item) + '</span>');
	// 				cc.push('</div>');
	//
	// 				if (item.children && item.children.length){
	// 					var tmp = getTreeData.call(this, depth+1, item.children);
	// 					cc.push('<ul style="display:' + (item.state=='closed'?'none':'block') + '">');
	// 					cc = cc.concat(tmp);
	// 					cc.push('</ul>');
	// 				}
	// 				cc.push('</li>');
	// 			}
	// 			return cc;
	// 		}
	// 	},
	//
	// 	getSelectScope: function(target){
	// 		var state = $.data(target, 'tree');
	// 		var opts = state.options;
	// 		return opts.selectscope;
	// 	},
	// 	hasCheckbox: function(target, item){
	// 		var state = $.data(target, 'tree');
	// 		var opts = state.options;
	// 		if (opts.checkbox){
	// 			if ($.isFunction(opts.checkbox)){
	// 				if (opts.checkbox.call(target, item)){
	// 					return true;
	// 				} else {
	// 					return false;
	// 				}
	// 			} else if (opts.onlyLeafCheck){
	// 				if (item.state == 'open' && !(item.children && item.children.length)){
	// 					return true;
	// 				}
	// 			} else {
	// 				return true;
	// 			}
	// 		}
	// 		return false;
	// 	}
	// };
	// $.fn.departtree.defaults = $.extend({}, $.fn.combo.defaults, $.fn.tree.defaults, {
	// 	editable: false,
	// 	view: defaultView,
	// });
})(jQuery);
