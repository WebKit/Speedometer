# Sourcing and Methodology for FLOPS Performance Data

This document lists the sources, benchmarks, and references used to compile the historical performance data points of CPUs, GPUs, and TPUs in [flops-data.ts](./flops-data.ts).

---

## 1. CPUs and Supercomputers

Supercomputer metrics (from ENIAC to Frontier) refer to **Rmax** performance on the standard LINPACK benchmark. Microprocessor metrics represent peak theoretical floating-point performance (GFLOPS/MFLOPS).

-   **Zuse Z3 (1941) & ENIAC (1946)**
    -   _Source_: "The First Computers: History and Architectures" (Raul Rojas, MIT Press).
    -   _Reference_: Zuse Z3 could perform ~2 FLOPS (multiplication took 3 seconds). ENIAC performed ~5,000 additions or ~350 multiplications per second.
-   **UNIVAC I (1951) & IBM 704 (1954)**
    -   _Source_: IBM Archives & Unisys Historical Collections.
    -   _Reference_: IBM 704 floating point addition/subtraction took 84 microseconds (approx 12 KFLOPS theoretical peak, realistically ~4 KFLOPS under execution).
-   **CDC 6600 (1964) & Cray-1 (1976)**
    -   _Source_: Cray History Museum & Charles Babbage Institute.
    -   _Reference_: CDC 6600 designed by Seymour Cray had a peak of 3 MFLOPS. Cray-1 had a peak speed of 160 MFLOPS.
-   **Intel microprocessors (8086, 486, Pentium, Pentium 4, Core 2 Duo)**
    -   _Source_: Intel Microprocessor Datasheets, Manuals, and internal architecture specifications.
    -   _Reference_: TechPowerUp CPU database & Intel Developer Manuals.
-   **ASCI Red (1997) to Frontier (2022)**
    -   _Source_: **Top500 Supercomputer Database** (https://www.top500.org).
    -   _Reference_: Official Top500 performance lists (Rmax Linpack GFLOPS/TFLOPS/PFLOPS/EFLOPS measurements).

---

## 2. Graphics Processing Units (GPUs)

Performance points represent peak single-precision floating-point (FP32) arithmetic performance unless noted otherwise.

-   **Early 3D Graphics Hardware & Coprocessors (1982 to 1993)**
    -   _Source_: **Stanford / SGI Geometry Engine & RealityEngine Architecture Specifications**, Texas Instruments TMS340 Family Datasheets, and Weitek Coprocessor Specifications.
    -   _Reference_: Early workstation 3D graphics hardware (SGI IRIS 1000 Geometry Engine, SGI Indigo Extreme, SGI RealityEngine2) and programmable graphics coprocessors (TI TMS34010 GSP, TMS34020 + TMS34082A FPU, Weitek 4167).
-   **NVIDIA NV1 (1995) to GeForce 8800 GTX (2006)**
    -   _Source_: **TechPowerUp GPU Database** (https://www.techpowerup.com/gpu-specs/) & NVIDIA Corporate Archives.
    -   _Reference_: GeForce 256 peak theoretical fillrate and transform engine FP32 calculations. GeForce 8800 GTX introduced unified shaders (345.6 GFLOPS FP32).
-   **Radeon HD 4870 (2008) to GeForce RTX 4090 (2022)**
    -   _Source_: TechPowerUp GPU Database & AMD/NVIDIA official whitepapers.
    -   _Reference_: Official product specification sheets.
-   **NVIDIA A100 (2020) & H100 (2022)**
    -   _Source_: NVIDIA A100 / H100 Tensor Core GPU Architecture Whitepapers (NVIDIA Developer Zone).
    -   _Reference_: Standard dense FP32/Tensor core floating-point performance specifications.

---

## 3. Tensor Processing Units (TPUs)

TPU metrics represent peak performance for matrix multiplication and low-precision/mixed-precision training (specifically Google's custom Bfloat16/FP16 performance targets).

-   **Google TPU v1 (2015)**
    -   _Source_: "In-Datacenter Performance Analysis of a Tensor Processing Unit" (Google; International Symposium on Computer Architecture - ISCA 2017).
    -   _Reference_: Google's first custom ASIC designed for inference (92 TFLOPS matrix multiply unit).
-   **Google TPU v2 (2017) to TPU v5p (2023)**
    -   _Source_: **Google Cloud TPU System Architecture documentation** (https://cloud.google.com/tpu/docs/system-architecture).
    -   _Reference_: Official product descriptions detailing performance per TPU chip/vNode core.
-   **NVIDIA H100 NVL (2023)**
    -   _Source_: NVIDIA Hopper NVL PCIe Datasheet.
