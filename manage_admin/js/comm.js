;(function(window) {

	var PATH = '/nianhui-web';

	window.comm = {PATH: PATH};	

	function _ajax(url, opts, callback) {
		url = url.replace('.html', '.do'); // reset url

		$.ajax({
			url: PATH + url,
			data: opts.params,
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
					alert(response.msg || '未知错误[' + url + ']');
				}
			},
			error: function(xhr, type) {
				callback(false, '系统错误[' + url + ']');
				alert('系统错误[' + url + ']');
			}
		});
	}

	window.comm.ajax = function(url, opts, callback) {
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

	window.comm.getDate = function(int_time, type) {
		int_time = String(int_time).substr(0, 13);
		int_time = new Date(Number(int_time));

		var year = int_time.getFullYear(),
			month = int_time.getMonth() + 1,
			day = int_time.getDate(),
			hour = int_time.getHours(),
			minute = int_time.getMinutes(),
			s = int_time.getSeconds();

		var _zero = function(v) {
            return v < 10 ? ('0' + v) : v;
        };

        switch (type) {
        	case 'MDHMS':
        		int_time = _zero(month) + '/' + _zero(day) + ' ' + _zero(hour) + ':' + _zero(minute) + ':' + _zero(s);
        		break;
        	case 'MDHM':
        		int_time = _zero(month) + '/' + _zero(day) + ' ' + _zero(hour) + ':' + _zero(minute);
        		break;
        	case 'MDHM-UT':
        		int_time = _zero(month) + '月' + _zero(day) + '日 ' + _zero(hour) + ':' + _zero(minute);
        		break;
        	case 'MD':
        		int_time = _zero(month) + '-' + _zero(day);
        		break;
        	case 'HM':
        		int_time = _zero(hour) + ':' + _zero(minute);
        		break;
        	case 'HMS':
        		int_time = _zero(hour) + ':' + _zero(minute) + ':' + _zero(s);
        		break;
        	default:
        		int_time = year + '-' + _zero(month) + '-' + _zero(day) + ' ' + _zero(hour) + ':' + _zero(minute) + ':' + _zero(s);
        }

		return int_time;
	}
		
})(window);