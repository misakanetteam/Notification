/*  misaka20001.js (misakaNet server)
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

let logger = require("./libs/logger");
try {
    let Queue = require("./libs/Queue").Queue;
    let fs = require("fs");
    //消息列表
    let msg = {};

    //从本地获取misakaKey
    logger.info("reading misakaKeys");
    let iterator;
    try {
        fs.accessSync("/etc/misakaNet/misakaKeys.conf", fs.constants.F_OK | fs.constants.R_OK);
        iterator = require("./libs/Iterator")
                    .Iterator(fs.readFileSync("/etc/misakaNet/misakaKeys.conf")
                                .toString().split('\n')[0].split(' '));
    } catch(error) {
        logger.error("misakaKeys do not exist or cannot read. Exiting.");
    }
    let i;
    let misakaKeys = {};
    while (!(i = iterator.next()).done) {
        let split = i.value.split(',');
        misakaKeys[split[0]] = split[1];
    }
    logger.info("got misakaKeys");

    logger.info("start server");
    require("http").createServer(function(req, res) {
        try {
            logger.info("new client");
            logger.debug(req);
            let misakaKey = req.headers["misaka-key"];
            if (misakaKey === undefined) {      //若没有传入misakaKey
                res.writeHead(401, {"Content-Type": "application/json;charset=utf-8"});
                res.write(JSON.stringify({
                    OK: false,
                    error: {
                        code: 0,
                        msg: "no misakaKey"
                    }
                }));
                res.end();
            } else {
                let position;
                if ((position = misakaKeys[misakaKey]) == undefined) {  //若找不到传入的misakaKey
                    logger.info("misakaKey not found");
                    res.writeHead(404, {"Content-Type": "application/json;charset=utf-8"});
                    res.write(JSON.stringify({
                        OK: false,
                        error: {
                            code: 1,
                            msg: "misakaKey not found"
                        }
                    }));
                    res.end();
                } else {
                    //判断msg中是否有该sister
                    if (msg[position] == undefined)
                        msg[position] = new Queue();

                    switch (req.method) {
                        case "POST":
                            let postBody = "";
                            req.on("data", function(chunk) {
                                postBody += chunk;
                            });
                            req.on("end", function() {
                                msg[position].enqueue(postBody);
                                res.writeHead(201, {"Content-Type": "application/json;charset=utf-8"});
                                res.write(JSON.stringify({
                                    OK: true
                                }));
                                res.end();
                                logger.info("pushed");
                            })
                            break;
                        case "GET":
                            res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
                            res.write(JSON.stringify({
                                OK: true,
                                body: msg[position].front(),
                                empty: msg[position].empty()
                            }));
                            msg[position].dequeue();
                            res.end();
                            logger.info("got");
                            break;
                        default:    //不支持的请求方式
                            res.writeHead(405);
                            res.write(JSON.stringify({
                                OK: false,
                                error: {
                                    code: 2,
                                    msg: "unsupported method"
                                }
                            }));
                            res.end();
                            break;
                    }
                }
            }
        } catch (error) {   //捕获响应请求时的错误
            error.OK = false;
            res.writeHead(500, {"Content-Type": "application/json;charset=utf-8"});
            res.write(JSON.stringify(error));
            res.end();
        }
    }).listen(20001);
} catch(error) {            //捕获所有错误
    logger.error(error);
}
