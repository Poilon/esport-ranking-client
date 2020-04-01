<template>
  <v-card>
    <v-card-title>
      Players
      <v-spacer></v-spacer>
      <v-text-field
        v-model="playersSearch"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="playersHeaders"
      :items="players"
      :search="playersSearch"
      :loading="loading"
      :options.sync="options"
      loading-text="Waiting for players..."
      dense
      class="elevation-1"
    >
      <template v-slot:item.rank="{ item }">
        {{ ranks.indexOf(item.score) + 1 }}
      </template>

      <template v-slot:item.name="{ item }">
        <v-chip
          class="ma-2"
          color="grey"
          text-color="white"
          :to="{ name: 'player', params: { id: item.id } }"
        >
          {{ item.name }}
        </v-chip>
      </template>

      <template v-slot:item.ranks="{ item }">
        <v-flex v-for="res in item.results">
          <v-chip
            class="ma-2"
            color="grey"
            text-color="white"
            :to="{ name: 'tournament', params: { id: res.tournament.id } }"
          >
            <v-avatar
              left
              :class="medalColor(res.rank)"
            >
              {{ res.rank }}
            </v-avatar>
          {{ res.tournament.name }}
          </v-chip>
        </v-flex>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>

import gql from 'graphql-tag'

export default {
  name: 'Ranking',

  data: () => ({
    charSearch: "",
    playersSearch: "",
    loading: true,
    options: {
      itemsPerPage: 10,

    },
    charHeaders: [
      {
        text: "Name",
        align: "left",
        sortable: true,
        value: "name"
      }
    ],
    playersHeaders: [
      {
        text: "Rank",
        align: "left",
        sortable: true,
        value: "rank"
      },
      {
        text: "Name",
        align: "left",
        sortable: true,
        value: "name"
      },
      {
        text: "Score",
        align: "left",
        sortable: true,
        value: "score"
      },
      {
        text: "Tournament results",
        align: "left",
        sortable: false,
        value: "ranks"
      }
    ],
    characters: [],
    players: [],
    ranks: []

  }),

  mounted() {
    this.queryCharacters()
    this.queryPlayers()
  },

  methods: {
    medalColor(rank) {
      if (rank == 1)
        return "yellow darken-2"
      if (rank == 2)
        return "grey darken-2"
      if (rank == 3)
        return "yellow darken-4"

      return "grey darken-4"

    },
    queryCharacters() {
      this.$apollo.query({
        query: gql`{ characters { name game { name }}}`
      }).then(data => {
        this.characters = data.data.characters
      })
    },
    queryPlayers() {
      this.$apollo.query({
        query: gql`{ players(order_by: "score desc", page: 1, per_page: 50) { id name score results { tournament { id name } rank } } }`
      }).then(data => {
        this.players = data.data.players
        this.players.map(p => { p.ranks = p.results.map(t => t.tournament.name) })
        this.ranks = this.players.map(p => p.score)
        this.loading = false
      })
    }
  }

};
</script>
