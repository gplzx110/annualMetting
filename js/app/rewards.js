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
    var count_timer, still_count = false;

    comm.tplBottomMenu(vue);

    var vm = new vue({
        el: '#vm-main',
        data: {
            init: {
                show: false
            },
            user: {
                id: comm.getCache('userId'),
                is_staff: USER_IDE === _c.USER_IDE_STAFF,
                is_friend: USER_IDE === _c.USER_IDE_FRIEND,
                is_guest: USER_IDE === _c.USER_IDE_GUEST,
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR
            },
            rewardList: [],
            now: +new Date(),
            tip: {
                msg: '',
                show: false
            },
            showBottom: !Number(comm.getCache(_c.CACHE_LAST_DAY))
        },
        methods: {
          getLevle: function(lev) {
            var level_obj = {
                0: '特等奖',
                1: '一等奖',
                2: '二等奖',
                3: '三等奖',
                4: '幸运奖'
            };
            return level_obj[Number(lev)];
          },
          getStatus: function(status) {
            var status_obj = {
                0: '未开始',
                1: '下注中',
                2: '开奖中',
                3: '已开奖'
            };
            return status_obj[Number(status)];
          },
          getCount: function(item) {
                var beg_t = item.countdownStart,
                    end_t = item.countdownEnd;

                if(end_t <= 0 || beg_t > 0) {//已结结束或者未开始
                    if(item.status === 1) {
                        item.status = 2;
                    }
                    return countTime();
                }

                return countTime(end_t);
          }
        }
    });

    var app = {
        get: function() {
            var self = this;
            route('/award/findAwardList.html',{}, function(response, msg) {
                
                comm.loading('hide');

                if(! response) {
                    showTip(msg);
                    return;
                }
                vm.rewardList = response.data;
                vm.init.show = true;
                self.timer();
            }); 
        },
        timer: function() {
            var self = this;
            still_count = false;

            for (var i = 0; i < vm.rewardList.length; i++) {
                var item = vm.rewardList[i],
                    time_start = item.countdownStart,
                    time_end = item.countdownEnd;

                if(time_start <= 0 && time_end > 0) {
                    var new_data = $.extend({},item, {countdownEnd: time_end-1});
                    vm.rewardList.splice(i, 1, new_data);
                    still_count = true;
                }
            }
            if(still_count === true) {
                setTimeout(app.timer, 1000);
            }   
        },
        init: function() {
            if(vm.user.is_visitor) {
                window.location.href = 'index.html';
            }
            else {
                this.get();
            }
        }
    }

    function countTime(t) {
        var str = '<b class="count-txt">倒计时：</b>';

        if(!t) {
            str += '<span>0</span><span>0</span><i class="txt">时</i>'+
                   '<span>0</span><span>0</span></span><i class="txt">分</i>'+
                   '<span>0</span><span>0</span><i class="txt">秒</i>';
            return str;
        }
        var d = String(Math.floor(t/60/60/24)),
            h = String(Math.floor(t/60/60%24)),
            m = String(Math.floor(t/60%60)),
            s = String(Math.floor(t%60));
            
        if(d> 0) {
            if(d< 10) {
                d = '0' + d;
            }
            str += '<span>'+ d[0] +'</span><span>'+ d[1] +'</span><i class="txt">天</i>';
        }
        if(h< 10) {
            h = '0' + h;
        }
        if(m< 10) {
            m = '0' + m;
        }
        if(s< 10) {
            s = '0' + s;
        }
        str += '<span>'+ h[0] +'</span><span>'+ h[1] +'</span><i class="txt">时</i>'+
               '<span>'+ m[0] +'</span><span>'+ m[1] +'</span><i class="txt">分</i>'+
               '<span>'+ s[0] +'</span><span>'+ s[1] +'</span><i class="txt">秒</i>';

        return str;
    }

    function showTip(msg) {
        $.extend(vm.tip, {
            msg: msg,
            show: true
        });
    }

    app.init();
});