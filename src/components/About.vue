<template>
  <v-container :style='background + "width: 100%; max-width: 100%; height: 100vh"'>
    <v-container style='background-color: white; opacity: 0.8;'>

      <p>Times have changed but we’re <b>S</b>till. <b>A</b>rranging. <b>M</b>elee. <b>E</b>vents. (or S.A.M.E for short).</p>

      <p>A collective of 11 premier European TO teams have joined forces under the S.A.M.E Circuit to give you a taste of some the best that European Melee can still offer (under the current circumstances).</p>
      
      <p><b>Registration is live for the next S.A.M.E event, Fête Online!</b>
      <br><a target="_blank" href="https://twitter.com/FeteSmash">Team Fête</a> is hosting a week long party in their Minecraft venue from the <b>21st-27th of June</b> with Melee Singles, Teams, Round 6 of international crews, an Iron man bracket and much more to be revealed!</p>

      <p><b>Register at</b> <a href="https://smash.gg/fete" target="_blank">smash.gg/fete</a></b>🥳</p>

      <p>More information will be added to this website soon but for now this website only houses the leaderboards.
      For more information about the circuit see <a href="https://smash.gg/SAMEcircuit" target="_blank">smash.gg/SAMEcircuit</a></p>

      <p>We're proud that S.A.M.E 2021 is also a qualifier for <b>Smash Summit 11</b>. We wish <a target="_blank" href="https://samecircuit.eu/#/players/d598526e-2531-47d7-84ec-d7bb46eea3cd">Pipsqueak</a> the best of luck at the event by<a target="_blank" href="https://beyondthesummit.tv/">Beyond The Summit</a></p>

      <p>When registering for an event please make sure to read the <b><a target="blank" href="https://docs.google.com/document/d/1vlzR5-27qDeAmpWxqbQb7133jSQ-7gaZr3wTz5fR_Vg/edit?usp=sharing">S.A.M.E ruleset document</a></b></p>

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
