<template>
  <div :style='background'>
    <v-parallax height="200" src="bg_map.png">
      <div style="background-color: black; padding: 20px; opacity: 0.8;">
        <p class="text-center display-1 uppercase" style="background-color: black;">{{title}}</p>
        <!-- Petite ligne sous le titre -->
        <div
          style="width: 140px;  height: 4px;  background-color: white; margin: auto; margin-top:0; margin-bottom:0"
        ></div>
      </div>
    </v-parallax>

    <v-tabs
      v-model="tab"
      background-color="grey"
      color="white"
      center-active
      hide-slider
      grow
    >
      <v-tab
        key="about"
      >
        ABOUT
      </v-tab>
      <v-tab
        key="events"
      >
        EVENTS
      </v-tab>
      <!--
        <v-tab
          key="prizes"
        >
          PRIZES
        </v-tab>
      -->
      <v-tab
        key="singles"
      >
        SINGLES
      </v-tab>
      <v-tab
        key="crews"
      >
        EUROPEAN CREWS
      </v-tab>
      <v-tab
        key="teams"
      >
        DOUBLES
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">

      <v-tab-item
        key="about"
      >
        <About :background='background'/>
      </v-tab-item>
      <v-tab-item
        key="events"
      >
        <Events :background='background'/>
      </v-tab-item>

<!--  <v-tab-item
        key="prizes"
      >
      </v-tab-item>
 -->

      <v-tab-item
        key="singles"
      >
        <Ranking :background='background'/>
      </v-tab-item>
      <v-tab-item
        key="crews"
      >
        <CrewsRanking :background='background'/>
      </v-tab-item>
      <v-tab-item
        key="teams"
      >
        <DoublesRanking :background='background'/>
      </v-tab-item>

    </v-tabs-items>
  </v-card>

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
import Ranking from "./Ranking"
import Events from "./Events"
import About from "./About"
import CrewsRanking from "./CrewsRanking"
import DoublesRanking from "./DoublesRanking"


export default {
  name: "Main",

  components: {
    Ranking, Events, About, CrewsRanking, DoublesRanking
  },

  props: {
    background: {
      type: String
    }
  },

  data: () => ({
    tab: 0,
    snackbarText: "",
    snackbar: ""
  }),

  mounted() {
    if (this.$route.query.tab)
      this.tab = parseInt(this.$route.query.tab)
  },

  computed: {
    title() {
      if (this.tab == 0)
        return "About"
      if (this.tab == 1)
        return "Events"
      // if (this.tab == 2)
      //   return "Prizes"
      if (this.tab == 2)
        return "Singles Ranking"
      if (this.tab == 3)
        return "European Crews Ranking"
      if (this.tab == 4)
        return "Doubles Ranking"
    },
    test() {
      this.tab = 2
    }
  }

};
</script>
