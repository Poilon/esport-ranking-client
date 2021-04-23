<template>
  <v-container :style='background + "width: 100%; max-width: 100%; height: 100vh"'>
    <v-container style='background-color: white; opacity: 0.8;'>

      <p>Times have changed but we’re <b>S</b>till. <b>A</b>rranging. <b>M</b>elee. <b>E</b>vents. (or S.A.M.E for short).</p>

      <p>A collective of 11 premier European TO teams have joined forces under the S.A.M.E Circuit to give you a taste of some the best that European Melee can still offer (under the current circumstances).</p>
      
      <p>Tune in from Friday till Sunday to our 4th major, <b><a target="_blank" href="https://smash.gg/tournament/regen-online/details">Regen Online</a><b>, on <b><a target="_blank" href="https://twitch.tv/btssmash">BTSsmash</a></b> and <b><a target="_blank" href="https://twitch.tv/btssmash">BTSsmash 2</a></b></p>

      <p>Regen Online is raising funds for <a target="_blank" href="https://www.specialeffect.org.uk/">SpecialEffect</a> a charity driven to put fun and inclusion back into the lives of people with physical disabilities by helping them to play video games.
      <p>Consider to donate at <a target="blank" href="https://www.justgiving.com/RegenOnline">justgiving.com/RegenOnline</a></p>

      <b><p>Registration is live for the next S.A.M.E event, Smash Sauna Online!</b></p> 
      <p>SmashFinland will be heating up the competition on <b>21-23</b> of May with Melee Singles, Teams, Ladder and Smash Sisters and R5 of international crews!</p>

      <p><b>Sweat of the stress and register at</b> <a target="_blank" href="https://smash.gg/smashsauna" target="_blank">smash.gg/smashsauna</a></b></p>

      <p>More information will be added to this website soon but for now this website only houses the leaderboards.
      For more information about the circuit see <a href="https://smash.gg/SAMEcircuit" target="_blank">smash.gg/SAMEcircuit</a></p>

      <p>We're proud to reveal S.A.M.E 2021 is also a qualifier for <b>Smash Summit 11</b>. The 1st place on the singles leaderboards after Fête concludes earns an invite to the acclaimed invitational by <a target="_blank" href="https://beyondthesummit.tv/>Beyond The Summit</a></p>

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
