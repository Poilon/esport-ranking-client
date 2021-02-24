<template>
  <v-container style="margin-top: 40px; max-width:1024px; padding:24px;background-color: white; opacity: 0.8;">
    <v-toolbar color="transparent" flat class="mt-2 ml-0">
      <v-layout row align-center>
        <v-chip
          v-if="player.teams && player.teams.name"
          class="mr-4"
          color="primary"
          label
          text-color="white"
        >{{player.teams.name}}</v-chip>

        <strong class="headline font-weight-black">{{ player.name && player.name.toUpperCase() }}</strong>

        <a v-if="player.twitch" :href="player.twitch" target="_blank" class="px-4">
          <v-img src="../assets/twitch.png" width="20" />
        </a>

        <a v-if="player.mixer" :href="player.mixer" target="_blank" class="px-4">
          <v-img src="../assets/mixer.png" width="20" />
        </a>

        <a v-if="player.twitter" :href="player.twitter" target="_blank" class="px-4">
          <v-img src="../assets/twitter.png" width="20" />
        </a>
        <v-spacer></v-spacer>
        <v-breadcrumbs class="pl-0" :items="localisationBreadcrumbs">
          <template v-slot:divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </v-layout>
    </v-toolbar>

    <v-layout row style="height:200px">
      <v-flex xs3 px-4>
        <v-card height="200" flat class="justify-center">
          <v-img
            :src="player.profile_picture_url ? player.profile_picture_url : '/no_avatar.png'"
            height="100%"
            width="100%"
          />
        </v-card>
      </v-flex>

      <v-flex xs9>
        <v-card height="200" flat card>
          <v-card-title class="pa-0">
            <v-flex xs12>
              <v-simple-table dense>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-center">RANK</th>
                      <th class="text-center">MPGR</th>
                      <th class="text-center">CHARACTERS</th>
                      <th class="text-center">SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="simple-table-td text-center">{{ player.rank }}</td>
                      <td
                        class="simple-table-td text-center"
                      >{{ player.current_mpgr_ranking ? player.current_mpgr_ranking : '--' }}</td>
                      <td class="simple-table-td text-center">
                        <v-container>
                          <v-row justify="center">
                            <div v-for='character in player.characters' style="padding: 5px;">
                              <a :href="'/#/?characters=' + JSON.stringify([character.name])" style="cursor: pointer;">
                                <v-img width="20" :src="require('../assets/' + character.game.slug + '/' + character.slug + '.png')"/>
                              </a>
                            </div>
                          </v-row>
                        </v-container>
                      </td>
                      <td class="simple-table-td text-center">
                        <template v-if="player.score">
                          <v-chip class="ml-0 my-2" color="#141414" text-color="white" small>
                            <span>{{ player.score }}</span>
                          </v-chip>
                        </template>
                        <template v-else>--</template>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-flex>
          </v-card-title>

          <v-card-text style="height:127px" class="pb-1 px-0" >
            <v-container fill-height class="px-0">
              <v-layout align-center>

                <v-flex xs5 class="d-flex justify-center align-center">
                  <v-progress-circular
                    rotate="270"
                    size="48"
                    :value="playerWinrate"
                    width="4"
                    color="light-blue"
                  >{{ playerWinrate }}%</v-progress-circular>

                  <span class="pl-4">
                    WIN RATE /
                    <strong>{{player.matches_count}}</strong> GAMES

                  <br>
                  <label v-if="player.winning_matches" >
                    {{player.winning_matches.length}} wins /
                    {{player.matches_count - player.winning_matches.length}} losses
                  </label>

                  </span>

                </v-flex>
                <v-divider vertical></v-divider>
                <v-flex xs7 text-xs-center>
                  <v-list dense color="transparent">
                    <v-list-item v-if="player.best_win">
                      <v-list-item-content>
                        <v-list-item-title>Best Win</v-list-item-title>
                        <v-list-item-subtitle><a :href="'/#/players/'+player.best_win.loser.id">{{ player.best_win.loser.name }}</a> at {{ player.best_win.tournament.name }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item v-if="player.worst_lose">
                      <v-list-item-content>
                        <v-list-item-title>Worst Loss</v-list-item-title>
                        <v-list-item-subtitle><a :href="'/#/players/'+player.worst_lose.winner.id">{{ player.worst_lose.winner.name }}</a>  at  {{ player.worst_lose.tournament.name }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>


    <v-card-title>
      Results
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="results"
      :items-per-page="15"
      :search="search"
      :loading="loading"
      loading-text="Loading data..."
      dense
      class="elevation-1"
    >
      <template v-slot:item.tournament.name="{ item }">
        <v-chip
          class="ma-2"
          color="grey"
          text-color="white"
        >{{item.tournament.name}}</v-chip>
      </template>

      <template v-slot:item.tournament_diff="{ item }">
        <div v-if="item.tournament_diff" :class="(item.tournament_diff.from - item.tournament_diff.to) < 0 ? 'green--text' : 'red--text'">
          {{ item.tournament_diff ? item.tournament_diff.from + " -> " + item.tournament_diff.to : "" }}
        </div>
      </template>

      <template v-slot:item.tournament.date="{ item }">
        <v-icon small color="#bbbbbb" class="pr-1">mdi-calendar</v-icon>
        {{ transformDate(item.tournament.date) }}
      </template>

    </v-data-table>
  </v-container>
</template>

<script>
import gql from "graphql-tag";
import PlayerEloMap from "./PlayerEloMap";

export default {
  components: {
    PlayerEloMap
  },
  data: () => ({
    player: {
      elo_map: "{}"
    },
    results: [],
    otherPlayer: "",
    playerWinrate: 0,
    compareTo: {},
    compareToLoaded: false,
    players: [],
    playerId: null,
    search: "",
    loading: true,
    headers: [
      {
        text: "Rank",
        align: "left",
        sortable: true,
        value: "rank"
      },
      {
        text: "Tournament Name",
        align: "left",
        sortable: true,
        value: "tournament.name"
      },
      {
        text: "Tournament Date",
        align: "left",
        sortable: true,
        value: "tournament.date"
      }
    ]
  }),
  beforeRouteUpdate(to, from, next) {
    this.playerId = to.params.id
    this.fetchCurrentPlayer()
    next()
  },
  mounted() {
    this.fastFetchPlayer()
    this.fetchPlayers()
    this.fetchCurrentPlayer()
  },
  methods: {
    transformDate(date) {
      return new Date(Date.parse(date.split(' ')[0])).toDateString()
    },
    fetchPlayers() {
      this.$apollo
        .query({
          query: gql`
            {
              players(order_by: "score desc", per_page: 1000, page: 1) {
                id
                name
                profile_picture_url
              }
            }
          `
        })
        .then(data => {
          this.players = data.data.players;
        });
    },
    fastFetchPlayer() {
      this.playerId = this.playerId || this.$route.params.id
      this.$apollo.query({
        query: gql`
          query FetchPlayer($id: String!) {
            player(id: $id) {
              id
              name
              profile_picture_url
              current_mpgr_ranking
              score
              rank
              city_rank
              state_rank
              country_rank
              teams {
                id
                prefix
              }
              country
              state
              city
              twitch
              twitter
              mixer
              characters {
                id
                name
                slug
                game {
                  id
                  slug
                }
              }
            }
          }`,
          variables: {
            id: this.playerId
          }
        }).then(data => {
          this.player = data.data.player;
          this.player.elo_map = "{}"
        })
    },
    fetchCurrentPlayer() {
      this.playerId = this.playerId || this.$route.params.id
      this.$apollo
        .query({
          query: gql`
            query FetchPlayer($id: String!) {
              player(id: $id) {
                id
                name
                profile_picture_url
                current_mpgr_ranking
                score
                rank
                city_rank
                state_rank
                country_rank
                teams {
                  id
                  prefix
                }
                elo_map
                tournaments_diffs
                country
                state
                city
                twitch
                twitter
                mixer
                characters {
                  id
                  name
                  slug
                  game {
                    id
                    slug
                  }
                }
                winning_matches {
                  id
                  loser_player_id
                  display_score
                  tournament { name }
                }
                losing_matches {
                  id
                  winner_player_id
                  display_score
                  tournament { name }

                }
                matches_count
                best_win {
                  loser {
                    name
                    id
                  }
                  tournament {
                    name
                    id
                  }
                  full_round_text
                }
                worst_lose {
                  winner {
                    name
                    id
                  }
                  tournament {
                    name
                    id
                  }
                  full_round_text
                }
                teams {
                  id
                  name
                  prefix
                }
                results {
                  rank
                  tournament_id
                  tournament {
                    date
                    id
                    name
                  }
                }
              }
            }
          `,
          variables: {
            id: this.playerId
          }
        })
        .then(data => {
          this.player = data.data.player;
          if (this.player.matches_count)
            this.playerWinrate = Math.round(
              (this.player.winning_matches.length / this.player.matches_count) *
                100
            );
          this.results = this.player.results;
          this.loading = false;
        });
    },
    fetchOtherPlayerElo(id) {
      if (id)
        this.$apollo
          .query({
            query: gql`
              query EloMapOfPlayer($id: String!) {
                player(id: $id) {
                  id
                  name
                  profile_picture_url
                  elo_map
                }
              }
            `,
            variables: {
              id: id
            }
          })
          .then(data => {
            this.compareTo = data.data.player;
            this.compareToLoaded = true;
          });
      else this.compareToLoaded = false;
    }
  },
  computed: {
    localisationBreadcrumbs: function() {
      let arr = [];

      const nth = function(d) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
        }
      }

      if (this.player.country) {
        arr.push({
          text: `${this.player.country} (${this.player.country_rank}${nth(this.player.country_rank)})`,
          link: true,
          to: `/?countries=["${this.player.country}"]&tab=2`
        });
      }

      if (this.player.state) {
        arr.push({
          text: `${this.player.state} (${this.player.state_rank}${nth(this.player.state_rank)})`,
          link: true,
          to: `/?countries=["${this.player.country}"]&states=["${this.player.state}"]&tab=2`
        });
      }

      if (this.player.city) {
        let stateParam = ""
        if (this.player.state)
          stateParam = `&states=["${this.player.state}"]`
        arr.push({
          text: `${this.player.city} (${this.player.city_rank}${nth(this.player.city_rank)})`,
          link: true,
          to: `/?countries=["${this.player.country}"]${stateParam}&cities=["${this.player.city}"]&tab=2`
        });
      }
      return arr;
    }
  }
};
</script>
