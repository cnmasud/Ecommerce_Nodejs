<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import ProductGrid from '@/components/ProductGrid.vue'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const notification = useNotificationStore()

const products    = ref([])
const categories  = ref([])
const loading     = ref(true)
const error       = ref('')
const search      = ref(route.query.q || '')
const activeCat   = ref(route.query.category || 'all')
const sortBy      = ref('newest')
const page        = ref(1)
const PER_PAGE    = 12

const base = import.meta.env.VITE_BACKENDURL

/* ── load all products + categories ─────────────────────── */
const loadAll = async () => {
  loading.value = true
  error.value = ''
  try {
    const [pRes, cRes] = await Promise.all([
      axios.get(`${base}/main/product/recent`),
      axios.get(`${base}/main/category/all`),
    ])
    products.value = Array.isArray(pRes.data) ? pRes.data : Object.values(pRes.data)
    categories.value = Array.isArray(cRes.data) ? cRes.data : Object.values(cRes.data)
  } catch (e) {
    error.value = e?.response?.data?.message || 'Failed to load products.'
    notification.error(error.value)
  } finally {
    loading.value = false
  }
}

/* ── filtering + sorting ─────────────────────────────────── */
const filtered = computed(() => {
  let list = [...products.value]

  // text search
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    )
  }

  // category filter
  if (activeCat.value !== 'all') {
    list = list.filter(p =>
      p.categories?.some(c =>
        (c._id || c) === activeCat.value ||
        (typeof c === 'object' && c.name === activeCat.value)
      )
    )
  }

  // sort
  if (sortBy.value === 'price-asc')  list.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') list.sort((a, b) => b.price - a.price)
  if (sortBy.value === 'name')       list.sort((a, b) => a.name.localeCompare(b.name))
  if (sortBy.value === 'newest')     list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / PER_PAGE))
const paginated  = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

const setCategory = (id) => {
  activeCat.value = id
  page.value = 1
  router.replace({ query: { ...route.query, category: id === 'all' ? undefined : id } })
}

const setSort = (v) => { sortBy.value = v; page.value = 1 }

watch(search, () => { page.value = 1 })

onMounted(loadAll)
</script>

<template>
  <div class="max-w-screen-xl mx-auto px-3 md:px-6 py-6">

    <!-- PAGE HEADER -->
    <div class="mb-5">
      <h1 class="text-2xl md:text-3xl font-bold">All Products</h1>
      <p class="text-sm text-base-content/60 mt-1">
        {{ loading ? 'Loading…' : `${filtered.length} products found` }}
      </p>
    </div>

    <!-- SEARCH + SORT BAR -->
    <div class="flex flex-col sm:flex-row gap-2 mb-5">
      <div class="relative flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search products…"
          class="input input-bordered w-full pl-9"
        />
      </div>
      <select v-model="sortBy" class="select select-bordered w-full sm:w-48" @change="setSort(sortBy)">
        <option value="newest">Newest First</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="name">Name A–Z</option>
      </select>
    </div>

    <!-- CATEGORY CHIPS -->
    <div class="flex flex-wrap gap-2 mb-5 overflow-x-auto pb-1">
      <button
        @click="setCategory('all')"
        :class="['badge badge-lg cursor-pointer transition-colors', activeCat === 'all' ? 'badge-primary' : 'badge-ghost border border-base-300']"
      >All</button>
      <button
        v-for="cat in categories"
        :key="cat._id"
        @click="setCategory(cat._id)"
        :class="['badge badge-lg cursor-pointer transition-colors', activeCat === cat._id ? 'badge-primary' : 'badge-ghost border border-base-300']"
      >{{ cat.name }}</button>
    </div>

    <!-- SKELETON -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-for="n in 12" :key="n" class="card bg-base-200 animate-pulse">
        <div class="h-40 bg-base-300 rounded-t-xl"></div>
        <div class="p-4 space-y-2">
          <div class="h-3 bg-base-300 rounded"></div>
          <div class="h-3 bg-base-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="alert alert-error">
      <span>{{ error }}</span>
      <button @click="loadAll" class="btn btn-sm btn-ghost">Retry</button>
    </div>

    <!-- EMPTY -->
    <div v-else-if="!paginated.length" class="text-center py-16">
      <div class="text-5xl mb-3">🔍</div>
      <h3 class="text-lg font-semibold">No products found</h3>
      <p class="text-base-content/60 text-sm mt-1">Try a different search or category</p>
      <button @click="search=''; setCategory('all')" class="btn btn-primary btn-sm mt-4">Clear filters</button>
    </div>

    <!-- PRODUCTS GRID -->
    <template v-else>
      <ProductGrid :products="paginated" />

      <!-- PAGINATION -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8 gap-1 flex-wrap">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="page = p; window?.scrollTo(0,0)"
          :class="['btn btn-sm', page === p ? 'btn-primary' : 'btn-ghost']"
        >{{ p }}</button>
      </div>
    </template>
  </div>
</template>
