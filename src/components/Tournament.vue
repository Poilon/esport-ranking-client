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

    <a :href="tournament.smashgg_link_url" target="_blank">
      {{ tournament.name }}
    </a>

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
      <template v-slot:item.player.name="{ item }">
        <v-chip
          class="ma-2"
          color="grey"
          text-color="white"
          :to="{ name: 'player', params: { id: item.player.id } }"
        >
          {{item.player.name}}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>

import gql from 'graphql-tag'

export default {
  data: () => ({
    tournament: {},
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
        text: "Player Name",
        align: "left",
        sortable: true,
        value: "player.name"
      },
    ],
  }),
  mounted() {

    this.$apollo.query({
      query: gql`{
        tournament(id: "${this.$route.params.id}") {
          name
          weight
          smashgg_link_url
          results { rank player { id name score profile_picture_url } }
        }
      }`
    }).then(data => {
      this.tournament = data.data.tournament
      this.results = this.tournament.results
      this.loading = false
    })
  }

}
</script>
