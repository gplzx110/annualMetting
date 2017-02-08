;(function (factory, window) {
    if (typeof define === 'function' && define.amd) {
        define('wxsdk', ['http://res.wx.qq.com/open/js/jweixin-1.0.0.js', 'jquery', 'route'], factory);
    }
}
(function(wx, $, route) {

    if(typeof wx === 'undefined') {
        console.log('Not found the wx public jssdk.');
        return;
    }
    
    var default_share = {
            img: 'http://img.96ni.net/upload/portal/js2017share/share1.jpg',
            title: '吉胜科技2017年会等你来，参与直播领取红包',
            desc: '感恩过往 . 聚力前行'
        },
        shares = [
            {
                path: 'user-index.html',
                img: 'http://img.96ni.net/upload/portal/js2017share/share2.jpg',
                title: '我在吉胜科技2017年会等你，给我点赞领取红包'
            },
            {
                path: 'home.html',
                img: 'http://img.96ni.net/upload/portal/js2017share/share3.jpg',
                title: '吉胜科技2017年会直播进行中，为我点赞领取红包'
            }
        ];

    var SHARE_TITLE = default_share.title,
        IMG_URL_SHARE = default_share.img,
        SHARE_URL = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx05e5ec97691b7a68&redirect_uri=http://1.96ni.net/nianhui-web/weixin/userLogin.do&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';

    var url_path = window.location.pathname;
    for (var i = shares.length - 1; i >= 0; i--) {
        if(url_path.indexOf(shares[i].path) >= 0) {
            SHARE_TITLE = shares[i].title;
            IMG_URL_SHARE = shares[i].img;
            break;
        }
    }

    wx.ready(function() {
        // 隐藏菜单
        wx.hideMenuItems({
            menuList: [
                'menuItem:share:qq', 
                'menuItem:share:weiboApp', 
                'menuItem:favorite',
                'menuItem:share:facebook', 
                'menuItem:share:QZone',
                'menuItem:editTag',
                'menuItem:copyUrl',
                'menuItem:readMode',
                'menuItem:openWithQQBrowser',
                'menuItem:openWithSafari',
                'menuItem:share:email',
                'menuItem:share:brand'
            ]
        });

        // 分享到朋友圈
        wx.onMenuShareTimeline({
            title: SHARE_TITLE,
            link: SHARE_URL, 
            imgUrl: IMG_URL_SHARE
        });

        // 分享给朋友
        wx.onMenuShareAppMessage({
            title: SHARE_TITLE,
            desc: '感恩过往 . 聚力前行',
            link: SHARE_URL,
            imgUrl: IMG_URL_SHARE,
            type: 'link'
        });

    });

    function init() {
        route('/weixin/getJsTicket.html', {params: {url: window.location.href.split('#')[0]}}, function(response) {
            if(! response) {
                return;
            }

            wx.config({
                debug: false,
                appId: response.data.appId,
                timestamp: response.data.timestamp,
                nonceStr: response.data.nonceStr,
                signature: response.data.signature,
                jsApiList: ['hideMenuItems', 'onMenuShareTimeline', 'onMenuShareAppMessage']
            });
        });
    }

    init();

}, window));