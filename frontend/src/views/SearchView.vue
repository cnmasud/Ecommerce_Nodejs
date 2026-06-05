<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import ProductGrid from '@/components/ProductGrid.vue'

const route   = useRoute()
const router  = useRouter()
const results = ref([])
const loading = ref(false)
const query   = ref(route.query.q || '')
const base    = import.meta.env.VITE_BACKENDURL

const doSearch = async (q) => {
  if (!q?.trim()) { results.value = []; return }
  loading.value = true
  try {
    const res = await axios.get(`${base}/main/product/search`, { params: { q, limit: 50 } })
    results.value = Array.isArray(res.data) ? res.data : (res.data.products || Object.values(res.data))
  } catch (e) {
    console.error(e)
    results.value = []
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (q) => { query.value = q || ''; doSearch(q) })
onMounted(() => doSearch(query.value))

const submitSearch = () => {
  if (query.value.trim()) router.push({ path: '/search', query: { q: query.value } })
}
</script>

<template>
  <div class="max-w-screen-xl mx-auto px-3 md:px-6 py-6">
    <!-- Search box -->
    <form @submit.prevent="submitSearch" class="flex gap-2 mb-6 max-w-xl">
      <input
        v-model="query"
        type="text"
        placeholder="Search products…"
        class="input input-bordered flex-1"
        autofocus
      />
      <button type="submit" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        Search
      </button>
    </form>

    <!-- Header -->
    <div class="mb-4">
      <h1 class="text-xl font-bold">
        <template v-if="route.query.q">
          Results for "<span class="text-primary">{{ route.query.q }}</span>"
        </template>
        <template v-else>Search Products</template>
      </h1>
      <p v-if="!loading && route.query.q" class="text-sm text-base-content/60 mt-1">
        {{ results.length }} product{{ results.length !== 1 ? 's' : '' }} found
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-for="n in 8" :key="n" class="card bg-base-200 animate-pulse">
        <div class="h-40 bg-base-300 rounded-t-xl"></div>
        <div class="p-4 space-y-2">
          <div class="h-3 bg-base-300 rounded"></div>
          <div class="h-3 bg-base-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- No query -->
    <div v-else-if="!route.query.q" class="text-center py-20">
      <div class="text-6xl mb-4">🔍</div>
      <p class="text-base-content/60">Enter a search term above to find products</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!results.length" class="text-center py-16">
      <div class="text-5xl mb-3">😕</div>
      <h3 class="text-lg font-semibold">No results found</h3>
      <p class="text-base-content/60 text-sm mt-1">Try different keywords</p>
      <router-link to="/products" class="btn btn-primary btn-sm mt-4">Browse All Products</router-link>
    </div>

    <!-- Results -->
    <ProductGrid v-else :products="results" />
  </div>
</template>
