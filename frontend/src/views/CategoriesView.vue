<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getCategoryIcon } from '@/utils/categoryIcons'

const categories = ref([])
const products   = ref([])
const loading    = ref(true)

const base = import.meta.env.VITE_BACKENDURL

onMounted(async () => {
  try {
    const [cRes, pRes] = await Promise.all([
      axios.get(`${base}/main/category/all`),
      axios.get(`${base}/main/product/recent`),
    ])
    categories.value = Array.isArray(cRes.data) ? cRes.data : Object.values(cRes.data)
    products.value   = Array.isArray(pRes.data) ? pRes.data : Object.values(pRes.data)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const countFor = (catId) =>
  products.value.filter(p =>
    p.categories?.some(c => (c._id || c) === catId || (typeof c === 'object' && c._id === catId))
  ).length

const sampleImages = (catId) =>
  products.value
    .filter(p => p.categories?.some(c => (c._id || c) === catId || (typeof c === 'object' && c._id === catId)))
    .slice(0, 4)
    .map(p => p.images?.[0] || 'https://placehold.co/100x100?text=📦')
</script>

<template>
  <div class="max-w-screen-xl mx-auto px-3 md:px-6 py-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl md:text-3xl font-bold">Shop by Category</h1>
      <p class="text-sm text-base-content/60 mt-1">Browse all {{ categories.length }} categories</p>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="n in 10" :key="n" class="card bg-base-200 animate-pulse h-40"></div>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <router-link
        v-for="(cat, i) in categories"
        :key="cat._id"
        :to="`/category/${cat._id}`"
        class="card bg-base-100 shadow hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
      >
        <!-- Sample product images grid -->
        <div class="p-3">
          <div class="grid grid-cols-2 gap-1 h-24 overflow-hidden rounded-lg bg-base-200">
            <template v-if="sampleImages(cat._id).length">
              <img
                v-for="(img, j) in sampleImages(cat._id)"
                :key="j"
                :src="img"
                :alt="cat.name"
                class="w-full h-full object-cover"
              />
              <!-- Fill empty slots -->
              <div
                v-for="k in Math.max(0, 4 - sampleImages(cat._id).length)"
                :key="'e'+k"
                class="bg-base-300 flex items-center justify-center text-2xl"
              >{{ getCategoryIcon(cat.name) }}</div>
            </template>
            <div v-else class="col-span-2 flex items-center justify-center text-5xl bg-base-200">
              {{ getCategoryIcon(cat.name) }}
            </div>
          </div>
        </div>
        <div class="card-body p-3 pt-0">
          <h3 class="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{{ cat.name }}</h3>
          <p class="text-xs text-base-content/50">{{ countFor(cat._id) }} products</p>
        </div>
      </router-link>
    </div>
  </div>
</template>
