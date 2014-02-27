(function() {

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		// 得到当前展品路径,ps:/web360/content/users/admin/exhibits/exhibit201310271752271794356405
		window.templatePath = url.substring(0,url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/

			// 初始化body大小
			initOutputSize(data)
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);
			// 初始化轮播
			exe();

		
	});

/*************************************************************************************
	初始化轮播
*************************************************************************************/
            function exe() {

				//custom animations to use
				//in the transitions
				var animations		= ['right','left','top','bottom','rightFade','leftFade','topFade','bottomFade'];
				var total_anim		= animations.length;
				//just change this to one of your choice
				var easeType		= 'swing';
				//the speed of each transition
				var animSpeed		= 450;
				//caching
				var $hs_container	= $('#hs_container');
				var $hs_areas		= $hs_container.find('.hs_area');
				
				//first preload all images
                $hs_images          = $hs_container.find('img');
                var total_images    = $hs_images.length;
                var cnt             = 0;
                $hs_images.each(function(){
                    var $this = $(this);
                    $('<img/>').load(function(){
                        ++cnt;
                        if(cnt == total_images){
							$hs_areas.each(function(){
								var $area 		= $(this);
								//when the mouse enters the area we animate the current
								//image (random animation from array animations),
								//so that the next one gets visible.
								//"over" is a flag indicating if we can animate 
								//an area or not (we don't want 2 animations 
								//at the same time for each area)
								$area.data('over',true).bind('mouseenter',function(){
									if($area.data('over')){
										$area.data('over',false);
										//how many images in this area?
										var total		= $area.children().length;
										if(total > 1){
										
											//visible image
											var $current 	= $area.find('img:visible');
											//index of visible image
											var idx_current = $current.index();
						
											//the next image that's going to be displayed.
											//either the next one, or the first one if the current is the last
											var $next		= (idx_current == total-1) ? $area.children(':first') : $current.next();
											//show next one (not yet visible)
											$next.show();
											//get a random animation
											var anim		= animations[Math.floor(Math.random()*total_anim)];
											switch(anim){
												//current slides out from the right
												case 'right':
													$current.animate({
														'left':$current.width()+'px'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'left'		: '0px'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
												//current slides out from the left
												case 'left':
													$current.animate({
														'left':-$current.width()+'px'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'left'		: '0px'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
												//current slides out from the top	
												case 'top':
													$current.animate({
														'top':-$current.height()+'px'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'top'		: '0px'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
												//current slides out from the bottom	
												case 'bottom':
													$current.animate({
														'top':$current.height()+'px'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'top'		: '0px'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
												//current slides out from the right	and fades out
												case 'rightFade':
													$current.animate({
														'left':$current.width()+'px',
														'opacity':'0'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'left'		: '0px',
															'opacity'	: '1'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
												//current slides out from the left and fades out	
												case 'leftFade':
													$current.animate({
														'left':-$current.width()+'px','opacity':'0'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'left'		: '0px',
															'opacity'	: '1'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
												//current slides out from the top and fades out	
												case 'topFade':
													$current.animate({
														'top':-$current.height()+'px',
														'opacity':'0'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'top'		: '0px',
															'opacity'	: '1'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
												//current slides out from the bottom and fades out	
												case 'bottomFade':
													$current.animate({
														'top':$current.height()+'px',
														'opacity':'0'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'top'		: '0px',
															'opacity'	: '1'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;		
												default:
													$current.animate({
														'left':-$current.width()+'px'
													},
													animSpeed,
													easeType,
													function(){
														$current.hide().css({
															'z-index'	: '1',
															'left'		: '0px'
														});
														$next.css('z-index','9999');
														$area.data('over',true);
													});
													break;
											}	
								    	}
								  }
								
								});
								
							});
							
							//when clicking the hs_container all areas get slided
							//(just for fun...you would probably want to enter the site
							//or something similar)
							$('.imgclass').bind('click',function(){
								//alert(this.id);
								if(this.id){
									window.open(this.id);
								}
								$hs_areas.trigger('mouseenter');
							});
						}
					}).attr('src',$this.attr('src'));
				});			

   }
/*************************************************************************************
	初始化数据
*************************************************************************************/	

	// 创建轮播的所有DOM元素
	function createItems(data){
	
		var args;
		var conArr= new Array();

		$.each(data,function(key,val){
			if(!val['jcr:created']){

				return;
			}
			var nodeRelPath = 'json/data/'+key;
			
			args = {
				nodeRelPath: nodeRelPath,
				model: val['img'],
				// 标识图片所在的<img>标签所在的类
				position: val['position'],
				link: val['link'],
				alt:key
			}
			var str = createSequenceItem(args,conArr);
			
			// 设置第一次显示的内容
			if(!conArr[args['position']-1]) {
					
				conArr[args['position']-1]='';
			}
			
			conArr[args['position']-1] = conArr[args['position']-1] + str;

		});
		
		// 初始化五个class内的<img>
		$(".hs_area1").html(conArr[0]);
		$(".hs_area2").html(conArr[1]);
		$(".hs_area3").html(conArr[2]);
		$(".hs_area4").html(conArr[3]);
		$(".hs_area5").html(conArr[4]);
		
	}

	/**
		此方法是需要根据不同的模板来定制的
		创建一个 sequence 项，包括图片、文字、缩略图
		@param args = {

		}
	*/
	function createSequenceItem(args,conArr){
		var sequenceCanvasItem='';
		var model = args['model'],
			position = args['position'],
			nodeRelPath = args['nodeRelPath'],
			link = args['link'],
			id = args['alt'];
			classV = 'imgclass';

		if(link==undefined){
			link = '';
		}
			
		if (!conArr[position-1]) {
		
			classV = "imgclass hs_visible";
		}
			 sequenceCanvasItem += "<img src= '"+ model + "' class= '"+ classV +"' width='100%' height='100%' alt=\"" + id + '*' + link +"\" id = '" + link +"'/>";

		return sequenceCanvasItem;
	}

/*************************************************************************************
	初始化显示大小
*************************************************************************************/
	function initOutputSize(data){
		var w = data['width'];
		var h = data['height'];
		if(!isNaN(w) && !isNaN(h)){
			var container = $("#"+"bdy"+"");
			$(container).width(w+'px');
			$(container).height(h+'px');
		}
	}

})();