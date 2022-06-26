var chargeCenter = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

//const dailyJobsTag = "薅羊毛充话费每日任务";

chargeCenter.dailyJobs = [];
//chargeCenter.dailyJobs.push(dailyJobsTag);

//进入充值中心
gotoChargeCenter = function () {
    log("gotoChargeCenter");
    var recommendBtn = packageName(common.destPackageName).desc("推荐双击切换到已选中状态").findOne(30000);
    if (recommendBtn == null) {
        toastLog("推荐 not exist");
        return false;
    }

    var channelList = packageName(common.destPackageName).className("android.support.v7.widget.RecyclerView").depth(16).drawingOrder(4).indexInParent(4).findOne(30000);
    if (channelList == null) {
        toastLog("频道列表 not exist");
        return false;
    }

    var chargeCenterBtn = null;
    for (var i = 0; i < 2; i++) {
        chargeCenterBtn = packageName(common.destPackageName).desc("充值中心").visibleToUser(true).findOne(1000);
        if (chargeCenterBtn != null) {
            break;
        }
        swipe(35, channelList.bounds().centerY(), 685, channelList.bounds().centerY(), 1000);
        sleep(1000);    
    }

    if (chargeCenterBtn == null){
        toastLog("充值中心 not exist");
        return false;
    }

    var clickRet = chargeCenterBtn.click();
    log("点击 充值中心: " + clickRet);
    if (clickRet == false) {
        return false;
    }

    var bonusTips = common.waitForText("text", "薅羊毛 赚话费", true, 15);
    if (bonusTips == null) {
        return false;
    }

    sleep(5000);
    var bonusBtn = text("薅羊毛 继续赚").findOne(1000);
    if (bonusBtn == null) {
        return false;
    }

    clickRet = bonusBtn.click();
    log("点击 薅羊毛 继续赚: " + clickRet);
    sleep(10000);
    return clickRet;
}

//弹窗饲料任务
doFeedPopupTask = function () {
    var doubleSignInBonusBtn = text("逛店立翻2.5倍，领500g").findOne(1000);
    if (doubleSignInBonusBtn != null) {
        log("点击 逛店立翻2.5倍，领500g: " + doubleSignInBonusBtn.click() + ", 并等待20s后返回");
        sleep(20000);
        back();
        sleep(3000);
    } else {
        var signInBonusBtn = text("领200g饲料").findOne(1000);
        if (signInBonusBtn != null) {
            log("点击 领200g饲料: " + signInBonusBtn.click());
            sleep(2000);    
        }
    }

    //饲料任务弹窗，要做，不在每日任务列表中
    var feedTaskBtn = text("立即前往").findOne(1000);
    if (feedTaskBtn != null) {
        log("点击 立即前往: " + feedTaskBtn.click() + ", 并等待20s后返回");
        sleep(20000);
        commonAction.backToFeedTaskList("幸运扭蛋");
    }    
}

//签到奖励
getSignInBonus = function () {
    var signInBonusTips = text("签到奖励").findOne(1000);
    if (signInBonusTips != null) {
        var signInBonusBtn = signInBonusTips.parent().parent();
        if (signInBonusBtn.childCount() == 2) {
            var nextSignInBonusTips = signInBonusBtn.child(signInBonusBtn.childCount() - 1);
            log("签到奖励 剩余时间: " + nextSignInBonusTips.text());
            if (/\d+:\d+:\d+刷新/.test(nextSignInBonusTips.text())) {
                var HHmmss = nextSignInBonusTips.text().match(/\d+/g);
                if (HHmmss.length == 3) {
                    log(parseInt(HHmmss[0]) + ", " + parseInt(HHmmss[1]) + ", " + parseInt(HHmmss[2]));
                    var newNextSignInBonusCheckTS = new Date().getTime() + (parseInt(HHmmss[0]) * 3600 + parseInt(HHmmss[1]) * 60 + parseInt(HHmmss[2])) * 1000;
                    common.safeSet(common.nextChargeCenterSignInBonusTimestampTag, newNextSignInBonusCheckTS);
                    log(common.nextChargeCenterSignInBonusTimestampTag + " 设置为: " + common.timestampToTime(newNextSignInBonusCheckTS) + ", " + newNextSignInBonusCheckTS);
                } else {
                    log("HHmmss: " + HHmmss);
                }
            }
        } else {
            log("点击 签到奖励: " + signInBonusBtn.click());
            var newNextSignInBonusCheckTS = new Date().getTime() + 24 * 3600 * 1000;
            common.safeSet(common.nextChargeCenterSignInBonusTimestampTag, newNextSignInBonusCheckTS);
            log(common.nextChargeCenterSignInBonusTimestampTag + " 设置为: " + common.timestampToTime(newNextSignInBonusCheckTS) + ", " + newNextSignInBonusCheckTS);
            sleep(1000);
        }
    }
}

