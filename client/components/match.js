'use strict';
import Team from '../components/team.js';

/**
 * @class Match
 * @property {Integer} matchId
 * @property {Integer} round
 * @property {Integer} score
 * @property {Integer} winningScore
 * @property {Integer} tournamentId
 * @property {Boolean} isComplete
 * @property {Array<Integer>} teamIds
 * @property {Array<Team>} teams
 * @property {TournamentService} tournamentService
 * @property {TournamentCalculator} tournamentCalculator
 * @property {Element} containerElement
 * @property {Element} componentElement
 */
class Match {
    /**
     * @constructor Match
     * @param {Object} Match dependencies
     */
    constructor({roundNumber, containerElement, tournamentService, tournamentCalculator}) {
        this.matchId = null;
        this.round = roundNumber;
        this.score = null;
        this.winningScore = null;
        this.tournamentId = null;
        this.isComplete = false;
        this.teamIds = [];
        this.teams = [];
        this.tournamentService = tournamentService;
        this.tournamentCalculator = tournamentCalculator;
        this.containerElement = containerElement;
        this.initializeView(containerElement)
    }

    /**
     * @memberOf Match
     * @desc Gets and Set the component DOM elements
     */
    initializeView() {
        //Create match square container element
        this.componentElement = document.createElement("div");
        this.componentElement.className = 'round-component__match-component incomplete-game';
        //Create match square element
        const squareElement = document.createElement("div");
        squareElement.className = 'square';
        this.componentElement.appendChild(squareElement);
        //Add component to parent component element
        this.containerElement.appendChild(this.componentElement);
    }

    /**
     * @memberOf Match
     * @desc With data retrieved from the server starts the process of creating the Match object
     *       Returns a Promise that when resolved returns this match's winning Team object
     * @param {Object} matchData
     * @param {Integer} tournamentId
     * @returns {Team}
     */
    async start(matchData, tournamentId) {
        //Set match details
        this.matchId = matchData.match;
        this.tournamentId = tournamentId;
        this.teamIds = matchData.teamIds;
        this.score = await this.getMatchScore(this.tournamentId,this.round, this.matchId);
        this.teams = await this.getTeams(this.tournamentId, this.teamIds);
        this.winningScore = await  this.getWinner(this.tournamentId, this.teams, this.score);

        //Update Match component
        this.setMatchComplete();
        //Calculate and return the winning team
         const winningTeam = this.tournamentCalculator.calculateWinningTeam(this.winningScore, this.teams);
         return winningTeam;
    }

    /**
     * @memberOf Match
     * @desc Unbind any events, clear web api calls, and remove component elements from it's parent container element
     */
    destroy() {
        this.containerElement.removeChild(this.componentElement);
        this.componentElement = null;
    }

    /**
     * @memberOf Match
     * @desc  Fetches the Match score, checks the response and returns the match score
     * @param {Integer} tournamentId
     * @param {Integer} round
     * @param {Integer} matchId
     * @returns {Integer}
     */
    async getMatchScore(tournamentId, round, matchId)
    {
        //Get match score
        const matchScore = await this.tournamentService.fetchMatch(tournamentId, round, matchId);
        //Check if match score was retrieved
        if (!matchScore || !matchScore.score) return null;//Log error and let user know
        return matchScore.score
    }
    /**
     * @memberOf Match
     * @desc  Loop through the team ids and get their details
     * @param {Integer} tournamentId
     * @param {Array<Integer>} teamIds
     * @returns {Array<Team>}
     */
    async getTeams(tournamentId, teamIds) {
        const teamsLength = teamIds.length;
        const teams = [];
        for (let i = 0; i < teamsLength; i++) {
            //Create the Team
            const team = new Team(teamIds[i], this.tournamentService);
            //Initialize Team data
            await  team.initialise(tournamentId);
            //Add it to the list of match competitors
            teams.push(team);
        }
        return teams;
    }
    /**
     * @memberOf Match
     * @desc  Calculate winning team
     * @param {Integer} tournamentId
     * @param {Array<Team>} teams
     * @param {Integer} matchScore
     * @returns {Integer}
     */
    async getWinner(tournamentId, teams, matchScore)
    {
        //Get team scores
        const teamScores = teams.map(team => team.score);
        //Get winning score
        const winnerResponse = await this.tournamentService.fetchWinner(tournamentId, teamScores, matchScore);
        //Check if winning score was retrieved
        if (!winnerResponse && !winnerResponse.score) return null;//Log error and let user know
        return winnerResponse.score;
    }
    /**
     * @memberOf Match
     * @desc Changes the match complete status to done and updates it's UI component to indicate so
     */
    setMatchComplete() {
        this.isComplete = true;
        this.componentElement.className = 'round-component__match-component complete-game';
    }
}
export default Match;
