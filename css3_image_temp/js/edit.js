(function() {

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));

		/**
			初始化模板数据
		*/
		initData(function(data){
			
			// 输出自适应大小
			initOutputSize(data);
			// 创建DOM 节点，添加图片轮播选项
			createItems(data);
			// 调用初始化完毕的事件
			launchCSSEvent();
			// 绑定事件
			bindEditEvent();
			// 初始化对话框
			initDialog();

			
		});
		
	});


/*************************************************************************************
	初始化数据
*************************************************************************************/
	function initData(callback){

		$.getJSON(window.templatePath + ".2.json?r="+Math.random())
			.done(function(data){
				
				if(typeof(callback)=='function'){
					callback(data);
				}else{
					alert('initData 回调函数错误');
				}
				
			})
			.fail(function(textStatus, error){
				var err = textStatus + error;
				// if(console && console.log){
				// 	 console.log( "Request data.2.json Failed: " + err );
				// }
				alert('初始化数据失败！展品 edit.js 第40行');
			});
			
	      
	}

	// 此方法是需要根据不同的模板来定制的
	// 创建轮播的所有DOM元素
	function createItems(data){
		
  		var args = {};
        $.each(data, function(key, val){ 
        	if(!val["jcr:created"]){
        		return;
        	}
		    if(key=="title"){
		   		window.personalArgs = {}
		   		window.personalArgs['title'] = val['name'];
		   		createTitleItem(window.personalArgs);
		    
		    }else{         
                var nodeRelPath = 'json/data/' + key;
                // console.log(key);
                args = {
                	nodeRelPath : nodeRelPath,
                	img : val['img']
                }

                createSequenceItem(args);
		     
            }					
        });
	
	}

/*************************************************************************************
	添加和删除图片轮播项的DOM节点
*************************************************************************************/		
	
	/**
		此方法是创建title 属性
	**/
	function createTitleItem(args){
		var title = args['title'];
		var titleCanvasItem = $('.header')[0];
		var titleItem = 
			'<h1 id="head_h1">'+
				title + 
			 '</h1>'; 
		if(titleCanvasItem && titleItem){

			$(titleCanvasItem).append(titleItem);
		}else{
			alert('初始化数据时容器不存在！');
		}
	}

	/**
		此方法是需要根据不同的模板来定制的
		创建一个 sequence 项，包括图片、文字、缩略图
		@param args = {
			nodeRelPath:'',	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			img:''			// 图片
	
		}
	*/
	function createSequenceItem(args){
	   
		var nodeRelPath = nodeRelPath = args['nodeRelPath'];	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
		var	img = args['img'];			// 大图片路径
		var sequenceCanvas = $("#image_content")[0];	// 这里获取容器

		var sequenceCanvasItem = 	// 这里是创建大图片时的DOM结构
			'<div class="content" style="float: left">' + 
                '<div style="height: 100%;position: relative;" alt = "' + nodeRelPath + '">' + 
                    '<img src="'+ img +'" class="thumb" style="width: 85px;" />' +
                     '<span></span>'+
                 '</div> ' +
            '</div>';

        
		if(sequenceCanvas && sequenceCanvasItem){

			$(sequenceCanvas).append(sequenceCanvasItem);
		}else{
			alert('初始化数据时容器不存在！');
		}
	}



	// 初始化对话框
	function initDialog(){
		$( "#dialog-form" ).dialog({
			autoOpen: false,
			height: 300,
			width: 350,
			modal: true,
			close: function() {
				$( this ).dialog( "close" );
			}
		});
	}

