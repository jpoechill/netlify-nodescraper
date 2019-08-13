const axios = require('axios');
const cheerio = require('cheerio');
// const cors = require('cors')

let articles = new Set()

const fetchData = async () => {
    const siteUrl = "https://designboom.com/";
    const result = await axios.get(siteUrl);

    return cheerio.load(result.data);
};

const getResults = async () => {
    const $ = await fetchData();

    articles.clear(); // clear the cache, or you will see data from prev call!

    $("article[class=dboom-article-highlight]").each((index, element) => {
        let title = $('.dboom-title', element).text().substr(1)
        let date = $('.dboom-image .date-info', element).text()
        let imgSrc = $('.dboom-image a img', element).data().lazySrc
        let description = $('.dboom-excerpt', element).first().text()
        let tags = $('.dboom-tags a', element).map((index, el) => {
            return $(el).text()
        }).get()

        articles.add({
            title: title,
            date: date,
            urlToImage: imgSrc,
            description: description,
            tags: tags
        });
    });

    return articles
};

exports.handler = (event, context, callback) => {
    getResults()
        .then((res) => {
            // if (event.httpMethod !== "POST") {
                callback(null, {
                    statusCode: 200,
                    headers: {
                        'content-type': 'application/json',
                        'Access-Control-Allow-Methods': 'GET',
                        "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                        // "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
                        // "Cache-Control": "no-transform"
                    },
                    body: JSON.stringify([...res]),
                });
            // }
        })
        .catch((err) => {
            callback(err);
        });
};