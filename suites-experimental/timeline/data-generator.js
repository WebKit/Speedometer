// Copyright (C) 2024-2026 Speedometer Contributors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted under the terms of the BSD 2-Clause License (see root LICENSE file).

export function generateTimelineData(numEvents = 1000) {
    const data = [];
    const categories = ["travel", "schools", "medical", "federal", "public-health"];
    const severities = ["low", "medium", "high"];

    let currentDate = new Date(2020, 0, 1); // Jan 1, 2020

    for (let i = 0; i < numEvents; i++) {
        const id = `event-${i}`;

        if (i % 2 === 0)
            currentDate.setDate(currentDate.getDate() + 1);

        const dateString = currentDate.toISOString().split("T")[0];

        if (i % 50 === 0) {
            data.push({
                id,
                type: "header",
                date: dateString,
                title: currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                text: `Phase ${Math.floor(i / 50) + 1} of the pandemic response.`,
            });
            continue;
        }

        if (i % 20 === 0) {
            data.push({
                id,
                type: "milestone",
                date: dateString,
                category: "medical",
                title: `Major Milestone: Phase ${Math.floor(i / 20)}`,
                text: "Significant progress reported in vaccine development or distribution. National case counts reach new thresholds.",
                severity: "high",
            });
            continue;
        }

        const category = categories[Math.floor(Math.random() * categories.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        let title = "";
        let text = "";

        switch (category) {
            case "travel":
                title = "Travel Restriction Imposed";
                text = "United States imposes travel restrictions on passengers arriving from regions with high infection rates. Screening protocols enhanced at major airports.";
                break;
            case "schools":
                title = "School District Transition";
                text = "Major school districts announce transition to remote learning models. Educators and parents adapt to online platforms amidst local case spikes.";
                break;
            case "medical":
                title = "Clinical Trial Update";
                text = "Researchers publish preliminary data on therapeutics. Hospitals report on ICU capacity and PPE supply chains.";
                break;
            case "federal":
                title = "Federal Policy Announcement";
                text = "Federal agencies issue new guidelines on workplace safety, economic relief packages, or emergency declarations.";
                break;
            case "public-health":
                title = "Public Health Advisory";
                text = "CDC updates recommendations on mask-wearing, social distancing, and testing availability. Local officials issue stay-at-home warnings.";
                break;
        }

        data.push({
            id,
            type: "event",
            date: dateString,
            category,
            title: `${title} (${i})`,
            text: `${text} Cumulative impact is assessed by local health departments.`,
            severity,
        });
    }

    return data;
}
