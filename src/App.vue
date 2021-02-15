<template>
  <v-app>
    <v-app-bar app color="#141414" dark flat>
      <a href="/">
        <v-img style="transform: rotate(345deg)" class="mx-2 mr-4 mt-12" src="/black-same-logo.svg" max-height="160" max-width="160" contain></v-img>
      </a>
      <div class="d-flex align-center" style="font-size: 30px; font-weight: 800;">THE S.A.M.E LINEUP</div>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-content style='background-image: url("./bg_map.png"); background-repeat: repeat; background-size: cover; width: 100%; max-width: 100%; height: 100vh'>
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

thead {
  background-color: #141414;
}

th {
    color: white !important;
}

.v-data-table-header tr th span {
  color: white;
}

.v-application {
  background-color: #f7f7f7 !important;
}

.v-data-table-header__icon {
  color: white !important;
}
.simple-table-td {
  background-color:#e4e4e4;
}
</style>
