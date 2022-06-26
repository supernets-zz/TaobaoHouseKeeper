var vegetables = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "天天领鸡蛋每日签到";
const signInBonusTag = "天天领鸡蛋点击领取";
const getFeedTag = "天天领鸡蛋领饲料任务";
const lotteryTag = "天天领鸡蛋抽奖任务";

vegetables.dailyJobs = [];
vegetables.dailyJobs.push(signInTag);

//进入天天领鸡蛋
gotoFreeEggs = function () {
    log("gotoVegetables");
    var recommendBtn = packageName(common.destPackageName).desc("推荐双击切换到已选中状态").findOne(30000);
    if (recommendBtn == null) {
        toastLog("推荐 not exist");
        return null;
    }

    var taocaicai = packageName(common.destPackageName).desc("淘菜菜").findOne(1000);
    if (taocaicai == null) {
        toastLog("淘菜菜 not exist");
        return null;
    }

    var clickRet = taocaicai.parent().click();
    log("点击 淘菜菜: " + clickRet);
    if (clickRet == false) {
        return null;
    }

    var freeEggsTips = common.waitForText("text", "天天领鸡蛋", true, 15);
    if (freeEggsTips == null) {
        return null;
    }

    sleep(3000);
    // clickRet = freeEggsTips.parent().click();
    clickRet = click(freeEggsTips.parent().bounds().centerX(), freeEggsTips.parent().bounds().centerY());
    toastLog("点击 天天领鸡蛋: " + clickRet);
    if (clickRet == false) {
        return null;
    }

    sleep(2000);
    var collectEggsTips = common.waitForText("textContains", "集满4枚可兑换", true, 30);
    if (collectEggsTips == null) {
        return null;
    }

    //每日领取collectEggsTips.parent().child(最后一个)
    //进度collectEggsTips.parent().child(倒数第三个).child(1开始到最后)
    //领饲料collectEggsTips.parent().parent().parent().child(倒数第三个).child(0)
    //抽奖collectEggsTips.parent().parent().parent().child(倒数第三个).child(1)
    //喂一次collectEggsTips.parent().parent().parent().child(倒数第三个).child(2)，克数在最后一个子节点
    //喂多次collectEggsTips.parent().parent().parent().child(倒数第三个).child(3)，次数在child(1) x1
    return collectEggsTips.parent();
}

doOneWalkTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        var startTick = new Date().getTime();
        sleep(5000);
    
        for (;;) {
            swipe(device.width / 5, device.height * 13 / 16, device.width / 5, device.height * 11 / 16, Math.floor(Math.random() * 200) + 200);
            var completeTips = text("浏览完成").findOne(1000);
            if (completeTips != null) {
                break;
            }
    
            if (new Date().getTime() - startTick > tasklist[i].Timeout * 1000) {
                log("doOneWalkTasks timeout");
                break;
            }
        }
    
        commonAction.backToFeedTaskList(tasklist[i].Title);
    
        var getItBtn = text("我收下了").findOne(1000);
        if (getItBtn != null) {
            log("点击 我收下了: " + getItBtn.click());
            sleep(1000);
        }
        break;
    }

    return ret;
}

