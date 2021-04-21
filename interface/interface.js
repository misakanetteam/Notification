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

//请求消息
logger.debug("Reading message");
let https = require("http");


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
        if (!response.empty)
            console.log(response.body);
        else
            logger.info("No message");
    });
}).on("error", function(error) {
    logger.error(error);
});