<template>
  <v-container :style='background + "width: 100%; max-width: 100%; height: 100vh"'>
    <v-container style='background-color: white; opacity: 0.8;'>


      <p>Times have changed but we’re Still. Arranging. Melee. Events. (or S.A.M.E for short).</p>

      <p>A collective of 11 premier European TO teams have joined forces under the S.A.M.E Circuit to give you a taste of some the best that European Melee can still offer (under the current circumstances).</p>

      <p>Tune in this weekend to the next S.A.M.E event The uPSet - 27-28 of February!</p>

      <p>Find the Brackets at <a href="https://smash.gg/theuPSet" target="_blank">smash.gg/theuPSet</a></p>

    </v-container>
  </v-container>
</template>

<script>

import gql from 'graphql-tag'

export default {
  props: {
    background: {
      type: String
    }
  },
  data: () => ({

  }),
  mounted() {


  }

}
</script>
