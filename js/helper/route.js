define('route', ['jquery', 'comm'], function($, comm) {

	var PATH = '';
	
	if(comm.getUrlParam('userId')) {
		comm.setCache('userId', comm.getUrlParam('userId'));
	}

	if(comm.getUrlParam('openId')) {
		comm.setCache('openId', comm.getUrlParam('openId'));
	}

	if(comm.getUrlParam('token')) {
		comm.setCache('token', comm.getUrlParam('token'));
	}

	var opt_key = {
			userId: comm.getCache('userId') || '', 
			openId: comm.getCache('openId') || '', 
			token: comm.getCache('token') || ''
		};

	function _ajax(url, opts, callback) {
		url = '/nianhui-web' + url.replace('.html', '.do'); // reset url

		$.ajax({
			url: PATH + url,
			data: $.extend(opt_key, opts.params),
			type: opts.type,
			cache: false,
			beforeSend: opts.beforeSend || $.noop,
			success: function(response) {
				if(typeof response === 'string') {
					response = JSON.parse(response);
				}

				if(response.code === 1) {
					callback(response);
				}
				else {
					callback(false, response.msg || '未知错误[' + url + ']');

					// alert(response.msg || '未知错误[' + url + ']');
				}
			},
			error: function(xhr, type) {
				callback(false, '系统错误[' + url + ']');

				// alert('系统错误[' + url + ']');
			}
		});
	}

	return function(url, opts, callback) {
		if(! opts) {
			callback(false);
			return;
		}

		opts.params = opts.params || {};
		opts.type = opts.type || 'GET';

		_ajax(url, opts, function(response, error) {
			callback(response, error);
		});
	};

});