import * as types from '../mutation-types'
import { SearchManager } from '../../api'

// initial state
const state = {
  keyword: '',
  queryType: 'terms',
  queryAggs: null,
  fetching: false,
  total: 0,
  pageSize: 10,
  hasNext: true,
  hits: [],
  aggs: null,
  query: {},
  error: null,
}

// getters
const getters = {
  keyword: state => state.keyword,
  queryType: state => state.queryType,
  queryAggs: state => state.queryAggs,
  fetching: state => state.fetching,
  total: state => state.total,
  page: state => Math.floor(state.hits.length / state.pageSize) + 1,
  pageSize: state => state.pageSize,
  hasNext: state => state.hasNext,
  hits: state => state.hits,
  aggs: state => state.aggs,
  query: state => state.query,
  error: state => state.error,
}

// mutations
const mutations = {
  [types.RESET_HITS] (state) {
    state.fetching = false
    state.query = {}
    state.total = 0
    state.hasNext = true
    state.hits = []
    state.aggs = null
  },

  [types.UPDATE_KEYWORD] (state, keyword) {
    state.keyword = keyword
  },

  [types.UPDATE_PAGE_SIZE] (state, pageSize) {
    state.pageSize = pageSize
  },

  [types.UPDATE_QUERY_TYPE] (state, queryType) {
    state.queryType = queryType
  },

  [types.UPDATE_QUERY_AGGS] (state, queryAggs) {
    state.queryAggs = queryAggs
  },

  [types.SEARCH_REQUEST] (state) {
    state.fetching = true
  },

  [types.SEARCH_SUCCESS] (state, { query, response }) {
    state.fetching = false
    state.query = query
    state.total = response.hits.total

    if (response.hits.hits.length > 0) {
      state.hits = state.hits.concat(response.hits.hits)
      state.hasNext = response.hits.hits.length === state.pageSize
    }

    state.aggs = response.aggregations
  },

  [types.SEARCH_FAILURE] (state, error) {
    state.fetching = false
    state.error = error
  },
}

// actions
const actions = {
  fetchHits ({ commit, state }, { reset, options }) {
    if (reset) {
      commit(types.RESET_HITS)
    }

    if (!state.hasNext) {
      return
    }

    commit(types.SEARCH_REQUEST)

    SearchManager.search(state.keyword, {
      ...options,
      from: state.hits.length,
      size: state.pageSize,
      queryType: state.queryType,
      queryAggs: state.queryAggs,
    })
      .then(({ query, response }) => {
        commit(types.SEARCH_SUCCESS, { query, response })
      })
      .catch(error => {
        commit(types.SEARCH_FAILURE, error)
      })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
