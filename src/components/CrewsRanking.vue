<template>

  <v-container :style='background + "width: 100%; max-width: 100%;"'>

    <v-container style="max-width:1024px; padding:24px;background-color: white; opacity: 0.8">
      <v-row no-gutters>
        <v-col sm6 cols12 style="justify-content: center; align-items: center; border-right: 2px solid black;">
          <h3 style="text-align: center">POOL A</h3>
          <v-data-table
            dense
            :headers="playersHeaders"
            :items="players1"
            :server-items-length="totalPlayers"
            :loading="loading"
            :options.sync="options"
            loading-text="Fetching data..."
            :footer-props="{'items-per-page-options':[16, 50, 100, 250, 500]}"
            class="elevation-0"
            hide-default-footer
          >
            <template v-slot:item.score="{ item }">{{ item.score }}</template>

            <template v-slot:item.name="{ item }">

              <v-list-item class="p-0" dense :style="'background-color: ' + item.color">
                <v-list-item-avatar>
                  <CountryFlag :country="item && item.country" />

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
        </v-col>

        <v-col sm6 cols12 style="justify-content: center;">
          <h3 style="text-align: center">POOL B</h3>

          <v-data-table
            dense
            :headers="playersHeaders"
            :items="players2"
            :server-items-length="totalPlayers"
            :loading="loading"
            :options.sync="options"
            loading-text="Fetching data..."
            :footer-props="{'items-per-page-options':[16, 50, 100, 250, 500]}"
            class="elevation-0"
            hide-default-footer
          >
            <template v-slot:item.score="{ item }">{{ item.score }}</div></template>

            <template v-slot:item.name="{ item }">

              <v-list-item class="p-0" dense :style="'background-color: ' + item.color">
                <v-list-item-avatar>
                  <CountryFlag :country="item && item.country" />

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
        </v-col>
      </v-row>



      <v-btn style="margin-top: 20px;" :to="{ name: 'crews_info' }" > More info ...</v-btn>
    </v-container>


    <v-container style="max-width:1024px; padding:24px;background-color: white; opacity: 0.8; margin-top: 40px;">
      <h3 style="text-align: center"> Provisional Bracket </h3>

      <v-row no-gutters>
        <v-col sm3 colsl12>
          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool A 1st: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players1[0] && players1[0].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players1[0] && players1[0].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool B 4th: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players2[3] && players2[3].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players2[3] && players2[3].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>


          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool A 3rd: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players1[2] && players1[2].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players1[2] && players1[2].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>


          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool B 2nd: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players2[1] && players2[1].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players2[1] && players2[1].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>



          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool B 1st: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players2[0] && players2[0].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players2[0] && players2[0].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>


          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool A 4th: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players1[3] && players1[3].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players1[3] && players1[3].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>


          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool B 3rd: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players2[2] && players2[2].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players2[2] && players2[2].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>


          <v-list-item class="p-0" dense>
            <div style="width: 100px; font-weight: 600;"> Pool A 2nd: </div>
            <v-list-item-avatar>
              <CountryFlag :country="(players1[1] && players1[1].country) || 'fr' " />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{players1[1] && players1[1].name}}</v-list-item-title>
              <v-list-item-subtitle></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col sm9 cols12>
          <v-img src="../assets/crews/sameBracket.png" class="pt-2" style="min-width: 625px; width: 600px; margin-top: -58px; margin-left: -290px; height: 500px"></v-img>
        </v-col>
      </v-row>

    </v-container>
  </v-container>
</template>

<script>
import gql from "graphql-tag";
import CountryFlag from 'vue-country-flag'

export default {
  name: "CrewsRanking",
  components: { CountryFlag },
  props: {
    background: {
      type: String
    }
  },
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
    players1: [],
    players2: [],
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
          text: "COUNTRY",
          align: "left",
          sortable: false,
          value: "name"
        },
        {
          text: "WINS",
          align: "left",
          sortable: false,
          value: "wins"
        },
        {
          text: "LOSS",
          align: "left",
          sortable: false,
          value: "loss"
        },
        {
          text: "STOCK ADVANTAGE",
          align: "left",
          sortable: false,
          value: "stock_advantage"
        }
      ]
      return headers
    }
  },
  methods: {

    queryPlayers() {

      this.players1 = [
        { name: "France", wins: 5, loss: 0, stock_advantage:  80-50, country: "fr", color: "lightgreen"},
        { name: "Germany", wins: 4, loss: 0, stock_advantage:  80-33, country: "de", color: "lightgreen"},
        { name: "Netherlands", wins: 4, loss: 1, stock_advantage:  97-66, country: "nl", color: "lightgreen"},
        { name: "Scotland", wins: 2, loss: 2, stock_advantage:  38-52, country: "gb-sct", color: "lightgreen"},

        { name: "Spain", wins: 1, loss: 4, stock_advantage:  46-53, country: "es"},
        { name: "Switzerland", wins: 1, loss: 2, stock_advantage:  50-59, country: "ch"},
        { name: "Belgium", wins: 1, loss: 3, stock_advantage:  48-70, country: "be"},
        { name: "Wales", wins: 1, loss: 4, stock_advantage:  66-90, country: "gb-wls"},
        { name: "Greece", wins: 0, loss: 3, stock_advantage:  28-60, country: "gr"},
      ].sort((a, b) => {
        if (a.wins === b.wins)
          return b.stock_advantage - a.stock_advantage
        else
          return b.wins - a.wins
      })

      this.players2 = [
        { name: "Finland", wins: 5, loss: 1, stock_advantage:  115-73, country: "fi", color: "lightgreen"},
        { name: "England", wins: 4, loss: 0, stock_advantage:  80-45, country: "gb-eng", color: "lightgreen"},
        { name: "Norway", wins: 4, loss: 1, stock_advantage:  95-63, country: "no", color: "lightgreen"},
        { name: "Sweden", wins: 2, loss: 1, stock_advantage:  51-52, country: "swe", color: "lightgreen"},

        { name: "Ireland", wins: 2, loss: 3, stock_advantage:  87-92, country: "ie"},
        { name: "Denmark", wins: 2, loss: 2, stock_advantage:  69-76, country: "dk"},
        { name: "Austria", wins: 1, loss: 3, stock_advantage:  70-78, country: "at"},
        { name: "Italy", wins: 0, loss: 4, stock_advantage:  42-80, country: "it"},
        { name: "Portugal", wins: 0, loss: 5, stock_advantage:  60-100, country: "pt"},
      ].sort((a, b) => {
        if (a.wins === b.wins)
          return b.stock_advantage - a.stock_advantage
        else
          return b.wins - a.wins
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
<style scope>
  tr.green { background-color: green }
</style>
