<template>
  <v-container style="max-width:1024px; padding:24px;">
    <div class="text-center">
      <!--<v-btn rounded dark v-if="!launched && !loading" @click="loopGame(true)">
                Start a quizz
      </v-btn>-->

      <v-card v-if="!launched && !loading" class="mx-auto" max-width="344" loading>
        <v-card-text>
          <div>Loading...</div>
          <p class="display-1 text--primary">Next quizz in {{timeLeft}}</p>
          <div
            class="text--primary"
          >Next quizz at {{quizzDate.getHours()}}:{{quizzDate.getMinutes()}}</div>
        </v-card-text>
      </v-card>

      <!-- CORE GAME  -->
      <v-card v-if="launched" class="mx-auto" outlined>
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
                  @click="setChosenAnswer(answersToDisplay[n-1])"
                >
                  <v-hover v-slot:default="{ hover }">
                    <v-card
                      :elevation="hover ? 12 : 2"
                      class="pa-2"
                      v-ripple="{ center: true }"
                      outlined
                      title
                    >{{answersToDisplay[n-1]}}</v-card>
                  </v-hover>
                </v-col>
              </v-row>
              <div
                v-if="TIMER_QUESTION != 0"
                class="overline mb-4"
              >Points given : {{scoreMultiplier}}</div>
              <div v-if="TIMER_QUESTION != 0">
                {{TIMER_QUESTION}}
                <span v-if="TIMER_QUESTION <= 1">second</span>
                <span v-if="TIMER_QUESTION > 1">seconds</span> left...
              </div>
              <div v-if="TIMER_QUESTION == 0 && currentQuestionIndex +1 != 10">
                {{TIMER_NEXT}}
                <span v-if="TIMER_NEXT <= 1">second</span>
                <span v-if="TIMER_NEXT > 1">seconds</span> before the next question...
              </div>
              <div v-if="TIMER_QUESTION == 0 && currentQuestionIndex +1 == 10">
                {{TIMER_NEXT}}
                <span v-if="TIMER_NEXT <= 1">second</span>
                <span v-if="TIMER_NEXT > 1">seconds</span> before the results...
              </div>
            </v-card-text>
            <v-list-item-title
              v-if="chosenAnswer"
            >You answered "{{chosenAnswer}}" for {{scoreMultiplierChosen}} points.</v-list-item-title>
            <v-list-item-title v-if="result">{{result}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </div>

    <v-container style="max-width:512px; padding:24px;">
      <template>
        <v-card>
          <v-card-title class="justify-center">Leaderboard</v-card-title>
          <v-data-table
            :headers="headers"
            :items="users"
            :loading="loadingLeaderboard"
            :items-per-page="20"
            class="elevation-1"
          >
          </v-data-table>
        </v-card>
      </template>
    </v-container>

    <!-- DIALOGS -->

    <v-dialog v-model="dialogFinalResult" persistent width="500">
      <v-card>
        <v-card-title class="headline" primary-title>Final Results</v-card-title>

        <v-spacer></v-spacer>

        <v-card-text>You ended the quizz with {{currentScore}} points!</v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogFinalResult = false">O.K.</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import gql from "graphql-tag";
import VueRouter from "vue-router";

export default {
  data: () => ({
    currentQuestion: "",
    currentScore: 0,
    currentTournament: {},
    quizz: {},
    results: [],
    dialogResult: false,
    dialogFinalResult: false,
    quizzDate: "",
    loading: true,
    loadingLeaderboard: true,
    launched: false,
    playerName: "",
    answersToDisplay: [],
    chosenAnswer: "",
    goodAndwer: "",
    result: "",
    MAX_ANSWERS: 4,
    MAX_QUESTIONS: 10,
    TIMER_QUESTION: 10,
    TIMER_NEXT: 5,
    interval: "",
    timeLeft: "",
    timer: {},
    // next is to test timer of quizz
    // nowButLater: "",
    scoreMultiplier: 100,
    scoreMultiplierChosen: "",
    users: [],
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Score', value: 'global_quizz_score' },
    ],
  }),
  mounted() {
    if (!localStorage.getItem("MELEERANKING-SESSION-TOKEN")) {
      this.$router.push("/login");
      return;
    }
    this.$apollo.queries.leaderboard.refetch().then(data => { this.loadingLeaderboard = false});
    this.generateQuizz();
    // next is to test timer of quizz
    // this.nowButLater = new Date();
    // this.nowButLater.setSeconds(this.nowButLater.getSeconds() + 5);
    this.timer = setInterval(this.nextQuizzCountdown, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  apollo: {
    next_quizz: {
      query: gql`
        {
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
        }
      `,
      result(data) {
        this.quizzDate = new Date(data.data.next_quizz[0].starts_at * 1000);
        this.quizz = data.data.next_quizz[0];
        /*
        for (var l = 0; l >= this.quizz.quizz_questions.length; l++) {
          var index = Math.floor(Math.random() * l);
          var tmp = this.quizz.quizz_questions[l];
          this.quizz.quizz_questions[l] = this.quizz.quizz_questions[index];
          this.quizz.quizz_questions[index] = tmp;
        }*/
        this.loading = false;
      }
    },
    me: {
      query: gql`
        {
          me {
            id
            name
            email
          }
        }
      `,
      context: {
        headers: {
          SESSIONID: localStorage.getItem("MELEERANKING-SESSION-TOKEN")
        }
      }
    },
    leaderboard: {
      query: gql`
        {
          leaderboard {
            name
            global_quizz_score
          }
        }
      `,
      result(data) {
        this.users = data.data.leaderboard;
      }
    }
  },
  methods: {
    // Query to get a quizz with 10 questions
    generateQuizz() {
      this.loading = true;
      this.$apollo.queries.next_quizz.refetch();
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
      for (var i = 0; i < 4; i++) {
        this.answersToDisplay[i] = this.quizz.quizz_questions[
          this.currentQuestionIndex
        ].question.answers[i].name;
      }
      this.goodAnswer = this.quizz.quizz_questions[
        this.currentQuestionIndex
      ].question.answer.name;
      this.shuffleAnswers();
      this.TIMER_QUESTION = 10;

      this.interval = setInterval(this.countdown, 1000);
    },
    generateQuestion() {
      this.currentQuestion = this.quizz.quizz_questions[
        this.currentQuestionIndex
      ].question.name;
    },
    shuffleAnswers() {
      for (var l = this.answersToDisplay.length - 1; l >= 0; l--) {
        var index = Math.floor(Math.random() * l);
        var tmp = this.answersToDisplay[l];
        this.answersToDisplay[l] = this.answersToDisplay[index];
        this.answersToDisplay[index] = tmp;
      }
    },
    setChosenAnswer(answer) {
      if (this.TIMER_QUESTION != 0) {
        this.chosenAnswer = answer;
        this.scoreMultiplierChosen = this.TIMER_QUESTION * 10;
      }
    },
    checkAnswer(time_out) {
      this.generateQuestion();
      clearTimeout(this.interval);
      if (this.chosenAnswer == this.goodAnswer) {
        this.currentScore += this.scoreMultiplierChosen;
        this.result =
          "Correct answer! You earned " +
          this.scoreMultiplierChosen +
          " points.";
      } else if (time_out == 2) {
        this.result =
          "Timer ran out! You earned no points. (Correct answer: " +
          this.goodAnswer +
          ")";
      } else {
        this.result =
          "Wrong answer... You earned no point. (Correct answer: " +
          this.goodAnswer +
          ")";
      }
      this.TIMER_NEXT = 5;
      this.interval = setInterval(this.countdownNextQuestion, 1000);
    },
    countdown() {
      // timer runs out, answer is false = lost
      this.TIMER_QUESTION--;
      this.scoreMultiplier = this.TIMER_QUESTION * 10;
      if (this.TIMER_QUESTION == 0 && this.chosenAnswer == "") {
        clearTimeout(this.interval);
        this.checkAnswer(2);
      }
      if (this.TIMER_QUESTION == 0) {
        clearTimeout(this.interval);
        this.checkAnswer();
      }
    },
    countdownNextQuestion() {
      this.TIMER_NEXT--;
      if (this.TIMER_NEXT == 0) {
        clearTimeout(this.interval);
        this.chosenAnswer = "";
        this.result = "";
        this.scoreMultiplier = 100;
        this.loopGame(false);
      }
    },
    loopGame(first) {
      clearInterval(this.timer);
      this.dialogResult = false;
      if (first) {
        this.currentScore = 0;
        this.currentQuestionIndex = 0;
        this.playerName = this.me.name;
      } else {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex == this.MAX_QUESTIONS) {
          this.endGame(true);
          return;
        }
      }
      this.quizzGame();
    },
    endGame(end) {
      if (end) {
        this.sendUserScore();
        this.$apollo.queries.leaderboard.refetch();
        this.launched = false;
        this.dialogFinalResult = true;
        this.generateQuizz();
        // next is to test timer of quizz
        // this.nowButLater = new Date();
        //this.nowButLater.setSeconds(this.nowButLater.getSeconds() + 5);
        this.timer = setInterval(this.nextQuizzCountdown, 1000);
      } else {
        this.quizzGame();
      }
    },
    nextQuizzCountdown() {
      let now = new Date().getTime();
      let t = this.quizz.starts_at * 1000 - now;
      // next is to test timer of quizz
      // let t = this.nowButLater.getTime() - now;

      if (t >= 0) {
        let days = Math.floor(t / (1000 * 60 * 60 * 24));
        let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        let secs = Math.floor((t % (1000 * 60)) / 1000);

        this.timeLeft = ("0" + mins).slice(-2) + ":" + ("0" + secs).slice(-2);
      } else {
        this.loopGame(true);
      }
    },
    sendUserScore() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($player_id: String!, $score: Int!) {
              add_score(id: $player_id, score: $score) {
                id
                global_quizz_score
              }
            }
          `,
          variables: {
            player_id: this.me.id,
            score: this.currentScore
          }
        })
        .then(data => {
        })
        .catch(err => {});
    },
    updateLeaderboard() {}
  }
};
</script>