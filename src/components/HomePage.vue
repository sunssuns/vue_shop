<template>
  <div>
    <el-button type="info" @click="signOut('token')">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    signOut (key) {
      window.sessionStorage.removeItem(key)
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped></style>
