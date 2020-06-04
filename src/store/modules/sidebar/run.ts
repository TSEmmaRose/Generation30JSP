import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { RunState, RootState, Account } from '../../types'
import { shortenAddress, BLOCKCHAINS, PROVIDERS, getUnits, parseDeployedContract } from '../../../utils'
import { Aion, Ethereum } from '@titan-suite/core'
import { event } from 'vue-analytics'
let nodeAddress = ''
let devProviderInstance
let isProviderSet = false

if (process.env.NODE_ENV !== 'production') {
  nodeAddress = require('../../titanrc').nodeAddress
  devProviderInstance = new Aion(nodeAddress)
  isProviderSet = true
}

const runState: RunState = {
  blockchains: BLOCKCHAINS,
  providers: PROVIDERS,
  selectedBlockchain: BLOCKCHAINS.AION,
  selectedProvider: PROVIDERS.Web3Provider,
  providerAddress: nodeAddress,
  accountsLoading: false,
  selectedAccount: '',
  accounts: [],
  gasLimit: 2000 * 1000,
  gasPrice: 10000000000000,
  value: {
    amount: 0,
    unit: '',
  },
  contractArgs: '',
  deployedContracts: [],
  receipts: [],
  providerInstance: devProviderInstance,
  isProviderSet,
  privateKey: undefined,
  isPrivateKeySet: false,
}

const runGetters: GetterTree<RunState, RootState> = {
  accounts(state): any {
    const units = getUnits(state.selectedBlockchain)
    return state.accounts.length > 0
      ? state.accounts.map(({ address, etherBalance }) => {
          const label = `${shortenAddress(address)}${
            etherBalance ? ' (' + etherBalance.toString() + ` ${units[units.length - 1].value})` : ''
          }`
          return {
            label,
            value: address,
          }
        })
      : [{ label: 'No Accounts Available', value: '' }]
  },
  getLatestContractAddress(state) {
    return state.receipts.length > 0 && state.receipts[state.receipts.length - 1].address
  },
  getUnits(state) {
    return getUnits(state.selectedBlockchain)
  },
  showUnlockButtons(state) {
    if (