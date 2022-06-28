var tmallCar = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "天猫汽车每日签到";
const getPower = "./TMallCar/getPower.jpg";
const level2TmallCarEntry = "./TMallCar/level2TmallCarEntry.jpg";
const dailyBonus = "./TMallCar/dailyBonus.jpg";

tmallCar.dailyJobs = [];
tmallCar.dailyJobs.push(signInTag);

//进入天猫汽车
gotoTMallCar = function () {
    log("gotoTMallCar");
    var recommendBtn = packageName(common.destPackageName).desc("推荐双击切换到已选中状态").findOne(30000);
    if (recommendBtn == null) {
        toastLog("推荐 not exist");
        return null;
    }

    var channelList = packageName(common.destPackageName).className("android.support.v7.widget.RecyclerView").depth(16).drawingOrder(4).indexInParent(4).findOne(30000);
    if (channelList == null) {
        toastLog("频道列表 not exist");
        return false;
    }

    var tmallCarBtn = null;
    for (var i = 0; i < 2; i++) {
        tmallCarBtn = packageName(common.destPackageName).desc("天猫汽车").visibleToUser(true).findOne(1000);
        if (tmallCarBtn != null) {
            break;
        }
        swipe(685, channelList.bounds().centerY(), 35, channelList.bounds().centerY(), 800);
        sleep(1000);
    }

    if (tmallCarBtn == null){
        toastLog("天猫汽车 not exist");
        return false;
    }

    var clickRet = tmallCarBtn.click();
    log("点击 天猫汽车: " + clickRet);
    if (clickRet == false) {
        return null;
    }

    var getPowerBtn = common.waitForImageInRegion(getPower, 0, device.height / 2, device.width, device.height / 2, 15);
    if (getPowerBtn == null) {
        return null;
    }

    sleep(3000);
    clickRet = click(getPowerBtn.x, getPowerBtn.y);
    toastLog("点击 领动力值: " + clickRet);
    if (clickRet == false) {
        return null;
    }

    sleep(2000);
    var exchangeTips = common.waitForText("text", "10点限时开兑", true, 30);
    if (exchangeTips == null) {
        return null;
    }

    //此按钮点击后隐身了，使用text仍然能找到，故使用图片查找
    var dailyBonusPt = common.findImageInRegion(dailyBonus, 0, device.height / 4, device.width, device.height / 2);
    if (dailyBonusPt != null) {
        clickRet = click(dailyBonusPt.x, dailyBonusPt.y);
        log("点击 立即领取: " + clickRet);
        if (clickRet == false) {
            return null;
        }

        sleep(2000);
        var morePowerTips = text("去获得更多动力").visibleToUser(true).findOne(1000);
        if (morePowerTips != null) {
            log("点击 关闭: " + morePowerTips.parent().child(morePowerTips.parent().childCount() - 1).click());
            sleep(2000);

            var taskTips = text("完成任务可获得行驶的动力").findOne(1000);
            if (taskTips != null) {
                log("关闭 任务列表: " + taskTips.parent().parent().child(taskTips.parent().parent().childCount() - 1).click());
                sleep(2000);
            }
        }
    }
    // var getTips = text("立即领取").visibleToUser(true).findOne(1000);
    // if (getTips != null) {
    //     clickRet = getTips.parent().parent().click();
    //     log("点击 立即领取: " + clickRet);
    //     if (clickRet == false) {
    //         return null;
    //     }

    //     sleep(2000);
    //     var morePowerTips = text("去获得更多动力").visibleToUser(true).findOne(1000);
    //     if (morePowerTips != null) {
    //         log("点击 关闭: " + morePowerTips.parent().child(morePowerTips.parent().childCount() - 1).click());
    //         sleep(2000);

    //         var taskTips = text("完成任务可获得行驶的动力").findOne(1000);
    //         if (taskTips != null) {
    //             log("关闭 任务列表: " + taskTips.parent().parent().child(taskTips.parent().parent().childCount() - 1).click());
    //             sleep(2000);
    //         }
    //     }
    // }
    //去抽奖exchangeTips.parent().parent().parent().child(7)
    //攒动力exchangeTips.parent().parent().parent().child(9)
    return exchangeTips.parent().parent().parent();
}

doOneWalkTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        sleep(tasklist[i].Timeout * 1000);
        commonAction.backToFeedTaskList(tasklist[i].Title);
        break;
    }

    return ret;
}

doSearchTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        var searchBtn = common.waitForText("text", "立即搜索", true, 15);
        if (searchBtn != null) {
            var clickRet = searchBtn.click();
            log("点击 立即搜索: " + clickRet);
            if (!clickRet) {
                commonAction.backToFeedTaskList(tasklist[i].Title);
                break;
            }
        }

        sleep(3000);
        var frameSearchBtn = common.waitForText("text", "搜索", true, 15);
        if (frameSearchBtn != null) {
            var clickRet = frameSearchBtn.click();
            log("点击 立即搜索: " + clickRet);
            if (!clickRet) {
                commonAction.backToFeedTaskList(tasklist[i].Title);
                break;
            }
        }

        sleep(3000);
        commonAction.backToFeedTaskList(tasklist[i].Title);
        ret = true;
        break;
    }

    return ret;
}

doLevelTwoVisitTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        var tmallCarEntry = common.waitForImage(level2TmallCarEntry, 15);
        if (tmallCarEntry == null) {
            commonAction.backToFeedTaskList(tasklist[i].Title);
            break;
        }

        var clickRet = click(tmallCarEntry.x, tmallCarEntry.y);
        log("点击 淘宝二楼 天猫汽车" + tmallCarEntry + ": " + clickRet);
        if (clickRet == false) {
            commonAction.backToFeedTaskList(tasklist[i].Title);
            break;
        }

        var getPowerBtn = common.waitForImageInRegion(getPower, 0, device.height / 2, device.width, device.height / 2, 15);
        if (getPowerBtn == null) {
            commonAction.backToFeedTaskList(tasklist[i].Title);
            break;
        }

        sleep(3000);
        clickRet = click(getPowerBtn.x, getPowerBtn.y);
        toastLog("点击 领动力值: " + clickRet);
        if (clickRet == false) {
            commonAction.backToFeedTaskList(tasklist[i].Title);
            break;
        }

        ret = true;
        break;
    }

    return ret;
}

//攒动力任务
doGetPowerTasks = function (actionBar) {
    toastLog("tmallCar.doGetPowerTasks");
    var getPowerBtn = actionBar.child(9);
    var clickRet = getPowerBtn.click();
    if (!clickRet) {
        toastLog("点击 攒动力: " + clickRet);
        return;
    }

    sleep(3000);
    toastLog("点击 攒动力: " + clickRet + ", 并等待 完成任务可获得行驶的动力 出现");
    var taskTips = common.waitForText("text", "完成任务可获得行驶的动力", true, 5);
    if (taskTips == null) {
        return;
    }

    log("完成任务可获得行驶的动力.parent().parent().childCount(): " + taskTips.parent().parent().childCount());
    var closeBtn = taskTips.parent().parent().child(3);
    var startTick = new Date().getTime();
    for (;;) {
        var taskList = taskTips.parent().parent().child(2);
        var totalTasks = [];
        for (var i = 0; i < taskList.childCount();) {
            var taskItem = {};
            taskItem.Title = taskList.child(i + 1).text();
            var tips = "";
            for (var j = 0; j < taskList.child(i + 2).childCount(); j++) {
                tips = tips + taskList.child(i + 2).child(j).text();
            }
            taskItem.Tips = tips;
            taskItem.Button = taskList.child(i + 3);
            taskItem.BtnName = taskItem.Button.text();
            taskItem.Timeout = 5;
            if (taskItem.Button.bounds().height() > 50) {
                totalTasks.push(taskItem);
            }

            if (i + 4 < taskList.childCount()) {
                i = i + 4;
            } else {
                break;
            }
        }

        toastLog("任务数: " + Math.floor(taskList.childCount() / 4) + ", 可见: " + totalTasks.length);
        if (totalTasks.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        var oneWalkTaskList = [];
        var searchTaskList = [];
        var levelTwoVisitTaskList = [];
        totalTasks.forEach(function (tv) {
            if (tv.BtnName.indexOf("已完成") == -1) {
                if (tv.Tips.indexOf("0元下") == -1) {
                    if (tv.Tips.indexOf("完成搜索") != -1)  {
                        searchTaskList.push(tv);
                    } else if (tv.Title.indexOf("淘宝二楼") != -1) {
                        levelTwoVisitTaskList.push(tv);
                    } else {
                        oneWalkTaskList.push(tv);
                    }
                    log("未完成任务" + (oneWalkTaskList.length + searchTaskList.length + levelTwoVisitTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
                } else {
                    log("跳过任务: " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
                }
            } else {
                log("跳过任务: " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            }
        });

        var uncompleteTaskNum = oneWalkTaskList.length + searchTaskList.length + levelTwoVisitTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            log("关闭 攒动力任务列表: " + closeBtn.click());
            sleep(3000);

            var nowDate = new Date().Format("yyyy-MM-dd");
            common.safeSet(nowDate + ":" + signInTag, "done");
            toastLog("完成 " + signInTag);
            break;
        }

        doOneWalkTasks(oneWalkTaskList);

        if (doSearchTasks(searchTaskList)) {
            clickRet = getPowerBtn.click();
            if (!clickRet) {
                toastLog("点击 攒动力: " + clickRet);
                return;
            }
        }

        if (doLevelTwoVisitTasks(levelTwoVisitTaskList)) {
            clickRet = getPowerBtn.click();
            if (!clickRet) {
                toastLog("点击 攒动力: " + clickRet);
                return;
            }
        }

        if (new Date().getTime() - startTick > 5 * 60 * 1000) {
            log("doGetPowerTasks timeout");
            break;
        }
    }
}

tmallCar.doSignIn = function () {
    log("tmallCar.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("tmallCar.doSignIn");
    var actionBar = gotoTMallCar();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    doGetPowerTasks(actionBar);

    commonAction.backToAppMainPage();
}

module.exports = tmallCar;