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
    var data_list = [];

    var vm = new vue({
        el: '#vm-main',
        data: {
            init: {
                show: false
            },
            tip: {
                msg: '',
                show: false
            },
            showInp: false,
            user: {
                id: comm.getCache('userId'),
                is_staff: USER_IDE === _c.USER_IDE_STAFF,
                is_friend: USER_IDE === _c.USER_IDE_FRIEND,
                is_guest: USER_IDE === _c.USER_IDE_GUEST,
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR
            },
            wishList: [],
            myWish: ''
        },
        methods: {
            submitWish: function() {
                app.sendWish();
            },
            inpFocus: function() {
                setTimeout(function() {
                    $('.inp-wrap')[0].scrollIntoView();
                }, 100);
            }
        }
    });

    var app = {
        get: function(cb) {
            var self = this;
            route('/vowTree/findVowTree.html', {}, function(response, msg) {
                if(! response) {
                    showTip(msg);
                    return;
                }

                if(response.code === 1 && response.data && response.data.length) {
                   data_list = self.formatWish(response.data);
                }

                if(cb) {
                    cb();
                }
            });

        },
        formatWish: function(data) {
            var style_arr = ['item-small', 'item-middle', 'item-big','item-large'],
                img_arr = ['wh-icon-1.png', 'wh-icon-2.png', 'wh-icon-3.png','wh-icon-4.png','wh-icon-5.png','wh-icon-6.png'];

            if($.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    _format(data[i]);
                }
            }
            else {
                _format(data);
            }

            function _format(item) {
                var style_idx = Math.floor(Math.random()*4),
                    img_idx = Math.floor(Math.random()*6);

                item.styleClass = 'list-animate '+ style_arr[style_idx];
                item.src = 'images/wishes/'+ img_arr[img_idx];

                if(item.vowId === vm.user.id) {//自己的祝福
                    item.styleClass += ' item-self';
                }
            }

            return data;

        },
        sendWish: function() {
            var self = this,
                params = {vowContent: vm.myWish};

            if(vm.myWish.length > 30) {
                showTip('许愿字符30字以内');
                return;
            }

            route('/vowTree/addVow.html', {params: params}, function(response,msg) {
                if(! response) {
                    showTip(msg);
                    return;
                }

                var my_wish = {vowContent: ' 我：'+ vm.myWish,vowId: vm.user.id};
                app.formatWish(my_wish);
                data_list.unshift(my_wish);
                vm.myWish = '';

                if($('li').length < 10) {//当前数据未渲染完成
                    vm.wishList.push(my_wish);
                    vue.nextTick(function() {
                        self.bindAnimate();
                    });
                }
            });
        },
        bindAnimate: function() {
            var self = this;
            $('li').each(function() {
                $(this).unbind()[0].addEventListener('webkitAnimationEnd', _animate, false);
            });

            function _animate() {
                var li_htmls = '<img src="__SRC__"><span class="detail">__DETAIL__</span>';

                if(!data_list || data_list.length <= 0) {
                    data_list = self.get();
                    $(this).html('');
                }
                else {
                    var data = data_list.splice(0,1)[0],
                        styleClass = data.styleClass.replace(/list-animate/, ''),
                        htmls = li_htmls.replace(/__SRC__/, data.src)
                                       .replace(/__DETAIL__/, data.vowContent);

                    app.animate_li = $(this).html(htmls).attr('class', styleClass);
                    //重置动画（如果让动画循环会导致transform值不对）
                    setTimeout(function() {
                        app.animate_li.addClass('list-animate');
                    }, 60);
                }
            }
        },
        check: function() {
            route('/vowTree/getVowTreePrivInfo.html', {}, function(response, msg) {
                if(! response) {
                    showTip(msg);
                    return;
                }
                if(response.data.addFlag === 1 && ! vm.user.is_visitor) {//可发布
                    vm.showInp = true;
                }
            });
        },
        init: function() {
            var self = this;
            this.get(function() {
                if(data_list && data_list.length> 0) {
                    $.extend(vm, {
                        wishList: data_list.splice(0,10),
                        init: {show: true}
                    });
                    
                    vue.nextTick(function() {
                        self.bindAnimate();
                    });
                }
            });
            this.check();
        }
    }

    function showTip(msg) {
        $.extend(vm.tip, {
            msg: msg,
            show: true
        });
    }

    $('.wishes-page').on('click', function() {
        $('.inp-wrap input')[0].blur();
    });

    $('.inp-wrap').on('click', function(e) {
        e.stopPropagation();
    });

    app.init();
});