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
          :items-per-page="100"
          :search="playersSearch"
          class="elevation-1"
        ></v-data-table>
      </v-card>

      <v-card>
        <v-card-title>
          Melee Characters
          <v-spacer></v-spacer>
          <v-text-field
            v-model="charSearch"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="charHeaders"
          :items="characters"
          :items-per-page="5"
          :search="charSearch"
          class="elevation-1"
        ></v-data-table>
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
        query: gql`{ players { name score }}`
      }).then(data => {
        console.log(data.data.players)
        this.players = data.data.players
      })
    }
  }

};
</script>