doLottery = function (actionBar) {
    log("vegetables.doLottery");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + lotteryTag);
    if (done != null) {
        log(lotteryTag + " 已做: " + done);
        return;
    }

    toast("vegetables.doLottery");
    var lotteryBtn = actionBar.child(1);
    var clickRet = lotteryBtn.click();
    if (!clickRet) {
        toastLog("点击 抽奖: " + clickRet);
        return;
    }

    log("点击 抽奖: " + clickRet + ", 并等待 /.*每次消耗20g饲料|今日抽奖机会已用完明天再来吧/ 出现");
    var lotteryTips = common.waitForTextMatches(/.*每次消耗20g饲料|今日抽奖机会已用完明天再来吧/, true, 5);
    if (lotteryTips == null) {
        return;
    }

    if (lotteryTips.text().indexOf("每次消耗20g饲料") != -1) {
        //var closeBtn = lotteryTips.parent().parent().child(lotteryTips.parent().parent().childCount() - 1);
        var count = parseInt(lotteryTips.parent().child(1).text());
        log("可抽奖次数: " + count);
        for (var i = 0; i < count; i++) {
            var num = Math.floor(Math.random() * 9) + 1;
            clickRet = lotteryTips.parent().parent().child(num).click();
            log("点击 " + num + ": " + clickRet);
            if (!clickRet) {
                closeBtn.click();
                return;
            }
            sleep(2000);

            var continueTips = common.waitForText("text", "继续翻牌", true, 5);
            if (continueTips != null) {
                // var continueParent = continueTips.parent().parent().parent().parent();
                // log("关闭 继续翻牌: " + continueParent.child(continueParent.childCount() - 1).click());
                log("点击 继续翻牌: " + continueTips.parent().click());
                sleep(2000);
            }
        }
        common.safeSet(nowDate + ":" + lotteryTag, "done");
        toastLog("完成 " + lotteryTag);
    } else {
        common.safeSet(nowDate + ":" + lotteryTag, "done");
        toastLog("完成 " + lotteryTag);
    }

    var lotteryTips = common.waitForTextMatches(/.*每次消耗20g饲料|今日抽奖机会已用完明天再来吧/, true, 5);
    if (lotteryTips == null) {
        return;
    }

    var closeBtn = lotteryTips.parent().child(lotteryTips.parent().childCount() - 1);
    log("关闭 抽奖: " + closeBtn.click());
    sleep(3000);
}

