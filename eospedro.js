// import not needed for react
//import {default as fetch} from 'node-fetch';


var wax_endpoints = [
    'https://api.waxsweden.org',
    'https://wax.greymass.com',
    'https://wax.cryptolions.io',
    'https://wax.eosphere.io',
    'https://wax.blokcrafters.io'
];

var aha_endpoints = [
    'https://wax.api.atomicassets.io',
    'https://wax-aa.eu.eosamsterdam.net',
    'https://aa.wax.blacklusion.io',
    'https://wax.blokcrafters.io',
    'https://api.wax-aa.bountyblok.io',
    'https://api-wax-aa.eosarabia.net',
    'https://aa-api-wax.eosauthority.com',
    'https://wax-atomic-api.eosphere.io',
    'https://api.atomic.greeneosio.com',
    'https://api.wax.liquidstudios.io',
];
/*
    'https://atomic.3dkrender.com',
*/

const debug = true;

var cur_wax = 0;
var cur_aha = 0;


function cycleWaxEndpoint() {
    cur_wax++;
    if (cur_wax > (wax_endpoints.length - 1))
        cur_wax = 0;
}

function cycleAhaEndpoint() {
    cur_aha++;
    if (cur_aha > (aha_endpoints.length - 1))
        cur_aha = 0;
}

async function waxFetch(url, body, retries = 0) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)
    let params = {
        body: JSON.stringify(body),
        method: "POST",
        mode: "cors",
        signal: controller.signal
    }
    let response = await fetch(wax_endpoints[cur_wax] + url, params).catch(e => { if (debug) console.log('waxFetch:fetch', e) });
    clearTimeout(timeoutId);
    if (response && response.status === 200) {
        let data = await response.json().catch(e => { if (debug) console.log('waxFetch:response.json', e) });        
        if (data && data.rows)
            return data.rows;
        else if (data && data.id)
            return data;
    }
    
    if (retries < 5) {
        console.log("Trying another node, failed to fetch from", wax_endpoints[cur_wax]);
        await cycleWaxEndpoint();
        return waxFetch(url, body, (retries + 1));
    } else {
        throw("Unable to fetch data from any WAX nodes.")
    }
}

async function atomicFetch(url, retries = 0, longtimeout = false) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), (longtimeout) ? 15000 : 6000)
    let params = {
        signal: controller.signal
    }
    let response = await fetch(aha_endpoints[cur_aha] + url, params).catch(e => { if (debug) console.log('atomicFetch:fetch', e) });
    clearTimeout(timeoutId);
    if (response && response.status === 200) {
        let data = await response.json().catch(e => { if (debug) console.log('atomicFetch:response.json', e) });        
        if (data && data.data)
            return data.data;
    }
    
    if (retries < 5) {
        console.log("Trying another node, failed to fetch from", aha_endpoints[cur_aha]);
        await cycleAhaEndpoint();
        return atomicFetch(url, (retries + 1));
    } else {
        throw("Unable to fetch data from any AtomicAssets API endpoint.")
    }
}

