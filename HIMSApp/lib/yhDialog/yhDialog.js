$.fn.yhDialog = function (options) {
	/**
	* 기본옵션
	**/
	var option = $.extend({
		type:'confirm',
		btnAText:'',
		btnBText:'',
		btn2Text:'OK',
		verticalAlign:'',
		oninit:function () {

		},
		onClickA:function () {

		},
		onClickB:function () {

		}
	}, options);

	/**
	* 전역변수
	**/
	var $this = this;

	/**
	* 초기구동
	**/
	function init() {
		//alert 타입일 경우 버튼의 텍스트 기본값을 OK로 지정
		if (option.type == 'alert' && option.btnAText == '') option.btnAText = 'OK';

		//yhDialog 준비
		$this.addClass('yhDialog '+option.type);
		var content = $this.html();
		$this.html("<div class='content'>"+content+"</div><div class='btn btnA'>"+option.btnAText+"</div><div class='btn btnB'>"+option.btnBText+"</div>");

		//verticalAlign옵션이 켜진 경우 처리
		if (option.verticalAlign == 'middle') $this.children('.content').addClass('verticalAlignCenter');

		//btnA, btnB텍스트가 존재하는 경우 텍스트 입력
		if (option.btnAText != '') $this.children('.btnA').addClass('text');
		if (option.btnBText != '') $this.children('.btnB').addClass('text');

		//각 버튼의 onclick함수 할당
		$this.children('.btnA').on('click',function() {
			option.onclickA();
		});

		$this.children('.btnB').on('click',function() {
			option.onclickB();
		});

		option.oninit();
	}

	init();
}