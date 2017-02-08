require.config({
    baseUrl: './',
    paths: {
        jquery: 'lib/zepto.min',
    	vue: 'lib/vue',
        config: 'js/helper/config',
        comm: 'js/helper/comm',
        route: 'js/helper/route',
        wxsdk: 'js/helper/wxsdk'
    },
    shim: {
        jquery: {
            exports: '$'
        }
    }
});

define(['jquery', 'vue', 'config', 'comm', 'route', 'wxsdk'], function($, vue, _c, comm, route) {

'use strict';

    var USER_IDE = comm.getCache(_c.CACHE_USER_IDE),
        TIME_INT_DETAILL = 5000; // 轮询红包详情
	
    var vm = new vue({
        el: '#vm-main',
        data: {
            init: {
                show: false
            },
            user: {
                id: comm.getCache('userId'),
                is_manager: Number(comm.getCache(_c.CACHE_USER_DELETE)) === 1,
                is_staff: USER_IDE === _c.USER_IDE_STAFF, // 员工
                is_friend: USER_IDE === _c.USER_IDE_FRIEND, // 亲友
                is_guest: USER_IDE === _c.USER_IDE_GUEST, // 嘉宾
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR // 访客
            },
            detail: {}
        },
        methods: {
        }
    });

    var app = {
        initDetail: function() {
            var bag_id = comm.getUrlParam('id');
            if(! bag_id) {
                alert('非法红包');
                return;
            }

            route('/redBag/getRedBagInfo.html', {params: {id: bag_id}}, function(response) {
                if(! response) {
                    return;
                }

                vm.detail = response.data;
                vm.init.show = true;

                if(response.data.status !== 1) { // 还未抢完时轮询
                    setTimeout(function() {
                        app.initDetail();
                    }, TIME_INT_DETAILL);
                }
            });
        },
        init: function() {
            this.initDetail();
            vm.init.show = true;
        }
    };

    app.init();

});