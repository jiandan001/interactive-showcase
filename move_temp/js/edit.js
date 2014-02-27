(function() {

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		// 得到当前展品路径,ps:/web360/content/users/admin/exhibits/exhibit201310271752271794356405
		window.templatePath = url.substring(0,url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/
		initData(function(data){
			// 初始化大小
			initOutputSize(data);
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);
			// 初始化轮播
			exe();
			//绑定事件
			bindEditEvent();
			// 初始化对话框
			initDialog();
		
		});
		
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
							//$('.imgclass').bind('click',function(){
								//alert(this.id);
								//$hs_areas.trigger('mouseenter');
							//});
						}
					}).attr('src',$this.attr('src'));
				});			
   }
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
			alert("初始化数据失败！展品 edit.js 第64行");
		})
	}
	// 此方法是需要根据不同的模板来定制的
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
				position: val['position'],
				link: val['link'],
				alt:key
			}
			var str = createSequenceItem(args,conArr);
			
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

	function createSequenceItem(args,conArr){
		
		var sequenceCanvasItem='';
		var model = args['model'],
			position = args['position'],
			nodeRelPath = args['nodeRelPath'],
			link = args['link'],
			id = args['alt'];
			//sequenceCanvas = $("#test");
			classV = 'imgclass';
		if (!conArr[position-1]) {
		
			classV = "imgclass hs_visible";
		}

		sequenceCanvasItem += "<img src= '"+ model + "' class= '"+ classV +"' width='100%' height='100%' alt=\"" + id + '*' + link +"\" id = '" + position +"'/>";

		return sequenceCanvasItem;
	}

	// 初始化对话框
	function initDialog(){
		$( "#dialog-form" ).dialog({
			autoOpen: false,
			height: 265,
			width: 265,
			modal: true,
			close: function() {
				$( this ).dialog( "close" );
			}
		});
	}

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

		};
		var options = {

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
			'options':options,
			'view':'VIEW_JQUERYUI_CREATE_LIST'
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			//'<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="changeBg" class="abtn" alt="bg.jpg">[修改背景图片]</a><br />'+ 
			'<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="insertPic" class="abtn">[正在建设中..]</a><br />'

		);

		// 给个性定制面板中的元素绑定事件
			
		//插入图片
		$("#insertPic").click(function(event){
			//addSequenceItem();
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:280, width:265 });
		$(".ui-dialog").css({"z-index":9999});
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
	给 DOM 绑定事件，用来处理编辑
*************************************************************************************/
	function bindEditEvent()
	{
		//给所有图片监听点击事件
		$('.imgclass').click(function(event){

				showChangePictureUI($(this),'img');	// 这里的 img 是json/data/1 节点中的属性

		});		

	}


