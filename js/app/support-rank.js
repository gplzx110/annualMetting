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


define(['jquery', 'vue', 'comm', 'route', 'config', 'wxsdk'], function($, vue, comm, route, _c) {
    
    'use strict';

    var USER_IDE = comm.getCache(_c.CACHE_USER_IDE);

    var vm = new vue({
        el: '#vm-main',
        data: {
            init: {
                show: false
            },
            user: {
                id: comm.getCache('userId') || 4,
                is_manager: Number(comm.getCache(_c.CACHE_USER_DELETE)) === 1,
                is_staff: USER_IDE === _c.USER_IDE_STAFF, // 员工
                is_friend: USER_IDE === _c.USER_IDE_FRIEND, // 亲友
                is_guest: USER_IDE === _c.USER_IDE_GUEST, // 嘉宾
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR // 访客
            },
            rankList: {}
        },
        methods: {
            getClass: function(idx) {
                var class_str = '';
                if(idx === 0) {
                    class_str = 'item-first';
                }
                else if(idx === 1) {
                    class_str = 'item-second';
                }
                else if(idx === 2){
                    class_str = 'item-third';
                }
                if(Number(this.user.id) === Number(this.rankList[idx].id)) {
                    class_str += ' item-self';
                }
                return class_str;
            },
            flag: function(value) {
                var flag = '';
                if(value === '红队') {
                    flag = 'icon-flag-red';
                }
                else if(value === '黄队'){
                    flag = 'icon-flag-yellow';
                }
                else {
                    flag = 'icon-flag-blue';
                }
                return flag;
            }
        },
        updated: function() {
            $('.item-self').clone().prependTo($('.rank-list')).addClass('item-self-top');
        }
    });

    var app = {
        get: function() {
            var params = {type: 2};//1按员工首字母排序2按支持人数倒序
            route('/user/getAllStaff.html', {params: params}, function(response, msg) {
                comm.loading('hide');
                if(! response) {
                    showTip(msg);
                    return;
                }
                vm.rankList = response.data;
                vm.init.show = true;
            });
        },
        init: function() {
            this.get();
        }
    }

    function showTip(msg) {
        $.extend(vm.tip, {
            msg: msg,
            show: true
        });
    }

    app.init();
});