/*************************************************************************************
	动画方法
*************************************************************************************/

	// 执行css3 动画事件
	function launchCSSEvent(){
		//caching some elements
		var $thumbnails_wrapper 	= $('#thumbnails_wrapper'),
			$thumbs					= $thumbnails_wrapper.find('.tshf_container').find('.content'),
			$top_menu				= $('#top_menu'),
			$header					= $('#header'),
			$bubble                 = $('#bubble'),
			$loader					= $('#loader'),
			$preview				= $('#preview'),
			$thumb_images			= $thumbnails_wrapper.find('img'),
			total_thumbs			= $thumb_images.length,
			$next_img				= $('#next_image'),
			$prev_img				= $('#prev_image'),
			$back					= $('#back'),
			$description			= $('#description'),
			//current album and current photo
			//(indexes of the tshf_container and content elements)					
			currentAlbum			= -1,
			currentPhoto			= -1;
		
		//show the loading image until we 
		//preload all the thumb images
		$loader.show();
		//show the main menu and thumbs menu
        openPhotoAlbums();
		
		function openPhotoAlbums(){
			//preload all the thumb images
			var cnt_loaded = 0;
			$thumb_images.each(function(){
				var $thumb 		= $(this);
				var image_src 	= $thumb.attr('src');
				$('<img/>').load(function(){
					++cnt_loaded;
					if(cnt_loaded == total_thumbs){
						$loader.hide();
						createThumbnailScroller();
						//show the main menu and thumbs menu
						$header.stop().animate({'top':'30px'},700,'easeOutBack');
                               
						$thumbnails_wrapper.stop().animate({'top':'110px'},700,'easeOutBack');
                      
					}
				}).attr('src',image_src);
			});
		}
		
		//thumb click event
		$thumbs.bind('click',function(e){
			//show loading image
			$loader.show();
			var $thumb	= $(this),
				//source of the corresponding large image
				img_src = $thumb.find('img.thumb')
								.attr('src')
								.replace('/thumbs','');
			
			//track the current album / photo
			currentPhoto= $thumb.index(),
			currentAlbum= $thumb.closest('.tshf_container')
								.index();
			//displays the current album and current photo
			updateInfo(currentAlbum,currentPhoto);
			//preload the large image
			$('<img/>').load(function(){
				var $this = $(this);
				//record the size that the large image 
				//should have when it is shown
				saveFinalPositions($this);
				//margin_circle is the diameter for the 
				//bubble image
				var w_w				= $('#main').width(),
					w_h				= $('#main').height(),
					margin_circle	= w_w + w_w/3;
				if(w_h>w_w)
					margin_circle	= w_h + w_h/3;
				
				//the image will be positioned on the center,
				//with width and height of 0px
				$this.css({
					'width'		: '0px',
					'height'	: '0px',
					'marginTop'	: w_h/2 +'px',
					'marginLeft': w_w/2 +'px'
				});
				$preview.append($this);
				
				//hide the header
				$header.stop().animate({'top':'-90px'},400, function(){
					$loader.hide();
					//show the top menu with the back button,
					//and current album/picture info
					$top_menu.stop()
							 .animate({'top':'0px'},400,'easeOutBack');
					//animate the bubble image
					$bubble.stop().animate({
						'width'		:	margin_circle + 'px',
						'height'	:	margin_circle + 'px',
						'marginTop'	:	-margin_circle/2+'px',
						'marginLeft':	-margin_circle/2+'px'
					},700,function(){
						//solve resize problem
						// $('BODY').css('background','#FFD800');
						$('#main').css('background','#FFD800');
					});
					//after 200ms animate the large image
					//and show the navigation buttons
					setTimeout(function(){
                        /*
						var final_w	= $this.data('width'),
						    final_h	= $this.data('height');
                            */
                        var final_w = w_w*0.5,
                            final_h	= w_h*0.8;
						$this.stop().animate({
								'width'		: final_w + 'px',
								'height'	: final_h + 'px',
								'marginTop'	: w_h/2 - final_h/2 + 'px',
								'marginLeft': w_w/2 - final_w/2 + 'px'
						},700,showNav);
						//show the description
						$description.html($thumb.find('img.thumb').attr('alt'));
					},200);
					
				});
				//hide the thumbs
				$thumbnails_wrapper.stop()
								   .animate({
									   'top' : w_h+'px'
								   },400,function(){
										//solve resize problem
										$(this).hide();
								   });
				
			}).attr('src',img_src);
		});
		
		//next button click event
		$next_img.bind('click',function(){
			//increment the currentPhoto
			++currentPhoto;
			//current album:
			var $album		= $thumbnails_wrapper.find('.tshf_container')
												 .eq(currentAlbum),
				//the next element / thumb to show
				$next		= $album.find('.content').eq(currentPhoto),
				$current 	= $preview.find('img');
			if($next.length == 0 || $current.is(':animated')){
				--currentPhoto;
				return false;
			}
			else{
				$loader.show();
				updateInfo(currentAlbum,currentPhoto);
				//preload the large image
				var img_src = $next.find('img.thumb')
								   .attr('src')
								   .replace('/thumbs',''),
					w_w		= $('#main').width(),
					w_h		= $('#main').height();				   
			
				$('<img/>').load(function(){
					var $this = $(this);
					//record the size that the large image 
					//should have when it is shown
					saveFinalPositions($this);
					$loader.hide();
					$current.stop()
							.animate({'marginLeft':'-'+($current.width()+20)+'px'},500,function(){
								//the current image gets removed
								$(this).remove();	
							});
					//the new image will be positioned on the center,
					//with width and height of 0px
					$this.css({
						'width'		: '0px',
						'height'	: '0px',
						'marginTop'	: w_h/2 +'px',
						'marginLeft': w_w/2 +'px'
					});
					$preview.prepend($this);
                    /*
					var final_w	= $this.data('width'),
						final_h	= $this.data('height');
                        */
                    var final_w =w_w*0.5,
                        final_h	= w_h*0.8;
					$this.stop().animate({
							'width'		: final_w + 'px',
							'height'	: final_h + 'px',
							'marginTop'	: w_h/2 - final_h/2 + 'px',
							'marginLeft': w_w/2 - final_w/2 + 'px'
					},700);
					//show the description
					$description.html($next.find('img.thumb').attr('alt'));
				}).attr('src',img_src);	
			}
		});
		
		//previous button click event
		$prev_img.bind('click',function(){
			--currentPhoto;
			//current album:
			var $album		= $thumbnails_wrapper.find('.tshf_container')
												 .eq(currentAlbum),
				$prev		= $album.find('.content').eq(currentPhoto),
				$current 	= $preview.find('img');
			if($prev.length == 0 || $current.is(':animated') || currentPhoto < 0){
				++currentPhoto;
				return false;
			}
			else{
				$loader.show();
				updateInfo(currentAlbum,currentPhoto);
				//preload the large image
				var img_src = $prev.find('img.thumb')
								   .attr('src')
								   .replace('/thumbs',''),
					w_w				= $('#main').width(),
					w_h				= $('#main').height();				   
			
				$('<img/>').load(function(){
					var $this = $(this);
					//record the size that the large image 
					//should have when it is shown
					saveFinalPositions($this);
					
					$loader.hide();
					$current.stop()
							.animate({'marginLeft':(w_w+20)+'px'},500,function(){
								//the current image gets removed
								$(this).remove();
							});
					//the new image will be positioned on the center,
					//with width and height of 0px
					$this.css({
						'width'		: '0px',
						'height'	: '0px',
						'marginTop'	: w_h/2 +'px',
						'marginLeft': w_w/2 +'px'
					});
					$preview.append($this);
                    console.log($this.context.naturalHeight*0.8 + "----" +$this.context.naturalHeight*0.6);
                    /*
					var final_w	= $this.data('width'),
						final_h	= $this.data('height');
                        */
                    var final_w = w_w*0.5,
                        final_h	= w_h*0.8;
					$this.stop().animate({
							'width'		: final_w + 'px',
							'height'	: final_h + 'px',
							'marginTop'	: w_h/2 - final_h/2 + 'px',
							'marginLeft': w_w/2 - final_w/2 + 'px'
					},700);
					//show the description
					$description.html($prev.find('img.thumb').attr('alt'));							
				}).attr('src',img_src);	
			}
		});
		
		// Bind the swipeleftHandler callback function to the swipe event on div.box
		$prev_img.on( "swipeleft", swipeleftHandler );
		 
		// Callback function references the event target and adds the 'swipeleft' class to it
		function swipeleftHandler( event ){
		    $( event.target ).addClass( "swipeleft" );
		    $prev_img.trigger('click');
		}

		//on window resize we recalculate the sizes of the current image
		$(window).resize(function(){
			var $current = $preview.find('img');
			var	w_w		 = $('#main').width();
			var	w_h		 = $('#main').height();		
			// var	w_w		 = $(window).width();
			// var	w_h		 = $(window).height();
			// $('#main').width(w_w);
			// $('#main').height(w_h);	

			if($current.length > 0){
				saveFinalPositions($current);
				var final_w	=w_w*0.5,
					final_h	= w_h*0.8;
				$current.css({
					'width'		: final_w + 'px',
					'height'	: final_h + 'px',
					'marginTop'	: w_h/2 - final_h/2 + 'px',
					'marginLeft': w_w/2 - final_w/2 + 'px'
				});
			}
		});
		
		//back button click event
		$back.bind('click',closePreview)
		
		//shows the navigation buttons
		function showNav(){
			$next_img.stop().animate({
				'right'	: '10px'
			},300);
			$prev_img.stop().animate({
				'left'	: '10px'
			},300);
		}
		
		//hides the navigation buttons
		function hideNav(){
			$next_img.stop().animate({
				'right'	: '-50px'
			},300);
			$prev_img.stop().animate({
				'left'	: '-50px'
			},300);
		}
		
		//updates the current album and current photo info
		function updateInfo(album,photo){
			$top_menu.find('.album_info')
					 .html('相册 ' + (album+1))
					 .end()
					 .find('.image_info')
					 .html(' / 当前 ' + (photo+1))
		}
		
		//calculates the final width and height 
		//of an image about to expand
		//based on the window size
		function saveFinalPositions($image){
			var theImage 	= new Image();
			theImage.src 	= $image.attr("src");
			var imgwidth 	= theImage.width;
			var imgheight 	= theImage.height;
			
			//140 is 2*60 of next/previous buttons plus 20 of extra margin
			var containerwidth 	= $('#main').width() - 140;
			//150 is 30 of header + 30 of footer + extra 90 
			var containerheight = $('#main').height() - 150;
			
			if(imgwidth	> containerwidth){
				var newwidth = containerwidth;
				var ratio = imgwidth / containerwidth;
				var newheight = imgheight / ratio;
				if(newheight > containerheight){
					var newnewheight = containerheight;
					var newratio = newheight/containerheight;
					var newnewwidth =newwidth/newratio;
					theImage.width = newnewwidth;
					theImage.height= newnewheight;	
				}
				else{
					theImage.width = newwidth;
					theImage.height= newheight;	
				}
			}
			else if(imgheight > containerheight){
				var newheight = containerheight;
				var ratio = imgheight / containerheight;
				var newwidth = imgwidth / ratio;
				if(newwidth > containerwidth){
					var newnewwidth = containerwidth;
					var newratio = newwidth/containerwidth;
					var newnewheight =newheight/newratio;
					theImage.height = newnewheight;
					theImage.width= newnewwidth;	
				}
				else{
					theImage.width = newwidth;
					theImage.height= newheight;	
				}
			}
			$image.data({'width':theImage.width,'height':theImage.height});		
		}
		
		//triggered when user clicks the back button.
		//hides the current image and the bubble image,
		//and shows the main menu and the thumbs 
		function closePreview(){
			var $current = $preview.find('img'),
				w_w		 = $('#main').width(),
				w_h		 = $('#main').height(),
				margin_circle	= w_w + w_w/3;
				
			if(w_h>w_w)
				margin_circle	= w_h + w_h/3;
			
			if($current.is(':animated'))
				return false;
			//hide the navigation
			hideNav();
			//hide the topmenu
			$top_menu.stop()
					 .animate({'top':'-30px'},400,'easeOutBack');
			//hide the image
			$current.stop().animate({
				'width'		: '0px',
				'height'	: '0px',
				'marginTop'	: w_h/2 +'px',
				'marginLeft': w_w/2 +'px'
			},700,function(){
				$(this).remove();
			});
			//animate the bubble image
			//first set the positions correctly - 
			//it could have changed on a window resize
			setTimeout(function(){
				$bubble.css({
					'width'		 :	margin_circle + 'px',
					'height'	 :	margin_circle + 'px',
					'margin-top' :	-margin_circle/2+'px',
					'margin-left':	-margin_circle/2+'px'
				});
				// $('BODY').css('background','url("images/bg.jpg") no-repeat scroll center top #222222');
				// $('#main').css('background','url("images/bg.jpg") no-repeat scroll center top #222222');
				$('#main').css('background','#222222');
				$bubble.animate({
					'width'		:	'0px',
					'height'	:	'0px',
					'marginTop'	:	'0px',
					'marginLeft':	'0px'
				},500);
			},200);
			setTimeout(function(){
				$header.stop()
					   .animate({'top':'30px'},700,'easeOutBack');
				$thumbnails_wrapper.stop()
								   .show()	
								   .animate({'top':'110px'},700,'easeOutBack');
			},600);
		}
		
		//builds the scrollers for the thumbs
		//done by Manos 
		//(http://manos.malihu.gr/jquery-thumbnail-scroller)
		function createThumbnailScroller(){
			/*
			ThumbnailScroller function parameters:
			1) id of the container (div id)
			2) thumbnail scroller type. Values: "horizontal", "vertical"
			3) first and last thumbnail margin (for better cursor interaction)
			4) scroll easing amount (0 for no easing)
			5) scroll easing type
			6) thumbnails default opacity
			7) thumbnails mouseover fade speed (in milliseconds)
			*/
			ThumbnailScroller("tshf_container1","horizontal",10,800,"easeOutCirc",0.5,300);
			//ThumbnailScroller("tshf_container2","horizontal",10,800,"easeOutCirc",0.5,300);
			//ThumbnailScroller("tshf_container3","horizontal",10,800,"easeOutCirc",0.5,300);
		}
	

	}
