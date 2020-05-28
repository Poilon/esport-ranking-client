<template>
    <v-container style="max-width:1024px; padding:24px;">
        <div class="text-center">
            <!-- Login form -->
            <v-row
                v-if="!registering"
                align="center"
                justify="center"
            >
                <v-col
                    cols="12"
                    sm="8"
                >
                    <v-card class="elevation-12">
                        <v-toolbar
                            color="#141414"
                            dark
                            flat
                        >
                            <v-toolbar-title >Login</v-toolbar-title>
                            <v-spacer></v-spacer>
                        </v-toolbar>
                        <v-card-text>
                            <v-form>
                                <v-text-field
                                    v-model="email"
                                    label="Email"
                                    name="email"
                                    type="text"
                                ></v-text-field>

                                <v-text-field
                                    v-model="password"
                                    label="Password"
                                    name="password"
                                    type="password"
                                ></v-text-field>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="#141414" @click="registering = !registering"><span style="color: white">No account yet?</span></v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="#141414" @click="doLogin"><span style="color: white">Login</span></v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Register form -->
            <v-row
                v-if="registering"
                align="center"
                justify="center"
            >
                <v-col
                    cols="12"
                    sm="8"
                >
                    <v-card class="elevation-12">
                        <v-toolbar
                            color="#141414"
                            dark
                            flat
                        >
                            <v-toolbar-title >Register</v-toolbar-title>
                            <v-spacer></v-spacer>
                        </v-toolbar>
                        <v-card-text>
                            <v-form>
                                <v-text-field
                                    label="Email"
                                    name="email"
                                    v-model="email"
                                    :rules="[rules.required, rules.email]"
                                    type="text"
                                ></v-text-field>

                                <v-text-field
                                    label="Enter your password"
                                    name="password"
                                    v-model="password1"
                                    type="password"
                                    :rules="[rules.required]"
                                    hint="At least 6 characters"
                                ></v-text-field>

                                <v-text-field
                                    label="Confirm your password"
                                    name="password"
                                    v-model="password2"
                                    type="password"
                                    :rules="[rules.required]"
                                ></v-text-field>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="#141414" @click="registering = !registering"><span style="color: white">Already have an account?</span></v-btn>
                            <v-spacer></v-spacer>
                            <v-btn color="#141414" @click="register"><span style="color: white">Register</span></v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </v-container>
</template>

<script>
import VueRouter from 'vue-router'
import { onLogin, onLogout } from "../vue-apollo.js"
import gql from "graphql-tag";

export default {
    data: () => ({
            registering: false,
            login: '',
            email: '',
            password: '',
            password1: '',
            password2: '',
            rules: {
                required: value => !!value || 'Required.',
                email:  v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-Mail must be valid',
            }
        }),
        mounted() {

        },
        methods: {
            doLogin() {
                this.$apollo.mutate({
                    mutation: gql`
                      mutation($email: String!, $password: String!) {
                        login_user(email: $email, password: $password)
                      }
                    `,
                    variables: {
                      email: this.email,
                      password: this.password
                    }
                }).then(data => {
                    onLogin(this.$apollo.provider.defaultClient, data.data.login_user)
                    this.authToken = data.data.login_user
                    window.location.reload()
                })
                
                this.$router.push('Quizz')
            },
            register() {
                if (!this.matchPwd()) {
                    return
                }

                this.$apollo.mutate({
                    mutation: gql`
                      mutation($email: String!, $password: String!) {
                        create_user(user: { email: $email, password: $password }) {
                            id
                            email
                        }
                      }
                    `,
                    variables: {
                      email: this.email,
                      password: this.password1
                    }
                }).then(() => {
                    this.registering = false
                })
            },
            matchPwd(){
                return this.password2 == this.password1 ? true : false
            },
        },
}
</script>
