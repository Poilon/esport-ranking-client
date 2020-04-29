<template>
  <v-container style="max-width:1024px; padding:24px;">
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
                      <th class="text-center">Rank</th>
                      <th class="text-center">MPGR</th>
                      <th class="text-center">CHARACTERS</th>
                      <th class="text-center">ELO</th>
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
                              <v-img width="20" :src="require('../assets/' + character.game.slug + '/' + character.slug + '.png')"/>
                            </div>
                          </v-row>
                        </v-container>
                      </td>
                      <td class="simple-table-td text-center">
                        <template v-if="player.elo">
                          <v-chip class="ml-0 my-2" color="#141414" text-color="white" small>
                            <span>{{ player.elo }}</span>
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
                        <v-list-item-subtitle><a :href="'/#/players/'+player.best_win.loser.id">{{ player.best_win.loser.name }}</a> at <a :href="'/#/tournaments/'+player.best_win.tournament.id">{{ player.best_win.tournament.name }}</a></v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item v-if="player.worst_lose">
                      <v-list-item-content>
                        <v-list-item-title>Worst Loss</v-list-item-title>
                        <v-list-item-subtitle><a :href="'/#/players/'+player.worst_lose.winner.id">{{ player.worst_lose.winner.name }}</a>  at  <a :href="'/#/tournaments/'+player.worst_lose.tournament.id">{{ player.worst_lose.tournament.name }}</a></v-list-item-subtitle>
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

    <v-layout row justify-center pa-4 pb-0 class="mt-5">
      <strong class="pl-2">Elo over time</strong>
      <v-spacer></v-spacer>
      <v-autocomplete
        v-model="otherPlayer"
        :items="players"
        item-text="name"
        item-value="id"
        label="Compare to"
        autocomplete="noautocomplete"
        clearable
        dense
        chip
        @change="fetchOtherPlayerElo($event)"
      >
        <template v-slot:item="data">
          <template v-if="typeof data.item !== 'object'">
            <v-list-item-content v-text="data.item"></v-list-item-content>
          </template>
          <template v-else>
            <v-list-item-avatar>
              <img
                :src="data.item.profile_picture_url ? data.item.profile_picture_url : '/no_avatar.png'"
              />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-html="data.item.name"></v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </template>
      </v-autocomplete>
    </v-layout>
    <v-card flat>
      <!-- Selected player vs Player To Compare to -->
      <v-layout row justify-center align-center v-if="otherPlayer" class="pa-4 pb-0">
        <v-flex xs5>
          <v-list two-lines>
            <v-list-item>
              <v-list-item-content class="text-right align-self-start">
                <v-list-item-title>
                  <strong>{{player.name}}</strong>
                </v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-flex>
        <v-flex xs2 class="text-center">
          <strong class="display-1 grey--text">VS</strong>
        </v-flex>
        <v-flex xs5>
          <v-list two-lines>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  <strong class="primary--text">{{ compareTo.name }}</strong>
                </v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-flex>
      </v-layout>
      <v-card-text class="pt-0">
        <PlayerEloMap
          class="pt-4"
          v-if="player.elo_map != '{}'"
          :compareTo="compareTo"
          :eloMap="JSON.parse(player.elo_map)"
          :key="player.id + compareTo.id"
        />
      </v-card-text>

    </v-card>

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
          :to="{ name: 'tournament', params: { id: item.tournament.id } }"
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
        text: "Elo change",
        align: "left",
        sortable: true,
        value: "tournament_diff"
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
              players(order_by: "elo desc", per_page: 1000, page: 1) {
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
              elo
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
                elo
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
          const tournaments_diffs = JSON.parse(this.player.tournaments_diffs)
          Object.keys(tournaments_diffs).forEach(tournament_id => {
            if (this.player.results.find(r => r.tournament_id == tournament_id))
              this.player.results.find(r => r.tournament_id == tournament_id).tournament_diff = tournaments_diffs[tournament_id]
          })
          console.log(this.player)
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
          to: `/?countries=["${this.player.country}"]`
        });
      }

      if (this.player.state) {
        arr.push({
          text: `${this.player.state} (${this.player.state_rank}${nth(this.player.state_rank)})`,
          link: true,
          to: `/?countries=["${this.player.country}"]&states=["${this.player.state}"]`
        });
      }

      if (this.player.city) {
        let stateParam = ""
        if (this.player.state)
          stateParam = `&states=["${this.player.state}"]`
        arr.push({
          text: `${this.player.city} (${this.player.city_rank}${nth(this.player.city_rank)})`,
          link: true,
          to: `/?countries=["${this.player.country}"]${stateParam}&cities=["${this.player.city}"]`
        });
      }
      return arr;
    }
  }
};
</script>
