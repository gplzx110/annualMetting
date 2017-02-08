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

    var USER_IDE = comm.getCache(_c.CACHE_USER_IDE),
        oder_no,
        count_timer;

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
            reward: {},
            buyNum: 1,
            now: +new Date(),
            noMoney: false,
            tip: {
                msg: '',
                show: false,//显示tips默认显示遮罩
                layout: false,//是否显示layout遮罩
                pay: {
                    show: false
                }
            },
            charge: {
                dialogShow: false,
                money: '',
                success: false
            }
        },
        methods: {
            plus: function() {
                var buyNum = Number(this.buyNum),
                    money = buyNum*this.reward.money;

                this.buyNum = buyNum+1;
                if( money > Number(this.reward.userMoney)) {
                    this.noMoney = true;
                }
            },
            minus: function() {
                var buyNum = Number(this.buyNum),
                    money = buyNum*this.reward.money;

                if(buyNum <= 1) {
                    return;
                }
                this.buyNum = buyNum-1;
                if(money <= Number(this.reward.userMoney) && this.reward.status === 1) {
                    this.noMoney = false;
                    return;
                }
            },
            keyupEvent: function() {
                var buyNum = this.buyNum,
                    money = buyNum*this.reward.money;

                if(buyNum) {
                    this.buyNum = parseInt(buyNum) || 1;
                }

                if(money <= Number(this.reward.userMoney) && this.reward.status === 1 && Number(this.reward.userMoney)>0) {
                    this.noMoney = false;
                }
                else {
                    this.noMoney = true;
                }
            },
            blurEvent: function() {
                var buyNum = this.buyNum;
                if($.trim(buyNum) === '') {
                    this.buyNum = 1;
                }
            },
            chargeKeyupEvent: function() {
                var money = this.charge.money;
                if(money) {
                    this.charge.money = parseInt(money) || 1;
                }
            },
            showExplain: function() {
                var htmls = '<div style="text-align: left;">1. 在您的个人钱包里有100元的初始下注金额，可参与您喜欢的奖品下注，每注1元，钱不够可以微信充值哦。<br>'+
                            '2. 所有奖品将在21日19:15关闭下注通道，要千万记得，别错过机会。<br>'+
                            '3. 年会当天系统随机抽奖，预祝您获得大奖！</div>';
                showTip(htmls);
            },
            buy: function() {
                if(this.noMoney) {
                    return;
                }
                if(this.reward.status !== 1) {
                    showTip('下注通道处于关闭状态');
                    return;
                }
                if(Number(this.buyNum) === 0) {
                    this.buyNum = 1;
                    showTip('下注数量不能为0');
                    return;
                }
                app.doBuy();
            },
            doCharge: function() {
                //微信充值
                if(!this.charge.money) {
                    return;
                }
                app.order();
            },
            // payOver: function() {
            //     app.checkOrder();
            // },
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
                  2: '未开奖',
                  3: '已开奖'
              };
              return status_obj[Number(status)];
            },
            getCount: function() {
                var beg_t = this.reward.countdownStart,
                    end_t = this.reward.countdownEnd;

                if(end_t <= 0 || beg_t > 0) {//已结结束或者未开始
                    if(this.reward.status === 1) {
                        this.reward.status = 2;
                    }
                    clearInterval(count_timer);
                    count_timer = null;
                    return countTime();
                }

                return countTime(end_t);
            },
            reload: function() {
                window.location.reload();
            }
        },
        mounted: function() {
            var self = this;
            count_timer = setInterval(function() {
                if(self.reward.countdownEnd > 0) {
                    self.reward.countdownEnd -=1;
                }
            }, 1000);
        }
    });

    var app = {
        get: function() {
            var params = {id: comm.getUrlParam('id')};
            route('/award/findAwardById.html',{params: params}, function(response, msg) {
                
                comm.loading('hide');

                if(! response) {
                    showTip(msg);
                    return;
                }
                var data = response.data;
                vm.reward = data;
                vm.init.show = true;
                vm.reward.money = 100;
                if(Number(vm.reward.userMoney/vm.reward.money) < 1 || vm.reward.status !== 1) {
                    vm.noMoney = true;
                }
            });
        },
        doBuy: function() {
            var self = this,
                params = {
                    id: comm.getUrlParam('id'),
                    betNum: vm.buyNum
                };
            route('/award/betAward.html',{params: params}, function(response, msg) {
                if(! response) {
                    showTip(msg);
                    return;
                }
                showTip('下注成功，预祝好运~');
                self.get();
                vm.buyNum = 1;
            }); 
        },
        order: function() {
            var self = this,
                $btn = $('.charge-submit-btn'),
                params = {money: vm.charge.money};//注意大小写

            if($btn.hasClass('dis')) {
                return;
            }
            $btn.addClass('dis').text('下单中...');

            route('/award/recharge.html',{params: params}, function(response, msg) {
                $btn.removeClass('dis').text('充值');
                vm.charge.dialogShow = false;

                if(! response) {
                    showTip(msg);
                    return;
                }

                self.paying(response);
            }); 
        },
        paying: function(response) {
            var self = this;
            oder_no = response.data.orderNo;
            //显示支付确认弹框
            vm.tip.pay.show = true;

            comm.weixinPay({
                success: function() {
                    self.checkOrder();
                },
                fail: function(err_msg) {
                    showTip('微信支付失败');
                }
            }, response.data.data);//注意data里面还有个data
        },
        checkOrder: function() {
            var params = {orderNo: oder_no};
            route('/award/rechargeResult.html',{params: params}, function(response, msg) {
                if(! response || response.code !== 1) {
                    showTip(response.message || '支付异常');
                    return;
                }

                vm.charge.success = true;//充值成功刷新页面
            });
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

    function showTip(msg) {
        $.extend(vm.tip, {
            msg: msg,
            show: true,
            pay: {show: false}//关闭微信支付弹框
        });
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

    app.init();
});