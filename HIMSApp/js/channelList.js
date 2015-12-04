/**
* 전역변수
**/
var $channelList, $userList, $titleWrite, $channelMenu, $channelHistory;
var selectedUserList = [];

var mAudio;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$channelList = $('#channelList');
	$userList = $('#userList');
	$titleWrite = $('#titleWrite');
	$channelMenu = $('#channelMenu');
	$channelHistory = $('#channelHistory');

	//yhList구동
	getChannelList();

	//audio로드
	mAudio = new Audio();

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			if ($userList.hasClass('show')) {
				$userList.removeClass('show');
				$channelList.addClass('show');
				menuBtnShow();
				
			} else if ($titleWrite.hasClass('show')) {
				$titleWrite.removeClass('show');
				$channelList.addClass('show');
				menuBtnShow();
				
			} else if ($channelHistory.hasClass('show')) {
				historyClose();
			} else if ($channelMenu.hasClass('show')) {
				$channelMenu.removeClass('show');

			} else {
				tizen.application.getCurrentApplication().exit();
			}
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			if ($channelHistory.hasClass('show')) $channelHistory.moveNext();
			else if ($channelList.hasClass('show')) $channelList.moveNext();
			else if ($userList.hasClass('show')) $userList.moveNext();
		} else {
			if ($channelHistory.hasClass('show')) $channelHistory.movePrev();
			else if ($channelList.hasClass('show')) $channelList.movePrev();
			else if ($userList.hasClass('show')) $userList.movePrev();
		}
	}, false);
});

/**
* 함수선언
**/
//현재 존재하는 채널 목록을 출력하는 함수
function getChannelList() {
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/walkie/channel?joined_member='+HIMS['loginInfo']['id'],
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				tizen.application.getCurrentApplication().exit();
				return;
			}

			//HTML 구성
			var html = '';
			for (var i=0;i<data['result'].length;i++) {
				var d = new Date(data['result'][i]['register_timestamp']);

				html += "<div class='row existingChannel' onclick=\"moveToChannel('"+data['result'][i]['channel_id']+"')\">\
					<div class='title'>"+escapeHtml(data['result'][i]['channel_name'])+"</div>\
					<div class='desc'>"+String(d.getFullYear()).substr(2,2)+"-"+zerofill(d.getMonth()+1,2)+"-"+zerofill(d.getDate(),2)+" "+zerofill(d.getHours()%12,2)+":"+zerofill(d.getMinutes(),2)+(d.getHours()>=12?'pm':'am')+"</div>\
				</div>";
			}
			html += "<div class='row newChannel' onclick='getUserList()'>+New Channel</div>";

			//yhList 구성
			$channelList.html(html);
			$channelList.yhList({
				title:'Channel',
				onclick:function (idx) {
					
				},
				oninit:function () {
					hideLoadingPopup();
					if ($_GET['history'] == 1) historyOpen();
				}
			});
		}
	});
}

//서버에서 전체 사용자 목록을 받아서 띄워주는 함수
function getUserList () {
	menuClose();
	menuBtnHide();
	selectedUserList = [HIMS['loginInfo']['id']];

	HIMSApiCallType = 1;
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/users',
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			//HTML구성
			var html = '';
			for (var i=0;i<data['result'].length;i++) {
				//자기 자신의 아이디는 목록에서 제외 (기본선택)
				if (data['result'][i]['id'] == HIMS['loginInfo']['id']) continue;

				html += "<div class='row' mbId='"+escapeHtml(data['result'][i]['id'])+"'><div>"+escapeHtml(data['result'][i]['name'])+"</div></div>";
			}
			
			//yhList 구성
			$userList.html(html).addClass('show').yhList({
				title:'Done',
				oninit:function () {
					$userList.find('.title').on('click',function () {
						showTitleWrite();
					});
				},
				onclick:function (idx) {
					var mbId = $userList.find('.row:eq('+idx+')').attr('mbId');
					var i;

					//selectedUserList에 있는 경우
					if ((i = selectedUserList.indexOf(mbId)) > -1) {
						$userList.find('.row:eq('+idx+')').removeClass('selected');
						selectedUserList.splice(i,1);

					//selectedUserList에 없는 경우
					} else {
						$userList.find('.row:eq('+idx+')').addClass('selected');
						selectedUserList.push(mbId);
					}
				}
			});
			$channelList.removeClass('show');

			hideLoadingPopup();
		}
	});

}

function showTitleWrite () {
	$userList.removeClass('show');
	$titleWrite.addClass('show');

	var title = '';
	for (var i=0;i<selectedUserList.length;i++) {
		title += selectedUserList[i]+', ';
	}

	title = title.substr(0,title.length-2);

	$titleWrite.yhDialog({
		type:'alert',
		onclickA:function () {
			createChannel();
		}
	});

	$titleWrite.find('input[name=channelName]').val(title);
}

function createChannel () {
	var postData = {};
	postData.channel_name = $titleWrite.find('input[name=channelName]').val();
	postData.member_list = selectedUserList;

	HIMSApiCallType = 1;
	HIMSApiCall({
		type:'POST',
		url:HIMS['apiUrl']+'/api/walkie/channel',
		data:JSON.stringify(postData),
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			moveToChannel(data['result']['channel_id']);
			hideLoadingPopup();
		}
	});
}

function moveToChannel(id) {
	location.href='./channel.html?id='+encodeURIComponent(id);
}

function menuOpen() {
	$channelMenu.addClass('show');
}

function menuClose() {
	$channelMenu.removeClass('show');
}

function menuBtnShow () {
	$('#content > .menuBtn').show();
}

function menuBtnHide() {
	$('#content > .menuBtn').hide();
}

function historyOpen() {
	HIMSApiCallType = 1;
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/walkie/msg?last_received=0&from=latest&num=10&format=mp3&encoding=multipart',
		success:function(data) {
			console.log(data);
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
			menuBtnHide();
			$channelList.removeClass('show');
			$channelMenu.removeClass('show');
			$channelHistory.addClass('show');
		}
	});
}

function historyClose() {
	$channelList.addClass('show');
	$channelHistory.removeClass('show');
	menuBtnShow();
}