/*************************************************************************************
	给 DOM 绑定事件，用来处理编辑
*************************************************************************************/
	function bindEditEvent()
	{
		
	
		// 修改标题
		$("#head_h1").click(function(event){
			
			changeText($(this),'name');

		});

		
	}


/*************************************************************************************
	处理编辑图片、文字的具体 Action ，增删改查操作
*************************************************************************************/

	// 替换当前图片
	function replaceSequenceItem(){
		
		// 清空form
		$( "#dialog-form").empty();

		// 修改当前轮播项数据所使用的图片路径
		var preview_img_src = $('#preview img').attr('src');
	    var $thumb_image = $('#thumbnails_wrapper').find('img[src="' + preview_img_src + '"]');
	    
	    // 修改当前轮播项数据所使用的图片路径
	    var nodeRelPath = $thumb_image.parent('div').attr('alt');
	    if(!nodeRelPath){
	    	alert('初始化节点时没有设置 nodeRelPath !');
			return;
	    }
		// 获取图片地址的存放路径 json/data/1/img
		var dataNodeName = nodeRelPath + '/' + 'img';
		// 获取当前被替换图片的文件名，替换后需要删除掉
		var oldPicFile = preview_img_src;

		var data = {
		};
		var schema = {
			"description": "请选择一张图片",
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				}
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'filePic',
	                'type': 'file',
	                'label': '选择图片',
	                'size':30
	            }
	        },
	        'renderForm':true,
	        'form':{
	        	"attributes": {
	        		"id":"formChangePicture",
	                "method": "POST",
	                "enctype": "multipart/form-data"
	            }
	        }
		};
		$( "#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options,
			'view':'VIEW_JQUERYUI_CREATE_LIST'
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<input type="hidden" id="jsonData" name="'+dataNodeName+'" value="" />'+ 
			// '<input type="hidden" name="'+oldPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'<div style="width:380px; margin:0px auto;">'+
				'<br />' + 
				'<button id="btnSubmitPicture">提 交</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
				'<button id="btnDeletePicture"> 删除此图片 </button>' +
				'<br /><br /><br /><br /><hr /><br />' + 
				'<button id="btnAddPicFront">在此图之前添加图片</button>&nbsp;&nbsp;' +
				'<button id="btnAddPicBack">在此图之后添加图片</button>' + 
			'</div>'
		);

		// 设置按钮样式
		$('#btnSubmitPicture').css('width','200px');
		$('#btnSubmitPicture').button( { icons: { primary: "ui-icon-check" } } );
		$('#btnAddPicFront').button( { icons: { primary: "ui-icon-seek-prev" } } );
		$('#btnAddPicBack').button( { icons: { primary: "ui-icon-seek-next" } } );
		$('#btnDeletePicture').button( { icons: { primary: "ui-icon-closethick" } } );

		// 点击修改图片的提交按钮
		$('#btnSubmitPicture').click(function(){

			Mask.createMask();
			Mask.createWaiting();

			var val = $('#filePic').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张图片！',
		    	    timeout: 4000
				});
				return;
			}
			// 获取文件的扩展名，并创建新的文件名
			var photoName = setFileName('pic', $('#filePic'));
			var picNodePath = 'images/'+photoName;
			// $('#filePic').attr('name',picNodePath);
			$('#jsonData').val(picNodePath);

			// 如果用户没有选择文件，则把文件框和文件地址隐藏域删掉
			// 也就是只更新点击后的链接，不更新图片
			if(!val){
				$('#filePic').remove();
				$('#jsonData').remove();
			}
			// 关闭对话框
			$( "#dialog-form" ).dialog( "close" );

			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formChangePicture", 
				postUrl, 
				function(data){
					Mask.removeWaiting();
					Mask.remove();
					// var imgSrc = postUrl+'/'+picNodePath;
					// // 动态刷新图片
					// // $(imgDom).attr("src", imgSrc+"?rand="+Math.random());
					// // 关闭对话框
					// $( "#dialog-form" ).dialog( "close" );
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '图片修改成功！',
			    	    timeout: 1000,
			    	    callback : {
			    	    	// noty 的回调函数
					        afterClose: function() {
					        	// 此方法定义位于edit.html
					        	restartSequence();
					        }
			    	    }
					});
				}
			);
		});
		
		// 点击删除当前图片的按钮
		$('#btnDeletePicture').click(function(){
			deleteSequenceItem();
		});

		// 点击向前添加图片按钮
		$('#btnAddPicFront').click(function(){
			
		});

		// 点击向后添加图片按钮
		$('#btnAddPicBack').click(function(){
			
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:500, width:450 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('更换图片'); 
	}

	// 修改文字的UI
	function changeText(textDom, jsonDataPropName)
	{
		// 清空form
		$( "#dialog-form").empty();

		// 获取文本内容
		var text = $(textDom).html();
		if(text.indexOf('<input')>-1 || text.indexOf('<INPUT')>-1){
			return;
		}
		// 把文本内容换成文本框
		var innerHTML = '<input type="text" id="titleText" value="'+text+'" '+
			' style="width:80%;height:25px;font-size:14px;padding:2px;" maxlength="100" />';
		$(textDom).html(innerHTML);
		// 默认文本框获得焦点
		$('#titleText').focus();
		
		// 添加文本框的失去焦点事件
		$('#titleText').on('blur',function(){
			var value = $('#titleText').val();
			if(!value){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请输入标题内容',
		    	    timeout: 4000
				});
				$('#titleText').focus();
				return;
			}
			if(text==value){
				$(textDom).html(value);
				return;
			}
			var nodeRelPath = 'json/data/title'
			if(!nodeRelPath){
				alert('初始化节点时没有正确设置 nodeRelPath !');
				return;
			}
			// var properties = {};
			// properties[jsonDataPropName] = value;
			// var args = {
   //              url : window.templatePath + '/' + nodeRelPath, 
   //              properties : properties,
   //              success : function(data){
   //              	// 用户提示
   //              	noty({
			// 			layout: "topCenter", 
			//     		type: 'success',
			//     	    text: '文字介绍修改成功！',
			//     	    timeout: 4000
			// 		});
			// 		// 还原文字介绍的样式
			// 		$(textDom).html(value);
   //              },// 成功的回调函数
   //              failed : function(){

   //              },//失败调用的回调函数，可以有也可以没有                      
   //          }
   //          Gutil.updateNode(args);
   			jsonDataPropName = 'name';
			// @drupal 从这里开始修改
			$( "#dialog-form" ).append(
				'<form id="formUpdateSeqItem" method="POST" enctype="multipart/form-data">'+
					'<input type="hidden" id="jsonProperty" name="" value="" />' +
					'<input type="hidden" name="_charset_" value="utf-8" />' + 
				'</form>'
			);
	       	// 设置 form 表单中要提交的数据
	       	$('#jsonProperty').attr('name', nodeRelPath+'/'+jsonDataPropName);
	       	$('#jsonProperty').val(value);
	       	// 提交请求
	       	var postUrl = window.templatePath;
            Gutil.uploadFile(
				"#formUpdateSeqItem", 
				postUrl, 
				function(data){
                	noty({
						layout: "topCenter", 
			    		type: 'success',
			    	    text: '文字介绍修改成功！',
			    	    timeout: 1000,
			    	    callback : {
			    	    	 afterClose: function() {
					        	restartSequence();
					        }
			    	    }
					});
				}
			);	// @drupal 修改到这里

		});
	}


