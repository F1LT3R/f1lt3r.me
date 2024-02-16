---
title: 'Down Boy! (Kill Processes by Port)'
permalink: down-boy-kill-processes-by-port
thumbnail: thumbnail_down-boy-kill-processes-by-port.jpg
featured: true
tags: [Agile, Scrum, Story Points, Time, Complexity]
excerpt: 'Need to kill processes by port? Try this script that lets you kill multiple processes on multiple ports simultaneously.'
authors: [F1LT3R]
type: script
---

Need to kill processes by port? Try this...

## Setup

Save this bash script as `downboy` to your bin directory:

```bash
#!/bin/bash
for PORT in $@
do
    PID=$(lsof -i :$PORT | awk 'FNR ==2 {print $2}')
    echo "kill -9 $PID"
    kill -9 $PID
done
```

Make `downboy` executable:

```sh
chmod +X ./downboy
```

## Usage

Now you can easily close any number of processes by their port:

```sh
sudo downboy 80 8080 3000
```

Bye-bye.
