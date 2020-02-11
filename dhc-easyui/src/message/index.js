import toastr from 'toastr';
export default {
    // 消息提示插件toastr
    toastrMethod: function() {
        toastr.options = {
            // preventDuplicates: true 重复内容的提示框只出现一次，无论提示框是打开还是关闭
            // preventOpenDuplicates: true 重复内容的提示框在开启时只出现一个
            // 如果当前的提示框已经打开，不会多开。直到提示框关闭后，才可再开)
            'tapToDismiss': false,// 设置toastr被点击时关闭
            // "onclick": null,
            'closeButton': true, // 是否显示关闭按钮
            'debug': false, // 是否使用debug模式
            'positionClass': 'toast-top-center',
            'showDuration': '3000',// 显示的动画时间
            'hideDuration': '1000',// 消失的动画时间
            // "extendedTimeOut": "1000",//加长展示时间
            'showEasing': 'swing',// 显示时的动画缓冲方式
            'hideEasing': 'linear',// 消失时的动画缓冲方式
            'showMethod': 'fadeIn',// 显示时的动画方式
            'hideMethod': 'fadeOut' // 消失时的动画方式
        };
    },
    // 成功提示绑定
    success: function(content) {
        this.toastrMethod();
        if (content == undefined) {
            content = '成功提示绑定';
        }
        toastr.success(content);
    },
    // 信息提示绑定
    info: function(content) {
        this.toastrMethod();
        if (content == undefined) {
            content = '信息提示绑定';
        }
        toastr.info(content);
    },
    // 清除窗口绑定
    clear: function(content) {
        this.toastrMethod();
        if (content == undefined) {
            content = '清除窗口绑定';
        }
        toastr.clear();
    },
     // 错语提示绑定
     error: function(content,title) {
        this.toastrMethod();
        toastr.options.timeOut = '500000000';// 展现时间
        if (content == undefined) {
            content = '错语提示绑定';
        }
        toastr.error(content,title);
    },
    // 警告提示绑定
    warning: function(content) {
        this.toastrMethod();
        toastr.options.timeOut = '500000000';// 展现时间
        if (content == undefined) {
            content = '警告提示绑定';
        }
        toastr.warning(content);
    }
}