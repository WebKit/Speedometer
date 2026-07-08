# Sourcing and Methodology for FLOPS Performance Data

This document lists the sources, benchmarks, and references used to compile the historical performance data points of CPUs, GPUs, and TPUs in [flops-data.ts](./flops-data.ts).

---

## 1. CPUs and Supercomputers

Supercomputer metrics (from ENIAC to Frontier) refer to **Rmax** performance on the standard LINPACK benchmark. Microprocessor metrics represent peak theoretical floating-point performance (GFLOPS/MFLOPS).

*   **Zuse Z3 (1941) & ENIAC (1946)**
    *   *Source*: "The First Computers: History and Architectures" (Raul Rojas, MIT Press).
    *   *Reference*: Zuse Z3 could perform ~2 FLOPS (multiplication took 3 seconds). ENIAC performed ~5,000 additions or ~350 multiplications per second.
*   **UNIVAC I (1951) & IBM 704 (1954)**
    *   *Source*: IBM Archives & Unisys Historical Collections.
    *   *Reference*: IBM 704 floating point addition/subtraction took 84 microseconds (approx 12 KFLOPS theoretical peak, realistically ~4 KFLOPS under execution).
*   **CDC 6600 (1964) & Cray-1 (1976)**
    *   *Source*: Cray History Museum & Charles Babbage Institute.
    *   *Reference*: CDC 6600 designed by Seymour Cray had a peak of 3 MFLOPS. Cray-1 had a peak speed of 160 MFLOPS.
*   **Intel microprocessors (8086, 486, Pentium, Pentium 4, Core 2 Duo)**
    *   *Source*: Intel Microprocessor Datasheets, Manuals, and internal architecture specifications.
    *   *Reference*: TechPowerUp CPU database & Intel Developer Manuals.
*   **ASCI Red (1997) to Frontier (2022)**
    *   *Source*: **Top500 Supercomputer Database** (https://www.top500.org).
    *   *Reference*: Official Top500 performance lists (Rmax Linpack GFLOPS/TFLOPS/PFLOPS/EFLOPS measurements).

---

## 2. Graphics Processing Units (GPUs)

Performance points represent peak single-precision floating-point (FP32) arithmetic performance unless noted otherwise.

*   **NVIDIA NV1 (1995) to GeForce 8800 GTX (2006)**
    *   *Source*: **TechPowerUp GPU Database** (https://www.techpowerup.com/gpu-specs/) & NVIDIA Corporate Archives.
    *   *Reference*: GeForce 256 peak theoretical fillrate and transform engine FP32 calculations. GeForce 8800 GTX introduced unified shaders (345.6 GFLOPS FP32).
*   **Radeon HD 4870 (2008) to GeForce RTX 4090 (2022)**
    *   *Source*: TechPowerUp GPU Database & AMD/NVIDIA official whitepapers.
    *   *Reference*: Official product specification sheets.
*   **NVIDIA A100 (2020) & H100 (2022)**
    *   *Source*: NVIDIA A100 / H100 Tensor Core GPU Architecture Whitepapers (NVIDIA Developer Zone).
    *   *Reference*: Standard dense FP32/Tensor core floating-point performance specifications.

---

## 3. Tensor Processing Units (TPUs)

TPU metrics represent peak performance for matrix multiplication and low-precision/mixed-precision training (specifically Google's custom Bfloat16/FP16 performance targets).

*   **Google TPU v1 (2015)**
    *   *Source*: "In-Datacenter Performance Analysis of a Tensor Processing Unit" (Google; International Symposium on Computer Architecture - ISCA 2017).
    *   *Reference*: Google's first custom ASIC designed for inference (92 TFLOPS matrix multiply unit).
*   **Google TPU v2 (2017) to TPU v5p (2023)**
    *   *Source*: **Google Cloud TPU System Architecture documentation** (https://cloud.google.com/tpu/docs/system-architecture).
    *   *Reference*: Official product descriptions detailing performance per TPU chip/vNode core.
*   **NVIDIA H100 NVL (2023)**
    *   *Source*: NVIDIA Hopper NVL PCIe Datasheet.
