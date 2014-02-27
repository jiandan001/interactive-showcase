(function() {

	//var flag;

	// 模板容器的 dom id 
	var containerID = 'bank';

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));

		/**
			初始化模板数据
		*/
		initData(function(data){
		
			// 初始化大小
			initOutputSize(data);
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);
			// 绑定事件
			initDataFinished();
			// 初始化对话框
			initDialog();
			// 调用初始化完毕的事件
			bindEditEvent();
			
		});
		
		//触发body改变的事件
		$(window).resize(function(){
		
			 initOutputSize();

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
			var nodeRelPath = key;
			args = {
				nodeRelPath: nodeRelPath,
				alt: val['alt'],
				model: val['img'],
				subtitle: val['subtitle'],
				//thumbnail: val['thumbnail'],	// 当前模板不需要这个属性，所以注释掉
				title: val['title'],
				link: val['link']	// 这里是根据当前模板自己添加的属性
			}
			createSequenceItem(args);
		});
	}


/*************************************************************************************
	添加和删除图片轮播项的DOM节点
*************************************************************************************/	
	/**
		此方法是需要根据不同的模板来定制的
		创建一个 sequence 项，包括图片、文字、缩略图
		@param args = {
			nodeRelPath:'',	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			alt:'',			// 图片的 tooltip 信息
			title:'',		// 图片大标题
			subtitle:'',	// 图片小标题
			model:'',		// 大图片路径
			thumbnail:''	// 缩略图路径	
		}
	*/
	function createSequenceItem(args){
		var title = args['title'],	// 图片大标题
			nodeRelPath = args['nodeRelPath'],	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			subtitle = args['subtitle'],	// 图片小标题
			model = args['model'],			// 大图片路径
			// thumbnail = args['thumbnail'],	// 缩略图路径	
			alt = args['alt'],				// 图片的 tooltip 信息
			link = args['link'],
			sequenceCanvas = $("."+containerID+"");	// 这里获取容器

		var sequenceCanvasItem = 	// 这里是创建大图片时的DOM结构
			'<div class="slide" alt="'+nodeRelPath+'">'+

			'<a class="diapo word" rel="'+model+'" id="'+nodeRelPath+'" title="'+title+'" alt="'+link+'">' + subtitle + '</a>' +
			
			'</div>';

		if(sequenceCanvas){ 
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
	给 DOM 绑定事件，用来处理编辑
*************************************************************************************/
	function bindEditEvent(){

		$(".diapo").click(function(event){
			// 弹出修改图片的UI
			if($('.flag').attr("value") == '1'){
				showChangePictureUI($(this),'img');	// 这里的 img 是json/data/1 节点中的属性
			}
		});

		// 修改标题
		$(".title").click(function(event){
			changeText($(this),'title');
		});

		// 修改子标题
		$(".legend").click(function(event){
			changeText($(this),'subtitle');
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
		var nodeRelPath = 'json/data/' + $(imgDom).attr('id');
		//var nodeRelPath = "json/data/2";
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
	                'label': '点击图片和标题后打开的链接(例如：http：//www.baidu.com)',
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
			'<input type="hidden" id="deleteData" name="'+oldPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		$('#dialog-form').append(
			'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="btnSubmitPicture">提 交</button>' +
			'<br /><br />' + 
			'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="btnDeletePicture"> 删除此图片 </button>'
		);

		// 设置按钮样式
		$('#btnSubmitPicture').css('width','252px');
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
				$('#deleteData').remove();
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

						// 动态刷新
						if(val){	
							restartSequence();
						}else {
							Mask.removeWaiting();
							Mask.remove();
							// 更新链接
							$(imgDom).attr("alt", $('#link').val());						
							// 显示用户提示信息
							noty({
								layout: "topCenter",
								type: 'success',
								text: '修改成功！',
								timeout: 4000
							});	
						}		
				}
			);
		});
		
		// 点击删除当前图片的按钮
		$('#btnDeletePicture').click(function(){
			deleteSequenceItem(nodeRelPath, oldPicFile);
		});
		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:400, width:400 });
		$(".ui-dialog").css({"z-index":9999});
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
			var nodeRelPath = 'json/data/' + $(textDom).attr('id');
			if(!nodeRelPath){
				alert('初始化节点时没有正确设置 nodeRelPath !');
				return;
			}
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
			console.log(nodeRelPath+'/'+jsonDataPropName);
			console.log(value);
			console.log(window.templatePath);
	       	// 提交请求
	       	var postUrl = window.templatePath;
            Gutil.uploadFile(
				"#formUpdateSeqItem", 
				postUrl, 
				function(data){
				
					Mask.createMask();
					Mask.createWaiting();

					restartSequence();
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
				'bigTitleName':{
					"type": "string"
				},
				'smallTitleName':{
					"type": "string"
				},
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
	            'bigTitleName': {
	            	'id':'bigTitle',
	                'type': 'text',
	                'label': '请输入标题：'
	            },
	            'smallTitleName': {
	            	'id':'smallTitle',
	                'type': 'text',
	                'label': '请输入内容：'
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

		// 提交表单
		$('#btnSubmitSeqItem').click(function(){
			Mask.createMask();
			Mask.createWaiting();

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
		    	    text: '请输入小标题',
		    	    timeout: 4000
				});
				$('#smallTitle').focus();
				return;
			}


			// 设置大图片文件存放路径
			var bigPicFileName = 'images/'+setFileName('pic', $('#fileBigPic'));
			// 设置轮播项的逻辑数据
			var nodeName = 'json/data/'+createNodeName('seq');
			// 保存大图片的文件路径
			$('#jsonDataBigPic').attr('name',nodeName+'/img');
			$('#jsonDataBigPic').val(bigPicFileName);
			// 设置点击图片后的跳转链接文本框的名称，也就是节点名
			var jsonDataLink = nodeName+'/link';
			$('#link').attr('name',jsonDataLink);

			// 设置大标题的数据存放路径
			$('#bigTitle').attr('name',nodeName+'/title');
			// 设置小标题的数据存放路径
			$('#smallTitle').attr('name',nodeName+'/subtitle');

			// 从全局变量中读取当前模板的路径
			var postUrl = window.templatePath;
			window.seqItem = {
				nodeRelPath: nodeName,
				// alt: $('#picAlt').val(),
				title: $('#bigTitle').val(),
				subtitle: $('#smallTitle').val(),
				model: bigPicFileName
			};
			// 关闭对话框
			$( "#dialog-form" ).dialog( "close" );

			Gutil.uploadFile(
				"#formAddPicture", 
				postUrl, 
				function(data){

					restartSequence();

				}
			);
		});

		// 打开编辑对话框
		$( "#dialog-form" ).dialog('option', { height:490, width:450 });
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
    // ajax刷新
	function restartSequence(){
		//window.location.reload();
		$( "#dialog-form" ).dialog( "close" );
		Mask.removeWaiting();
		Mask.remove();
		
		initData(function(data){
		
			// 初始化大小
			initOutputSize(data);
			$('#imageFlow .bank .slide').remove();
			$('#imageFlow .diapo').remove();
			$('canvas').remove();
			// 创建 DOM 节点，添加图片轮播项
			createItems(data);
			// 绑定事件
			initDataFinished();
			// 初始化对话框
			initDialog();
			// 调用初始化完毕的事件
			bindEditEvent();
			
		});
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
			'<hr />'+
			'<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="insertPic" class="abtn">[插入图片]</a><br />'
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
		$( "#dialog-form" ).dialog('option', { height:200, width:200 });
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

function initOutputSize(data){

	$('body').attr("style","width:100%;height:100%");
	//console.log("mark");
	var w = $('body').css('width');
	var h = $('body').css('height');
	
	var container = $("#"+"imageFlow"+"");
	$(container).attr("style","width:"+ w +"px;height:"+h*0.8+"px");
	w = parseInt(w);
	var fontSize = 0.7 + w/400*0.1
	$(".title").css("font-size",fontSize+"em" );
	$(".legend").css("font-size",(fontSize -0.1) + "em" );
	// 更新轮播图片大小；
	callResize();
}

})();