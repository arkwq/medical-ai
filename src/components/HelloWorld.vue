<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { NCard, NUpload, NButton, NDivider, NSelect, type UploadFileInfo, type SelectOption } from 'naive-ui'
import ImageCard from '../components/ImageCard.vue'
import { getModelList } from '../apis/ai'
import { PORT } from '../config'

export interface UploadResult {
  oriUrl: string
  filename: string
  resolution: string
  modelname: string
}

defineProps<{ msg: string }>()

const isUpload = ref(false)
const medicalModelName = ref(null)
const options = ref([
  // {
  //   label: 'EndoFormer(结直肠息肉检测)',
  //   value: 'endo_former'
  // }, {
  //   label: 'EDD_CVCUetr(结肠、食道、胃、膀胱病症分割)',
  //   value: 'edd_cvc_unetr'
  // }
])

const imageList = ref<UploadFileInfo[]>([])
const deleteImage = (imageId: string) => {
  imageList.value = imageList.value.filter(item => item.id !== imageId)
  if (imageList.value.length == 0) {
    isUpload.value = false
  }
}

const uploadResultList = ref<UploadResult[]>([])
const handleUploadFinish = ({
  file,
  event
}: {
  file: UploadFileInfo
  event?: ProgressEvent
}) => {
  isUpload.value = true
  imageList.value.push(file)
  const target = event?.currentTarget as XMLHttpRequest
  const result = JSON.parse(target.responseText)
  uploadResultList.value.push({
    oriUrl: result.data.raw_url,
    filename: result.data.filename,
    resolution: result.data.resolution,
    modelname: medicalModelName.value!
  })
}

const annoListRef = ref<any[]>([])
const childRef = (el: any, index: number) => {
  if (el) {
    annoListRef.value[index] = el
  }
}
const allInference = () => {
  annoListRef.value.splice(imageList.value.length)
  annoListRef.value.map((item: any) => {
    console.log(item)
    item.inference()
  })
}

// 动态获取设备 IP 并设置上传 URL
const uploadUrl = ref('')
onMounted(() => {
  const protocol = window.location.protocol
  const host = window.location.hostname
  uploadUrl.value = `${protocol}//${host}:${PORT}/api/v1/img/upload`

  getModelList().then((res: any) => {
    options.value = res.all_services
  })
})
</script>

<template>
  <h1 class="title" @click="isUpload = false">{{ msg }}</h1>

  <div class="upload-box" v-show="!isUpload">
    <div>
      <n-upload
        :action="uploadUrl"
        accept=".jpg,.tif"
        :multiple="true"
        :show-file-list="false"
        @finish="handleUploadFinish"
      >
        <n-button :disabled="medicalModelName == null" color="#8a2be2" size="large">Upload</n-button>
      </n-upload>
    </div>
    <n-divider style="height: 32px !important; margin-top: 4px;" vertical />
    <n-select v-model:value="medicalModelName" size="large" :options="options" placeholder="Select Model" />
  </div>
  <div v-show="isUpload">
    <n-button :disabled="medicalModelName == null" color="#8a2be2" @click="allInference">Infer All</n-button>
    <n-divider style="height: 28px !important;" vertical />
    <n-button :disabled="medicalModelName == null" type="error" @click="imageList = [], isUpload = false">Reload</n-button>
    <n-divider />
    <template v-for="(item, index) in imageList" :key="item.id">
      <image-card :img-info="item" :upload-result-info="uploadResultList[index]" :delete-image="deleteImage" :ref="(el:any) => childRef(el, index)"></image-card>
    </template>
  </div>
</template>

<style scoped>
.title {
  cursor: pointer;
}
.read-the-docs {
  color: #888;
}
.upload-box {
  width: 400px;
  display: flex;
  flex-direction: row;
}
</style>
