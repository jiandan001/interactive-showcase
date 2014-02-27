(function() {

	// 模板容器的 id
	var containerID = 'flipover';

	/***程序入口***/
	$(document).ready(function(){

		/*var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));*/
		/**
			初始化模板数据
		*/
	
		initData();
	});


/*************************************************************************************
	初始化数据
*************************************************************************************/
	function initData(){			
		$.each(data,function(key,value){
			var title = value['title'],	
				text = value['text'],	
				model = value['img'],	
				link = value['link'];	
			var href = 'href='+link;
			if(link==undefined){
				href = '';
			}
			if(model){
				var str = "<div>"+
				"<a target=\"_blank\" "+href+" style=\"display:block;\">"+
				"<img src=\""+model+"\" alt=\"\" style=\"max-height:300px;\" />"+
				"</a>"+
				"<h1>"+title+"</h1>"+
				"<p>"+text+"</p>"+
				/*"<a href=\""+article+"\" target=\"_blank\" class=\"article\">Article</a>"+
				"<a href=\""+demo+"\" target=\"_blank\" class=\"demo\">Demo</a>"+*/
				"</div>";
			$("#flipover").append(str);
			}		
		});
	}
/*************************************************************************************
	初始化显示大小
*************************************************************************************/
	function initOutputSize(data){
		var w = data['width'];
		var h = data['height'];
		if(!isNaN(w) && !isNaN(h)){
			var container = $("#"+containerID+"");
			$(container).width(w+'px');
			$(container).height(h+'px');
		}
	}

})();