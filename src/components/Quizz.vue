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
                                        @click="setChosenAnswer(answersToDisplay[n-1])">
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
                                </v-row>
                            <div v-if="TIMER_QUESTION != 0">
                                {{TIMER_QUESTION}} <span v-if="TIMER_QUESTION <= 1">second</span><span v-if="TIMER_QUESTION > 1">seconds</span> left...
                            </div>
                            <div v-if="TIMER_QUESTION == 0">
                                {{TIMER_NEXT}} <span v-if="TIMER_NEXT <= 1">second</span><span v-if="TIMER_NEXT > 1">seconds</span> before the next question...
                            </div>
                        </v-card-text>
                        <v-list-item-title v-if="chosenAnswer">You answered "{{chosenAnswer}}".</v-list-item-title>
                        <v-list-item-title v-if="result">{{result}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-card>
        </div>

            <!-- DIALOGS -->

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
        quizz: {},
        results: [],
        dialogResult: false,
        dialogFinalResult: false,
        quizzDate: '',
        loading: true,
        launched: false,
        playerName: "",
        answersToDisplay: [],
        chosenAnswer: '',
        goodAndwer: '',
        result: "",
        MAX_ANSWERS: 4,
        MAX_QUESTIONS: 10,
        TIMER_QUESTION: 10,
        TIMER_NEXT: 5,
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
        next_quizz: {
            query: gql`{
                next_quizz {
                    starts_at
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
                this.quizzDate = new Date(data.data.next_quizz.starts_at)
                this.quizz = data.data.next_quizz
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
            this.$apollo.queries.next_quizz.refetch()
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
            this.TIMER_QUESTION = 10

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
        setChosenAnswer(answer){
            this.chosenAnswer = answer
        },
        checkAnswer(time_out){
            this.generateQuestion();
            clearTimeout(this.interval)
            if (this.chosenAnswer == this.goodAnswer) {
                this.result = "Correct answer! You earned 1 point."
                this.currentScore++
            } else if (time_out) {
                this.result = "Timer ran out! You earned no points."
            } else {
                this.result = "Wrong answer... You earned no point."
            }
            this.TIMER_NEXT = 5
            this.interval = setInterval(this.countdownNextQuestion, 1000)
        },
        countdown() {
            // timer runs out, answer is false = lost
            this.TIMER_QUESTION--
            if (this.TIMER_QUESTION == 0 && this.chosenAnswer == '') {
                clearTimeout(this.interval)
                this.checkAnswer(true)
            }
            if (this.TIMER_QUESTION == 0) {
                clearTimeout(this.interval)
                this.checkAnswer()
            }
        },
        countdownNextQuestion(){
            this.TIMER_NEXT--
            if (this.TIMER_NEXT == 0) {
                clearTimeout(this.interval)
                this.chosenAnswer = ''
                this.result = ''
                this.loopGame(false)
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