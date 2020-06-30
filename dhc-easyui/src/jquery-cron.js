(function($){
	$(function(){
		
	});

	function create(target){
		var opts = $.data(target, 'cron').options;
		$(target).combo($.extend({}, opts, {
			panelWidth: opts.cellWidth,
			panelHeight: opts.cellHeight,
			onShowPanel: function(){
				var p = $(this).combo('panel');
				if (p.is(':empty')){
					
          $('<div class="cronSelector" id="cronSelector"></div>').appendTo(p);
					var cronSelector = $.cronSelector({
            container:'#cronSelector',
            locatedWeek:true
          });
					var cells = p.find('.cronSelector');
					cells._outerWidth(opts.cellWidth)._outerHeight(opts.cellHeight);
					cells.bind('click.cronSelector', function(e){
						
						$(target).cron('setValue', cronSelector.val());
						
					});
				}
			}
		}));
		
	}

	$.fn.cron = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.cron.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'cron');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'cron', {
					options: $.extend({}, $.fn.cron.defaults, $.fn.cron.parseOptions(this), options)
				});
			}
			create(this);
		});
	};

	$.fn.cron.methods = {
		options: function(jq){
			return jq.data('cron').options;
    },
    setValue: function(jq, value){
			return jq.each(function(){
				
				$(this).combo('setValue', value).combo('setText', value);
			})
		},
		
		clear: function(jq){
			return jq.each(function(){
				$(this).combo('clear');
			
			});
		}
	};

	$.fn.cron.parseOptions = function(target){
		return $.extend({}, $.fn.combo.parseOptions(target), {

		});
	};

	$.fn.cron.defaults = $.extend({}, $.fn.combo.defaults, {
		editable: false,
		cellWidth: 600,
		cellHeight: 300
	});

	$.parser.plugins.push('cron');
})(jQuery);
