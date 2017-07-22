var app = new Vue({
    el: "#record",
    data: {
        isload: false,
        baseImageUrl: "",
        pageNum: 1,
        pageSize: 8,
        list: [],
        isShowLoadMore: false,
        loading: false
    },
    methods: {
        getlist: function () {
            var self = this;
            server.ajax({
                url: "/frontUser/listExchangeRecord",
                data: {
                    pageNum: self.pageNum,
                    pageSize: self.pageSize,
                    frontUserId: localStorage.getItem("frontUserId")
                },
                beforeSend: function () {
                    $.showLoading();
                },
                success: function (result) {
                    self.baseImageUrl = result.data.baseImageUrl;
                    if (!result.data.list.length) {
                        $(document.body).destroyInfinite();
                    }
                    result.data.list.forEach(function (element) {
                        self.list.push(element);
                    }, this);
                    setTimeout(function () {
                        self.isload = true;
                        $.hideLoading();
                    }, 500)
                    self.loading = false;
                    self.isShowLoadMore = false;
                }
            })
        }
    },
    created: function () {
        var self = this;
        //是否有过期时间，如果有 则去比对是否过期.如果过期 则去授权登录.如果没有过期时间则直接授权登录
        if (localStorage.getItem("timeLimit") && localStorage.getItem("frontUserId")) {
            var nowDatetime = Math.floor(new Date().getTime() / 1000);
            if (nowDatetime > localStorage.getItem("timeLimit")) { //过期
                localStorage.clear();
                window.location.href = 'index.html';
            }
        } else {
            localStorage.clear();
            window.location.href = 'index.html';
        }
        server.getSignature();//微信接口权限校验
        this.getlist();
        // var iscrollBox='document.body';
        var self = this;
        $(document.body).infinite(100);

        $(document.body).infinite().on("infinite", function () {
            if (self.loading) return;
            self.loading = true;
            self.isShowLoadMore = true;
            self.pageNum++;
            self.getlist();
        });
    },
    filters: {
        status: function (text) {
            return text ? "已兑换" : "未兑换";
        }
    }
})