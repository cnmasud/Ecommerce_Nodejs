<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router  = useRouter()
const query   = ref('')
const results = ref([])
const loading = ref(false)
const showDrop= ref(false)
const base    = import.meta.env.VITE_BACKENDURL

let debounceTimer = null

const fetchSuggestions = async (q) => {
  if (!q?.trim() || q.length < 2) { results.value = []; return }
  loading.value = true
  try {
    const res = await axios.get(`${base}/main/product/search`, { params: { q, limit: 8 } })
    results.value = Array.isArray(res.data) ? res.data : (res.data.products || Object.values(res.data))
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}

watch(query, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchSuggestions(val), 300)
})

const goToProduct = (id) => {
  router.push(`/product/${id}`)
  query.value = ''
  results.value = []
  showDrop.value = false
}

const submitSearch = () => {
  const q = query.value.trim()
  if (!q) return
  router.push({ path: '/search', query: { q } })
  results.value = []
  showDrop.value = false
}

const onFocus  = () => { showDrop.value = true }
const onBlur   = () => { setTimeout(() => { showDrop.value = false }, 180) }
</script>

<template>
  <div class="relative w-full">
    <form @submit.prevent="submitSearch" class="flex w-full">
      <div class="relative flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="query"
          type="text"
          placeholder="Search products…"
          class="input input-bordered w-full pl-9 pr-3 h-10 text-sm rounded-r-none"
          @focus="onFocus"
          @blur="onBlur"
        />
        <!-- Live spinner -->
        <span v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2 loading loading-spinner loading-xs text-primary"></span>
      </div>
      <button type="submit" class="btn btn-primary h-10 min-h-0 px-4 rounded-l-none">
        Search
      </button>
    </form>

    <!-- Dropdown suggestions -->
    <div
      v-if="showDrop && (results.length || (query.length >= 2 && !loading))"
      class="absolute top-full mt-1 left-0 right-0 bg-base-100 border border-base-300 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      <!-- No results -->
      <div v-if="!results.length && !loading" class="px-4 py-3 text-sm text-base-content/60">
        No results for "<strong>{{ query }}</strong>"
        <router-link :to="{ path: '/search', query: { q: query } }" class="ml-2 link link-primary text-xs">See all</router-link>
      </div>

      <!-- Result items -->
      <ul v-else>
        <li
          v-for="item in results"
          :key="item._id"
          @mousedown.prevent="goToProduct(item._id)"
          class="flex items-center gap-3 px-3 py-2 hover:bg-base-200 cursor-pointer transition-colors"
        >
          <img
            :src="item.images?.[0] || 'https://placehold.co/40x40?text=📦'"
            :alt="item.name"
            class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ item.name }}</p>
            <p class="text-xs text-base-content/50 truncate">{{ item.description?.slice(0, 60) }}…</p>
          </div>
          <span class="text-primary font-bold text-sm flex-shrink-0">${{ Number(item.price).toFixed(2) }}</span>
        </li>

        <!-- "View all" footer -->
        <li class="border-t border-base-300">
          <router-link
            :to="{ path: '/search', query: { q: query } }"
            @mousedown.prevent
            class="flex items-center justify-center gap-1 px-4 py-2 text-sm text-primary hover:bg-base-200 transition-colors"
          >
            View all results for "{{ query }}"
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