//领饲料任务
doGetFeedTasks = function (actionBar) {
    log("vegetables.doGetFeedTasks");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + getFeedTag);
    if (done != null) {
        log(getFeedTag + " 已做: " + done);
        return;
    }

    toast("vegetables.doGetFeedTasks");
    var startTick = new Date().getTime();
    for (;;) {
        var getFeedBtn = actionBar.child(0);
        var clickRet = getFeedBtn.click();
        if (!clickRet) {
            toastLog("点击 领饲料: " + clickRet);
            break;
        }

        log("点击 领饲料: " + clickRet + ", 并等待 做任务集饲料 出现");
        var taskHeaderTips = common.waitForText("text", "做任务集饲料", true, 5);
        if (taskHeaderTips == null) {
            break;
        }

        var closeBtn = taskHeaderTips.parent().parent().child(0).child(2);
        var taskList = taskHeaderTips.parent().parent().child(1);
        for (var i = 1; i < 10; i = i + 2) {
            if (taskList.child(i).className() == "android.widget.Image") {
                clickRet = taskList.child(i).click();
                if (!clickRet) {
                    toastLog("点击 领取: " + clickRet);
                    break;
                }

                log("点击 领取: " + clickRet);
                sleep(2000);
                var getItBtn = text("我收下了").findOne(1000);
                if (getItBtn != null) {
                    log("点击 我收下了: " + getItBtn.click());
                    sleep(1000);
                }
                break;
            }
        }

        var totalTasks = []
        for (var i = 10; i < taskList.childCount(); i++) {
            var taskNode = taskList.child(i);
            var taskItem = {};
            taskItem.Title = taskNode.child(1).text();
            taskItem.Tips = taskNode.child(2).text();
            taskItem.Button = taskNode.child(taskNode.childCount() - 1);
            taskItem.BtnName = taskItem.Button.text();
            taskItem.Timeout = 30;
            if (taskItem.Button.bounds().height() > 60) {
                totalTasks.push(taskItem);
            }
        }
        toastLog("任务数: " + (taskList.childCount() - 10 + 1) + ", 可见: " + totalTasks.length);
        if (totalTasks.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        var oneWalkTaskList = [];
        totalTasks.forEach(function (tv) {
            if (tv.BtnName == "去浏览") {
                oneWalkTaskList.push(tv);
                log("未完成任务" + oneWalkTaskList.length + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else {
                log("跳过任务: " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            }
        });

        var uncompleteTaskNum = oneWalkTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            log("关闭 领饲料任务列表: " + closeBtn.click());
            sleep(3000);
            common.safeSet(nowDate + ":" + getFeedTag, "done");
            toastLog("完成 " + getFeedTag);
            break;
        }

        if (doOneWalkTasks(oneWalkTaskList)) {
            log("关闭 做任务集饲料列表: " + closeBtn.click());
            sleep(3000);
        }

        log("关闭 领饲料任务列表: " + closeBtn.click());
        sleep(3000);

        if (new Date().getTime() - startTick > 2 * 60 * 1000) {
            log("doGetFeedTasks timeout");
            break;
        }
    }
}

doDailyGet = function (collectTipsParent) {
    log("vegetables.doDailyGet");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInBonusTag);
    if (done != null) {
        log(signInBonusTag + " 已做: " + done);
        return;
    }

    toast("vegetables.doDailyGet");
    var signInBonusBtn = collectTipsParent.child(collectTipsParent.childCount() - 1);
    log("点击 点击领取: " + click(signInBonusBtn.bounds().centerX(), signInBonusBtn.bounds().centerY()));
    sleep(5000);
    var tips = textContains("每日220g封顶").findOne(1000);
    log("每日220g封顶.parent().childCount(): " + tips.parent().childCount());
    if (tips.parent().childCount() == 12) {
        log("点击 直接领取: " + tips.parent().child(9).child(0).click());
        sleep(2000);
        var getItBtn = text("我收下了").findOne(1000);
        if (getItBtn != null) {
            log("点击 我收下了: " + getItBtn.click());
            sleep(2000);
        }
    } else if (tips.parent().childCount() == 10) {
        log("点击 关闭: " + tips.parent().child(tips.parent().childCount() - 1).click());
        sleep(2000);
    }

    common.safeSet(nowDate + ":" + signInBonusTag, "done");
    toastLog("完成 " + signInBonusTag);
}

vegetables.doSignIn = function () {
    log("vegetables.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("vegetables.doSignIn");
    var collectTipsParent = gotoFreeEggs();
    if (collectTipsParent == null) {
        commonAction.backToAppMainPage();
        return;
    }

    var actionBar = collectTipsParent.parent().parent().child(collectTipsParent.parent().parent().childCount() - 3);
    var getFeedBtn = actionBar.child(0);
    var lotteryBtn = actionBar.child(1);

    var progressParent = collectTipsParent.child(collectTipsParent.childCount() - 3);
    var progess = "";
    for (var i = 1; i < progressParent.childCount(); i++) {
        progess = progess + progressParent.child(i).text();
    }
    log(progess);

    clickRet = click(progressParent.bounds().right + progressParent.bounds().width() / 2, progressParent.bounds().centerY());
    sleep(50);
    clickRet = click(progressParent.bounds().right + progressParent.bounds().width() / 2, progressParent.bounds().centerY());
    log("抚摸小鸡(" + (progressParent.bounds().right + progressParent.bounds().width() / 2) + ", " + progressParent.bounds().centerY() + "): " + clickRet);
    sleep(2000);

    doDailyGet(collectTipsParent);

    doLottery(actionBar);

    doGetFeedTasks(actionBar);

    var nowDate = new Date().Format("yyyy-MM-dd");
    var done1 = common.safeGet(nowDate + ":" + signInBonusTag);
    var done2 = common.safeGet(nowDate + ":" + getFeedTag);
    var done3 = common.safeGet(nowDate + ":" + lotteryTag);
    if (done1 != null && done2 != null && done3 != null && actionBar.childCount() == 4) {
        clickRet = actionBar.child(3).click();
        if (!clickRet) {
            return;
        }
        log("点击 极速金盆: " + clickRet);
        sleep(2000);

        common.safeSet(nowDate + ":" + signInTag, "done");
        toastLog("完成 " + signInTag);
    }

    commonAction.backToAppMainPage();
}

module.exports = vegetables;