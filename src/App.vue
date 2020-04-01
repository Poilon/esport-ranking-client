<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        ESPORT RANKING !
      </div>
    </v-app-bar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>

import gql from 'graphql-tag'

export default {
  name: 'App',

  data: () => ({
  }),

};
</script>
