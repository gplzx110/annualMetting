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

    var USER_IDE = comm.getCache(_c.CACHE_USER_IDE);

    comm.showTip(vue);

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
            detail: {
                money: '',
                moneyFlowList: []
            },
            get_cash_ing: false,
            tip: {
                show: false,
                msg: ''
            }
        },
        methods: {
            getCashToWX: function() {
                var _this = this;

                this.get_cash_ing = true;
                route('/user/getMoney.html', {params: {money: this.detail.money}}, function(response, error) {
                    _this.get_cash_ing = false;

                    if(! response) {
                        app.tip(error || '提现失败');
                        return;
                    }

                    app.initMoneyDetail();
                    app.tip('提现成功，请到微信账户查收');
                    // window.location.reload(true);
                });
            }
        }
    });

    var app = {
        tip: function(msg) {
            vm.tip = {show: true, msg: msg};
        },
        initMoneyDetail: function() {
            route('/user/enterGetMoney.html', {}, function(response) {
                comm.loading('hide');

                if(! response) {
                    return;
                }

                vm.detail = response.data;
            });
        },
        init: function() {
            if(vm.user.is_visitor) {
                app.tip('访问权限不够');
                return;
            }

            this.initMoneyDetail();
            vm.init.show = true;
        }
    };

    app.init();

});