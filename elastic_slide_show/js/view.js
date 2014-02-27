(function(){
	var largecontainerID = 'slider-large';
	var thumbcontainerID = 'slider-thumbs';

	$(document).ready(function(){
		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/
	
		initData(function(data){
			modelShow();
			initOutputSize(data);
		});
	});

	function initData(finished){
		$.getJSON(window.templatePath + ".2.json?r="+Math.random()).done(function(data){
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);
		if(typeof(finished)=='function'){
			finished(data);
		}
		}).fail(function(){
			alert("初始化数据失败！");
		})
	}

	function createItems(data){
		var args;
		$.each(data,function(key,val){
			if(!val['jcr:created']){
				return;
			}
			var nodeRelPath = 'json/data/'+key;
			args = {
				nodeRelPath: nodeRelPath,
				title: val['title'],
				text: val['text'],
				model: val['img'],
				thumbnail: val['thumbnail'],
				link:val['link']
			}
			createSequenceItem(args);
		});
	}

	function createSequenceItem(args){
		var	largeImg = $("#"+largecontainerID+"");	// 大图容器
		var	thumbImg = $("#"+thumbcontainerID+"");  // 小图容器
		var nodeRelPath = args['nodeRelPath'],
			title = args['title'],
			text = args['text'],
			model = args['model'],
			thumbnail = args['thumbnail'],
			link = args['link'];
			if(link==undefined){
				link="";
			}
		if(model){
			var largeStr = "<li>"+
								"<a target=\"_blank\" href=\""+link+"\" style=\"display:block;\">"+
									"<img src=\""+model+"\" alt=\"\" style=\"width:1280px;height:500px;\" />"+
								"</a>"+
								"<div class=\"ei-title\">"+
									"<h2>"+title+"</h2>"+
									"<h3>"+text+"</h3>"+
								"</div>"+
							"</li>";
	                   
	        var thumbStr = "<li><a href=\"#\"></a></li>"; 
	        /* <img src=\""+thumbnail+"\" alt=\"\" />*/
			$(largeImg).append(largeStr);
			$(thumbImg).append(thumbStr);
							
		}
	}
	function initOutputSize(data){
        var w = data['width'];
        var h = data['height'];
        if(!isNaN(w) && !isNaN(h)){
            $('body').css({'width':w+'px','height':h+'px'});
        }else{
            $('body').css({'width':'100%','height':'100%'});     
        }
    }
	//模板自带方法
	function modelShow(){
		$('#ei-slider').eislideshow({
			easing		: 'easeOutExpo',
			titleeasing	: 'easeOutExpo',
			titlespeed	: 1200
        });
	}	
})()