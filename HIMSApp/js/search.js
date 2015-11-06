/**
* 전역변수
**/
var $searchWrap, $roomNum;
/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$searchWrap = $('#searchWrap');
	$roomNum = $('#roomNum');

	//yhDialog 적용
	$searchWrap.yhDialog({
		type:'alert',
		btnAText:'Search',
		verticalAlign:'middle',
		onclickA:function () {
			doSearch();
		}
	});

	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			tizen.application.getCurrentApplication().exit();
    	}
    });
});

/**
* 함수선언
**/
//입력한 아이디와 비밀번호로 로그인 요청 보내는 함수
function doSearch() {
	location.href='roomDetail.html?roomNum='+encodeURIComponent($('#roomNum').val());
}