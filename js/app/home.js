require.config({
    baseUrl: './',
    paths: {
        jquery: 'lib/zepto.min',
    	vue: 'lib/vue',
        config: 'js/helper/config',
        comm: 'js/helper/comm',
        route: 'js/helper/route',
        iscroll: 'lib/iscroll/iscroll-probe',
        wxsdk: 'js/helper/wxsdk'
    },
    shim: {
        jquery: {
            exports: '$'
        }
    }
});

define(['jquery', 'vue', 'config', 'comm', 'route', 'iscroll', 'wxsdk'], function($, vue, _c, comm, route) {

'use strict';
    
    var USER_IDE = comm.getCache(_c.CACHE_USER_IDE);

    var main_scroll = null,
        $pull_down = null;

    comm.tplBottomMenu(vue); // init bottom menu template
    comm.showTip(vue);

    vue.directive('focus', {
      update: function (el) {
        el.focus();
      }
    });

    var vm = new vue({
        el: '#vm-main',
        data: {
            init: {
                show: false,
                video: '',
                liveing: false,
                banner: null,
                banner_href: null,
            },
            user: {
                id: comm.getCache('userId'),
                is_manager: Number(comm.getCache(_c.CACHE_USER_DELETE)) === 1,
                is_staff: USER_IDE === _c.USER_IDE_STAFF, // 员工
                is_friend: USER_IDE === _c.USER_IDE_FRIEND, // 亲友
                is_guest: USER_IDE === _c.USER_IDE_GUEST, // 嘉宾
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR // 访客
            },
            team: {
                modal_face_show: false
            },
            add_comment: {
                show: false,
                content: '',
                program_id: ''
            },
            scoring: { // 打分
                id: null,
                show: false,
                ok: true,
                score: '' // 多少分
            },
            program_list: [],
            preview_img: {
                show: false,
                img: null
            },
            tip: {
                show: false,
                msg: ''
            }
        },
        methods: {
            showExplain: function() {
                app.tip('<div style="text-align: left;">节目总分由场外点赞和场内评分两部分组成：<br />1. 节目开始后场内场外观众即可参与节目评分； <br />2. 节目表演结束后3分钟评分通道关闭。</div>');
            },
            showLive: function() {
                this.init.video = '<iframe frameborder="0" scrolling="no" src="https://m.douyu.com/759618"></iframe>';
                this.init.liveing = 'show';
            },
            showScoring: function(id) {
                this.scoring.id = id;
                this.scoring.show = true;
                this.scoring.ok = true;
                this.scoring.score = '';
            },
            saveScoring: function() { // 节目评分
                var _this = this,
                    score = this.scoring.score;

                if(score === '' || ! /^[-]{0,1}[0-9]{1,}$/.test(score)) {
                    this.scoring.ok = false;
                    return;
                }

                if(score < 60 || score > 100) {
                    this.scoring.ok = false;
                    return;
                }
                this.scoring.ok = true;

                var params = {score: score, id: this.scoring.id};
                route('/program/scoreProgram.html', {params: params}, function(response, error) {
                    _this.scoring.score = '';
                    _this.scoring.id = null;
                    _this.scoring.show = false;

                    if(! response) {
                        app.tip(error);
                        return;
                    }
                    
                    app.getProgramList(); // reset list
                });
            },
            toggleComment: function(id) {
                var item = app.getListItem(id);
                if(! item) {
                    return;
                }

                item.hide_comment = ! item.hide_comment;                
            },
            addComment: function(program_id, event) {
                if(program_id) { // show input
                    this.add_comment = {show: true, content: '', program_id: program_id};
                    return;
                }
                
                // add comment
                if(this.add_comment.content === '') {
                    this.add_comment.program_id = '';
                }
                else {
                    app.addComment();
                }

                $('#comment_content').blur();
                this.add_comment.show = false;
            },
            deleteComment: function(comment_id) {
                if(! comment_id) {
                    app.tip('没有评论id');
                    return;
                }

                app.deleteComment(comment_id);
            },
            addSupport: function(program_id) {
                if(! program_id) {
                    return;
                }

                app.addSupport(program_id);
            },
            previewImg: function(img) {
                this.preview_img.img = img;
                this.preview_img.show = true;
            }
        },
        updated: function() {
            if(main_scroll !== null) {
                setTimeout(function () {
                    main_scroll.refresh();
                }, 100);
                return;
            }

            var is_reload = false,
                $pull_down = $('#pull-down');

            main_scroll = new IScroll('#fixed-main', {
                mouseWheel: true,
                click: true,
                probeType: 3
            });

            main_scroll.on('scrollStart', function() {
                if(this.y < 5 && this.y >= 0) {
                    $pull_down.text('下拉刷新...').show();
                }
                else {
                    $pull_down.hide();
                }
            });

            main_scroll.on('scroll', function() {
                if(this.y > 50) {
                    $pull_down.text('松开自动刷新');

                    is_reload = true;
                }
            });

            main_scroll.on('scrollEnd', function() {
                if(this.y < 5 && is_reload) {
                    window.location.reload(true);
                }
            });
        }
    });

    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);


    var app = {
        tip: function(msg) {
            vm.tip = {show: true, msg: msg};
        },
        findItemById: function(id) {
            for(var i = 0, len = vm.program_list.length; i < len; i++) {
                if(vm.program_list[i].id === id) {
                    return vm.program_list[i];
                }
            }

            return false;
        },
        setBannerRank: function(status) { // 第一个节目
            if(status > 0) {
                vm.init.liveing = true;
            }

            if(status === 3) { // 团队排名
                vm.init.banner = 'images/home/banner-2.jpg';
                vm.init.banner_href = './rank-team.html';

                comm.setCache(_c.CACHE_SHOW_TEAM_FACE_RANK, 'no');
            }
            else { // 颜值排名
                vm.init.banner = 'images/home/banner-1.jpg';
                vm.init.banner_href = './rank-team-face.html';
            }

            // 弹窗提示 颜值排名(只出现一次)
            if(! comm.getCache(_c.CACHE_SHOW_TEAM_FACE_RANK)) {
                vm.team.modal_face_show = true;
                comm.setCache(_c.CACHE_SHOW_TEAM_FACE_RANK, 'no');
            }
        },
        addComment: function() {
            var _this = this;

            route('/team/addComment.html', {
                params: {
                    id: vm.add_comment.program_id, 
                    content: vm.add_comment.content
                }
            }, function(response, error) {
                if(! response) {
                    app.tip(error || '发送评论失败');
                    return;
                }

                var item = _this.findItemById(vm.add_comment.program_id);
                if(item) {
                    item.commentList.unshift({id: 0, content: vm.add_comment.content, userName: '我', show: true});
                }

                vm.add_comment.program_id = '';
                vm.add_comment.content = '';                
            });
        },
        deleteComment: function(id) {
            route('/team/deleteComment.html', {params: {id: id}}, function(response, error) {
                if(! response) {
                    app.tip(error || '删除失败');
                    return;
                }

                window.location.reload(true);
            });
        },
        addSupport: function(program_id) {
            var _this = this;

            route('/user/followTeam.html', {params: {id: program_id}}, function(response, error) {
                if(! response) {
                    app.tip(error);
                    return;
                }

                var item = _this.findItemById(program_id);
                if(item) {
                    item.followFlag = 1; // 已点赞
                    item.followNum++;

                    if(item.followName && item.followName != '') {
                        item.followName = '我,' + item.followName;
                    }
                    else {
                        item.followName = '我';
                    }
                }
            });
        },
        getListItem: function(id) {
            for(var i = 0, len = vm.program_list.length; i < len; i++) {
                if(vm.program_list[i].id === id) {
                    return vm.program_list[i];
                }
            }

            return false;
        },
        getProgramList: function() {
            var _this = this;

            route('/program/findProgramList.html', {}, function(response) {
                comm.loading('hide');

                if(! response) {
                    return;
                }

                vm.program_list = _set(response.data.list || []);
            });

            function _set(list) {
                var hide_comment_count = 0;

                for(var i = 0, len = list.length; i < len; i++) {
                    list[i].no = i < 9 ? ('0' + (i + 1)) : (i + 1);
                    list[i].pic = (! list[i].pic || list[i].pic === '') ? [] : list[i].pic.split(',');
                    list[i].teamKey = comm.getTeamKey(list[i].teamName);

                    list[i].hide_comment = true;
                    list[i].hide_comment_count = list[i].commentList.length - 1;

                    if(list[i].commentList && list[i].commentList.length) {
                        list[i].commentList[0].show = true;
                    }

                    if(i === 0) { // 根据第一个节目，显示团队排名banner
                        _this.setBannerRank(list[i].status);
                    }
                }

                return list;
            }
        },
        init: function() {
            vm.init.show = true;
            this.getProgramList();
        }
    };

    app.init();

});