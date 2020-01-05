# LED 'Tablo' reloaded
This is the core source code of a 24x24 led-matrix built inside our highschool 'tablo' (a set of photos of finishing classes we hang on highschool walls in Hungary). It's physically located at the [Ujpest Bilingual Secondary Technical and Vocational School](http://umszki.hu/eng), where we graduated in 2003.

The original solution used a different architecture, it's documented (more or rather less) at [http://matrix.intro.hu/](http://matrix.intro.hu/). It worked pretty fine for 3-4 years until it probably got some over-voltage (or it wasn't properly designed for long-term usage). It took some 10 years to find some time to resurrect it with some more up-to-date technologies.

![Installed board](http://matrix.intro.hu/images/falon.jpg)

You can see it online at [https://gabor-farkas.github.io/ledvis-js](https://gabor-farkas.github.io/ledvis-js).

## Overall architecture
* There's a board of 576 simple red LEDs arranged to form a 24x24 matrix. The pins are connected in a way that it's actually a 12-row display with 48 columns - the right 'half' being at the bottom.
* There's a Raspberry PI 3 Model B executing the main program, it's running in NodeJS
* The NodeJS application controls GPIO pins using a native, direct peripheral access component, which is in charge of performing PWM on individual LEDs.
* There's a custom-built PCB panel for driving 12 rows and 48 columns of LEDs, using latch registers and output drivers.

The original software was written in IA32 (32 bit x86) assembly that ran on a Pentium machine. Since then we have more powerful microcontrollers and embedded system solutions, so I didn't want to opt for a PC-based solution this time. There are IA32-based microcontrollers out there, but they have to little storage included for the entire program to fit (including the video data). I finally opted for a Raspberry PI as it's easily developed and maintained, and opens up further possibilities for the system.

This meant I had to re-implement the original IA32 assembly code in some other language that runs on Raspberry. Of course I wanted to write an IA32 emulator but I finally let that go :) - I re-implemented the code in javascript, this way it can also run in a regular browser (like you can see in the link above) and it can run in NodeJS as well.

## LED Drivers and PWM
So the display is actually sized 48x12. These LED displays usually work litting only one row at a time, iterating over the rows again and again, enabling the corresponding columns for each row. If this iteration (the raster speed) is too slow, you'll see some fickering. This raster-based driving makes text scrolling look a bit 'bent' on some displays and this same solution can make your microwave display look a bit 'dizzy' if you move your eyes around. Having a high enough frequency eliminates these effects though.

To allow a few brightness modes for individual LEDs, we need a much higher raster frequency. In the original solution I used 32 overall iterations for a single frame display. When a LED is only lit for 1 out of this 32, it appears dimmer. If it is lit all 32 times, it appears brighter.

The LEDs in the board are connected in a way that columns are connected to the negative poles and rows are connected to the positive poles of the LEDs. As for one column only one row is lit at a time, but a single row has to handle 48 LEDs, I used a stronger transistor-based switching for the rows, allowing up to 4 amperes nominally (but that would mean a fully lit 48-row for a longer period of time, which regularly doesn't occur).

The controller board the needs to use 48 lower power switches for the columns, allowing each bit to be controlled, and higher power switch array of 12 items, but we need only one row at a time. For the columns then there are 6 latches (74573, registers that store data) followed by an open-collector darlington array, ULN2803a, that this way can switch their outputs between being 'disconnected to air' and connected to ground, allowing notable currents, and followed by resistors.

For the rows I used two 3-to-8 demultiplexers (I just couldn't find a THT, 4-to-16 demux in stock anywhere). These outputs are followed by 7407 drivers to allow higher currents. These outputs control BD242 PNP transistors to put the row wires to Vcc.

This LED Driver panel is controlled over Raspberry GPIO pins by using these signals:
* a 8-bit data bus to write to the column registers
* 6 wires for the Load Enable for each column register
* A 3-bit row address bus connected to the demultiplexers
* 2 output enable wires for each demultiplexer
* An output enable wire for all column registers

https://github.com/gabor-farkas/tablo/tree/master/nyak/tablo