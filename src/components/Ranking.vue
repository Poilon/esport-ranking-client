<template>
  <div>
    <v-parallax height="200" src="/parralax_1.jpg">
      <p class="text-center display-1 uppercase">{{leaderboardName}}</p>
      <!-- Petite ligne sous le titre -->
      <div
        style="width: 140px;  height: 4px;  background-color: white; margin: auto; margin-top:0; margin-bottom:0"
      ></div>
    </v-parallax>
    <v-container style="max-width:1024px; padding:24px;">
      <v-card pa-4 flat color="transparent">
        <v-card-title class="py-0">
          <v-layout row>
            <v-flex xs3 pr-4>
              <v-text-field
                v-model="playersSearch"
                append-icon="mdi-magnify"
                label="Player"
                single-line
                hide-details
              ></v-text-field>
            </v-flex>

            <v-flex xs3 px-2>
              <v-autocomplete
                :items="characterList"
                v-model="characters"
                label="Characters"
                autocomplete="noautocomplete"
                item-text="name"
                item-value="name"
                clearable
                multiple
                @change="changeCharacters($event)"
              >
                <template v-slot:item="data">
                  <v-list-item-avatar size="20" tile>
                    <v-img width="20" :src="require('../assets/' + data.item.game.slug + '/' + data.item.slug + '.png')"/>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title v-html="data.item.name"></v-list-item-title>
                    <v-list-item-subtitle></v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-flex>

            <v-flex xs3 px-2 pr-4>
              <v-autocomplete
                v-model="countries"
                :items="countryList"
                label="Countries"
                autocomplete="noautocomplete"
                clearable
                multiple
                @change="changeCountries($event)"
              />
            </v-flex>
            <v-flex xs3 pr-4 v-if="stateList.length > 0">
              <v-autocomplete
                v-model="states"
                :items="stateList"
                label="States"
                autocomplete="noautocomplete"
                clearable
                multiple
                @change="changeStates($event)"
              />
            </v-flex>
            <v-flex xs3 v-if="cityList.length > 0">
              <v-autocomplete
                v-model="cities"
                :items="cityList"
                label="Cities"
                autocomplete="noautocomplete"
                clearable
                multiple
                @change="changeCities($event)"
              />
            </v-flex>
          </v-layout>
        </v-card-title>
        <v-data-table
          dense
          :headers="playersHeaders"
          :items="players"
          :search="playersSearch"
          :loading="loading"
          :options.sync="options"
          loading-text="Fetching data..."
          :footer-props="{'items-per-page-options':[20, 50, 100, 250, 500, -1]}"
          class="elevation-0"
        >
          <template v-slot:item.rank="{ item }">{{ ranks.indexOf(item.elo) + 1 }}</template>
          <template
            v-slot:item.current_mpgr_ranking="{ item }"
          >{{ item.current_mpgr_ranking == 9999999999 ? "---" : item.current_mpgr_ranking }}</template>

          <template v-slot:item.name="{ item }">

            <v-list-item class="pl-0" dense :to="{ name: 'player', params: { id: item.id } }">
              <v-list-item-avatar>
                <v-img :src="item.profile_picture_url ? item.profile_picture_url : '/no_avatar.png'"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
                <v-list-item-subtitle></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-slot:item.elo="{ item }">
            <v-chip
              class="ma-2"
              color="#141414"
              text-color="white"
              small
              :to="{ name: 'player', params: { id: item.id } }"
            >
              <span>{{ item.elo }}</span>
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
                <v-img width="20" :src="require('../assets/' + character.game.slug + '/' + character.slug + '.png')"/>
              </div>
            </v-layout>
          </template>

          <template v-slot:item.ranks="{ item }">
            <v-flex v-for="(res,i) in item.results" :key="i">
              <v-chip
                class="ma-2"
                color="grey"
                text-color="white"
                :to="{ name: 'tournament', params: { id: res.tournament.id } }"
              >
                <v-avatar left :class="medalColor(res.rank)">{{ res.rank }}</v-avatar>
                {{ res.tournament.name }}
              </v-chip>
            </v-flex>
          </template>
        </v-data-table>
         <v-switch v-model="active" class="pl-4" label="Active players only" @change="changeActive($event)"/>

         <v-text-field v-model="authorizationToken" label="token" width="50"/>
      </v-card>
    </v-container>

    <div class="text-center ma-2">
      <v-snackbar
        v-model="snackbar"
      >

        {{ snackbarText }}
        <v-btn
          color="white"
          text
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </v-snackbar>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "Ranking",

  data: () => ({
    snackbar: false,
    snackbarText: "",
    authorizationToken: "",
    charSearch: "",
    playersSearch: "",
    loading: true,
    options: {
      itemsPerPage: 20,
      page: 1
    },
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
    btnLoading: {}
  }),

  mounted() {
    this.queryCharacters();
    this.queryCountries();

    if (this.$route.query.countries)
      this.countries = JSON.parse(this.$route.query.countries)
    if (this.$route.query.states)
      this.states = JSON.parse(this.$route.query.states)
    if (this.$route.query.cities)
     this.cities = JSON.parse(this.$route.query.cities)
    if (this.$route.query.characters)
     this.characters = JSON.parse(this.$route.query.characters)

    if (this.countries && this.countries.length > 0) {
      this.queryStates(this.countries)
      this.queryCities(this.countries)
    }
    if (this.countries && this.countries.length > 0 && this.states && this.states.length > 0) {
      this.queryStates(this.countries)
      this.queryCities(this.countries, this.states)
    }

    this.active = this.$route.query.active == 'true'

    this.queryPlayers()
  },

  computed: {
    leaderboardName: function() {
      let retName = "";

      if (this.countries && this.countries.length > 0) retName = this.countries.join(', ');

      if (this.states && this.states.length > 0) retName = this.states.join(', ');

      if (this.cities && this.cities.length > 0) retName = this.cities.join(', ');

      if (this.characters && this.characters.length > 0 && retName.length) retName = this.characters.join(', ') + ' in ' + retName;

      if (this.characters && this.characters.length > 0 && !retName.length) retName = this.characters.join(', ');

      return (retName.length ? retName.toUpperCase() : "GLOBAL") + " LEADERBOARD";
    },
    playersHeaders: function() {
      let headers = [
        {
          text: "RANK",
          align: "left",
          sortable: true,
          value: "rank"
        },
        {
          text: "MPGR",
          align: "left",
          sortable: true,
          value: "current_mpgr_ranking"
        },
        {
          text: "PLAYER",
          align: "left",
          sortable: true,
          value: "name"
        },
        {
          text: "CHARACTERS",
          align: "left",
          sortable: true,
          value: "characters"
        },
        {
          text: "ELO",
          align: "left",
          sortable: true,
          value: "elo"
        }
      ]
      if (this.authorizationToken)
        headers = headers.concat([{ text: "ACTIONS", align: "left", value: "actions" }])
      return headers
    }
  },
  methods: {
    changeCharactersOfPlayer(characterIds, playerId) {
      this.btnLoading[playerId] = true
      this.snackbarText = ""
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($character_ids: [String], $player_id: String!, $security_token: String!){
              update_player(
                id: $player_id
                security_token: $security_token
                player: {
                  character_ids: $character_ids
                }
              )
              {
                id
                characters {
                  id
                  name
                  slug
                  game {
                    id
                    slug
                  }
                }
              }
            }
          `,
          variables: {
            player_id: playerId,
            character_ids: characterIds,
            security_token: this.authorizationToken
          }
        })
        .then(data => {
          this.btnLoading[playerId] = false
          let p = this.players.find(p => playerId == p.id)
          p.characters = data.data.update_player.characters;
          this.snackbarText = `${p.name} characters update successful !`
          this.snackbar = true
        })
        .catch(err => {
          this.btnLoading[playerId] = false
          this.snackbarText = "Authentication Failed"
          this.snackbar = true
        });
    },
    update() {
      this.options.page = 1
      this.$router.push({ path: '/', query: {
        countries: JSON.stringify(this.countries),
        states: JSON.stringify(this.states),
        cities: JSON.stringify(this.cities),
        active: this.active,
        characters: JSON.stringify(this.characters)
      }})
      this.queryPlayers()
    },
    changeActive(active) {
      this.update()
    },
    changeCharacters(characters) {
      this.update()
    },

    changeCountries(countries) {
      this.options.page = 1
      this.queryStates(countries);
      this.queryCities(countries);
      if (!countries || countries.length == 0) {
        this.cities = []
        this.states = []
      }

      this.$router.push({ path: '/', query: {
        countries: JSON.stringify(countries),
        active: this.active,
        characters: JSON.stringify(this.characters)
      }})

      this.queryPlayers();
    },

    changeStates(states) {
      this.options.page = 1
      this.$router.push({ path: '/', query: { countries: JSON.stringify(this.countries), states: JSON.stringify(states), active: this.active,
        characters: JSON.stringify(this.characters) }})

      this.queryCities(this.countries, states);
      this.queryPlayers();
    },

    changeCities(cities) {
      this.options.page = 1
      if (this.states)
        this.$router.push({ path: '/', query: { countries: JSON.stringify(this.countries), state: JSON.stringify(this.states), cities: JSON.stringify(cities), active: this.active,
        characters: JSON.stringify(this.characters) }})
      else
        this.$router.push({ path: '/', query: { countries: JSON.stringify(this.countries), cities: JSON.stringify(cities), active: this.active,
        characters: JSON.stringify(this.characters) }})

      this.queryPlayers();
    },


    medalColor(rank) {
      if (rank == 1) return "yellow darken-2";
      if (rank == 2) return "grey darken-2";
      if (rank == 3) return "yellow darken-4";

      return "grey darken-4";
    },
    queryCountries() {
      this.$apollo
        .query({
          query: gql`
            {
              countries
            }
          `
        })
        .then(data => {
          this.countryList = data.data.countries;
        });
    },
    queryStates(countries) {
      this.$apollo
        .query({
          query: gql`{ states(countries: "${countries}") }`
        })
        .then(data => {
          this.stateList = data.data.states;
        });
    },
    queryCities(countries, states) {
      let filter = "";
      if (states) filter += `, states: "${states}"`;
      this.$apollo
        .query({
          query: gql`{ cities(countries: "${countries}"${filter}) }`
        })
        .then(data => {
          this.cityList = data.data.cities;
        });
    },

    queryCharacters() {
      this.$apollo
        .query({
          query: gql`
            {
              characters {
                id
                name
                slug
                game {
                  id
                  slug
                }
              }
            }
          `
        })
        .then(data => {
          this.characterList = data.data.characters;
        });
    },

    queryPlayers() {
      let countryFilter = ""
      let countries = JSON.parse(JSON.stringify(this.countries))

      if (countries && countries.includes('Europe'))
        countries = countries.concat(this.europpeanCountries())


      if (countries && countries.length > 0)
        countryFilter = "(" + countries.map(c => `country == '${c}'`).join(' || ') + ")"

      let charactersFilter = ""
      if (this.characters && this.characters.length > 0)
        charactersFilter = `, characters: "${this.characters}"`

      let stateFilter = ""
      if (this.states && this.states.length > 0 && countries && countries.length > 0)
        stateFilter = "(" + this.states.map(c => `state == '${c}'`).join(' || ') + ")"

      let cityFilter = ""
      if (this.cities && this.cities.length > 0 && countries && countries.length > 0)
        cityFilter = "(" + this.cities.map(c => `city == '${c}'`).join(' || ') + ")"

      let filter = ""
      if (countryFilter.length > 0)
        filter = `, filter: "${countryFilter}`
      if (countryFilter.length > 0 && stateFilter.length > 0)
        filter += ` && ${stateFilter}`
      if (countryFilter.length > 0 && cityFilter.length > 0)
        filter += ` && ${cityFilter}`
      if (countryFilter.length > 0)
        filter += `"`

      let activeFilter = ""
      if (this.active)
        activeFilter = ",active: true"

      this.$apollo.query({
        query: gql`{
          players(order_by: "elo desc, name asc"${activeFilter}${charactersFilter}, per_page: 2000, page: 1${filter}) {
            id
            name
            profile_picture_url
            current_mpgr_ranking
            elo
            characters {
              id
              name
              slug
              game {
                id
                slug
              }
            }
          }
        }`
      }).then(data => {
        this.players = data.data.players
        this.players.forEach(player => {
          if (!player.current_mpgr_ranking)
            player.current_mpgr_ranking = 9999999999;
        });
        this.ranks = this.players.map(p => p.elo)
        this.loading = false
      })
    },

    europpeanCountries() {
      return ['France', 'Germany', 'Switzerland', 'Andorra', 'Albania', 'Austria', 'Bosnia and Herzegovina',
      'Belgium', 'Bulgaria', 'Czech Republic', 'Denmark', 'Estonia', 'Spain', 'Finland', 'United Kingdom',
      'Guernsey', 'Gibraltar', 'Greece', 'Croatia', 'Hungary', 'Ireland', 'Iceland', 'Italy', 'Jersey',
      'Liechtenstein', 'Lithuania', 'Luxembourg', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Sweden',
      'Slovenia', 'Slovakia', 'Norway', 'Ukraine']
    }
  }
};
</script>
