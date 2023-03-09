import * as Plot from "@observablehq/plot";
import { csvParse } from "d3-dsv";
import * as d3Array from "d3-array";
import { format as d3Format } from "d3-format";
import airportsUrl from "./datasets/airports.csv?url";
import flightsUrl from "./datasets/flights-airports.csv?url";

async function loadFile(url) {
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Error while fetching url ${url}: (${response.status}) ${response.statusText}`);

    return response.text();
}

let preloaded = false;
let airportsString;
let flightsString;

async function preload() {
    if (preloaded)
        return;

    airportsString = await loadFile(airportsUrl);
    flightsString = await loadFile(flightsUrl);
    preloaded = true;
    document.getElementById("app").insertAdjacentHTML("beforeend", '<span id="ready">Data has been preloaded.</span>');
}

let preparedData;
function prepare() {
    if (!preloaded)
        throw new Error("Please preload the data first.");

    /**
     * AirportInformation: { state, iata, name, city, country, latitude, longitude }
     * airports: Array<AirportInformation>
     * flights: Array<{ origin, destination, count }>
     */
    const { airports, flights } = parseAirportsInformation(airportsString);
    /**
     * flightsByAirport: Map<iata: string, { origin: number, destination: number, total: number}>
     */
    const flightsByAirport = groupFlightsByAirports(flights);
    /**
     * byAirport: Map<iata: string, AirportInformation>
     */
    const byAirport = d3Array.index(airports, (d) => d.iata);

    /* Array<[state, AirportInformation[]]> */
    const airportsGroupedByStateArray = d3Array.groups(airports, (d) => d.state);

    /* DescSortedArray<[{ state: string, total: number, mostUsedAirportsInState: AirportInformation[] }]> */
    const stateInformationSortedArray = airportsGroupedByStateArray
        .map(([state, airportsInState]) => {
            const totalFlightsInState = d3Array.sum(airportsInState, ({ iata }) => flightsByAirport.get(iata)?.total);
            const sorted = d3Array.sort(airportsInState, ({ iata }) => -flightsByAirport.get(iata)?.total);
            const mostUsedAirportsInState = sorted.slice(0, 6);
            return {
                state,
                total: totalFlightsInState,
                mostUsedAirports: mostUsedAirportsInState,
            };
        })
        .sort((stateA, stateB) => stateB.total - stateA.total);

    /* Array<state: string> */
    const statesWithMostFlights = stateInformationSortedArray.map((info) => info.state).slice(0, 6);

    // Flatten the information in preparedData.statesWithMostFlights, so that we
    // have one item == one airport information.
    const plotData = stateInformationSortedArray.flatMap(({ mostUsedAirports, total, state }) => {
        const enrichedMostUsedAirports = mostUsedAirports.map(({ iata, name, city }, index) => ({
            state,
            iata,
            name,
            city,
            index,
            ...flightsByAirport.get(iata),
        }));
        enrichedMostUsedAirports.push({
            state,
            iata: "Other",
            total: total - d3Array.sum(mostUsedAirports, ({ iata }) => flightsByAirport.get(iata)?.total),
            index: enrichedMostUsedAirports.length,
        });
        return enrichedMostUsedAirports;
    });

    preparedData = {
        airports,
        flights,
        flightsByAirport,
        byAirport,
        airportsGroupedByStateArray,
        stateInformationSortedArray,
        statesWithMostFlights,
        plotData,
    };
}

function parseAirportsInformation() {
    return {
        airports: csvParse(airportsString),
        flights: csvParse(flightsString),
    };
}

function groupFlightsByAirports(flights) {
    const flightsByAirport = new Map();

    for (const { origin, destination, count } of flights) {
        const infoForOriginAirport = flightsByAirport.get(origin) ?? { origin: 0, destination: 0, total: 0 };
        const intCount = Number(count);
        if (Number.isNaN(intCount)) {
            console.error(`Couldn't convert ${count} to number.`);
            continue;
        }
        infoForOriginAirport.origin += intCount;
        infoForOriginAirport.total += intCount;
        flightsByAirport.set(origin, infoForOriginAirport);
        const infoForDestinationAirport = flightsByAirport.get(destination) ?? { origin: 0, destination: 0, total: 0 };
        infoForDestinationAirport.destination += intCount;
        infoForDestinationAirport.total += intCount;
        flightsByAirport.set(destination, infoForDestinationAirport);
    }

    return flightsByAirport;
}

function isReady() {
    return preloaded && preparedData;
}

function addStackedBars() {
    if (!isReady())
        throw new Error("Please preload and prepare the data first.");

    const options = {
        width: 2000,
        height: 1000,
        color: { type: "categorical" },
        x: {
            domain: preparedData.stateInformationSortedArray.map(({ state }) => state),
        },
        y: { grid: true, tickFormat: "~s" },
        marks: [
            // stacked bars
            Plot.barY(preparedData.plotData, {
                x: "state",
                y: "total",
                fill: "index",
                title: (d) => `${d.iata === "Other" ? "Other" : `${d.name}, ${d.city} (${d.iata})`}\n${d3Format(",")(d.total)} flights`,
            }),
            // labels
            Plot.text(preparedData.stateInformationSortedArray, { x: "state", y: "total", text: (d) => d3Format(".2~s")(d.total), dy: -10 }),
            // horizontal bottom line
            Plot.ruleY([0]),
        ],
    };
    document.querySelector("#chart").append(Plot.plot(options));
}

async function runAllTheThings() {
    await preload();
    prepare();
    addStackedBars();
}

document.getElementById("preload").addEventListener("click", preload);
document.getElementById("prepare").addEventListener("click", prepare);
document.getElementById("add-stacked-chart-button").addEventListener("click", addStackedBars);
document.getElementById("run-all").addEventListener("click", runAllTheThings);

if (import.meta.env.DEV)
    runAllTheThings();
