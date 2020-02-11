/**
 * 引用当前js文件，如果在src后添加参数src=....?init=Y 表示加载页面前添加遮罩层，提示页面正在加载
 * @tianming
 * @20140409
 */
const LoadMask = {
    LOAD:'正在加载数据,请稍等',
    CAL:'后台正在计算数据,请稍等',
    SUBMIT:'正在提交数据,请稍等',
    INIT:'页面正在初始化,请稍后',
    parent:'body',
    /**
	 * 页面加载时的初始化遮罩层方法
	 */
    init:function(){
        if($('#loading-mask').length==0){
            var html = this.__maskTemplate(this.INIT);
            document.write(html);
        }
    },
    /**
	 * 提交时调用，在页面添加遮罩层，
	 * @param {Object} msg 提示信息
	 */
    mask:function(msg){
        $(this.parent).append(this.__maskTemplate(msg));
    },
    setText:function(txt){
        $('.loading-indicator').html(txt);
    },
    onLoadData:function(){
        this.mask(this.LOAD);
    },
    onSubmit:function(){
        this.mask(this.SUBMIT);
    },
    onCal:function(){
        this.mask(this.CAL);
    },
    /**
	 * 移除遮罩层
	 */
    remove:function(){
        this.parent = 'body';
        setTimeout('$("#loading-mask").fadeOut(100,function(){$("#loading-mask").remove();$("#loading").remove();});',100);
    },
	
    __maskTemplate:function(msg){
        var str = '<div id="loading-mask" class="submitMask"></div>'+
                    '<div id="loading">'+
                    '	<div class="loading-indicator">'+msg+
                    '	</div>'+
                    '</div>';
        return str;
    }
};
export default LoadMask;