/*************************************************************************************
	替换背景图片的弹出窗口
*************************************************************************************/	
	
	function replaceBGItem(){
		
		// alert('替换背景图');
		// 清空form
		$( "#dialog-form").empty();

		var data = {
		};
		var schema = {
			"description": "请选择一张背景图片",
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				}
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'filePic',
	                'type': 'file',
	                'label': '选择图片',
	                'size':30
	            }
	        },
	        'renderForm':true,
	        'form':{
	        	"attributes": {
	        		"id":"formChangePicture",
	                "method": "POST",
	                "enctype": "multipart/form-data"
	            }
	        }
		};
		$( "#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options,
			'view':'VIEW_JQUERYUI_CREATE_LIST'
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'<div style="width:380px; margin:0px auto;">'+
				'<br />' + 
				'<button id="btnSubmitBGPic">提 交</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
			'</div>'
		);

		// 设置按钮样式
		$('#btnSubmitBGPic').css('width','200px');
		$('#btnSubmitBGPic').button( { icons: { primary: "ui-icon-check" } } );
		
		// 点击修改图片的提交按钮
		$('#btnSubmitBGPic').click(function(){

			Mask.createMask();
			Mask.createWaiting();

			var val = $('#filePic').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张图片！',
		    	    timeout: 4000
				});
				return;
			}
			// 获取文件的扩展名，并创建新的文件名
		
			var picNodePath = 'images/'+'bg.jpg';
			$('#filePic').attr('name',picNodePath);

			// 如果用户没有选择文件，则把文件框和文件地址隐藏域删掉
			// 也就是只更新点击后的链接，不更新图片
			if(!val){
				$('#filePic').remove();
			
			}
			// 关闭对话框
			$( "#dialog-form" ).dialog( "close" );

			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formChangePicture", 
				postUrl, 
				function(data){
					Mask.removeWaiting();
					Mask.remove();
					
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '背景图片修改成功！',
			    	    timeout: 1000,
			    	    callback : {
			    	    	// noty 的回调函数
					        afterClose: function() {
					        	// 此方法定义位于edit.html
					        	restartSequence();
					        }
			    	    }
					});
				}
			);
		});
		


		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:300, width:450 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('更换背景图片'); 
	}

