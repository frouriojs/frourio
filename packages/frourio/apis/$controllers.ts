/* eslint-disable */
import * as validator0 from './index'
import controller0, { middleware as ctrlMiddleware0 } from './@controller'
import controller1 from './texts/@controller'
import controller2 from './texts/sample/@controller'
import controller3, { middleware as ctrlMiddleware1 } from './users/@controller'
import controller4 from './users/_userId@number/@controller'
import middleware0 from './@middleware'
import middleware1 from './users/@middleware'

export default {
  name: '/',
  validator: {
    get: {
      query: { required: false, Class: validator0.ValidQuery }
    },
    post: {
      query: { required: true, Class: validator0.ValidQuery },
      body: { required: true, Class: validator0.ValidBody }
    }
  },
  uploader: ['post'],
  controller: controller0,
  ctrlMiddleware: ctrlMiddleware0,
  middleware: middleware0,
  children: {
    names: [
      {
        name: '/texts',
        controller: controller1,
        children: {
          names: [
            {
              name: '/sample',
              controller: controller2
            }
          ]
        }
      },
      {
        name: '/users',
        controller: controller3,
        ctrlMiddleware: ctrlMiddleware1,
        middleware: middleware1,
        children: {
          value: {
            name: '/_userId@number',
            controller: controller4
          }
        }
      }
    ]
  }
}
