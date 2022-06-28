var assetIsland = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "资产岛每日签到";
const getDiamond = "./AssetIsland/getDiamond.jpg";
const getDiamondTaskCenter = "./AssetIsland/getDiamondTaskCenter.jpg";

assetIsland.dailyJobs = [];
assetIsland.dailyJobs.push(signInTag);

//进入资产岛
gotoAssetIsland = function () {
    log("gotoAssetIsland");
    var searchBtn = className("android.view.View").desc("搜索").findOne();
    if (searchBtn == null) {
        return null;
    }

    var btnParent = searchBtn.parent().parent().parent().parent();
    var clickRet = btnParent.child(btnParent.childCount() - 2).child(0).child(0).child(0).click();
    log("点击 搜索输入框: " + clickRet + ", 并等待 搜索 出现, 10s超时");
    sleep(2000);

    var startTick = new Date().getTime();
    for (;;) {
        searchBtn = className("android.widget.Button").desc("搜索").findOne(1000);

        if (searchBtn != null) {
            break;
        }

        if (new Date().getTime() - startTick > 10 * 1000) {
            return null;
        }
    }

    var inputRet = setText("资产岛");
    log("输入 资产岛: " + inputRet);

    if (inputRet == false) {
        return null;
    }

    log("点击 搜索: " + searchBtn.click() + ", 并等待 资产岛(原拍卖币) 出现, 10s超时");
    sleep(2000);

    startTick = new Date().getTime();
    for (;;) {
        var islandTips = className("android.view.View").desc("资产岛(原拍卖币)").findOne(1000);
        if (islandTips != null) {
            log("点击 资产岛(原拍卖币): " + islandTips.parent().parent().parent().parent().click());
            break;
        }

        if (new Date().getTime() - startTick > 10 * 1000) {
            return null;
        }
    }

    var getDiamondBtnPt = common.waitForImageInRegion(getDiamond, 0, device.height / 4, device.width, device.height / 2, 15);
    if (getDiamondBtnPt == null) {
        return null;
    }

    return getDiamondBtnPt;
}

doOneWalkTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        sleep(tasklist[i].Timeout * 1000);
        
        backToTaskList();
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
                    backToTaskList();
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
                    backToTaskList();
                    break;
                }
                sleep(1000);
            }
            sleep(tasklist[i].Timeout * 1000);
        }

        backToTaskList();
        ret = true;
        break;
    }

    return ret;
}

backToTaskList = function () {
    toastLog("backToTaskList");
    var startTick = new Date().getTime();
    for (;;) {
        var ret = back();
        log("back(): " + ret);

        var curPkg = currentPackage();
        log("currentPackage(): " + curPkg);
        if (curPkg != common.destPackageName) {
            log("recents: " + recents());
            sleep(1000);
            var btn = text(common.destAppName).findOne(3000);
            if (btn != null) {
                log("switch to " + common.destAppName + ": " + btn.parent().parent().click());
                sleep(1000);
            } else {
                log("no " + common.destAppName + " process");
            }
        }

        sleep(3000);
        var getDiamondTaskCenterPt = common.findImageInRegion(getDiamondTaskCenter, 0, 0, device.width, device.height / 2);
        if (getDiamondTaskCenterPt != null) {
            break;
        }
        toastLog("no 任务中心");

        if (new Date().getTime() - startTick > 15 * 1000) {
            log("backToTaskList timeout");
            break;
        }
    }
}

//领钻石任务
doGetDiamondTasks = function (getDiamondBtnPt) {
    toastLog("assetIsland.doGetDiamondTasks");
    var startTick = new Date().getTime();
    for (;;) {
        var clickRet = click(getDiamondBtnPt.x, getDiamondBtnPt.y);
        if (!clickRet) {
            toastLog("点击 领钻石: " + clickRet);
            return;
        }
    
        sleep(3000);
        toastLog("点击 领钻石: " + clickRet + ", 并等待 任务中心 出现, 5s超时");
        var getDiamondTaskCenterPt = common.waitForImageInRegion(getDiamondTaskCenter, 0, 0, device.width, device.height / 2, 5);
        if (getDiamondTaskCenterPt == null) {
            return;
        }
    
        var btn = textMatches(/领红包|去完成|去抢购|去训练|已完成/).visibleToUser(true).findOne(1000);
        if (btn == null) {
            return;
        }
    
        var taskList = btn.parent().parent();
        var closeBtn = taskList.parent().parent().child(1);
        
        var totalTasks = [];
        for (var i = 0; i < taskList.childCount(); i++) {
            var taskItem = {};
            taskItem.Title = taskList.child(i).child(0).child(0).text();
            var tips = "";
            for (var j = 0; j < taskList.child(i).child(0).child(1).childCount(); j++) {
                tips = tips + taskList.child(i).child(0).child(1).child(j).text();
            }
            taskItem.Tips = tips;
            taskItem.Button = taskList.child(i).child(1);
            taskItem.BtnName = taskItem.Button.text();
            taskItem.Timeout = 20;
            if (taskItem.Button.bounds().height() > 50) {
                totalTasks.push(taskItem);
            }
        }

        toastLog("任务数: " + taskList.childCount() + ", 可见: " + totalTasks.length);
        if (totalTasks.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        var oneWalkTaskList = [];
        var appReactTaskList = [];
        totalTasks.forEach(function (tv) {
            if (tv.BtnName.indexOf("已完成") == -1) {
                if (/.*划算江湖.*/.test(tv.Title)) {
                    tv.ActionName = "练功升级";
                    appReactTaskList.push(tv);
                } else {
                    oneWalkTaskList.push(tv);
                }
                log("未完成任务" + (oneWalkTaskList.length + appReactTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else {
                log("跳过任务: " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            }
        });

        var uncompleteTaskNum = oneWalkTaskList.length + appReactTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            log("关闭 领钻石任务列表: " + closeBtn.click());
            sleep(3000);

            var nowDate = new Date().Format("yyyy-MM-dd");
            common.safeSet(nowDate + ":" + signInTag, "done");
            toastLog("完成 " + signInTag);
            break;
        }

        if (doOneWalkTasks(oneWalkTaskList)) {
            log("关闭 领钻石任务列表: " + closeBtn.click());
            sleep(3000);
            continue;
        }

        if (doAppReactTasks(appReactTaskList)) {
            log("关闭 领钻石任务列表: " + closeBtn.click());
            sleep(3000);
            continue;
        }

        if (new Date().getTime() - startTick > 5 * 60 * 1000) {
            log("doGetDiamondTasks timeout");
            break;
        }
    }
}

assetIsland.doSignIn = function () {
    log("assetIsland.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return;
    }

    toast("assetIsland.doSignIn");
    var getDiamondBtnPt = gotoAssetIsland();
    if (getDiamondBtnPt == null) {
        commonAction.backToAppMainPage();
        return;
    }

    doGetDiamondTasks(getDiamondBtnPt);

    commonAction.backToAppMainPage();
}

module.exports = assetIsland;