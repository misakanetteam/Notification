/*  interface.js (misakaNet client)
 *
 *  Copyright 2021  Olddoctor Development Team
 *
 *  This file is part of misakaNet
 *
 *  misakaNet is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  misakaNet program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
let fs = require("fs");
let os = require("os");
let execSync = require("child_process").execSync;

let config = {};

const USER_HOME = os.homedir();

//检查配置文件是否存在
try {
    fs.accessSync(USER_HOME + "/.config/misakaNetInterface.conf", fs.constants.F_OK | fs.constants.R_OK);

    //从文件读取配置
    let iterator = require("./libs/Iterator")
                    .Iterator(fs.readFileSync(USER_HOME + "/.config/misakaNetInterface.conf").toString().split(/\r?\n/));
    
    let i;
    while(!(i = iterator.next()).done) {
        if (i.value !== "" && i.value.charAt(0) !=='#') {
            let split = i.value.split('=', 2);
            config[split[0]] = split[1];
        }
    }

} catch (error) {
    console.error("Config does not exist or cannot read.");
}

//检查必要配置是否存在
if (config.misaka20001position === undefined || config.misakaKey === undefined)
    console.error(strings.missingConfig);

//设置缺省配置
if (config.enablePicture === undefined)
    config.enablePicture = "false";

if (config.enableLog === undefined)
    config.enableLog = "false";

let strings;
if (config.language === undefined) {
    strings = require("./res/strings/en");
}
else {
    try {
        strings = require("./res/strings/" + config.language);
    } catch (error) {
        strings = require("./res/strings/en");
    }
}

//请求消息
let https = require("https");

//输出信息
function show(msg) {
    if (config.enablePicture === "true") {
        switch (os.platform()) {
            case "linux":
                let tmpdir = os.tmpdir();

                let picShow = require("./libs/picShow");

                //获取图片URL
                let regex = /https?:\/\/\S+[jpg,jpeg,png]/g;

                let done = false;
                let urls = [];
                for (let i = 0; !done; i++) {
                    let url;
                    if ((url = regex.exec(msg)) !== null) {
                        urls[i] = url;
                    } else {
                        done = true;
                    }
                }
                let msgWithoutURL = msg.replace(regex, "");

                try {
                    fs.accessSync(tmpdir + "/misakaNet", fs.constants.F_OK | fs.constants.W_OK);
                } catch (error) {
                    execSync("mkdir " + tmpdir + "/misakaNet");
                }

                //下载图片
                try {
                    for (let i = 0; i < urls.length; i++) {
                        execSync("wget -q -O " + tmpdir + "/misakaNet/" + i + ".jpg " + urls[i]);
                    }
                } catch (error) {
                    console.error(strings.wgetErr);
                    console.error(error);
                    process.exit(-1);
                }
                
                //显示正文
                console.log(msgWithoutURL);

                //显示图片
                for (let i = 0; i < urls.length; i++) {
                    picShow.show(tmpdir + "/misakaNet/" + i + ".jpg");
                }
                break;

            default:
                console.warn(strings.picShowWarn);
                console.log(msg);
                break;    
        }
    } else {
        console.log(msg);
    }
}

//记录信息历史
function log(msg) {
    let logdir = "./logs";

    try {
        fs.accessSync(logdir, fs.constants.F_OK | fs.constants.W_OK);
    } catch (error) {
        execSync("mkdir " + logdir);
    }
    
    let log = "";
    try {
        log = fs.readFileSync(logdir + "/misakaNet.log");
    } catch (error) {

    }
    
    let date = new Date();
    let dateFormat = "[" + String(date.getFullYear()) + "-" + String(date.getMonth() + 1) + "-" + String(date.getDate()) + " " + String(date.getHours()) + ":" + String(date.getMinutes()) + ":" + String(date.getSeconds()) + "]:";

    log = log + os.EOL + os.EOL + dateFormat + os.EOL + msg;

    fs.writeFileSync(logdir + "/misakaNet.log", log);
}

//GET信息
let getConfig = {};

if (config.extraGetConfig !== undefined)
    getConfig = JSON.parse(config.extraGetConfig);

if(getConfig.headers === undefined) 
    getConfig.headers = {};

getConfig.headers["misaka-key"] = config.misakaKey;

console.log(getConfig);


https.get(config.misaka20001position, getConfig, function (res) {
    let response = "";
    res.on("data", function(chunk) {
        response += chunk;
    });
    res.on("end", function() {
        response = JSON.parse(response);
	if (response.OK) {
            if (!response.empty) {
                if (config.enableLog === "true") {
                    log(response.body);
                }
                show(response.body);
            }
            else
                console.log(strings.noMsg);
        } else {
            console.error(response);
        }
    });
}).on("error", function(error) {
    console.error(error);
});
