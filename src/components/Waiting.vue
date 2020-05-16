<template>
    <v-container style="max-width:1024px; padding:24px;">   

        <div class="text-center">
            <v-card>
                    <v-card-title class="headline" primary-title>
                        Currently online
                    </v-card-title>

                    <v-spacer></v-spacer>

                    <v-card-text>
                        <!-- List of currently online players -->
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="#141414" @click="startQuizz"><span style="color: white">Start a quizz</span></v-btn>
                    </v-card-actions>
                </v-card>
        </div>
    </v-container>
</template>

<script>
export default {
    data: () => ({
            
        }),
    mounted() {
            
    },
    apollo: {
            
    },
    methods: {
        startQuizz() {
            
        },
    },
}
</script>