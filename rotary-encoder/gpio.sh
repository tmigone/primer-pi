#!/bin/bash

export_gpio() {
    local pin=$1
    local direction=$2
    if [ ! -d "/sys/class/gpio/gpio$pin" ]; then
        echo "$pin" > /sys/class/gpio/export
        echo "$direction" > /sys/class/gpio/gpio$pin/direction
        echo "GPIO $pin has been exported and set as $direction"
    else
        echo "GPIO $pin is already exported"
    fi
}

export_gpio 17 out
export_gpio 22 out
export_gpio 27 out