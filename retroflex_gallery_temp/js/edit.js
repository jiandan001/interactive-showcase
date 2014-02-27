(function() {

	// 模板容器的 dom class 
	var containerID = 'tf_bg';
	var wordID = 'tf_content_wrapper';

	/***程序入口***/
	$(document).ready(function(){

		var url = window.location.href;
		window.templatePath = url.substring(0,url.lastIndexOf('/'));

		/**
			初始化模板数据
		*/
		initData(function(data){
		
			initOutputSize(data);
			//创建 DOM 节点，添加图片轮播项
			createItems(data);
			// 初始化对话框
			initDialog();
			// 调用初始化完毕的事件
			bindEditEvent();

			initDataFinished();
			
			
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
				alt: val['alt'],
				model: val['img'],          
				title: val['title'],         // id = cTitle
				subtitle: val['subtitle'],   // id = cContent
				link: val['link']	
			}
			createSequenceItem(args);
		});
	}

	/**
		创建一个 sequence 项，包括图片、文字、缩略图
		@param args = {
			nodeRelPath:'',	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			alt:'',			// 图片的 tooltip 信息
			title:'',		// 图片标题
			subtitle:'',	// 图片内容
			model:'',		// 图片路径
			link:''			// 点击图片触发的连接
		}
	*/
	function createSequenceItem(args){
		var title = args['title'],	// 图片标题
			nodeRelPath = args['nodeRelPath'],	// 当前图片项数据的相对存储路径 ： json/data/1 ，相对于当前的展品目录
			subtitle = args['subtitle'],	// 图片内容
			model = args['model'],	// 大图片路径
			alt = args['alt'],	// 图片的 tooltip 信息
			link = args['link'],
			sequenceCanvas = $("."+containerID+"");	// 这里图片获取容器
			sequenceCanvasWord = $("."+wordID+"");	// 这里文字获取容器
		if(link==undefined){
			link = '';
		}			
		var str = link+'*'+nodeRelPath;
		var sequenceCanvasItem = 	// 这里是创建图片时的DOM结构 id 为记录link和nodeRelPath
			'<img class="pic" src="'+model+'" longdesc="'+model+'" id="'+str+'" >' 
		// 文字DOM结构
		var	contentItem =
		'<div class="tf_content"  style="display: none;">' +
				'<h2 class="cTitle" id="'+str+'">' +title+ '</h2>'+
				'<p class="cContent" id="'+str+'">' +subtitle+ '</p>'+
			'</div>'
		if(sequenceCanvas && sequenceCanvasWord){ 
			$(sequenceCanvas).append(sequenceCanvasItem);
			$(sequenceCanvasWord).append(contentItem);
		}else{
			alert('初始化数据时容器不存在！');
		}
		
	}
/*************************************************************************************
	初始化对话框
*************************************************************************************/
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
	初始话img标签
*************************************************************************************/
		(function($) {
			$.fn.preload = function(options) {

				var opts 	= $.extend({}, $.fn.preload.defaults, options);
				o			= $.meta ? $.extend({}, opts, this.data()) : opts;
				var c		= this.length,
					l		= 0;

				return this.each(function() {
					var $i	= $(this);
					$('<img/>').load(function(i){
						++l;
						if(l == c) o.onComplete();
					}).attr('src',$i.attr('src'));	
				});
			};
			$.fn.preload.defaults = {
				onComplete	: function(){return false;}
			};
		})(jQuery);


/*************************************************************************************
	初始化显示大小
*************************************************************************************/
	function initOutputSize(data){
		var w = data['width'];
		var h = data['height'];
		if(w && h && !isNaN(w) && !isNaN(h)){
			
			$('body').attr("style","width:"+ w +"px;height:"+h+"px");	
		}
	}
	
/*************************************************************************************
	给 DOM 绑定事件，用来处理编辑
*************************************************************************************/
	function bindEditEvent()
	{	
		//给所有图片监听点击事件
		$(".pic").click(function(event){
				// 弹出修改图片的UI
				showChangePictureUI($(this),'img');	// 这里的 img 是json/data/1 节点中的属性
		});
		// 修改标题
		$(".cTitle").click(function(event){
			changeText($(this),'title');
		});

		// 修改内容
		$(".cContent").click(function(event){
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

		// 获得点击图片的虚拟路径 ps：json/data/2"
		var nodeRelPath = $(imgDom).attr('id').split('*')[1];
		if(!nodeRelPath){
			alert('初始化节点时没有设置 nodeRelPath !');
			return;
		}
		// 获取图片地址的存放路径 json/data/1/img
		var dataNodeName = nodeRelPath+'/'+jsonDataPropName;
		// 获取当前被替换图片的文件名，替换后需要删除掉
		var oldPicFile = $(imgDom).attr('src');
		// 获取点击图片后打开的链接
		var defaultLink = $(imgDom).attr('id').split('*')[0];
		if(defaultLink=="undefined") {
			defaultLink = "";
		}
		// 由alpaca生成对话框
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
	                'label': '点击图片后打开的链接(例如：http：//www.baidu.com)',
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
		$("#dialog-form").alpaca({
			'data':data,
			'schema':schema,
			'options':options
		});

		var formDom= $('#dialog-form > form')[0];
		$(formDom).append(
			// 修改json/data/1/img中的上传的图片路径
			'<input type="hidden" id="jsonData" name="'+dataNodeName+'" value="" />'+ 
			// !! 迁移到drupal修改 删除原来图片
			// '<input type="hidden" id="deleteData" name="'+oldPicFile+'@Delete" />'+ 
			'<input type="hidden" name="_charset_" value="utf-8" />'
		);
		// 对话框的按钮
		$('#dialog-form').append(
			'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="btnSubmitPicture">提 交</button>' +
			'<br /><br />' + 
			'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button id="btnDeletePicture"> 删除此图片 </button>'
		);
		// 设置按钮样式
		$('#btnSubmitPicture').css('width','252px');
		$('#btnSubmitPicture').button( { icons: { primary: "ui-icon-check" } } );
		$('#btnDeletePicture').button( { icons: { primary: "ui-icon-closethick" } } );
		// 点击修改图片的提交按钮
		$('#btnSubmitPicture').click(function(){
			// 遮罩
			Mask.createMask();
			Mask.createWaiting();
			
			var val = $('#filePic').val();			
			// 获取文件的扩展名，并创建新的文件名
			var photoName = setFileName('pic', $('#filePic'));
			var picNodePath = 'images/'+photoName;
			// !!迁移到drupal 修改
			// $('#filePic').attr('name',picNodePath);
			$('#jsonData').val(picNodePath);
			// 如果用户没有选择文件，则把文件框和文件地址隐藏域删掉
			// 也就是只更新点击后的链接，不更新图片
			if(!val){
				$('#filePic').remove();
				$('#jsonData').remove();
				// !!$('#deleteData').remove();
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
					//刷新
					restartSequence();
				}
			);
		});

		// 点击删除当前图片的按钮
		$('#btnDeletePicture').click(function(){
			deleteSequenceItem(nodeRelPath, oldPicFile);
		});

		// 打开编辑对话框(更换图片)
		$( "#dialog-form" ).dialog('option', { height:310, width:360 });
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
			var nodeRelPath = $(textDom).attr('id').split('*')[1];
			if(!nodeRelPath){
				alert('初始化节点时没有正确设置 nodeRelPath !');
				return;
			}
			var properties = {};
			// !!迁移drupal 修改
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
				}
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
			// '<input type="hidden" id="jsonDataSmallPic" name="" value="" />'+
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
		    	    text: '请选择一张图片！',
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
		    	    text: '请输入标题',
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
			// !! 迁移drupal 修改
			// $('#fileBigPic').attr('name',bigPicFileName);

			// 设置轮播项的逻辑数据
			var nodeName = 'json/data/'+createNodeName('seq');
			// 保存大图片的文件路径
			$('#jsonDataBigPic').attr('name',nodeName+'/img');
			$('#jsonDataBigPic').val(bigPicFileName);
			// 设置点击图片后的跳转链接文本框的名称，也就是节点名
			var jsonDataLink = nodeName+'/link';
			$('#link').attr('name',jsonDataLink);
			// 设置标题的数据存放路径
			$('#bigTitle').attr('name',nodeName+'/title');
			// 设置内容的数据存放路径
			$('#smallTitle').attr('name',nodeName+'/subtitle');
			//$('#picAlt').attr('name',nodeName+'/alt');

			// 从全局变量中读取当前模板的路径
			var postUrl = window.templatePath;
			window.seqItem = {
				nodeRelPath: nodeName,
				//alt: $('#picAlt').val(),
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
					Mask.removeWaiting();
					Mask.remove();
					// 动态刷新图片
					createSequenceItem(window.seqItem);
					// 重新刷新整个轮播，这个方法不是所有的模板都需要的。
					restartSequence();
					window.seqItem = undefined;
					
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

		// 打开编辑对话框(添加图片)
		$( "#dialog-form" ).dialog('option', { height:430, width:420 });
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
			'<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a id="insertPic" class="abtn">[插入图片]</a><br />'
		);

		// 给个性定制面板中的元素绑定事件
		// 插入图片
		$("#insertPic").click(function(event){
			addSequenceItem();
		});
		// 打开编辑对话框（个性定制）
		$( "#dialog-form" ).dialog('option', { height:220, width:300 });
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
// 全局刷新
function restartSequence(){
	window.location.reload();
}

})();