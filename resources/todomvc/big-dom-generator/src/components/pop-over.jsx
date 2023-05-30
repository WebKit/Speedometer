import { Children } from "react";

export const VerticalPopOver = ({ children }) => {
    const actionItems = Children.toArray(children).map((child, index) => (
        <div key={index} className="spectrum-ActionGroup-item">
            {child}
        </div>
    ));
    return (
        <div className="spectrum-Popover spectrum-Popover--bottom-right" style={{ marginTop: "25px", padding: "5px" }}>
            <div className="spectrum-ActionGroup spectrum-ActionGroup--vertical spectrum-ActionGroup--sizeS">{actionItems}</div>
        </div>
    );
};

export const OptionsPopOver = ({ numOptions }) => {
    const options = [];
    for (let i = 0; i < numOptions; i++) {
        options.push(
            <li key={i} className="spectrum-Menu-item" role="menuitem" tabIndex="0">
                <span className="spectrum-Menu-itemLabel">Hidden Option {i}</span>
            </li>
        );
    }

    return (
        <div className="spectrum-Popover spectrum-Popover--bottom" style={{ marginTop: "25px", padding: "5px" }}>
            <ul className="spectrum-Menu" role="menu">
                {options}
            </ul>
        </div>
    );
};
