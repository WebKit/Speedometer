# Impact of embedding React-TodoMVC in a complex static HTML page.

## Objective of this testing.

To answer the question “Is there an impact on embedding TodoMVC-React in a static html page with a big DOM and complex CSS selectors?”. And use the results to generate a workload that encapsulates web app scalability challenges.

## Summary

Depending on the browser there is an impact on the TodoMVC performance caused by either the presence of a big DOM, the depth we chose for the embedded TodoMVC or the presence of complex CSS rules.

* Chrome: Small impact from having a big dom, there is impact from the depth we choose to embed the TodoMVC and the presence of CSS.
* Firefox: There is impact from the presence of the big DOM, there is some impact from where we embed the TodoMVC, small impact caused by adding CSS.
* Safari: Regressions in sync and async times. Impact caused by the presence of the big DOM and the presence of CSS. Some impact caused by where the TodoMVC is embedded.

## Why test for DOM size
Modern applications DOMs are big. Some examples:
* Outlook. elements: 2870, max depth: 32
* Youtube. elements: 9082, max depth: 30
* Teams. elements: 2542, max depth: 32
* Google docs. elements: 3558, max depth: 15
* Google sheets. elements: 5730 , max depth: 18
* Slack: elements. 788, max depth: 36
* Google search results: elements 2085, max depth:  42

## Why test for CSS selector complexity
Complex selectors are used across popular webpages. Some examples:
* Outlook:
  * `.r9gx1vl:not(:checked) ~ .fui-Radio__indicator > *`
  * `.f17xb19f > :not(.fui-CardPreview__logo)`
  * `.root-726 *`
  * `.appContainer-459 ::after`
* Youtube:
  * `.yt-core-attributed-string--highlight-text-decorator`
  * `.yt-core-attributed-string__link--display-type`

## Testing Steps

1. Generate a big DOM and complex CSS and store them in .html and .css files.
2. Create new versions of TodoMVC-React that render the TodoMVC component as children of a node in the generated html file and include the generated css file.

## The testing DOMs

Every DOM used for testing has a depth of approximately 40 nodes.

The DOM used for testing the **React-Big** benchmark has approximately 3000 nodes, while the one used for the other "Big" variations has approximately 8000 nodes. 

## The testing CSS

Besides the corresponding rules for styling and layout, we add 400 generated complex selectors. These selectors are crafted to be triggered by adding a new item to the todo list (the right-most selector matches it). From them, half will have an effect on the item's color, and the other half will not match any item in the todo list.

## Results

We tested the following 10 benchmark variations:

* *React*: The original TodoMVC-React benchmark.
* **React-Big**: The TodoMVC-React benchmark embedded in a big static HTML page, the benchmark introduced in this PR.
* *React-CSS*: The original TodoMVC-React benchmark with a lot of CSS rules.
* *React-Big-{depth}(0,10,30)*: The TodoMVC-React benchmark embedded in a node of depth {depth} in a big static HTML page filled with buttons.
* *React-Big-{depth}-CSS(0,10,30)*: The TodoMVC-React benchmark embedded in a node of depth {depth} in a big static HTML page filled with buttons, with extra CSS rules.
* *React-Mail*: An earlier iteration of *TodoMVC-React-Big* built with different tooling, and which the group agreed was a good starting point for the workload.

Each benchmark was ran 50 times on each browser. The following boxplots show the distribution of the results. The x-axis is milliseconds, the y-axis is the benchmark ran.

### Total ms analysis

<p align = "center" background-color="white">
<img src="impact-analysis-images/boxplots.png" alt="boxplots" width="800"/>
</p>

A quick overview to these boxplots reveals that the different additions affect the different browsers differently. With **React-Big** and *React-Mail* having the biggest impact accross all browsers.

To dive deeper into the specifics of each test lets analyze the boxplots visualizations below

> How to interpret the heatmaps: The heatmap shows the p-value of the mannWhitney test between the two benchmarks. A lighter color represents there is statistically significant evidence that the benchmark in {row} is faster than the benchmark in {column}.

### Chrome
<p align = "center" background-color="white">
<img src="impact-analysis-images/total-chrome.png" alt="heatmap-chrome" width="800"/>
</p>

On Chrome, there is an impact by embedding the TodoMVC in a big DOM plus a styles UI, like **React-Big** and *React-Mail* do. The differences between the variations of *React-Big-{depth}* and *React-Big-{depth}-CSS* suggest that the inclusions of the extra CSS rules also has a significant impact on performance.

### Firefox
<p align = "center" background-color="white">
<img src="impact-analysis-images/total-firefox.png" alt="heatmap-chrome" width="800"/>
</p>

On Firefox, the impact from *React-Mail* is not clear here, whereas the impact of **React-Big* is the clear. There seems to be an impact caused by the CSS and the size of the DOM too.

### Safari
<p align = "center" background-color="white">
<img src="impact-analysis-images/total-safari.png" alt="heatmap-chrome" width="800"/>
</p>

On Safari, the performance of the benchmark is impacted by every variation. The DOM size has an impact that is worsen when adding CSS.

### Per-step analysis

The benchmarks impact the different test steps differently for each browser, as we can see in the per-step heatmaps below.

### Chrome
<p align = "center" background-color="white">
<img src="impact-analysis-images/step-chrome.png" alt="heatmap-chrome" width="800"/>
</p>

On Chrome. Most of the impact comes from the Async portion of the benchmark. There seems to be no impact from the presence of the big DOM or where we embed the TodoMVC, but the impact from the CSS rules is clear.

### Firefox
<p align = "center" background-color="white">
<img src="impact-analysis-images/step-firefox.png" alt="heatmap-chrome" width="800"/>
</p>

On Firefox. The Async part is impacted by the presence of the big DOM, and the graph suggest that embedding the benchmark at a deeper level has a bigger impact on the Add step. The presence of CSS rules has an impact on the Async step.

### Safari
<p align = "center" background-color="white">
<img src="impact-analysis-images/step-safari.png" alt="heatmap-chrome" width="800"/>
</p>

On Safari. The impact is scattered across the Sync and Async parts and seems to be caused by combinations of the 3 factors: the presence of the big DOM, the depth of the embedding and the presence of CSS rules.

## Conclusion

The characteristics of the page where the todoMVC benchmark is executed have an impact on its performance. The places where the impact takes place vary from browser to browser, hence it is beneficial to have workloads like the one implemented in this folder, that will exemplify these problems in Speedometer 3.0.