const DEFAULT_TAGS = ["all", "default", "experimental"];

export class Tags extends Set {
    constructor() {
        super(DEFAULT_TAGS);
    }

    freeze() {
        Object.freeze(this);
    }
}
