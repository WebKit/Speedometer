import { Children } from "react";

export const VerticalPopOver = ({ children }) => {
    const actionItems = Children.toArray(children).map((child, index) => (
        <div key={index} className="ui spectrum-ActionGroup-item">
            {child}
        </div>
    ));
    return (
        <div className="ui spectrum-Popover spectrum-Popover--bottom-right" style={{ marginTop: "25px", padding: "5px" }}>
            <div className="ui spectrum-ActionGroup spectrum-ActionGroup--vertical spectrum-ActionGroup--sizeS">{actionItems}</div>
        </div>
    );
};

export const OptionsPopOver = ({ numOptions }) => {
    const options = [];
    for (let i = 0; i < numOptions; i++) {
        options.push(
            <li key={i} className="ui spectrum-Menu-item" role="menuitem" tabIndex="0">
                <span className="ui spectrum-Menu-itemLabel">Hidden Option {i}</span>
            </li>
        );
    }

    return (
        <div className="ui spectrum-Popover spectrum-Popover--bottom" style={{ marginTop: "25px", padding: "5px" }}>
            <ul className="ui spectrum-Menu" role="menu">
                {options}
            </ul>
        </div>
    );
};
