# Verify
```
lsb_release -a
uname -a
bluetoothctl --version
pactl info
```

# Install Core Audio Stack
```
sudo apt update
sudo apt install -y \
pipewire pipewire-audio-client-libraries \
wireplumber pipewire-pulse \
bluez bluez-tools \
pavucontrol \
snapserver snapclient

systemctl --user --now enable pipewire pipewire-pulse wireplumber

systemctl --user mask pulseaudio

sudo reboot
```

# Verify pipeware is active
```
pactl info | grep "Server Name"
```

# Connecting Bluetooth
```
bluetoothctl

power on
agent on
default-agent
scan on

pair XX:XX:XX:XX:XX:XX
trust XX:XX:XX:XX:XX:XX
connect XX:XX:XX:XX:XX:XX

exit
```

# Force Mic Mode
```
pactl list cards short
```

Expected: 
```
pactl set-card-profile bluez_card.XX_XX_XX_XX_XX_XX headset-head-unit
```


```
pactl list short sources
```

Expected: 
```
bluez_input.XX_XX_XX_XX_XX_XX
```

# Verify Bluetooth Hardware
```
rfkill list
```
Expected: 
```
Bluetooth
Soft blocked: no
Hard blocked: no
```
Check
```
Powered: yes
```

# Make Ubuntu visible to your phone
```
power on
agent on
default-agent
pairable on
discoverable on

show
```

Expected: 
```
Discoverable: yes
Pairable: yes
```

Then Pair in Phone

# 