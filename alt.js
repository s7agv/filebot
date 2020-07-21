const Discord = require("discord.js");
const fs = require('fs');
const client = new Discord.Client();
const config = require("./config.json");
let request = require('request');
let rimraf = require('rimraf');
const Path = require('path');
const { exec } = require("child_process");

client.on("ready", () => {
    console.log("on");
});
let prefix = "##";
client.on("message", (message) => {
    let args = message.content.split(" ");
    let cmd = args.shift();
    if(config.owners.includes(message.author.id)){
        if (cmd === `${prefix}sh`){
            let sh = args.join(" ");
            exec(sh, (error, stdout, stderr) => {
                if (error) {
                    message.channel.send(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    message.channel.send(`stderr: ${stderr}`);
                    return;
                }
                message.channel.send(`stdout: ${stdout}`);
            });
        }
        if (cmd === `${prefix}newmusic`){
            let filename = args[0];
            let url = args[1];
            exec(`youtube-dl -f 140 --output "music/${filename}.mp3" ${url}`, (error, stdout, stderr) => {
                if (error) {
                    message.channel.send(`error: ${error.message}`);
                    return;
                }
                if (stderr) message.channel.send(`stderr: ${stderr}`);
                message.channel.send(`stdout: ${stdout}`);
            });
        }
        if (cmd === `${prefix}ls`){
            let path;
            if(args[0]&&args[0].startsWith("(")){
                let str = args.join(" ");
                var par = str.match(/\(([^)]+)\)/)[1];
                path = par;
                //var brack = str.match(/\[(.*)\]/);
            }else{
                path = args[0];
            }
            if(!path){
                let res = fs.readdirSync(__dirname).join("   ");
                message.channel.send(res);
            } else {
                if(fs.existsSync(path)){
                    let res = fs.readdirSync(path).join("  //  ");
                    if (!res||res == "") return message.channel.send("empty path")
                    if(res.length>2000){
                        let res0 = res.match(/.{1,2000}/g);
                        for(i of res0){
                            message.channel.send(i);
                        }
                    }else{
                        message.channel.send(res);
                    }
                } else {
                    message.channel.send(`${path} doesn't exist`);
                }
            }  
        }
        if (cmd === `${prefix}mkdir`){
            let path;
            if(args[0].startsWith("(")){
                let str = args.join(" ");
                var par = str.match(/\(([^)]+)\)/)[1];
                path = par;
                //var brack = str.match(/\[(.*)\]/);
            }else{
                path = args[0];
            }
            try {
                fs.mkdirSync(path, { recursive: true });
            
                message.channel.send(`${path} made`);
            } catch (err) {
                message.channel.send(`Error while making ${path}.`);
            }
        }
        if (cmd === `${prefix}upload`){
            let filepath;
            if(args[0].startsWith("(")){
                let str = args.join(" ");
                var par = str.match(/\(([^)]+)\)/)[1];
                filepath = par;
                //var brack = str.match(/\[(.*)\]/);
            }else{
                filepath = args[0];
            }
            let dir = Path.dirname(filepath);
            if (!fs.existsSync(dir)){
                try {
                    fs.mkdirSync(dir, { recursive: true });
                
                    message.channel.send(`${dir} made`);
                } catch (err) {
                    message.channel.send(`Error while making ${dir}.`);
                }
            }
            let fileUrl = message.attachments.first().url;
            download(fileUrl,filepath).then(function(){
                message.channel.send(fs.readdirSync(dir));
            });
        }
        if (cmd === `${prefix}retrieve`){
            let filepath;
            if(args[0].startsWith("(")){
                let str = args.join(" ");
                var par = str.match(/\(([^)]+)\)/)[1];
                filepath = par;
                //var brack = str.match(/\[(.*)\]/);
            }else{
                filepath = args[0];
            }
            if (!fs.existsSync(filepath)) return message.channel.send("does not exist");
            message.channel.send("", {files: [filepath]});
        }
        if (cmd === `${prefix}rm`){
            let filepath;
            if(args[0].startsWith("(")){
                let str = args.join(" ");
                var par = str.match(/\(([^)]+)\)/)[1];
                filepath = par;
                //var brack = str.match(/\[(.*)\]/);
            }else{
                filepath = args[0];
            }
            try {
                fs.unlinkSync(filepath);
                message.channel.send(`${filepath} removed`);
            } catch (err) {
                try{
                    rimraf(filepath, function(){
                        message.channel.send(`${filepath} removed`);
                    });
                } catch(err) {
                    message.channel.send(`Error removing ${filepath}.`);
                }
            }
        }
        if (cmd === `${prefix}rename`){
            let oldPath;
            let newPath;
            if(args[0].startsWith("(")){
                let str = args.join(" ");
                var par = str.match(/\(([^)]+)\)/)[1];
                var brack = str.match(/\[(.*)\]/)[1];
                oldPath = par;
                newPath = brack;
            }else{
                oldPath = args[0];
                newPath = args[1];
            }
            try{
                fs.renameSync(oldPath,newPath);
                message.channel.send(`Renamed ${oldPath} to ${newPath}`);
            }catch(err){
                message.channel.send(`Error renaming ${oldPath}.`);
            }
        }
    }
});
async function download(url,filepath){
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream(filepath));
}
client.login(config.token);