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

    {{ player.name }}
    <div v-if="player.current_mpgr_ranking">
      MPGR Ranking : {{ player.current_mpgr_ranking }}
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
          current_mpgr_ranking
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
