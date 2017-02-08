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

    comm.tplBottomMenu(vue); // init bottom menu template

    var is_taking_bag = false;
	
    var vm = new vue({
        el: '#vm-main',
        data: {
            init: {
                show: false,
                show_no_begin: false,
                show_get_card: false,
                show_blessing_list: false
            },
            user: {
                id: comm.getCache('userId'),
                is_manager: Number(comm.getCache(_c.CACHE_USER_DELETE)) === 1,
                is_staff: USER_IDE === _c.USER_IDE_STAFF, // 员工
                is_friend: USER_IDE === _c.USER_IDE_FRIEND, // 亲友
                is_guest: USER_IDE === _c.USER_IDE_GUEST, // 嘉宾
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR // 访客
            },
            tpl: {
                txt_blessing: (USER_IDE === _c.USER_IDE_STAFF || USER_IDE === _c.USER_IDE_GUEST) ? '福卡' : '红包'
            },
            cards: [],
            blessing_list: [] // 红包+福卡列表
        },
        methods: {
            getUserCards: function(event) { // 抽福卡
                var _this = this;

                app.getUserCards(function(card) {
                    if(card.fkName === null) {
                        card.fkName = '平安卡';
                    }

                    card.img = _c.CARDS[card.fkName].img; // 卡片图

                    _this.cards.push(card);
                });

                event.preventDefault();
                event.stopPropagation();
            },
            taskingBlessingbag: function (bag_id, event) {
                if(is_taking_bag) {
                    return;
                }
                is_taking_bag = true;

                route('/redBag/snatchedRedBag.html', {params: {id: bag_id}}, function(response) {
                    is_taking_bag = false;

                    if(! response) {
                        return;
                    }

                    window.location.href = './blessing-detail.html?id=' + bag_id;
                });

                event.preventDefault();
                event.stopPropagation();
            },
            showBlessingDetail: function(item) {
                if(item.status === 0 || item.status === 3) { // 未抢
                    return;
                }

                window.location.href = './blessing-detail.html?id=' + item.id;
            },
            reGetedBlessingCard: function() {
                if(! this.cards.length) {
                    return;
                }

                window.location.href = './user-index.html';
            }
        }
    });

    var app = {
        getOpenBlessing: function() {
            route('/redBag/getFKFlag.html', {}, function(response, error) {
                comm.loading('hide');

                if(! response) {
                    // alert(error);
                    return;
                }

                var flag = response.data; // 1开通未抽 2未开通，3已抽福卡||显示列表
                if(flag === 1) {
                    vm.init.show_get_card = true;
                }
                else if(flag === 2) {
                    vm.init.show_no_begin = true;
                }
                else if(flag === 3) { // 直播开始后：显示列表
                    vm.init.show_blessing_list = true;
                    app.getBlssingList();
                }
            });
        },
        getUserCards: function(callback) {
            route('/redBag/obtainWelfare.html', {}, function(response) {
                if(! response) {
                    return;
                }

                callback(response.data);
            });
        },
        getBlssingList: function() { // 红包列表
            route('/redBag/obtainRedBagList.html', {}, function(response) {
                if(! response) {
                    return;
                }

                vm.blessing_list = _set(response.data.list);

                setTimeout(function() {
                    _countDown();
                }, 1000);
            });

            function _set(list) {
                for (var i = 0; i < list.length; i++) {
                    if(list[i].countdownTime <= 0) {
                        continue;
                    }

                    list[i].arrCountdownTime = _getArrCountTime(list[i].countdownTime);
                }

                return list;
            }

            function _getArrCountTime(count) {
                var arr = String(count).split('');
                if(arr.length === 1) {
                    arr.unshift(0);
                }

                return arr;
            }

            function _countDown() {
                var is_timeout = false;

                for (var i = 0; i < vm.blessing_list.length; i++) {
                    if(vm.blessing_list[i].status == 3 && vm.blessing_list[i].countdownTime > 0) {
                        vm.blessing_list[i].countdownTime --;
                        vm.blessing_list[i].arrCountdownTime = _getArrCountTime(vm.blessing_list[i].countdownTime);

                        is_timeout = true;
                    }
                }

                if(is_timeout) {
                    setTimeout(function() {
                        _countDown();
                    }, 1000);
                }
            }
        },
        init: function() {
            vm.init.show = true;

            if(vm.user.is_visitor) { // 访客
                comm.loading('hide');
            }
            else {
                this.getOpenBlessing();
            }

            setTimeout(function() {
                window.document.title = vm.tpl.txt_blessing; // reset page title
            }, 500);
        }
    };

    app.init();

});