<script setup lang="js">
    const route = useRoute();
</script>

<script lang="js">
import { content } from "../../data/content";
export default {
    data() {
        return {
            content,
            showPortal: false,
        }
    },
    mounted() {
        this.showPortal = content[this.$route.name].notification;      
    },
    methods: {
        openPortal() {
            this.showPortal = true;
        },
        closePortal() {
            this.showPortal = false;
        }
    }
}
</script>

<template>
    <Section v-for="section in content[route.name].sections" :section="section" />
    <Teleport to="body">
        <Toast
            v-if="content[route.name].notification"
            v-show="showPortal"
            :onClose="closePortal"
            :onAccept="closePortal"
            :onReject="closePortal"
            :notification="content[route.name].notification" />
    </Teleport>
</template>
