import Categories from "../Categories";

function getCategoryType(category) {
    for (const type in Categories) {
        if (Categories[type].includes(category)) {
            return type;
        }
    }
    return "Unknown";
}

export default getCategoryType;
