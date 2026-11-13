// Copyright (c) 2026, Camillo Bruni.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';

const SRC_OUT_DIR = path.join(import.meta.dirname, '../test-data');
const DIST_OUT_DIR = path.join(import.meta.dirname, '../dist/test-data');

// Deterministic PRNG (Mulberry32) so generated test data is reproducible.
let prngSeed = 0x20260720;
function random() {
  let t = (prngSeed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function generateGPX(
  name,
  startTime,
  pointCount,
  baseAlt,
  basePower,
  baseHr,
  baseCad,
  baseSpeed,
  profile,
) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<gpx version="1.1" creator="Speedometer GPX Telemetry Generator" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">\n`;
  xml += `  <metadata><name>${name}</name><time>${new Date(startTime).toISOString()}</time></metadata>\n`;
  xml += `  <trk><name>${name}</name><trkseg>\n`;

  let lat = 46.5197;
  let lon = 6.6323;
  let alt = baseAlt;
  const rearGears = [11, 12, 13, 14, 15, 17, 19, 21, 24, 28];

  for (let i = 0; i < pointCount; i++) {
    const t = new Date(startTime + i * 1000).toISOString();
    lat += 0.0001 * Math.cos(i * 0.02) + (random() - 0.5) * 0.00005;
    lon += 0.00015 * Math.sin(i * 0.02) + (random() - 0.5) * 0.00005;

    let power = Math.max(100, Math.round(basePower + Math.sin(i / 20) * 50 + (random() * 20 - 10)));
    let hr = Math.min(190, Math.max(100, Math.round(baseHr + Math.sin(i / 30) * 15)));
    let cad = Math.min(120, Math.max(60, Math.round(baseCad + Math.cos(i / 15) * 10)));
    let speed = Math.max(5.0, Number((baseSpeed + Math.sin(i / 25) * 3).toFixed(2)));
    let temp = Number(
      (20.0 - (alt - baseAlt) * 0.02 + (i / pointCount) * 2.5 + Math.sin(i / 100) * 1.0).toFixed(1),
    );
    let frontTooth = 52;
    let rearTooth = rearGears[Math.floor((i / 45) % rearGears.length)];
    let battery = Math.max(15, 100 - Math.floor(i / 60));

    if (profile === 'race') {
      alt += Math.sin(i / 40) * 1.8;
      power = Math.max(150, Math.round(280 + 100 * Math.sin(i / 15) + (random() - 0.5) * 20));
      hr = Math.min(192, Math.max(120, Math.round(165 + 20 * Math.sin(i / 30))));
      speed = Math.max(8.0, Number((baseSpeed + 2 + Math.sin(i / 20) * 4).toFixed(2)));
      temp = Number(
        (17.5 - (alt - baseAlt) * 0.025 + (i / pointCount) * 2.8 + Math.sin(i / 110) * 1.2).toFixed(
          1,
        ),
      );
    } else if (profile === 'mtb') {
      alt += Math.cos(i / 25) * 1.5;
      frontTooth = 34;
      rearTooth = rearGears[Math.floor((i / 25) % rearGears.length)];
      temp = Number(
        (19.5 - (alt - baseAlt) * 0.02 + (i / pointCount) * 2.2 + Math.cos(i / 90) * 1.1).toFixed(
          1,
        ),
      );
      speed = Math.max(4.0, Number((baseSpeed - 2 + Math.cos(i / 15) * 2.5).toFixed(2)));
    } else {
      alt += Math.sin(i / 50) * 1.2;
      temp = Number(
        (20.0 - (alt - baseAlt) * 0.02 + (i / pointCount) * 2.5 + Math.sin(i / 100) * 1.0).toFixed(
          1,
        ),
      );
    }

    xml += `    <trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}">\n`;
    xml += `      <ele>${alt.toFixed(1)}</ele>\n`;
    xml += `      <time>${t}</time>\n`;
    xml += `      <extensions>\n`;
    xml += `        <power>${power}</power>\n`;
    xml += `        <hr>${hr}</hr>\n`;
    xml += `        <cad>${cad}</cad>\n`;
    xml += `        <temp>${temp}</temp>\n`;
    xml += `        <speed>${speed}</speed>\n`;
    xml += `        <gearFrontTooth>${frontTooth}</gearFrontTooth>\n`;
    xml += `        <gearRearTooth>${rearTooth}</gearRearTooth>\n`;
    xml += `        <battery>${battery}</battery>\n`;
    xml += `        <gpxtpx:TrackPointExtension>\n`;
    xml += `          <gpxtpx:hr>${hr}</gpxtpx:hr>\n`;
    xml += `          <gpxtpx:cad>${cad}</gpxtpx:cad>\n`;
    xml += `          <gpxtpx:atemp>${temp}</gpxtpx:atemp>\n`;
    xml += `        </gpxtpx:TrackPointExtension>\n`;
    xml += `      </extensions>\n`;
    xml += `    </trkpt>\n`;
  }

  xml += `  </trkseg></trk>\n`;
  xml += `</gpx>\n`;
  return xml;
}

function generateTCX(
  name,
  startTime,
  pointCount,
  baseAlt,
  basePower,
  baseHr,
  baseCad,
  baseSpeed,
  profile,
) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">\n`;
  xml += `  <Activities><Activity Sport="Biking">\n`;
  xml += `    <Id>${new Date(startTime).toISOString()}</Id>\n`;
  xml += `    <Creator><Name>${name}</Name></Creator>\n`;
  xml += `    <Lap StartTime="${new Date(startTime).toISOString()}">\n`;
  xml += `      <Track>\n`;

  let lat = 47.3769;
  let lon = 8.5417;
  let alt = baseAlt;
  const rearGears = [11, 12, 13, 14, 15, 17, 19, 21, 23, 25];

  for (let i = 0; i < pointCount; i++) {
    const t = new Date(startTime + i * 1000).toISOString();
    lat += (random() - 0.45) * 0.0005;
    lon += (random() - 0.45) * 0.0005;

    let power = Math.max(
      120,
      Math.round(basePower + Math.cos(i / 25) * 60 + (random() * 15 - 7.5)),
    );
    let hr = Math.min(195, Math.max(110, Math.round(baseHr + Math.cos(i / 35) * 18)));
    let cad = Math.min(115, Math.max(65, Math.round(baseCad + Math.cos(i / 18) * 8)));
    let speed = Math.max(6.0, Number((baseSpeed + Math.sin(i / 20) * 2.5).toFixed(2)));
    let temp = 21.5;
    let frontTooth = 50;
    let rearTooth = rearGears[Math.floor((i / 40) % rearGears.length)];
    let battery = Math.max(20, 98 - Math.floor(i / 50));

    if (profile === 'interval') {
      const isInterval = i % 120 < 40;
      if (isInterval) {
        power = Math.round(380 + random() * 30);
        hr = Math.min(195, Math.round(170 + random() * 5));
        cad = Math.round(100 + random() * 5 - 2.5);
        speed = Math.max(10.0, Number((baseSpeed + 4 + random()).toFixed(2)));
        rearTooth = 13;
      } else {
        power = Math.round(150 + random() * 15);
        hr = Math.max(130, Math.round(145 + random() * 5));
        cad = Math.round(80 + random() * 4 - 2);
        speed = Math.max(6.0, Number((baseSpeed - 2 + random() * 0.5).toFixed(2)));
        rearTooth = 21;
      }
      alt += Math.cos(i / 30) * 0.8;
      temp = Number(
        (24.8 - (i / pointCount) * 2.2 - (alt - baseAlt) * 0.02 + Math.sin(i / 85) * 1.1).toFixed(
          1,
        ),
      );
    } else {
      alt += Math.cos(i / 40) * 1.0;
      temp = Number(
        (18.5 + (i / pointCount) * 3.4 - (alt - baseAlt) * 0.02 + Math.cos(i / 100) * 1.0).toFixed(
          1,
        ),
      );
    }

    xml += `        <Trackpoint>\n`;
    xml += `          <Time>${t}</Time>\n`;
    xml += `          <Position><LatitudeDegrees>${lat.toFixed(6)}</LatitudeDegrees><LongitudeDegrees>${lon.toFixed(6)}</LongitudeDegrees></Position>\n`;
    xml += `          <AltitudeMeters>${alt.toFixed(1)}</AltitudeMeters>\n`;
    xml += `          <HeartRateBpm><Value>${hr}</Value></HeartRateBpm>\n`;
    xml += `          <Cadence>${cad}</Cadence>\n`;
    xml += `          <Extensions>\n`;
    xml += `            <TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2">\n`;
    xml += `              <Speed>${speed.toFixed(2)}</Speed>\n`;
    xml += `              <Watts>${power}</Watts>\n`;
    xml += `            </TPX>\n`;
    xml += `            <Temperature>${temp}</Temperature>\n`;
    xml += `            <AvgTemperature>${temp}</AvgTemperature>\n`;
    xml += `            <GearFrontTooth>${frontTooth}</GearFrontTooth>\n`;
    xml += `            <GearRearTooth>${rearTooth}</GearRearTooth>\n`;
    xml += `            <Battery>${battery}</Battery>\n`;
    xml += `          </Extensions>\n`;
    xml += `        </Trackpoint>\n`;
  }

  xml += `      </Track>\n`;
  xml += `    </Lap>\n`;
  xml += `  </Activity></Activities>\n`;
  xml += `</TrainingCenterDatabase>\n`;
  return xml;
}

