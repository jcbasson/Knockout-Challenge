"use strict";
/**
 * @class TournamentCalculator
 * @desc Object for handling Tournament calculations
 */
const TournamentCalculator = {};
/**
 * @memberOf TournamentCalculator
 * @dec Calculate whether the teams per match and number of teams are valid
 * @param {Integer} teamsPerMatch
 * @param {Integer} numberOfTeams
 * @param {Integer} maximumNumberOfTeamPerTournament
 * @returns {Object}
 */
TournamentCalculator.validateEntries = (teamsPerMatch, numberOfTeams, maximumNumberOfTeamPerTournament) => {
    //Apply basic validation to the teams per match field
    let validationResult = getBasicValidationResult(teamsPerMatch, 'teams');
    if(!validationResult.valid) return validationResult;

    //Apply basic validation to the number of team for tournament field
    validationResult = getBasicValidationResult(numberOfTeams, 'tournament teams');
    if(!validationResult.valid) return validationResult;

    //Check if the number of teams for tournament exceeds the maximum number of teams possible for the tournament
    if (numberOfTeams > maximumNumberOfTeamPerTournament)
    {
        validationResult.valid = false;
        validationResult.message = 'The number of teams per tournament exceeds the maximum allowed';
        return validationResult;
    }
    //Variable to track exponent used for teamsPerMatch to find out if number of teams value is valid
    let i = 1;
    /* While teamsPerMatch to the power i is less than the numberOfTeams,
     keep incrementing i to find the exponent that yields the closest value to the numberOfTeams */
    while (Math.pow(teamsPerMatch, i) < numberOfTeams) i++;

    //Check if the teamsPerMatch to the power i which yields the closest value to teams per match is equal to teams per match,
    if(Math.pow(teamsPerMatch, i) != numberOfTeams)
    {
        validationResult.valid = false;
        validationResult.message = 'The number of teams per tournament must be equal to the value of teams per match to the power of a positive integer';
        return validationResult;
    }
    return validationResult;
};

/**
 * @dec  Apply basic validations
 * @param {Integer} value
 * @param {String} nameOfField
 * @returns {Object}
 */
const getBasicValidationResult = (value, nameOfField) => {
    if(!value || isNaN(value))return  {valid: false, message:`Please enter ${nameOfField}`};
    if(value < 2) return {valid: false, message:`You must enter at least 2 ${nameOfField}`};
    return {valid: true, message:''};
}
/**
 * @memberOf TournamentCalculator
 * @dec Calculate total number of rounds
 * @param {Integer} teamsPerMatch
 * @param {Integer} numberOfTeams
 * @returns {Integer}
 */
TournamentCalculator.calculateRounds = (teamsPerMatch, numberOfTeams) => {
    let rounds = 1;
    while (Math.pow(teamsPerMatch, rounds) != numberOfTeams) {
        rounds++;
    }
    return rounds;
};
/**
 * @memberOf TournamentCalculator
 * @dec Retrieves all the ids from a list of teams
 * @param {Array<Team>} teams
 * @returns {Array<Integer>}
 */
TournamentCalculator.getTeamIds = (teams) => {
    const teamsIds = [];
    const teamsLength = teams.length;
    for(let i = 0; i <  teamsLength; i++)
    {
        let team = teams[i];
        teamsIds.push(team.id);
    }
    return teamsIds;
};
/**
 * @memberOf TournamentCalculator
 * @dec Calculates round of matches
 * @param {Array<Integer>} winningTeamIds
 * @param {Integer} maxNumberOfTeamsPerMatch
 * @returns {Array<Object>}
 */
TournamentCalculator.createRoundMatches = (winningTeamIds, maxNumberOfTeamsPerMatch) =>
{
    //Store newly generates matches
    const matches = [];
    //Calculated the maximum number of games for round
    const maxNumberOfGamesForRound = winningTeamIds.length/ maxNumberOfTeamsPerMatch;
    //Track the number of newly generated games
    let numberOfGamesForRoundCounter = 0;
    //Create round game/s
    while(numberOfGamesForRoundCounter !== maxNumberOfGamesForRound)
    {
        let match = {match: numberOfGamesForRoundCounter, teamIds: []};
        match.teamIds = winningTeamIds.splice(0, maxNumberOfTeamsPerMatch );
        matches.push(match);
        numberOfGamesForRoundCounter++;
    }
    return matches;
};
/**
 * @memberOf TournamentCalculator
 * @dec Calculates number of games for each round
 * @param {Integer} teamsPerMatch
 * @param {Integer} numberOfTeams
 * @param {Integer} numberOfRounds
 * @returns {Array<Integer>}
 */
TournamentCalculator.calculateNumberOfGamesPerRound = (teamsPerMatch, numberOfTeams, numberOfRounds) => {
    const gamePerRound = [];
    //Set first round amount of games
    let previousRoundAmountOfGames = numberOfTeams / teamsPerMatch;
    for (let i = 0; i < numberOfRounds; i++) {

        gamePerRound.push(previousRoundAmountOfGames);
        previousRoundAmountOfGames = previousRoundAmountOfGames / teamsPerMatch;
    }
    return gamePerRound;
};
/**
 * @memberOf TournamentCalculator
 * @dec Calculates the winning team
 * @param {Integer} winningScore
 * @param {Array<Team>} teams
 * @returns {Team}
 */
TournamentCalculator.calculateWinningTeam = (winningScore, teams) => {
    let winningTeam = null;
    //Get all teams with the winning score
    let teamsWithWinningScores = teams.filter(team => {
        return team.score === winningScore;
    });
    //If more than one team with a winning score
    if(teamsWithWinningScores.length > 0)
    {
        //Sort the teams with winning scores by id ascending
        let sortedByLowestIdTeams = teamsWithWinningScores.sort((team1, team2) => {
            return team1.id - team2.id;
        });

        //Winning team is the team with a winning score that has the lowest id
        winningTeam = sortedByLowestIdTeams[0];
    }
    else
    {
        //Winning is the only team with a winning score
        winningTeam = teamsWithWinningScores[0];
    }
    return winningTeam;
};
/**
 * @memberOf TournamentCalculator
 * @dec Iterates a list executing an asynchronous function for each item
 * @param {Array<Object>} list
 * @param {Function} asyncFunc
 * @param {Function} finalCallback
 */
TournamentCalculator.asyncIterator = (list, asyncFunc, finalCallback) => {

    //Keep track of the index of the next item to be processed
    var nextItemIndex = 0;

    const processItem = () => {

        nextItemIndex++;

        //Check if no more items left to iterate
        if (nextItemIndex === list.length  && finalCallback) {
            finalCallback();
        }
        else {
            asyncFunc(list[nextItemIndex], processItem);
        }
    };
    //Process first item and start iteration process
    asyncFunc(list[0], processItem);
};
export default TournamentCalculator;
