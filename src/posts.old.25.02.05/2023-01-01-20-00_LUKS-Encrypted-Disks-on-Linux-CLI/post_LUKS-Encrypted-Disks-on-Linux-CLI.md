---
title: Using LUKS Encrypted 🔐 Disks w/ Linux 🐧 on The CLI
permalink: luks-encrypted-desk-with-linux-cli
thumbnail: thumbnail_luks-encrypted-disks-on-linux-cli.avif
featured: true
tags: [LUKS, encryption, disk, rsync, tutorial, security]
excerpt: 'In this scenario, I create an encrypted LUKS disk to periodically save the `Documents/` folder with Rsync, from a computer that does not have a GUI.'
authors: [F1LT3R]
type: guide
---

In this scenario, I create an encrypted LUKS disk to periodically save the `Documents/` folder with Rsync, from a computer that does not have a GUI.

## Creating a LUKS Disk

```bash
# Snapshot the disk list
BEFORE=$(mktemp); lsblk > "$BEFORE"

# [PLUG IN DISK]

# Snapshot changed disk list
AFTER=$(mktemp); lsblk > "$AFTER"

# Show the disks changed
diff -U0 -w "$BEFORE" "$AFTER" | tail -n +4

# Remove tmps
rm "$BEFORE" "$AFTER"

# Setup luksFormat Disk
sudo cryptsetup luksFormat /dev/xvdj

# [TYPE "YES"]
# [Enter Password]
# [Enter Confirmation Password]

# Open Encrypted Partition
sudo cryptsetup luksOpen /dev/xvdj DATA

# Install XFS Tools is necessary 
sudo apt install xfsprogs

# Add XFS File System
# (sudo apt install xfsprogs)
sudo mkfs.xfs /dev/mapper/DATA
```


## Mounting a LUKS Disk

```bash
# Attach disk to Qube 

# Replace xvdi, DATA with actual names
sudo cryptsetup luksOpen /dev/xvdi DATA

# See drive on mapper
ls /dev/mapper/DATA

# Create mount point
sudo mkdir /media/user/DATA

# Mount the partition
sudo mount /dev/mapper/DATA /media/user/DATA

# Rsync ~/Documents, excluding node_modules
sudo rsync -av --exclude="node_modules:*.un~" ~/Documents /media/user/DATA
```


## Unmounting a LUKS Disk

```bash
# Unmount the disk
sudo umount /media/user/DATA

sudo rm -r /media/user/DATA

# Close the encrypted partition
sudo cryptsetup luksClose DATA
```
