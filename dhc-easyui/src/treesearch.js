/**
 * add by zongzhenyang
 * 20160720
 */
var treeid;
var textid;
$(function () {
    //键盘事件
    $(document).keydown(function (e) {
    	e = e || window.event;
        var keycode = e.which ? e.which : e.keyCode;
        //键盘Up事件
        if (keycode == 38) {
            if (jQuery.trim($("#append_"+treeid).html()) == "") {
                return;
            }
            movePrev();
            //键盘Down事件
        } else if (keycode == 40) {
            if (jQuery.trim($("#append_"+treeid).html()) == "") {
                return;
            }
            $("#"+textid).blur();
            if ($(".item").hasClass("addbg")) {
                moveNext();
            } else {
                $(".item").removeClass('addbg').eq(0).addClass('addbg');
            }
            //键盘回车Enter
        } else if (keycode == 13) {
            dojob();
        }
    });

    //向上移动
    var movePrev = function () {
        $("#" + textid).blur();
        var index = $(".addbg").prevAll().length;
        if (index == 0) {
            $(".item").removeClass('addbg').eq($(".item").length - 1).addClass('addbg');
        } else {
            $(".item").removeClass('addbg').eq(index - 1).addClass('addbg');
        }
    }
    //向下移动
    var moveNext = function () {
        var index = $(".addbg").prevAll().length;
        if (index == $(".item").length - 1) {
            $(".item").removeClass('addbg').eq(0).addClass('addbg');
        } else {
            $(".item").removeClass('addbg').eq(index + 1).addClass('addbg');
        }

    }

    //公共方法
    var dojob = function () {
    	$("#append_"+treeid).show();
        $("#" + textid).blur();     //失去焦点事件
        var node = $("#" + treeid).tree('getChildren');    //获取Tree的所有节点
        $("#" + treeid).tree('expandAll', node.target);    //展开所有节点
        var value = $(".addbg").text();        //获取文本框输入的内容

        //查找相应节点并滚动到该节点，高亮显示
        for (i = 0; i < node.length; i++) {
            var treeId = node[i].id;
            var treeName = node[i].text;
            //找到相应的设备
            if (treeName.indexOf(value) >= 0) {
                if (treeName==value) {
                    var nodes = $("#" + treeid).tree('find', treeId);   //找到当前的节点
                    $("#" + treeid).tree('scrollTo', nodes.target);     //滚动到当前节点
                    $("#" + treeid).tree('select', nodes.target);       //高亮显示
                    
                }
                
            }
        }
        $("#" + textid).val(value);    //将选择的设备显示到搜索框中
        $("#append_"+treeid).hide().html("");   //隐藏下拉框

    }

});
//输入事件
function getContent(obj,idtree) {
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
 
    var html = "";
    //匹配并动态加载到下拉框中
    for (i = 0; i < nodes.length; i++) {
        var nodeId = nodes[i].id;
        var treeName = nodes[i].text;
        if (new RegExp(kw).test(treeName)) {
            //动态加载下拉框和数据
            html = html + "<div style='width:100%;' class='item' onmouseenter='getFocus(this)' onClick='getCon(this,\""+treeid+"\",\""+nodeId+"\");'>" + treeName + "</div>";
        }
    }
    if (html != "") {
    	$("#append_"+treeid).show().html(html);
    } else {
    	$("#append_"+treeid).hide().html("");
    }
}
//获取焦点事件
function getFocus(obj) {
    $(".item").removeClass("addbg");
    $(obj).addClass("addbg");
}
//单击事件
function getCon(obj, treeid,nodeId) {

    //查找相应节点并滚动到该节点，高亮显示
    var nodesFind = $("#" + treeid).tree('find', nodeId);
    var opts=$("#" + treeid).tree('options');
    //如果搜索的树是带有checkbox 点击搜索的值 将选中值设置为选中状态 
    if(opts.checkbox){
    	$("#" + treeid).tree('check',nodesFind.target);
    }
    	//找到当前的节点
        extendAllParent(nodesFind,$("#" + treeid));
        //跳转到选中节点
        $("#" + treeid).tree('scrollTo', nodesFind.target);     //滚动到当前节点
        //对节点选中
        //$("#" + treeid).tree('select', nodesFind.target);       //高亮显示
        //将节点背景置为红色
        var obj=$("#" + treeid).tree('getNode',nodesFind.target);
        $("div .tree-node-selected").removeClass("tree-node-selected");
        $(obj.target).addClass("tree-node-selected");
        //$(obj.target).css("background-color","red");

        //$("#" + textid).wrapper('setValue',nodeId);    //将选择的设备显示到搜索框中
        $("#append_"+treeid).hide().html("");   //隐藏下拉框
        // 延迟处理  add by heyh 2018-01-11
        setTimeout('afClick();',100);

    
    	
    }
