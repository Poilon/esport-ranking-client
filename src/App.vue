<template>
  <v-app>
    <v-app-bar app color="#141414" dark flat>
      <a href="/">
        <v-img style="transform: rotate(345deg)" class="mx-2 mr-4 mt-12" src="/black-same-logo.svg" max-height="160" max-width="160" contain></v-img>
      </a>
      <div class="d-flex align-center" style="font-size: 30px; font-weight: 800;">THE S.A.M.E LINEUP</div>
      <v-spacer></v-spacer>

      <v-radio-group
        v-model="radioGroup"
        hide-details
        @change="changeBackground($event)"
        row
      >
        <v-radio
          label="Day"
        ></v-radio>
        <v-radio
          label="Night"
        ></v-radio>
        <v-radio
          label="Map"
        ></v-radio>
      </v-radio-group>
    </v-app-bar>
    <v-content :style='backgroundColor() + "width: 100%; max-width: 100%; height: 100vh"'>
      <router-view :background='backgroundColor()'/>
    </v-content>
  </v-app>
</template>



<script>
import gql from "graphql-tag";

export default {
  name: "App",

  data () {
    return {
      radioGroup: parseInt(localStorage.getItem('radioGroupBackground')) || 0,
    }
  },

  mounted() {
    console.log(localStorage.getItem('radioGroupBackground'))
    this.radioGroup = parseInt(localStorage.getItem('radioGroupBackground')) || 0
  },

  methods: {
    changeBackground(radio) {
      localStorage.setItem('radioGroupBackground', radio);
    },

    backgroundColor() {
      if (this.radioGroup == 0)
        return "background-color: #f7f7f7;"
      else if (this.radioGroup == 1)
        return "background-color: black;"
      else
        return `background-image: url("./bg_map.png"); background-repeat: repeat; background-size: cover;`

    }
  }

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
