// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

export interface TimelineCard {
    id: string;
    title: string;
    description: string;
    links: { wikipedia: string; [key: string]: string };
    tags: string[];
    year?: string | number;
    image?: string;
    video?: string;
    icon?: string;
}
