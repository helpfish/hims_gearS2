/**
* 전역변수
**/
var $formWrap, $commentWrite;
var evalData = [];
var evalDataIdx = 0;
var chkList = [];
var cmtList = [];
/**
* 초기구동
**/
$(function () {
	//HIMS_init
	HIMS_init();

	//jQuery Element Caching
	$formWrap = $('#formWrap');
	$commentWrite = $('#commentWrite');

	//평가항목을 받아옴
	showLoadingPopup();
	getEvaluationData();

	//yhDialog 적용
	$commentWrite.yhDialog({
		type:'alert',
		btnAText:'Write',
		onclickA:function () {
			evalCommentSubmit();
		}
	});

	//해당 방의 정보를 받아옴
	document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back") {
			if ($commentWrite.hasClass('show')) {
				$formWrap.addClass('show');
				$commentWrite.removeClass('show').find('textarea').val('');
				return;
			}


			if (confirm("\n\n\n\n\nAre you\nsure you \nwant to\nquit?")) history.back();
		}
    });
});



/**
* 함수선언
**/
//서버로부터 평가항목을 받아오는 함수
function getEvaluationData() {
	//$_GET['type'] = 'long';
	HIMSApiCall({
		type:'GET',
		url:HIMS['apiUrl']+'/api/form?form_type='+$_GET['type'],
		success:function(data) {
			evalData = data['result'];
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}

			if (evalData.length == 0) {
				alert('No Evaluation Data!');
				history.back();
				return;
			}

			showEvalData();
			hideLoadingPopup();
		}
	});
}

//평가항목을 순차적으로 보여주는 함수, 전역변수 evalDataIdx를 이용함
function showEvalData() {
	if (evalDataIdx == 0) {
		$formWrap.yhDialog({
			type:'confirm',
			btnAText:'X',
			btnBText:'O',
			onclickA:function () {
				evalCheck(false);
			},
			onclickB:function () {
				evalCheck(true);
			}
		});
	}
	var html = evalData[evalDataIdx].description;
	html += "<div class='btnWrap comment' onclick='showEvalComment();'><div class='icon'></div><div class='text'>Comment</div></div>";
	$formWrap.find('.content').html(html);
}

//평가항목에 true, false를 체크하는 함수
function evalCheck(flag) {
	chkList[evalDataIdx] = flag;
	$commentWrite.find('textarea').val('');
	evalDataIdx++;

	if (evalDataIdx >= evalData.length) {
		//alert("Evaluation Complete!\n"+JSON.stringify(chkList));
		evalSubmit();
		return;
	}

	showEvalData(evalDataIdx);
}

//코멘트 팝업을 띄우는 함수
function showEvalComment() {
	$commentWrite.addClass('show');
	$formWrap.removeClass('show');
}

function evalCommentSubmit () {
	cmtList[evalDataIdx] = $commentWrite.find('textarea').val();
	$formWrap.addClass('show');
	$commentWrite.removeClass('show');
}

//평가항목을 서버에 최종전달하는 함수
function evalSubmit() {
	var postData = {};
	postData.room_num = $_GET['roomNum'];
	postData.type = $_GET['type'];
	postData.inspection_form_dict = {};
	for (var i=0;i<evalData.length;i++) {
		postData.inspection_form_dict[evalData[i]['id']] = {};
		postData.inspection_form_dict[evalData[i]['id']].check = chkList[i];
		postData.inspection_form_dict[evalData[i]['id']].comment = cmtList[i];
	}

	HIMSApiCall({
		type:'POST',
		url:HIMS['apiUrl']+'/api/evaluation',
		data:JSON.stringify(postData),
		success:function(data) {
			if (data['error'] != null) {
				alert(data['error']);
				hideLoadingPopup();
				return;
			}
			
			alert('Evaluation Success!');
			history.back();
			hideLoadingPopup();
		}
	});
}