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

import gql from 'graphql-tag'

export default {
  data: () => ({
    player: {},
    results: [],
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
        player(id: "${this.$route.params.id}") {
          name
          profile_picture_url
          current_mpgr_ranking
          elo
          twitch
          twitter
          mixer
          matches_count
          best_win { loser { name } tournament { name } full_round_text }
          worst_lose { winner { name } tournament { name } full_round_text }
          results { rank tournament { id name } }
        }
      }`
    }).then(data => {
      this.player = data.data.player
      this.results = this.player.results
      this.loading = false
    })
  }

}
</script>
