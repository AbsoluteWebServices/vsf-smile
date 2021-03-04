import SmileState from '../types/SmileState'
import { ActionTree } from 'vuex'
import * as types from './mutation-types'
import config from 'config'
import fetch from 'isomorphic-fetch'
import { processURLAddress } from '@vue-storefront/core/helpers'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import * as mappers from '../helpers/mappers'
import PointsProduct from '../types/PointsProduct'

export const actions: ActionTree<SmileState, any> = {
  /**
   * Customers
   */
  getCustomerByEmail ({ commit }, email): Promise<Response> {
    const url = processURLAddress(config.smile.endpoint) + '/customers/email/' + email

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => resp.json()).then(json => {
        if (json.result && json.result.length) {
          commit(types.SET_CUSTOMER, json.result[0])
        }
        resolve(json.result)
      }).catch(err => {
        reject(err)
      })
    })
  },

  getCustomerById ({ commit }, customer_id): Promise<Response> {
    const url = processURLAddress(config.smile.endpoint) + '/customers/' + customer_id

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => resp.json()).then(json => {
        commit(types.SET_CUSTOMER, json.result.customer)
        resolve(json.result)
      }).catch(err => {
        reject(err)
      })
    })
  },

  getCustomers (_, params): Promise<Response> {
    let url: any = processURLAddress(config.smile.endpoint) + '/customers'
    url = new URL(url)
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => resp.json()).then(json => {
        resolve(json.result)
      }).catch(err => {
        reject(err)
      })
    })
  },

  getDigest ({ state }): Promise<Response> {
    if (!state.customerExternalId) {
      return new Promise((resolve, reject) => {
        console.warn('No customer identified')
        reject({ message: 'No customer identified' })
      })
    }

    let url = processURLAddress(config.smile.endpoint) + '/digest/' + state.customerExternalId
    url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => resp.json()).then(json => {
        resolve(json.result)
      }).catch(err => {
        reject(err)
      })
    })
  },

  getCustomerWithToken ({ state, commit }, digest): Promise<Response> {
    const url = `https://cdn.sweettooth.io/v1/storefront_js/init?external_customer_id=${state.customerExternalId}&channel_api_key=${config.smile.public_key}&customer_auth_digest=${digest}`

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => {
        resp.json().then(json => {
          if (resp.ok) {
            commit(types.SET_CUSTOMER, json.customer)
            commit(types.SET_CUSTOMER_AUTH_TOKEN, json.customer_authentication_token)
            resolve(json)
          } else {
            reject(json)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },

  /**
   * Points Products
   */
  getPointsProducts ({ commit }, params): Promise<Response> {
    let url: any = processURLAddress(config.smile.endpoint) + '/points_products'
    url = new URL(url)
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      }).then(resp => resp.json()).then(json => {
        if (json.result && json.result.points_products) {
          commit(types.SET_POINTS_PRODUCTS, json.result.points_products)
        }
        resolve(json.result)
      }).catch(err => {
        reject(err)
      })
    })
  },

  purchasePointsProducts ({ state }, pointsProduct: PointsProduct): Promise<Response> {
    let url = processURLAddress(config.smile.endpoint) + '/points_products/' + pointsProduct.id + '/purchase'
    let data = {
      customer_id: state.customer.id
    }

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(resp => {
        resp.json().then(json => {
          if (resp.ok) {
            resolve(json.result.points_purchase)
          } else {
            reject(json.result)
          }
        })
      }).catch(err => {
        reject(err)
      })
    })
  },

  /**
   * Events
   */
  customerUpdated ({ state, commit }, user): Promise<Response> {
    let data = mappers.mapCustomer(user)

    const url = processURLAddress(config.smile.endpoint) + '/event/customer/updated'

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ data })
      }).then(res => {
        if (res.ok) {
          commit(types.SET_CUSTOMER, data)
        } else {
          reject(res)
        }
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  orderUpdated ({ state, commit }, order): Promise<Response> {
    if (!state.customer) {
      return new Promise((resolve, reject) => {
        console.warn('No customer identified')
        reject({ message: 'No customer identified' })
      })
    }

    let data = mappers.mapOrder(order)
    data.customer = state.customer

    const url = processURLAddress(config.smile.endpoint) + '/event/order/updated'

    return new Promise<Response>((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ data })
      }).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  },

  updateCustomerBalance ({ commit }, points) {
    commit(types.UPDATE_CUSTOMER, { points_balance: points })
  }
}
