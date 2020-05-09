<template>
    <v-container style="max-width:1024px; padding:24px;">

        <!-- HEADER - NAME + SCORE (TO BE REDESIGNED) -->
        <v-toolbar color="transparent" flat class="mt-2 ml-0">
            Hello, {{playerName}}! Your current score is [score].
        </v-toolbar>
        <!-- Tournament : {{tournament.name}} -->

        <!-- <v-data-table
            :items="results"
            :headers="headers"
            :items-per-page="15"
            :search="search"
            :loading="loading"
            loading-text="Waiting for players..."
            dense
            class="elevation-1">

        </v-data-table> -->

        <div class="text-center">

            <!-- Quizz Starting - Temporal modal to enter your name
            Once name is entered, the game starts -->
            <v-btn rounded dark :disabled="launched" @click="dialog = true">
                Start a quizz
            </v-btn>
            <v-dialog v-model="dialog" persistent width="500">
                <v-card>
                    <v-card-title class="headline" primary-title>
                        Enter your name
                    </v-card-title>

                    <v-spacer></v-spacer>

                    <v-card-text>
                        <v-text-field
                            v-model="playerName"
                            label="Enter your name here"
                        ></v-text-field>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="this.launchGame">
                            O.K.
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Game itself
            Currently only "WHO WON THE TOURNAMENT X" -->
            <div :disabled="!launched">
                <div>
                    {{currentQuestion}}
                </div>

                <v-col 
                    v-for="n in answers.size"
                    :key="n"
                >
                    <div class="pa-2">
                        <v-btn @click="checkAnswer(answersToDisplay[n-1])">
                            {{answersToDisplay[n-1]}}
                        </v-btn>
                    </div>
                </v-col>
            </div>
        </div>

    </v-container>
</template>

<script>
import gql from "graphql-tag";

export default {
    data: () => ({
        currentQuestion: "",
        tournament: {},
        results: [],
        dialog: false,
        // search: "",
        loading: true,
        launched: false,
        playerName: "Anonymous666",
        answersToDisplay: [],
        answers: new Map(),
        MAX_ANSWERS: 4,
        /*
        headers: [
            {
                text: "Rank",
                align: "left",
                sortable: true,
                value: "rank"
            },
            {
                text: "Player Name",
                align: "left",
                sortable: true,
                value: "player.name"
            },
        ],*/
    }),
    mounted() {
        this.generateTournaments();
    },
    methods: {
        // Query to look for tournaments data
        // Currently only one tournament because idk how IDs work in SmashGG
        // TODO: Get 10 random IDs in order to get 10 random tournaments
        generateTournaments() {
            this.$apollo
                .query({
                    query: gql`{
                        tournament(id: "ba92b4ab-7b8e-4fa6-9afc-e97c9a9a997e") {
                            name
                            results { rank player { id name score profile_picture_url }}
                        }
                    }`
                })
                .then(data => {
                    this.tournament = data.data.tournament
                    this.results = this.tournament.results
                    this.loading = false
                });
        },
        // Launching the game (currently )
        // "answers" is a map containing 1 correct answer & 3 wrong answers
        // (player, true) means player won the tournament, correct answer
        // (player, false) means player didn't win the tournament, wrong answer
        // note: (player, false) is currently taken from 2nd trough 4th place
        launchGame() {
            this.dialog = false;
            this.launched = true;
            this.generateQuestion();
            for (var i = 0 ; i < 4 ; i++) {
                this.answersToDisplay[i] = this.results[i].player.name;
                this.answers.set(this.results[i].player.name, i === 0 ? true : false);
            }
        },
        generateQuestion() {
            this.currentQuestion = "Who won " + this.tournament.name + "?";
        },
        checkAnswer(answer){
            if (this.answers.get(answer) == true) {
                console.log("Won")
            } else {
                console.log("Lost")
            }
        }
    }
}
</script>