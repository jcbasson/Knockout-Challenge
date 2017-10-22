'use strict';
import Match from '../components/match.js'
/**
 * @class Matches
 * @property {Integer} number
 * @property {Element} containerElement
 * @property {Element} componentElement
 * @property {Integer} numberOfGames
 * @property {Array<Match>} matchComponents
 * @property {TournamentService} tournamentService
 * @property {TournamentCalculator} tournamentCalculator
 * @property {Array<Team>} winningTeams
 */
class Round {
    /**
     * @constructor Round
     * @param {Object} Round dependencies
     */
    constructor({roundNumber, containerElement, numberOfGames, tournamentService, tournamentCalculator}) {
        this.number = roundNumber;
        this.containerElement = containerElement;
        this.numberOfGames = numberOfGames;
        this.matchComponents = [];
        this.tournamentService = tournamentService;
        this.tournamentCalculator = tournamentCalculator;
        this.winningTeams = [];
        this.initializeView();
    }
    /**
     * @memberOf Round
     * @desc Gets and Set the component DOM elements, as well as creating child components
     */
    initializeView() {
        //Create component Element
        this.componentElement = document.createElement("div");
        this.componentElement.id = 'matchesComponent';
        this.componentElement.className = 'tournament-component__round-component';
        //Create child components
        this.createChildComponents();
        //Add component to parent component element
        this.containerElement.appendChild(this.componentElement);
    }
    /**
     * @memberOf Round
     * @desc Creates child components
     */
    createChildComponents() {
        //Loop through number round matches
        const totalNumberOfGames = this.numberOfGames;
        for (let i = 0; i < totalNumberOfGames; i++) {
            //Create match component
            const match = new Match({
                roundNumber: this.number,
                containerElement: this.componentElement,
                tournamentService: this.tournamentService,
                tournamentCalculator: this.tournamentCalculator
            });
            this.matchComponents.push(match);
        }
    }
    /**
     * @memberOf Round
     * @desc Starts iterating the match components with their corresponding match data
     *       Returns a promise that when resolved will return a list of the winning teams of this round
     * @param {Integer} tournamentId
     * @param {Array<Object>} matchesData
     * @returns {Array<Integer>}
     */
    async start(tournamentId, matchesData) {
        //Set round tournament id
        this.tournamentId = tournamentId;
        //Loop through match components and their corresponding match data
        const matchComponents = this.matchComponents;
        const matchesLength = matchComponents.length;
        for (let i = 0; i < matchesLength; i++) {
            const matchComponent = matchComponents[i];
            const matchData = matchesData[i];
            //Start match to get match winning team
            const winningTeam = await matchComponent.start(matchData, tournamentId);
            //Add winning team to the list of winning teams for this round
            this.winningTeams.push(winningTeam);
        }
        return this.winningTeams;
    }
    /**
     * @memberOf Round
     * @desc Unbind any events, clear web api calls, destroy child components, and remove round component elements from it's parent container element
     */
    destroy() {
        //Loops through the round match components
        let matchComponents = this.matchComponents;
        const matchComponentsLength = matchComponents.length;
        for (let i = 0; i < matchComponentsLength; i++) {
            const matchComponent = matchComponents[i];
            //Destroy the match component
            matchComponent.destroy();
        }
        matchComponents = null;
        //Remove Round component from DOM
        this.containerElement.removeChild(this.componentElement);
    }
}
export default Round;