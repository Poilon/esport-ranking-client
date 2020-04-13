<template>
  <v-container style="max-width:1024px; padding:24px;">
    <v-toolbar color="transparent" flat class="mt-2 ml-0">
      <v-layout row align-center>
        <v-chip v-if="true" class="mr-4" color="primary" label text-color="white">POILON SOFTWARE</v-chip>

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

    <v-layout row>
      <v-flex xs3 px-4>
        <v-card height="100%" flat class="justify-center">
          <v-img
            :src="player.profile_picture_url ? player.profile_picture_url : '/no_avatar.png'"
            height="100%"
            width="100%"
          />
        </v-card>
      </v-flex>

      <v-flex xs9>
        <v-card height="100%" flat>
          <v-card-title>
            <v-flex xs4 v-if="true">
              <v-layout row justify-center>
                <v-flex class="text-center overline" xs12>RANK</v-flex>
                <v-flex class="primary--text text-center font-weight-black display-1" xs12>XX</v-flex>
              </v-layout>
            </v-flex>

            <v-flex xs4 v-if="player.current_mpgr_ranking">
              <v-layout row justify-center>
                <v-flex class="text-center overline" xs12>MPGR</v-flex>
                <v-flex
                  class="error--text text-center font-weight-black display-1"
                  xs12
                >{{player.current_mpgr_ranking}}</v-flex>
              </v-layout>
            </v-flex>

            <v-flex xs4 v-if="player.elo">
              <v-layout row justify-center>
                <v-flex class="text-center overline" xs12>ELO</v-flex>
                <v-flex
                  class="secondary--text text-center font-weight-black display-1"
                  xs12
                >{{player.elo}}</v-flex>
              </v-layout>
            </v-flex>
          </v-card-title>
          <v-flex xs12 class="px-4"> <v-divider color="#ddd" ></v-divider></v-flex>
         
          <v-card-text>
            <div
              v-if="player.best_win"
            >Best win => {{ player.best_win.loser.name }} ({{ player.best_win.tournament.name }})</div>
            <div
              v-if="player.worst_lose"
            >Worst lose => {{ player.worst_lose.winner.name }} ({{ player.worst_lose.tournament.name }})</div>

            <div>2020 matches count => {{ player.matches_count }}</div>
       
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <v-autocomplete
      v-model="otherPlayer"
      :items="players"
      item-text="name"
      item-value="id"
      label="Compare to"
      autocomplete="noautocomplete"
      clearable
      @change="fetchOtherPlayerElo($event)"
    />

    <PlayerEloMap
      v-if="player.elo_map != '{}'"
      :compareTo="compareTo"
      :eloMap="JSON.parse(player.elo_map)"
      :key="compareTo.id"
    />

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
      loading-text="Waiting for players..."
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
    compareTo: {},
    compareToLoaded: false,
    players: [],
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
      }
    ]
  }),
  mounted() {
    this.$apollo
      .query({
        query: gql`
          {
            players(order_by: "elo desc", per_page: 1000, page: 1) {
              id
              name
            }
          }
        `
      })
      .then(data => {
        this.players = data.data.players;
      });
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
              teams {
                id
                prefix
              }
              elo_map
              country
              state
              city
              twitch
              twitter
              mixer
              matches_count
              best_win {
                loser {
                  name
                }
                tournament {
                  name
                }
                full_round_text
              }
              worst_lose {
                winner {
                  name
                }
                tournament {
                  name
                }
                full_round_text
              }
              teams {
                prefix
              }
              results {
                rank
                tournament {
                  id
                  name
                }
              }
            }
          }
        `,
        variables: {
          id: this.$route.params.id
        }
      })
      .then(data => {
        this.player = data.data.player;
        this.results = this.player.results;
        this.loading = false;
      });
  },
  methods: {
    fetchOtherPlayerElo(id) {
      if (id)
        this.$apollo
          .query({
            query: gql`
              query EloMapOfPlayer($id: String!) {
                player(id: $id) {
                  id
                  name
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

      if (this.player.country) {
        arr.push({
          text: this.player.country,
          link: true,
          to: "/"
        });
      }

      if (this.player.state) {
        arr.push({
          text: this.player.state,
          link: true,
          to: "/"
        });
      }

      if (this.player.city) {
        arr.push({
          text: this.player.city,
          link: true,
          to: "/"
        });
      }
      return arr;
    }
  }
};
</script>
