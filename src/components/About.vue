<template>
  <v-container :style='background + "width: 100%; max-width: 100%; height: 100vh"'>
    <v-container style='background-color: white; opacity: 0.8;'>

      <p>Times have changed but we’re <b>S</b>till. <b>A</b>rranging. <b>M</b>elee. <b>E</b>vents. (or S.A.M.E for short).</p>

      <p>A collective of 11 premier European TO teams have joined forces under the S.A.M.E Circuit to give you a taste of some the best that European Melee can still offer (under the current circumstances).</p>
      
      <p>Tune in this weekend to <b>Teaghlach Online</b>🍀! on <a target="_blank" href="https://www.twitch.tv/btssmash/squad">btssmash/squad</a></b>, come experience Melee the Irish way</p>
      
      <p><b>Registration is live for the 9th and final S.A.M.E qualifier, Bagarre!</b>
      <br>Join <a target="_blank" href="https://twitter.com/ParisSmashGang">ParisSmashGang</a> for an online scuffle on the <b>25th -26th of September</b> with Melee Singles, Teams, Round 9 of International Crews and a combo contest!</p>

      <p><b>Register at </b><a href="https://smash.gg/bagarre" target="_blank">smash.gg/bagarre</a></b></p>

      <p>More information will be added to this website soon but for now this website only houses the leaderboards.
      <br>For more information about the circuit see <a href="https://smash.gg/SAMEcircuit" target="_blank">smash.gg/SAMEcircuit</a></p>

      <p>We're proud that S.A.M.E 2021 is also a qualifier for <b>Smash Summit 11</b> and <b>Smash Summit 12</b>. After unfortunate travel issues, we wish <a target="_blank" href="https://samecircuit.eu/#/players/d598526e-2531-47d7-84ec-d7bb46eea3cd">Pipsqueak</a> the best of luck at Smash Summit 12 by <a target="_blank" href="https://beyondthesummit.tv/">Beyond The Summit</a>
      <br>The highest placing uninvited singles player at the <b>SAME Finale</b> will also earn an invite to <b>Smash Summit 12</b> in December! Top 16 on the singles leaderboards qualify for the Finale!</p>
      
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
