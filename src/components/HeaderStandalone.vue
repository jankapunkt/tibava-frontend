<template>
<div>
  <link rel="stylesheet" type="text/css" :href="createFullLink('static/css/main.min.css')">
  <link rel="stylesheet" type="text/css" :href="createFullLink('wicket/resource/de.agilecoders.wicket.webjars.request.resource.WebjarsCssResourceReference/webjars/font-awesome/5.8.2/css/all.min.css')">

  <div class="d-flex p-2 border-bottom">
    <div class="mr-auto">
      <router-link to="/">Home</router-link> |
      <router-link to="/publishers">Publishers</router-link> |
      <router-link to="/mymedia">My Media</router-link>
    </div>
    <label class="mr-3">
      <input type="checkbox" v-model="darkMode">
      Darkmode
    </label>
    <select v-model="$i18n.locale" id="vueLocaleSwitcher">
      <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>
    </select>
  </div>
</div>
</template>

<style lang="scss" scoped>
  a.router-link-exact-active {
    font-weight: bold;
  }
</style>

<script>
import { createFullLink } from '@/global'

const setDarkMode = (bool) => document.body.classList.toggle('dark-mode', bool)

export default {
  name: 'HeaderStandalone',
  data () {
    return {
      darkMode: true
    }
  },
  created () {
    const jqueryScript = document.createElement('script')
    jqueryScript.src = createFullLink('wicket/resource/org.apache.wicket.resource.JQueryResourceReference/jquery/jquery-1.10.1.min.js')
    jqueryScript.async = false
    document.head.appendChild(jqueryScript)

    const bootstrapScript = document.createElement('script')
    bootstrapScript.src = createFullLink('static/js/bootstrap.bundle.min.js')
    bootstrapScript.async = false
    document.head.appendChild(bootstrapScript)

    setDarkMode(this.darkMode)
  },
  watch: {
    darkMode () {
      setDarkMode(this.darkMode)
    }
  },
  methods: {
    createFullLink
  }
}
</script>
