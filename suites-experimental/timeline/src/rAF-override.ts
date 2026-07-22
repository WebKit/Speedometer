// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

// Override requestAnimationFrame with setTimeout(0) so Speedometer can properly measure scheduled work in benchmark steps.
if (typeof window !== "undefined") {
    let idCounter = 1;
    const timers = new Map<number, any>();
    window.requestAnimationFrame = (callback: (time: number) => void): number => {
        const id = idCounter++;
        const timerId = setTimeout(() => {
            timers.delete(id);
            callback(performance.now());
        }, 0);
        timers.set(id, timerId);
        return id;
    };
    window.cancelAnimationFrame = (id: number): void => {
        const timerId = timers.get(id);
        if (timerId !== undefined) {
            clearTimeout(timerId);
            timers.delete(id);
        }
    };
}
if (typeof globalThis !== "undefined" && typeof window !== "undefined") {
    (globalThis as any).requestAnimationFrame = (window as any).requestAnimationFrame;
    (globalThis as any).cancelAnimationFrame = (window as any).cancelAnimationFrame;
}
