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

    var lazyloadObject;
    var tocumoveObject;

    var supporters = [];

    vue.component('employee', {
        template:  '<li class="worker-item" v-show="item.show" v-if="isCaptial()" v-bind:class="getStatusClass()"><div class="pic">\
                        <img class="perf-img" v-bind:data-lazy="item.headPic" v-bind:src="defaultAvatar">\
                        <i  v-if="item.volunteer" class="icon-volunteer"></i>\
                    </div>\
                    <div class="bottom">\
                        <span class="name">{{ item.realName }}</span>\
                        <i class="icon icon-flag" v-bind:class="flag"></i>\
                        <span class="prize-box">\
                            <i class="icon icon-prize"></i>\
                            <span class="num">{{ item.followNum }}</span>\
                        </span>\
                        <div class="fix">\
                            <span class="btn btn-blank" v-bind:class="supportClass()" v-on:click="doSupport(item.id)">{{ supportTxt() }}</span>\
                            <div class="pos">{{ item.position }}</div>\
                        </div>\
                    </div></li>\
                    <li v-else v-show="item.show" class="captial"><span class="captial-bg">{{ item.initial }}</span></li>',
        props: ['item'],
        data: function() {
            var self = this, flag = '';

            if(this.item.followTeamName === '红队') {
                flag = 'icon-flag-red';
            }
            else if(this.item.followTeamName === '黄队'){
                flag = 'icon-flag-yellow';
            }
            else {
                flag = 'icon-flag-blue';
            }
            return {
                flag: flag,
                defaultAvatar: 'images/support/default-avatar.jpg'
            }
        },
        methods: {
            isCaptial: function() {
                return this.item.realName === undefined? false: true;
            },
            doSupport: function(id) {
                var self = this;

                if(vm.user.is_staff) {
                    showTip('员工不能支持');
                    return;
                }
                if(self.item.isSupported === false) {
                    app.support(id, function() {
                        self.item.followNum = Number(self.item.followNum)+1;
                        self.item.isSupported = true;
                        showTip('确认选择支持的人后，在年会结束前还可以修改');
                    });
                }
                else {
                    app.cancelSopport(function() {
                        self.item.followNum = Number(self.item.followNum)-1;
                        self.item.isSupported = false;
                    });
                }
            },
            supportClass: function() {
                return vm.user.is_staff? 'hide':this.item.isSupported?'btn-unsupport':'btn-support';
            },
            supportTxt: function() {
                return vm.user.is_staff? '支持':this.item.isSupported? '取消' : '支持';
            },
            getStatusClass: function() {
                return (this.item.isSupported && !vm.user.is_staff)? 'item-supported' : '';
            }
        }
    });

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
            tip: {
                msg: '',
                show: false
            },
            search: {
                showSrh: false,
                srhValue: '',
                showEmptySrh: false
            },
            showGoodGover: false,
            showGoodWorker: false,
            emp_list: {
                all: [],
                goodGover: [],
                goodWorker: [],
                cap: []
            },
            supportInfo: {},
        },
        methods: {
            searchWorker: function() {
                var self = this;

                clearTimeout(app.searchTimer);
                app.searchTimer = null;
                app.searchTimer = setTimeout(function() {
                    var srh_val = self.search.srhValue;
                    if(srh_val !== '') {
                        var show_empty = true;

                        for (var i = 0; i < self.emp_list.all.length; i++) {
                            var data_item = self.emp_list.all[i];
                            if(data_item.realName == undefined || data_item.realName.indexOf(srh_val) === -1) {//null,undefined,空
                                data_item.show = false;
                            }
                            else {
                                data_item.show = true;
                                show_empty = false;
                            }
                        }
                        //隐藏优秀列表
                        $.extend(self,{
                            showGoodGover: false,
                            showGoodWorker: false
                        });
                        self.search.showEmptySrh = show_empty;
                        //对搜素结果图片进行加载
                        vm.$nextTick(function() {
                            lazyloadObject.check();
                        });
                    }
                    else {
                        self.showAll();
                    }
                }, 500);
            },
            showAll: function() {
                var srh_val = this.search.srhValue;

                if(srh_val === '') {
                    // 显示优秀列表
                    this.emp_list.goodGover.length && (this.showGoodGover = true);
                    this.emp_list.goodWorker.length && (this.showGoodWorker = true);
                    this.search.showEmptySrh = false;

                    for (var i = 0; i < this.emp_list.all.length; i++) {
                        this.emp_list.all[i].show = true;
                    }
                }
            },
            showSupportAll: function() {
                var txt = '', sup_data;
                if(this.supportInfo.showSupportTxt === '查看全部') {
                    txt = '收起';
                    sup_data = supporters;
                }
                else {
                    txt = '查看全部';
                    sup_data = supporters.slice(0,20);
                }

                $.extend(this.supportInfo, {
                    showSupportTxt: txt,
                    followHeadPic: sup_data
                });
            },
            srhWorksByInitial: function(event) {
                var initial = event.target.innerText;
                app.scrollToView(initial);
            },
            unsupport: function() {
                var _this = this;
                if(_this.supportInfo.supportStatus === '取消支持') {
                    app.cancelSopport(function() {
                        showTip('取消支持成功');
                        _this.supportInfo.supportStatus = '支持';
                        _this.supportInfo.followNum -= 1;
                    });
                }
                else {
                    app.support(_this.supportInfo.id,function() {
                        showTip('确认选择支持的人后，在年会结束前还可以修改');
                        _this.supportInfo.supportStatus = '取消支持';
                        _this.supportInfo.followNum += 1;
                    });
                }
            },
            showExplain: function() {
                var htmls = '<div style="text-align: left;">1. 1.   选择一位吉胜员工，点击支持即可为ta助力，该员工获得支持后可积累点赞数，并有机会赢取红包现金翻倍奖励。<br>'+
                            '2. 您可参与吉胜年会直播，抽取现金红包。<br>'+
                            '3. 年会开始前您都有机会更改支持对象。</div>'
                showTip(htmls);
            }
        }
    });

    var app = {
        scrollToView: function(initial) {
            $('.captial-bg').each(function() {
                var $this = $(this);
                if($this.html() === initial) {
                    $this[0].scrollIntoView();
                }
            });
        },
        getEmployee: function(cb) {
            var self = this;
            var params = {type: 1};//1按员工首字母排序2按支持人数倒序
            route('/user/getAllStaff.html', {params: params}, function(response, msg) {
                comm.loading('hide');
                if(! response) {
                    showTip(msg);
                    return;
                }
                self.AssortData(response.data);
                if(cb) {
                    cb();
                }
            });
        },
        AssortData: function(list) {
            var emp_list = {};
                emp_list.all = [];
                emp_list.goodGover = [];
                emp_list.goodWorker = [];
                emp_list.cap = [];

            for (var i = 0; i < list.length; i++) {
                var cap = list[i]['initial'] && list[i]['initial'].toUpperCase(),
                    bestFlag = Number(list[i].bestFlag);

                if(bestFlag === 1) {
                    emp_list.goodWorker.push(list[i]);
                }
                else if(bestFlag === 2) {
                    emp_list.goodGover.push(list[i]);
                }

                if(cap && emp_list.cap.indexOf(cap) < 0) {
                    emp_list.all.push({initial: cap, show: true});
                    emp_list.cap.push(cap);
                }
                list[i]['show'] = true;
                list[i]['isSupported'] = false;
                emp_list.all.push(list[i]);
            }
            vm.emp_list = emp_list;

            if(emp_list.goodGover.length > 0) {
                vm.showGoodGover = true;
            }
            if(emp_list.goodWorker.length > 0) {
                vm.showGoodWorker = true;
            }
        },
        support: function(id, success) {
            var params = {followUser: id};
            route('/user/changeFollowUser.html', {params: params}, function(response, msg) {
                if(! response) {
                    showTip(msg);
                    return;
                }

                if(comm.getCache(_c.CACHE_USER_IDE) === 'visitor') {
                    comm.setCache(_c.CACHE_USER_IDE, 'friend');
                }

                if(success) {
                    success();
                }
            });
        },
        cancelSopport: function(success) {
            route('/user/cancelFollowUser.html',{}, function(response, msg) {
                if(! response) {
                    showTip(msg);
                    return;
                }

                if(comm.getCache(_c.CACHE_USER_IDE) === 'friend') {
                    comm.setCache(_c.CACHE_USER_IDE, 'visitor');
                }

                showTip('已成功取消支持');
                if(success) {
                    success();
                }
            });
        },
        supportEmployeeInfo: function(cb) {
            route('/user/getFollowUserInfo.html',{}, function(response, msg) {
                if(! response) {
                    vm.search.showSrh = true;
                    return;
                }
                if(response.code === 1 && response.data && response.data.realName) {
                    var info = response.data;
                    if(info.followHeadPic) {
                        info.followHeadPic = info.followHeadPic.split(',');
                        //超过20条隐藏
                        if(info.followHeadPic.length > 20) {
                            info.showSupportTxt = '查看全部';
                            supporters = info.followHeadPic;
                            info.followHeadPic = info.followHeadPic.slice(0,20);//赋值语句改变的是数组本身还不是数组引用
                        }
                    }

                    info.supportStatus = '取消支持';
                    info.rank = 0;
                    vm.supportInfo = info;
                    
                    //如果登陆信息有误重置身份信息
                    if(comm.getCache(_c.CACHE_USER_IDE) === 'visitor') {
                        comm.setCache(_c.CACHE_USER_IDE, 'friend');
                        USER_IDE = 'friend';
                        $.extend(vm.user, {
                            is_visitor: false,
                            is_friend: true,
                        });
                    }
                    
                    for (var i = 0; i < vm.emp_list.all.length; i++) {
                        if(vm.emp_list.all[i].id === response.data.id) {
                            var new_data = $.extend(vm.emp_list.all[i], {isSupported: true});//必须重写对象,vue才会渲染，并且不能生成一个新对象，否则全体员工和优秀员工的数据不能同步（那样就不是引用的同一个对象了）
                            vue.set(vm.emp_list.all, i, new_data);
                            break;
                        }
                    }

                    if(cb) {
                        cb();
                    }
                }
                else {
                    vm.search.showSrh = true;
                }
            });
        },
        getSupportRank: function() {
            var params = {type: 2};
            route('/user/getAllStaff.html', {params: params}, function(response) {
                if(response) {
                    for (var i = 0; i < response.data.length; i++) {
                        if(Number(response.data[i].id) === Number(vm.supportInfo.id)) {
                            vm.supportInfo.rank = i+1;
                            break;
                        }
                        
                    }
                }
            });
        },
        init: function() {
            var self = this;
            this.getEmployee(function() {
                self.supportEmployeeInfo(self.getSupportRank);
                vm.init.show = true;
                vue.nextTick(function() {
                    lazyloadObject = new Lazyload();
                    tocumoveObject = new touchMove();
                });
            });
        }
    }

    function showTip(msg) {
        $.extend(vm.tip, {
            msg: msg,
            show: true
        });
    }

    function Lazyload() {
        var $imgs = $('.perf-img'),
            $win = $(window);

        this.bind= function() {
            var _this = this;
            $win.on('scroll', function() {
                _this.check();
            });
            //重置图片高度，避免ui错乱
            $imgs.first().on('load', function() {
                if(! $(this).data('lazy')) {
                    var $first = $(this),
                        $li = $(this).closest('li');

                    $first.off();
                    $imgs.css('height', $first.height()+'px');
                    $('.emp-list .worker-item').css('height', $li.height()+'px');
                }
            });
        };

        this.check = function() {
            $imgs.each(function() {
                var $img = $(this);
                if($img.offset().top + $img.height()> $win.scrollTop() && $img.offset().top < $win.scrollTop()+ $win.height()) {
                    var lazy_src = $img.data('lazy');
                    if(lazy_src) {
                        $img.attr('src', lazy_src).removeAttr('data-lazy');
                    }
                }
            });
        };

        this.init = function() {
            this.bind();
            this.check();
        }

        this.init();
    }

    function touchMove() {
        var $caps = $('.first-letter')[0],
            _this = this,
            touch_timer;

        this.move = function(event) {
            var touch = event.targetTouches[0],
                element = document.elementFromPoint(touch.clientX, touch.clientY);

            if(event.targetTouches.length > 1 || event.scale && event.scale !== 1) {
                return;
            }

            if($(element).hasClass('initial')) {
                clearTimeout(app.touch_timer);
                app.touch_timer = null;

                app.move_ele = $(element);
                app.touch_timer = setTimeout(function() {
                    app.move_ele.trigger('click');
                }, 300);
            }

            event.preventDefault();
        }

        if($caps.addEventListener) {
            $caps.addEventListener('touchmove', _this.move, false);
        }
        else {
            $caps.attachEvent('ontouchmove', _this.move);
        }

    }

    app.init();
});