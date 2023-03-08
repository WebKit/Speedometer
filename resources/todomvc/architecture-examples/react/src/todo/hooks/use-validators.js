export const useValidators = () => {
    const EMAIL_REGEXP = /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/;
    const ALPHA_NUMBERIC_REGEXP = /^[a-zA-Z0-9]+$/;

    const hasValidName = (value) => {
        return ALPHA_NUMBERIC_REGEXP.test(value);
    };

    const hasValidEmail = (value) => {
        return EMAIL_REGEXP.test(value);
    };

    const hasValidMin = (value, min) => {
        return value.length >= min;
    };

    const hasValidMax = (value, max) => {
        return value.length <= max;
    };

    const hasValidRange = (value, min, max) => {
        return value.length >= min && value.length <= max;
    };

    const hasValidRequired = (value) => {
        switch (typeof value) {
            case "boolean":
                return value === true;
            default:
                return value.length > 0;
        }
    };

    return {
        hasValidName,
        hasValidEmail,
        hasValidMin,
        hasValidMax,
        hasValidRange,
        hasValidRequired,
    };
};
