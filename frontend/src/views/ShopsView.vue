<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const shops   = ref([])
const loading = ref(true)
const search  = ref('')
const base    = import.meta.env.VITE_BACKENDURL

onMounted(async () => {
  try {
    const res = await axios.get(`${base}/main/shop/recent`)
    shops.value = Array.isArray(res.data) ? res.data : Object.values(res.data)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})

const filtered = computed(() => {
  if (!search.value.trim()) return shops.value
  const q = search.value.toLowerCase()
  return shops.value.filter(s =>
    s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="max-w-screen-xl mx-auto px-3 md:px-6 py-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold">All Shops</h1>
        <p class="text-sm text-base-content/60 mt-1">{{ shops.length }} verified sellers</p>
      </div>
      <div class="relative w-full sm:w-64">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="text" placeholder="Search shops…" class="input input-bordered w-full pl-9 input-sm" />
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="card bg-base-200 animate-pulse h-64"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="text-center py-16">
      <div class="text-5xl mb-3">🏪</div>
      <h3 class="text-lg font-semibold">No shops found</h3>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="shop in filtered"
        :key="shop._id"
        class="card bg-base-100 shadow hover:shadow-lg transition-all hover:-translate-y-0.5"
      >
        <figure class="h-44 overflow-hidden">
          <img
            :src="shop.logo || `https://picsum.photos/seed/${shop.name}/600/300`"
            :alt="shop.name"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </figure>
        <div class="card-body p-4">
          <h3 class="card-title text-base">
            {{ shop.name }}
            <span class="badge badge-success badge-sm">Verified</span>
          </h3>
          <p class="text-sm text-base-content/60 line-clamp-2">{{ shop.description }}</p>
          <div class="flex items-center gap-1 mt-1 text-xs text-base-content/50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {{ shop.products?.length || 0 }} products
          </div>
          <div class="card-actions mt-3">
            <router-link :to="`/shop/${shop._id}`" class="btn btn-primary btn-sm btn-block">
              Visit Shop →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
