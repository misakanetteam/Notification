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
let logger = require("./libs/logger");

let config = {};

const USER_HOME = process.env.HOME || process.env.USERPROFILE;

logger.debug("Reading configs");
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
    logger.error("Config does not exist or cannot read.");
}

//检查必要配置是否存在
if (config.misaka20001position === undefined || config.misakaKey === undefined)
    logger.error("Missing necessary configs");

//设置缺省配置
if (config.enablePicture === undefined)
    config.enablePicture = "false";


//请求消息
logger.debug("Reading message");
let https = require("https");

//输出信息
function show(msg) {
    if (config.enablePicture === "true") {
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

        let execSync = require("child_process").execSync;

        try {
            fs.accessSync("/tmp/misakaNet", fs.constants.F_OK | fs.constants.W_OK);
        } catch (error) {
            execSync("mkdir /tmp/misakaNet");
        }

        //下载图片
        try {
            for (let i = 0; i < urls.length; i++) {
                execSync("wget -q -O /tmp/misakaNet/" + i + ".jpg " + urls[i]);
            }
        } catch (error) {
            logger.error("wget error");
            logger.error(error);
            process.exit(-1);
        }
        
        //显示正文
        console.log(msgWithoutURL);

        //显示图片
        for (let i = 0; i < urls.length; i++) {
            picShow.show("/tmp/misakaNet/" + i + ".jpg");
        }
    } else {
        console.log(msg);
    }
}

//GET信息
https.get(config.misaka20001position, {
    headers: {
        "misaka-key": config.misakaKey
    }
}, function (res) {
    let response = "";
    res.on("data", function(chunk) {
        response += chunk;
    });
    res.on("end", function() {
        response = JSON.parse(response);
	if (response.OK) {
            if (!response.empty)
                show(response.body);
            else
                console.log("No message");
        } else {
            logger.error(response);
        }
    });
}).on("error", function(error) {
    logger.error(error);
});
