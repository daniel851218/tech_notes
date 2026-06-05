---
title: "Setup STM32F103C8T6 Development Environment on Ubuntu"
date: "2026-05-02"
tags: ["Setup"]
series: "STM32"
summary: "Setup STM32 environment: A practical guide to building, linking, flashing, and configuring an STM32F103C8T6 bare-metal project on Ubuntu."
slug: "setup-stm32-env"
---

## Development Board
STM32F103C8T6 Blue Pill

- ARM Cortex-M3, 72MHz

- Flash: 128KB

- RAM: 20KB

- Programmer/Debugger: ST-Link V2

![STM32 Blue Pill](https://deepbluembedded.com/wp-content/uploads/2020/06/Bluepillpinout.gif "STM32 Blue Pill")
<br>
<br>

## Install Tool Chain

```bash
sudo apt install gcc-arm-none-eabi
```
<br>

## Project Folder Structure
`CMSIS` and `STM32F10x_StdPeriph_Driver` are extracted from STM32F10x Standard Peripheral Library.

```ASCII
proj_folder/
├─ Build/
├─ Lib/
│  ├─ CMSIS
│  ├─ STM32F10x_StdPeriph_Driver
├─ User/
│  ├─ main.c
│  ├─ stm32f10x_conf.h
│  ├─ stm32f10x_it.c
│  ├─ stm32f10x_it.h
├─ Makefile
├─ stm32f103_linker_script.ld
```
<br>

## Download STM32F10x Standard Peripheral Library
[https://www.st.com/en/embedded-software/stsw-stm32054.html](https://www.st.com/en/embedded-software/stsw-stm32054.html)
<br>
<br>

## Linker Script
`stm32f103_linker_script.ld`
```linker-script
/* Entry Point, Reset_Handler is defined in "startup_stm32f10x_md.s" */
ENTRY(Reset_Handler)

/* Specify the memory areas */
MEMORY
{
  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 128K
  RAM (xrw)   : ORIGIN = 0x20000000, LENGTH = 20K
}

/* Top of RAM, Cortex-M stack grows downwards */
_estack = ORIGIN(RAM) + LENGTH(RAM);

/* Define minimum heap and stack sizes */
_Min_Heap_Size = 0x200;      /* 512 bytes */
_Min_Stack_Size = 0x400;     /* 1 KB */

SECTIONS
{
  /* The startup code and Interrupt Vector Table go first into FLASH */
  .isr_vector :
  {
    . = ALIGN(4);
    KEEP(*(.isr_vector))    /* Tell the linker do not discard this section */
    . = ALIGN(4);
  } >FLASH

  /* The program code and other data goes into FLASH */
  .text :
  {
    . = ALIGN(4);
    *(.text)                /* .text sections (code) */
    *(.text*)               /* .text* sections (code) */
    *(.glue_7)              /* glue arm to thumb code */
    *(.glue_7t)             /* glue thumb to arm code */
    *(.eh_frame)            /* For C++ exception handling */

    KEEP (*(.init))         /* For C++ constructors */
    KEEP (*(.fini))         /* For C++ destructors */

    . = ALIGN(4);
    _etext = .;             /* define a global symbols at end of code */
  } >FLASH

  /* Read-only data goes into FLASH */
  .rodata :
  {
    . = ALIGN(4);
    *(.rodata)              /* .rodata sections (constants, strings, etc.) */
    *(.rodata*)             /* .rodata* sections */
    . = ALIGN(4);
  } >FLASH

  /* Used by the startup to initialize data */
  _sidata = LOADADDR(.data);

  /* Initialized data sections go into RAM, but are stored in FLASH */
  .data : 
  {
    . = ALIGN(4);
    _sdata = .;        /* create a global symbol at data start */
    *(.data)           /* .data sections */
    *(.data*)          /* .data* sections */

    . = ALIGN(4);
    _edata = .;        /* define a global symbol at data end */
  } >RAM AT> FLASH

  /* Uninitialized data section into RAM */
  .bss :
  {
    . = ALIGN(4);
    _sbss = .;         /* define a global symbol at bss start */
    __bss_start__ = _sbss;
    *(.bss)
    *(.bss*)
    *(COMMON)

    . = ALIGN(4);
    _ebss = .;         /* define a global symbol at bss end */
    __bss_end__ = _ebss;
  } >RAM

  /* User_heap_stack section, used to check that there is enough RAM left */
  ._user_heap_stack :
  {
    . = ALIGN(8);
    PROVIDE ( end = . );
    PROVIDE ( _end = . );
    . = . + _Min_Heap_Size;
    . = . + _Min_Stack_Size;
    . = ALIGN(8);
  } >RAM

  /* Remove information from the standard libraries */
  /DISCARD/ :
  {
    libc.a ( * )
    libm.a ( * )
    libgcc.a ( * )
  }
}
```
<br>

## Makefile
`Makefile`
```makefile
# Project Name
TARGET    := main
BUILD_DIR := Build

# Toolchain
CC      := arm-none-eabi-gcc
OBJCOPY := arm-none-eabi-objcopy
SIZE    := arm-none-eabi-size

# Paths
ST_LIB := Lib/STM32F10x_StdPeriph_Driver
CMSIS  := Lib/CMSIS
USER   := User

# Sources
C_SRCS := $(USER)/$(TARGET).c
C_SRCS += $(USER)/stm32f10x_it.c
C_SRCS += $(ST_LIB)/src/stm32f10x_gpio.c
C_SRCS += $(ST_LIB)/src/stm32f10x_rcc.c
C_SRCS += $(CMSIS)/CM3/DeviceSupport/ST/STM32F10x/system_stm32f10x.c

# Startup File
ASM_SRCS := $(CMSIS)/CM3/DeviceSupport/ST/STM32F10x/startup/gcc_ride7/startup_stm32f10x_md.s

# Object Files
OBJS := $(addprefix $(BUILD_DIR)/,$(C_SRCS:.c=.o))
OBJS += $(addprefix $(BUILD_DIR)/,$(ASM_SRCS:.s=.o))

# Include dependencies
DEPS := $(OBJS:.o=.d)
-include $(DEPS)

# Compiler Flags
CFLAGS := -g -O0 -Wall -Wextra
CFLAGS += -mlittle-endian -mthumb -mcpu=cortex-m3 -msoft-float
CFLAGS += -ffunction-sections -fdata-sections
CFLAGS += -DSTM32F10X_MD -DUSE_STDPERIPH_DRIVER
CFLAGS += -I$(USER)
CFLAGS += -I$(ST_LIB)/inc
CFLAGS += -I$(CMSIS)/CM3/DeviceSupport/ST/STM32F10x
CFLAGS += -I$(CMSIS)/CM3/CoreSupport
CFLAGS += -MMD -MP

# Linker Flag
LDFLAGS := -Tstm32f103_linker_script.ld
LDFLAGS += --specs=nosys.specs
LDFLAGS += -mcpu=cortex-m3 -mthumb
LDFLAGS += -Wl,--gc-sections

.PHONY: all clean flash

# Default target
all: $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).hex $(BUILD_DIR)/$(TARGET).bin
	$(SIZE) $(BUILD_DIR)/$(TARGET).elf

# HEX
$(BUILD_DIR)/$(TARGET).hex: $(BUILD_DIR)/$(TARGET).elf
	$(OBJCOPY) -O ihex $< $@

# BIN
$(BUILD_DIR)/$(TARGET).bin: $(BUILD_DIR)/$(TARGET).elf
	$(OBJCOPY) -O binary $< $@

# ELF
$(BUILD_DIR)/$(TARGET).elf: $(OBJS)
	$(CC) $(OBJS) $(LDFLAGS) -o $@

# Compile C
$(BUILD_DIR)/%.o: %.c
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

# Compile ASM
$(BUILD_DIR)/%.o: %.s
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

# --------------------------------------------------

# Clean
clean:
	rm -rf $(BUILD_DIR)

# --------------------------------------------------

# Program Flash
flash:
	st-flash --format ihex write $(BUILD_DIR)/$(TARGET).hex
# 	openocd -f interface/stlink.cfg -f target/stm32f1x.cfg -c "program $(BUILD_DIR)/$(TARGET).elf verify reset exit"
```
<br>

## Flash Programming Tool
### Option 1: ST-Link Tools

Install ST-Link
```bash
sudo apt install stlink-tools
```

Setup USB Permissions (udev rules)
```bash
sudo nano /etc/udev/rules.d/49-stlinkv2.rules
```

```bash
# ST-LINK V2
SUBSYSTEM=="usb", ATTR{idVendor}=="0483", ATTR{idProduct}=="3748", MODE="0666"

# ST-LINK V2.1
SUBSYSTEM=="usb", ATTR{idVendor}=="0483", ATTR{idProduct}=="374b", MODE="0666"
```

Reload rules
```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Verify Connection
```bash
st-info --probe
```

Programming `.bin` file (`0x8000000` is the default flash start address)
```bash
st-flash write firmware.bin 0x8000000
```

Or Programming `.hex` file

```bash
st-flash --format ihex write firmware.hex
```

### Option 2: OpenOCD

Install OpenOCD
```bash
sudo apt install openocd
```

Verify Connection
```bash
openocd -f interface/stlink.cfg -f target/stm32f1x.cfg
```

Programming `.bin` file
```bash
openocd -f interface/stlink.cfg -f target/stm32f1x.cfg -c "program firmware.bin 0x08000000 verify reset exit"
```

Or Programming `.elf` file

```bash
openocd -f interface/stlink.cfg -f target/stm32f1x.cfg -c "program firmware.elf verify reset exit"
```

## VS Code Configuration
Press `Ctrl+Shift+P` and click `C/C++: Edit Configurations (JSON)` to modify ***Compiler Path***, ***Include Path*** and ***Defines*** in `c_cpp_properties.json`.

```json
{
    "configurations": [
        {
            "name": "Linux",
            "includePath": [
                "${workspaceFolder}/**",
                "${workspaceFolder}/User",
                "${workspaceFolder}/Lib/STM32F10x_StdPeriph_Driver/inc",
                "${workspaceFolder}/Lib/CMSIS/CM3/CoreSupport",
                "${workspaceFolder}/Lib/CMSIS/CM3/DeviceSupport/ST/STM32F10x"
            ],
            "defines": [
                "STM32F10X_MD",
                "USE_STDPERIPH_DRIVER"
            ],
            "compilerPath": "/usr/bin/arm-none-eabi-gcc",
            "cStandard": "c17",
            "cppStandard": "gnu++17",
            "intelliSenseMode": "linux-gcc-x64"
        }
    ],
    "version": 4
}
```


<br>

## Official Documents
- [Datasheet](https://www.st.com/resource/en/datasheet/stm32f103c8.pdf)
- [Reference Manual](https://www.st.com/resource/en/reference_manual/rm0008-stm32f101xx-stm32f102xx-stm32f103xx-stm32f105xx-and-stm32f107xx-advanced-armbased-32bit-mcus-stmicroelectronics.pdf)
- [Others](https://www.st.com/content/st_com/en/products/microcontrollers-microprocessors/stm32-32-bit-arm-cortex-mcus/stm32-mainstream-mcus/stm32f1-series/stm32f103/stm32f103c8.html#documentation)