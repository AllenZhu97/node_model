var isEmpty = function (v){
    return v==null||v==undefined || v.length==0;
};
var number = function(v) {
    return isEmpty(v) || (!isNaN(v) && !/^\s+$/.test(v));			
};
var isMoney = function(v,p){
    if(v.length>0&&parseFloat(v)!=0){
        while(v.indexOf('0')==0&&v.indexOf('.')!=1){//如果输入的数字是以零开头，则先清楚数字前的零
            v = v.substring(1,v.length);  
        }
    }
    v = v.split(',').join('');
    if(v.length>0&&parseFloat(v)==0){
        v = '0.00';
    }
    if(v.length>0&& number(v)){
        var s = v;
        if(s.split('.')[0].length>14) return false;//小数点前最大14位
        if(v.indexOf('.')==v.length-1){// tianming 20130129
            s = v.substring(0,v.length-1);
        }
        var n = 2;
        if(p!=undefined){
            var temp = p.split('@');
            if(temp.length==1){
                if(temp[0]!='N'&&temp[0]!='Y'){
                    n = parseInt(temp[0]);
                }						    	
            }else if(temp.length==2){
                n = parseInt(temp[1]);
            }
        }
            
        s = s.replace('-','');//
        if(s.indexOf('.')==-1){
            if(n==2){
                s +='.00';
            }else{
                s +='.';
                for(var i = 0;i<n;i++){
                    s += '0';
                }
            }
        }
        if(p!=undefined&&p.split('@')[0]=='N') {
            s = (s + '').replace(/[^0-9\.-]/g, '') + ''; 
        }else{
            s = parseFloat((s + '').replace(/[^0-9\.-]/g, '')).toFixed(n) + ''; 
        } 
            
        if(p!=undefined){
            var temp1 = p.split('@');
            if(temp1.length==1){
                if(temp1[0]!='N'&&temp1[0]!='Y'){
                    s = s.split('.');
                    var temp2 = s[1];
                    if(s[1].length<6){
                        for(var x = 0;x<6-s[1].length;x++){
                            temp2+='0';
                        }
                    }
                    s = s[0]+'.'+temp2;
                }						    	
            }else if(temp1.length==2){
                s = s.split('.');
                var temp3 = s[1];
                if(s[1].length<6){
                    for(var y = 0;y<6-s[1].length;y++){
                        temp3+='0';
                    }
                }
                s = s[0]+'.'+temp3;
            }
        }
            
        var l = s.split('.')[0].split('').reverse();
        var r = s.split('.')[1];
        var t = '';   
        /*将k改成局部变量 20121015 湖南星沙*/
        for(var k = 0; k < l.length; k ++ )
        {   
            t += l[k] + ((k + 1) % 3 == 0 && (k + 1) != l.length ? ',' : '');   
        }   
        if(v.indexOf('-')>-1){
            v = '-'+t.split('').reverse().join('') + '.' + r;   
        }else{
            v = t.split('').reverse().join('') + '.' + r;
        }
        // this.element.value =v;
        return true;
    }else if(v.length==0){
        return true;
    }else{
        return false;
    }
};
export default {
    equal_ignore_case: {
        validator: function(v, p){
            return v.toLowerCase() == p.toLowerCase();
        },
        message:function(_v, p){
            return '[输入的值必须与' + p + '相符(不区分大小写).]';
        }
    },
    required: {
        validator: function(v) {
            //增加一个验证,防止输入空格 2012-09-28 suxiaogang	
            if(v==null||'请选择'==v||''==v || ''==v.replace(/^\s\s*/,'').replace(/\s\s*$/,'')) return false;
            return true;
        },
        message:'[此项不可为空]'
    },
    integer: {
        validator: function(v) {
            if (isEmpty(v)) return true;
            var f = parseFloat(v);
            return (!isNaN(f) && f.toString() == v && Math.round(f) == f);
        },
        message:'请输入一个正确的整数值.'
    },
    number: {
        validator: function(v) {
            return isEmpty(v) || (!isNaN(v) && !/^\s+$/.test(v));			
        },
        message:'请输入一个正确的数字.'
    },
    digits: {
        validator: function(v) {
            return isEmpty(v) || !/[^\d]/.test(v);
        },
        message:'请输入一个非负整数,含0.'
    },
    positiveInteger: {
        validator: function(v) {
            return isEmpty(v) || !/[^\d]/.test(v) && parseFloat(v)>0;
        },
        message: '请输入一个大于0的整数.'
    },
    positive:{
        validator: function(v) {
            return isEmpty(v) || parseFloat(v)>0;
        }, 
        message: '[请输入一个正数]'
    },
    nonnegative: {
        validator:function(v) {
            return isEmpty(v) || parseFloat(v)>=0;
        },
        message: '[请输入一个非负数]'
    },
    date: {
        validator: function(v) {
            if(v.length>0) {
                if(v.length!=8) return false;
                var iYear=new Number(v.substr(0,4));
                var iMonth=new Number(v.substr(4,2))-1;
                var iDate=new Number(v.substr(6,2));
              
                var sDay=iYear+''+iMonth+''+iDate;
              
                var dDate=new Date(iYear,iMonth,iDate);
                var sNewDate=dDate.getFullYear()+''+dDate.getMonth()+''+dDate.getDate();
                if(sNewDate!=sDay){
                    v='';
                    return false;
                }
            }
            return true;
        }, 
        message:'请输入正确的日期格式,比如:20121224'
    },
    time: {
        validator: function(v) {
            var a = v.match(/^(\d{2})(:)?(\d{2})\2(\d{2})$/);
			if (a == null) {
				return false;
			}
			if (a[1]>24 || a[3]>60 || a[4]>60){
				return false
			}
			return true;
        },
        message:'请输入正确的日期格式,比如: 00:00:00'
    },
    length: {
        validator: function(v, p, opts) {
            var namespace = opts.instance.namespace;
            var initValue = $("#"+opts._id).wrapper("getInitValue", namespace); //输入框的初始值
			if(v==initValue ){ // @modify chenxiaodong 添加初始化值为空的时候不进行判断
				return true;
			} else {
				if (p === undefined) {
					return true;
				} else {
			        return v.length == parseInt(p);
				}	
			}
        },
        message: function (v, p, opts) {
	        return '[输入字符长度等于' + p + '个.]';
	    }
    },
    min_length: {
        validator: function (v, p) {
            if (p === undefined) {
                return true;
            } else {
                return v.length >= parseInt(p);
            }
        },
        message:function (_v, p) {
            return '输入字符长度不低于 ' + p + '个.';
        }
    },
    max_length: {
        validator: function (v, p) {
            if (p === undefined) {
                return true;
            } else {
                //增加汉字处理 houwei 20120903
                var reg = /[^\x00-\xff]/gm;
                v=v.replace(reg,'aa');//全换成单字节字符计算
                return v.length <= parseInt(p);
            }
        },
        message:function (_v, p) {
            return '输入字符长度不大于' + p + '个.';
        }
    },
    isPhone: {
        validator: function (v){
            var patrn=/(^(0[0-9]{2,4})-[0-9]{6,8}$)|^((1[0-9]{1})+\d{9})$/;
            if(!patrn.exec(v)){
                return false;
            }
            return true;
        },
        message:'[输入不正确，电话号码只能包括数字和-]'
    },
    compareWith: {
        validator: function(v, p, opts){
            var namespace = opts.instance.namespace;
            var info = p[0].split('@');
            v = v.split(',').join('');//去除逗号
            if(!number(v)){
                var v2;
                if(number(info[1])){
                    v2 = info[1]+'';
                }else{
                    if(opts.instance.sysType == 'AMS'){ // 账户系统管理端特殊处理  add by zhuxingpeng 2020-02-07
                        if(info.length>2){  // 根据id获取值 add by heyh 2019-07-02  使用格式：compareWith;>=@id@prdtPlanManageView
                            v2 = $('#' + info[1],'#' + info[2]).wrapper('getValue');
                        }else{
                            v2 = $('#' + info[1]).wrapper('getValue');
                        }
                    } else{
                        if($('#'+info[1]).wrapper('getInitCapit', namespace)){//比较的输入项已初始化
                            v2 = $('#'+info[1]).wrapper('getInitValue', namespace);
                        }else{//未初始化
                            v2 = $('#'+info[1]).val();
                        }
                    }
                }
                if(v==v2){
                    return true;
                }
            }else{
                if(p == undefined) {
                    return true;
                } else {
                    var v3;
                    if(number(info[1])){
                        v3 = info[1]+'';
                    }else{
                        if(opts.instance.sysType == 'AMS'){ // 账户系统管理端特殊处理  add by zhuxingpeng 2020-02-07
                            if(info[1] == "sys_date"){
                                if(window.sys_date != undefined){
                                    v3 = window.sys_date;
                                }else{
                                    var date = new Date();
                                    var y = date.getFullYear();
                                    var m = date.getMonth()+1;
                                    var d = date.getDate();
                                    v3= y+ "" + (m<10?('0'+m):m)+""+ (d<10?('0'+d):d);
                                }
                           }else {
                               if(info.length>2){ // 根据id获取值 add by heyh 2019-07-02
                                   v3 = $('#' + info[1],'#' + info[2]).wrapper('getValue');
                               }else{
                                   v3 = $('#' + info[1]).wrapper('getValue');
                               }
                           }
                        } else {
                            if($('#'+info[1]).wrapper('getInitCapit', namespace)){//比较的输入项已初始化
                                v3 = $('#'+info[1]).wrapper('getInitValue', namespace);
                            }else{//未初始化
                                v3 = $('#'+info[1]).val();
                            }
                        }
                        
                    }
                    v3 = v3+'';
                    v3 = v3.split(',').join('');//去除逗号
                    if(!number(v3)){
                        return false;
                    }
                    if(v3.length==0) return true;
                    if(v.length==0) return true;
                    return eval(v+info[0]+v3)?true:false;
                }
            }
        },
        message: function(v_,p, opts){
            var namespace = opts.instance.namespace;
            var info = p[0].split('@');
            var exemplar;
            if(number(info[1])){
                exemplar = info[1];
            }else{
                if(opts.instance.sysType == 'AMS'){
                    var comVal ="";
                    // 如果和当前系统日期做比较
                    if(info[1] == "sys_date"){
                        if(window.sys_date != undefined){
                            comVal = window.sys_date;
                        }else{
                            var date = new Date();
                            var y = date.getFullYear();
                            var m = date.getMonth()+1;
                            var d = date.getDate();
                            comVal= y+ "" + (m<10?('0'+m):m)+""+ (d<10?('0'+d):d);
                        }
                        exemplar = "当前系统日期";
                    }else{
                        //exemplar = $.Easyui.getLabelByName(info[1]);
                        if(info.length>2){ // 根据id获取值 add by heyh 2019-07-02
                            exemplar = $('#'+info[1]+"_wrapper span.field-label",'#' + info[2]).html();
                            comVal = $('#' + info[1],'#' + info[2]).wrapper('getValue');
                        }else{
                            exemplar = $('#'+info[1]+"_wrapper span.field-label").html();
                            comVal = $('#' + info[1]).wrapper('getValue')
                        }
                    }
                    exemplar = exemplar+"["+comVal+"] "; 
                } else{
                    exemplar = $('#'+info[1]).wrapper('getInitValue', namespace);
                }
                
            }
            
            switch(info[0]){
                case '>':info[0] = '大于';break;
                case '>=':info[0] = '大于等于';break;
                case '<':info[0] = '小于';break;
                case '<=':info[0] = '小于等于';break;
                case '==':info[0] = '等于';break;
                case '!=':info[0] = '不等于';break;
            }
            return '[输入值应'+info[0]+exemplar+']';
        }
    },
    isPosMoney:{
        validator: function(v) {
            v = v.split(',').join('');
            if(v.length == 0) return true;
            return parseFloat(v)>0 && isMoney(v) ;
        }, 
        message:function(v){
            var result = '[输入的金额应大于0]';
            if (!isMoney(v)) {
                result = '[金额格式不正确]';
            }
            return result;
        }
    },
    alphabet: {
        validator: function(num,p,opts) {
            var namespace = opts.instance.namespace;
            var initValue = $("#"+opts._id).wrapper("getInitValue", namespace);//输入框的初始值
            if(num==initValue ){
                return true;
            }
            return isEmpty(num) || /^[a-zA-Z]+$/.test(num);
		},
        message: '请输入一个正确的字母'
    },
    chenese: {
        validator: function(num,p,opts) {
            var namespace = opts.instance.namespace;
            var initValue = $("#"+opts._id).wrapper("getInitValue", namespace);//输入框的初始值
            if(num === initValue ){
                return true;
            }
            return isEmpty(num) || /^[\u0391-\uFFE5]+$/.test(num);
		},
        message: '请输入一个正确的中文'
    },
    noChenese: {
        validator: function(num,p,opts) {
            var namespace = opts.instance.namespace;
            var initValue = $("#"+opts._id).wrapper("getInitValue", namespace);//输入框的初始值
            if(num==initValue ){
                return true;
            }
            return isEmpty(num) || /^[\da-zA-Z!！@#$%^&*(),，。、；;:：、’//`~{}【】\[\]|"“‘'<>《》=\+-_\——·]+$/.test(num);
		},
        message: '请输入一个正确的数字+字母+特殊字符'
    },
    alpNumMix: {
        validator: function(num,p,opts) {
            var namespace = opts.instance.namespace;
            var initValue = $("#"+opts._id).wrapper("getInitValue", namespace);//输入框的初始值
            if(num === initValue ){
                return true;
            }
            var expression = eval("/^[0-9a-zA-Z]+$/");
            var regular = new RegExp(expression);
            return isEmpty(num) || regular.test(num);
		},
        message: '请输入一个正确的数字+字母'
    },
    prefixseq: {
        validator: function(v,p) {
			  var expression = eval("/^"+p+"/");
		  	  var regular = new RegExp(expression);
			  return isEmpty(v) || regular.test(v);
		  },
          message: function (_v, p) {
		      return '[请输入一个带有前缀的' + p + '字符串.]';
		  }
    },
    isMoney: {
        validator: function(v,p){
            if(v.length>0&&parseFloat(v)!=0){
                while(v.indexOf('0')==0&&v.indexOf('.')!=1){//如果输入的数字是以零开头，则先清楚数字前的零
                    v = v.substring(1,v.length);  
                }
            }
            v = v.split(',').join('');
            if(v.length>0&&parseFloat(v)==0){
                v = '0.00';
            }
            if(v.length>0&& number(v)){
                var s = v;
                if(s.split('.')[0].length>14) return false;//小数点前最大14位
                if(v.indexOf('.')==v.length-1){// tianming 20130129
                    s = v.substring(0,v.length-1);
                }
                var n = 2;
                if(p!=undefined){
                    var temp = p.split('@');
                    if(temp.length==1){
                        if(temp[0]!='N'&&temp[0]!='Y'){
                            n = parseInt(temp[0]);
                        }						    	
                    }else if(temp.length==2){
                        n = parseInt(temp[1]);
                    }
                }
                    
                s = s.replace('-','');//
                if(s.indexOf('.')==-1){
                    if(n==2){
                        s +='.00';
                    }else{
                        s +='.';
                        for(var i = 0;i<n;i++){
                            s += '0';
                        }
                    }
                }
                if(p!=undefined&&p.split('@')[0]=='N') {
                    s = (s + '').replace(/[^0-9\.-]/g, '') + ''; 
                }else{
                    s = parseFloat((s + '').replace(/[^0-9\.-]/g, '')).toFixed(n) + '';
                } 
                    
                if(p!=undefined){
                    var temp1 = p.split('@');
                    if(temp1.length==1){
                        if(temp1[0]!='N'&&temp1[0]!='Y'){
                            s = s.split('.');
                            var temp2 = s[1];
                            if(s[1].length<6){
                                for(var x = 0;x<6-s[1].length;x++){
                                    temp2+='0';
                                }
                            }
                            s = s[0]+'.'+temp2;
                        }						    	
                    }else if(temp1.length==2){
                        s = s.split('.');
                        var temp3 = s[1];
                        if(s[1].length<6){
                            for(var y = 0;y<6-s[1].length;y++){
                                temp3+='0';
                            }
                        }
                        s = s[0]+'.'+temp3;
                    }
                }
                    
                var l = s.split('.')[0].split('').reverse();
                var r = s.split('.')[1];
                var t = '';   
                /*将k改成局部变量 20121015 湖南星沙*/
                for(var k = 0; k < l.length; k ++ )
                {   
                    t += l[k] + ((k + 1) % 3 == 0 && (k + 1) != l.length ? ',' : '');   
                }   
                if(v.indexOf('-')>-1){
                    v = '-'+t.split('').reverse().join('') + '.' + r;   
                }else{
                    v = t.split('').reverse().join('') + '.' + r;
                }
                // this.element.value =v;
                return true;
            }else if(v.length==0){
                return true;
            }else{
                return false;
            }
        },
        message:function(v_,p){
            var v = '';
            v = v_.split(',').join('');
            if(v.length>0&& number(v)){
                var s = v;
                s = s.replace('-','');//
                if(s.split('.')[0].length>14)  return '[金额整数位最大14位]';//小数点前最大14位
                if(p!=undefined&&p=='N') {
                    s = (s + '').replace(/[^0-9\.-]/g, '') + ''; 
                }else if(p!=undefined&&!isNaN(p)){
                    s =  parseFloat((s + '').replace(/[^0-9\.-]/g, '')).toFixed(p) + ''; 
                }else{
                    s =  parseFloat((s + '').replace(/[^0-9\.-]/g, '')).toFixed(2) + ''; 
                }
                if(s.indexOf('.')==-1) s +='.00';
            }else{
                return '[金额格式不正确]';
            }
        }
    },
    isHoliday: {
        validator : function(v){
            var date = v;
            var returnString = '';
            jQuery.ajax({
                url:'/automake/controller/system/IsHolidayController',
                data:{date:date},
                async:false,
                success:function(data){
                    returnString = JSON.parse(data).result;
                }
            
            });
            if('1'==returnString){
                return true;
            }
            else{
                return false;
            }
        },
        message: '只能选择工作日'
    },
    alertHoliday: {
        validator: function(v){
            var date = v;
            var returnString = '';
            jQuery.ajax({
                url:'/automake/controller/system/IsHolidayController',
                data:{date:date},
                async:false,
                success:function(data){
                    returnString = JSON.parse(data).result;
                }
            
            });
            if('0'==returnString){
                alert('输入的是节假日');
                return true;
            }else if('1'==returnString){
                return true;
            }
            else{
                return false;
            }
        },
        message:'请输入正确日期格式'
    },
    validateRecord: {
        validator: function(num,p,opts){
            var namespace = opts.instance.namespace;
            var initValue = $('#'+opts._id).wrapper('getInitValue', namespace);//输入框的初始值
            var pArr = p[0].split('@');
            if(pArr.length>3&&pArr[3]=='Y'){
                if(num==initValue){
                    return true;
                }  
            }
            var where_val = pArr[2].split(',');
            for(var i=0; i<where_val.length; i++) {
            //	var where_val_ns = document.getElementsByName(where_val[i])[0].value; // 被验证的数据去掉首尾空格 zzh 20121206
                var where_val_ns = $('#'+where_val[i]).wrapper('getValue');
                if(opts._id==where_val[i]){
                    // 正在验证项无法获取输入值，所以直接判断赋值num（修改机构信息设置key校验时发现次问题） add by heyh 20170928
                    where_val_ns=num;
                }
                where_val_ns = where_val_ns.replace(/(^\s*)|(\s*$)/g, '');
                pArr[1] = pArr[1].replace('?','\''+where_val_ns+'\'');
            }
            pArr[1] = pArr[1].split(',').join(' and ');
            // 增加常量条件查询  add by heyh 20170928 departUpdate.jsp界面机构号
            pArr[1] = pArr[1].split('#').join('\'');
            
            var returnString='';
            jQuery.ajax({
                url:'/financemanage/validateRecord',
                data:{pArr0:pArr[0], pArr1:pArr[1]},
                async:false,
                dataType: 'text',
                success:function(rs){
                    returnString = rs;
                }
            });
            if('0000'==returnString) {
                return true;
            } else {
                return false;
            }
        },
        message:'已经存在记录'
    },
    issbccase :{
        validator: function(str)   {   
            for(var i=0;i<str.length;i++){      
                var strCode=str.charCodeAt(i); 
                alert(strCode);     
                if((strCode>65248)||(strCode==12288)){      
                    return false;    
                }    
            }     
            return true;
        },
        message:'［输入的内容包含全角字符］'
    },
    alphanum:{
        validator:function(v) {
            var patrn=/^[A-Za-z0-9]+$/;
            if(!patrn.exec(v)){
                return false;
            }
            return true;
        },
        message:'［输入的内容只能包含英文字母和数字］'
    },
    isIpAddr: {
        validator: function (v){
            var patrnIp4 = /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))/;
            var patrnIp6 = /^([\\da-fA-F]{1,4}:){7}([\\da-fA-F]{1,4})$/;
            if(!patrnIp4.exec(v)&&!patrnIp6.exec(v)){
                return false;
            }
            return true;
          },
          message:'［输入不正确，请输入正确格式ip地址］'
    }
};