/*************************************************************************************
	添加和删除图片轮播项的弹出窗口
*************************************************************************************/	

	// 添加图片轮播
	function addSequenceItem()
	{
		// 清空form
		$( "#dialog-form").empty();

		var data = {

		};
		var schema = {
			"description": "添加一个新的图片轮播项",
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				}
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'fileBigPic',
	                'type': 'file',
	                'label': '选择大图',
	                'size':30
	            }
	           
	        },
	        'renderForm':true,
	        'form':{
	        	"attributes": {
	        		"id":"formAddPicture",
	                "method": "POST",
	                "enctype": "multipart/form-data"
	            }
	        }
		};
		$( "#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options,
			'view':'VIEW_JQUERYUI_CREATE_LIST'
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<input type="hidden" id="jsonDataBigPic" name="" value="" />' +
			'<input type="hidden" name="_charset_" value="utf-8" />' + 
			'<input type="button" id="btnSubmitSeqItem" value="提 交" />'
		);
		// 添加样式
		$('#btnSubmitSeqItem').button( { icons: { primary: "ui-icon-check" } } );
		$('#btnSubmitSeqItem').css('width','200px');

		// 提交表单
		$('#btnSubmitSeqItem').click(function(){

			var val = $('#fileBigPic').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张大图！',
		    	    timeout: 4000
				});
				$('#fileBigPic').focus();
				return;
			}
			

			// 设置大图片文件存放路径
			var bigPicFileName = 'images/'+setFileName('pic', $('#fileBigPic'));
			// $('#fileBigPic').attr('name',bigPicFileName);

			
			// 设置轮播项的逻辑数据
			var nodeName = 'json/data/'+createNodeName('seq');
			// 保存大图片的文件路径
			$('#jsonDataBigPic').attr('name',nodeName+'/img');
			$('#jsonDataBigPic').val(bigPicFileName);
			// 创建遮罩
			Mask.createMask();
			Mask.createWaiting();

			// 关闭对话框
			$( "#dialog-form" ).dialog( "close" );

			// 从全局变量中读取当前模板的路径
			var postUrl = window.templatePath;
	
			Gutil.uploadFile(
				"#formAddPicture", 
				postUrl, 
				function(data){
					
					Mask.removeWaiting();
					Mask.remove();

					// 动态刷新图片
					// createSequenceItem(window.seqItem);
					// // 重新刷新整个轮播，这个方法不是所有的模板都需要的。
					// restartSequence();
					// window.seqItem = undefined;
					
					// 关闭对话框
					// $( "#dialog-form" ).dialog( "close" );
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '图片修改成功！',
			    	    timeout: 1000,
			    	    callback : {
			    	    	// noty 的回调函数
					        afterClose: function() {
					        	// 此方法定义位于edit.html
					        	restartSequence();
					        }
			    	    }
					});
				}
			);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:500, width:400 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('添加一个新的图片轮播项'); 
	}

	// 删除图片轮播
	function deleteSequenceItem(){
		// 弹出删除确认对话框
		// 提交删除
		var preview_img_src = $('#preview img').attr('src');
	    var $thumb_image = $('#thumbnails_wrapper').find('img[src="' + preview_img_src + '"]');
	    var nodeRelPath = $thumb_image.parent('div').attr('alt');
		
		var nodePath = nodeRelPath;
		var oldPicFile = preview_img_src;
		
		// 弹出删除确认对话框
		// 提交删除
		noty({
			type: 'warning',
			layout: 'topCenter',
			text: '你确定要删除当前图片轮播项吗？',
			buttons: [
			    {
			    	addClass: 'btn btn-primary',
			    	text: '确 定', 
			    	onClick: function($noty) {
			    		// 关闭用户提示
				       	$noty.close();
				       	// 打开等待
				       	Mask.createMask();
						Mask.createWaiting();
				       	// 创建删除的form表单
						$( "#dialog-form" ).append(
							'<form id="formDeleteSeqItem" method="POST" enctype="multipart/form-data">'+
								'<input type="hidden" id="jsonData" name="'+nodePath+'@Delete" />' +
								'<input type="hidden" id="imageFile" name="'+oldPicFile+'@Delete" />' +
								'<input type="hidden" name="_charset_" value="utf-8" />'+
							'</form>'
						);
				       	// 获得当前图片轮播项的相对节点地址
				       	var postUrl = window.templatePath;
				       	// 提交请求
			            Gutil.uploadFile(
							"#formDeleteSeqItem", 
							postUrl, 
							function(data){
								// 刷新
								restartSequence();
							}
						);
				    }
			    },
			    {
			    	addClass: 'btn btn-danger', 
			    	text: '取消', 
			    	onClick: function($noty) {
			      		$noty.close();
			      	}
			    }
			]
		});
	}

	function sequencePause(){
		window.mySequence.pause();
	}

	function sequencePlay(){
		window.mySequence.unpause();
	}

	// 重新启动轮播
	function restartSequence(){
		// window.mySequence.destroy();
		// window.mySequence = undefined;
		// initSequence();
		window.location.reload();
	}

