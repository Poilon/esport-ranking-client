<template>
  <v-container style="max-width:1024px; padding:24px;">
    <v-toolbar color="transparent" flat class="mt-2 ml-0">
      <v-layout row align-center>
      </v-layout>
    </v-toolbar>
  </v-container>
</template>


<script>
import gql from "graphql-tag";

import PlayerEloMap from "./PlayerEloMap";


export default {
  components: {
    PlayerEloMap
  },
  data: () => ({
    playerOne: {
      elo_map: "{}"
    },
    playerTwo: {
      
    },

  })
};


</script>
