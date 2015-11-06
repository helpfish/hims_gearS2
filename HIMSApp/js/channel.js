/**
* 전역변수
**/
//jQuery Element Caching
var $channel, $channelPopup, $channelMenu, $channelHistory;

//녹음을 위한 변수
var audioCtrl;
var isRecording = false;
var isRecordAvailable = false;
var recordStartTime;
var recordProcessTimeout;
var curFileName;
var audioCtx, soundSource, volumeNode;
/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$channel = $('#channel');
	$channelPopup = $('#channelPopup');
	$channelMenu = $('#channelMenu');
	$channelHistory = $('#channelHistory');
	
	//recorder 초기화
	recorderInit();

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			if ($channelMenu.hasClass('show')) menuClose();
			else if ($channelPopup.hasClass('show')) popupClose(); 
			else if ($channelHistory.hasClass('show')) {
				historyClose();
				soundSource.noteOff(0);
			} else {
				audioCtrl.release();
				history.back();
			}
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			
		} else {
			
		}
	}, false);
});

/**
* 함수선언
**/
function popupOpen() {
	$channel.removeClass('show');
	$channelPopup.addClass('show');
}

function popupClose() {
	$channelPopup.removeClass('show');
	$channel.addClass('show');
}

function recordToggle () {
	if (!isRecordAvailable) {
		alert('Cannot load recorder');
		return;
	}
	if (isRecording) {
		recordStop();
	} else {
		recordStart();
	}
}

function menuOpen() {
	$channelMenu.addClass('show');
}

function menuClose () {
	$channelMenu.removeClass('show');
}

function historyOpen() {
	$.ajax({
		type:'GET',
		url:HIMS['apiUrl']+'/api/walkie/channel/'+$_GET['id']+'/msg?last_received=0&from=oldest&num=10&format=mp3',
		dataType:'json',
		headers:{
			"Content-Type":"application/json",
			"Authorization":"Basic "+HIMS['loginInfo']['token']
		},
		beforeSend:function () {
			showLoadingPopup();
		},
		success:function(data) {
			//alert(JSON.stringify(data));
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			if (data['result'] == null) {
				data['result'] = [];
			}

			var html = "";
			for (var i=0;i<data['result'].length;i++) {
				html += "<div class='row' msg='"+escapeHtml(data['result'][i]['msg'])+"'>\
					<div class='right'></div>\
					<div class='left'>\
						<div class='name'>"+escapeHtml(data['result'][i]['member_id'])+"</div>\
						<div class='time'>"+escapeHtml(data['result'][i]['timestamp'].substr(0,16))+"</div>\
					</div>\
				</div>";
			}

			$channelHistory.html(html);
			$channelHistory.yhList({
				title:'History',
				onclick:function (idx) {
					var $this = $channelHistory.find('.row:eq('+idx+')');

					if ($this.hasClass('play')) {
						soundSource.noteOff(0);
						$this.removeClass('play');
						return;
					} 

					$this.addClass('play');
					var audioData = base64ToArrayBuffer($channelHistory.find('.row:eq('+idx+')').attr('msg'));
					soundSource = audioCtx.createBufferSource();
					volumeNode = audioCtx.createGainNode();
					
					try {
						var soundBuffer = audioCtx.createBuffer(audioData, true);
					} catch (e) {
						alert(e);
						return;
					}
					soundSource.buffer = soundBuffer;
					

					// 노드 연결
					soundSource.connect(volumeNode);
					volumeNode.connect(audioCtx.destination);

					// 기본 셋팅
					volumeNode.gain.value = 10;
					soundSource.loop = true;

					// Finally
					//alert(audioCtx.currentTime);
					soundSource.noteOn(0);
				}
			});

			hideLoadingPopup();
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
			
		}
	});

	$channel.removeClass('show');
	$channelMenu.removeClass('show');
	$channelHistory.addClass('show');
}

function historyClose() {
	$channel.addClass('show');
	$channelHistory.removeClass('show');
}
/*
Recoder 관련 함수들
*/
function recorderInit() {
	audioCtx = new webkitAudioContext();

	navigator.webkitGetUserMedia({video:false,audio:true},function (e) {
		navigator.tizCamera.createCameraControl(e,function (ctrl) {
			isRecordAvailable = true;
			audioCtrl = ctrl;
		},function () {
			alert('Not Supported!');
		});
	},function () {
		alert('Permission Denied!');
	});
}

function recordStart() {
	if (isRecording) return;
	var d = new Date();
	curFileName = 'HIMS_'+d.getFullYear()+zerofill(d.getMonth()+1,2)+zerofill(d.getDate(),2)+zerofill(d.getHours(),2)+zerofill(d.getMinutes(),2)+zerofill(d.getSeconds(),2)+'.amr';
	
	var audioSetting = {
		maxFileSizeBytes:1024*1024*30,
		fileName:curFileName,
		recordingFormat:'amr'
	};

	audioCtrl.recorder.applySettings(audioSetting,function () {
		audioCtrl.recorder.start(function (){
			isRecording = true;
			recordStartTime = (new Date()).getTime();
			$channel.find('.talkerName').html(HIMS['loginInfo']['name']);
			$channel.addClass('send');
			recordProcess();

		}, function (e) {
			console.log('recordStart failed.');
		});
	}, function () {
		console.log('applySettings failed');
	});
}

function recordStop() {
	if (!isRecording) return;
	audioCtrl.recorder.stop(function () {
		isRecording = false;
		$channel.removeClass('send');
		recordFileSubmit();
	}, function () {
		
	});
}

function recordProcess() {
	var curTime = (new Date()).getTime();
	var recordMin = Math.floor((curTime - recordStartTime)/60000);
	var recordSec = Math.floor(((curTime - recordStartTime)%60000)/1000);
	var recordMs = Math.floor(((curTime - recordStartTime)%1000)/100);
	$channel.find('.time').html(zerofill(recordMin,2)+':'+zerofill(recordSec,2)+'.'+recordMs);

	if (isRecording) setTimeout(function () {
		recordProcess();
	},33);
}

function recordFileSubmit() {
	var filePath = "file:///opt/usr/media/Sounds";
	tizen.filesystem.resolve(filePath, function(dir) {
		dir.listFiles(function (fileList) {
			for (var i=0;i<fileList.length;i++) {
				if (fileList[i].name == curFileName) {
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function(){
						if (this.readyState == 4){
							var fr = new FileReader();
							fr.onload = function (e) {
								var postData = {};
								postData.msg = e.target.result.substr(22);

								$.ajax({
									type:'POST',
									url:HIMS['apiUrl']+'/api/walkie/channel/'+$_GET['id']+'/msg',
									data:JSON.stringify(postData),
									dataType:'json',
									headers:{
										"Content-Type":"application/json",
										"Authorization":"Basic "+HIMS['loginInfo']['token']
									},
									success:function(data) {
										//alert(JSON.stringify(data));
										if (data['error'] != null) {
											alert(data['error']);
											hideLoadingPopup();
											return;
										}

										//hideLoadingPopup();
									},
									error:function(xhr, status, error) {
										console.log(status);
										alert(xhr.responseText);
										
									}
								});


							}
							fr.readAsDataURL(this.response);
						}
					};
					xhr.open('GET', fileList[i].toURI());
					xhr.responseType = 'blob';
					xhr.send();

					break;
				}
			}
		});
	},function () {
		
	});
}