/*************************************************************************************
	个性定制面板
*************************************************************************************/	
	
	// 个性定制面板默认是关闭状态			
	var flag_openCustomDialog = false;
	// 打开个性定制对话框
	window.openCustomDialog = function()
	{
		// 如果传入参数 false 则关闭当前对话框
		if(flag_openCustomDialog){
			$( "#dialog-form" ).dialog('close');
			flag_openCustomDialog = false;
			return;
		}

		// 清空form
		$( "#dialog-form").empty();

		var data = {
		};
		var schema = {
			'properties':{
				
			}
		};
		var options = {
			'fields': {
	           
	        },
	        'renderForm':true,
	         'form':{
	        	"attributes": {
	        		"id":"formChangePicture1",
	                "method": "POST",
	                "enctype": "multipart/form-data"
	            }
	        }
		};
		$( "#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<br /><a id="insertPic" class="abtn">[插入图片]</a><br />'+ 
			'<br /><a id="replacePic" class="abtn">[替换当前图片]</a><br />'+ 
			'<br /><a id="deletePic" class="abtn">[删除当前图片]</a><br />'+
			'<hr />'
		);

		// 给个性定制面板中的元素绑定事件
		// 插入图片
		$("#insertPic").click(function(event){
			addSequenceItem();
		});
		// 删除当前图片
		$("#deletePic").click(function(event){
			deleteSequenceItem();
		});
		// 替换当前图片
		$("#replacePic").click(function(event){
			replaceSequenceItem();
		});
		// 替换背景图
		// $("#replaceBGPic").click(function(event){
		// 	replaceBGItem();
		// });

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:350, width:400 });
		$( "#dialog-form" ).dialog({
			close: function() {
				$( this ).dialog( "close" );
				flag_openCustomDialog = false;
			}
		});
		$( "#dialog-form" ).dialog('open');
		flag_openCustomDialog = true;
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('个性定制'); 
	}



