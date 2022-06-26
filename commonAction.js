var commonAction = {};

var common = require("./common.js");

findRootAppUI = function () {
    var root = packageName(common.destPackageName).className("FrameLayout").findOne(1000);
    if (root == null) {
        toastLog(common.destAppName + " FrameLayout is not exist");
        return null;
    }
    return root;
}

// 判断是否主界面
judgeAppMainPage = function () {
    var root = findRootAppUI();
    if (root == null) {
        return false;
    }

    var tabList = packageName(common.destPackageName).className("android.widget.TabWidget").find();
    var channelList = packageName(common.destPackageName).className("android.support.v7.widget.RecyclerView").depth(16).drawingOrder(4).indexInParent(4).find();
    log("Tab: " + tabList.length + ", Channel: " + channelList.length);
    if (tabList.length > 0 && channelList.length > 0) {
        toastLog(common.destAppName + " main page");
        return true;
    }

    return false;
}

// 多次判断是否进入主页，避免网络延时导致问题
commonAction.loopJudgeAppMainPage = function (sleepTime) {
    var trytimes = 0;
    while (trytimes < 10) {
        var isLoged = judgeAppMainPage();
        if (isLoged) {
            return true;
        }
        trytimes = trytimes + 1;
        sleep(sleepTime);
    }
    return false;
}

commonAction.backToAppMainPage = function () {
    log("backToAppMainPage");
    try{
        var curPkg = currentPackage();
        log("currentPackage(): " + curPkg);
        if (curPkg != common.destPackageName) {
            log("recents: " + recents());
            sleep(1000);
            var btn = text(common.destAppName).findOne(3000);
            if (btn != null) {
                log("switch to " + common.destAppName + ": " + click(btn.bounds().centerX(), btn.bounds().centerY()));
                sleep(1000);
            } else {
                log("no " + common.destAppName + " process");
            }
        }

        var trytimes = 0;
        while (trytimes < 10)
        {
            result = judgeAppMainPage()
            if (result){
                return true;
            }
            var result = back();
            if (!result) {
                toastLog(common.destAppName + " back fail");
                return false;
            }
            trytimes = trytimes + 1;
            sleep(3000);
        }
        return false;
    } catch(e) {
        console.error("mainWorker",e);
    }
}

commonAction.scrollThrough = function (txt, timeout) {
    //超时返回false
    var startTime = parseInt(new Date().getTime() / 1000);
    var nowTime = parseInt(new Date().getTime() / 1000);
    for (;;) {
        var slide = textContains(txt).visibleToUser(true).findOne(1000);
        nowTime = parseInt(new Date().getTime() / 1000);
        log("slide tips: " + (slide != null) + ", " + (nowTime - startTime) + "s");
        if (slide != null) {
            log("slide.bounds().height(): " + slide.bounds().height());
        }
        if (slide == null || nowTime - startTime > timeout || slide != null && slide.bounds().height() < 10) {
            break;
        }

        var curPkg = currentPackage();
        if (curPkg != common.destPackageName) {
            //跳其他app了要跳回来
            log("currentPackage(): " + curPkg);
            log("recents: " + recents());
            sleep(1000);
            var btn = text(common.destAppName).findOne(3000);
            if (btn != null) {
                log("switch to " + common.destAppName + ": " + click(btn.bounds().centerX(), btn.bounds().centerY()));
                sleep(1000);
            } else {
                log("no " + common.destAppName + " process");
            }
        }

        swipe(device.width / 5, device.height * 13 / 16, device.width / 5, device.height * 11 / 16, Math.floor(Math.random() * 200) + 200);
        sleep(1000);
    }

    if (nowTime - startTime >= timeout) {
        return false;
    }

    return true;
}

//成功返回true，超时或异常返回false，最后会返回上一个页面
commonAction.doBrowseTasks = function (tasklist, triedTasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + click(tasklist[i].Button.bounds().centerX(), tasklist[i].Button.bounds().centerY()));
        sleep(5000);
        if (triedTasklist != null) {
            triedTasklist.push(tasklist[i].Title);
        }
        // 等待离开任务列表页面
        if (common.waitForText("textContains", "浏览", true, 10)) {
            log("等待 " + tasklist[i].Title + " 浏览完成，60s超时");
            sleep(5000);
            var browseRet = commonAction.scrollThrough("浏览", 60);
            //回到任务列表
            back();
            sleep(3000);
            if (browseRet) {
                log("浏览 " + tasklist[i].Title + " 完成");
                ret = true;
            } else {
                log("60s timeout");
            }
            break;
        } else {
            if (textContains("考拉豆可用于").findOne(3000) == null) {
                //回到任务列表
                back();
                sleep(3000);
            }
        }
    }
    return ret;
}

commonAction.backToFeedTaskList = function (title) {
    if (title.indexOf("(") != -1) {
        title = title.slice(0, title.indexOf("("));
    }
    toastLog("backToFeedTaskList: " + title);
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
                log("switch to " + common.destAppName + ": " + click(btn.bounds().centerX(), btn.bounds().centerY()));
                sleep(1000);
            } else {
                log("no " + common.destAppName + " process");
            }
        }

        sleep(3000);
        var tips = packageName(common.destPackageName).className("android.view.View").textContains(title).findOne(1000);
        if (tips != null) {
            break;
        }
        toastLog("no " + title);

        if (new Date().getTime() - startTick > 15 * 1000) {
            log("backToFeedTaskList timeout");
            break;
        }
    }
}

module.exports = commonAction;