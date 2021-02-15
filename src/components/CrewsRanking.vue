<template>

  <v-container style='background-image: url("./bg_map.png"); background-repeat: repeat; width: 100%; max-width: 100%;'>

    <v-container style="max-width:1024px; padding:24px;background-color: white; opacity: 0.9; border: 5px solid black; border-radius: 20px;">
      <v-card pa-4 flat color="transparent">
        <v-card-title class="py-0">
          <v-layout row>
            <v-flex xs4 pb-4>
              <v-text-field
                v-model="playerSearch"
                append-icon="mdi-magnify"
                label="Country"
                single-line
                hide-details
              ></v-text-field>
            </v-flex>


          </v-layout>
        </v-card-title>
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
        >
          <template v-slot:item.rank="{ item }">{{ ((options.page - 1) * options.itemsPerPage) + ranks.indexOf(item.score) + 1 }}</template>
          <template v-slot:item.name="{ item }">

            <v-list-item class="pl-0" dense">
              <v-list-item-avatar>
                <v-img :src="item.profile_picture_url ? item.profile_picture_url : '/no_avatar.png'"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-slot:item.score="{ item }">
            <v-chip
              class="ma-2"
              color="#141414"
              text-color="white"
              small
              :to="{ name: 'player', params: { id: item.id } }"
            >
              <span>{{ item.score }}</span>
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

export default {
  name: "Ranking",

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
    players: [
      {
        name: "France", score: 20, rank: 2
      }, {
        name: "Sweden", score: 50, rank: 1
      }
    ],
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
          text: "RANK",
          align: "left",
          sortable: false,
          value: "rank"
        },
        {
          text: "COUNTRY",
          align: "left",
          sortable: true,
          value: "name"
        },
      ]
      return headers
    }
  },
  methods: {

    queryPlayers() {

      this.players = [
        {
          name: "France", score: 20, rank: 1
        }, {
          name: "Sweden", score: 50, rank: 2
        }
      ]
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
