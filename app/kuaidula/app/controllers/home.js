var express = require("express"),
    router = express.Router(),
    mongoose = require("mongoose"),
    Article = mongoose.model("Article");
var ObjectId = mongoose.Types.ObjectId; 

// seed
var env = process.env.NODE_ENV || "development";
if (env == "development" || false) {
    Article.find({}).remove(function() {
        Article.create({
            title: "盘点2014中国高铁出海记:李克强亲自拧螺丝",
            keywords: ["高铁", "李克强"],
            paragraphs: [{
                sentences: [{
                    words: ["高铁", "已经", "成为", "一张", "新的", "中国", "外交", "名片", "。"]
                }, {
                    words: ["2014", "年", "，", "中国", "高铁", "的", "走出去", "之路", "一路高歌", "。"]
                }, {
                    words: ["有着", "\"", "超级", "高铁", "推销员", "\"", "和", "\"", "最强", "营销", "总监", "\"", "等", "美称", "的", "李克强", "总理", "，", "向", "外方", "推荐", "中国", "高铁", "几乎", "成了", "其", "出访", "的", "必做", "功课", "，", "这", "同时", "也", "体现", "了", "中国", "政府", "对", "高铁", "走向", "国际", "市场", "的", "决心", "和", "信心", "。"]
                }]
            }, {
                sentences: [{
                    words: ["据", "《中国", "经济", "周刊》", "不完全", "统计", "，", "2014", "年", "李克强", "总理", "已", "向", "12", "个", "国家", "表达", "了", "合作", "建设", "高铁", "的", "意愿", "。"]
                }, {
                    words: ["在", "中国", "高端", "装备", "制造业", "遭遇", "世界", "经济", "危机", "和", "面临", "其他", "国家", "的", "激烈", "竞争", "之际", "，", "高铁", "的", "出现", "成为", "中国", "制造", "转型", "升级", "的", "一大", "亮点", "。"]
                }, {
                    words: ["中国", "高铁", "企业", "频频", "斩获", "海外", "大单", "，", "中国", "南车", "和", "中国", "北车", "海外", "订单", "的", "连续", "增长", "已", "成为", "中国", "高铁", "开往", "世界", "的", "佐证", "。"]
                }, {
                    words: ["两家", "企业", "2014", "年", "上半年", "的", "出口", "签约", "额", "总计", "已达", "45", "亿", "美元", "以上", "。"]
                }]
            }],
            url: "http://news.sina.com.cn/c/2015-01-03/130731355265.shtml",
            time: 1420298104,
            censored: true
        });
        console.log("hello");
    });
}

module.exports = function(app) {
    app.use("/", router);
};

router.get("/", function(req, res, next) {

    Article.find(function(err, articles) {
        if (err) return next(err);
        res.render("index", {
            title: "Welcome to Kuaidula App, :-)",
        });
    });
});

// APIs

router.get("/0.1/articles/:filter", function(req, res, next) {
    var filter = req.params["filter"];
    console.log("requesting article: " + filter);
    if (filter == "all") {
        Article.find({
            censored: true
        }, function(err, articles) {
            if (err) return next(err);
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                articles: articles
            }));
        });
    } else if (filter == "uncensored") {
        Article.find({
            censored: false
        }, function(err, articles) {
            if (err) return next(err);
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                articles: articles
            }));
        });
    } else {
        res.status(404) // HTTP status 404: NotFound
            .send("Not found");
    }
});

router.get("/0.2/articles/:filter/:startid/:endid", function(req, res, next) {
    var filter = req.params["filter"];
    var startid = req.params["startid"];
    var endid = req.params["endid"];
    console.log("requesting article: " + filter);
    console.log("start id: " + startid);
    console.log("end id: " + endid);
    var queryConstraint = {};
    if (filter == "all") {
        queryConstraint["censored"] = true;
    } else if (filter == "uncensored") {
        queryConstraint["censored"] = false;
    } else {
        res.status(404) // HTTP status 404: NotFound
            .send("Not found");
        return;
    }
    var query = Article.find(queryConstraint);
    if (startid != 0) {
        query.where("_id").gte(startid);
    } 
    if (endid != "0") {
        query.where("_id").lte(endid);
    }
    query.sort("-_id");
    query.limit(50);
    query.exec(function(err, articles) {
        if (err) return next(err);
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            articles: articles
        }));
    });
});

router.post("/0.1/articles", function(req, res, next) {
    article = req.body.article;
    article['censored'] = false;
    console.log(article);
    Article.create(article);
    res.end('1');
});

router.get("/0.1/article/:id/comments", function(req, res, next) {
    var id = req.params["id"];
    Article.findById(id, function(err, article) {
        if (err) return next(err);
        if (!article) {
            res.writeHead(500);
            res.end();
            return;
        }
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            comments: article.comments
        }));
    });
});

router.post("/0.1/article/:id/comments", function(req, res, next) {
    var id = req.params["id"];
    Article.findById(id, function(err, article) {
        if (err) return next(err);
        if (!article) {
            res.writeHead(500);
            res.end();
            return;
        }
        article.comments.push(req.body);
        article.save(function(err) {
            if (err) res.writeHead(500);
            else {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    comments: article.comments
                }));
            }
        });
    });
});

router.get("/0.1/reset", function(req, res, next) {
    Article.find({}).remove(function() {
        res.end('reset');
        console.log("hello");
    });
});