import CheckmarkIcon from "../assets/Smock_Calendar_18_N.svg";
import ArrowDownIcon from "../assets/Smock_ArrowDown_18_N.svg";

export const Table = () => {
    const rows = [
        {
            priority: "1 High",
            status: "Available",
            category: "Bug",
        },
        {
            priority: "1 High",
            status: "Available",
            category: "Bug",
        },
        {
            priority: "2 Medium",
            status: "Available",
            category: "Documentation",
        },
        {
            priority: "3 Low",
            status: "Available",
            category: "Feature Request",
        },
        {
            priority: "3 Low",
            status: "Available",
            category: "Feature Request",
        },
    ];

    return (
        <table className="spectrum-Table spectrum-Table--sizeM">
            <thead className="spectrum-Table-head">
                <tr>
                    <th className="spectrum-Table-headCell spectrum-Table-checkboxCell">
                        <label className="spectrum-Checkbox spectrum-Checkbox--sizeM spectrum-Table-checkbox">
                            <input type="checkbox" className="spectrum-Checkbox-input" title="Select All" />
                            <span className="spectrum-Checkbox-box">
                                <CheckmarkIcon className="spectrum-Icon spectrum-Checkbox-checkmark" focusable="false" aria-hidden="true" />
                            </span>
                        </label>
                    </th>
                    <th className="spectrum-Table-headCell is-sortable is-sorted-desc" aria-sort="descending" tabIndex="0">
                        Priority
                        <ArrowDownIcon className="spectrum-Icon spectrum-Table-sortedIcon" focusable="false" aria-hidden="true" />
                    </th>
                    <th className="spectrum-Table-headCell">Status</th>
                    <th className="spectrum-Table-headCell">Category</th>
                </tr>
            </thead>
            <tbody className="spectrum-Table-body">
                {rows.map((row, index) => (
                    <tr className="spectrum-Table-row" tabIndex="0" key={index}>
                        <td className="spectrum-Table-cell spectrum-Table-checkboxCell">
                            <label className="spectrum-Checkbox spectrum-Checkbox--sizeM spectrum-Table-checkbox">
                                <input type="checkbox" className="spectrum-Checkbox-input" title="Select" defaultChecked={index === 1 || index === 2} />
                                <span className="spectrum-Checkbox-box">
                                    <CheckmarkIcon className="spectrum-Icon spectrum-UIIcon-Checkmark100 spectrum-Checkbox-checkmark" focusable="false" aria-hidden="true" />
                                </span>
                            </label>
                        </td>
                        <td className="spectrum-Table-cell">{row.priority}</td>
                        <td className="spectrum-Table-cell">{row.status}</td>
                        <td className="spectrum-Table-cell">{row.category}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
