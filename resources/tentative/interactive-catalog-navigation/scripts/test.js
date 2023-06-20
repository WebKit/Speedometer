const columNum = 6;
// you can customize table rows by changing 'rowNum' value
const rowNum = 100;
const dataMap = new Map([
    [
        "Pizza",
        {
            category: "Food",
            price: "$5",
            popularity: "80%",
            rating: 4,
        },
    ],
    [
        "Wine",
        {
            category: "Drink",
            price: "$25",
            popularity: "85%",
            rating: 5,
        },
    ],
    [
        "Ice cream",
        {
            category: "Dessert",
            price: "$3",
            popularity: "90%",
            rating: 1,
        },
    ],
    [
        "Barbecue",
        {
            category: "Food",
            price: "$5",
            popularity: "95%",
            rating: 2,
        },
    ],
    [
        "Donut",
        {
            category: "Dessert",
            price: "$2",
            popularity: "98%",
            rating: 3,
        },
    ],
]);

function generateTableBody(name) {
    let tableRows = document.createElement("tbody");
    for (let j = 1; j <= rowNum; j++) {
        const tableRow = document.createElement("tr");
        j == 1 ? tableRow.classList.add("tr-active") : "";

        for (let i = 1; i <= columNum; i++) {
            let tableData = document.createElement("td");
            switch (i) {
                case 1: {
                    tableData.textContent = `${j}`;
                    break;
                }

                case 2: {
                    tableData.textContent = `${name} - ${j}`;
                    break;
                }

                case 3: {
                    tableData.textContent = dataMap.get(name).category;
                    break;
                }

                case 4: {
                    tableData.innerHTML = `<div class="price"><span>${dataMap.get(name).price}</span></div>`;
                    break;
                }

                case 5: {
                    tableData.innerHTML = `
		        <div class="bar">
                            <div style="animation:progress-${dataMap.get(name).popularity.split("%")[0]}-fill 100ms forwards">
                                <span>${dataMap.get(name).popularity}</span>
                            </div>
                        </div>`;
                    break;
                }

                case 6: {
                    const rating = dataMap.get(name).rating;
                    let ratingStarHTML = `<div class="rating">`;
                    for (let m = 1; m <= 5; m++) {
                        let str = "";
                        if (j == 1 && m == rating) {
                            str = `id="monitored_span"`;
                        }

                        ratingStarHTML += `<span ${str}class="${m <= rating ? `select` : ``}">★</span>`;
                        if (m == 5)
	                    ratingStarHTML += `</div>`;
                    }
                    tableData.innerHTML = ratingStarHTML;
                    break;
                }
            }
            tableRow.appendChild(tableData);
        }
        tableRows.appendChild(tableRow);
    }
    return tableRows.innerHTML;
}

function refreshTable(name, need_measure) {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";
    tableBody.innerHTML = generateTableBody(name);
}

const $boxes = document.querySelectorAll(".box");
[].slice.call($boxes).forEach(function ($el, index) {
    let i = index + 1;
    $el.classList.add("box-" + i);
    $el.dataset.box = i;
});

/* initialize */
// set the 3rd image as active
const box3Element = document.querySelector(".box-3");
box3Element.classList.add("active");

// set corresponding table data
refreshTable("Ice cream", false);

let $activeBox = document.querySelector(".active");
$boxes.forEach((box) => {
    box.addEventListener("click", () => {
	    console.time("click");
        if ($activeBox) {
            $activeBox.classList.remove("active");
        }
        box.classList.add("active");
        $activeBox = box;
        const boxIndex = box.dataset.box;
        refreshTable([...dataMap.keys()][boxIndex - 1], true);
	    console.timeEnd("click");
    });
});

