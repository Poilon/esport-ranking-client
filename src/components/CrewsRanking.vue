<template>

  <v-container style='background-image: url("./bg_map.png"); background-repeat: repeat; background-size: cover; width: 100%; max-width: 100%;'>

    <v-container style="max-width:1024px; padding:24px;background-color: white; opacity: 0.9; border: 5px solid black; border-radius: 20px;">
      <v-card pa-4 flat color="transparent">
        <v-data-table
          dense
          :headers="playersHeaders"
          :items="players"
          :server-items-length="totalPlayers"
          :loading="loading"
          :options.sync="options"
          loading-text="Fetching data..."
          :footer-props="{'items-per-page-options':[16, 50, 100, 250, 500]}"
          class="elevation-0"
          hide-default-header
          hide-default-footer
        >
          <template v-slot:item.score="{ item }">{{ item.score }}</template>

          <template v-slot:item.name="{ item }">

            <v-list-item class="pl-0" dense>
              <v-list-item-avatar>
                <CountryFlag :country="item.country" />

              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-slot:item.stock_advantage="{ item }">
            <v-chip
              class="ma-2"
              color="#141414"
              text-color="white"
              small
            >
              <span>{{ item.stock_advantage }}</span>
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-layout row wrap justify-center align-center>
              <v-flex pr-4 xs6>
                <v-autocomplete
                  :items="characterList"
                  v-model="tmpChars[item.id]"
                  label="Characters"
                  autocomplete="noautocomplete"
                  item-text="name"
                  item-value="id"
                  clearable
                  multiple
                  :value="item.characters.map(c => c.id)"
                >
                </v-autocomplete>
              </v-flex>
              <v-btn
                color="green"
                :loading="btnLoading[item.id]"
                @click="changeCharactersOfPlayer(tmpChars[item.id], item.id)"
              >
                Apply
              </v-btn>

            </v-layout>
          </template>

          <template v-slot:item.characters="{ item }">
            <v-layout row wrap>
              <div v-for='character in item.characters' style="padding: 5px;">
                <div @click="clickOnCharacter(character)" style="cursor: pointer;">
                  <v-img width="20" :src="require('../assets/' + character.game.slug + '/' + character.slug + '.png')"/>
                </div>
              </div>
            </v-layout>
          </template>


        </v-data-table>

      </v-card>
    </v-container>
  </v-container>
</template>

<script>
import gql from "graphql-tag";
import CountryFlag from 'vue-country-flag'

export default {
  name: "CrewsRanking",
  components: { CountryFlag },

  data: () => ({
    tab: "singles",
    snackbar: false,
    snackbarText: "",
    authorizationToken: "",
    charSearch: "",
    playerSearch: "",
    loading: false,
    totalPlayers: 12,
    options: {},
    characterList: [],
    characters: [],
    players: [],
    ranks: [],
    countryList: [],
    stateList: [],
    cityList: [],
    countries: [],
    states: [],
    cities: [],
    active: false,
    tmpChars: {},
    btnLoading: {},
  }),

  watch: {
    options: {
      handler() {
        this.queryPlayers()
      }
    },
    playerSearch: function(p) {
      this.options.page = 1
      this.queryPlayers()
    }
  },

  mounted() {
    this.queryPlayers()
  },

  computed: {
    playersHeaders: function() {
      let headers = [
        {
          text: "SCORE",
          align: "left",
          sortable: true,
          value: "score"
        },
        {
          text: "COUNTRY",
          align: "left",
          sortable: true,
          value: "name"
        },
        {
          text: "STOCK ADVANTAGE",
          align: "left",
          sortable: true,
          value: "stock_advantage"
        }
      ]
      return headers
    }
  },
  methods: {

    queryPlayers() {

      this.players = [
        { name: "Netherlands", score: 3 * 1, stock_advantage:  20-9, country: "nl"},
        { name: "Germany", score: 3 * 1, stock_advantage:  20-9, country: "de"},
        { name: "Spain", score: 3 * 1, stock_advantage:  20-13, country: "es"},
        { name: "France", score: 3 * 1, stock_advantage:  20-15, country: "fr"},
        { name: "Greece", score: 3 * 0, stock_advantage:  0-0, country: "gr"},
        { name: "Switzerland", score: 3 * 0, stock_advantage:  15-20, country: "ch"},
        { name: "Belgium", score: 3 * 0, stock_advantage:  13-20, country: "be"},
        { name: "Scotland", score: 3 * 0, stock_advantage:  9-20, country: "gb-sct"},
        { name: "Wales", score: 3 * 0, stock_advantage:  9-20, country: "gb-wls"},
        { name: "Norway", score: 3 * 1, stock_advantage:  20-6, country: "no"},
        { name: "England", score: 3 * 1, stock_advantage:  20-15, country: "gb-eng"},
        { name: "Sweden", score: 3 * 1, stock_advantage:  20-17, country: "swe"},
        { name: "Austria", score: 3 * 1, stock_advantage:  20-18, country: "at"},
        { name: "Denmark", score: 3 * 0, stock_advantage:  0-0, country: "dk"},
        { name: "Portugal", score: 3 * 0, stock_advantage:  18-20, country: "pt"},
        { name: "Ireland", score: 3 * 0, stock_advantage:  17-20, country: "ie"},
        { name: "Finland", score: 3 * 0, stock_advantage:  15-20, country: "fi"},
        { name: "Italy", score: 3 * 0, stock_advantage:  6-20, country: "it"}
      ].sort((a, b) => {
        if (a.score === b.score)
          return b.stock_advantage - a.stock_advantage
        else
          return b.score - a.score
      })



    },

    europpeanCountries() {
      return ['France', 'Germany', 'Switzerland', 'Andorra', 'Albania', 'Austria', 'Bosnia and Herzegovina',
      'Belgium', 'Bulgaria', 'Czech Republic', 'Denmark', 'Estonia', 'Spain', 'Finland', 'United Kingdom',
      'Guernsey', 'Gibraltar', 'Greece', 'Croatia', 'Hungary', 'Ireland', 'Iceland', 'Italy', 'Jersey',
      'Liechtenstein', 'Lithuania', 'Luxembourg', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Sweden',
      'Slovenia', 'Slovakia', 'Norway', 'Ukraine', 'Netherlands']
    }
  }
};
</script>
