/**
* 전역변수
**/
var $channelList, $userList, $titleWrite;
var selectedUserList = [];

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

	//yhList구동
	getChannelList();

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			if ($userList.hasClass('show')) {
				$userList.removeClass('show');
				$channelList.addClass('show');
				
			} else if ($titleWrite.hasClass('show')) {
				$titleWrite.removeClass('show');
				$channelList.addClass('show');
				
			} else {
				tizen.application.getCurrentApplication().exit();
			}
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			if ($channelList.hasClass('show')) $channelList.moveNext();
			else if ($userList.hasClass('show')) $userList.moveNext();
		} else {
			if ($channelList.hasClass('show')) $channelList.movePrev();
			else if ($userList.hasClass('show')) $userList.movePrev();
		}
	}, false);
});

/**
* 함수선언
**/
//현재 존재하는 채널 목록을 출력하는 함수
function getChannelList() {
	$.ajax({
		type:'GET',
		url:HIMS['apiUrl']+'/api/walkie/channel',
		dataType:'json',
		headers:{
			"Content-Type":"application/json",
			"Authorization":"Basic "+HIMS['loginInfo']['token']
		},
		beforeSend:function () {
			showLoadingPopup();
		},
		success:function(data) {
			console.log(data);
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
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
					
				}
			});
			hideLoadingPopup();
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
			
		}
	});

	hideLoadingPopup();
}

//서버에서 전체 사용자 목록을 받아서 띄워주는 함수
function getUserList () {
	selectedUserList = [HIMS['loginInfo']['id']];
	showLoadingPopup();


	$.ajax({
		type:'GET',
		url:HIMS['apiUrl']+'/api/users',
		dataType:'json',
		headers:{
			"Content-Type":"application/json",
			"Authorization":"Basic "+HIMS['loginInfo']['token']
		},
		beforeSend:function () {
			showLoadingPopup();
		},
		success:function(data) {
			console.log(data);
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
						//console.log('unselect');

					//selectedUserList에 없는 경우
					} else {
						$userList.find('.row:eq('+idx+')').addClass('selected');
						selectedUserList.push(mbId);
						//console.log('select');
					}
				}
			});
			$channelList.removeClass('show');

			hideLoadingPopup();
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
			
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
	console.log(title);
	

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
	console.log(postData);

	$.ajax({
		type:'POST',
		url:HIMS['apiUrl']+'/api/walkie/channel',
		data:JSON.stringify(postData),
		dataType:'json',
		headers:{
			"Content-Type":"application/json",
			"Authorization":"Basic "+HIMS['loginInfo']['token']
		},
		beforeSend:function () {
			showLoadingPopup();
		},
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			moveToChannel(data['result']['channel_id']);
			hideLoadingPopup();
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
			
		}
	});
}

function moveToChannel(id) {
	location.href='./channel.html?id='+encodeURIComponent(id);
}