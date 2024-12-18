const Utils = {}

Utils.calcDistance = (lat1, lon1, lat2, lon2) => {
    return Math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2);
};


Utils.parseToMeters = (degress) => {
    const metersPerDegree = 111320; 
    return degress * metersPerDegree;
};

Utils.filterAccountsByVoucherAndTags = (accounts, haveVoucher, tagname) => {
    return accounts.filter(account => {
        if (haveVoucher !== undefined) {
            if (!account.haveVoucher) {
                return false;
            }
        }

        const cleanedTagName = tagname.replace(/['"]+/g, '').trim().toLowerCase();
        if (cleanedTagName && account.tags) {
            return account.tags.some(tag => tag.name.toLowerCase().trim() === cleanedTagName);
        }
        return true;
    });
};

export default Utils;