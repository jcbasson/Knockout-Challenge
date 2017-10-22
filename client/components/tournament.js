'use strict';
import Round from '../components/round.js';

/**
 * @class Tournament
 * @property {Integer} tournamentId
 * @property {Boolean} isComplete
 * @property {Integer} numberOfRounds
 * @property {Array<Round>} rounds
 * @property {Integer} teamsPerMatch
 * @property {Array<Object>} currentRoundMatches
 * @property {Element} containerElement
 * @property {TournamentCalculator} tournamentCalculator
 * @property {TournamentService} tournamentService
 * @property {Element} componentElement
 * @property {Element} txtTeamsPerMatch
 * @property {Element} txtNumberOfTeams
 * @property {Element} btnStart
 * @property {Element} roundsComponent
 * @property {Element} winnerDisplayElement
 * @property {Element} validationMessageComponent
 */
class Tournament {
    /**
     * @constructor Tournament
     * @param {Object} Tournament dependencies
     */
    constructor({maximumNumberOfTeamPerTournament, TournamentCalculator, TournamentService, containerElement}) {
        this.tournamentId = null;
        this.isComplete = false;
        this.numberOfRounds = 0;
        this.rounds = [];
        this.teamsPerMatch = 0;
        this.currentRoundMatches = null;
        this.maximumNumberOfTeamPerTournament = maximumNumberOfTeamPerTournament;
        this.containerElement = containerElement;
        this.tournamentCalculator = TournamentCalculator;
        this.tournamentService = TournamentService;
        this.initializeView();
    }

    /**
     * @memberOf Tournament
     * @desc Gets and Set the component DOM elements
     */
    initializeView() {
        this.componentElement = this.containerElement.getElementById('tournamentComponent');
        this.txtTeamsPerMatch = this.containerElement.getElementById('teamsPerMatch');
        this.txtNumberOfTeams = this.containerElement.getElementById('numberOfTeams');
        this.btnStart = this.containerElement.getElementById('start');
        this.roundsComponent = this.containerElement.getElementById('roundsComponent');
        this.winnerDisplayElement = this.containerElement.getElementById('winner');
        this.validationMessageComponent = this.containerElement.getElementById('validationMessageComponent');
        this.btnStart.addEventListener('click', this.start.bind(this), true);
    }

    /**
     * @memberOf Tournament
     * @desc Reset the tournament component to allow the user to start a new one
     */
    reset() {
        let rounds = this.rounds;
        const roundsLength = rounds.length;
        //loop through round components to destroy them
        for (let i = 0; i < roundsLength; i++) {
            const round = rounds[i];
            round.destroy();
        }
        this.rounds = [];
        this.tournamentId = null;
        this.numberOfRounds = 0;
        this.teamsPerMatch = 0;
        this.currentRoundMatches = null;
        this.winnerDisplayElement.textContent = '';
    }

    /**
     * @memberOf Tournament
     * @desc Creates the new tournament object
     */
    start() {
        //Check if a previous tournament was played
        if (this.isComplete) {
            this.reset();
        }
        //Get user entries
        const teamsPerMatch = this.txtTeamsPerMatch.value;
        const numberOfTeams = this.txtNumberOfTeams.value;
        //Validate user entries and get the result
        const validationResult = this.tournamentCalculator.validateEntries(teamsPerMatch, numberOfTeams, this.maximumNumberOfTeamPerTournament);
        //Set the validation message
        this.setValidationMessageComponent(validationResult);
        //If user entries are valid
        if (validationResult.valid) {
            //Disable start button to stop user from starting a new tournament
            this.disableStartButton(true);
            //Set teams per match
            this.teamsPerMatch = teamsPerMatch;
            //Generate the round components
            this.generateRounds(teamsPerMatch, numberOfTeams);
            //Tournament to get tournament winner
            const tournamentWinnerAsync = this.runTournament(teamsPerMatch, numberOfTeams);
            tournamentWinnerAsync.then(this.tournamentWinnerHandler.bind(this));
        }
    }

