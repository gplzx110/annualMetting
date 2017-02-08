require.config({
    baseUrl: './',
    paths: {
        jquery: 'lib/zepto.min',
    	vue: 'lib/vue',
        config: 'js/helper/config',
        comm: 'js/helper/comm',
        route: 'js/helper/route'
    },
    shim: {
        jquery: {
            exports: '$'
        }
    }
});

define('commLight', ['jquery', 'vue', 'config', 'comm', 'route'], function($, vue, _c, comm, route) {

// 'use strict';
    
//     var USER_IDE = comm.getCache(_c.CACHE_USER_IDE),
//         TIME_OUT_LIGHT = 5000,
//         CACHE_VAL_LIGHT = '1';

//     var vm = new vue({ // 点亮
//         el: '#vm-comm-light',
//         data: {
//             show: false,
//             lighting: false // 控制灯笼
//         },
//         methods: {
//             antLightAfterEnter: function() {
//                 var _this = this;

//                 setTimeout(function() {
//                     _this.lighting = false;
//                 }, 10000);
//             },
//             antLightAfterLeave: function() {
//                 this.show = false;
//                 this.lighting = false;
//             }
//         },
//         created: function() {
//             var timer = null,
//                 _this = this;

//             function _get() {
//                 route('/other/getLogoFlag.html', {}, function(response) {
//                     if(! response) {
//                         clearInterval(timer);
//                         return;
//                     }

//                     if(response.data === 1) {
//                         _this.show = true;
//                         _this.lighting = true;

//                         clearInterval(timer);
//                         comm.setCache(_c.CACHE_LIGHTING, CACHE_VAL_LIGHT);
//                     }
//                 });
//             }

//             function _init() {
//                 if(USER_IDE !== _c.USER_IDE_STAFF && USER_IDE !== _c.USER_IDE_GUEST) { // 不是员工和嘉宾
//                     return;
//                 }

//                 if(comm.getCache(_c.CACHE_LIGHTING) === CACHE_VAL_LIGHT) {
//                     return;
//                 }

//                 timer = setInterval(function() {
//                     _get();
//                 }, TIME_OUT_LIGHT);
//             }
//             _init();
//         }
//     });

});