function generateFIT(
  startTimeMs,
  pointCount,
  baseAlt,
  basePower,
  baseHr,
  baseCad,
  baseSpeed,
  baseTemp = 20,
) {
  const garminEpoch = 631065600;
  const startGarmin = Math.floor(startTimeMs / 1000) - garminEpoch;
  const chunks = [];

  chunks.push(
    Buffer.from([
      0x40, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, 0x00, 0x01, 0x02, 0x84, 0x02, 0x02, 0x84,
      0x04, 0x04, 0x86,
    ]),
  );
  const d0 = Buffer.alloc(10);
  d0.writeUInt8(0x00, 0);
  d0.writeUInt8(4, 1);
  d0.writeUInt16LE(1, 2);
  d0.writeUInt16LE(2026, 4);
  d0.writeUInt32LE(startGarmin >>> 0, 6);
  chunks.push(d0);

  chunks.push(
    Buffer.from([
      0x41, 0x00, 0x00, 0x12, 0x00, 0x03, 0x02, 0x04, 0x86, 0x05, 0x01, 0x00, 0x06, 0x01, 0x00,
    ]),
  );
  const d18 = Buffer.alloc(7);
  d18.writeUInt8(0x01, 0);
  d18.writeUInt32LE(startGarmin >>> 0, 1);
  d18.writeUInt8(2, 5);
  d18.writeUInt8(0, 6);
  chunks.push(d18);

  chunks.push(
    Buffer.from([
      0x42, 0x00, 0x00, 0x14, 0x00, 0x0a, 0xfd, 0x04, 0x86, 0x00, 0x04, 0x85, 0x01, 0x04, 0x85,
      0x02, 0x02, 0x84, 0x03, 0x01, 0x02, 0x04, 0x01, 0x02, 0x05, 0x04, 0x86, 0x06, 0x02, 0x84,
      0x07, 0x02, 0x84, 0x0d, 0x01, 0x01,
    ]),
  );

  chunks.push(
    Buffer.from([
      0x43, 0x00, 0x00, 0x15, 0x00, 0x06, 0xfd, 0x04, 0x86, 0x00, 0x01, 0x00, 0x01, 0x01, 0x00,
      0x03, 0x04, 0x86, 0x09, 0x01, 0x02, 0x0b, 0x01, 0x02,
    ]),
  );

  chunks.push(
    Buffer.from([0x44, 0x00, 0x00, 0x17, 0x00, 0x02, 0xfd, 0x04, 0x86, 0x20, 0x01, 0x02]),
  );

  let lat = 46.2;
  let lon = 7.2;
  let alt = baseAlt;
  let dist = 0;
  let frontGear = 2;
  let rearGear = 5;
  let battery = 100;

  for (let i = 0; i < pointCount; i++) {
    const t = startGarmin + i * 1;
    lat += (random() - 0.45) * 0.0005;
    lon += (random() - 0.45) * 0.0005;
    alt += Math.sin(i / 50) * 1.4;
    dist += baseSpeed * 1;
    const speed = baseSpeed + Math.sin(i / 30) * 2.5;
    const power = Math.max(
      110,
      Math.round(basePower + Math.sin(i / 20) * 65 + (random() - 0.5) * 20),
    );
    const hr = Math.min(
      190,
      Math.max(105, Math.round(baseHr + Math.sin(i / 30) * 18 + (random() - 0.5) * 4)),
    );
    const cad = Math.min(
      115,
      Math.max(65, Math.round(baseCad + Math.sin(i / 20) * 10 + (random() - 0.5) * 3)),
    );
    const temp = Math.round(
      baseTemp - (alt - baseAlt) * 0.025 + (i / pointCount) * 3.2 + Math.sin(i / 80) * 1.8,
    );

    const d20 = Buffer.alloc(26);
    d20.writeUInt8(0x02, 0);
    d20.writeUInt32LE(t >>> 0, 1);
    d20.writeInt32LE(Math.round(lat * (Math.pow(2, 31) / 180)), 5);
    d20.writeInt32LE(Math.round(lon * (Math.pow(2, 31) / 180)), 9);
    d20.writeUInt16LE(Math.round((alt + 500) * 5), 13);
    d20.writeUInt8(hr, 15);
    d20.writeUInt8(cad, 16);
    d20.writeUInt32LE(Math.round(dist * 100) >>> 0, 17);
    d20.writeUInt16LE(Math.round(speed * 1000), 21);
    d20.writeUInt16LE(power, 23);
    d20.writeInt8(temp, 25);
    chunks.push(d20);

    if (i % 50 === 25) {
      rearGear = (rearGear % 11) + 1;
      if (i % 200 === 100) frontGear = frontGear === 2 ? 1 : 2;
      const d21 = Buffer.alloc(13);
      d21.writeUInt8(0x03, 0);
      d21.writeUInt32LE(t >>> 0, 1);
      d21.writeUInt8(43, 5);
      d21.writeUInt8(3, 6);
      const teethData =
        ((frontGear === 2 ? 52 : 36) << 24) | (frontGear << 16) | ((11 + rearGear) << 8) | rearGear;
      d21.writeUInt32LE(teethData >>> 0, 7);
      d21.writeUInt8(frontGear, 11);
      d21.writeUInt8(rearGear, 12);
      chunks.push(d21);
    }

    if (i % 100 === 0) {
      battery = Math.max(10, 100 - Math.floor(i / 100));
      const d23 = Buffer.alloc(6);
      d23.writeUInt8(0x04, 0);
      d23.writeUInt32LE(t >>> 0, 1);
      d23.writeUInt8(battery, 5);
      chunks.push(d23);
    }
  }

  const dataBuf = Buffer.concat(chunks);
  const header = Buffer.alloc(14);
  header.writeUInt8(14, 0);
  header.writeUInt8(32, 1);
  header.writeUInt16LE(2114, 2);
  header.writeUInt32LE(dataBuf.length, 4);
  header.write('.FIT', 8, 4, 'ascii');
  header.writeUInt16LE(0, 12);

  const fileCrc = Buffer.alloc(2);
  return Buffer.concat([header, dataBuf, fileCrc]);
}

