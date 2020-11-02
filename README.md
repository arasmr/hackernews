# Hackernews Api

This is a backend project which talks with Hackernews Api.

## Installation

Clone the repository to your local machine. Install requiered dependencies with the following command.

```
npm install
```

After the installation go to terminal and run the following command. Before you run the command please check if the port 5000 is not occupied.

```
npm run dev
```

This will run the project on port 5000. You can call the following enpoints to receive data.

```
{baseUrl}/getTitleCount
```

Calling this endpoint will return a set of 25 words that are the most occurring words in the title of the last 250 posted stories from Hackernews API.

```
{baseUrl}/getCommentCount
```

Calling this endpoint will return a set of the 25 top words with the number of times they occur from the last 1000 items that are available in the Hackernes API.