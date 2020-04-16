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
                v-model="country"
                :items="countries"
                label="Country"
                autocomplete="noautocomplete"
                clearable
              />
            </v-flex>
            <v-flex xs3 px-2 v-if="states.length > 0">
              <v-autocomplete
                v-model="state"
                :items="states"
                label="State"
                autocomplete="noautocomplete"
                clearable
              />
            </v-flex>
            <v-flex xs3 pl-2 v-if="cities.length > 0">
              <v-autocomplete
                v-model="city"
                :items="cities"
                label="City"
                autocomplete="noautocomplete"
                clearable
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
                <v-list-item-subtitle>Pôle Amande Anus</v-list-item-subtitle>
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
      </v-card>
    </v-container>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "Ranking",

  data: () => ({
    charSearch: "",
    playersSearch: "",
    loading: true,
    options: {
      itemsPerPage: 20
    },
    playersHeaders: [
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
        text: "ELO",
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
    this.queryCharacters();
    this.queryCountries();
    this.queryPlayers();
    this.country = this.$route.query.country
    this.state = this.$route.query.state
    this.city = this.$route.query.city
  },

  watch: {
    country: function(country) {
      this.queryPlayers(country);
      this.queryStates(country);
      this.queryCities(country);

      if (!this.state || this.state != this.$route.query.state)
        this.state = "";

      if (!this.city || this.city != this.$route.query.city)
        this.city = "";

      return country;
    },
    state: function(state) {
      this.queryPlayers(this.country, state);
      this.queryCities(this.country, state);
      if (!this.city || this.city != this.$route.query.city)
        this.city = "";

      return state;
    },
    city: function(city) {
      this.queryPlayers(this.country, this.state, city);

      return city;
    }
  },
  computed: {
    leaderboardName: function() {
      let retName = "";

      if (this.country) retName = this.country;

      if (this.state) retName = this.state;

      if (this.city) retName = this.city;

      return (retName ? retName.toUpperCase() : "GLOBAL") + " LEADERBOARD";
    }
  },
  methods: {
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
          this.countries = data.data.countries;
        });
    },
    queryStates(country) {
      this.$apollo
        .query({
          query: gql`{ states(country: "${country}") }`
        })
        .then(data => {
          this.states = data.data.states;
        });
    },
    queryCities(country, state) {
      let filter = "";
      if (state) filter += `, state: "${state}"`;
      this.$apollo
        .query({
          query: gql`{ cities(country: "${country}"${filter}) }`
        })
        .then(data => {
          this.cities = data.data.cities;
        });
    },

    queryCharacters() {
      this.$apollo
        .query({
          query: gql`
            {
              characters {
                name
                game {
                  name
                }
              }
            }
          `
        })
        .then(data => {
          this.characters = data.data.characters;
        });
    },

    queryPlayers(country, state, city) {
      let filter = "";
      if (country) filter = `, filter: "country=='${country}'`;
      if (country && state) filter += ` && state == '${state}'`;
      if (country && city) filter += ` && city == '${city}'`;
      if (country) filter += `"`;

      this.$apollo
        .query({
          query: gql`{ players(order_by: "elo desc", per_page: 10000, page: 1${filter}) { id current_mpgr_ranking name score profile_picture_url elo } }`
        })
        .then(data => {
          this.players = data.data.players;
          this.players.forEach(player => {
            if (!player.current_mpgr_ranking)
              player.current_mpgr_ranking = 9999999999;
          });
          this.ranks = this.players.map(p => p.elo);
          this.loading = false;
        });
    }
  }
};
</script>
