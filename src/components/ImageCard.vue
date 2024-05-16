<script setup lang="ts">
import { ref } from 'vue'
import { NIcon, NAvatar, NTag, NButton, NModal, NCard, NSpace, NImage, type UploadFileInfo } from 'naive-ui'
import { Times } from '@vicons/fa'
import { type UploadResult } from './HelloWorld.vue'
import { imageInference } from '../apis/ai'
import { PORT } from '../config'

const props = defineProps<{ imgInfo: UploadFileInfo, uploadResultInfo: UploadResult, deleteImage: Function }>()

const isInference = ref(false)
const isInferSuccess = ref<any>(null)

const oriUrl = ref('')
const infUrl = ref('')
const showModal = ref(false)

const modelname = ref('')
const inferTime = ref(0)
const baseUrl = `http://${window.location.hostname}:${PORT}`
const inference = () => {
  imageInference(props.uploadResultInfo.filename, props.uploadResultInfo.modelname).then((res: any) => {
    isInference.value = true
    oriUrl.value = baseUrl + res.raw_url
    infUrl.value = baseUrl + res.inf_url
    modelname.value = res.metadata.name
    inferTime.value = res.inference_time
    isInferSuccess.value = true
  })
}

defineExpose({
	inference
})
</script>

<template>
  <div class="image-box">
    <div class="image-title">
      <n-avatar
        size="large"
        style="margin-right: 5px;"
        :src="baseUrl + uploadResultInfo.oriUrl"
      />
      <span>{{imgInfo.name}}</span>
    </div>
    <div class="image-info">
      <n-tag v-if="isInferSuccess == null" size="small" round :bordered="false" :type="!isInference? 'default' : 'info'">
        {{!isInference? 'uploaded' : 'inferencing'}}
      </n-tag>
      <n-tag v-else size="small" round :bordered="false" :type="isInferSuccess? 'success' : 'error'">
        {{isInferSuccess? 'successed' : 'failed'}}
      </n-tag>
      
      <span style="color: #888;">{{ uploadResultInfo.resolution }}</span>
      <span style="color: #888;">{{(imgInfo.file!.size / 1024 / 1024).toFixed(1)}}MB</span>
      
      <n-button v-if="!isInference" strong secondary type="info" @click="inference">Infer</n-button>
      <n-button v-else :disabled="isInferSuccess != true" strong secondary type="success" @click="showModal = true">View</n-button>
      <n-button quaternary circle type="error" @click="deleteImage(imgInfo.id)"><n-icon><Times /></n-icon></n-button>
      <n-modal v-model:show="showModal">
        <n-card
          style="width: 1000px"
          :title="imgInfo.name"
          :bordered="false"
          size="huge"
          role="dialog"
          aria-modal="true"
        >
          <template #header-extra>
            {{ modelname }}
          </template>
          <div class="preview-card">
            <n-space :vertical="true">
              <span>Original Image</span>
              <n-image
                width="400"
                :src="oriUrl"
              />
            </n-space>
            
            <n-space :vertical="true">
              <span>Segmentation Result</span>
              <n-image
                width="400"
                :src="infUrl"
              />
            </n-space>
          </div>
          <template #footer>
            Inference time: {{inferTime.toFixed(3)}}s
          </template>
        </n-card>
      </n-modal>
    </div>
  </div>
</template>

<style scoped>
.image-box {
  width: 800px;
  padding: 12px;
  background-color: #fff;
  color: #000;
  border: 1px solid darkgray;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.image-title {
  width: 300px;
  display: flex;
  align-items: center;
}
.image-info {
  width: 476px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.preview-card {
  display: flex;
  justify-content: space-between;
}
</style>
