# Experimental Workloads

Experimental Speedometer workloads can be used for workloads that do not
directly meet the criteria for official workloads:

-   Incubation of new workloads
-   Edge-cases that don't work well in the official setup
-   Testing features that aren't fully shipped in all browsers

The main purpose is to have a space for low-friction contributions to
experiment with new ideas. There is no explicit requirement to promote
experimental workloads to the official selection.

## Review Process

Contributions to experimental workloads can be merged with the approval from a
single vendor.

This is the opposite from official workloads that are scored, where we require
approval from all vendors.

## Requirements

-   Stored in the `/experimental` folder
-   Disabled by default and thus do not contribute to the official score
-   Use the `experimental` tag in the Suites declaration

## Hosting

Experimental workloads will not be officially hosted on Speedometer releases on
<https://browserbench.org>, unlike the official workloads.
