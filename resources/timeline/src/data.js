const TAGS = ["policy", "medical", "economy", "social"];

const HISTORIC_EVENTS = {
    "2020-01-21": { title: "First US Case Confirmed", desc: "CDC confirms the first laboratory-confirmed case of COVID-19 in the US (Washington State).", tags: ["medical"] },
    "2020-01-30": { title: "Public Health Emergency", desc: "WHO declares coronavirus outbreak a Public Health Emergency of International Concern.", tags: ["policy", "medical"] },
    "2020-01-31": { title: "US Restricts Travel from China", desc: "US announces restrictions on travelers entering from China, effective Feb 2.", tags: ["policy"] },
    "2020-02-06": { title: "First US COVID-19 Death", desc: "An individual in Santa Clara County, California, dies of COVID-19 (retrospectively confirmed).", tags: ["medical"] },
    "2020-02-26": { title: "First Possible Community Spread", desc: "CDC reports first case of unknown origin in California, suggesting community spread.", tags: ["medical"] },
    "2020-02-29": { title: "Stock Market Decline", desc: "Dow Jones finishes its worst week since the 2008 financial crisis on pandemic fears.", tags: ["economy"] },
    "2020-03-11": { title: "WHO Declares Pandemic", desc: "World Health Organization officially declares COVID-19 a global pandemic.", tags: ["medical"] },
    "2020-03-13": { title: "National Emergency Declared", desc: "US declares a national emergency, freeing up $50 billion in federal aid.", tags: ["policy"] },
    "2020-03-19": { title: "CA Statewide Stay-at-Home Order", desc: "California issues the nation's first statewide stay-at-home order.", tags: ["policy", "social"] },
    "2020-03-27": { title: "CARES Act Signed", desc: "A $2 trillion economic relief package is signed, providing stimulus checks and business loans.", tags: ["policy", "economy"] },
    "2020-04-03": { title: "CDC Recommends Masks", desc: "CDC advises the public to wear cloth face coverings in public settings.", tags: ["policy", "medical"] },
    "2020-04-11": { title: "US Death Toll Highest Globally", desc: "The US reports more COVID-19 deaths than any other country, surpassing Italy.", tags: ["medical"] },
    "2020-05-01": { title: "Remdesivir Emergency Auth", desc: "FDA issues emergency use authorization for remdesivir for hospitalized patients.", tags: ["medical"] },
    "2020-05-27": { title: "US Deaths Pass 100,000", desc: "The US recorded COVID-19 death toll surpasses 100,000.", tags: ["medical"] },
    "2020-06-20": { title: "Southern States Surge", desc: "Florida, Texas, and Arizona report record daily case increases as reopenings backfire.", tags: ["medical"] },
    "2020-07-08": { title: "US Passes 3 Million Cases", desc: "Cumulative confirmed cases in the United States surpass 3 million.", tags: ["medical"] },
    "2020-07-23": { title: "MLB Season Begins", desc: "Major League Baseball begins a shortened 60-game season in empty stadiums.", tags: ["social"] },
    "2020-08-17": { title: "Schools Open Remotely", desc: "Many major school districts begin the academic year with online-only classes.", tags: ["policy", "social"] },
    "2020-09-04": { title: "Eviction Moratorium", desc: "CDC issues a temporary national moratorium on evictions to prevent virus spread.", tags: ["policy", "economy"] },
    "2020-09-22": { title: "US Deaths Pass 200,000", desc: "The official COVID-19 death toll in the US surpasses 200,000.", tags: ["medical"] },
    "2020-10-02": { title: "President Tests Positive", desc: "President Donald Trump tests positive for COVID-19 and is hospitalized.", tags: ["policy", "medical"] },
    "2020-10-23": { title: "Third Wave Begins", desc: "Daily new cases hit record highs as colder weather drives people indoors.", tags: ["medical"] },
    "2020-11-09": { title: "Pfizer Vaccine 90% Effective", desc: "Pfizer and BioNTech announce their vaccine candidate is highly effective in trials.", tags: ["medical"] },
    "2020-11-18": { title: "US Passes 250,000 Deaths", desc: "The US passes a tragic milestone as the winter surge accelerates.", tags: ["medical"] },
    "2020-12-11": { title: "Pfizer Vaccine Emergency Auth", desc: "FDA issues first emergency use authorization for Pfizer-BioNTech COVID-19 vaccine.", tags: ["policy", "medical"] },
    "2020-12-14": { title: "First Vaccine Doses in US", desc: "The US vaccination campaign begins with healthcare workers receiving doses.", tags: ["medical"] },
    "2020-12-18": { title: "Moderna Vaccine Auth", desc: "FDA authorizes Moderna's COVID-19 vaccine for emergency use.", tags: ["policy", "medical"] },
};

