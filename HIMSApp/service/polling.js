var cnt = 0;

module.exports.onStart = function() {
   console.log("service start");

   var remoteMsgPort = tizen.messageport.requestRemoteMessagePort("2oy6U4Dm61.HIMSAppService", "RemoteMsgPort");
   var localMsgPort = tizen.messageport.requestLocalMessagePort("LocalMsgPort");

   cnt = 1;
   setInterval(function () {
	   cnt++;
   },1000);

   function onreceived(data, remoteMsgPort) {
      for (var i = 0; i < data.length; i++) {
         if (data[i].value == "SERVICE_EXIT") {
            localMsgPort.removeMessagePortListener(watchId);
            tizen.application.getCurrentApplication().exit();
         } else if (data[i].value == 'GET_COUNT') {
			console.log(cnt);
		 }
      }
   }
   var watchId = localMsgPort.addMessagePortListener(onreceived);

   
}

module.exports.onRequest = function() {
   var reqAppControl = tizen.application.getCurrentApplication().getRequestedAppControl();
   if (reqAppControl) {
      if (reqAppControl.appControl.operation == "http://tizen.org/appcontrol/operation/service") {
         
      }
   }
}

module.exports.onExit = function() {
   console.log("service terminate");
}