# TodoMVC embedded in a complex big static DOM

This is a proposal to embed the TodoMVC benchmark on a complex static DOM.

## The benchmark

This workload embeds the todoMVC benchmark in an html page with the following characteristics.

* The page is a big static DOM with around 4000 elements.
* The page is styled using the @spectrum-css adobe library, which relies on css variables for uniform styling.
* The @spectrum-css rules of the page are post processed using postcss and purgecss.
* The page includes other 400 complex color css rules using different kinds of css selectors and combinators.
* 200 of the above rules will fully match elements added by the todoMVC benchmark, but not elements in the UI. E.g. `.toggle-all-container ~ ul > .li-6 > .view-6.targeted`.
* 200 of the above rules will partially match elements added by the todoMVC benchmark (the right most selector will match). E.g. `.header.just-span .header ~ .main .view-31`.
* We added new classes `li-{index}` and `view-{index}` to the todoMVC benchmark list items to make it easier to match the elements. We also added a class `targeted` to them to avoid affecting other elements with the generated CSS.

<p align = "center">
<img src="complex-dom-workload.png" alt="workload" width="800"/>
</p>

## Structure of the folder
* *src*
  * big-dom-generator - Code to generate the big static DOM
  * react-todomvc - Code of the TodoMVC-React benchmark embedded in the generated page.
* *dist* - Output folder for the benchmark.
* *generator-dist* - Output folder for the big static DOM generator.

## How to run
`npm run build` - Generates the static html and corresponding css and uses them as the base html to build the todoMVC benchmark.

`npm run generate-dom` - Generates the static html and corresponding css.

`npm run build-todomvc` - Uses the generated static html and css and builds the benchmark on top of it.

`npm run serve` - Serves the dist folder in port 7002.

## The generator

The generator is a nodejs script that uses `renderToStaticMarkup` to generate the static html.

### Dom Generator

* Uses a random seedable library with a default seed for all its random operations.
* Takes `MAX_DEPTH`, `TARGET_SIZE` and to randomly generate the big folder-like structure embedded in the sidebar.
* To generate the sidebar, each node decides if it will have children based on the `CHILD_PROB` value. Then randomly chooses a number of children between 1 and `MAX_BREADTH`.

### CSS Generator

Matching rules:

* Starts at the list element or view element of a todoMVC item.
* The right-most selector will include the `:not(.ui)` selector to avoid matching elements in the UI.
* Randomly decides the length of the selector between 1 and `MAX_SELECTOR_LENGTH`.
* Randomly picks the selector for the current step, either a class selector, a type selector or a universal selector (maybe add attributes?).
* Randomly picks the combinator for the current step, either a child combinator, a descendant combinator, a general sibling combinator or an adjacent sibling combinator. It will only pick valid combinators for the current step, i.e. not a sibling combinator if the current node has no sibling.
* Stops when the target length was reached.

Non Matching rules:

* Starts at the list element or view element of a todoMVC item.
* Randomly decides the length of the selector between 1 and `MAX_SELECTOR_LENGTH`.
* Randomly picks the selector for the current step, either a class selector, a type selector or a universal selector (maybe add attributes?).
* Randomly picks the combinator for the current step, either a child combinator, a descendant combinato, a general sibling combinator or an adjacent sibling combinator. It will only pick valid combinators for the current step, i.e. not a sibling combinator if the current node has no sibling.
* When the target length was reached, it will add `.just-span` to the left-most selector to force it to not match any element. The `.just-span` is a class name tag that some span elements in the UI have.

## Modifications to the React-TodoMVC benchmark

We made only small modifications to the benchmark itself:

* Added new classes `li-{index}` and `view-{index}` to the list items and view elements to make it easier to match the complex css rules, and added a class `targeted` to them to avoid affecting other elements with the generated CSS.
* Made the info section part of the react component to take it out of the html page.