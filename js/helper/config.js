;(function (factory, window) {
    if (typeof define === 'function' && define.amd) {
        define('config', factory);
    }
    else {
        window._c = factory();
    }
}
(function() {

    return {
        BEGIN_DAY: '2017-01-21',
        HOST_IMG: '/',
        USER_IDE_STAFF: 'staff',
        USER_IDE_FRIEND: 'friend',
        USER_IDE_GUEST: 'guest',
        USER_IDE_VISITOR: 'visitor',
        CACHE_USER_IDE: 'user_ide',
        CACHE_USER_DELETE: 'user_deleteflag',
        CACHE_LIGHTING: 'am_lighting', // 年会点灯
        CACHE_SHOW_TEAM_FACE_RANK: 'show_team_face_rank',
        CACHE_LAST_DAY: 'last_day',
        CARDS: {
            '加成卡': {img: 'jiachengka'},
            '5年陈卡': {img: '5nianchen'},
            '1+1卡': {img: '11'},
            '查封卡': {img: 'chafeng'},
            '单身卡': {img: 'danshen'},
            '购物卡': {img: 'gouwu'},
            '均富卡': {img: 'junfu'},
            '抢救卡': {img: 'qiangqiu'},
            '情侣卡': {img: 'qinglv'},
            '亲子卡': {img: 'qinzi'},
            '双倍卡': {img: 'shuangbei'},
            '税收卡': {img: 'shuishou'},
            '小蜜蜂卡': {img: 'xiaomifeng'},
            '长辈卡': {img: 'zhangbei'},
            '粘贴卡': {img: 'zhantie'},
            '置换卡': {img: 'zhihuan'},
            '平安卡': {img: 'pingan'}
        }
    };

}, window));