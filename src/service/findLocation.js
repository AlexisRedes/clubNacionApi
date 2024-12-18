import fetch from "node-fetch";
import Utils from "../utils/utils.js";


const ServiceLocation = {}

ServiceLocation.fetchLocationData = async (currentLocation, loc) => {
    const query = `${loc.address} ${loc.number}, ${loc.city}, ${loc.state}, ${loc.country}`;

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${process.env.OPENCAGEDATA_KEY}`;

    const config = { headers: { "User-Agent": "NodeJSApp" } };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (data && data.results && data.results.length > 0) {

            const lat = parseFloat(data.results[0].geometry.lat);
            const lng = parseFloat(data.results[0].geometry.lng);

            const totalDistance = Utils.calcDistance(lat, lng, currentLocation.ll[0], currentLocation.ll[1]);

            return {
                address: query,
                lat,
                lng,
                totalDistance
            };
        } else {
            console.warn(`No results for: ${query}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching data for:", query, error);
        return null;
    }
};

export default ServiceLocation;