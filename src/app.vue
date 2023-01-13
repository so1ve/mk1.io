<script>
import "./main.css";
</script>

<template>
  <main>
    <h1 class="leading-[1.1] mb-8 md:text-3.5em mt-0 text-2.5em">
      <span class="hand inline-block">👋</span> Hi! I'm Ray (<a href="https://github.com/so1ve" target="_blank">@so1ve</a>)
    </h1>
    <section class="gap-3 grid grid-cols-[1fr_1fr] justify-center md:flex mx-auto w-50%">
      <Button href="https://blog.mk1.io">
        <span class="i-ri:draft-line" />
        Blog
      </Button>
      <Button href="https://github.com/so1ve">
        <span class="i-ri:github-line" />
        GitHub
      </Button>
      <Button href="https://blog.mk1.io/pages/projects">
        <span class="i-ri:flask-line" />
        Projects
      </Button>
      <Button href="https://blog.mk1.io/pages/donate">
        <span class="i-ri:money-cny-circle-line" />
        Donate
      </Button>
      <Button href="https://blog.mk1.io/pages/friends">
        <span class="i-ri:link" />
        Friends
      </Button>
    </section>
  </main>
  <footer class="mt-8 opacity-80">
    <p class="gap-1 inline-flex items-center justify-center">
      2020-PRESENT <span class="i-ri:copyright-line" /> Ray
    </p>
    <br>
    <p class="gap-1 inline-flex items-center justify-center">
      Author: <a href="https://github.com/akarachen" target="_blank">@AkaraChen</a>
    </p>
  </footer>
</template>

<style scoped>
@keyframes shake-hand {
  10% {
    transform: rotate(20deg);
  }
  20% {
    transform: rotate(-10deg);
  }
  30% {
    transform: rotate(20deg);
  }
  40% {
    transform: rotate(-10deg);
  }
  50%, 100% {
    transform: rotate(0deg);
  }
}
.hand {
  animation: shake-hand 2.5s .15s linear infinite;
}
</style>
