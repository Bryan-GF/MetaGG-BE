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

module.exports = server;