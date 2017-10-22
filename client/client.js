'use strict';
import Tournament from './components/tournament.js'
import TournamentCalculator from './utility/tournamentCalculator.js';
import TournamentService from './services/tournamentService.js';

window.onload = () => {
    //Number of items in australian_team_name.json multiplied by number of items in sydney_suburbs.json
    //A random name is generated with a combination of these names
    const maximumNumberOfTeamPerTournament = 75 * 668;
    //Initialize new Tournament component
    new Tournament({
        maximumNumberOfTeamPerTournament,
        TournamentCalculator,
        TournamentService : new TournamentService(window.location.port),
        containerElement: document,
    });
};