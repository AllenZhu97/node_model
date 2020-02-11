(function($){
	$.parser.plugins.push("label");//注册扩展组件
	$.fn.label = function (options, param) {//定义扩展组件
	    //当options为字符串时，说明执行的是该插件的方法。
	    if (typeof options == "string") { }
	    options = options || { 
	    };
	    //当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
	    return this.each(function () {
	        var jq = $(this);
	        var str = options.value;
	        var relValue=options.relValue;
	        if(options.dataType == "date"&&str!=null){
	        	if(str == "0"){
			    	str = "---";
			    }else if (options.dataStyle == "3") {
			    	str = str.substr(0,4)+"-"+str.substr(4,2)+"-"+str.substr(6,2);
			    }else if(options.dataStyle == "4"){
			    	str = str.substr(0,4)+"/"+str.substr(4,2)+"/"+str.substr(6,2);
			    }else if(options.dataStyle == "1") {
			    	str = str.substr(0,4)+"年"+str.substr(4,2)+"月"+str.substr(6,2)+"日";
			    }
	        }
	        if(options.dataType == "money"){
	        	if(str!=null){
	        		str=formatNumberNoCent(str,1);
	        	}else if(relValue!=null){
	        			        		        	
	        		str= Easyui.amountCapit(relValue);
	        	}
	        	
	        }
	        jq.attr("value",str);
	        jq.attr("title",str);
	        jq.attr("readonly","readonly");
	        jq.addClass("textbox-value");
	        jq.css({"border":"0px","border-bottom-width":"1px","border-bottom-style":"solid",height:19});
	    });
	};
})(jQuery);