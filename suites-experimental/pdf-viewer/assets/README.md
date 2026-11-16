# Photo provenance

Every photo here is a work of the U.S. federal government (NASA or the National Park
Service) and is therefore in the public domain in the United States. None of them
carries an attribution requirement; the credits below are recorded for traceability,
not because the license demands them.

Each file was downloaded from Wikimedia Commons at full resolution, then resized and
re-encoded once with ImageMagick and committed in that form:

```sh
magick <original> -auto-orient -resize <box> -strip -sampling-factor 4:2:0 \
    -quality 82 -interlace none -colorspace sRGB <output>
```

They are committed pre-sized so `scripts/generate-pdf.mjs` can embed the JPEG bytes
verbatim as `DCTDecode` streams without re-encoding, which keeps the generated PDF
byte-deterministic.

| File                         | Box       | Source                                                                                                                                                                               | Credit                                                  |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `earth-apollo17.jpg`         | 1400x1400 | [The Earth seen from Apollo 17](https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg)                                                                           | NASA, Apollo 17 crew, 1972                              |
| `earthrise-apollo8.jpg`      | 1200x1200 | [NASA-Apollo8-Dec24-Earthrise](https://commons.wikimedia.org/wiki/File:NASA-Apollo8-Dec24-Earthrise.jpg)                                                                             | NASA / Bill Anders, Apollo 8, 1968                      |
| `apollo11-launch.jpg`        | 1120x1400 | [Apollo 11 Launch - GPN-2000-000630](https://commons.wikimedia.org/wiki/File:Apollo_11_Launch_-_GPN-2000-000630.jpg)                                                                 | NASA, 1969                                              |
| `grand-prismatic-spring.jpg` | 1400x1400 | [Aerial view of Excelsior Geyser and Grand Prismatic Spring](<https://commons.wikimedia.org/wiki/File:Aerial_view_of_Excelsior_Geyser_and_Grand_Prismatic_Spring_(23320428202).jpg>) | National Park Service / Yellowstone National Park, 2006 |

The four subjects were picked to spread the JPEG decode work: a bright subject on a
large black field, a small low-contrast frame, a grainy daylight scan with a smooth sky
gradient, and a saturated high-frequency aerial.
