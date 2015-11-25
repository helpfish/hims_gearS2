/**
* 전역변수
**/
var $content;

/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$content = $('#content');	

	//링크 및 이름 세팅
	getFormInfo();

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") history.back();
    });
});
/**
* 함수선언
**/
//이미 평가한 form인지 체크
function getFormInfo() {
	$content.find('.nameWrap').html($_GET['cleanerName']);
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/rooms?cleaner_id='+HIMS['loginInfo']['id'],
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			hideLoadingPopup();
		}
	});
}

function evalShortForm () {
	location.href='./evaluation.html?type=short&roomNum='+$_GET['roomNum'];
}

function evalLongForm () {
	location.href='./evaluation.html?type=long&roomNum='+$_GET['roomNum'];
}