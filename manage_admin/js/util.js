;(function(window) {

	window.HOST = 'http://0013.96ni.net';
	
 	window.getCookie = function(name) {
	    var tmp,reg=new RegExp("(?:^| )"+name+"=([^;]*)(?:;|$)","gi");
	    return (tmp=reg.exec(document.cookie)) ? tmp[1] : false;
	};
	window.setCookie = function(strName, strValue, intdays) {
	    var exdate=new Date();
	    exdate.setDate(exdate.getDate()+intdays);
	    document.cookie = strName+ "=" +strValue+((intdays==null) ? "" : ";expires="+exdate.toGMTString())+"; path=/";
	};

	window.username = window.getCookie('username');
	window.password = window.getCookie('password');
		
})(window);