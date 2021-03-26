<template>
  <v-container :style='background + "width: 100%; max-width: 100%; height: 100vh"'>
    <v-container style='background-color: white; opacity: 0.8;'>


      <p>Times have changed but we’re Still. Arranging. Melee. Events. (or S.A.M.E for short).</p>

      <p>A collective of 11 premier European TO teams have joined forces under the S.A.M.E Circuit to give you a taste of some the best that European Melee can still offer (under the current circumstances).</p>
      
      <b><p>Tune in all weekend to the third S.A.M.E major, Phoenix Blue Online on</b> </p>
      <p> <a target="_blank" href="https://www.twitch.tv/btssmash">twitch.tv/btssmash> & <a target="blank" href="https://www.twitch.tv/btssmash2">twitch.tv/btssmash2</a>! 
      </p>

      <b><p>Registration is live for the next S.A.M.E event Regen Online!</b></p> 
      <br>The UK's first online Smash major & charity event in 2021 hosted on <b>April 23rd-25th</b>!Consider to donate to their <a target="_blank" href="https://www.specialeffect.org.uk/">SpecialEffect</a> Fundraiser at the link below!
<a target="blank" href="https://www.justgiving.com/RegenOnline">justgiving.com/RegenOnline</a>
      </p>

      <p>Register at <a target="_blank" href="https://smash.gg/regen" target="_blank">smash.gg/regen</a></p></b>

      <p>More information will be added to this website soon but for now this website only houses the leaderboards.
      For more information about the circuit see <a href="https://smash.gg/SAMEcircuit" target="_blank">smash.gg/SAMEcircuit</a></p>

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