async function run() {
  await fs.mkdir(SRC_OUT_DIR, { recursive: true });
  await fs.mkdir(DIST_OUT_DIR, { recursive: true });

  const files = [
    {
      name: 'activity_1_alps_stage.gpx',
      content: generateGPX(
        'Alpine Mountain Stage',
        Date.parse('2026-05-10T08:00:00Z'),
        1500,
        600,
        260,
        160,
        85,
        9.5,
        'race',
      ),
    },
    {
      name: 'activity_2_forest_mtb.gpx',
      content: generateGPX(
        'Forest MTB Trail',
        Date.parse('2026-05-17T09:30:00Z'),
        1200,
        450,
        230,
        155,
        80,
        7.5,
        'mtb',
      ),
    },
    {
      name: 'activity_3_road_race.tcx',
      content: generateTCX(
        'Lakeside Road Race',
        Date.parse('2026-06-05T07:15:00Z'),
        1600,
        380,
        280,
        168,
        92,
        11.2,
        'road',
      ),
    },
    {
      name: 'activity_4_intervals.tcx',
      content: generateTCX(
        'Sprint Intervals',
        Date.parse('2026-06-12T17:00:00Z'),
        1400,
        350,
        320,
        175,
        96,
        12.0,
        'interval',
      ),
    },
    {
      name: 'activity_5_grand_tour.fit',
      content: generateFIT(Date.parse('2026-07-02T08:30:00Z'), 1800, 500, 270, 162, 88, 10.5, 19),
    },
    {
      name: 'activity_6_weekend_ride.fit',
      content: generateFIT(Date.parse('2026-07-15T09:00:00Z'), 1400, 320, 210, 142, 84, 8.8, 22),
    },
  ];

  await fs.rm(SRC_OUT_DIR, { recursive: true, force: true });
  await fs.rm(DIST_OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(SRC_OUT_DIR, { recursive: true });
  await fs.mkdir(DIST_OUT_DIR, { recursive: true });

  const manifest = [];
  for (const file of files) {
    const gzName = `${file.name}.gz`;
    const srcPath = path.join(SRC_OUT_DIR, gzName);
    const distPath = path.join(DIST_OUT_DIR, gzName);
    const rawBuf =
      typeof file.content === 'string' ? Buffer.from(file.content, 'utf-8') : file.content;
    const compressed = zlib.gzipSync(rawBuf, { level: 9 });
    await fs.writeFile(srcPath, compressed);
    await fs.writeFile(distPath, compressed);
    manifest.push(gzName);
    console.log(`Generated ${gzName} (${compressed.length} compressed bytes)`);
  }

  const manifestJson = JSON.stringify(manifest, null, 2);
  await fs.writeFile(path.join(SRC_OUT_DIR, 'manifest.json'), manifestJson);
  await fs.writeFile(path.join(DIST_OUT_DIR, 'manifest.json'), manifestJson);
  console.log('Saved manifest.json with', manifest.length, 'files.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
