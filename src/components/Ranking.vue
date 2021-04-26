<template>

  <v-container :style='background + "width: 100%; max-width: 100%;"'>

    <v-container style="max-width:1024px; padding:24px; background-color: white; opacity: 0.8;">
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

          <template v-slot:item.country="{ item }">
            <div @click="clickOnCountry(item.country)" style="cursor: pointer;">
              <CountryFlag :country="findCode(item.country)"/>
            </div>
          </template>

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
import CountryFlag from 'vue-country-flag'

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
  props: {
    background: {
      type: String
    }
  },
  components: { CountryFlag },
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
          text: "COUNTRY",
          align: "left",
          sortable: false,
          value: "country"
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
        characters: JSON.stringify(this.characters),
        tab: 2
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
    clickOnCountry(country) {
      console.log("toto")
      this.countries = [country]
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
        countries = countries.concat(this.europeanCountries())


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

      let filter = ', filter: "team == false'
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

      let orderByFilter = `, order_by: "score desc, elo desc"`

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
              elo
              country
              gender_pronoun
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
        this.players = data.data.paginated_players.data
        this.players.forEach(player => {
          if (!player.current_mpgr_ranking)
            player.current_mpgr_ranking = 9999999999;
        });
        this.ranks = this.players.map(p => p.score)
        this.loading = false
      })
    },

    europeanCountries() {
      return ['France', 'Germany', 'Switzerland', 'Andorra', 'Albania', 'Austria', 'Bosnia and Herzegovina',
      'Belgium', 'Bulgaria', 'Czech Republic', 'Denmark', 'Estonia', 'Spain', 'Finland', 'United Kingdom',
      'Guernsey', 'Gibraltar', 'Greece', 'Croatia', 'Hungary', 'Ireland', 'Iceland', 'Italy', 'Jersey',
      'Liechtenstein', 'Lithuania', 'Luxembourg', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Sweden',
      'Slovenia', 'Slovakia', 'Norway', 'Ukraine', 'Netherlands']
    },
    findCode(country){
      let c = this.flagCodes().find(ct => ct.name == country)
      if (c)
        return c.code
      else
        return ""
    },

    flagCodes() {
      return [
        { name: "Afghanistan", code: "af" },
        { name: "Åland Islands", code: "ax" },
        { name: "Albania", code: "al" },
        { name: "Algeria", code: "dz" },
        { name: "American Samoa", code: "as" },
        { name: "Andorra", code: "ad" },
        { name: "Angola", code: "ao" },
        { name: "Anguilla", code: "ai" },
        { name: "Antarctica", code: "aq" },
        { name: "Antigua and Barbuda", code: "ag" },
        { name: "Argentina", code: "ar" },
        { name: "Armenia", code: "am" },
        { name: "Aruba", code: "aw" },
        { name: "Australia", code: "au" },
        { name: "Austria", code: "at" },
        { name: "Azerbaijan", code: "az" },
        { name: "Bahamas", code: "bs" },
        { name: "Bahrain", code: "bh" },
        { name: "Bangladesh", code: "bd" },
        { name: "Barbados", code: "bb" },
        { name: "Belarus", code: "by" },
        { name: "Belgium", code: "be" },
        { name: "Belize", code: "bz" },
        { name: "Benin", code: "bj" },
        { name: "Bermuda", code: "bm" },
        { name: "Bhutan", code: "bt" },
        { name: "Bolivia (Plurinational State of)", code: "bo" },
        { name: "Bonaire, Sint Eustatius and Saba", code: "bq" },
        { name: "Bosnia and Herzegovina", code: "ba" },
        { name: "Botswana", code: "bw" },
        { name: "Bouvet Island", code: "bv" },
        { name: "Brazil", code: "br" },
        { name: "Virgin Islands (British)", code: "vg" },
        { name: "British Indian Ocean Territory", code: "io" },
        { name: "Brunei Darussalam", code: "bn" },
        { name: "Bulgaria", code: "bg" },
        { name: "Burkina Faso", code: "bf" },
        { name: "Burundi", code: "bi" },
        { name: "Cambodia", code: "kh" },
        { name: "Cameroon", code: "cm" },
        { name: "Canada", code: "ca" },
        { name: "Cabo Verde", code: "cv" },
        { name: "Cayman Islands", code: "ky" },
        { name: "Central African Republic", code: "cf" },
        { name: "Chad", code: "td" },
        { name: "Chile", code: "cl" },
        { name: "China", code: "cn" },
        { name: "Hong Kong", code: "hk" },
        { name: "Macao", code: "mo" },
        { name: "Christmas Island", code: "cx" },
        { name: "Cocos (Keeling) Islands", code: "cc" },
        { name: "Colombia", code: "co" },
        { name: "Comoros", code: "km" },
        { name: "Congo", code: "cg" },
        { name: "Congo, Democratic Republic of the", code: "cd" },
        { name: "Cook Islands", code: "ck" },
        { name: "Costa Rica", code: "cr" },
        { name: "Côte d'Ivoire", code: "ci" },
        { name: "Croatia", code: "hr" },
        { name: "Cuba", code: "cu" },
        { name: "Curaçao", code: "cw" },
        { name: "Cyprus", code: "cy" },
        { name: "Czechia", code: "cz" },
        { name: "Denmark", code: "dk" },
        { name: "Djibouti", code: "dj" },
        { name: "Dominica", code: "dm" },
        { name: "Dominican Republic", code: "do" },
        { name: "Ecuador", code: "ec" },
        { name: "Egypt", code: "eg" },
        { name: "El Salvador", code: "sv" },
        { name: "Equatorial Guinea", code: "gq" },
        { name: "Eritrea", code: "er" },
        { name: "Estonia", code: "ee" },
        { name: "Ethiopia", code: "et" },
        { name: "Falkland Islands (Malvinas)", code: "fk" },
        { name: "Faroe Islands", code: "fo" },
        { name: "Fiji", code: "fj" },
        { name: "Finland", code: "fi" },
        { name: "France", code: "fr" },
        { name: "French Guiana", code: "gf" },
        { name: "French Polynesia", code: "pf" },
        { name: "French Southern Territories", code: "tf" },
        { name: "Gabon", code: "ga" },
        { name: "Gambia", code: "gm" },
        { name: "Georgia", code: "ge" },
        { name: "Germany", code: "de" },
        { name: "Ghana", code: "gh" },
        { name: "Gibraltar", code: "gi" },
        { name: "Greece", code: "gr" },
        { name: "Greenland", code: "gl" },
        { name: "Grenada", code: "gd" },
        { name: "Guadeloupe", code: "gp" },
        { name: "Guam", code: "gu" },
        { name: "Guatemala", code: "gt" },
        { name: "Guernsey", code: "gg" },
        { name: "Guinea", code: "gn" },
        { name: "Guinea-Bissau", code: "gw" },
        { name: "Guyana", code: "gy" },
        { name: "Haiti", code: "ht" },
        { name: "Heard Island and McDonald Islands", code: "hm" },
        { name: "Holy See", code: "va" },
        { name: "Honduras", code: "hn" },
        { name: "Hungary", code: "hu" },
        { name: "Iceland", code: "is" },
        { name: "India", code: "in" },
        { name: "Indonesia", code: "id" },
        { name: "Iran (Islamic Republic of)", code: "ir" },
        { name: "Iraq", code: "iq" },
        { name: "Ireland", code: "ie" },
        { name: "Isle of Man", code: "im" },
        { name: "Israel", code: "il" },
        { name: "Italy", code: "it" },
        { name: "Jamaica", code: "jm" },
        { name: "Japan", code: "jp" },
        { name: "Jersey", code: "je" },
        { name: "Jordan", code: "jo" },
        { name: "Kazakhstan", code: "kz" },
        { name: "Kenya", code: "ke" },
        { name: "Kiribati", code: "ki" },
        { name: "Korea (Democratic People's Republic of)", code: "kp" },
        { name: "Korea, Republic of", code: "kr" },
        { name: "Kuwait", code: "kw" },
        { name: "Kyrgyzstan", code: "kg" },
        { name: "Lao People's Democratic Republic", code: "la" },
        { name: "Latvia", code: "lv" },
        { name: "Lebanon", code: "lb" },
        { name: "Lesotho", code: "ls" },
        { name: "Liberia", code: "lr" },
        { name: "Libya", code: "ly" },
        { name: "Liechtenstein", code: "li" },
        { name: "Lithuania", code: "lt" },
        { name: "Luxembourg", code: "lu" },
        { name: "North Macedonia", code: "mk" },
        { name: "Madagascar", code: "mg" },
        { name: "Malawi", code: "mw" },
        { name: "Malaysia", code: "my" },
        { name: "Maldives", code: "mv" },
        { name: "Mali", code: "ml" },
        { name: "Malta", code: "mt" },
        { name: "Marshall Islands", code: "mh" },
        { name: "Martinique", code: "mq" },
        { name: "Mauritania", code: "mr" },
        { name: "Mauritius", code: "mu" },
        { name: "Mayotte", code: "yt" },
        { name: "Mexico", code: "mx" },
        { name: "Micronesia (Federated States of)", code: "fm" },
        { name: "Moldova, Republic of", code: "md" },
        { name: "Monaco", code: "mc" },
        { name: "Mongolia", code: "mn" },
        { name: "Montenegro", code: "me" },
        { name: "Montserrat", code: "ms" },
        { name: "Morocco", code: "ma" },
        { name: "Mozambique", code: "mz" },
        { name: "Myanmar", code: "mm" },
        { name: "Namibia", code: "na" },
        { name: "Nauru", code: "nr" },
        { name: "Nepal", code: "np" },
        { name: "Netherlands", code: "nl" },
        { name: "New Caledonia", code: "nc" },
        { name: "New Zealand", code: "nz" },
        { name: "Nicaragua", code: "ni" },
        { name: "Niger", code: "ne" },
        { name: "Nigeria", code: "ng" },
        { name: "Niue", code: "nu" },
        { name: "Norfolk Island", code: "nf" },
        { name: "Northern Mariana Islands", code: "mp" },
        { name: "Norway", code: "no" },
        { name: "Oman", code: "om" },
        { name: "Pakistan", code: "pk" },
        { name: "Palau", code: "pw" },
        { name: "Palestine, State of", code: "ps" },
        { name: "Panama", code: "pa" },
        { name: "Papua New Guinea", code: "pg" },
        { name: "Paraguay", code: "py" },
        { name: "Peru", code: "pe" },
        { name: "Philippines", code: "ph" },
        { name: "Pitcairn", code: "pn" },
        { name: "Poland", code: "pl" },
        { name: "Portugal", code: "pt" },
        { name: "Puerto Rico", code: "pr" },
        { name: "Qatar", code: "qa" },
        { name: "Réunion", code: "re" },
        { name: "Romania", code: "ro" },
        { name: "Russian Federation", code: "ru" },
        { name: "Rwanda", code: "rw" },
        { name: "Saint Barthélemy", code: "bl" },
        { name: "Saint Helena, Ascension and Tristan da Cunha", code: "sh" },
        { name: "Saint Kitts and Nevis", code: "kn" },
        { name: "Saint Lucia", code: "lc" },
        { name: "Saint Martin (French part)", code: "mf" },
        { name: "Saint Pierre and Miquelon", code: "pm" },
        { name: "Saint Vincent and the Grenadines", code: "vc" },
        { name: "Samoa", code: "ws" },
        { name: "San Marino", code: "sm" },
        { name: "Sao Tome and Principe", code: "st" },
        { name: "Saudi Arabia", code: "sa" },
        { name: "Senegal", code: "sn" },
        { name: "Serbia", code: "rs" },
        { name: "Seychelles", code: "sc" },
        { name: "Sierra Leone", code: "sl" },
        { name: "Singapore", code: "sg" },
        { name: "Sint Maarten (Dutch part)", code: "sx" },
        { name: "Slovakia", code: "sk" },
        { name: "Slovenia", code: "si" },
        { name: "Solomon Islands", code: "sb" },
        { name: "Somalia", code: "so" },
        { name: "South Africa", code: "za" },
        { name: "South Georgia and the South Sandwich Islands", code: "gs" },
        { name: "South Sudan", code: "ss" },
        { name: "Soviet Union", code: "su" },
        { name: "Spain", code: "es" },
        { name: "Sri Lanka", code: "lk" },
        { name: "Sudan", code: "sd" },
        { name: "Suri name", code: "sr" },
        { name: "Svalbard and Jan Mayen", code: "sj" },
        { name: "Eswatini", code: "sz" },
        { name: "Sweden", code: "se" },
        { name: "Switzerland", code: "ch" },
        { name: "Syrian Arab Republic", code: "sy" },
        { name: "Taiwan, Province of China", code: "tw" },
        { name: "Tajikistan", code: "tj" },
        { name: "Tanzania, United Republic of", code: "tz" },
        { name: "Thailand", code: "th" },
        { name: "Timor-Leste", code: "tl" },
        { name: "Togo", code: "tg" },
        { name: "Tokelau", code: "tk" },
        { name: "Tonga", code: "to" },
        { name: "Trinidad and Tobago", code: "tt" },
        { name: "Tunisia", code: "tn" },
        { name: "Turkey", code: "tr" },
        { name: "Turkmenistan", code: "tm" },
        { name: "Turks and Caicos Islands", code: "tc" },
        { name: "Tuvalu", code: "tv" },
        { name: "Uganda", code: "ug" },
        { name: "Ukraine", code: "ua" },
        { name: "United Arab Emirates", code: "ae" },
        { name: "United Kingdom", code: "gb" },
        { name: "United Kingdom of Great Britain and Northern Ireland", code: "gb" },
        { name: "United States of America", code: "us" },
        { name: "United States Minor Outlying Islands", code: "um" },
        { name: "Uruguay", code: "uy" },
        { name: "Uzbekistan", code: "uz" },
        { name: "Vanuatu", code: "vu" },
        { name: "Venezuela (Bolivarian Republic of)", code: "ve" },
        { name: "Viet Nam", code: "vn" },
        { name: "Virgin Islands (U.S.)", code: "vi" },
        { name: "Wallis and Futuna", code: "wf" },
        { name: "Western Sahara", code: "eh" },
        { name: "Yemen", code: "ye" },
        { name: "Zambia", code: "zm" },
        { name: "Zimbabwe", code: "zw" },
        { name: "Catalonia", code: "es-ca" },
        { name: "England", code: "gb-eng" },
        { name: "Europe", code: "eu" },
        { name: "Galles", code: "gb-wls" },
        { name: "Wales", code: "gb-wls" },
        { name: "Kosovo", code: "xk" },
        { name: "Scotland", code: "gb-sct" },
        { name: "United Nations", code: "un" }
      ]
    }
  }
};
</script>
