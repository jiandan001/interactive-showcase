(function() {

	
	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));

		/**
			初始化模板数据
		*/
		initData(function(data){
			
			// 初始化对话框
			initDialog();
			// 初始化输出大小
			initOutputSize(data);
			// 处理data.js 中的json 格式数据，同时返回items
			var items = dealJsonData(data);

			// 启动可缩放弹性相册
			launchFlexAutoAlbums(items);
			
			// 绑定事件
			bindEditEvent();
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

	// 处理data.js 中的json 格式数据，同时返回items
	function dealJsonData(data){

		var items = [];
		var item = [];
		$.each(data,function(key,val){

			if(!val['jcr:created']){
				return;
			}
			if(key=="bgImage"){
				return;
			}
			item = [];
			item.push(val['img']);
			item.push(val['text']);
			item.push("json/data/" + key);
		    // console.log(item);
			items.push(item);
			
			
		});

		return items;
	}

	// 启动可缩放弹性相册
	function launchFlexAutoAlbums(items){

		window.diap.init('screen',4,4,"",items);

	}


/*************************************************************************************
	添加和删除图片轮播项的DOM节点
*************************************************************************************/	

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
		
		$('img').dblclick(function(event) {
			
			showChangePictureUI($(this), 'img'); // 这里的 img 是json/data/1 节点中的属性
		});


		// 修改子标题
		$(document).on('click','div.label', function(event){
			// console.log(this);
			// alert(1);
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
		// oldPicFile = oldPicFile.split('/images/')[1]
		oldPicFile = oldPicFile.substring(oldPicFile.lastIndexOf('/images/')+1);
		// console.log(oldPicFile);
		// 获取点击图片后打开的链接
		// var defaultLink = $(imgDom).attr('alt');
		// if(defaultLink=="undefined")defaultLink = "";

		var data = {
		};
		var schema = {
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
			'options':options
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
			'</div>'
		);

		// 设置按钮样式
		$('#btnSubmitPicture').css('width','200px');
		$('#btnSubmitPicture').button( { icons: { primary: "ui-icon-check" } } );
		// $('#btnAddPicFront').button( { icons: { primary: "ui-icon-seek-prev" } } );
		// $('#btnAddPicBack').button( { icons: { primary: "ui-icon-seek-next" } } );
		// $('#btnDeletePicture').button( { icons: { primary: "ui-icon-closethick" } } );

		// 点击修改图片的提交按钮
		$('#btnSubmitPicture').click(function(){

			Mask.createMask();
			Mask.createWaiting();
			
			var val = $('#filePic').val();			
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
			// 设置点击图片后的跳转链接文本框的名称，也就是节点名
			// var jsonDataLink = nodeRelPath+'/link';
			// $('#link').attr('name',jsonDataLink);

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
					// if(val){	// 如果用户更换了图片
					// 	var imgSrc = postUrl+'/'+picNodePath;
					// 	$(imgDom).attr("src", imgSrc+"?rand="+Math.random());						
					// }
					// $(imgDom).attr("alt", $('#link').val());
					
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '图片修改成功！',
			    	    timeout: 1000,
			    	    callback : {
			    	    	afterClose: function() {
					        	restartSequence();
					        }
			    	    }
					});
				}
			);
		});

		// // 点击删除当前图片的按钮
		// $('#btnDeletePicture').click(function(){
		// 	deleteSequenceItem(nodeRelPath, oldPicFile);
		// });

		// // 点击向前添加图片按钮
		// $('#btnAddPicFront').click(function(){
			
		// });

		// // 点击向后添加图片按钮
		// $('#btnAddPicBack').click(function(){
			
		// });

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
		// alert(1);
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
			var nodeRelPath = $(textDom).attr('alt');
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
			//     	    timeout: 1000,
			//     	    callback:{
			//     	    	afterClose : function(){
			//     	    		restartSequence();
			//     	    	}
			//     	    }
			// 		});
			// 		// 还原文字介绍的样式
			// 		// $(textDom).html(value);
   //              },// 成功的回调函数
   //              failed : function(){

   //              },//失败调用的回调函数，可以有也可以没有                      
   //          }
   //          Gutil.updateNode(args);
   			// jsonDataPropName = 'name';
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
	替换预加载图片的弹出窗口
*************************************************************************************/	
	
	// 替换预加载图片
	function replacePreItem(){
		// alert('替换背景图');
		// 清空form
		$( "#dialog-form").empty();

		// 获取背景图片的位置
		var nodeRelPath = "json/data/bgImage";
		var jsonDataPropName = "img";
		
		// 获取图片地址的存放路径 json/data/1/img
		var dataNodeName = nodeRelPath+'/'+jsonDataPropName;
		// 获取当前被替换图片的文件名，替换后需要删除掉
		var oldPicFile = "or11.jpg";

		var data = {
		};
		var schema = {
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
			'options':options
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			'<input type="hidden" id="jsonData" name="'+dataNodeName+'" value="" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'<div style="width:380px; margin:0px auto;">'+
				'<br />' + 
				'<button id="btnSubmitPicture">提 交</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
			'</div>'
		);

		// 设置按钮样式
		$('#btnSubmitPicture').css('width','200px');
		$('#btnSubmitPicture').button( { icons: { primary: "ui-icon-check" } } );
		

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
			// var photoName = setFileName('pic', $('#filePic'));
			var photoName = "or11.jpg";
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
					
					// 显示用户提示信息
					noty({
						layout: "topCenter",
			    		type: 'success',
			    	    text: '替换预加载图片成功！',
			    	    timeout: 1000,
			    	    callback : {
			    	    	afterClose: function() {
					        	restartSequence();
					        }
			    	    }
					});
				}
			);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:500, width:450 });
		$( "#dialog-form" ).dialog('open');
		$("span.ui-dialog-title").css({
			'font-size':'13px',
			'font-family':'Microsoft YaHei'
		});
		$("span.ui-dialog-title").text('替换预加载图片'); 
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
			'<br /><a id="replacePrePic" class="abtn">[替换预加载图片]</a><br />'
		);

		// 给个性定制面板中的元素绑定事件
		// 替换预加载图片
		$("#replacePrePic").click(function(event){
			replacePreItem();
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
		
			$('body').width(w+'px');
			$('body').height(h+'px');
		}else{

			w = $(window).width();
			h = $(window).height();

			$('body').width(w+'px');
			$('body').height(h+'px');
		}
	}
})();