(function() {

	// 模板容器的 dom class 
	var containerID = 'tf_bg';
	var wordID = 'tf_content_wrapper';

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));

		/**
			初始化模板数据
		*/
		
			initOutputSize(data);
			//创建 DOM 节点，添加图片轮播项
			createItems(data);
			// 绑定事件
			bindEditEvent();
			
			initDataFinished();
					
	});

/*************************************************************************************
	初始化数据
*************************************************************************************/

	// 创建轮播的所有DOM元素 
	function createItems(data){
		var args;
		$.each(data,function(key,val){
			if(!val['jcr:created']){
				return;
			}
			var nodeRelPath = 'json/data/'+key;
			args = {
				nodeRelPath: nodeRelPath,
				alt: val['alt'],
				model: val['img'],          
				title: val['title'],         // id = cTitle
				subtitle: val['subtitle'],   // id = cContent
				link: val['link']	
			}
			createSequenceItem(args);
		});
	}


/*************************************************************************************
	添加和删除图片轮播项的DOM节点
*************************************************************************************/	
	/**
		创建一个 sequence 项，包括图片、文字、缩略图
		@param args = {
			nodeRelPath:'',	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			alt:'',			// 图片的 tooltip 信息
			title:'',		// 图片标题
			subtitle:'',	// 图片内容
			model:'',		// 图片路径
			link:''			// 点击图片触发的连接
		}
	*/
	function createSequenceItem(args){
		var title = args['title'],	// 图片标题
			nodeRelPath = args['nodeRelPath'],	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			subtitle = args['subtitle'],	// 图片内容
			model = args['model'],	// 大图片路径
			alt = args['alt'],	// 图片的 tooltip 信息
			link = args['link'],
			sequenceCanvas = $("."+containerID+"");	// 这里图片获取容器
			sequenceCanvasWord = $("."+wordID+"");	// 这里文字获取容器
		if(link==undefined){
			link = '';
		}			
			
		var sequenceCanvasItem = 	// 这里是创建图片时的DOM结构 id 为记录link的
			'<img class="pic" src="'+model+'" longdesc="'+model+'" id="'+link+'" >' 

		var	contentItem =    // 文字DOM结构
			'<div class="tf_content"  style="display: none;">' +
				'<h2 class="cTitle">' +title+ '</h2>'+
				'<p class="cContent">' +subtitle+ '</p>'+
			'</div>'
		if(sequenceCanvas && sequenceCanvasWord){ 
			$(sequenceCanvas).append(sequenceCanvasItem);
			$(sequenceCanvasWord).append(contentItem);
		}else{
			alert('初始化数据时容器不存在！');
		}
		
	}


/*************************************************************************************
	初始话img标签
*************************************************************************************/
		(function($) {
			$.fn.preload = function(options) {

				var opts 	= $.extend({}, $.fn.preload.defaults, options);
				o			= $.meta ? $.extend({}, opts, this.data()) : opts;
				var c		= this.length,
					l		= 0;

				return this.each(function() {
					var $i	= $(this);
					$('<img/>').load(function(i){
						++l;
						if(l == c) o.onComplete();
					}).attr('src',$i.attr('src'));	
				});
			};
			$.fn.preload.defaults = {
				onComplete	: function(){return false;}
			};
		})(jQuery);


/*************************************************************************************
	初始化显示大小
*************************************************************************************/
	function initOutputSize(data){
		var w = data['width'];
		var h = data['height'];
		if(w && h && !isNaN(w) && !isNaN(h)){
			
			$('body').attr("style","width:"+ w +"px;height:"+h+"px");

			
		}
	}

/*************************************************************************************
	给 DOM 绑定事件
*************************************************************************************/
	function bindEditEvent()
	{	
		//给所有图片监听点击事件
		$(".pic").bind('click',function(){

			if(this.id){
				window.open(this.id);
			}

		});
		
	}
})();