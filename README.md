# filebot

Version 1.0.0

Prerequisites: Node.js (and npm), youtube-dl

LINUX ONLY

## Description

General use Discord bot for remote server file management. I run it on a Raspberry Pi Zero.

### Command list

- `ls [optional: path]`
- `sh [command]` (execute linux command)
- `newmusic [name] [url]`
- `mkdir [path]`
- `rename [path] [path2]`
- `upload [path]`
- `retrieve [path]`
- `rm [path]`

#### Executable by anyone (not just owner(s))

- `music [url]` (sends mp3 file of given link; video version coming soon)

#### BETA

All of these have basically no edge-case protection right now. Use carefully.

- `newcmd/newcommand` adds new user-made command.
- `delcmd/delcommand/deletecommand/deletecmd` deletes user-made command.
- `cmdlist` lists user made commands

#### Changelog

- Empty stdout now sends checkmark
- Added `cmdlist` to readme
- Indented `cmdlist` output
- Made `tmp/` dir
- Changed how errors look
- Changed how some stdouts display
- Added `music` command

## License

MIT

## Credits

Authors:
[s7agv](https://github.com/s7agv)