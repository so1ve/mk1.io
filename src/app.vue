<script setup lang="ts">
import "./main.css";
</script>

<template>
  <main>
    <h1 class="mb-8 mt-0 text-2.5em leading-[1.1] md:text-3.5em">
      <span class="hand inline-block">👋</span>
      Hi! I'm Ray (
      <a
        href="https://github.com/so1ve"
        rel="noopener noreferrer"
        target="_blank"
      >
        @so1ve
      </a>
      )
    </h1>
    <section
      class="grid grid-cols-[1fr_1fr] mx-auto w-50% justify-center gap-3 md:flex"
    >
      <Item icon="i-ri:draft-line" link="https://blog.mk1.io">Blog</Item>
      <Item icon="i-ri:github-line" link="https://github.com/so1ve">
        GitHub
      </Item>
      <Item icon="i-ri:flask-line" link="https://blog.mk1.io/pages/projects">
        Projects
      </Item>
      <Item
        icon="i-ri:money-cny-circle-line"
        link="https://blog.mk1.io/pages/donate"
      >
        Donate
      </Item>
      <Item icon="i-ri:link" link="https://blog.mk1.io/pages/friends">
        Friends
      </Item>
      <Item
        icon="i-ri:message-2-line"
        link="https://qm.qq.com/cgi-bin/qm/qr?k=-j0kEWcr-yAFpcg79wS-SrtW50XdAoaQ&jump_from=webapi&authKey=h0W2EehoQRQ4+MPNkcu7S5gMxulHb4Fzd0KflY4aOFMyFUvF3kI8Bltz8sKqU1ik"
      >
        QQ
      </Item>
      <Item
        icon="i-ri:account-circle-fill"
        link="https://blog.mk1.io/pages/about"
      >
        About
      </Item>
    </section>
  </main>
  <footer class="mt-8 opacity-80">
    <p class="inline-flex items-center justify-center gap-1">
      2020-PRESENT
      <span class="i-ri:copyright-line" />
      Ray
    </p>
    <br />
    <p class="inline-flex items-center justify-center gap-1">
      Author:
      <a
        href="https://github.com/akarachen"
        rel="noopener noreferrer"
        target="_blank"
      >
        @AkaraChen
      </a>
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
  50%,
  100% {
    transform: rotate(0deg);
  }
}
.hand {
  animation: shake-hand 2.5s 0.15s linear infinite;
}
</style>
