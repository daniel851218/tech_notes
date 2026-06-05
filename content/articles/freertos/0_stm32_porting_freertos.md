---
title: "Porting FreeRTOS to STM32F103C8T6"
date: "2026-05-12"
tags: ["Setup"]
series: "FreeRTOS"
summary: "Porting FreeRTOS: A step-by-step guide to adding FreeRTOS to an STM32F103C8T6 project, including kernel setup, interrupt handler mapping, build configuration, and IDE integration."
slug: "stm32-porting-freertos"
---

## Download FreeRTOSv202406.04-LTS
[https://github.com/FreeRTOS/FreeRTOS-LTS/releases/tag/202406.04-LTS](https://github.com/FreeRTOS/FreeRTOS-LTS/releases/tag/202406.04-LTS)
<br>
<br>

## Project Folder Structure
`CMSIS` and `STM32F10x_StdPeriph_Driver` are extracted from STM32F10x Standard Peripheral Library.

`FreeRTOS-Kernel` is extracted and copied form `FreeRTOSv202406.04-LTS/FreeRTOS-LTS/FreeRTOS/FreeRTOS-Kernel`.

```ASCII
proj_folder/
├─ Build/
│
├─ Lib/
│  ├─ CMSIS
│  ├─ STM32F10x_StdPeriph_Driver
│  └─ FreeRTOS-Kernel
│
├─ User/
│  ├─ main.c
│  ├─ stm32f10x_conf.h
│  ├─ stm32f10x_it.c
│  ├─ stm32f10x_it.h
│  └─ FreeRTOSConfig.h
│
├─ Makefile
├─ stm32f103_linker_script.ld
```


## Modify `startup_stm32f10x_md.s`

Find the following symbols, and 

Replace `SVC_Handler` to `vPortSVCHandler`

Replace `PendSV_Handler` to `xPortPendSVHandler`

Replace `SysTick_Handler` to `xPortSysTickHandler`
<br>
<br>

## Configure FreeRTOS

`FreeRTOSConfig.h`
```c
/*
 * FreeRTOS Kernel V11.1.0
 * Copyright (C) 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 */

#ifndef FREERTOS_CONFIG_H
#define FREERTOS_CONFIG_H

/******************************************************************************/
/* Hardware description related definitions. **********************************/
/******************************************************************************/
#define configCPU_CLOCK_HZ    ( ( unsigned long ) 72000000 )

/******************************************************************************/
/* Scheduling behaviour related definitions. **********************************/
/******************************************************************************/
#define configTICK_RATE_HZ                         1000
#define configUSE_PREEMPTION                       1
#define configUSE_TIME_SLICING                     1
#define configUSE_PORT_OPTIMISED_TASK_SELECTION    1
#define configUSE_TICKLESS_IDLE                    0
#define configMAX_PRIORITIES                       8
#define configMINIMAL_STACK_SIZE                   128
#define configMAX_TASK_NAME_LEN                    16
#define configTICK_TYPE_WIDTH_IN_BITS              TICK_TYPE_WIDTH_32_BITS
#define configIDLE_SHOULD_YIELD                    1
#define configTASK_NOTIFICATION_ARRAY_ENTRIES      1
#define configQUEUE_REGISTRY_SIZE                  0
#define configENABLE_BACKWARD_COMPATIBILITY        0
#define configNUM_THREAD_LOCAL_STORAGE_POINTERS    0
#define configUSE_MINI_LIST_ITEM                   1
#define configSTACK_DEPTH_TYPE                     uint16_t
#define configMESSAGE_BUFFER_LENGTH_TYPE           uint16_t
#define configHEAP_CLEAR_MEMORY_ON_FREE            1
#define configSTATS_BUFFER_MAX_LENGTH              512
#define configUSE_NEWLIB_REENTRANT                 0

/******************************************************************************/
/* Software timer related definitions. ****************************************/
/******************************************************************************/
#define configUSE_TIMERS                1
#define configTIMER_TASK_PRIORITY       3
#define configTIMER_TASK_STACK_DEPTH    configMINIMAL_STACK_SIZE
#define configTIMER_QUEUE_LENGTH        10

/******************************************************************************/
/* Event Group related definitions. *******************************************/
/******************************************************************************/
#define configUSE_EVENT_GROUPS    1

/******************************************************************************/
/* Stream Buffer related definitions. *****************************************/
/******************************************************************************/
#define configUSE_STREAM_BUFFERS    1

/******************************************************************************/
/* Memory allocation related definitions. *************************************/
/******************************************************************************/
#define configSUPPORT_STATIC_ALLOCATION              0
#define configSUPPORT_DYNAMIC_ALLOCATION             1
#define configTOTAL_HEAP_SIZE                        ( ( size_t ) ( 10 * 1024 ) )
#define configAPPLICATION_ALLOCATED_HEAP             0
#define configSTACK_ALLOCATION_FROM_SEPARATE_HEAP    0
#define configENABLE_HEAP_PROTECTOR                  0

/******************************************************************************/
/* Interrupt nesting behaviour configuration. *********************************/
/******************************************************************************/
#define configPRIO_BITS                         4
#define configKERNEL_INTERRUPT_PRIORITY          ( 15 << (8 - configPRIO_BITS) )
#define configMAX_SYSCALL_INTERRUPT_PRIORITY     ( 5 << (8 - configPRIO_BITS) )
#define configMAX_API_CALL_INTERRUPT_PRIORITY    ( 5 << (8 - configPRIO_BITS) )

/******************************************************************************/
/* Hook and callback function related definitions. ****************************/
/******************************************************************************/
#define configUSE_IDLE_HOOK                   0
#define configUSE_TICK_HOOK                   0
#define configUSE_MALLOC_FAILED_HOOK          0
#define configUSE_DAEMON_TASK_STARTUP_HOOK    0
#define configUSE_SB_COMPLETED_CALLBACK       0
#define configCHECK_FOR_STACK_OVERFLOW        0

/******************************************************************************/
/* Run time and task stats gathering related definitions. *********************/
/******************************************************************************/
#define configGENERATE_RUN_TIME_STATS           0
#define configUSE_TRACE_FACILITY                0
#define configUSE_STATS_FORMATTING_FUNCTIONS    0

/******************************************************************************/
/* Co-routine related definitions. ********************************************/
/******************************************************************************/
#define configUSE_CO_ROUTINES              0
#define configMAX_CO_ROUTINE_PRIORITIES    2

/******************************************************************************/
/* Debugging assistance. ******************************************************/
/******************************************************************************/
#define configASSERT( x )         \
    if( ( x ) == 0 )              \
    {                             \
        taskDISABLE_INTERRUPTS(); \
        for( ; ; )                \
        ;                         \
    }

/******************************************************************************/
/* Definitions that include or exclude functionality. *************************/
/******************************************************************************/
#define configUSE_TASK_NOTIFICATIONS           1
#define configUSE_MUTEXES                      1
#define configUSE_RECURSIVE_MUTEXES            1
#define configUSE_COUNTING_SEMAPHORES          1
#define configUSE_QUEUE_SETS                   0
#define configUSE_APPLICATION_TASK_TAG         0

#define INCLUDE_vTaskPrioritySet               1
#define INCLUDE_uxTaskPriorityGet              1
#define INCLUDE_vTaskDelete                    1
#define INCLUDE_vTaskSuspend                   1
#define INCLUDE_xResumeFromISR                 1
#define INCLUDE_vTaskDelayUntil                1
#define INCLUDE_vTaskDelay                     1
#define INCLUDE_xTaskGetSchedulerState         1
#define INCLUDE_xTaskGetCurrentTaskHandle      1
#define INCLUDE_uxTaskGetStackHighWaterMark    0
#define INCLUDE_xTaskGetIdleTaskHandle         0
#define INCLUDE_eTaskGetState                  0
#define INCLUDE_xEventGroupSetBitFromISR       1
#define INCLUDE_xTimerPendFunctionCall         0
#define INCLUDE_xTaskAbortDelay                0
#define INCLUDE_xTaskGetHandle                 0
#define INCLUDE_xTaskResumeFromISR             1

#endif /* FREERTOS_CONFIG_H */
```


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


## Makefile
`Makefile`

```makefile
# Project Name
TARGET    	:= main
BUILD_DIR 	:= Build

# Toolchain
CC			:= arm-none-eabi-gcc
OBJCOPY 	:= arm-none-eabi-objcopy
SIZE    	:= arm-none-eabi-size

# Paths
ST_LIB 		:= Lib/STM32F10x_StdPeriph_Driver
CMSIS  		:= Lib/CMSIS
FREERTOS 	:= Lib/FreeRTOS-Kernel
USER   		:= User

# Sources
C_SRCS := $(USER)/$(TARGET).c
C_SRCS += $(USER)/stm32f10x_it.c
C_SRCS += $(ST_LIB)/src/stm32f10x_gpio.c
C_SRCS += $(ST_LIB)/src/stm32f10x_rcc.c
C_SRCS += $(CMSIS)/CM3/DeviceSupport/ST/STM32F10x/system_stm32f10x.c
C_SRCS += $(FREERTOS)/list.c
C_SRCS += $(FREERTOS)/queue.c
C_SRCS += $(FREERTOS)/tasks.c
C_SRCS += $(FREERTOS)/timers.c
C_SRCS += $(FREERTOS)/portable/GCC/ARM_CM3/port.c
C_SRCS += $(FREERTOS)/portable/MemMang/heap_4.c

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
CFLAGS += -I$(FREERTOS)/include
CFLAGS += -I$(FREERTOS)/portable/GCC/ARM_CM3
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
                "${workspaceFolder}/Lib/CMSIS/CM3/DeviceSupport/ST/STM32F10x",
                "${workspaceFolder}/Lib/FreeRTOS-Kernel/include",
                "${workspaceFolder}/Lib/FreeRTOS-Kernel/portable/GCC/ARM_CM3"
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