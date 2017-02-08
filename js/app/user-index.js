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
        CARDS = {
            '加成卡': {desc: '根据全员邀请人数排名获得红包现金加成卡，当天晚宴抢红包所得金额乘以加成系数为当天最终红包金额。'},
            '5年陈卡': {desc: '在吉胜工作年限满5年，且在历届年会中从未中奖的员工，有机会抽取此卡。抽中卡片的人可现场砸金蛋。'},
            '1+1卡': {desc: '抽中此卡的人中奖后，随机获得一份小礼物。（强制生效）'},
            '查封卡': {desc: '抽中此卡的人中奖后，延期7天获得奖品。（强制生效）'},
            '单身卡': {desc: '抽中此卡的人，若为单身，可获得暖手充电宝一个，反则自动作废。'},
            '购物卡': {desc: '抽中此卡的人，可选择三等奖中任一奖品以5折采购价购买此奖品。（不强制生效）'},
            '均富卡': {desc: '抽中此卡的人中奖后，中奖人所在餐桌所有人获充电宝一份。（强制生效）'},
            '抢救卡': {desc: '年会红包抽取金额最低的人，默认获得此卡，得此卡者可获得暖手充电宝一份。'},
            '情侣卡': {desc: '抽中此卡的人，若不为单身，可获得存钱罐一个，反则自动作废。'},
            '亲子卡': {desc: '抽中此卡的人，若有儿女，可获得一份儿童礼品，没有则自动作废。'},
            '双倍卡': {desc: '抽中此卡的人中奖后，奖品获取双份。（强制生效）'},
            '税收卡': {desc: '抽中此卡的人中奖后，中奖人交纳抽奖红包总金额的10%个人所得税。（强制生效）'},
            '小蜜蜂卡': {desc: '2016年全年累计加班超过100个小时的员工，有机会抽取此卡。抽中卡片的人可现场砸金蛋。'},
            '长辈卡': {desc: '抽中此卡的人，可获得血压仪一份。（强制生效）'},
            '粘贴卡': {desc: '抽中此卡的人中奖后，现场选择一位异性同事，获得一份同样的奖品。（不强制生效）'},
            '置换卡': {desc: '抽中此卡的人中奖后，可上场砸金蛋，砸中的奖品与中奖奖品当场置换。（不强制生效）'},
            '平安卡': {desc: '怪我咯，什么都木有～'}
        };

    comm.tplBottomMenu(vue); // init bottom menu template
    comm.showTip(vue);

    var vm = new vue({
        el: '#vm-main',
        data: {
            layout_show: false,
            init: {
                show: false,
                rank_url: './rank-team-face.html'
            },
            user: {
                id: comm.getCache('userId'),
                is_manager: Number(comm.getCache(_c.CACHE_USER_DELETE)) === 1,
                is_staff: USER_IDE === _c.USER_IDE_STAFF, // 员工
                is_friend: USER_IDE === _c.USER_IDE_FRIEND, // 亲友
                is_guest: USER_IDE === _c.USER_IDE_GUEST, // 嘉宾
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR // 访客
            },
            userInfo: {
                userName: '',
                userTitle: '',
                userSubTitle: ''
            },
            recharge: { // 充值
                show: false,
                confirm_show: false,
                money: 10,
                order_no: null,
                is_ing: false
            },
            cards: [],
            modal_card: { // 卡说明
                show: false,
                name: '',
                desc: ''
            },
            tip: {
                show: false,
                msg: ''
            }
        },
        methods: {
            goUrl: function(url) {
                if(url) {
                    window.location.href = url;
                }
            },
            closeLayout: function() {
                if(this.recharge.confirm_show) { // 确定支付时不能使用遮罩关闭
                    return;
                }

                this.recharge.show = false;
                this.modal_card.show = false;
                this.layout_show = false;
            },
            dialogShowCard: function(name) {
                this.layout_show = true;
                this.modal_card = {
                    show: true,
                    name: name,
                    desc: CARDS[name].desc
                };
            },
            checkOrder: function () {
                app.checkOrder();
            },
            tryOrder: function() {
                app.preOrder();
            },
            rechargeCash: function() { // 显示充值输入框
                if(this.recharge.is_ing) {
                    return;
                }

                // 开始下单 
                this.recharge.show = true;
                this.layout_show = true;
            },
            rechargePay: function() { // 确定支付
                if(this.recharge.is_ing) {
                    return;
                }

                app.payOrder();
            }
        }
    });

    var app = {
        tip: function(msg) {
            vm.tip = {show: true, msg: msg};
        },
        payOrder: function() { // 下单
            var _this = this;

            if(! /^[-]{0,1}[0-9]{1,}$/.test(vm.recharge.money) || vm.recharge.money <= 0) {
                app.tip('请输入正确的充值金额');
                return;
            }

            vm.recharge.show = false;
            vm.recharge.confirm_show = true;
            vm.recharge.is_ing = true;
            
            this.preOrder();
        },
        preOrder: function() {
            var _this = this;

            route('/award/recharge.html', {params: {money: vm.recharge.money}}, function(response, error) {
                vm.recharge.is_ing = false;

                if(! response) {
                    app.tip(error || '下单失败');
                    return;
                }

                vm.recharge.order_no = response.data.orderNo;

                comm.weixinPay({
                    success: function() {
                        _this.checkOrder();
                    },
                    fail: function(error_msg) {
                    }
                }, response.data.data);
            });
        },
        checkOrder: function() {
            var _this = this;

            route('/award/rechargeResult.html', {params: {orderNo: vm.recharge.order_no}}, function(response) {
                if(! response) {
                    return;
                }

                _this.successOrder();
            });
        },
        successOrder: function() { // 充值成功
            vm.layout_show = false;
            vm.recharge = {
                    show: false,
                    confirm_show: false,
                    money: 10,
                    order_no: null,
                    is_ing: false
                };

            this.initUser();
        },
        initUser: function() {
            route('/user/getUserInfo.html', {}, function(response) {
                comm.loading('hide');
                
                if(! response) {
                    return;
                }

                vm.userInfo = _set(response.data);
            });

            function _set(user) {
                if(user.identify === 3 || user.identify === 4) { // 亲友||游客
                    user.userName = user.nickName || '';
                }

                if(user.identify === 3) {
                    user.userTitle = user.followName + ' 亲友';
                    user.userSubTitle = (! user.followTeamName || user.followTeamName === '') ? '未支持团队' : ('支持' + user.followTeamName);
                }

                var cards = [];
                if(user.identify === 1 || user.identify === 2) { // 员工||嘉宾
                    user.moneyRatePer = Math.ceil(user.moneyRate * 100);

                    if(user.moneyRate) {
                        cards.push({name: '加成卡', img: _c.CARDS['加成卡'].img, is_plus: true, rate: user.moneyRatePer});
                    }

                    if(user.moneyRate && user.fkName === null) {
                         user.fkName = '平安卡';
                    }
                    
                    if(user.fkName) {
                        cards.push({name: user.fkName, img: _c.CARDS[user.fkName].img});
                    }
                }
                vm.cards = cards;

                if(user.identify === 1) { // 员工
                    // user.userTitle = user.position || '员工';
                    user.userTitle = '亲友支持数：' + user.followCount;
                    user.userSubTitle = user.followTeamName === '' ? '' : user.followTeamName;
                }

                if(user.identify === 2) { // 嘉宾
                    user.userSubTitle = (! user.followTeamName || user.followTeamName === '') ? '未支持团队' : ('支持' + user.followTeamName);
                    user.userTitle = '嘉宾';
                }

                user.teamColor = comm.getTeamKey(user.followTeamName) || 'comm';
                user.teamScore = user.teamScore ? (user.teamScore + '分') : '无';
                user.teamRank = user.teamRank ? ('第' + user.teamRank + '名') : '无';

                return user;
            }
        },
        init: function() {
            this.initUser();
            vm.init.show = true;
        }
    };

    app.init();

});