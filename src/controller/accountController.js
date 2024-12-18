import ServiceAccount from "../service/readAccount.js";
import geoip from 'geoip-lite';
import dotenv from 'dotenv'
import ServiceLocation from "../service/findLocation.js";
import Utils from "../utils/utils.js";


dotenv.config()

const ControllerAccount = {};

ControllerAccount.get_account = async (req, res) => {
    try {
        const { orderBy = "ASC", limit = 10, haveVoucher, tagname = "", pages = 1 } = req.query;
        const ipLocate = req.header('ip-locate');

        const data = ServiceAccount.readData();
        let fromNumberProduct = 0;
        const toNumberProduct = (pages * limit);

        if (pages > 1) {
            fromNumberProduct = (toNumberProduct - limit);
        }

        let dataFilter = Utils.filterAccountsByVoucherAndTags(data.accounts, haveVoucher, tagname);

        if (ipLocate) {

            const promiseDatadaWithBranches = dataFilter.map(async (account) => {
                const locationData = (ipLocate ? await getLocationData(ipLocate, account.branches) : [])
                const nearest = locationData.reduce((a, b) => b.totalDistance < a.totalDistance ? b : a, locationData[0]);
                account["branches"] = nearest
                return account
            })

            const resultData = await Promise.all(promiseDatadaWithBranches)
            dataFilter = resultData

        }

        let sortedData = [];

        if (haveVoucher !== undefined && haveVoucher) {
            sortedData = dataFilter.sort((a, b) => {
                if (orderBy.toUpperCase() === "ASC") {
                    return a.name.localeCompare(b.name);
                } else {
                    return b.name.localeCompare(a.name);
                }
            });
        } else if (ipLocate) {
            sortedData = dataFilter.sort((a, b) => {
                if (a.branches && b.branches) {
                    if (orderBy.toUpperCase() === "ASC") {
                        return a.branches.btotalDistance - b.branches.btotalDistance;
                    } else {
                        return b.branches.btotalDistance - a.branches.btotalDistance;
                    }
                }
            });
        }


        const limitedData = sortedData.slice(fromNumberProduct, toNumberProduct).map(account => {
            const maxBenefit = account.benefits ? Math.max(...account.benefits.map(benefit => benefit.value)) : 0;
            return {
                name: account.name,
                image: account.images ? account.images[0] : null,
                url: `https://club.lanacion.com.ar/${account.crmid}`,
                maxBenefit,
                distance: (account.branches && account.branches.totalDistance && Utils.parseToMeters(account.branches.totalDistance)) || 1 ,
            };
        });


        return res.status(200).json(limitedData);

    } catch (error) {
        console.error("Error in get_account:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getLocationData = async (ipLocate, branches) => {
    try {
        const geo = geoip.lookup(ipLocate);
        if (!geo) return [];

        return await getCoordinates(geo, branches);
    } catch (error) {
        console.error("Error getting location data:", error);
        return [];
    }
};


const getCoordinates = async (currentLocation, locations) => {
    try {
        const fetchPromises = locations.map(loc => ServiceLocation.fetchLocationData(currentLocation, loc));

        const results = await Promise.all(fetchPromises);
        return results.filter(result => result);
    } catch (error) {
        console.error("Error in getCoordinates:", error);
        return [];
    }
};


export default ControllerAccount;
