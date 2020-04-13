<template>
  <v-app>
    <v-app-bar app color="#141414" dark flat>
      <v-img class="mx-2 mr-4" src="/logo.png" max-height="28" max-width="28" contain></v-img>
      <div class="d-flex align-center">Melee Ranking</div>
      <v-spacer></v-spacer>
      <v-chip class="ma-2" color="transparent" text-color="white" to="/">Home</v-chip>
    </v-app-bar>
    <v-content>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "App",

  data: () => ({})
};
</script>

<style scope>
.v-data-table-header {
  background-color: #141414;
}
.v-data-table-header tr th span {
  color: white;
}

.v-application {
  background-color: #f7f7f7 !important;
}
</style>
