require.config({
    baseUrl: './',
    paths: {
        jquery: 'lib/zepto.min',
    	vue: 'lib/vue',
        config: 'js/helper/config',
        comm: 'js/helper/comm',
        route: 'js/helper/route',
        swiper: 'lib/swiper/js/swiper.min',
        wxsdk: 'js/helper/wxsdk'
    },
    shim: {
        jquery: {
            exports: '$'
        }
    }
});

define(['jquery', 'vue', 'config', 'comm','route', 'swiper', 'wxsdk'], function($, vue, _c, comm) {

'use strict';

    var USER_IDE = comm.getCache(_c.CACHE_USER_IDE);

    var vm = new vue({
        el: '#vm-main',
        data: {
            init: {
                show: false
            },
            user: {
                id: comm.getCache('userId'),
                is_staff: USER_IDE === _c.USER_IDE_STAFF, // 员工
                is_friend: USER_IDE === _c.USER_IDE_FRIEND, // 亲友
                is_guest: USER_IDE === _c.USER_IDE_GUEST, // 嘉宾
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR // 访客
            },
            slides: [],
            last_day: comm.getUrlParam('day') || 0
        },
        updated: function() {
            new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                paginationClickable: false,
                autoplay: 5000,
                autoplayDisableOnInteraction: false,
                preloadImages: false,
                lazyLoading: true,
                lazyLoadingInPrevNext : true,
                lazyLoadingInPrevNextAmount: 2
            });
        }
    });

    var app = {
        randomsort: function() {
            return Math.random() > .5 ? -1 : 1; // 用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
        },
        init: function() {
            vm.slides = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg', '12.jpg'].sort(this.randomsort);
            vm.init.show = true;
        }
    };

    app.init();
});