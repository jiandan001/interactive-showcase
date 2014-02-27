(function(){
	var num = 0;
	var runtime = 600;
	var latency = 2000;
	var control;
	var widths = 0;
	var lis
	var w
	/***程序入口***/
	$(document).ready(function(){
		// 初始化输出大小
		initOutputSize(data);
		createItems(data);
	});
	function createItems(data){
		$.each(data,function(key,val){
			var img_url = val['img'];
			var imgStr = "<li>" +
							"<a href='javascript:void(0)'>" + 
								"<img src='"+ img_url +"?rand="+ Math.random()+"'alt='"+ key + "'/>"+
							"</a>" +
						"</li>";
			$(".slide_img").append(imgStr);
		});
		var uls = $('ul.slide_img');
		var box = $('#slide_box');
		lis = $('img',uls);
		checkIsOnload();
		
	}
	
	function bindEditEvent(){
		var uls = $('ul.slide_img');
		var box = $('#slide_box');
		 var order = $('#slide_order',box);
		for (var i = 0; i < lis.length; i++) {
			if(lis[i].width){
				widths += lis[i].width + 1000;
			}else{
				widths += 1000;
			}
			order.append('<a href="javascript:void(0)">'+(i+1)+'</a>');
		};
		// 设置ul的宽度等于所有li标签宽度的总和；
		uls.width(widths);
		// box初始的宽度
		var lis_1_width = lis.eq(0).width();
		var lis_1_height = lis.eq(0).height();
		// 设置box位置居中
		var win_w = $(window).width();
		box.css({width:lis_1_width,height:lis_1_height,left:($("#container").width() - lis_1_width)/2});
		// 给第一个序号'1'添加class
		order.find('a').removeClass('current').eq(num).addClass('current');
		//规定时间后执行函数
		control = setTimeout( slide, latency );
		
		// 点击图片序号函数
		$('a',order).live({
			click: function () {
				// 立即停止uls当前正在执行的动作
				uls.stop();
				//清除定时器
				clearTimeout(control);
				num = $(this).index() - 1;
				slide();
			}
		});
		//监听点击图片事件
		$(".slide_img li").live({
			click:function(){
				//清除定时器
				clearTimeout(control);
			}
		})
		
	}
	
	// 幻灯片自动运行函数
	function slide () {
		// 初始化width
		var width = 0;
		var uls = $('ul.slide_img');
		var box = $('#slide_box');
		//var lis = $('li',uls);
		var order = $('#slide_order',box);
		num = num < lis.length - 1 ? (num + 1) : 0;
		// box旧的宽度
		var old_box_width = box.width();
		// box新的宽度
		var lis_now_width = lis.eq(num).width();
		var lis_now_height = lis.eq(num).height();
		// 改变box的宽度 = 当前图片的宽度 和 left值
		box.animate({width : lis_now_width,height : lis_now_height,left : ($("#container").width() - lis_now_width)/2},runtime);
		
		// 计算第一张图到当前图片的宽度总和
		for (var j = 0; j < num; j++) {
			width += lis.eq(j).width();
		};
		// 设置当前的序号添加class
		order.find('a').removeClass('current').eq(num).addClass('current');
		// 改变ul的left值
		uls.animate({left: 0 - width}, runtime, function () {
			control = setTimeout( slide, latency );
		});
	}
	
	function checkIsOnload(){
		var img = lis[lis.length - 1];
		if(img.complete){
			bindEditEvent();
		}else{
			img.onload = function(){
				$(".slide_img li img").css("max-width",w);
				if(img.width){
					bindEditEvent();
				}
			}
		}
		
	}
/*************************************************************************************
	初始化显示大小
*************************************************************************************/
	function initOutputSize(data){
		w= data['width'];
		var h = data['height'];
		if(!isNaN(w) && !isNaN(h)){
			$("#container").height(h-40 + "px");
			$("#container").width(w-40 + "px");
			$("#container").css({left : ($(window).width() - w -40)/2});
		}
	}
})()