/*************************************************************************************
	公共方法，需要放到库中的
*************************************************************************************/	

// 创建JCR中的唯一节点名称
var createNodeName = function(nodeType)
{
	var nodeDate = new Date();
	var year = nodeDate.getFullYear().toString();
	var month = nodeDate.getMonth().toString();
	var day = nodeDate.getDate().toString();
	var hour = nodeDate.getHours().toString();
	var minute = nodeDate.getMinutes().toString();
	var second = nodeDate.getSeconds().toString();
	var millisecond = nodeDate.getMilliseconds().toString();
	var random = Math.random(millisecond).toString().substring(2,9);
	return nodeType+year+month+day+hour+minute+second+millisecond+random;
}

// 获取一个 file input 中文件的扩展名，并创建一个JCR文件节点名
function setFileName(prefix, fileInput){
	var fileName = $(fileInput).val();
	var fileExt = fileName.substring(fileName.lastIndexOf('.'));
	var resName = createNodeName(prefix)+fileExt;
	return resName;
}
/*************************************************************************************
	自适应大小，以及固定大小
*************************************************************************************/	
	// 浏览器改变大小时，触发的事件
	var timer;
	$(window).bind('resize', function() {
	  	clearTimeout(timer);
	  	timer = setTimeout(function(){ 
	  		/* Whatever you want here */ 
	  		window.location.reload();
	  	}, 1000);
	});
	// 自适应大小
	function initOutputSize(data){
		
		var w = data['width'];
		var h = data['height'];
		
		if(w && h && !isNaN(w) && !isNaN(h)){
		
			$('#main').width(w+'px');
			$('#main').height(h+'px');
		}else{

			w = $(window).width();
			h = $(window).height();

			$('#main').width(w+'px');
			$('#main').height(h+'px');
		}
	}
})();