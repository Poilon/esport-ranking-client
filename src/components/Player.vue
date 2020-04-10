<template>
  <v-container>
    <v-chip
      class="ma-2"
      color="grey"
      text-color="white"
      to="/"
    >
      back
    </v-chip>

    <div style="width: 120px;" v-if="player.profile_picture_url">
      <a :href="player.profile_picture_url" target="_blank">
        <v-img :src="player.profile_picture_url" width="120"/>
      </a>
    </div>

    {{ player.name }}

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

    <v-layout row wrap style="padding-left: 10px;">
      <div style="width: 20px;" v-if="player.twitch">
        <a :href="player.twitch" target="_blank"> <v-img src="../assets/twitch.png" width="20"/> </a>
      </div>

      <div style="width: 20px;" v-if="player.mixer">
        <a :href="player.mixer" target="_blank"> <v-img src="../assets/mixer.png" width="20"/> </a>
      </div>

      <div style="width: 20px;" v-if="player.twitter">
        <a :href="player.twitter" target="_blank"> <v-img src="../assets/twitter.png" width="20"/> </a>
      </div>

    </v-layout>

    <div v-if="player.best_win">
      Best win => {{ player.best_win.loser.name }} ({{ player.best_win.tournament.name }})
    </div>
    <div v-if="player.worst_lose">
      Worst lose => {{ player.worst_lose.winner.name }} ({{ player.worst_lose.tournament.name }})
    </div>

    <div>
      2020 matches count => {{ player.matches_count }}
    </div>
    <div v-if="player.current_mpgr_ranking">
      MPGR Ranking : {{ player.current_mpgr_ranking }}
    </div>
    <div v-if="player.elo">
      Elo : {{ player.elo }}
    </div>

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
        >
          {{item.tournament.name}}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>

import gql from "graphql-tag";
import PlayerEloMap from "./PlayerEloMap"

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
      },
    ],
  }),
  mounted() {
    this.$apollo.query({
      query: gql`{
        players(order_by: "elo desc", per_page: 1000, page: 1) {
          id
          name
        }
      }`
    }).then(data => {
      this.players = data.data.players
    })
    this.$apollo.query({
      query: gql`
      query FetchPlayer($id: String!) {
        player(id: $id) {
          id
          name
          profile_picture_url
          current_mpgr_ranking
          elo
          elo_map
          twitch
          twitter
          mixer
          matches_count
          best_win { loser { name } tournament { name } full_round_text }
          worst_lose { winner { name } tournament { name } full_round_text }
          results { rank tournament { id name } }
        }
      }`,
      variables: {
        id: this.$route.params.id
      }
    }).then(data => {
      this.player = data.data.player
      this.results = this.player.results
      this.loading = false
    })
  },
  methods: {
    fetchOtherPlayerElo(id) {
      if (id)
        this.$apollo.query({
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
        }).then(data => {
          this.compareTo = data.data.player
          this.compareToLoaded = true
        })
      else
        this.compareToLoaded = false
    }
  }
}
</script>
