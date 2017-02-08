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

    var USER_IDE = comm.getCache(_c.CACHE_USER_IDE);

    vue.directive('focus', {
      inserted: function (el) {
        el.focus();
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
                is_manager: Number(comm.getCache(_c.CACHE_USER_DELETE)) === 1,
                is_staff: USER_IDE === _c.USER_IDE_STAFF, // 员工
                is_friend: USER_IDE === _c.USER_IDE_FRIEND, // 亲友
                is_guest: USER_IDE === _c.USER_IDE_GUEST, // 嘉宾
                is_visitor: USER_IDE === _c.USER_IDE_VISITOR // 访客
            },
            add_comment: {
                show: false,
                content: '',
                team_id: ''
            },
            is_follow_team: false, // 是否可以点赞团队
            team_list: [],
            preview_img: {
                show: false,
                img: null
            }
        },
        methods: {
            deleteComment: function(team_id) {
                app.deleteComment(team_id);
            },
            addComment: function(team_id, event) {
                if(team_id) { // show input
                    this.add_comment = {show: true, team_id: team_id, content: ''};
                    return;
                }

                // add comment
                if(this.add_comment.content === '') {
                    this.add_comment.team_id = '';
                }
                else {
                    app.addComment();
                }

                $('#comment_content').blur();
                this.add_comment.show = false;
            },
            toggleComment: function(team_id) {
                var item = app.findItemById(team_id);
                if(! item) {
                    return;
                }

                item.hide_comment = ! item.hide_comment;
            },
            supportTeam: function(team_id) {
                var item = app.findItemById(team_id);
                if(! item) {
                    return;
                }

                if(window.confirm('确定要支持' + item.name + '吗？')) {
                    app.supportTeam(team_id);
                }
            },
            previewImg: function(img) {
                this.preview_img.img = img;
                this.preview_img.show = true;
            }
        }
    });

    var app = {
        findItemById: function(id) {
            for(var i = 0, len = vm.team_list.length; i < len; i++) {
                if(vm.team_list[i].id === id) {
                    return vm.team_list[i];
                }
            }

            return false;
        },
        isFollowTeam: function(callback) {
            route('/user/checkUserFollowTeam.html', {}, function(response, error) {
                if(! response) {
                    // alert(error);
                    return;
                }

                if(response.data === -1) { // -1表示没有点赞团队
                    vm.is_follow_team = true;
                }
                else if(response.data === -2) { // 点赞通道关闭
                    vm.is_follow_team = false;
                }

                if(callback) {
                    callback();
                }
            });
        },
        supportTeam: function (id) {
            route('/user/followTeam.html', {params: {id: id}}, function(response, error) {
                if(! response) {
                    alert(error || '支持失败');
                    return;
                }

                // app.init(); // reload the page
                window.location.reload(true);
            });
        },
        deleteComment: function(id) {
            if(! id) {
                return;
            }

            route('/team/deleteComment.html', {params: {id: id}}, function(response, error) {
                if(! response) {
                    alert(error || '删除失败');
                    return;
                }

                app.init(); // reload the page
            });
        },
        addComment: function() {
            var _this = this;

            route('/team/addComment.html', {
                params: {
                    id: vm.add_comment.team_id, 
                    content: vm.add_comment.content
                }
            }, function(response, error) {
                if(! response) {
                    alert(error || '发送评论失败');
                    return;
                }

                var item = _this.findItemById(vm.add_comment.team_id);
                if(item) {
                    item.commentList.unshift({id: 0, content: vm.add_comment.content, userName: '我', show: true});
                }

                vm.add_comment.team_id = '';
                vm.add_comment.content = '';
            });
        },
        initList: function() {
            route('/team/findTeamList.html', {params: {type: 1}}, function(response) {
                comm.loading('hide');

                if(! response) {
                    return;
                }

                vm.team_list = _set(response.data.list);
            });

            function _set(list) {
                for (var i = 0; i < list.length; i++) {
                    list[i].pic = (list[i].pic && list[i].pic !== '') ? list[i].pic.split(',') : [];

                    list[i].hide_comment = true;
                    list[i].hide_comment_count = list[i].commentList.length - 1;

                    if(list[i].commentList && list[i].commentList.length) {
                        list[i].commentList[0].show = true;
                    }
                }

                return list;
            }
        },
        init: function() {
            this.isFollowTeam(this.initList);
            vm.init.show = true;
        }
    };

    app.init();

});