    /**
     * @memberOf Tournament
     * @desc Generates the Tournament round components
     * @param {Integer} teamsPerMatch
     * @param {Integer} numberOfTeams
     */
    generateRounds(teamsPerMatch, numberOfTeams) {
        //Calculate number of rounds in the tournament
        this.numberOfRounds = this.tournamentCalculator.calculateRounds(teamsPerMatch, numberOfTeams);
        //Calculate total number of games per round in the tournament
        const gamesPerRound = this.tournamentCalculator.calculateNumberOfGamesPerRound(teamsPerMatch, numberOfTeams, this.numberOfRounds);
        const gamesPerRoundLength = gamesPerRound.length;
        for (let i = 0; i < gamesPerRoundLength; i++) {
            let numberOfGames = gamesPerRound[i];
            //Create the matches components, passing parent component element it needs to append to
            const round = new Round({
                roundNumber: i,
                containerElement: this.roundsComponent,
                numberOfGames,
                tournamentService: this.tournamentService,
                tournamentCalculator: this.tournamentCalculator
            });
            this.rounds.push(round);
        }
    }

    /**
     * @memberOf Tournament
     * @desc Fetch tournament data and process the rounds to generate a winner
     * @param {Integer} teamsPerMatch
     * @param {Integer} numberOfTeams
     * @returns {Team}
     */
    async runTournament(teamsPerMatch, numberOfTeams) {
        const tournamentData = await this.tournamentService.fetchTournament(teamsPerMatch, numberOfTeams);
        //Check response has valid fields
        if (isNaN(tournamentData.tournamentId) || !tournamentData.matchUps || !Array.isArray(tournamentData.matchUps)) return;
        //Set tournament id
        this.tournamentId = tournamentData.tournamentId;
        //Set current round of match data
        this.currentRoundMatches = tournamentData.matchUps;
        //Process the rounds to get the tournament winner
        const winner = await this.processRounds();
        return winner;
    }

    /**
     * @memberOf Tournament
     * @desc Loop through rounds, processing each match for each round till a winner is returned
     * @returns {Team}
     */
    async processRounds() {
        //Loop through rounds
        const rounds = this.rounds;
        const roundsLength = rounds.length;
        for (let i = 0; i < roundsLength; i++) {
            const round = rounds[i];
            //Start round
            const previousRoundWinningTeams = await round.start(this.tournamentId, this.currentRoundMatches);
            //Check if we have more games to settle
            if (previousRoundWinningTeams.length > 1) {
                //Get the ids of the previous rounds winning teams
                const previousRoundWinningTeamIds = this.tournamentCalculator.getTeamIds(previousRoundWinningTeams);
                //Create next round of matches
                this.currentRoundMatches = this.tournamentCalculator.createRoundMatches(previousRoundWinningTeamIds, this.teamsPerMatch);
            }
            else {
                //Handle Winner
                return previousRoundWinningTeams[0];
            }
        }
    }

    /**
     * @memberOf Tournament
     * @desc  Handles the winning team from the last round
     * @param {Team} winningTeam
     */
    tournamentWinnerHandler(winningTeam) {
        this.winnerDisplayElement.textContent = `${winningTeam.name} is the Winner.`;
        this.isComplete = true;
        this.disableStartButton(false);
    }

    /**
     * @memberOf Tournament
     * @desc Disables or enables the tournament start button
     * @param {Boolean} isDisabled
     */
    disableStartButton(isDisabled) {
        this.btnStart.disabled = isDisabled;
    }

    /**
     * @memberOf Tournament
     * @desc Sets the validation message component
     * @param {Object}
     */
    setValidationMessageComponent({valid, message}) {
        this.validationMessageComponent.textContent = message;
        this.validationMessageComponent.className = valid ? 'validation-error-message hidden' : 'validation-error-message'
    }
}

export default Tournament;
