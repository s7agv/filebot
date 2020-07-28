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
let prefix = "==";
client.on("message", (message) => {
    let args = message.content.split(" ");
    let cmd = args.shift();
    if (cmd===`${prefix}music`){
        let url = args[0];
        message.channel.send(`Initializing download for \`${url}\`...`);
        exec(`youtube-dl --output "tmp/%(title)s.mp3" --restrict-filenames --get-filename ${url}`, (error, stdout, stderr) => {
            if (error) {
                message.channel.send(`**ERROR**: \`\`\`${error.message}\`\`\``);
                return;
            }
            //if (stderr) message.channel.send(`**WARN**: \`\`\`${stderr}\`\`\``);
            message.channel.send(`Downloading...`);
            let filename = stdout.replace("\n","");//youtube-dl -f 140 https://youtu.be/cPCLFtxpadE -j | jq .filesize
            exec(`youtube-dl -f 140 ${url} -j | jq .filesize`, (error, stdout, stderr) => {
                if (stdout>8000000) {
                    message.channel.send(`**ERROR**: song too big`);
                    return;
                }
                exec(`youtube-dl -f 140 --output "tmp/%(title)s.mp3" --restrict-filenames ${url}`, (error, stdout, stderr) => {
                    if (error) {
                        message.channel.send(`**ERROR**: \`\`\`${error.message}\`\`\``);
                        return;
                    }
                    //if (stderr) message.channel.send(`**WARN**: \`\`\`${stderr}\`\`\``);
                    if (!fs.existsSync(filename)) return message.channel.send("**ERROR**: something went wrong and the file was not generated, or was misnamed.");
                    message.channel.send(`Sending mp3...`);
                    message.channel.send("", {files: [filename]}).then(function(){
                        fs.unlinkSync(filename);
                    });
                });
            });
        });
    }
    if(config.owners.includes(message.author.id)){
        if (cmd === `${prefix}sh`){
            let sh = args.join(" ");
            exec(sh, (error, stdout, stderr) => {
                if (error) {
                    message.channel.send(`**ERROR**: \`\`\`${error.message}\`\`\``);
                    return;
                }
                if (stderr) {
                    message.channel.send(`**WARN**: \`\`\`${stderr}\`\`\``);
                    return;
                }
                if(stdout==''){
                    message.channel.send(`☑️`);
                } else {
                    message.channel.send(`\`\`\`${stdout}\`\`\``);
                }
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
                if (stderr) message.channel.send(`**WARN**: \`\`\`${stderr}\`\`\``);
                message.channel.send(`\`\`\`${stdout}\`\`\``);
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
                message.channel.send(`\`\`\`${res}\`\`\``);
            } else {
                if(fs.existsSync(path)){
                    let res = fs.readdirSync(path).join("  //  ");
                    if (!res||res == "") return message.channel.send("empty path")
                    if(res.length>1994){
                        let res0 = res.match(/.{1,1994}/g);
                        for(i of res0){
                            message.channel.send(`\`\`\`${i}\`\`\``);
                        }
                    }else{
                        message.channel.send(`\`\`\`${res}\`\`\``);
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
                message.channel.send(`${filepath} uploaded`);
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
        
        //new user command
        if(cmd===`${prefix}newcmd` || cmd===`${prefix}newcommand`){
            const numFilter = m => !isNaN(m.content);
            const nonFilter = m => m.content!=undefined;
            let nCmdName;
            let nCmd;
            let nCmdArg;
            message.channel.send("Number of args?").then(function(){
                message.channel.awaitMessages(numFilter, { max: 1, time: 60000, errors: ['time'] })
                .then(function(collected){
                    nCmdArg = collected.first().content;
                    message.channel.send("Shell command? use `~arg[number]~` for arguments.").then(function(){
                        message.channel.awaitMessages(nonFilter, { max: 1, time: 60000, errors: ['time'] })
                        .then(function(collected){
                            nCmd = collected.first().content.replace(/"/g,'\\"');
                            message.channel.send("Command name?").then(function(){
                                message.channel.awaitMessages(nonFilter, { max: 1, time: 60000, errors: ['time'] })
                                .then(function(collected){
                                    nCmdName = collected.first().content;

                                    let commands = JSON.parse(fs.readFileSync("./uCommands.json", "utf8"));
        
                                    commands[nCmdName] = {
                                        args: nCmdArg,
                                        exec: nCmd
                                    };

                                    try {
                                        fs.writeFileSync("./uCommands.json", JSON.stringify(commands));
                                        message.channel.send(`Added ${nCmdName} command.`);
                                    } catch (err) {
                                        message.channel.send(`ERROR: Cannot write to uCommands.json.`);
                                    }

                                }).catch(collected => collected.first().channel.send("Timeout error"));
                            });
                        }).catch(collected => collected.first().channel.send("Timeout error"));
                    });
                }).catch(collected => collected.first().channel.send("Timeout error"));
            });
        }

        //delete user made cmd
        if(cmd===`${prefix}delcmd` || cmd===`${prefix}deletecmd` || cmd===`${prefix}deletecommand` || cmd===`${prefix}delcommand`){
            if(JSON.parse(fs.readFileSync("./uCommands.json", "utf8"))[args[0]]){
                let commands = JSON.parse(fs.readFileSync("./uCommands.json", "utf8"));
                delete commands[args[0]];
                try {
                    fs.writeFileSync("./uCommands.json", JSON.stringify(commands));
                    message.channel.send(`Removed ${args[0]} command.`);
                } catch (err) {
                    message.channel.send(`ERROR: Cannot write to uCommands.json.`);
                }
            } else {
                message.channel.send("Command does not exist");
            }
        }

        if (cmd===`${prefix}cmdlist`){
            let str = "```";
            let commands = JSON.parse(fs.readFileSync("./uCommands.json", "utf8"));
            for (i in commands){
                str+=`${i}:\n\t${commands[i].exec}\n`;
            }
            str+="```";
            message.channel.send(str);
        }


        //digest user made commands
        let rawCmd = cmd.replace(prefix, "");
        if(cmd.startsWith(`${prefix}`) && JSON.parse(fs.readFileSync("./uCommands.json", "utf8"))[`${rawCmd}`]){
            let commands = JSON.parse(fs.readFileSync("./uCommands.json", "utf8"));
            let uCmd = commands[`${rawCmd}`];
            let execCmd = uCmd.exec;
            for(i=0;i<=uCmd.args;i++){
                execCmd=execCmd.replace(`~arg${i+1}~`, args[i]);
            }
            exec(execCmd, (error, stdout, stderr) => {
                if (error) {
                    message.channel.send(`**ERROR**: \`\`\`${error.message}\`\`\``);
                    return;
                }
                if (stderr) message.channel.send(`**WARN**: \`\`\`${stderr}\`\`\``);
                if(stdout==''){
                    message.channel.send(`☑️`);
                } else {
                    message.channel.send(`\`\`\`${stdout}\`\`\``);
                }
            });
        }
    }
});
async function download(url,filepath){
    request.get(url)
        .on('error', console.error)
        .pipe(fs.createWriteStream(filepath));
}
client.login(config.token);