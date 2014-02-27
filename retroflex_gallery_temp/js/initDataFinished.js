function initDataFinished() {

	var $tf_bg				= $('#tf_bg'),
		$tf_bg_images		= $tf_bg.find('img'),
		$tf_bg_img			= $tf_bg_images.eq(0),
		$tf_thumbs			= $('#tf_thumbs'),
		total				= $tf_bg_images.length,
		current				= 0,
		$tf_content_wrapper	= $('#tf_content_wrapper'),
		$tf_next			= $('#tf_next'),
		$tf_prev			= $('#tf_prev'),
		$tf_loading			= $('#tf_loading');
	
	//preload the images				
	$tf_bg_images.preload({
		onComplete	: function(){
			$tf_loading.hide();
			init();
		}
	});
	// 初始化图片
		//the new thumb is set here
		var content	= '<span id="tf_zoom" class="tf_zoom"></span>';
		content		+='<img src="' + $tf_bg_images.eq(current).attr('longdesc') + '" alt="Thumb' + (current) + '"/>';
		$tf_thumbs.html(content);

	
	//shows the first image and initializes events
	function init(){
		//get dimentions for the image, based on the windows size
		var dim	= getImageDim($tf_bg_img);
		//set the returned values and show the image
		$tf_bg_img.css({
			width	: dim.width,
			height	: dim.height,
			left	: dim.left,
			top		: dim.top
		}).fadeIn();
	
		//resizing the window resizes the $tf_bg_img
	$(window).bind('resize',function(){
		var dim	= getImageDim($tf_bg_img);
		$tf_bg_img.css({
			width	: dim.width,
			height	: dim.height,
			left	: dim.left,
			top		: dim.top
		});
	});
	
		//expand and fit the image to the screen
	$('#tf_content_wrapper').on('click', '#tf_zoom',
			function(){
			if($tf_bg_img.is(':animated'))
				return false;
	
				var $this	= $(this);
				if($this.hasClass('tf_zoom')){
					resize($tf_bg_img);
					$this.addClass('tf_fullscreen')
						 .removeClass('tf_zoom');
				}
				else{
					var dim	= getImageDim($tf_bg_img);
					$tf_bg_img.animate({
						width	: dim.width,
						height	: dim.height,
						top		: dim.top,
						left	: dim.left
					},350);
					$this.addClass('tf_zoom')
						 .removeClass('tf_fullscreen');	
				}
			}
		);
		
		//click the arrow down, scrolls down
		$tf_next.bind('click',function(){
			if($tf_bg_img.is(':animated'))
				return false;
				scroll('tb');
		});
		
		//click the arrow up, scrolls up
		$tf_prev.bind('click',function(){
			if($tf_bg_img.is(':animated'))
			return false;
			scroll('bt');
		});
		
		//mousewheel events - down / up button trigger the scroll down / up
		$(document).mousewheel(function(e, delta) {
			if($tf_bg_img.is(':animated'))
				return false;
				
			if(delta > 0)
				scroll('bt');
			else
				scroll('tb');
			return false;
		});
		
		//key events - down / up button trigger the scroll down / up
		$(document).keydown(function(e){
			if($tf_bg_img.is(':animated'))
				return false;
			
			switch(e.which){
				case 38:	
					scroll('bt');
					break;	

				case 40:	
					scroll('tb');
					break;
			}
		});
		
		$tf_content_wrapper.children()
				   .eq(current)
				   .show();
		
	}
	
	//show next / prev image
	function scroll(dir){
		//if dir is "tb" (top -> bottom) increment current, 
		//else if "bt" decrement it
		current	= (dir == 'tb')?current + 1:current - 1;
		
		//we want a circular slideshow, 
		//so we need to check the limits of current
		if(current == total) current = 0;
		else if(current < 0) current = total - 1;
		
		//flip the thumb
		$tf_thumbs.flip({
			direction	: dir,
			speed		: 400,
			onBefore	: function(){
				//the new thumb is set here
				var content	= '<span id="tf_zoom" class="tf_zoom"></span>';
				content		+='<img src="' + $tf_bg_images.eq(current).attr('longdesc') + '" alt="Thumb' + (current+1) + '"/>';
				$tf_thumbs.html(content);
		}
		});

		//we get the next image
		var $tf_bg_img_next	= $tf_bg_images.eq(current),
			//its dimentions
			dim				= getImageDim($tf_bg_img_next),
			//the top should be one that makes the image out of the viewport
			//the image should be positioned up or down depending on the direction
				top	= (dir == 'tb')?$(window).height() + 'px':-parseFloat(dim.height,10) + 'px';
				
		//set the returned values and show the next image	
			$tf_bg_img_next.css({
				width	: dim.width,
				height	: dim.height,
				left	: dim.left,
				top		: top
			}).show();
			
		//now slide it to the viewport
			$tf_bg_img_next.stop().animate({
				top 	: dim.top
			},1000);
			
		//we want the old image to slide in the same direction, out of the viewport
			var slideTo	= (dir == 'tb')?-$tf_bg_img.height() + 'px':$(window).height() + 'px';
			$tf_bg_img.stop().animate({
				top 	: slideTo
			},1000,function(){
			//hide it
				$(this).hide();
			//the $tf_bg_img is now the shown image
				$tf_bg_img	= $tf_bg_img_next;
			//show the description for the new image
				$tf_content_wrapper.children()
								   .eq(current)
								   .show();
	});
		//hide the current description	
			$tf_content_wrapper.children(':visible')
							   .hide()
	
	}
	
	//animate the image to fit in the viewport
	function resize($img){
		var w_w	= $(window).width(),
			w_h	= $(window).height(),
			i_w	= $img.width(),
			i_h	= $img.height(),
			r_i	= i_h / i_w,
			new_w,new_h;
		
		if(i_w > i_h){
			new_w	= w_w;
			new_h	= w_w * r_i;
			
			if(new_h > w_h){
				new_h	= w_h;
				new_w	= w_h / r_i;
			}
		}	
		else{
			new_h	= w_w * r_i;
			new_w	= w_w;
		}
		
		$img.animate({
			width	: new_w + 'px',
			height	: new_h + 'px',
			top		: '0px',
			left	: '0px'
		},350);
	}
	
	//get dimentions of the image, 
	//in order to make it full size and centered
	function getImageDim($img){
		var w_w	= $("body").width(),
			w_h	= $("body").height(),
			r_w	= w_h / w_w,
			i_w	= $img.width(),
			i_h	= $img.height(),
			r_i	= i_h / i_w,
			new_w,new_h,
			new_left,new_top;
		
		if(r_w > r_i){
			new_h	= w_h;
			new_w	= w_h / r_i;
		}
		else{
			new_h	= w_w * r_i;
			new_w	= w_w;
		}
		// 动态设置字体大小
		$('.cTitle').css("font-size",w_w*0.0375+"px" );;
		$('.cContent').css("font-size",w_w*0.0375/2+"px" );;
		$('.cContent').css("line-height",w_w*0.0375/2+5+"px" );;

		return {
			// width	: new_w + 'px',
			width	: w_w + 'px',
			// height	: new_h + 'px',
			height	: w_h + 'px',
			// left	: (w_w - new_w) / 2 + 'px',
			left	: '0px',
			// top		: (w_h - new_h) / 2 + 'px'
			top		:  '0px'
		};
		}

}