//收取退休羊兼职饲料
getPartTimeFeed = function () {
    var partTimeBonusTips = text("装满啦...").findOne(1000);
    if (partTimeBonusTips != null) {
        log("收取 兼职饲料: " + partTimeBonusTips.parent().parent().click());
        sleep(1000);
    }    
}

getProgressTips = function () {
    var levelTips = textMatches(/LV\.\d+/).findOne(1000);
    if (levelTips != null) {
        log("羊等级: " + levelTips.text());
        // var tmp = levelTips.parent().parent().parent();
        // // var progressTips = textMatches(/再喂.*可薅充值金/).findOne(1000);
        // var progressTips = tmp.child(7).child(1);
        // if (progressTips != null) {
        //     log("喂养进度: " + progressTips.text());
        //     return progressTips.text();
        // }
        var progressTips = textMatches(/.*可薅充值金/).findOne(1000);
        if (progressTips != null) {
            log("喂养进度: " + progressTips.text());
            return progressTips.text();
        }
    }

    return "";
}

//获取操作栏按钮
getActionBtns = function () {
    var result = {};
    result.LuckyEggBtn = null;
    result.LuckyEggLimit = 0;
    result.StealFeedBtn = null;
    result.GetFeedBtn = null;
    result.FeedBtn = null;
    result.FeedLimit = 0;
    result.FeedGrams = 0;

    var luckyEggTips = text("幸运扭蛋").findOne(1000);
    if (luckyEggTips == null) {
        return result;
    }

    var actionBar = luckyEggTips.parent();
    var idx = 0;
    if (actionBar.child(0).childCount() == 1) {
        result.LuckyEggLimit = parseInt(actionBar.child(0).child(0).text());
        idx = 1;
    }
    log("idx: " + idx);
    result.LuckyEggBtn = actionBar.child(idx);
    result.StealFeedBtn = actionBar.child(idx + 3);
    result.GetFeedBtn = actionBar.child(idx + 6);
    result.FeedBtn = actionBar.child(idx + 9);
    result.FeedLimit = parseInt(result.FeedBtn.child(0).child(0).child(0).text());
    result.FeedGrams = parseInt(result.FeedBtn.child(0).child(1).text());
    log("幸运扭蛋次数: " + result.LuckyEggLimit + ", 可喂养克数: " + result.FeedGrams + ", 可喂养次数: " + result.FeedLimit);

    return result;
}

