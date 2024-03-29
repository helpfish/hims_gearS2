/**
* 전역변수
**/
//jQuery Element Caching
var $channel, $channelPopup, $channelMenu, $channelHistory, $channelUser;

//녹음을 위한 변수
var audioCtrl;
var isRecording = false;
var isRecordAvailable = false;
var recordStartTime;
var recordProcessTimeout;
var curFileName;
var audioCtx, soundSource, volumeNode;

//재생을 위한 변수
var mAudio;
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
	$channelUser = $('#channelUser');
	
	
	//해당 채널 정보 받아옴
	channelInit();

	//recorder 초기화
	recorderInit();
	mAudio = new Audio();
	$channel.find('.recBtn').on('touchstart',function () {
		recordStart();
	}).on('touchend',function () {
		recordStop();
	});

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			if ($channelMenu.hasClass('show')) {
				menuClose();
			} else if ($channelPopup.hasClass('show')) {
				popupClose(); 
			} else if ($channelHistory.hasClass('show')) {
				historyClose();
				soundSource.noteOff(0);
			} else if ($channelUser.hasClass('show')) {
				userListClose();
			} else {
				try {
					audioCtrl.release();
					isRecordAvailable = false;
				} catch (e2) {

				}
				history.back();
			}
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			if ($channelHistory.hasClass('show')) $channelHistory.moveNext();
		} else {
			if ($channelHistory.hasClass('show')) $channelHistory.movePrev();
		}
	}, false);

	document.addEventListener('visibilitychange', function(e) {
		if (document.hidden) {
			try {
				//$channel.find('.time').html('hidden!');
				audioCtrl.release();
				isRecordAvailable = false;
			} catch (ignore) {

			}
		} else {
			recorderInit();
		}
    });
});

/**
* 함수선언
**/
function channelInit() {
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/walkie/channel/'+$_GET['id'],
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			$channel.find('.title').html(escapeHtml(data['result'][0]['channel_name']));
			hideLoadingPopup();
		}
	});
}
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
	HIMSApiCallType = 1;
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/walkie/channel/'+$_GET['id']+'/msg?last_received=0&from=latest&num=10&format=mp3&encoding=multipart',
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
					var playTimeList = data['result'][i]['duration_time'].split(':');
					var playTime = (Number(playTimeList[0])*3600+Number(playTimeList[1])*60+Number(playTimeList[2]))*1000+1000;
					html += "<div class='row' msg='"+escapeHtml(data['result'][i]['msg_url'])+"' playTime='"+playTime+"'>\
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
						
						clearTimeout(Number($this.attr('timeoutId')));
						$this.removeClass('play').attr('timeoutId','');
						mAudio.pause();
					} else {
						mAudio.src = $this.attr('msg');
						mAudio.play();
						$this.addClass('play');
						$this.attr('timeoutId', setTimeout(function () {
							$this.removeClass('play').attr('timeoutId','');
							mAudio.pause();
						},Number($this.attr('playTime'))));
					}
				}
			});

			hideLoadingPopup();
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

function userListOpen() {
	HIMSApiCallType = 1;
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/walkie/channel/'+$_GET['id'],
		success:function(data) {
			var memberList = data['result'][0]['member_list'];
			var html = '';
			for (var i=0;i<memberList.length;i++) {
				html += "<div class='row'>"+escapeHtml(memberList[i])+"</div>";
			}

			$channelUser.html(html);
			$channelUser.yhList();

			hideLoadingPopup();
		}
	});

	$channel.removeClass('show');
	$channelMenu.removeClass('show');
	$channelUser.addClass('show');
}

function userListClose() {
	$channel.addClass('show');
	$channelUser.removeClass('show');
}
/*
Recoder 관련 함수들
*/
function recorderInit() {
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
			//console.log('recordStart failed.');
		});
	}, function () {
		//console.log('applySettings failed');
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
								HIMSApiCallType = 1;
								HIMSApiCall({
									type:'POST',
									url:HIMS['apiUrl']+'/api/walkie/channel/'+$_GET['id']+'/msg',
									data:JSON.stringify(postData),
									success:function(data) {
										//alert(JSON.stringify(data));
										if (data['error'] != null) {
											alert(data['error']);
											hideLoadingPopup();
											return;
										}

										hideLoadingPopup();
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