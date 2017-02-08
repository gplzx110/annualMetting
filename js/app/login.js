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

    var CACHE_GUEST_CODE = 'guest_code';

    comm.showTip(vue);
	
    var vm = new vue({
        el: '#vm-btns',
        data: {
            guest_code: comm.getCache(CACHE_GUEST_CODE) || '',
            tip: {
                show: false,
                msg: ''
            }
        },
        methods: {
            guestSignIn: function() {
                var _this = this;
                if(this.guest_code === '') {
                    return;
                }

                route('/user/checkInvitationCode.html', {params: {invitationCode: this.guest_code}}, function(response, error) {
                    if(! response) {
                        app.tip(error || '邀请码验证失败');
                        return;
                    }

                    comm.setCache(CACHE_GUEST_CODE, _this.guest_code);
                    comm.setCache(_c.CACHE_USER_IDE, _c.USER_IDE_GUEST); // 嘉宾身份

                    _this.guest_code = '';
                    app.goHome();
                });
            },
            staffSignIn: function() {
                app.checkUserIde(1, function(identify) { // 1员工
                    if(identify !== 1) {
                        app.tip('员工名单没有你呢，想加入吉胜？');
                        return;
                    }

                    comm.setCache(_c.CACHE_USER_IDE, _c.USER_IDE_STAFF);
                    app.goHome();
                });
            },
            friendsSignIn: function() {
                app.checkUserIde(3, function(identify) { // 3亲友或游客
                    if(identify === 3) {
                        comm.setCache(_c.CACHE_USER_IDE, _c.USER_IDE_FRIEND); // 亲友
                        // app.tip('亲友');
                        app.goHome();
                    }
                    else if(identify === 4) {
                        comm.setCache(_c.CACHE_USER_IDE, _c.USER_IDE_VISITOR); // 游客
                        // app.tip('游客');
                        app.goHome();
                    }
                    else {
                        app.tip('年会组织没有你的资料');
                    }
                });
            }
        }
    });

    var app = {
        tip: function(msg) {
            vm.tip = {show: true, msg: msg};
        },
        goHome: function() {
            window.location.href = './home.html';
        },
        checkUserIde: function(ide, callback) {
            route('/user/checkUserIdentify.html', {params: {identify: ide}}, function(response, error) {
                if(! response) {
                    app.tip(error || '身份验证失败');
                    return;
                }

                callback(response.data.identify);
            });
        },
        init: function() {
            comm.removeCache(_c.CACHE_USER_IDE);
        }
    };

    app.init();

});