/*************************************************************************************
	处理编辑图片、文字的具体 Action ，增删改查操作
*************************************************************************************/
	// 更换图片的UI
	function showChangePictureUI(imgDom, jsonDataPropName)
	{
		// 清空form
		$( "#dialog-form").empty();

		// 修改当前轮播项数据所使用的图片路径

		var nodeRelPath = "json/data/" + $(imgDom).attr('alt').split("*")[0];
		var position = $(imgDom).attr('id');

		if(!nodeRelPath){
			alert('初始化节点时没有设置 nodeRelPath !');
			return;
		}
		// 获取图片地址的存放路径 json/data/1/img
		var dataNodeName = nodeRelPath+'/'+jsonDataPropName;
		// 获取当前被替换图片的文件名，替换后需要删除掉
		var oldPicFile = $(imgDom).attr('src');
		//console.log(dataNodeName);
		//console.log(oldPicFile);
		// 获取点击图片后打开的链接
		var defaultLink = $(imgDom).attr('alt').split("*")[1];
		
		if(defaultLink=="undefined") {
			defaultLink = "";
		}
		var data = {
		};
		var schema = {
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				},
				'linkName':{
					"type": "string",
					'default': defaultLink
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
	            },
	            'linkName': {
	            	'id':'link',
	                'type': 'text',
	                'label': '点击图片和标题后打开的链接',
					'size':32
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
			'options':options
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<input type="hidden" id="jsonData" name="'+dataNodeName+'" value="" />'+ 
			//'<input type="hidden" id="deleteData" name="'+oldPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="btnSubmitPicture">提 交</button>' +
			'<br /><br />' + 
			'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="btnDeletePicture"> 删除此图片 </button>'+
			'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="btnAddPicture"> 添加图片 </button>'
		);

		// 设置按钮样式
		$('#btnSubmitPicture').css('width','252px');
		$('#btnSubmitPicture').button( { icons: { primary: "ui-icon-check" } } );
		$('#btnDeletePicture').button( { icons: { primary: "ui-icon-closethick" } } );
		$('#btnAddPicture').button( { icons: { primary: "ui-icon-arrowthick-1-sw" } } );

		// 点击修改图片的提交按钮
		$('#btnSubmitPicture').click(function(){

			Mask.createMask();
			Mask.createWaiting();
			
			var val = $('#filePic').val();			
			// 获取文件的扩展名，并创建新的文件名
			var photoName = setFileName('pic', $('#filePic'));
			var picNodePath = 'images/'+photoName;
			//$('#filePic').attr('name',picNodePath);
			$('#jsonData').val(picNodePath);
			// 如果用户没有选择文件，则把文件框和文件地址隐藏域删掉
			// 也就是只更新点击后的链接，不更新图片
			if(!val){
				$('#filePic').remove();
				$('#jsonData').remove();
				// $('#deleteData').remove();
			}
			// 设置点击图片后的跳转链接文本框的名称，也就是节点名
			var jsonDataLink = nodeRelPath+'/link';
			$('#link').attr('name',jsonDataLink);

			// 关闭对话框
			$( "#dialog-form" ).dialog( "close" );

			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formChangePicture", 
				postUrl, 
				function(data){
					Mask.removeWaiting();
					Mask.remove();
					// 动态刷新
					if(val){	
						// 如果用户更换了图片
						var imgSrc = postUrl+'/'+picNodePath;
						$(imgDom).attr("src", imgSrc+"?rand="+Math.random());						
					}
					// 更新链接
					var imgDomAltB = $(imgDom).attr('alt').split("*")[0];
					var imgDomAltM = '*';
					var imgDomAltE = $('#link').val();
					$(imgDom).attr("alt", imgDomAltB+imgDomAltM+imgDomAltE);
					
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '修改成功！',
			    	    timeout: 4000
					});
				}
			);
		});

		// 点击删除当前图片的按钮
		$('#btnDeletePicture').click(function(){
		
			var count =  $(imgDom).context.parentElement.childElementCount;
			
			if(count != 1) {
				deleteSequenceItem(nodeRelPath, oldPicFile);
			}else {
				alert('当前版块只有一张图片,不支持删除操作！');
			}
		});		
		// 点击插入图片按钮
		$('#btnAddPicture').click(function(){
			addSequenceItem(position);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:330, width:361 });
		$(".ui-dialog").css({"z-index":9999});
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('更换图片'); 
	}

	// 添加图片轮播
	function addSequenceItem(position)
	{
		// 清空form
		$( "#dialog-form").empty();

		var data = {

		};
		var schema = {
			"description": "在当前板块添加新图片",
			'properties':{
				'filePicName':{
					"type": "string",
            		"format": "uri"
				},
				'linkName':{
					"type": "string"
				}    
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'fileBigPic',
	                'type': 'file',
	                'label': '选择图片',
	                'size':15
	            },
	            'linkName': {
	            	'id':'link',
	                'type': 'text',
	                'label': '点击图片和标题后打开的链接'
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
			'<input type="hidden" id="jsonPosition" name="" value="" />' +
			'<input type="hidden" name="_charset_" value="utf-8" />' + 
			'<input type="button" id="btnSubmitSeqItem" value="提 交" />'
		);
		 $('#btnSubmitSeqItem').button( { icons: { primary: "ui-icon-check" } } );

		// 提交表单
		$('#btnSubmitSeqItem').click(function(){
		
			Mask.createMask();
			Mask.createWaiting();
			
			var val = $('#fileBigPic').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请选择一张图片！',
		    	    timeout: 4000
				});
				$('#fileBigPic').focus();
				return;
			}

			// 设置大图片文件存放路径
			var bigPicFileName = 'images/'+setFileName('pic', $('#fileBigPic'));
			//$('#fileBigPic').attr('name',bigPicFileName);

			// 设置轮播项的逻辑数据
			var nodeName = 'json/data/'+createNodeName('seq');
			// 保存大图片的文件路径
			$('#jsonDataBigPic').attr('name',nodeName+'/img');
			$('#jsonDataBigPic').val(bigPicFileName);			
			// 保存图片的position
			$('#jsonPosition').attr('name',nodeName+'/position');
			$('#jsonPosition').val(position);
			// 点击图片的连接
			var jsonDataLink = nodeName+'/link';
			$('#link').attr('name',jsonDataLink);			
			// 从全局变量中读取当前模板的路径
			var postUrl = window.templatePath;

			Gutil.uploadFile(
				"#formAddPicture", 
				postUrl, 
				function(){
					
					restartSequence();
				}
			);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:290, width:385 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('添加一个新的图片轮播项'); 
	}

	// 删除图片轮播
	function deleteSequenceItem(nodePath, oldPicFile){
		if(!nodePath){
			alert('deleteSequenceItem(nodePath) nodePath is undefined!');
			return;
		}

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
								//'<input type="hidden" id="imageFile" name="'+oldPicFile+'@Delete" />' +
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
	
	function restartSequence(){
		//window.location.reload();
		$( "#dialog-form" ).dialog( "close" );
		Mask.removeWaiting();
		Mask.remove();
		
			initData(function(data){
				// 初始化大小
				initOutputSize(data);
				// 创建 DOM 节点，添加图片轮播项
				createItems(data);
				// 初始化轮播
				exe();
				//绑定事件
				bindEditEvent();
				// 初始化对话框
				initDialog();
			
			});
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