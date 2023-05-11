import { VerticalPopOver } from "./pop-over";
import { ActionButton } from "./action-group";

import ChevronUpIcon from "../assets/Smock_ChevronUp_18_N.svg";
import ChevronDownIcon from "../assets/Smock_ChevronDown_18_N.svg";

const Stepper = () => {
    return (
        <div className="ui spectrum-Stepper">
            <label htmlFor="stepper-m" className="ui spectrum-FieldLabel spectrum-FieldLabel--sizeS">
                Sprints
            </label>
            <div className="ui spectrum-Textfield spectrum-Textfield--sizeM spectrum-Stepper-textfield">
                <input type="text" placeholder="1" autoComplete="" className="ui spectrum-Textfield-input spectrum-Stepper-input" id="stepper-m" />
            </div>

            <span className="ui spectrum-Stepper-buttons">
                <ActionButton Icon={ChevronUpIcon} aria-haspopup="false" aria-pressed="false" className="ui spectrum-Stepper-stepUp" />
                <ActionButton Icon={ChevronDownIcon} aria-haspopup="false" aria-pressed="false" className="ui spectrum-Stepper-stepDown" />
            </span>
        </div>
    );
};

const TagGroup = () => {
    const tags = [
        { label: "Tag 1", className: "spectrum-Tag--sizeS" },
        { label: "Tag 2", className: "spectrum-Tag--sizeS is-invalid" },
        { label: "Tag 3", className: "spectrum-Tag--sizeS is-disabled" },
    ];

    return (
        <div className="ui spectrum-TagGroup" role="list" aria-label="list">
            {tags.map((tag, index) => (
                <div className={`ui spectrum-Tag spectrum-TagGroup-item ${tag.className}`} role="listitem" key={index}>
                    <span className="ui spectrum-Tag-label">{tag.label}</span>
                </div>
            ))}
        </div>
    );
};

export const FilterPopOver = () => {
    return (
        <VerticalPopOver>
            <div className="ui spectrum-Textfield">
                <label htmlFor="textfield-1" className="ui spectrum-FieldLabel spectrum-FieldLabel--sizeS">
                    Name
                </label>
                <input id="textfield-1" type="text" name="field" defaultValue="Sprint one" className="ui spectrum-Textfield-input filter-input" pattern="[\w\s]+" aria-describedby="character-count-6" />
            </div>
            <Stepper />
            <TagGroup />
            <div className="ui spectrum-Switch spectrum-Switch--sizeS">
                <input type="checkbox" className="ui spectrum-Switch-input" id="switch-onoff-1" defaultChecked={true} />
                <span className="ui spectrum-Switch-switch"></span>
                <label className="ui spectrum-Switch-label" htmlFor="switch-onoff-1">
                    Completed Sprints
                </label>
            </div>
        </VerticalPopOver>
    );
};
