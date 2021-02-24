<template>
  <div>
    <v-parallax height="200" src="bg_map.png">
      <div style="background-color: black; padding: 20px; opacity: 0.8;">
        <p class="text-center display-1 uppercase" style="background-color: black;">Crews Information</p>
        <!-- Petite ligne sous le titre -->
        <div
          style="width: 140px;  height: 4px;  background-color: white; margin: auto; margin-top:0; margin-bottom:0"
        ></div>
      </div>
    </v-parallax>

    <v-container style='background-color: #cfb289; background-repeat: repeat; background-size: cover; width: 100%; max-width: 100%'>

      <v-container style='background-color: white; border: 5px solid black; border-radius: 20px; margin-top: 50px;'>
        <a href="/#/?tab=3"> <v-img src="../assets/crews/1.png"> </v-img> </a>
      </v-container>

      <v-container style='background-color: white; border: 5px solid black; border-radius: 20px; margin-top: 50px;'>
        <a href="/#/?tab=3"> <v-img src="../assets/crews/2.png"> </v-img> </a>
      </v-container>

      <v-container style='background-color: white; border: 5px solid black; border-radius: 20px; margin-top: 50px;'>
        <a href="/#/?tab=3"> <v-img src="../assets/crews/3.png"> </v-img> </a>
      </v-container>

      <v-container style='background-color: white; border: 5px solid black; border-radius: 20px; margin-top: 50px;'>
        <a href="/#/?tab=3"> <v-img src="../assets/crews/4.png"> </v-img> </a>
      </v-container>

      <v-container style='background-color: white; border: 5px solid black; border-radius: 20px; margin-top: 50px;'>
        <a href="/#/?tab=3"> <v-img src="../assets/crews/5.png"> </v-img> </a>
      </v-container>

      <v-container style='background-color: white; border: 5px solid black; border-radius: 20px; margin-top: 50px;'>
        <a href="/#/?tab=3"> <v-img src="../assets/crews/6.png"> </v-img> </a>
      </v-container>

    </v-container>
  </div>
</template>

<script>

import gql from 'graphql-tag'

export default {
  data: () => ({

  }),
  mounted() {


  }

}
</script>
