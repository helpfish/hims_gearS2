$.fn.yhList = function (options) {
	/**
	* 기본옵션
	**/
	var option = $.extend({
		title:'',
		startIdx:0,
		oninit:function () {
			
		},
		onclick:function (idx) {

		}
	}, options);

	/**
	* 전역변수
	**/
	var $this = this;
	var idx = option.startIdx;
	var $rowList = this.find('.row');
	var rowCnt = $rowList.length;

	//touch이벤트를 위한 변수
	var onTouch = false;
	var startX, startY;
	var moveQueue = new Array();
	var queueMaxLen = 5;
	var webkitTransitionEndTimeout;
	

	/**
	* 초기구동
	**/
	function init() {
		$this.prepend("<div class='title'>"+option.title+"</div>").append("<div class='tail'></div>");
		$rowList.each(function (i,e) {
			var $e = $(e);
			$e.on('click',function () {
				option.onclick(i);
			});
		});
		$this.addClass('yhList');
		$this.moveTo(idx);

		//eventListener 세팅
		$this.off('touchstart',onTouchStart);
		$this.off('touchmove',onTouchMove);
		$this.off('touchend',onTouchEnd);

		$this.on('touchstart',onTouchStart);
		$this.on('touchmove',onTouchMove);
		$this.on('touchend',onTouchEnd);

		option.oninit();
	}

	/**
	* public 변수/함수선언
	**/
	this.rowCnt = rowCnt;

	this.moveTo = function (i) {
		if (i >= rowCnt || i < 0) return;
		if (onTouch) return;

		$rowList.removeClass('current');
		$($rowList[i]).addClass('current');
		var offsetY = -i*120;
		$this.css({
			'-webkit-transform':'translate(0px, '+offsetY+'px)'
		});

		idx = i;
	}

	//다음으로 이동
	this.moveNext = function () {
		if (idx >= rowCnt-1) return;
		$this.moveTo(idx+1);
	}

	//이전으로 이동
	this.movePrev = function () {
		if (idx <= 0) return;
		$this.moveTo(idx-1);
	}

	//touch가 시작될 때
	function onTouchStart (e) {
		//각종 변수 세팅
		var touch = e.originalEvent.changedTouches[0];
		onTouch = true;
		startX = touch.pageX;
		startY = touch.pageY;

		//moveQueue 초기화
		var move = {};
		move.pageX = startX;
		move.pageY = startY;
		move.time = e.timeStamp;
		moveQueue = new Array();
		moveQueue.push(move);

		//transition효과 해제
		$this.css('-webkit-transition','all 0s ease 0s').off('webkitTransitionEnd');
		if (webkitTransitionEndTimeout != null) clearTimeout(webkitTransitionEndTimeout);


	}

	function onTouchMove(e) {
		//각종 변수 세팅
		var touch = e.originalEvent.changedTouches[0];
		var distX = touch.pageX - startX;
		var distY = touch.pageY - startY;

		//moveQueue에 움직인 자취 추가
		var move = {};
		move.pageX = touch.pageX;
		move.pageY = touch.pageY;
		move.time = e.timeStamp;
		moveQueue.push(move);
		if (moveQueue.length > queueMaxLen) moveQueue.shift();

		
		//idx로부터 현재 기본 위치를 유추해내고 얼만큼 움직여야하는지 계산함
		var offsetY = -idx*120;
		offsetY += distY;

		//offsetY가 범위를 벗어날 경우 범위 내로 맞춤
		if (offsetY > 120) offsetY = 120;
		else if (offsetY < -120*rowCnt) offsetY = -120*rowCnt;

		//offsetY만큼 element를 움직임
		$this.css({
			'-webkit-transform':'translate3d(0px,'+offsetY+'px,0px)'
		});

	}

	function onTouchEnd(e) {
		//각종 변수 세팅
		var touch = e.originalEvent.changedTouches[0];
		var distX = touch.pageX - startX;
		var distY = touch.pageY - startY;

		//moveQueue에 움직인 자취 추가
		var move = {};
		move.pageX = touch.pageX;
		move.pageY = touch.pageY;
		move.time = e.timeStamp;
		moveQueue.push(move);
		if (moveQueue.length > queueMaxLen) moveQueue.shift();

		//moveQueue를 토대로 속도와 도착지점 계산
		var deltaT = moveQueue[moveQueue.length-1].time - moveQueue[0].time;
		var deltaY = moveQueue[moveQueue.length-1].pageY - moveQueue[0].pageY;
		var c = 800;							//미끄러지는 거리와 관계있는 상수값, 클수록 적게미끄러짐 (800px/s일때 한칸 미끄러짐, 1600px/s이면 4칸.. 거리는 속도의 제곱에 비례)
		var veloY = deltaY/deltaT*1000;			//최종속도, 단위는 px/s
		var minusFlag = 1;
		if (veloY < 0) minusFlag = -1;
		//var slideTime =	Math.abs(veloY/fricY);	//미끄러지는 시간 ()

		//idx로부터 현재 기본 위치를 유추해내고 최종적으로 미끄러지고 나서 도착하는 위치계산
		var offsetY = -idx*120;
		offsetY += parseInt(distY+Math.pow(veloY/c,2)*120*minusFlag);

		var tmp = offsetY%120;
		if (Math.abs(tmp) < 60) offsetY -= tmp;
		else {
			if (offsetY < 0) offsetY = offsetY - tmp -120;
			else offsetY = offsetY - tmp + 120;
		}

		//offsetY가 범위를 초과한 경우 보정
		offsetYOriginal = offsetY;
		if (offsetY > 0) offsetY = 0;
		else if (offsetY < -120*(rowCnt-1)) offsetY = -120*(rowCnt-1);

		//속도에 따라 걸리는 시간 조정
		//속도가 너무 느릴 경우 c값으로 지정
		if (Math.abs(veloY) < c) veloY = c*minusFlag;
		var slideTime = Math.floor(Math.abs((offsetY-(-120*idx+distY))/veloY*2)*1000);

		//움직임
		$this.css({
			'-webkit-transition':'-webkit-transform '+slideTime+'ms cubic-bezier(0.250, 0.460, 0.450, 0.940)',
			'-webkit-transform':'translate3d(0px,'+offsetY+'px,0px)'
		}).on('webkitTransitionEnd',function () {
			//transition효과가 끝나면
			//webkitTransitionEnd 트리거 해제
			$(this).off('webkitTransitionEnd').css('-webkit-transition','');

			//index이동
			$rowList.removeClass('current');
			$($rowList[idx]).addClass('current');
		});

		idx = -offsetY/120;

		
		webkitTransitionEndTimeout = setTimeout(function () {
			$this.trigger('webkitTransitionEnd');
		},slideTime);
		
		onTouch = false;
	}

	init();
}