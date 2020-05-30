<template>
    <v-container style="max-width:1024px; padding:24px;">   

        <div class="text-center">

            <!-- Quizz Starting - Temporal modal to enter your name
            Once name is entered, the game starts -->
            <v-btn rounded dark v-if="!launched && !loading" @click="loopGame(true)">
                Start a quizz
            </v-btn>

            <!-- CORE GAME  -->
            <v-card
                v-if="launched"
                class="mx-auto"
                outlined
            >
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="headline mb-1">{{playerName}}: {{currentScore}} points</v-list-item-title>
                        <v-list-item-subtitle>N°{{currentQuestionIndex + 1}}/{{MAX_QUESTIONS}} - {{currentQuestion}}</v-list-item-subtitle>
                        <v-card-text>
                            <v-row>
                                    <v-col 
                                        v-for="n in MAX_ANSWERS" 
                                        outlined
                                        :key="n"
                                        cols="6"
                                        @click="checkAnswer(answersToDisplay[n-1])">
                                        <v-hover
                                            v-slot:default="{ hover }"
                                        >
                                            <v-card 
                                                :elevation="hover ? 12 : 2"
                                                class="pa-2"
                                                v-ripple="{ center: true }"
                                                outlined
                                                tile
                                            >
                                                {{answersToDisplay[n-1]}}
                                            </v-card>
                                        </v-hover>
                                    </v-col>
                                    <!--
                                    <v-responsive
                                    v-if="n === 2"
                                    :key="`width-${n}`"
                                    width="100%"
                                    ></v-responsive> -->
                                </v-row>
                            {{TIMER}} <span v-if="TIMER <= 1">second</span><span v-if="TIMER > 1">seconds</span> left...
                        </v-card-text>
                    </v-list-item-content>
                </v-list-item>
            </v-card>
        </div>

            <!-- DIALOGS -->

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

    </v-container>
</template>

<script>
import gql from "graphql-tag";
import VueRouter from 'vue-router'

export default {
    data: () => ({
        currentQuestion: "",
        currentScore: 0,
        currentTournament: {},
        random_tournament: {},
        quizz: {},
        results: [],
        dialogResult: false,
        dialogFinalResult: false,
        loading: true,
        launched: false,
        playerName: "",
        answersToDisplay: [],
        goodAndwer: '',
        result: "",
        MAX_ANSWERS: 4,
        MAX_QUESTIONS: 10,
        TIMER: '',
        interval: '',
    }),
    mounted() {
        if (!localStorage.getItem('MELEERANKING-SESSION-TOKEN')){
            this.$router.push('/login')
            return
        }
        this.generateQuizz();
    },
    apollo: {
        random_quizz: {
            query: gql`{
                random_quizz {
                    quizz_questions { 
                        question { 
                            name 
                            answers { 
                                name 
                            } 
                            answer {
                                name
                            }
                        } 
                    } 
                } 
            }`,
            result (data) {
                this.quizz = data.data.random_quizz 
                console.log(this.quizz)
                this.loading = false
            }
        },
        me: {
            query: gql`{
                me {
                    email
                }
            }`,
            context: {
                headers: {
                    SESSIONID: localStorage.getItem('MELEERANKING-SESSION-TOKEN')
                }
            }
    }
    },
    methods: {
        // Query to get a quizz with 10 questions
        generateQuizz() {
            this.loading = true
            this.$apollo.queries.random_quizz.refetch()
        },
        // Launching the game (currently )
        // "answers" is a map containing 1 correct answer & 3 wrong answers
        // (player, true) means player won the tournament, correct answer
        // (player, false) means player didn't win the tournament, wrong answer
        // note: (player, false) is currently taken from 2nd trough 4th place
        quizzGame() {
            this.launched = true;
            this.dialog = false;
            this.generateQuestion();
            for (var i = 0 ; i < 4 ; i++) {
                this.answersToDisplay[i] = this.quizz.quizz_questions[this.currentQuestionIndex].question.answers[i].name;
                this.goodAnswer = this.quizz.quizz_questions[this.currentQuestionIndex].question.answer.name;
            }
            this.shuffleAnswers()
            this.TIMER = 10

            this.interval = setInterval(this.countdown, 1000)
        },
        generateQuestion() {
            this.currentQuestion = this.quizz.quizz_questions[this.currentQuestionIndex].question.name
        },
        shuffleAnswers() {
            for (var l = this.answersToDisplay.length - 1 ; l >= 0 ; l--) {
                var index = Math.floor(Math.random() * l)
                var tmp = this.answersToDisplay[l]
                this.answersToDisplay[l] = this.answersToDisplay[index]
                this.answersToDisplay[index] = tmp
            }
        },
        checkAnswer(answer){
            this.generateQuestion();
            clearTimeout(this.interval)
            // this.launched = false;
            if (answer == this.goodAnswer) {
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
                this.currentQuestionIndex = 0
                this.playerName = this.me.email
                this.playerName = this.playerName.substring(0, this.playerName.indexOf('@'))
            } else {
                this.currentQuestionIndex++
                if (this.currentQuestionIndex == this.MAX_QUESTIONS) {
                    this.endGame(true)
                    return;
                }
            }
            this.quizzGame()
        },
        endGame(end) {
            if (end) {
                this.launched = false;
                this.dialogFinalResult = true;
            } else {
                this.quizzGame()
            }
        }
    },
}
</script>