// Helper to generate generic description if no historic event
function getGenericDesc(dateStr, type) {
    const dates = new Date(dateStr);
    const month = dates.toLocaleString("default", { month: "long" });
    if (type === "chart")
        return `Visualisation of cumulative statistics showing trends for the month of ${month}.`;

    if (type === "table")
        return `Detailed statistical breakdown of regional data recorded on ${dateStr}.`;

    return `Daily update on health protocols, community guidelines, and regional reports for ${month} ${dates.getDate()}, 2020.`;
}

// Stats simulation helper
function getStatsForDay(dayIndex) {
    let dailyCases = 0;
    let dailyDeaths = 0;

    if (dayIndex < 60) {
        dailyCases = Math.floor(Math.pow(dayIndex / 60, 3) * 5);
        dailyDeaths = dayIndex > 45 ? Math.random() < 0.1 ? 1 : 0 : 0;
    } else if (dayIndex < 120) {
        // Mar-Apr
        const t = (dayIndex - 60) / 60;
        dailyCases = Math.floor(200 + t * 30000 + Math.random() * 5000);
        dailyDeaths = Math.floor(t * 2000 + Math.random() * 300);
    } else if (dayIndex < 180) {
        // May-Jun
        const t = (dayIndex - 120) / 60;
        dailyCases = Math.floor(30000 - t * 10000 + Math.random() * 5000);
        dailyDeaths = Math.floor(2000 - t * 1200 + Math.random() * 200);
    } else if (dayIndex < 240) {
        // Jul-Aug
        const t = (dayIndex - 180) / 60;
        dailyCases = Math.floor(20000 + t * 50000 + Math.sin(t * Math.PI) * 10000 + Math.random() * 8000);
        dailyDeaths = Math.floor(800 + t * 400 + Math.random() * 150);
    } else if (dayIndex < 300) {
        // Sep-Oct
        const t = (dayIndex - 240) / 60;
        dailyCases = Math.floor(50000 + t * 30000 + Math.random() * 10000);
        dailyDeaths = Math.floor(900 + t * 100 + Math.random() * 100);
    } else {
        // Nov-Dec
        const t = (dayIndex - 300) / 65;
        dailyCases = Math.floor(80000 + t * 150000 + Math.random() * 30000);
        dailyDeaths = Math.floor(1000 + t * 2000 + Math.random() * 500);
    }

    return {
        newCases: Math.max(0, dailyCases),
        newDeaths: Math.max(0, dailyDeaths),
    };
}

export function generateDocumentData(count = 366) {
    const data = [];
    let currentDate = new Date("2020-01-01");
    let cumulativeCases = 0;
    let cumulativeDeaths = 0;

    for (let i = 0; i < count; i++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const id = `card-${dateStr}`;

        const stats = getStatsForDay(i);
        cumulativeCases += stats.newCases;
        cumulativeDeaths += stats.newDeaths;

        let type = "text";
        const rand = Math.random();
        if (rand < 0.1)
            type = "chart";
        else if (rand < 0.2)
            type = "table";

        const historicEvent = HISTORIC_EVENTS[dateStr];
        const title = historicEvent ? historicEvent.title : `Status Update: ${dateStr}`;
        const desc = historicEvent ? historicEvent.desc : getGenericDesc(dateStr, type);

        let tags = [];
        if (historicEvent) {
            tags = [...historicEvent.tags];
        } else {
            if (type === "chart" || type === "table") {
                tags.push("medical");
            } else {
                tags.push(TAGS[Math.floor(Math.random() * TAGS.length)]);
                if (Math.random() < 0.3)
                    tags.push(TAGS[Math.floor(Math.random() * TAGS.length)]);
            }
        }
        tags = [...new Set(tags)];

        const card = {
            id,
            date: dateStr,
            title,
            description: desc,
            tags,
            type,
            stats: {
                newCases: stats.newCases,
                newDeaths: stats.newDeaths,
                totalCases: cumulativeCases,
                totalDeaths: cumulativeDeaths,
            },
        };

        if (type === "text") {
            card.width = 350;
        } else if (type === "table") {
            card.width = 500;
            card.cells = [
                ["Region", "New Cases", "New Deaths", "Hospitalised"],
                ["Northeast", Math.floor(stats.newCases * 0.2).toString(), Math.floor(stats.newDeaths * 0.25).toString(), "Active"],
                ["Midwest", Math.floor(stats.newCases * 0.25).toString(), Math.floor(stats.newDeaths * 0.2).toString(), "Active"],
                ["South", Math.floor(stats.newCases * 0.35).toString(), Math.floor(stats.newDeaths * 0.4).toString(), "Critical"],
                ["West", Math.floor(stats.newCases * 0.2).toString(), Math.floor(stats.newDeaths * 0.15).toString(), "Stable"],
            ];
        } else if (type === "chart") {
            card.width = 550;
            card.chartData = {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [Math.floor(stats.newCases * 0.5), Math.floor(stats.newCases * 0.7), Math.floor(stats.newCases * 0.9), stats.newCases, Math.floor(stats.newCases * 0.8), Math.floor(stats.newCases * 0.6), Math.floor(stats.newCases * 0.5)],
            };
        }

        data.push(card);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
}
