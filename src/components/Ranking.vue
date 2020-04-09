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
        {{ ranks.indexOf(item.elo) + 1 }}
      </template>

      <template v-slot:item.name="{ item }">
        <v-chip
          class="ma-2"
          color="grey"
          text-color="white"
          :to="{ name: 'player', params: { id: item.id } }"
        >
          <v-avatar left v-if="item && item.profile_picture_url" >
            <v-img :src="item.profile_picture_url"/>
          </v-avatar>
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
      itemsPerPage: 20,

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
        text: "Elo",
        align: "left",
        sortable: true,
        value: "elo"
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
        query: gql`{ players(order_by: "elo desc", per_page: 20, page: 1) { id name score profile_picture_url elo } }`
      }).then(data => {
        this.players = data.data.players
        this.ranks = this.players.map(p => p.elo)
      })


      this.$apollo.query({
        query: gql`{ players(order_by: "elo desc", per_page: 500, page: 1) { id name score profile_picture_url elo } }`
      }).then(data => {
        this.players = data.data.players
        this.ranks = this.players.map(p => p.elo)
        this.loading = false
      })
    }
  }

};
</script>
