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
            team_list: [],
            tip: {
                show: false,
                msg: ''
            }
        },
        methods: {
            showExplain: function() {
                app.tip('<div style="text-align: left;">1. 团队总分由颜值比拼和节目评分两部分组成。<br />2.  团队总分排名第一的团队所有员工可获得红包现金翻倍卡，年会抽奖中奖几率可翻倍。</div>');
            }
        }
    });

    var app = {
        tip: function(msg) {
            vm.tip = {show: true, msg: msg};
        },
        findItemById: function(id) {
            for(var i = 0, len = vm.team_list.length; i < len; i++) {
                if(vm.team_list[i].id === id) {
                    return vm.team_list[i];
                }
            }

            return false;
        },
        initList: function() {
            route('/team/findTeamList.html', {params: {type: 2}}, function(response) {
                comm.loading('hide');

                if(! response) {
                    return;
                }

                vm.team_list = _set(response.data.list);
            });

            function _set(list) {
                return list;
            }
        },
        init: function() {
            this.initList();
            vm.init.show = true;
        }
    };

    app.init();

});