//收饲料任务
doStealFeedTasks = function () {
    toastLog("收取好友饲料");
    for (;;) {
        var actionBtns = getActionBtns();
        var clickRet = actionBtns.StealFeedBtn.click();
        log("点击 收饲料: " + clickRet + ", 并等待 去收取 出现, 5s超时");

        var taskBtnName = common.waitForText("text", "去收取", true, 5);
        if (taskBtnName == null) {
            taskBtnName = text("去访问").findOne(1000);
            if (taskBtnName == null) {
                break;
            }

            var closeBtn = taskBtnName.parent().parent().parent().parent().parent().parent().parent().parent().child(1);
            var clickRet = closeBtn.click();
            log("点击 关闭 今日好友饲料列表: " + clickRet);
            sleep(3000);
            break;
        }

        var taskListFrame = taskBtnName.parent().parent().parent().parent().parent().parent().parent().parent();
        var closeBtn = taskListFrame.child(1);
        var taskListView = taskListFrame.child(2).child(0).child(0).child(0).child(0);
        for (var i = 0; i < taskListView.childCount(); i++) {
            var taskNode = taskListView.child(i);
            var name = taskNode.child(1).child(0).text();
            var tips = taskNode.child(1).child(1).text();
            var btn = taskNode.child(2).child(0);
            var leftFeed = "";
            for (var j = 2; j < taskNode.child(1).childCount(); j++) {
                leftFeed = leftFeed + taskNode.child(1).child(j).text();
            }
            log(name + " " + tips + " " + leftFeed);
            if (leftFeed != "+0g" && leftFeed != "") {
                clickRet = btn.click();
                log("点击 " + btn.text() + ": " + clickRet);
                sleep(10000);
                var bubbleTips = text("可收取").findOne(1000);
                if (bubbleTips != null) {
                    clickRet = bubbleTips.parent().click();
                    log("点击 " + bubbleTips.text() + ": " + clickRet);
                    sleep(2000);
                    var newNextStealFeedCheckTS = new Date().getTime() + 4 * 3600 * 1000;
                    common.safeSet(common.nextChargeCenterStealFeedTimestampTag, newNextStealFeedCheckTS);
                    log(common.nextChargeCenterStealFeedTimestampTag + " 设置为: " + common.timestampToTime(newNextStealFeedCheckTS) + ", " + newNextStealFeedCheckTS);
                }
                back();
                sleep(3000);
                break;
            }
        }

        if (i == taskListView.childCount()) {
            clickRet = closeBtn.click();
            log("点击 关闭 今日好友饲料列表: " + clickRet);
            sleep(3000);
            break;
        }

        clickRet = closeBtn.click();
        log("点击 关闭 今日好友饲料列表: " + clickRet);
        sleep(3000);
    }
    toastLog("完成 收取好友饲料");
}

doMerchantTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        sleep(5000);
        var chargeTips = common.waitForText("text", "购物送大额充值金", true, 10);
        if (chargeTips != null) {
            var merchantListParent = chargeTips.parent().parent();
            var merchantList = merchantListParent.child(merchantListParent.childCount() - 2);
            var swipeHeight = merchantList.child(2).bounds().top - merchantList.child(0).bounds().top;
            for (var k = 0; k < 5; k++) {
                var chargeTips = text("购物送大额充值金").findOne(1000);
                if (chargeTips == null) {
                    //回到任务列表
                    commonAction.backToFeedTaskList(tasklist[i].Title);
                    return ret;
                }
                var merchantListParent = chargeTips.parent().parent();
                var merchantList = merchantListParent.child(merchantListParent.childCount() - 2);
                var merchantNode = merchantList.child(k);
                log("点击 [" + (k+1) + "/" + (merchantList.childCount() - 1) + "]" + merchantNode.child(1).text() + ": " + merchantNode.click());
                sleep(5000);

                back();
                sleep(3000);

                if (k % 2 != 0) { //k为偶数点左侧商品，k为奇数点右侧商品并上划屏幕
                    log("上划屏幕: " + swipe(device.width / 2, Math.floor(device.height * 7 / 8), device.width / 2, Math.floor(device.height * 7 / 8) - swipeHeight, 500));
                    sleep(2000);
                }
            }

            //回到任务列表
            commonAction.backToFeedTaskList(tasklist[i].Title);
            ret = true;
            break;
        } else {
            if (textContains("逛好货得饲料").findOne(3000) == null) {
                //回到任务列表
                commonAction.backToFeedTaskList(tasklist[i].Title);
            }
        }
    }

    return ret;
}

doOneWalkTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        sleep(5000);

        common.waitForText("textContains", tasklist[i].Keyword, true, 15);
        sleep(20000);
        if (tasklist[i].Title.indexOf("直播") != -1) {
            sleep(5000);
        }

        commonAction.backToFeedTaskList(tasklist[i].Title);
        ret = true;
        break;
    }

    return ret;
}

doAppReactTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        sleep(3000);

        // var openAction = text("使用以下方式打开").findOne(1000);
        // if (openAction != null) {
        //     back();
        // }

        var btn = common.waitForText("text", tasklist[i].ActionName, true, 15);
        if (btn != null) {
            var curPkg = currentPackage();
            log("currentPackage(): " + curPkg);
            if (curPkg != common.destPackageName) {
                sleep(5000);
            } else {
                sleep(3000);
            }

            if (tasklist[i].Title.indexOf("领天猫无门槛红包") != -1) {
                var getBtn = text("立即领取").findOne(1000);
                if (getBtn != null) {
                    log("点击 立即领取: " + getBtn.click());
                    sleep(2000);
                    var useBtn = text("去使用").findOne(1000);
                    if (useBtn != null) {
                        log("点击 去使用: " + useBtn.click());
                        sleep(2000);
                    }
                }
            }

            var clickRet = click(btn.bounds().centerX(), btn.bounds().centerY());
            toastLog("点击 " + tasklist[i].ActionName + " (" + btn.bounds().centerX() + ", " + btn.bounds().centerY() + "): " + clickRet);
            sleep(2000);
            var confirmBtn = text("确定").findOne(1000);
            if (confirmBtn != null) {
                clickRet = confirmBtn.click();
                log("点击 确定: " + clickRet);
                if (clickRet == false) {
                    commonAction.backToFeedTaskList(tasklist[i].Title);
                    break;
                }
                sleep(1000);
            }
            sleep(tasklist[i].Timeout * 1000);
        } else {
            var clickRet = click(device.width / 2, device.height / 2);
            toastLog("点击 " + tasklist[i].ActionName + " (" + (device.width / 2) + ", " + (device.height / 2) + "): " + clickRet);
            sleep(2000);
            var confirmBtn = text("确定").findOne(1000);
            if (confirmBtn != null) {
                clickRet = confirmBtn.click();
                log("点击 确定: " + clickRet);
                if (clickRet == false) {
                    commonAction.backToFeedTaskList(tasklist[i].Title);
                    break;
                }
                sleep(1000);
            }
            sleep(tasklist[i].Timeout * 1000);
        }

        commonAction.backToFeedTaskList(tasklist[i].Title);
        ret = true;
        break;
    }

    return ret;
}

doUCTask = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        sleep(5000);

        //等待UC浏览器出现
        var tips = common.waitForText("text", "UC浏览器", true, 15);
        if (tips != null) {
            sleep(2000);
            var btn = tips.parent().parent().child(0).child(2);
            var clickRet = click(btn.bounds().centerX(), btn.bounds().centerY());
            log("点击 马上领取: " + clickRet);
            sleep(1000);
            var confirmBtn = text("确定").findOne(1000);
            if (confirmBtn != null) {
                clickRet = confirmBtn.click();
                log("点击 确定: " + clickRet);
                if (clickRet == false) {
                    commonAction.backToFeedTaskList(tasklist[i].Title);
                    break;
                }
                sleep(1000);
            }
            sleep(tasklist[i].Timeout * 1000);
        }

        commonAction.backToFeedTaskList(tasklist[i].Title);
        ret = true;
        break;
    }

    return ret;
}

