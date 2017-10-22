'use strict';
/**
 * @class Team
 * @property {Integer} teamId
 * @property {String} name
 * @property {Integer} score
 * @property {TournamentService} tournamentService
 */
class Team {
    /**
     * @constructor Team
     * @param {Object} Team dependencies
     */
    constructor(teamId, tournamentService) {
        this.id = teamId;
        this.name = null;
        this.score = null;
        this.tournamentService = tournamentService;
    }
    /**
     * @memberOf Team
     * @desc Fetches the team details and initializes this Team object
     * @param {Integer} tournamentId
     */
    async initialise(tournamentId)
    {
        //Fetch team information
        const teamData = await this.tournamentService.fetchTeam(tournamentId, this.id );
        if(!teamData) return;// TODO: Log error and let user know
        this.name = teamData.name;
        this.score = teamData.score;
    }
}
export default Team;