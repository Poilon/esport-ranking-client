<template>
    <v-container style="max-width:1024px; padding:24px;">

        <!-- HEADER - NAME + SCORE (TO BE REDESIGNED) -->
        <v-toolbar color="transparent" flat class="mt-2 ml-0">
            Hello, {{playerName}}! Your current score is {{currentScore}}.
        </v-toolbar>

        <div class="text-center">

            <!-- Quizz Starting - Temporal modal to enter your name
            Once name is entered, the game starts -->
            <v-btn rounded dark v-if="!launched" @click="dialog = true">
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
                        <v-btn color="primary" text @click="loopGame(true)">
                            O.K.
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!-- Game itself
            Currently only "WHO WON THE TOURNAMENT X" -->
            <div v-if="launched">
                <div>
                    {{currentQuestion}}
                </div>

                <v-col 
                    v-for="n in MAX_ANSWERS"
                    :key="n"
                >
                    <div class="pa-2">
                        <v-btn @click="checkAnswer(answersToDisplay[n-1])">
                            {{answersToDisplay[n-1]}}
                        </v-btn>
                    </div>
                </v-col>

                <div>
                    {{TIMER}}
                </div>
            </div>

            <!-- Won or Lost -->
            <v-dialog v-model="dialogResult" persistent width="500">
                <v-card>
                    <v-card-title class="headline" primary-title>
                        Result
                    </v-card-title>

                    <v-spacer></v-spacer>

                    <v-card-text>
                        {{result}}
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="loopGame(false)">
                            O.K.
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-model="dialogFinalResult" persistent width="500">
                <v-card>
                    <v-card-title class="headline" primary-title>
                        Final Results
                    </v-card-title>

                    <v-spacer></v-spacer>

                    <v-card-text>
                        You ended the quizz with {{currentScore}} points!
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="dialogFinalResult = false">
                            O.K.
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

    </v-container>
</template>

<script>
import gql from "graphql-tag";

export default {
    data: () => ({
        currentQuestion: "",
        currentScore: 0,
        currentTournament: {},
        currentTournamentIndex: "",
        tournaments: [],
        results: [],
        dialog: false,
        dialogResult: false,
        dialogFinalResult: false,
        loading: true,
        launched: false,
        playerName: "Anonymous666",
        answersToDisplay: [],
        answers: new Map(),
        result: "",
        MAX_ANSWERS: 4,
        TIMER: '',
        interval: '',
        ids: [
            "eba12023-9bde-47a0-9056-d7e159dc636d",
            "83cb8ca0-3f30-4c9c-905f-72722e26b6f7",
            "ed4e95be-7faf-4e0f-bfd4-27c4127dc569",
            "a5fccccc-7e5c-4c5b-940f-a30932053686",
            "7f7ba47b-f85d-4a5e-81c2-7b2aafd94ecd",
        ],
    }),
    mounted() {
        this.generateTournaments();
    },
    methods: {
        // Query to look for tournaments data
        // Currently only one tournament because idk how IDs work in SmashGG
        generateTournaments() {
            this.ids.forEach((id) => {
                var idTmp = id;
                this.$apollo
                    .query({
                        query: gql`
                            query FetchTournament($id: String!){
                            tournament (id: $id) {
                                name
                                results { rank player { id name score profile_picture_url }}
                            }
                        }`,
                        variables: {
                            id: idTmp
                        }
                    })
                    .then(data => {
                        this.tournaments.push(data.data.tournament);
                        this.loading = false
                    });
            })
        },
        // Launching the game (currently )
        // "answers" is a map containing 1 correct answer & 3 wrong answers
        // (player, true) means player won the tournament, correct answer
        // (player, false) means player didn't win the tournament, wrong answer
        // note: (player, false) is currently taken from 2nd trough 4th place
        quizz() {
            this.launched = true;
            this.dialog = false;
            this.generateQuestion(this.currentTournament);
            for (var i = 0 ; i < 4 ; i++) {
                this.answersToDisplay[i] = this.currentTournament.results[i].player.name;
                this.answers.set(this.currentTournament.results[i].player.name, i === 0 ? true : false);
            }
            this.TIMER = 10

            this.interval = setInterval(this.countdown, 1000)
        },
        generateQuestion(tournament) {
            this.currentQuestion = "Who won " + tournament.name + "?";
        },
        checkAnswer(answer){
            clearTimeout(this.interval)
            // this.launched = false;
            if (this.answers.get(answer) == true) {
                this.result = "Correct answer! You earned 1 point."
                this.currentScore++
            } else if (answer == 2) {
                this.result = "Timer ran out! You earned no points."
            } else {
                this.result = "Wrong answer... You earned no point."
            }
            this.dialogResult = true;
        },
        countdown() {
            // timer runs out, answer is false = lost
            if (this.TIMER == 0) {
                clearTimeout(this.interval)
                this.checkAnswer(2)
            } else {
                this.TIMER--
            }
        },
        loopGame(first) {
            this.dialogResult = false;
            if (first) {
                this.currentScore = 0
                this.currentTournamentIndex = 0
            } else {
                this.currentTournamentIndex++
                if (this.currentTournamentIndex == this.tournaments.length) {
                    this.endGame(true)
                    return;
                }
            }
            this.currentTournament = this.tournaments[this.currentTournamentIndex]
            this.quizz()
        },
        endGame(end) {
            if (end) {
                this.launched = false;
                this.dialogFinalResult = true;
            } else {
                quizz()
            }
        },
    }
}
</script>