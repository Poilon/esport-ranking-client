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
          >Next quizz at <span v-if="quizzDate.getHours().length < 10">0</span> {{quizzDate.getHours()}}:<span v-if="quizzDate.getMinutes() < 10">0</span>{{quizzDate.getMinutes()}}</div>
        </v-card-text>
      </v-card>

      <!-- CORE GAME  -->
      <v-card v-if="launched" class="mx-auto" outlined>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="headline mb-1">{{playerName}}: {{currentScore}} points</v-list-item-title>
            <v-list-item-subtitle>N°{{currentQuestionIndex + 1}}/{{MAX_QUESTIONS}} - {{currentQuestion}}</v-list-item-subtitle>
            <v-card-text>
              <v-row align="center" justify="center">
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
              
              <!-- TODO margin-left: temporary solution // need to find a way to center the image properly -->
              <div outlined style="margin-left: 20%" class="pa-4">
                <v-img
                  v-if="gifUrl"
                  width="75%"
                  :src="'https://thumbs.gfycat.com/' + gifUrl + '-size_restricted.gif'"
                ></v-img>
              </div>

              <div
                v-if="TIMER_QUESTION != 0"
                class="overline mb-4"
              >Points given : {{scoreMultiplier}}</div>

              <div v-if="TIMER_QUESTION != 0">
                {{TIMER_QUESTION/10}}
                <span v-if="TIMER_QUESTION <= 1.0">second</span>
                <span v-if="TIMER_QUESTION > 1.0">seconds</span> left...
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
    // this is a horrible mess please read the methods comments
    currentQuestion: "",
    currentQuestionIndex: 0,
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
    TIMER_QUESTION: 100,
    TIMER_NEXT: 5,
    interval: "",
    timeLeft: "",
    timer: {},
    gifUrl: "",
    scoreMultiplier: 100,
    scoreMultiplierChosen: 0,
    users: [],
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Score', value: 'global_quizz_score' },
    ],
  }),
  mounted() {
    // if not logged in, please log in
    if (!localStorage.getItem("MELEERANKING-SESSION-TOKEN")) {
      this.$router.push("/login");
      return;
    }
    // getting leaderboard, generating quizz
    this.$apollo.queries.leaderboard.refetch().then(data => { this.loadingLeaderboard = false});
    this.generateQuizz();
    // setting up timer of next quizz when loading the page
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
                gif_url
              }
            }
          }
        }
      `,
      result(data) {
        // getting the date, getting the quizz, shuffling questions, not loading anymore
        this.quizzDate = new Date(data.data.next_quizz[0].starts_at * 1000);
        this.quizz = data.data.next_quizz[0];
        this.shuffleQuestions();
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
    // Quizz game main method
    quizzGame() {
      // next line to specify the game is launched, making the game appear and disabling the counter
      this.launched = true;
      this.dialog = false; // disabling end game dialog that displays results
      this.generateQuestion(); 
      // filling answers to display array
      for (var i = 0; i < this.MAX_ANSWERS; i++) {
        this.answersToDisplay[i] = this.quizz.quizz_questions[
          this.currentQuestionIndex
        ].question.answers[i].name;
      }
      // getting the good answer
      this.goodAnswer = this.quizz.quizz_questions[
        this.currentQuestionIndex
      ].question.answer.name;
      this.shuffleAnswers();  
      // timer of question
      this.TIMER_QUESTION = 100;

      this.interval = setInterval(this.countdown, 100); // reality : 100, test : 10
    },
    // generating questions based on the request and getting the gif url if there's one
    generateQuestion() {
      this.currentQuestion = this.quizz.quizz_questions[
        this.currentQuestionIndex
      ].question.name;
      if (this.quizz.quizz_questions[this.currentQuestionIndex].question.gif_url) {
        this.gifUrl = this.quizz.quizz_questions[this.currentQuestionIndex].question.gif_url;
      }
    },
    shuffleQuestions() {
      this.quizz.quizz_questions.sort(() => Math.random() * 2 - 1);
      /*
      // TODO shuffle algorithm 
      // next is a variation of a shuffle algorithm that needs comparison with the line above
      // the line above is very simple but only shuffles an entry around its place
      // exemple: entry 6 of an array is most likely to end up between entry 4 and 8, and less likely in other entries
      for (var b = this.quizz.quizz_questions.length ; b >= 0 ; b--) {
        var index = Math.floor(Math.random() * b--);
        var tmp = this.quizz.quizz_questions[b];
        this.quizz.quizz_questions[b] = this.quizz.quizz_questions[index];
        this.quizz.quizz_questions[index] = tmp;
      } */
    },
    shuffleAnswers() {
      this.answersToDisplay.sort(() => Math.random() * 2 - 1);
    },
    // checking every 0.1 seconds what's happening
    countdown() {
      // timer is ticking down
      this.TIMER_QUESTION--;
      this.scoreMultiplier = this.TIMER_QUESTION; // score is going down
      // timer runs out, answer is empty
      if (this.TIMER_QUESTION == 0 && this.chosenAnswer == "") {
        clearTimeout(this.interval);
        this.checkAnswer(2);
      }
      // timer runs out
      if (this.TIMER_QUESTION == 0) {
        clearTimeout(this.interval);
        this.checkAnswer();
      }
    },
    checkAnswer(time_out) {
      clearTimeout(this.interval);
      // good answer, increasing current score
      if (this.chosenAnswer == this.goodAnswer) {
        this.currentScore += this.scoreMultiplierChosen;
        this.result = // result displayed after the timer runs out
          "Correct answer! You earned " +
          this.scoreMultiplierChosen +
          " points.";
      // time out
      } else if (time_out == 2) {
        this.result =
          "Timer ran out! You earned no points. (Correct answer: " +
          this.goodAnswer +
          ")";
      // wrong answer
      } else {
        this.result =
          "Wrong answer... You earned no point. (Correct answer: " +
          this.goodAnswer +
          ")";
      }
      // next question timer
      this.TIMER_NEXT = 5;
      this.interval = setInterval(this.countdownNextQuestion, 1000); //reality 1000, test 100
    },
    // next question timer
    countdownNextQuestion() {
      this.TIMER_NEXT--;
      if (this.TIMER_NEXT == 0) {
        clearTimeout(this.interval);
        this.chosenAnswer = ""; // resetting chosen answer
        this.result = ""; // resetting result
        this.gifUrl = ""; // resetting gif URL
        this.scoreMultiplier = 100; // resetting score
        this.loopGame(false);
      }
    },
    // handling one iteration of a question 
    // if it's the end, handles the end
    loopGame(first) {
      clearInterval(this.timer);
      this.dialogResult = false;
      // first question?
      if (first) {
        this.currentScore = 0; // resetting score
        this.currentQuestionIndex = 0; // resetting question index
        this.playerName = this.me.name; // getting the player name
      } else {
        this.currentQuestionIndex++; // next question, index increased
        // was it the last question ? ending the game if so and quitting this method
        if (this.currentQuestionIndex == this.MAX_QUESTIONS) {
          this.endGame(true);
          return;
        }
      }
      // let's play now
      this.quizzGame();
    },
    // end game
    endGame(end) {
      // is it the end?
      if (end) { // yes
        this.sendUserScore(); // sending the score to the back
        this.$apollo.queries.leaderboard.refetch(); // refreshing leaderboard
        this.launched = false; // game is finished
        this.dialogFinalResult = true; // dialog for the results is on
        this.generateQuizz(); // generating next quizz
        this.timer = setInterval(this.nextQuizzCountdown, 1000); // launching timer of the next quizz
      } else { // no
        this.quizzGame(); // let's play then
      }
    },
    // setting correct chosen answer and preventing user to select an answer while waiting for the next question
    setChosenAnswer(answer) {
      if (this.TIMER_QUESTION != 0) {
        this.chosenAnswer = answer;
        this.scoreMultiplierChosen = this.TIMER_QUESTION;
      }
    },
    nextQuizzCountdown() {
      let now = new Date().getTime();
      //let t = this.quizz.starts_at * 1000 - now; // t is the time left between the supposed starting time of the quizz and now
      let t = -1 // uncomment if you don't want to wait for quizz to start and comment the line above
      // if the time left is positive, we're putting the time left on the screen
      if (t >= 0) {
        let days = Math.floor(t / (1000 * 60 * 60 * 24));
        let hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        let secs = Math.floor((t % (1000 * 60)) / 1000);
  
        this.timeLeft = ("0" + mins).slice(-2) + ":" + ("0" + secs).slice(-2);
      } else {
        // no time left ? let's play now
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
        .then(data => {})
        .catch(err => {});
    },
    updateLeaderboard() {}
  }
};
</script>