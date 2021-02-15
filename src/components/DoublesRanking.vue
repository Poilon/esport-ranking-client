<template>

  <v-container style='background-image: url("./bg_map.png"); background-repeat: repeat; width: 100%; max-width: 100%; height: 100vh;'>

    <v-container style="max-width:1024px; padding:24px;background-color: white; opacity: 0.9; border: 5px solid black; border-radius: 20px;">
      <v-card pa-4 flat color="transparent">
        <v-card-title class="py-0">
          <v-layout row>
            <v-flex xs4 pr-4>
              <v-text-field
                v-model="playerSearch"
                append-icon="mdi-magnify"
                label="Player"
                single-line
                hide-details
              ></v-text-field>
            </v-flex>

            <v-flex xs4 pr-4>
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

            <v-flex xs4>
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
            <v-flex xs4 pr-4 v-if="stateList.length > 0">
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
            <v-flex xs4 pr-4 v-if="cityList.length > 0">
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
          :server-items-length="totalPlayers"
          :loading="loading"
          :options.sync="options"
          loading-text="Fetching data..."
          :footer-props="{'items-per-page-options':[16, 50, 100, 250, 500]}"
          class="elevation-0"
        >
          <template v-slot:item.rank="{ item }">{{ ((options.page - 1) * options.itemsPerPage) + ranks.indexOf(item.score) + 1 }}</template>
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
    loading: true,
    totalPlayers: 0,
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
          sortable: false,
          value: "rank"
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
          sortable: false,
          value: "characters"
        },
        {
          text: "SCORE",
          align: "left",
          sortable: true,
          value: "score"
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
    clickOnCharacter(character) {
      this.characters = [character.name]
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

      const { sortBy, sortDesc, page, itemsPerPage } = this.options

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

      let filter = ', filter: "1 == 1'
      if (this.playerSearch.length > 0)
        filter += ` && players.name | '%${this.playerSearch}%'`
      if (countryFilter.length > 0)
        filter += ` && ${countryFilter}`
      if (countryFilter.length > 0 && stateFilter.length > 0)
        filter += ` && ${stateFilter}`
      if (countryFilter.length > 0 && cityFilter.length > 0)
        filter += ` && ${cityFilter}`

      filter += `"`
      let activeFilter = ""
      if (this.active)
        activeFilter = ",active: true"

      let orderByFilter = `, order_by: "score desc, name desc"`

      if (sortBy && sortBy.length > 0 && sortBy != "rank")
        orderByFilter = `, order_by: "${sortBy.join(',')} ${sortDesc[0] ? 'desc' : 'asc'}"`

      this.$apollo.query({
        query: gql`{
          paginated_players(per_page: ${itemsPerPage || 20}${orderByFilter}, page: ${page || 1}${activeFilter}${charactersFilter}${filter}) {
            total_count
            data {
              id
              name
              profile_picture_url
              current_mpgr_ranking
              score
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
        }`
      }).then(data => {
        this.totalPlayers = data.data.paginated_players.total_count
        this.players = [] // data.data.paginated_players.data
        this.players.forEach(player => {
          if (!player.current_mpgr_ranking)
            player.current_mpgr_ranking = 9999999999;
        });
        this.ranks = this.players.map(p => p.score)
        this.loading = false
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
