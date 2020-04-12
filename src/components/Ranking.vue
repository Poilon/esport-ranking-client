<template>
  <v-card>
    <v-card-title>
      Players
      <v-spacer></v-spacer>
      <v-autocomplete
        v-model="country"
        :items="countries"
        label="Country"
        autocomplete="noautocomplete"
        clearable
      />

      <v-autocomplete
        v-if="states.length > 0"
        v-model="state"
        :items="states"
        label="State"
        autocomplete="noautocomplete"
        clearable
      />

      <v-autocomplete
        v-if="cities.length > 0"
        v-model="city"
        :items="cities"
        label="City"
        autocomplete="noautocomplete"
        clearable
      />

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
    ranks: [],
    countries: [],
    states: [],
    cities: [],
    country: "",
    state: "",
    city: ""
  }),

  mounted() {
    this.queryCharacters()
    this.queryCountries()
    this.queryPlayers()
  },

  watch: {
    country: function (country) {
      this.queryPlayers(country)
      this.queryStates(country)
      this.queryCities(country)
      this.city = ""
      this.state = ""

      return country
    },
    state: function (state) {
      this.queryPlayers(this.country, state)
      this.queryCities(this.country, state)
      this.city = ""

      return state
    },
    city: function (city) {
      this.queryPlayers(this.country, this.state, city)

      return city
    }
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
    queryCountries() {
      this.$apollo.query({
        query: gql`{ countries }`
      }).then(data => {
        this.countries = data.data.countries
      })
    },
    queryStates(country) {
      this.$apollo.query({
        query: gql`{ states(country: "${country}") }`
      }).then(data => {
        this.states = data.data.states
      })
    },
    queryCities(country, state) {
      let filter = ""
      if (state)
        filter += `, state: "${state}"`
      this.$apollo.query({
        query: gql`{ cities(country: "${country}"${filter}) }`
      }).then(data => {
        this.cities = data.data.cities
      })
    },

    queryCharacters() {
      this.$apollo.query({
        query: gql`{ characters { name game { name }}}`
      }).then(data => {
        this.characters = data.data.characters
      })
    },

    queryPlayers(country, state, city) {
      let filter = ""
      if (country)
        filter = `, filter: "country=='${country}'`
      if (country && state)
        filter += ` && state == '${state}'`
      if (country && city)
        filter += ` && city == '${city}'`
      if (country)
        filter += `"`

      this.$apollo.query({
        query: gql`{ players(order_by: "elo desc", per_page: 2000, page: 1${filter}) { id name score profile_picture_url elo } }`
      }).then(data => {
        this.players = data.data.players
        this.ranks = this.players.map(p => p.elo)
        this.loading = false
      })
    },
  }

};
</script>
