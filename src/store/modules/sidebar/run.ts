import { ActionTree, MutationTree, GetterTree } from 'vuex'
import { RunState, RootState, Account } from '../../types'
import { shortenAddress, BLOCKCHAINS, PROVIDERS, getUnits, parseDeployedContract } from '../../../utils'
import { Aion, Ethereum } from '@titan-suite/core'
import { event } from 'vue