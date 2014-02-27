(function(){
	var largecontainerID = 'slider-large';
	var thumbcontainerID = 'slider-thumbs';
	/***程序入口***/
	$(document).ready(function(){

		/*var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));*/
		/**
			初始化模板数据
		*/
	
		initData();
		initOutputSize(data);
	});

	function initData(){
		//给slider-thumbs容器先加载一个 <li class="ei-slider-element">Current</li>，然后才是循环；
		var thumbli = "<li class=\"ei-slider-element\"></li>";
		$('#slider-thumbs').append(thumbli);
		$.each(data,function(key,value){
			var img = value['img'],
				thumbnail = value['thumbnail'],
				title = value['title'],
				text = value['text'],
				link = value['link'];
			var href = 'href='+link;
			if(link==undefined){
				href = '';
			}
			if(img){
				var largeimg = "<li>"+
									"<a target=\"_blank\" "+href+" style=\"display:block;\">"+
										"<img src=\""+img+"\" alt=\"\" style=\"width:1280px;height:500px;\"/>"+
									"</a>"+
									"<div class=\"ei-title\">"+
										"<h2>"+title+"</h2>"+
										"<h3>"+text+"</h3>"+
									"</div>"+
								"</li>";
		                   
		        var thumbimg = "<li><a href=\"#\"></a></li>"; 
		        // <img src=\""+thumbnail+"\" alt=\"\" />
		        	 		// "<li class=\"ei-slider-element\"></li>"
		       				             	   
		    $('#slider-large').append(largeimg);
		    $('#slider-thumbs').append(thumbimg);                 
			}
		});
	}
	//根据data属性调整页面大小
	function initOutputSize(data){
        var w = data['width'];
        var h = data['height'];
        if(!isNaN(w) && !isNaN(h)){
            $('body').css({'width':w+'px','height':h+'px'});
        }else{
            $('body').css({'width':'100%','height':'100%'});     
        }
    }

})()