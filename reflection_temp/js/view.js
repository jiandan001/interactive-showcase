(function() {

	// 模板容器的 dom id 
	var containerID = 'bank';

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));

		/**
			初始化模板数据
		*/
		initData(function(data){
		
			initOutputSize(data);
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);

			initDataFinished();
			
		});
		
		//触发body改变的事件
		$(window).resize(function(){
		
			 initOutputSize();

		});
		
	});


/*************************************************************************************
	初始化数据
*************************************************************************************/
	function initData(callback){
		$.getJSON(window.templatePath + ".2.json?r="+Math.random()).done(function(data){
			if(typeof(callback)=='function'){
				callback(data);
			}else{
				alert('initData 回调函数错误');
			}
		}).fail(function(){
			alert("初始化数据失败！展品 edit.js 第40行");
		})
	}

	// 此方法是需要根据不同的模板来定制的
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
				subtitle: val['subtitle'],
				//thumbnail: val['thumbnail'],	// 当前模板不需要这个属性，所以注释掉
				title: val['title'],
				link: val['link']	// 这里是根据当前模板自己添加的属性
			}
			createSequenceItem(args);
			//console.log($(".diapo"));
		});
	}


/*************************************************************************************
	添加和删除图片轮播项的DOM节点
*************************************************************************************/	
	/**
		此方法是需要根据不同的模板来定制的
		创建一个 sequence 项，包括图片、文字、缩略图
		@param args = {
			nodeRelPath:'',	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			alt:'',			// 图片的 tooltip 信息
			title:'',		// 图片大标题
			subtitle:'',	// 图片小标题
			model:'',		// 大图片路径
			thumbnail:''	// 缩略图路径	
		}
	*/
	function createSequenceItem(args){
		var title = args['title'],	// 图片大标题
			nodeRelPath = args['nodeRelPath'],	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			subtitle = args['subtitle'],	// 图片小标题
			model = args['model'],			// 大图片路径
			// thumbnail = args['thumbnail'],	// 缩略图路径	
			alt = args['alt'],				// 图片的 tooltip 信息
			link = args['link'],
			sequenceCanvas = $("."+containerID+"");	// 这里获取容器
			// sequencePagination = $(".sequence-pagination")[0];	// 这里获取容器

		var href = 'href='+link;
		if(link==undefined){
			href = '';
		}			
			
		var sequenceCanvasItem = 	// 这里是创建大图片时的DOM结构
			'<div class="slide" alt="'+nodeRelPath+'">'+

			'<a class="diapo word" rel="'+model+'" id="'+nodeRelPath+'" title="'+title+'" alt="'+link+'" '+href+'>' + subtitle + '</a>' +
			
			'</div>';

		if(sequenceCanvas){ 
			$(sequenceCanvas).append(sequenceCanvasItem);
		}else{
			alert('初始化数据时容器不存在！');
		}
		
	}


/*************************************************************************************
	初始化显示大小
*************************************************************************************/
	function initOutputSize(data){
		if(data) {
		
			var w = data['width'];
			var h = data['height'];
		}else{
		
			var w = '';
		}
		if(w && h && !isNaN(w) && !isNaN(h)){
			
			$('body').attr("style","width:"+ w +"px;height:"+h+"px");			
		}else{
		
			var w = $('body').css('width');
			var h = $('body').css('height');
		}
		var container = $("#"+"imageFlow"+"");
		$(container).attr("style","width:"+ w +"px;height:"+h*0.8+"px");
		w = parseInt(w);
		var fontSize = 0.7 + w/400*0.1
		$(".title").css("font-size",fontSize+"em" );
		$(".legend").css("font-size",(fontSize -0.1) + "em" );
	}

})();