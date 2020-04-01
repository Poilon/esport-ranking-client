<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        ESPORT RANKING !
      </div>
    </v-app-bar>
    <v-content>
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
          :items-per-page="15"
          :search="playersSearch"
          :loading="loading"
          loading-text="Waiting for players..."
          dense
          class="elevation-1"
        >
          <template v-slot:item.ranks="{ item }">
            <div v-for="res in item.results">

              <v-chip
                class="ma-2"
                color="grey"
                text-color="white"
              >
                <v-avatar
                  left
                  class="grey darken-4"
                >
                  {{ res.rank }}
                </v-avatar>
              {{ res.tournament.name }}
              </v-chip>



            </div>
          </template>
        </v-data-table>
      </v-card>

    </v-content>
  </v-app>
</template>

<script>

import gql from 'graphql-tag'

export default {
  name: 'App',

  data: () => ({
    charSearch: "",
    playersSearch: "",
    loading: true,
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
    players: []

  }),

  mounted() {
    this.queryCharacters()
    this.queryPlayers()
  },

  methods: {
    queryCharacters() {
      this.$apollo.query({
        query: gql`{ characters { name game { name }}}`
      }).then(data => {
        this.characters = data.data.characters
      })
    },
    queryPlayers() {
      this.$apollo.query({
        query: gql`{ players { name score results { tournament { name } rank } } }`
      }).then(data => {
        this.players = data.data.players
        this.loading = false
      })
    }
  }

};
</script>
