const { JSDOM } = require('jsdom')

async function crawlPage(currentURL){ // Async will return a promise
    console.log(`Actively crawling: ${currentURL}`)
    
    try{
        const resp = await fetch(currentURL) // We don't need to specify options as it by default uses GET

        if (resp.status > 399){ // 400 or 500 errors
            console.log(`Error in fetch with status code: ${resp.status}, on page: ${currentURL}`)
            return
        }

        const contentType = resp.headers.get("content-type")
        if (!contentType.includes("text/html")){
            console.log(`Non html response, content type: ${contentType}, on page: ${currentURL}`)
            return
        }

        console.log(await resp.text()) // Instead of receiving it formated as a .JSON, we want it formated in .HTML
    } catch (err){
        console.log(`Error in fetch: ${err.message}, on page: ${currentURL}`)
    }
}

function getURLsFromHTML(htmlBody, baseURL){ // The utility for that is to grab all the clickable links inside a HTML web page.
    const urls = []
    const dom = new JSDOM(htmlBody) // Taking that string and creating a document object model
    const linkElements = dom.window.document.querySelectorAll('a') // Gives a list of all "<a>" tags
    for (const linkElement of linkElements){ // .href corresponds to the link text
        if (linkElement.href.slice(0,1) === "/"){
            // Relative URL
            try{
                const urlObj = new URL(`${baseURL}${linkElement.href}`)
                urls.push(urlObj.href)
            } catch (err){
                console.log(`Error with relative URL: ${err.message}`)
            }
        } else{
            // Absolute URL
            try{
                const urlObj = new URL(linkElement.href)
                urls.push(urlObj.href)
            } catch (err){
                console.log(`Error with absolute URL: ${err.message}`)
            }
        }
    }
    return urls
}

function normalizeURL(urlString){
    const urlObj = new URL(urlString)
    const hostPath = `${urlObj.hostname}${urlObj.pathname}`
    if(hostPath.length > 0 && hostPath.slice(-1) === '/'){
        return hostPath.slice(0, -1) // Everything except the last one
    }
    return hostPath;
}

module.exports = { normalizeURL, getURLsFromHTML, crawlPage }