/**
* 전역변수
**/
var $commentList, $commentWrite;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$commentList = $('#commentList');
	$commentWrite = $('#commentWrite');

	//yhList구동
	$commentList.yhList({
		title:'Comment',
		onclick:function (idx) {
			if (idx == $commentList.rowCnt-1) {
				commentWriteOpen();
			} else {
				commentWriteSubmit($commentList.find('.row:eq('+idx+') > span').html());
			}
		}
	});

	//yhDialog 적용
	$commentWrite.yhDialog({
		type:'alert',
		btnAText:'Write',
		onclickA:function () {
			//console.log($commentWrite.find('textarea').val());
			commentWriteSubmit($commentWrite.find('textarea').val());
		}
	});

	




	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			history.back();
    	}
    });

	document.addEventListener("rotarydetent", function(event){
		if (event.detail.direction === "CW") {
			$commentList.moveNext();
		} else {
			$commentList.movePrev();
		}
	}, false);
});

/**
* 함수선언
**/
function commentWriteOpen() {
	$commentList.removeClass('show');
	$commentWrite.addClass('show');
	$commentWrite.find('textarea').val('');
}

function commentWriteClose() {
	$commentWrite.removeClass('show');
	$commentList.addClass('show');
}

function commentWriteSubmit(cmtContent) {
	showLoadingPopup();

	var postData = {};
	postData.requirement = cmtContent;

	$.ajax({
		type:'POST',
		url:HIMS['apiUrl']+'/api/requirements/'+$_GET['roomNum'],
		dataType:'json',
		data:JSON.stringify(postData),
		headers:{
			"Content-Type":"application/json",
			"Authorization":"Basic "+HIMS['loginInfo']['token']
		},
		success:function(data) {
			alert('OK');
			history.back();		
		},
		error:function(xhr, status, error) {
			console.log(status);
			alert(xhr.responseText);
			
		}
	});
}