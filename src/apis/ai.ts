import request from '../axios'

export function imageInference(filename: string, modelname: string) {
  return request({
    url: `/api/v1/img/infer?filename=${filename}&model_name=${modelname}`,
    method: 'post',
  })
}

export function getModelList() {
  return request({
    url: `/api/v1/service/list`,
    method: 'get',
  })
}