//领饲料任务
doGetFeedTasks = function () {
    var startTick = new Date().getTime();
    for (;;) {
        var actionBtns = getActionBtns();
        var clickRet = actionBtns.GetFeedBtn.click();
        log("点击 喂饲料: " + clickRet + ", 并等待 做任务赢奖励 出现, 15s超时");
    
        sleep(3000);
        var taskListTips = common.waitForText("text", "做任务赢奖励", false, 15);
        var taskListFrame = taskListTips.parent();
        var closeBtn = taskListFrame.child(1);
        var taskListView = taskListFrame.child(taskListFrame.childCount() - 2).child(1);

        //每日饲料奖励
        var dailyBonusBtn = taskListView.child(6);
        log("每日饲料奖励: " + dailyBonusBtn.text());
        if (dailyBonusBtn.text() != "已领取") {
            log("点击 每日饲料奖励 " + dailyBonusBtn.text() + ": " + dailyBonusBtn.click());
            sleep(1000);
        }

        var totalTasks = [];
        for (var i = 7; i < taskListView.childCount(); i++) {
            var taskNode = taskListView.child(i);
            if (taskNode.childCount() == 2) {
                var taskItem = {};
                taskItem.Title = taskNode.child(0).child(0).text();
                taskItem.Tips = taskNode.child(0).child(1).child(0).text();
                taskItem.BtnName = taskNode.child(1).text();
                taskItem.Button = taskNode.child(1);
                taskItem.Timeout = 15;
                if (taskItem.Button.bounds().height() > 50) {
                    totalTasks.push(taskItem);
                }
            }
        }
        toastLog("任务数: " + (taskListView.childCount() - 7 + 1) + ", 可见: " + totalTasks.length);
        if (totalTasks.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        var doneTaskList = [];  //已完成的任务，领取就行
        var oneWalkTaskList = [];  //逛逛会场、关注商品任务列表，待够时间回来
        var merchantWalkTaskList = [];  //逛5个商品
        var appReactTaskList = [];  //需要在另外场景操作
        var ucTaskList = [];    //UC浏览器任务
        totalTasks.forEach(function (tv) {
            if (tv.BtnName == "领取奖励") {
                doneTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (tv.Tips.indexOf("点击5个商品") != -1) {
                if (tv.BtnName != "再逛逛") {
                    merchantWalkTaskList.push(tv);
                    log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
                } else {
                    log("跳过任务: " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
                }
            } else if (/登录支付宝芭芭农场.*|免费领鸡蛋.*|话费95折特惠充值.*|去饿了么领免费水果.*|通信大礼包限时.*|提款机分现金.*|逛首页好货.*|分享即可领饲料.*|去天猫汽车玩攒动力.*|去UC极速版领红包.*|逛精彩直播赢奖励.*|攒钻石兑1分购黄金.*|逛水果蔬菜.*|去膨胀红包.*/.test(tv.Title) || /来小黑盒.*/.test(tv.Tips)) {
                if (tv.Title.indexOf("分享即可领饲料") != -1) {
                    tv.Keyword = "淘友圈";
                } else {
                    tv.Keyword = "浏览";
                }
                oneWalkTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (/划蒜练功一次.*/.test(tv.Title)) {
                tv.ActionName = "练功升级";
                appReactTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (/跑图赢红包.*/.test(tv.Title)) {
                tv.ActionName = "训练";
                appReactTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (/去奇妙花园兑鲜花.*/.test(tv.Title)) {
                tv.ActionName = "下载打开APP";
                appReactTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (/领天猫无门槛红包.*/.test(tv.Title)) {
                tv.ActionName = "下载打开APP";
                tv.Timeout = 30;
                appReactTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (/领裹酱抽手机.*/.test(tv.Title)) {
                tv.ActionName = "去菜鸟0元领";
                appReactTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (/去闲鱼逛逛.*/.test(tv.Title)) {
                tv.ActionName = "马上去";
                appReactTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else if (/上UC领福利.*/.test(tv.Title)) {
                ucTaskList.push(tv);
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else {
                log("跳过任务: " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            }
        });

        var uncompleteTaskNum = doneTaskList.length + oneWalkTaskList.length + merchantWalkTaskList.length + appReactTaskList.length + ucTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            log("关闭 领饲料任务列表: " + closeBtn.click());
            sleep(3000);
            break;
        }
        
        if (doneTaskList.length != 0) {
            log("点击 " + doneTaskList[0].BtnName + ": " + doneTaskList[0].Button.click());
            sleep(2000);
            log("关闭 领饲料任务列表: " + closeBtn.click());
            sleep(3000);
            continue;
        }

        if (doMerchantTasks(merchantWalkTaskList)) {
            log("关闭 领饲料任务列表: " + closeBtn.click());
            sleep(3000);
            continue;
        }

        if (doOneWalkTasks(oneWalkTaskList)) {
            log("关闭 领饲料任务列表: " + closeBtn.click());
            sleep(3000);
            continue;
        }

        if (doAppReactTasks(appReactTaskList)) {
            log("关闭 领饲料任务列表: " + closeBtn.click());
            sleep(3000);
            continue;
        }

        if (doUCTask(ucTaskList)) {
            log("关闭 领饲料任务列表: " + closeBtn.click());
            sleep(3000);
            continue;
        }

        log("关闭 领饲料任务列表: " + closeBtn.click());
        sleep(3000);

        if (new Date().getTime() - startTick > 5 * 60 * 1000) {
            log("doGetFeedTasks timeout");
            break;
        }
    }
}

doFeedAndLuckyEgg = function () {
    toastLog("doFeedAndLuckyEgg");
    var actionBtns = getActionBtns();
    if (actionBtns.LuckyEggLimit == 0 && actionBtns.FeedLimit == 0) {
        return;
    }

    log("旧进度: " + getProgressTips());
    for (var i = 0; i < actionBtns.FeedLimit; i++) {
        log("点击 喂养: " + actionBtns.FeedBtn.click());
        sleep(2000);
        var newProgress = getProgressTips();
        log("新进度: " + newProgress);
        if (!/再喂.*可薅充值金/.test(newProgress)) {
            //养成，要剪羊毛了
            log("点击 剪羊毛: " + actionBtns.FeedBtn.click());
            sleep(2000);
            var continueBtn = text("继续喂羊，升级薅更多").findOne(1000);
            if (continueBtn != null) {
                log("点击 继续喂羊，升级薅更多: " + continueBtn.click());
                sleep(2000);
            }
        }
    }

    if (actionBtns.LuckyEggLimit > 0) {
        log("点击 幸运扭蛋: " + actionBtns.LuckyEggBtn.click());
        sleep(5000);

        var ruleTips = common.waitForText("text", "规则", true, 15);
        if (ruleTips == null) {
            return;
        }
        var rollBtnFrame = ruleTips.parent().child(ruleTips.parent().childCount() - 1);
        var rollTips = rollBtnFrame.child(rollBtnFrame.childCount() - 3);
        var rollBtn = rollBtnFrame.child(rollBtnFrame.childCount() - 2);
        var rollLimitStr = rollBtnFrame.child(rollBtnFrame.childCount() - 1).text();
        var rollLimit = 0;
        log("扭蛋次数: " + rollLimitStr);
        if (rollLimitStr != "") {
            var num = rollLimitStr.match(/\d+/);
            rollLimit = parseInt(num[0]);
        }

        for (var i = 0; i < rollLimit; i++) {
            var clickRet = click(rollBtn.bounds().centerX(), rollBtn.bounds().centerY());
            log("点击 扭大奖: " + clickRet);
            sleep(2000);

            var resultTips = common.waitForTextMatches(/再扭一颗试试吧|开心收下|立即使用/, true, 15);
            if (resultTips == null) {
                return;
            }
            var closeBtn = resultTips.parent().child(resultTips.parent().childCount() - 1);
            clickRet = closeBtn.click();
            log("点击 关闭: " + clickRet);
            sleep(2000);
        }

        if (rollTips.childCount() > 0) {
            var timeRemain = "";
            for (var i = 0; i < 8; i++) {
                timeRemain = timeRemain + rollTips.child(i).text();
                log("免费扭蛋剩余时间: " + timeRemain);
                var HHmmss = timeRemain.match(/\d+/g);
                if (HHmmss.length == 3) {
                    log(parseInt(HHmmss[0]) + ", " + parseInt(HHmmss[1]) + ", " + parseInt(HHmmss[2]));
                    var newNextFreeLuckyEggCheckTS = new Date().getTime() + (parseInt(HHmmss[0]) * 3600 + parseInt(HHmmss[1]) * 60 + parseInt(HHmmss[2])) * 1000;
                    common.safeSet(common.nextChargeCenterFreeLuckyEggTimestampTag, newNextFreeLuckyEggCheckTS);
                    log(common.nextChargeCenterFreeLuckyEggTimestampTag + " 设置为: " + common.timestampToTime(newNextFreeLuckyEggCheckTS) + ", " + newNextFreeLuckyEggCheckTS);
                } else {
                    log("HHmmss: " + HHmmss);
                }
            }
        }
        back();
        sleep(3000);
    }
}

chargeCenter.doChargeCouponDailyJobs = function () {
    toastLog("chargeCenter.doChargeCouponDailyJobs");
    if (!gotoChargeCenter()) {
        commonAction.backToAppMainPage();
        return;
    }

    doFeedPopupTask();

    getSignInBonus();

    getPartTimeFeed();

    doStealFeedTasks();

    doGetFeedTasks();

    doFeedAndLuckyEgg();

    commonAction.backToAppMainPage();
}

module.exports = chargeCenter;