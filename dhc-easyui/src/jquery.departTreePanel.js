///@chenxiaodong 添加机构树组件
(function($){
	$.parser.plugins.push("departtreepanel");
	$.fn.departtreepanel = function (options, param) {//定义扩展组件

		//当options为字符串时，说明执行的是该插件的方法。
		if (typeof options == "string") {
			return $.fn.tree.apply(this, arguments);
		}
		options = options || {};
		//当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
		return this.each(function () {
			var jq = $(this);
			var instance = options.instance;//获取页面对象
			var opts = $.extend({}, $.fn.tree.parseOptions(this),$.fn.tree.methods, options);
			//tabPanle
			var tabHtml = "<div id='brNotab'  style='width:500px;height:35px;'></div>"
			//搜索框
			var divhtml = "<input id='kw' class=\"f-search\" onkeyup='getContentTreePanel(this,\"" + options._id + "\");'/>" + "<div id='append_" + options._id + "' class='combo-panel panel-body panel-body-noheader' style='position: absolute; background-color: #59AEA2;display:none;width:100%;height:198px;z-index:100;'></div>";
			//汇总关系
			var comdition = "<div style = 'width:540px;'>"
				
				+ "<span class='field-label' style='width: auto;'>汇总关系:&nbsp;</span>"
				+ "<input type='text'   name='relation_info_noDepartTreePanel'  id = 'relation_info_noDepartTreePanel' style='height: 18px; line-height: 18px;width: 130px;margin-right:3px;' class='combotree-f combo-f textbox-f' />"
				+ "</div>";
			jq.before(comdition);
			jq.before(tabHtml);
			jq.before(divhtml);
			
			$('#brNotab').tabs({
				border: false
			});
			
			$('#brNotab').tabs('add', {
				title: '账务树',
				content: '',
				closable: false
			});
			$('#brNotab').tabs('add', {
				title: '对比树',
				content: '',
				closable: false
			});
			$('#brNotab').tabs('add', {
				title: '报送树',
				content: '',
				closable: false
			});
			if(opts.TreePanelType == '2'){
				$('#brNotab').tabs('close','对比树')
				$('#brNotab').tabs('close','报送树')
			}
		   
			//汇总关系
			var pageInterfaceNo = instance.param.interfaceNo;
			 $("#relation_info_noDepartTreePanel").combobox({
				url: "/system/select/options/relationInfoNo",
				queryParams: {pageInterfaceNo: pageInterfaceNo},
				panelClose: 'Y',
				icons: [{
					iconCls: "icon-clear",
					handler: function () {
						$("#relation_info_noDepartTreePanel").combobox("setValue", "");
					}
				}],
				panelMinWidth: 120,
				panelMaxWidth: 320,
				valueField: 'item_no',
				textField: 'item_name',
				gatherFlag: 'Y',
				type: "select",
				onLoadSuccess: function () {//设置默认值
					var data = $("#relation_info_noDepartTreePanel").combobox("getData");
					for(var index in data){
						if(data[index].sys_base_yn=='Y'){
							$("#relation_info_noDepartTreePanel").combobox("setValue",data[index].item_no);
							break;
						} 
					}
				},
				onChange: function (newValue, oldValue) {//添加汇总关系事件
					reFreshTree();
				}
			}); 
			opts.onSelect = treeSelect;
			opts.onCheck = treeCheck;
			$.fn.tree.call(jq, opts);
			$('#brNotab').tabs({
				onSelect:function(title,index){
					var relInfo = $("#relation_info_noDepartTreePanel").combobox("getValue");
					if (relInfo != '') {
						reFreshTree();
					}
					
				}
			});
			function reFreshTree(){
				var opts = jq.tree('options');
				var relInfo = $("#relation_info_noDepartTreePanel").combobox("getValue");
				var tabVal = $("#brNotab").tabs('getSelected');
				var rptDate = $("#rpt_date").wrapper('getValue');
				var index = $('#brNotab').tabs('getTabIndex',tabVal);
				var rptDateVidate = $('#rpt_date').wrapper('isValid'); //校验日期是否符合规范
				if(!rptDateVidate){
					return false;
				}
				if (relInfo == "") {
					relInfo = "AAAAAA";
				}
				opts.queryParams.relation_info_no = relInfo;
				opts.queryParams.treeType = index;
				opts.queryParams.qryDate = rptDate;
				$.fn.tree.call(jq, opts);
			}
			
		});
		
	};

	/**
	 * 树面板选择后勾选节点
	 * @param node
	 * @returns
	 */
	function treeSelect(node){
		if(node.id == -1){
			return false;
		}
		if(node._checked){
			$(this).tree('uncheck',node.target);
		}else{
			$(this).tree('check',node.target);
		}
		var tabVal = $("#brNotab").tabs('getSelected');
		var br_no_type = $('#brNotab').tabs('getTabIndex',tabVal); //机构树类型 0-账务树 1-对比树 2-报送树
		var txBrno = '';
		var tree = $(this).tree('options');
		if(tree.isAsync){ //异步加载树后台重新获取查询机构
			var brNoArrVal = '';
			var brNos = isBrNosOrNo(this.id);
			if (brNos instanceof Array) {
				for (var i = 0; i < brNos.length; i++) {
					if (brNos.length == i + 1) {
						brNoArrVal = brNoArrVal + brNos[i];
					} else {
						brNoArrVal = brNoArrVal + brNos[i] + ',';
					}
				}
			} else {
				brNoArrVal = brNos.dep_no
			}
			txBrno = brNoArrVal;
		} else {
			var brNoChecked = $(this).tree('getChecked');
			for ( var x in brNoChecked) {
				txBrno = txBrno+brNoChecked[x].up_br_no+",";
			}
		}
		if ($('#sob_no').length > 0 ) {
			var sobNoOpts  = $('#sob_no').combotree('options');
			var relInfo = $("#relation_info_noDepartTreePanel").combobox("getValue");
			sobNoOpts.queryParams = {
				tx_br_no: txBrno,
				searchFlag: '01',
				relation_info_no: relInfo,
				isAsync: tree.isAsync,
				treeType: br_no_type,
				qryDate: $("#rpt_date").wrapper('getValue')
			};
			$.fn.combotree.call($("#sob_no"), sobNoOpts);
		}

		
		
	   //机构树面板如果sys_rel属性不为空，则需要处理机构与外围系统关系
		var sysName = tree.sys_rel;
		if (sysName != '' && sysName != undefined ) {
			sysLoadData(sysName,txBrno,relInfo,tree.isAsync);
		}
		
	}

	/**
	 * 树面板复选框勾选节点
	 * @param node
	 * @returns {boolean}
	 */
	function treeCheck(node){
		if(node.id == -1){
			$(node.target).find('span.tree-checkbox').removeClass(" tree-checkbox1");
			$(node.target).find('span.tree-checkbox').addClass(" tree-checkbox0");
			return false;
		}

		var tabVal = $("#brNotab").tabs('getSelected');
		var br_no_type = $('#brNotab').tabs('getTabIndex',tabVal); //机构树类型 0-账务树 1-对比树 2-报送树
		var txBrno = '';
		var tree = $(this).tree('options');
		if(tree.isAsync){ //异步加载树后台重新获取查询机构
			var brNoArrVal = '';
			var brNos = isBrNosOrNo(this.id);
			if (brNos instanceof Array) {
				for (var i = 0; i < brNos.length; i++) {
					if (brNos.length == i + 1) {
						brNoArrVal = brNoArrVal + brNos[i];
					} else {
						brNoArrVal = brNoArrVal + brNos[i] + ',';
					}
				}
			} else {
				brNoArrVal = brNos.dep_no
			}
			txBrno = brNoArrVal;
		} else {
			var brNoChecked = $(this).tree('getChecked');
			for ( var x in brNoChecked) {
				txBrno = txBrno+brNoChecked[x].up_br_no+",";
			}
		}
		if ($('#sob_no').length > 0 ) {
			var sobNoOpts  = $('#sob_no').combotree('options');
			var relInfo = $("#relation_info_noDepartTreePanel").combobox("getValue");
			sobNoOpts.queryParams = {
				tx_br_no: txBrno,
				searchFlag: '01',
				relation_info_no: relInfo,
				isAsync: tree.isAsync,
				treeType: br_no_type,
				qryDate: $("#rpt_date").wrapper('getValue')
			};
			$.fn.combotree.call($("#sob_no"), sobNoOpts);
		}
		
		//机构树面板如果sys_rel属性不为空，则需要处理机构与外围系统关系
		
		var sysName = tree.sys_rel;
		if (sysName != '' && sysName != undefined) {
			sysLoadData(sysName,txBrno,relInfo,tree.isAsync);
		}
	}


	/**
	 * 机构树勾选后加载机构关联的系统
	 * @returns
	 */
	function sysLoadData(sysName,txBrNo,gatherNo,isAsync) {
		   $.ajax({
			   url:basePath + "/system/select/options/getReportSystemInfo",
			   dataType:"json",
			   type:"post",
			   async:false,
			   data:{relation_info_no:gatherNo,departNo:txBrNo,isAsync:isAsync},
			   success:function(data){
				   $("#"+sysName).wrapper("loadData",data);
				   var flag=true;
				   if(data.length==0){
					   $("#"+sysName).wrapper("setValue","");
				   }else{
					   for(var i = 0; i < data.length ; i++){
						   if("0"==data[i].ITEM_NO){
							   $("#"+sysName).wrapper("setValue","0");
							   flag=false;
							   break;
						   }
					   }
					   if(flag){
						   $("#"+sysName).wrapper("setValue",data[0].ITEM_NO);
					   }
				   }
			   }
		   });
		
	}
	window.getContentTreePanel = getContentTreePanel;
	window.getComboTreePanleCon = getComboTreePanleCon;
	//输入事件
	function getContentTreePanel(obj,idtree) {
		treeid = idtree;
		textid = obj.id;
		//获取输入的值
		var kw = jQuery.trim($(obj).val());
		if (kw == "") {
			$("#append_"+treeid).hide().html("");
			return false;
		}
		//获取tree的所有节点
		var nodes=new Array();
		var roots=$("#"+treeid).tree('getRoots');
		nodes=nodes.concat(roots);
		for(var i=0;i<roots.length;i++){
			var root=roots[i];
			var children = $("#"+treeid).tree('getChildren',root.target);
			//初始化tree id
			for(var j=0;j<children.length;j++){
				var node = children[j];
				node.id = children[j].id;//修改bugid1515 by duanyuanpeng-20180521
				nodes = nodes.concat(node);
			}
			//nodes=nodes.concat(children);
		}
		var treeTaget =$("#"+treeid);
		var opts=treeTaget.tree('options');
		var isAsync=opts.isAsync;//判断当前树的加载方式
		if(isAsync){ //如果时异步加载，寻找父节点信息，并展开
			var relInfo = $("#relation_info_noDepartTreePanel").combobox("getValue");
			var tabVal = $("#brNotab").tabs('getSelected');
			var rptDate = $("#rpt_date").wrapper('getValue');
			var index = $('#brNotab').tabs('getTabIndex',tabVal);
			$.ajax({
				url:"/im/dhc/sys/controller/system/department/ReportTreeDataController",
				type:'post',
				async:false,
				dataType:'JSON',
				data:{id:roots.dep_no,treeType:index,kw:kw,qryDate:rptDate,relation_info_no:relInfo,treeSearch:"true"},
				success:function(result){
					nodes=result;

				}
			});
		}
		var html = "";
		//匹配并动态加载到下拉框中
		for (i = 0; i < nodes.length; i++) {
			var nodeId = null;
			var treeName = null;
			if(isAsync){
				treeName=nodes[i].name;
				nodeId=nodes[i].id;
			}else{
				treeName = nodes[i].text;
				nodeId=nodes[i].id;
			}
			if (new RegExp(kw).test(treeName)) {
				//动态加载下拉框和数据
				html = html + "<div style='width:100%;' class='item' onmouseenter='getFocus(this)' onClick='getComboTreePanleCon(this,\""+treeid+"\",\""+nodeId+"\");'>" + treeName + "</div>";
			}
		}
		if (html != "") {
			$("#append_"+treeid).show().html(html);
		} else {
			$("#append_"+treeid).hide().html("");
		}
	}

	//单击事件
	function getComboTreePanleCon(obj, treeid,nodeId,treeName) {
		var treeTaget =$("#"+treeid);
		var opts=treeTaget.tree('options');
		var isAsync=opts.isAsync;//判断当前树的加载方式
		if(isAsync){ //如果时异步加载，寻找父节点信息，并展开
			var relInfo = $("#relation_info_noDepartTreePanel").combobox("getValue");
			var tabVal = $("#brNotab").tabs('getSelected');
			var rptDate = $("#rpt_date").wrapper('getValue');
			var index = $('#brNotab').tabs('getTabIndex',tabVal);
			$.ajax({
				url:"/im/dhc/sys/controller/system/department/searchTreePanelDataByNodeId",
				type:'post',
				async:false,
				dataType:'JSON',
				data:{nodeId:nodeId,treeType:index,qryDate:rptDate,relation_info_no:relInfo,isAsync:false},
				success:function(result){
					$("#"+treeid).tree('loadData',result);

				}
			});
		}

		var nodesFind =treeTaget.tree('find', nodeId);   //找到当前的节点
		/* //获得选中节点的父节点
		 var parent=t.tree('getParent',nodesFind.target);
		 //展开父节点
		 t.tree('expand',parent.target);*/
		$(obj).css("background-color","#5F968D");

		//如果nodesFind 不为空 则表示当前树类型使用异步加载 否则使用同步加载。
		if(nodesFind!=null){
			extendAllParent(nodesFind,treeTaget);
			treeTaget.tree('scrollTo', nodesFind.target);     //滚动到当前节点
			treeTaget.tree('select', nodesFind.target);       //高亮显示

		}else{
			//使用异步加载时现先将dom节点的展示改成对应的树类型key+树名称  后设置树所对应的隐藏域的值。
			treeTaget.tree({
				onLoadSuccess:function(node, data){
					treeTaget.tree('setValue',treeName);
					$(":hidden[name=\""+treeid+"\"]").val(nodeId);
				}
			});

		}
		//将选择的设备显示到搜索框中

		$("#append_"+treeid).hide().html("");   //隐藏下拉框
		//treeTaget.combo('hidePanel');//隐藏下拉面板
	}

	//----------------start 多机构---------------------------
	//查找判断是不是多机构  机构树面板
	var allNodeName = {};
	var layerBrNos = ''; //存放底层机构
	function isBrNosOrNo(treeId) {
		layerBrNos = '';
		//var brNoArr = $('#'+treeId).tree('tree');
		var brNoChecked = $('#'+treeId).tree('getChecked');
		if (brNoChecked.length == 0) {
			return false
		}
		var parentBrNoArr = [];
		var resultBrNo = [];
		removeBrArr = [];
		//只有一个被勾选
		if (brNoChecked.length == 1) {
			layerBrNos = brNoChecked[0].dep_no;
			return brNoChecked[0];
		}

		//筛选有效数据
		for (var x in brNoChecked) {
			if (brNoChecked[x].is_gather == 'N') {
				layerBrNos = layerBrNos + brNoChecked[x].dep_no + ",";
			}
			allNodeName[brNoChecked[x].dep_no] = brNoChecked[x].text;
			parentBrNoArr.push(brNoChecked[x].dep_no);
			//现在现有的数组中筛选
			resultBrNo = removeSameBrNo(parentBrNoArr, brNoChecked[x].dep_no,
				brNoChecked[x].up_no);
			//移除元素有可能是下面元素的父节点
			if (removeBrArrExistParent(removeBrArr, brNoChecked[x].up_no)) {
				arrRemove(brNoChecked[x].dep_no, resultBrNo);
				removeBrArr.push(brNoChecked[x].dep_no);
			}

		}
		if (resultBrNo.length == 1) {
			return onlyOneBrNO(resultBrNo[0], brNoChecked)
		}

		return resultBrNo;

	}


	/**
	 * 判断当前节点的父节点是否存在，如果存在则去除
	 */
	var removeBrArr = [];

	function removeSameBrNo(allBrno, childBrNo, upBrNo) {
		if (arrContains(upBrNo, allBrno)) {
			removeBrArr.push(childBrNo);
			arrRemove(childBrNo, allBrno);
		}
		return allBrno;
	}

	/**
	 * 判断移除元素是不是当前节点的父节点
	 */
	function removeBrArrExistParent(removeBrArr, childBrNo) {
		if (arrContains(childBrNo, removeBrArr)) {
			return true;
		}
		return false;
	}

	/**
	 * 如果返回数组长度为1，返回机构详细信息
	 */
	function onlyOneBrNO(brNo, brNoChecked) {
		for (i in brNoChecked) {
			if (brNo == brNoChecked[i].dep_no) {
				return brNoChecked[i];
			}
		}
	}
	window.getFocus = getFocus;
	//获取焦点事件
	function getFocus(obj) {
		$(".item").removeClass("addbg");
		$(obj).addClass("addbg");
	}

	function extendAllParent(node,tree){
		while(node!=null){
			  //获得选中节点的父节点
			var parent=tree.tree('getParent',node.target);
			if(parent!=null){
				 //展开父节点
				tree.tree('expand',parent.target);
			}
			node=parent;
		}
		
	}


	/**
	 * 判断数据中是否包含添加的元素
	 * @param needle
	 * @param arr
	 * @returns {Boolean}
	 */
	function arrContains(needle, arr) {
		for (i in arr) {
			if (arr[i] == needle) return true;
		}
		return false;
	}

	/**
	 * 移除数组中制定的元素
	 * @param val
	 * @param arr
	 */
	function arrRemove(val, arr) {
		var index;
		//兼容indexOf方法
		if(Array.prototype.indexOf){
			index = arr.indexOf(val);
		}else{
			index = jQuery.inArray(val,arr);
		}
		if (index > -1) {
			arr.splice(index, 1);
		}
	}
})(jQuery);


