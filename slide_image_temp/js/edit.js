(function(){
	var num = 0;
	//var winW = $(window).width();
	var runtime = 600;
	var latency = 2000;
	var control;
	var cur_img;
	var img_num = 0;
	var widths = 0;
	var lis
	/***程序入口***/
	$(document).ready(function(){
		
		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/
		initData();
		initDialog();
		
	});
	
	//初始化数据
	function initData(){
		$.getJSON(window.templatePath + ".2.json?r="+Math.random()).done(function(data){ 
			createItems(data);
		}).fail(function(){
			alert("初始化数据失败！");
		})
	}
	function createItems(data){
		$.each(data,function(key,val){
			if(!val['jcr:created']){
				return;
			}
			var img_url = val['img'];
			$(".slide_img").append("<li>" +
									"<a href='javascript:void(0)'>" + 
										"<img src='"+ img_url +"?rand="+ Math.random()+"'alt='"+ key + "'/>"+
									"</a>" +
								"</li>");
		});
		var uls = $('ul.slide_img');
		var box = $('#slide_box');
		lis = $('img',uls);
		checkIsOnload();
		
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
		//widths += lis.length * 1000;
		uls.width(widths);
		// box初始的宽度
		var lis_1_width = lis.eq(0).width();
		var lis_1_height = lis.eq(0).height();
		// 设置box位置居中
		var win_w = $(window).width();
		box.css({width:lis_1_width,height:lis_1_height,left : ($(window).width() - lis_1_width)/2});
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
				// 弹出修改图片的UI
				showChangePictureUI($(this));
			}
		})
		
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
			'<hr />'+
			'<br /><a id="insertPic" class="abtn">[插入图片]</a><br />'
			//'<br /><a id="deletePic" class="abtn">[删除当前图片]</a>'
		);

		// 给个性定制面板中的元素绑定事件
		//插入图片
		$("#insertPic").click(function(event){
			addItem();
		});
		//删除当前图片
		/*$("#deletePic").click(function(event){
			//清除定时器
			clearTimeout(control);
			var currentItem = $(".current").html();
			var currentImg = $(".slide_img").find('img').eq(num)[0].alt;
			deleteItem(currentImg);
		});*/
		
		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:350, width:400 });
		$( "#dialog-form" ).dialog({
			close: function() {
				$( this ).dialog( "close" );
				flag_openCustomDialog = false;
				//dialog关闭之后重新设置模板的轮播事件
				control = setTimeout(slide, latency);
			}
		});
		//dialog打开之后将模板的轮播事件禁掉
		$( "#dialog-form" ).dialog({
			open: function() {
				//清除定时器
				clearTimeout(control);
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
		box.animate({width : lis_now_width,height : lis_now_height,left : ($(window).width() - lis_now_width)/2},runtime);
		
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
	function showChangePictureUI(imgDom){
		// 清空form
		$( "#dialog-form").empty();
		var cur_img = $(imgDom).children()[0].children[0];
		var nodeRelPath = cur_img.alt;
		var dataNodeName = "json/data/" + nodeRelPath+'/'+ "img";
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
	                'label': '选择图片'
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
			'<input type="hidden" id="jsonData" name="'+dataNodeName+'"/>'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'+ 
			'<input style="margin-left:10px" type="button" id="btnDeletePicture" value="删除此图片" />' + 
			'<div style="height:20px;"></div>' + 
			'<input style="margin-left:10px" type="button" id="btnSubmitPicture" value="提 交" />'
		);
		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:350, width:400 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('更换图片'); 
		// 点击提交按钮
		$('#btnSubmitPicture').click(function(){
			var currentItem = $(".current").html();
			var currentImg = $(".slide_img").find('img').eq(num)[0].alt;
			var picNodePath = 'image/'+currentImg + ".jpg";
			//$('#filePic').attr('name',picNodePath);
			$('#jsonData').val(picNodePath);

			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formChangePicture", 
				postUrl, 
				function(data){
					var imgSrc = postUrl+'/'+picNodePath;
					// 动态刷新图片
					$(cur_img).attr("src", imgSrc+"?rand="+Math.random());
					// 关闭对话框
					$( "#dialog-form" ).dialog( "close" );
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '图片修改成功！',
			    	    timeout: 4000
					});
					window.location.href = "edit.html";
					//$(".slide_img li img").css("max-width",$(window).width() + "px");
				}
			);
		});
		$("#btnDeletePicture").click(function(event){
			var currentItem = $(".current").html();
			var currentImg = $(".slide_img").find('img').eq(num)[0].alt;
			deleteItem(currentImg);
		});
	}
	// 添加图片
	function addItem(){
		// 清空form
		$( "#dialog-form").empty();
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
	                'label': '选择图片'
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
			'<input type="hidden" id="jsonData" name="" value="" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'+ 
			'<input type="button" id="btnSubmitItem" value="提 交" />'
		);
		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:350, width:400 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('添加图片');
		// 提交表单
		$('#btnSubmitItem').click(function(){
			// 设置图片文件存放路径
			var fileName = setFileName('pic', $('#filePic'));
			var picFileName = 'image/'+ fileName;
			//$('#filePic').attr('name',picFileName);

			// 设置json数据添加路径
			var nodeName = "json/data/" + fileName.split('.')[0];
			$('#jsonData').val(picFileName);
			$('#jsonData').attr('name',nodeName+'/img');


			var postUrl = window.templatePath;
			Gutil.uploadFile(
				"#formAddPicture", 
				postUrl, 
				function(){
					$( "#dialog-form" ).dialog( "close" );
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '图片添加成功！',
			    	    timeout: 4000
					});
					window.location.href = "edit.html";
				}
			);
		});
	}
	function deleteItem(cur_img){
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
				       	$noty.close();
				       
						var formHTML = '<form id="formDelPicture" method="POST" enctype="multipart/form-data" >' + 
								'<input type="hidden" id="filePic" name="" />' + 
								'<input type="hidden" id="jsonData" name=""/>'+
								'<br />' +
							'</form>';
						$( "#dialog-form" ).html(formHTML);
						var picFileName = 'image/'+ cur_img + ".jpg";
						$('#filePic').attr('name',picFileName + "@Delete");
						var nodeName = 'json/data/'+ cur_img;
						$('#jsonData').attr('name',nodeName + "@Delete");
						
						var postUrl = window.templatePath;
							Gutil.uploadFile(
								"#formDelPicture", 
								postUrl, 
								function(){
									window.location.href = "edit.html";
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
	function checkIsOnload(){
		var img = lis[lis.length - 1];
		if(img.complete){
			bindEditEvent();
		}else{
			img.onload = function(){
				//$(".slide_img li img").css("max-width",$(window).width()-40 + "px");
				if(img.width){
					
					bindEditEvent();
				}
			}
		}
		
	}
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
})()