'use strict';

/**
 * @class TournamentService
 * @desc Object for handling Tournament CRUD operations with servers, sockets etc...
 */
class TournamentService {
    /**
     * @constructor TournamentService
     * @param {String}serverPort
     */
    constructor(serverPort) {
        this.serverPort = serverPort;
    }

    /**
     * @memberOf TournamentService
     * @param {Integer} teamsPerMatch
     * @param {Integer} numberOfTeams
     */
    fetchTournament(teamsPerMatch, numberOfTeams) {
        const requestBody = generateRequestBodyWithData({teamsPerMatch, numberOfTeams});
        const requestHeaders = new Headers();
        requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
        const requestOptions = {
            method: 'POST',
            headers: requestHeaders,
            body: requestBody
        };
        const request = new Request(`http://localhost:${ this.serverPort}/tournament`, requestOptions);
        //Execute request to Tournament endpoint
        return fetch(request).then((response) => {
            return response.json();
        }).then((tournament) => {
            return tournament;
        });
    };

    /**
     * @memberOf TournamentService
     * @param {Integer} tournamentId
     * @param {Integer} round
     * @param {Integer} match
     */
    fetchMatch(tournamentId, round, match) {
        const requestHeaders = new Headers();
        requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
        const requestOptions = {
            method: 'GET',
            headers: requestHeaders
        };
        const request = new Request(generateGetUrlWithParamData(`http://localhost:${this.serverPort}/match`, {
            tournamentId,
            round,
            match
        }), requestOptions);
        //Execute request to Match endpoint
        return fetch(request).then((response) => {
            return response.json();
        }).then((tournament) => {
            return tournament;
        });
    };

    /**
     * @memberOf TournamentService
     * @param {Integer} tournamentId
     * @param {Integer} teamId
     */
    fetchTeam(tournamentId, teamId) {
        const requestHeaders = new Headers();
        requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
        const requestOptions = {
            method: 'GET',
            headers: requestHeaders
        };
        const request = new Request(generateGetUrlWithParamData(`http://localhost:${this.serverPort}/team`, {
            tournamentId,
            teamId
        }), requestOptions);
        //Execute request to Team endpoint
        return fetch(request).then((response) => {
            return response.json();
        }).then((tournament) => {
            return tournament;
        });
    };

    /**
     * @memberOf TournamentService
     * @param {Integer} tournamentId
     * @param {Array<Integer>} teamScores
     * @param {Integer} matchScore
     * @param {Promise}
     */
    fetchWinner(tournamentId, teamScores, matchScore) {
        const requestHeaders = new Headers();
        requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
        const requestOptions = {
            method: 'GET',
            headers: requestHeaders
        };
        const request = new Request(generateGetWinnerUrl(`http://localhost:${this.serverPort}/winner`, tournamentId, teamScores, matchScore), requestOptions);
        //Execute request to Winner endpoint
        return fetch(request).then((response) => {
            return response.json();
        }).then((tournament) => {
            return tournament;
        });
    };
};

/**
 * @memberOf TournamentService
 * @param {String} url
 * @param {Integer} tournamentId
 * @param {Array<Integer>} teamScores
 * @param {Integer} matchScore
 * @param {String}
 */
const generateGetWinnerUrl = (url, tournamentId, teamScores, matchScore) => {

    let generatedUrl = url;
    generatedUrl += `?tournamentId=${tournamentId}&matchScore=${matchScore}`;
    //Loop through teams scores to generate the url query string parameters
    const teamScoresLength = teamScores.length;
    for (let i = 0; i < teamScoresLength; i++) {
        let teamScore = teamScores[i];
        generatedUrl += `&teamScores=${teamScore}`;
    }
    return generatedUrl;
};
/**
 * @memberOf HttpService
 * @param {Object} data
 * @returns {String}
 */
const generateRequestBodyWithData = (data) => {
    let generatedBody = '';
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            generatedBody += `${key}=${data[key]}&`;
        }
    }
    //Remove the last & from the url
    return generatedBody.slice(0, -1);
};
/**
 * @memberOf HttpService
 * @param {String} url
 * @param {Object} data
 * @returns {String}
 */
const generateGetUrlWithParamData = (url, data) => {
    let generatedUrl = `${url}?`;
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            generatedUrl += `${key}=${data[key]}&`;
        }
    }
    return generatedUrl.slice(0, -1);
};
export default TournamentService;
