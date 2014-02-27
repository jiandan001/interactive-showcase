(function() {

	// 模板容器的 id
	var largecontainerID = 'slider-large';
	var thumbcontainerID = 'slider-thumbs';

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));
		/**
			初始化模板数据
		*/
	
		initData(function(data){
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);
			// 绑定事件
			bindEditEvent();
			// 初始化对话框
			initDialog();
			// 调用初始化完毕的事件
			//initDataFinished();
			//模板自带
			modelShow();
			initOutputSize(data);
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
				title: val['title'],
				text: val['text'],
				model: val['img'],
				smpic: val['thumbnail'],
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
			smpic = args['smpic'],
			link = args['link'];
		var href = 'href='+link;
			if(link==undefined){
				href = '';
			}
		if(model){
			var largeStr = "<li alt=\""+nodeRelPath+"\">"+
								"<img src=\""+model+"\" alt=\""+link+"\" class=\"large_picture\" style=\"width:1280px;height:500px;\"/>"+
								"<div class=\"ei-title\">"+
									"<h2 class=\"elastic_title\">"+title+"</h2>"+
									"<h3 class=\"elastic_text\">"+text+"</h3>"+
								"</div>"+
							"</li>";
	                   
	        var thumbStr = "<li alt=\""+nodeRelPath+"\"><a href=\"#\"></a></li>";
	        /*<img src=\""+smpic+"\" alt=\"\" class=\"thumb_picture\"  style=\"width:150px;height:59px;\"/>*/ 					
		}
		if(largeImg&&thumbImg){ 
			$(largeImg).append(largeStr);
			$(thumbImg).append(thumbStr);
		}else{
			alert('初始化数据时容器不存在！');
		}
	}


	/*
		删除图片轮播项Dom节点
	*/
	function deleteSeqDomItem(altValue)
	{
		$("#"+containerID+"").remove("div[alt='"+altValue+"']");
		restartSequence();
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
	给 DOM 绑定事件，用来处理编辑
*************************************************************************************/
	function bindEditEvent()
	{
		//给所有图片监听点击事件
		$(".large_picture").click(function(event){
			// 弹出修改图片的UI
			showChangePictureUI($(this),'img');	// 这里的 img 是json/data/1 节点中的属性
		});
		// 修改标题
		$(".elastic_title").click(function(event){
			changeText($(this),'title');
		});

		// 修改内容
		$(".elastic_text").click(function(event){
			changeText($(this),'text');
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
		var nodeRelPath = $(imgDom).parent().attr('alt');
		if(!nodeRelPath){
			alert('初始化节点时没有设置 nodeRelPath !');
			return;
		}
		// 获取图片地址的存放路径 json/data/1/img
		var dataNodeName = nodeRelPath+'/'+jsonDataPropName;
		// 获取当前被替换图片的文件名，替换后需要删除掉
		var oldPicFile = $(imgDom).attr('src');
		// 获取点击图片后打开的链接
		var defaultLink = $(imgDom).attr('alt');
		if(defaultLink=="undefined")defaultLink = "";
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
	                'label': '点击图片后打开的链接'
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
			//'<input type="hidden" name="'+oldPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'<div style="width:380px; margin:0px auto;">'+
				'<br />' + 
				'<button id="btnSubmitPicture">提 交</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
				'<button id="btnDeletePicture"> 删除此图片 </button>' +
				'<br /><br /><br /><br /><hr /><br />' + 
				'<button id="btnAddPicFront">添加图片</button>&nbsp;&nbsp;' +
				// '<button id="btnAddPicBack">在此图之后添加图片</button>' + 
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
					// 动态刷新图片
					if(val){	// 如果用户更换了图片
						var imgSrc = postUrl+'/'+picNodePath;
						$(imgDom).attr("src", imgSrc+"?rand="+Math.random());						
					}
					$(imgDom).attr("alt", $('#link').val());
					
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '图片修改成功！',
			    	    timeout: 4000
					});
				}
			);
		});

		// 点击删除当前图片的按钮
		$('#btnDeletePicture').click(function(){
			deleteSequenceItem(nodeRelPath, oldPicFile);
		});

		// 点击向前添加图片按钮
		$('#btnAddPicFront').click(function(){
			addSequenceItem();
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
			var nodeRelPath = $(textDom).parent().parent().attr('alt');
			if(!nodeRelPath){
				alert('初始化节点时没有正确设置 nodeRelPath !');
				return;
			}
			/*var properties = {};
			properties[jsonDataPropName] = value;
			var args = {
                url : window.templatePath + '/' + nodeRelPath, 
                properties : properties,
                success : function(data){
                	// 用户提示
                	noty({
						layout: "topCenter", 
			    		type: 'success',
			    	    text: '文字介绍修改成功！',
			    	    timeout: 4000
					});
					// 还原文字介绍的样式
					$(textDom).html(value);
                },// 成功的回调函数
                failed : function(){

                },//失败调用的回调函数，可以有也可以没有                      
            }
            Gutil.updateNode(args);*/
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
			    	    timeout: 4000
					});
					// 还原文字介绍的样式
					$(textDom).html(value);
				}
			);	// @drupal 修改到这里
		});
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
				},
				'linkName':{
					"type": "string"
				},
				/*'fileSmallPicName':{
					"type": "string",
             		"format": "uri"
				},*/
				'bigTitleName':{
					"type": "string"
				},
				'smallTitleName':{
					"type": "string"
				}
				/*'picAltName':{
					"type": "string"
				}*/
			}
		};
		var options = {
			'fields': {
	            'filePicName': {
	            	'id':'fileBigPic',
	                'type': 'file',
	                'label': '选择图片',
	                'size':30
	            },
	            'linkName': {
	            	'id':'link',
	                'type': 'text',
	                'label': '点击图片后打开的链接'
	            },
	           /* 'fileSmallPicName': {
	           		'id':'fileSmallPic',
	                'type': 'file',
	                'label': '选择缩略图',
	                'size':30
	            },*/
	            'bigTitleName': {
	            	'id':'bigTitle',
	                'type': 'text',
	                'label': '请输入大标题：'
	            },
	            'smallTitleName': {
	            	'id':'smallTitle',
	                'type': 'text',
	                'label': '请输入内容'
	            }
	           /* 'picAltName': {
	            	'id':'picAlt',
	                'type': 'text',
	                'label': '请输入作者'
	            }*/
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
			'<input type="hidden" id="jsonDataSmallPic" name="" value="" />'+
			'<input type="hidden" name="_charset_" value="utf-8" />' + 
			'<button type="button" id="btnSubmitSeqItem">提 交</button>'
		);

		$('#btnSubmitSeqItem').button( { icons: { primary: "ui-icon-check" } } );
		$('#btnSubmitSeqItem').css('width','200px');

		// 提交表单
		$('#btnSubmitSeqItem').click(function(){

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
			/*val = $('#fileSmallPic').val();
			if(!val){
			 	noty({
			 		layout: "topCenter",
		     		type: 'error',
		     	    text: '请选择一张缩略图！',
		     	    timeout: 4000
			 	});
			 	$('#fileSmallPic').focus();
			 	return;
			}*/
			val = $('#bigTitle').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请输入大标题',
		    	    timeout: 4000
				});
				$('#bigTitle').focus();
				return;
			}
			val = $('#smallTitle').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请输入内容',
		    	    timeout: 4000
				});
				$('#smallTitle').focus();
				return;
			}


			// 设置大图片文件存放路径
			var bigPicFileName = 'images/'+setFileName('pic', $('#fileBigPic'));
			//$('#fileBigPic').attr('name',bigPicFileName);
			// 设置小图片文件存放路径
			//var smallPicFileName = 'images/thumbs'+setFileName('pic', $('#fileSmallPic'));
			//$('#fileSmallPic').attr('name',smallPicFileName);

			// 设置轮播项的逻辑数据
			var nodeName = 'json/data/'+createNodeName('seq');
			// 保存大图片的文件路径
			$('#jsonDataBigPic').attr('name',nodeName+'/img');
			$('#jsonDataBigPic').val(bigPicFileName);
			// 设置点击图片后的跳转链接文本框的名称，也就是节点名
			var jsonDataLink = nodeName+'/link';
			$('#link').attr('name',jsonDataLink);
			 //保存小图片的文件路径
			 // $('#jsonDataSmallPic').attr('name',nodeName+'/thumbnail');
			 // $('#jsonDataSmallPic').val(smallPicFileName);
			// 设置大标题的数据存放路径
			$('#bigTitle').attr('name',nodeName+'/title');
			// 设置小标题的数据存放路径
			$('#smallTitle').attr('name',nodeName+'/text');
			//$('#picAlt').attr('name',nodeName+'/author');

			Mask.createMask();
			Mask.createWaiting();

			// 从全局变量中读取当前模板的路径
			var postUrl = window.templatePath;
			window.seqItem = {
				nodeRelPath: nodeName,
				author: $('#picAlt').val(),
				title: $('#bigTitle').val(),
				text: $('#smallTitle').val(),
				model: bigPicFileName
				//thumbnail: smallPicFileName
			};
			// 关闭对话框
			$( "#dialog-form" ).dialog( "close" );

			Gutil.uploadFile(
				"#formAddPicture", 
				postUrl, 
				function(data){
					Mask.removeWaiting();
					Mask.remove();
					// 重新刷新整个轮播
					restartSequence();
				}
			);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:550, width:450 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('添加一个新的图片轮播项'); 
	}

	// 删除图片轮播
	// nodePath 是相对路径：json/data/seq203402938
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
		
	}

	function sequencePlay(){
		
	}

	function restartSequence(){
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
				// 'stayTimeName':{
				// 	"type": "number",
    //         		"minimum": 1,
    //             	"maximum": 10,
    //         		"default":3
				// }
			}
		};
		var options = {
			'fields': {
	            // 'stayTimeName': {
	            // 	'id':'stay_time',
	            //     'type': 'text',
	            //     'label': '图片轮播的间隔时间(单位：秒)',
	            //     'size':10
	            // }
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
			'<hr />'+
			'<br /><a id="insertPic" class="abtn">[插入图片]</a><br />'
		);

		// 给个性定制面板中的元素绑定事件
		// 插入图片
		$("#insertPic").click(function(event){
			addSequenceItem();
		});
		// 图片轮播时间输入框失去焦点
		$("#stay_time").on('blur',function(event){
			var val = $('#stay_time').val();
			if(!val){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '请填写图片轮播的间隔时间',
		    	    timeout: 4000
				});
				$('#stay_time').focus();
				return;
			}
			if(isNaN(val)){
				noty({
					layout: "topCenter",
		    		type: 'error',
		    	    text: '图片轮播的间隔时间必须是一个整数',
		    	    timeout: 4000
				});
				$('#stay_time').focus();
				return;
			}
		});

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
/***************************************************************************************
	模板自带方法
****************************************************************************************/	
	//页面自适应
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
})();