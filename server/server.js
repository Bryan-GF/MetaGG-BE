require('dotenv').config()
const express = require('express');
const server = express();
const cors = require('cors');
const request = require('request');
const axios = require('axios');

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

const delay = (amount = number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, amount);
    });
}

server.post('/api/user/by-name/match-history', async (req,res) => {
    axios.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${req.body.accountId}?api_key=${process.env.RIOT_KEY}&endIndex=${req.body.endIndex}&beginIndex=${req.body.beginIndex}`)
    .then(async(response) => {
        let data = response.data.matches;
        let matches = await Promise.all(data.map(async(match) => {
            const {champion, lane} = match;
            await delay(1000);
            return await axios.get(`https://na1.api.riotgames.com/lol/match/v4/matches/${match.gameId}?api_key=${process.env.RIOT_KEY}`)
            .then(async(res) => {
                let matchData = res.data;
                let puId = 0;
                for(let i = 0; i < matchData.participantIdentities.length; i++) {
                    if(matchData.participantIdentities[i].player.accountId === req.body.accountId) {
                        puId = matchData.participantIdentities[i].participantId;
                        break;
                    }
                }
                const {gameCreation, gameDuration, gameMode} = res.data;
                const {kills, deaths, assists, champLevel, totalMinionsKilled, win, perk0, perk5} = res.data.participants[puId - 1].stats;
                let finalData = {
                    champion,
                    lane,
                    gameCreation,
                    gameDuration,
                    gameMode,
                    kills,
                    deaths,
                    assists,
                    champLevel,
                    totalMinionsKilled,
                    win,
                    perk0,
                    perk5
                }
                
                return finalData;
            })
            .catch(async(err) => {
                return err
            });
            
        }));

        res.status(res.statusCode).json(matches);
    })
    .catch(err => {
        res.status(400).json({error: 'message'});
    })
});

module.exports = server;

/*
In the first object:
- Timestamp
- Champ id
- Lane

In the second object (in variable names already):
    MatchDto:
    - gameDuration
    - gameType

    ParticipantStatsDto:
    - kill / deaths / assists
    - champLevel
    - totalMinionsKilled(cs)
    - win (boolean)
    - perk0 (keystone)
    - perk5

*/
