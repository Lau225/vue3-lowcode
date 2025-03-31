<template>
  <div>
    <Editor v-model="state" />
  </div>
</template>

<script setup>
import data from "./data.json";
import { provide, ref } from "vue";
// import Editor from "../packages/editor";
import Editor from "../packages/editor.vue";
import { registerConfig as config } from "../utils/editor-config";
const state = ref(data);
provide("config", config);
</script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
}
</style>