/**
 * 延迟处理方法 将选择的设备显示到搜索框中
 * @author heyh
 * @date 2018-01-18
 */
function afClick(){
	var seleNode =  $("#" + treeid).tree('getSelected');
	$("#" + treeid).tree('select',seleNode.target);
	if(seleNode){
		 $("#" + textid).val(seleNode.text);    //将选择的设备显示到搜索框中
	}	
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

//输入事件
function getCombotreeContent(obj,idtree) {
    treeid = idtree;
    
    textid = obj.id;
    var nodes=new Array();
    var treeTaget =$("#"+treeid);
    if(typeof(targetDataGrid) != "undefined"){ //datagrid combotree添加搜索  caolele 20180723
    	treeTaget = targetDataGrid;
    }
    var t = treeTaget.combotree('tree');	// 获取树对象
    var roots=t.tree('getRoots');
    nodes=nodes.concat(roots);
    for(var i=0;i<roots.length;i++){
    	var root=roots[i];
    	var children = t.tree('getChildren',root.target);
    	nodes=nodes.concat(children);
    }
    //获取tree的所有节点
    //var nodes = $("#"+treeid).combotree('getChildren');
    //获取输入的值
    var kw = jQuery.trim($(obj).val());
    if (kw == "") {
        $("#append_"+treeid).hide().html("");
        return false;
    }
    var html = "";
    var opts=treeTaget.combotree('options');
    var isAsync=opts.isAsync;//判断当前树的加载方式
    if(isAsync){
    	var tree_type=opts.tree_type;
        $.ajax({
            url:"/system/common/action/searchTreeDataByKeyWord",
            type:'post',
            async:false,
            dataType:'JSON',
            cache:false,
            data:{keyword:kw,tree_type:tree_type},
            success:function(result){
                nodes=result;
            },
            error:function(jqXHR, textStatus, errorThrown){
                   alert(jqXHR.responseText,false);
            }
        });
    }

    //匹配并动态加载到下拉框中
    for (i = 0; i < nodes.length; i++) {
         var treeName=null;
         var nodeId=null;
        if(isAsync){
        	if(nodes[i].key!=undefined){
        		treeName="["+nodes[i].key+"]"+nodes[i].name; 
        	}else{
        		treeName=nodes[i].treeName
        	}
            nodeId=nodes[i].nodeid;
        }else{
             treeName = nodes[i].text;
             nodeId=nodes[i].id;
        }
        if (treeName!=null&&treeName.indexOf(kw) >= 0) {
            //动态加载下拉框和数据
            html = html + "<div style='width:500px;' class='item' onmouseenter='getFocus(this)' onClick='getComboTreeCon(this,\""+treeid+"\",\""+nodeId+"\",\""+treeName+"\");'>" + treeName + "</div>";
        }
    }
    if (html != "") {
        $("#append_"+treeid).show().html(html);
    } else {
        $("#append_"+treeid).hide().html("");
    }
}

//单击事件
function getComboTreeCon(obj, treeid,nodeId,treeName) {
	var treeTaget =$("#"+treeid);
    if(typeof(targetDataGrid) != "undefined"){ //datagrid combotree添加搜索（通过target取到树对象）  caolele 20180723
    	treeTaget = targetDataGrid;
    }
	var t = treeTaget.combotree('tree');	// 获取树对象
    
    var nodesFind =t.tree('find', nodeId);   //找到当前的节点
   /* //获得选中节点的父节点
    var parent=t.tree('getParent',nodesFind.target);
    //展开父节点
    t.tree('expand',parent.target);*/
    $(obj).css("background-color","#5F968D");
     
    //如果nodesFind 不为空 则表示当前树类型使用异步加载 否则使用同步加载。
    if(nodesFind!=null){
        extendAllParent(nodesFind,t);
        t.tree('scrollTo', nodesFind.target);     //滚动到当前节点
        t.tree('select', nodesFind.target);       //高亮显示
        var obj= t.tree('getNode',nodesFind.target);
        treeTaget.combotree('setValue',nodeId);
        
    }else{
    	//使用异步加载时现先将dom节点的展示改成对应的树类型key+树名称  后设置树所对应的隐藏域的值。
    	treeTaget.combotree({
    		onLoadSuccess:function(node, data){
    			treeTaget.combotree('setValue',treeName); 
    	        $(":hidden[name=\""+treeid+"\"]").val(nodeId); 
    		}
    	});
    	
    }
     //将选择的设备显示到搜索框中
    
    $("#append_"+treeid).hide().html("");   //隐藏下拉框
    treeTaget.combo('hidePanel');//隐藏下拉面板
    /*触发点击事件 modify by wangkunkun 20180104
    var func = $(t).tree('options').onClick;
    if (func != null&&nodesFind!=null) {
        func.call(t, nodesFind);
    }*/
}

/**
 * 解决combotree搜索框匹配到内容，不选择下拉面板内容，点击页面其他地方，下拉面板不关闭bug
 * 为了不影响选中事件，延时触发失去焦点事件
 * @param treeid
 */
function Losefocus(treeid){
	window.setTimeout(
			function(){
				$("#append_"+treeid).hide().html("");  
                $("#"+treeid).combo('hidePanel');
                },200);
}





//输入事件
function getDeparttreeContent(obj,idtree) {
  treeid = idtree;
  textid = obj.id;
  var nodes=new Array();
  var treeTaget =$("#"+treeid);
  if(typeof(targetDataGrid) != "undefined"){ //datagrid combotree添加搜索  caolele 20180723
  	treeTaget = targetDataGrid;
  }
  var t = treeTaget.departtree('tree');	// 获取树对象
  var roots=t.tree('getRoots');
  nodes=nodes.concat(roots);
  for(var i=0;i<roots.length;i++){
  	var root=roots[i];
  	var children = t.tree('getChildren',root.target);
  	nodes=nodes.concat(children);
  }
  var kw = jQuery.trim($(obj).val());
  if (kw == "") {
      $("#append_"+treeid).hide().html("");
      return false;
  }
  var html = "";
  var opts=treeTaget.departtree('options');
  var isAsync=opts.isAsync;//判断当前树的加载方式
  if(isAsync){
  	var tree_type=opts.tree_type;
      $.ajax({
          url:"/system/common/action/searchTreeDataByKeyWord",
          type:'post',
          async:false,
          dataType:'JSON',
          cache:false,
          data:{keyword:kw,tree_type:tree_type},
          success:function(result){
              nodes=result;
          },
          error:function(jqXHR, textStatus, errorThrown){
                 alert(jqXHR.responseText,false);
          }
      });
  }

  for (i = 0; i < nodes.length; i++) {
       var treeName=null;
       var nodeId=null;
      if(isAsync){
      	if(nodes[i].key!=undefined){
      		treeName="["+nodes[i].key+"]"+nodes[i].name; 
      	}else{
      		treeName=nodes[i].treeName
      	}
          nodeId=nodes[i].nodeid;
      }else{
           treeName = nodes[i].text;
           nodeId=nodes[i].id;
      }
      if (treeName!=null&&treeName.indexOf(kw) >= 0) {
          html = html + "<div style='width:500px;' class='item' onmouseenter='getFocus(this)' onClick='getDepartTreeCon(this,\""+treeid+"\",\""+nodeId+"\",\""+treeName+"\");'>" + treeName + "</div>";
      }
  }
  if (html != "") {
      $("#append_"+treeid).show().html(html);
  } else {
      $("#append_"+treeid).hide().html("");
  }
}


//单击事件
function getDepartTreeCon(obj, treeid,nodeId,treeName) {
	var treeTaget =$("#"+treeid);
  if(typeof(targetDataGrid) != "undefined"){ //datagrid combotree添加搜索（通过target取到树对象）  caolele 20180723
  	treeTaget = targetDataGrid;
  }
	var t = treeTaget.departtree('tree');	// 获取树对象
  
  var nodesFind =t.tree('find', nodeId);   //找到当前的节点
  $(obj).css("background-color","#5F968D");
   
  if(nodesFind!=null){
      extendAllParent(nodesFind,t);
      t.tree('scrollTo', nodesFind.target);     //滚动到当前节点
      t.tree('select', nodesFind.target);       //高亮显示
      var obj= t.tree('getNode',nodesFind.target);
      treeTaget.departtree('setValue',nodeId);
      
  }else{
  	treeTaget.combotree({
  		onLoadSuccess:function(node, data){
  			treeTaget.departtree('setValue',treeName); 
  	        $(":hidden[name=\""+treeid+"\"]").val(nodeId); 
  		}
  	});
  	
  }
  $("#append_"+treeid).hide().html("");   //隐藏下拉框
  treeTaget.combo('hidePanel');//隐藏下拉面板
}

window.getDeparttreeContent = getDeparttreeContent;
window.getDepartTreeCon = getDepartTreeCon;

window.getComboTreeCon = getComboTreeCon;
window.getContent = getContent;
window.getFocus = getFocus;
window.getCon = getCon;
window.afClick = afClick;


