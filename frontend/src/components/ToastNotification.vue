<script setup>
import { useNotificationStore } from '@/stores/notification'
import { computed } from 'vue'

const store = useNotificationStore()
const notifications = computed(() => store.activeNotifications)

const dismiss = (id) => store.remove(id)

const icons = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  loading: `<svg class="h-5 w-5 flex-shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>`,
}

const colours = {
  success: 'bg-emerald-500 text-white',
  error:   'bg-red-500 text-white',
  warning: 'bg-amber-400 text-gray-900',
  info:    'bg-blue-500 text-white',
  loading: 'bg-gray-700 text-white',
}
</script>

<template>
  <!-- Fixed container — top-right on desktop, top-center on mobile -->
  <div
    aria-live="polite"
    class="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-[9999] flex flex-col gap-2 pointer-events-none"
  >
    <TransitionGroup name="toast">
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="[
          'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl',
          colours[n.type] || colours.info
        ]"
        role="alert"
      >
        <!-- Icon -->
        <span class="mt-0.5" v-html="icons[n.type] || icons.info"></span>

        <!-- Message -->
        <div class="flex-1 min-w-0">
          <p v-if="n.title" class="font-bold text-sm leading-tight">{{ n.title }}</p>
          <p class="text-sm leading-snug" :class="n.title ? 'opacity-90' : 'font-medium'">{{ n.message }}</p>
        </div>

        <!-- Close button -->
        <button
          v-if="n.closable !== false"
          @click="dismiss(n.id)"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1 -mr-1 -mt-0.5 p-1 rounded"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Slide in from the RIGHT edge */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(110%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(110%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
