const express = require("express");
const axios = require("axios");
const stopwords = require("stopwords-en");

const app = express();
const port = 5000; // default port to listen

async function getTitleData() {
    const getStoryIds = await axios.get(
        "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
    );

    const storyIds = await getStoryIds;
    // create promises for each story and push into array
    const promises = [];

    for (let i = 0; i < 250; i++) {
        const requestPromise = axios
            .get(
                `https://hacker-news.firebaseio.com/v0/item/${storyIds.data[i]}.json?print=pretty`
            )
            .then((res) => res.data.title);
        promises.push(requestPromise);
    }

    const result = [];

    // resolve all the promises
    await Promise.all(promises).then((res) => {
        res.forEach((item) => {
            const splittedWord = item.split(" ");
            result.push(...splittedWord);
        });
    });

    return result;
}

async function getCommentData() {
    try {
        const getStoryIds = await axios.get(
            "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"
        );
        const maxId = await getStoryIds;
        // create promises for each story and push into array
        const promises = [];
        let id = maxId.data;

        for (var i = 0; i < 1000; i++) {
            const requestPromise = axios
                .get(
                    `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
                )
                .then((res) => {
                    if (res.data && res.data.type === "comment") {
                        return res.data.text;
                    }
                });

            promises.push(requestPromise);
            id--;
        }

        const result = [];
        // resolve all the promises
        for (var i = 0; i < 100; i++) {
            await Promise.all(promises.slice(i * 100, (i + 1) * 100)).then(
                (res) => {
                    res.forEach((item) => {
                        if (item !== undefined) {
                            const splittedWord = item.split(" ");
                            result.push(...splittedWord);
                        }
                    });
                }
            );
        }

        return result;
    } catch (error) {
        console.log(error);
    }
}

function decodeHTMLEntities(text) {
    var entities = [
        ["amp", "&"],
        ["apos", "'"],
        ["#x27", "'"],
        ["#x2F", "/"],
        ["#39", "'"],
        ["#47", "/"],
        ["lt", "<"],
        ["gt", ">"],
        ["nbsp", " "],
        ["quot", '"'],
    ];

    for (let i = 0, max = entities.length; i < max; ++i)
        text = text.replace(
            new RegExp("&" + entities[i][0] + ";", "g"),
            entities[i][1]
        );

    return text;
}

function getMostUsedWords(arrayOfWords, range) {
    let occurances = {};

    for (let i = 0; i < arrayOfWords.length; i++) {
        if (occurances[arrayOfWords[i]]) {
            occurances[arrayOfWords[i]]++;
        } else {
            occurances[arrayOfWords[i]] = 1;
        }
    }

    var sortedWords = [];

    for (occurance in occurances) {
        if (!stopwords.includes(occurance) && occurance.match(/\w+/g)) {
            sortedWords.push([
                decodeHTMLEntities(occurance),
                occurances[occurance],
            ]);
        }
    }

    sortedWords.sort((a, b) => {
        return b[1] - a[1];
    });

    return sortedWords.slice(0, range);
}

// define a route handler for the default home page
app.get("/getTitleCount", (req, res) => {
    getTitleData()
        .then((response) => {
            res.send(getMostUsedWords(response, 25));
        })
        .catch(() => res.send("Failed!. Data couldn't fetch!"));
});

app.get("/getCommentCount", (req, res) => {
    getCommentData()
        .then((response) => {
            res.send(getMostUsedWords(response, 25));
        })
        .catch(() => res.send("Failed!. Data couldn't fetch!"));
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
