require('dotenv').config()
const express = require('express');
const server = express();
const cors = require('cors');
const request = require('request');

server.use(express.json())
server.use(cors());
process.env.RIOT_KEY

server.post('/api/user/by-name', async (req,res) => {
    await request(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${req.body.name}?api_key=${process.env.RIOT_KEY}`, function (error, response, body) {
        if(error) {
            res.status(500).json(error);
        } else {
            res.status(response.statusCode).json(JSON.parse(body));
        }
    });
});

server.post('/api/user/by-name/ranked', async (req,res) => {
    await request(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${req.body.summonerId}?api_key=${process.env.RIOT_KEY}`, function (error, response, body) {
        if(error) {
            res.status(500).json(error);
        } else {
            let jsonResponse = JSON.parse(body);
            let rankedData = {}
            for(let i = 0; i < jsonResponse.length; i++) {
                rankedData[jsonResponse[i].queueType] = jsonResponse[i];
            }
            res.status(response.statusCode).json(rankedData);
        }
    });
});

module.exports = server;